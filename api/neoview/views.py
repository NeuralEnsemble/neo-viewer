# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os.path
import hashlib
import logging
# from time import sleep
from urllib.request import urlopen, urlretrieve, HTTPError
from urllib.parse import urlparse, urlunparse

from django.http import JsonResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import status

from neo.io import get_io
import neo


logger = logging.getLogger(__name__)


def custom_get_io(filename):
    try:
        io = get_io(filename)
    except (AssertionError, OSError) as err:
        if "try_signal_grouping" in str(err):
            io = neo.io.Spike2IO(filename, try_signal_grouping=False)
        elif "File extension DAT not registered" in str(err):
            io = neo.io.ElphyIO(filename)
        else:
            raise
    return io


def _get_cache_path(url):
    """
    For caching, we store files in a flat directory structure, where the directory name is
    based on the URL, but files in the same directory on the original server end up in the
    same directory in our cache.
    """
    url_parts = urlparse(url)
    base_url = urlunparse((url_parts.scheme, url_parts.netloc, os.path.dirname(url_parts.path), "", "", ""))
    dir_name = hashlib.sha1(base_url.encode('utf-8')).hexdigest()
    dir_path = os.path.join(getattr(settings, "DOWNLOADED_FILE_CACHE_DIR", ""),
                            dir_name)
    os.makedirs(dir_path, exist_ok=True)
    return os.path.join(dir_path, os.path.basename(url_parts.path))


def _get_file_from_url(request):
    url = request.GET.get('url')

    # we first open the url to resolve any redirects
    response = urlopen(url)
    resolved_url = response.geturl()

    filename = _get_cache_path(resolved_url)
    if not os.path.isfile(filename):
        urlretrieve(resolved_url, filename)
    # todo: wrap previous line in try..except so we can return a 404 if the file is not found
    #       or a 500 if the local disk is full

    # if we have a text file, try to download the accompanying json file
    name, ext = os.path.splitext(filename)
    if ext[1:] in neo.io.AsciiSignalIO.extensions:  # ext has a leading '.'
        metadata_filename = filename.replace(ext, "_about.json")
        metadata_url = resolved_url.replace(ext, "_about.json")
        try:
            urlretrieve(metadata_url, metadata_filename)
        except HTTPError:
            pass

    return filename


def _handle_dict(ob):
    return {k: str(v) for k, v in ob.items()}


class NeoViewError(Exception):

    def __init__(self, message, status, detail=""):
        self.message = message
        self.status = status
        self.detail = detail

    def __str__(self):
        return f"{self.__class__.name}: {self.message} {self.detail} status={self.status}"


def get_block(request):
    if not request.GET.get('url'):
        raise NeoViewError('URL parameter is missing', status.HTTP_400_BAD_REQUEST)

    lazy = False
    na_file = _get_file_from_url(request)
    neo_io = None
    r = None

    if 'type' in request.GET and request.GET.get('type'):
        iotype = request.GET.get('type')
        method = getattr(neo.io, iotype)
        r = method(filename=na_file)
        if r.support_lazy:
            block = r.read_block(lazy=True)
            lazy = True
        else:
            block = r.read_block()
    else:
        neo_io = custom_get_io(na_file)
        try:
            if neo_io.support_lazy:
                block = neo_io.read_block(lazy=True)
                lazy = True
            else:
                block = neo_io.read_block()

        except IOError as err:
            # todo: need to be more fine grained. There could be other reasons
            #       for an IOError
            raise NeoViewError('incorrect file type',
                               status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                               str(err))
    if neo_io and hasattr(neo_io, 'close'):
        neo_io.close()
    if r and hasattr(r, 'close'):
        r.close()
    return block, na_file, lazy


