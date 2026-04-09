"""
Functions for loading neurophysiology data from publicly-shared data files with Neo.

Copyright CNRS 2023
Authors: Andrew P. Davison, Onur Ates, Shailesh Appukuttan, Hélissande Fragnaud and Corentin Fragnaud
Licence: MIT (see LICENSE)
"""

import os
import os.path
import hashlib
import json
import time
from urllib.request import urlopen, urlretrieve, HTTPError
from urllib.parse import urlparse, urlunparse
import zipfile
from fastapi import HTTPException, status
import neo.io
import quantities as pq

from . import settings


class CacheManager:
    """
    Manages the downloaded file cache with size limits and expiration.
    Tracks file access metadata in a JSON index file.
    """

    def __init__(self):
        self.cache_dir = getattr(settings, "DOWNLOADED_FILE_CACHE_DIR", "")
        self.max_size_bytes = getattr(settings, "CACHE_MAX_SIZE_GB", 10) * 1024**3
        self.expiry_seconds = getattr(settings, "CACHE_FILE_EXPIRY_DAYS", 30) * 86400
        self.index_path = os.path.join(self.cache_dir, "cache_index.json")
        os.makedirs(self.cache_dir, exist_ok=True)
        self._index = self._load_index()

    def _load_index(self):
        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, "r") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {}
        return {}

    def _save_index(self):
        try:
            with open(self.index_path, "w") as f:
                json.dump(self._index, f, indent=2)
        except IOError:
            pass

    def record_access(self, file_path, url):
        """Record that a cached file was accessed."""
        key = os.path.relpath(file_path, self.cache_dir)
        now = time.time()
        if key not in self._index:
            self._index[key] = {
                "url": url,
                "downloaded_at": now,
                "last_accessed": now,
                "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            }
        else:
            self._index[key]["last_accessed"] = now
        self._save_index()

    def is_expired(self, file_path):
        """Check if a cached file has expired."""
        key = os.path.relpath(file_path, self.cache_dir)
        if key in self._index:
            downloaded_at = self._index[key].get("downloaded_at", 0)
            return (time.time() - downloaded_at) > self.expiry_seconds
        return False

    def get_cache_size(self):
        """Calculate total size of all cached files in bytes."""
        total = 0
        for dirpath, dirnames, filenames in os.walk(self.cache_dir):
            for f in filenames:
                if f == "cache_index.json":
                    continue
                fp = os.path.join(dirpath, f)
                total += os.path.getsize(fp)
        return total

    def cleanup_expired(self):
        """Remove files that have exceeded the expiry period."""
        now = time.time()
        expired_keys = []
        for key, meta in self._index.items():
            if (now - meta.get("downloaded_at", 0)) > self.expiry_seconds:
                expired_keys.append(key)
        for key in expired_keys:
            file_path = os.path.join(self.cache_dir, key)
            if os.path.exists(file_path):
                os.remove(file_path)
            del self._index[key]
        if expired_keys:
            self._save_index()
            self._cleanup_empty_dirs()

    def cleanup_by_size(self):
        """Remove least recently accessed files until cache is under size limit."""
        while self.get_cache_size() > self.max_size_bytes:
            if not self._index:
                break
            oldest_key = min(
                self._index,
                key=lambda k: self._index[k].get("last_accessed", 0),
            )
            file_path = os.path.join(self.cache_dir, oldest_key)
            if os.path.exists(file_path):
                os.remove(file_path)
            del self._index[oldest_key]
        self._save_index()
        self._cleanup_empty_dirs()

    def cleanup(self):
        """Run all cleanup operations."""
        self.cleanup_expired()
        self.cleanup_by_size()

    def _cleanup_empty_dirs(self):
        """Remove empty subdirectories from cache."""
        for dirpath, dirnames, filenames in os.walk(self.cache_dir, topdown=False):
            if dirpath == self.cache_dir:
                continue
            if not dirnames and not filenames:
                os.rmdir(dirpath)

    def should_redownload(self, file_path):
        """Check if a file needs to be re-downloaded (missing or expired)."""
        if not os.path.exists(file_path):
            return True
        return self.is_expired(file_path)


cache_manager = CacheManager()


def get_base_url_and_path(url):
    """
    Strip off any file name from a URL, and return the
    stripped URL and the stripped path part.
    """
    url_parts = urlparse(url)
    base_url = urlunparse(
        (
            url_parts.scheme,
            url_parts.netloc,
            os.path.dirname(url_parts.path),
            "",
            "",
            "",
        )
    )
    return base_url, os.path.basename(url_parts.path)


def get_cache_path(url):
    """
    For caching, we store files in a flat directory structure, where the directory name is
    based on the URL, but files in the same directory on the original server end up in the
    same directory in our cache.
    """
    base_url, filename = get_base_url_and_path(url)
    dir_name = hashlib.sha1(base_url.encode("utf-8")).hexdigest()
    dir_path = os.path.join(
        getattr(settings, "DOWNLOADED_FILE_CACHE_DIR", ""), dir_name
    )
    os.makedirs(dir_path, exist_ok=True)
    return dir_path, filename


def list_files_to_download(resolved_url, cache_dir, io_cls=None):
    base_url, main_file = get_base_url_and_path(resolved_url)
    file_list = [(resolved_url, os.path.join(cache_dir, main_file), True)]
    if io_cls:
        root_path, ext = os.path.splitext(main_file)
        io_mode = getattr(io_cls, "rawmode", None)
        if io_mode == "one-dir":
            if not resolved_url.endswith(".zip"):
                if io_cls.__name__ in ("PhyIO"):
                    raise NotImplementedError
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "Cannot download files from a URL representing a directory. "
                            "Please provide the URL of a zip or tar archive of the directory."
                        )
                    )
        elif io_mode == "multi-file":
            for extension in io_cls.extensions:
                file_list.append(
                    (f"{base_url}/{root_path}.{extension}", f"{cache_dir}/{root_path}.{extension}", False)
                )
        elif io_cls.__name__ == "BrainVisionIO":
            for extension in ("eeg", "vmrk"):
                file_list.append(
                    (f"{base_url}/{root_path}.{extension}", f"{cache_dir}/{root_path}.{extension}", True)
                )
        elif io_cls.__name__ == "ElanIO":
            for extension in ("eeg.ent", "eeg.pos"):
                file_list.append(
                    (f"{base_url}/{root_path}.{extension}", f"{cache_dir}/{root_path}.{extension}", True)
                )
        elif io_mode == "one-file":
            pass
        elif io_cls.mode == "dir":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Cannot download files from a URL representing a directory. "
                    "Please provide the URL of a zip or tar archive of the directory."
                )
            )
        else:
            if io_cls.__name__ == "AsciiSignalIO":
                name, ext = os.path.splitext(main_file)
                if ext[1:] in neo.io.AsciiSignalIO.extensions:
                    metadata_filename = main_file.replace(ext, "_about.json")
                    metadata_url = resolved_url.replace(ext, "_about.json")
                    file_list.append((metadata_url, f"{cache_dir}/{metadata_filename}", False))
    return file_list