class Block(APIView):

    def get(self, request, format=None, **kwargs):
        try:
            block, na_file, lazy =  get_block(request)
        except NeoViewError as err:
            return JsonResponse({'error': err.message, 'message': err.detail},
                                status=err.status)

        block_data = {'block': [{
            'annotations': _handle_dict(block.annotations),
            # 'channel_indexes': block.channel_indexes,
            'description': block.description or "",
            # 'file_datetime': block.file_datetime,
            # 'file_origin': block.file_origin or "",
            'file_origin': request.GET.get('url'),
            # 'index': block.index,
            'name': block.name or "",
            'rec_datetime': block.rec_datetime,
            # 'source': request.GET.get('url'),
            # 'file_name': na_file,
            'file_name': os.path.basename(urlparse(request.GET.get('url')).path),
            'segments': [
                {
                    'name': s.name or "",
                    'annotations': _handle_dict(s.annotations),
                    'description': s.description or "",
                    # 'epochs': s.epochs,
                    # 'events': s.events,
                    'spiketrains': [],
                    'rec_datetime': s.rec_datetime,
                    'irregularlysampledsignals': [],
                    # 'index': s.index,
                    # 'file_origin': s.file_origin or "",
                    'file_origin': request.GET.get('url'),
                    # 'block': s.block,
                    'analogsignals': [],
                }
                for s in block.segments],
            }]}

        # check for channels
        if (block.segments[0].analogsignals and block.segments[0].analogsignals[0].shape[1] > 1) \
                or (block.segments[0].irregularlysampledsignals and block.segments[0].irregularlysampledsignals[0].shape[1] > 1):
            block_data['block'][0]['channels'] = 'multi'

        # check for spike trains
        for s in block.segments:
            if len(s.spiketrains) > 0:
                block_data['block'][0]['spike_trains'] = 'exist'
                break

        # check for multiple Segments with 'matching' (same count) analog signals in each
        if len(block.segments) < 2:
            return JsonResponse(block_data)
        else:
            if block.segments[0].analogsignals:
                signal_count = len(block.segments[0].analogsignals)
                for seg in block.segments[1:]:
                    if len(seg.analogsignals) == signal_count:
                        continue
                    else:
                        return JsonResponse(block_data)
                block_data['block'][0]['consistency'] = 'consistent'
            elif block.segments[0].irregularlysampledsignals:
                signal_count = len(block.segments[0].irregularlysampledsignals)
                for seg in block.segments[1:]:
                    if len(seg.irregularlysampledsignals) == signal_count:
                        continue
                    else:
                        return JsonResponse(block_data)
                block_data['block'][0]['consistency'] = 'consistent'

        return JsonResponse(block_data)