def download_neo_data(url, io_cls=None):
    """
    Download a neo data file from the given URL.

    We do not at present handle formats that require multiple files,
    for which the URL should probably point to a zip or tar archive.
    """
    # we first open the url to resolve any redirects and have a consistent
    # address for caching.
    try:
        response = urlopen(url)
    except HTTPError as err:
        raise HTTPException(
            status_code=err.code,
            detail=f"Error retrieving {url}: {err.msg}"
        )
    resolved_url = response.geturl()

    cache_dir, main_file = get_cache_path(resolved_url)
    main_file_path = os.path.join(cache_dir, main_file)
    cache_manager.cleanup()
    if cache_manager.should_redownload(main_file_path):
        files_to_download = list_files_to_download(resolved_url, cache_dir, io_cls)
        for file_url, file_path, required in files_to_download:
            try:
                urlretrieve(file_url, file_path)
            except HTTPError:
                if required:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Problem downloading '{file_url}'"
                    )
        main_path = files_to_download[0][1]
    else:
        main_path = os.path.join(cache_dir, main_file)
    if main_path.endswith(".zip"):
        main_path = get_archive_dir(main_path, cache_dir)
    cache_manager.record_access(main_path, url)
    return main_path


def get_archive_dir(archive_path, cache_dir):
    with zipfile.ZipFile(archive_path) as zf:
        contents = zf.infolist()
        dir_name = contents[0].filename.strip("/")
        main_path = os.path.join(cache_dir, dir_name)
        if not os.path.exists(main_path):
            zf.extractall(path=cache_dir)
    return main_path


extra_kwargs = {
    "NestIO": {
        "gid_list": [], "t_start": 0 * pq.ms, "t_stop": 1e6 * pq.ms
    }
}


def load_blocks(url, io_class_name=None):
    """
    Load the first block from the data file at the given URL.

    If io_class_name is provided, we use the Neo IO class with that name
    to open the file, otherwise we use Neo's `get_io()` function to
    find an appropriate class.
    """
    assert isinstance(url, str)
    if io_class_name:
        io_cls = getattr(neo.io, io_class_name.value)
        main_path = download_neo_data(url, io_cls=io_cls)
        try:
            if io_cls.mode == "dir":
                io = io_cls(dirname=main_path)
            elif io_cls.__name__ == "NestIO":
                io = io_cls(filenames=main_path)
            else:
                io = io_cls(filename=main_path)
        except ImportError:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"This server does not have the {io_class_name} module installed.",
            )
        except (RuntimeError, TypeError, OSError) as err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'Error when trying to open file with {io_class_name}: "{err}"',
            )
        except FileNotFoundError as err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'Associated file not found. More details: "{err}"'
            )
    else:
        main_path = download_neo_data(url)
        io = neo.io.get_io(main_path)

    try:
        if io.support_lazy:
            blocks = io.read(lazy=True)
        else:
            kwargs = extra_kwargs.get(io.__class__.__name__, {})
            blocks = io.read(**kwargs)
    except (AssertionError, ValueError, IndexError, KeyError, AttributeError) as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Error when trying to open file with {io.__class__.__name__}: "{err}"',
        )
    if hasattr(io, "close"):
        io.close()
    return blocks