class Segment(APIView):

    def get(self, request, format=None, **kwargs):

        # parameter for segment
        # url        --- string
        # semgent_id --- int

        try:
            block, na_file, lazy =  get_block(request)
        except NeoViewError as err:
            return JsonResponse({'error': err.message, 'message': err.detail},
                                status=err.status)

        # check for missing semgent_id parameter
        try:
            id_segment = int(request.GET['segment_id'])
        except MultiValueDictKeyError:
            return JsonResponse({'error': 'segment_id parameter is missing', 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)
        # check for indexerror on segment_id
        try:
            segment = block.segments[id_segment]
        except IndexError:
             return JsonResponse({'error': 'IndexError on segment_id', 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)

        seg_data_test = {
                    'name': "segment 1",
                    'description': "a first fake segment",
                    'file_origin': "nowhere",
                    'spiketrains': [{}, {}],
                    'analogsignals': [{}, {}, {}]
                    }

        seg_data = {
                    'name': segment.name or "",
                    'description': segment.description or "",
                    # 'file_origin': segment.file_origin or "",
                    'file_origin': request.GET.get('url'),
                    'annotations': _handle_dict(segment.annotations),
                    'spiketrains': [{} for s in segment.spiketrains],
                    'analogsignals': [{} for a in segment.analogsignals],
                    'irregularlysampledsignals': [{} for ir in segment.irregularlysampledsignals],
                    # 'as_prop': [{'size': e.size, 'name': e.name} for e in segment.analogsignals],
                    }

        # check for multiple 'matching' (same units/sampling rates) analog signals in a single Segment
        if segment.analogsignals:
            if len(segment.analogsignals) < 2:
                return JsonResponse(seg_data, safe=False)
            else:
                for signal in segment.analogsignals[1:]:
                    if (str(signal.units.dimensionality) == str(segment.analogsignals[0].units.dimensionality)) \
                            and (float(signal.sampling_rate.magnitude) == float(segment.analogsignals[0].sampling_rate.magnitude)):
                        continue
                    else:
                        return JsonResponse(seg_data, safe=False)
                seg_data['consistency'] = 'consistent'
        elif segment.irregularlysampledsignals:
            if len(segment.irregularlysampledsignals) < 2:
                return JsonResponse(seg_data, safe=False)
            else:
                for signal in segment.irregularlysampledsignals[1:]:
                    if (str(signal.units.dimensionality) == str(segment.irregularlysampledsignals[0].units.dimensionality)) \
                            and (str(signal.times.dimensionality) == str(segment.irregularlysampledsignals[0].times.dimensionality)):
                        continue
                    else:
                        return JsonResponse(seg_data, safe=False)
                seg_data['consistency'] = 'consistent'

        return JsonResponse(seg_data, safe=False)


class AnalogSignal(APIView):

    def get(self, request, format=None, **kwargs):
        # parameter for analogsignal
        # url --- string
        # check for missing segment_id p
        # analog_signal_id --- int

        try:
            block, na_file, lazy =  get_block(request)
        except NeoViewError as err:
            return JsonResponse({'error': err.message, 'message': err.detail},
                                status=err.status)

        # check for missing segment_id parameter
        try:
            id_segment = int(request.GET['segment_id'])
        except MultiValueDictKeyError:
            return JsonResponse({'error': 'segment_id parameter is missing', 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)

        # check for missing analog_signal_id parameter
        try:
            id_analog_signal = int(request.GET['analog_signal_id'])
        except MultiValueDictKeyError:
            return JsonResponse({'error': 'analog_signal_id parameter is missing', 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)

        # check for index error on segment_id
        try:
            segment = block.segments[id_segment]
        except IndexError:
            return JsonResponse({'error': 'IndexError on segment_id' , 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)

        try:
            down_sample_factor = int(request.GET.get('down_sample_factor', 1))
        except ValueError:
            down_sample_factor = 1
        graph_data = {}
        analogsignal = None
        if len(segment.analogsignals) > 0:
            if lazy:
                analogsignal = segment.analogsignals[id_analog_signal].load()
            else:
                analogsignal = segment.analogsignals[id_analog_signal]
            graph_data["t_start"] = analogsignal.t_start.item()
            graph_data["t_stop"] = analogsignal.t_stop.item()

            if down_sample_factor > 1:
                graph_data["sampling_period"] = analogsignal.sampling_period.item() * down_sample_factor
            else:
                graph_data["sampling_period"] = analogsignal.sampling_period.item()
        elif len(segment.irregularlysampledsignals) > 0:
            if lazy:
                analogsignal = segment.irregularlysampledsignals[id_analog_signal].load()
            else:
                analogsignal = segment.irregularlysampledsignals[id_analog_signal]
            graph_data["times"] = analogsignal.times.magnitude.tolist()

        # todo, catch any IndexErrors, and return a 404 response

        if analogsignal is None:
            return JsonResponse({})

        analog_signal_values = []
        if analogsignal.shape[1] > 1:
            # multiple channels
            if not len(segment.irregularlysampledsignals) > 0 and down_sample_factor > 1:
                for i in range(0, len(analogsignal[0])):
                    analog_signal_values.append(analogsignal[::down_sample_factor, i].magnitude[:, 0].tolist())
            else:
                for i in range(0, len(analogsignal[0])):
                    analog_signal_values.append(analogsignal[::, i].magnitude[:, 0].tolist())
        else:
            # single channel
            if not len(segment.irregularlysampledsignals) > 0 and down_sample_factor > 1:
                analog_signal_values = analogsignal[::down_sample_factor, 0].magnitude[:, 0].tolist()
            else:
                analog_signal_values = analogsignal.magnitude[:, 0].tolist()

        graph_data["values"] = analog_signal_values
        graph_data["name"] = analogsignal.name
        graph_data["times_dimensionality"] = str(analogsignal.t_start.units.dimensionality)
        graph_data["values_units"] = str(analogsignal.units.dimensionality)

        return JsonResponse(graph_data)


class SpikeTrain(APIView):

    def get(self, request, format=None, **kwargs):

        try:
            block, na_file, lazy =  get_block(request)
        except NeoViewError as err:
            return JsonResponse({'error': err.message, 'message': err.detail},
                                status=err.status)

        # check for missing segment_id parameter
        try:
            id_segment = int(request.GET['segment_id'])
        except MultiValueDictKeyError:
            return JsonResponse({'error': 'segment_id parameter is missing', 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)
        #check for index error
        try:
            segment = block.segments[id_segment]
        except IndexError:
            return JsonResponse({'error': 'IndexError on segment_id', 'message': ''},
                                status=status.HTTP_400_BAD_REQUEST)

        if lazy:
            spiketrains = [st.load() for st in segment.spiketrains]
        else:
            spiketrains = segment.spiketrains

        graph_data = {}

        for idx, st in enumerate(spiketrains):
            graph_data[idx] = {'units': st.units.item(), 't_stop': st.t_stop.item(), 'times': st.times.magnitude.tolist()}

        return JsonResponse(graph_data)
