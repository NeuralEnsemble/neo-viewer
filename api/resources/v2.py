"""
Implementation of endpoints, API version 2.

Simplified API that reduces the number of sequential calls needed
to discover and access data in a file.

Copyright CNRS 2023-2026
Authors: Andrew P. Davison, Thierry Djebouri
Licence: MIT (see LICENSE)
"""

from typing import Annotated
from pydantic import HttpUrl, PositiveInt

from fastapi import Query, HTTPException, APIRouter, status

from ..metadata import title, description
from ..data_models import (
    IOModule,
    AnalogSignal,
    SpikeTrain,
    FileStructure,
)
from ..data_handler import load_blocks

router = APIRouter()


@router.get("/")
async def info():
    """Return information about the API."""
    return {
        "title": title,
        "description": description.strip(),
        "version": 2.0,
    }


@router.get("/structure/")
async def get_structure(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file. "
                "If not provided, Neo will try to determine which module to use."
            )
        ),
    ] = None,
    refresh_cache: Annotated[
        bool,
        Query(
            description=(
                "If true, any previously cached version of the file will be "
                "invalidated and the file will be re-downloaded from the source."
            )
        ),
    ] = False,
) -> FileStructure:
    """
    Return the complete structure of a data file in a single call.

    This includes all blocks, segments, and metadata about the signals
    and spike trains in each segment (but not the actual data).

    Replaces the v1 /blockdata/ and /segmentdata/ endpoints.
    """
    blocks = load_blocks(str(url), type, refresh_cache=refresh_cache)
    return FileStructure.from_neo(blocks, url)


@router.get("/data/analogsignal/")
async def get_analogsignal_data(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    segment_id: Annotated[
        int,
        Query(description="Index of the segment containing the signal."),
    ],
    signal_id: Annotated[
        int, Query(description="Index of the signal within the segment.")
    ],
    block_id: Annotated[
        int,
        Query(description="Index of the block containing the segment."),
    ] = 0,
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file. "
                "If not provided, Neo will try to determine which module to use."
            )
        ),
    ] = None,
    down_sample_factor: Annotated[
        PositiveInt | None | str,
        Query(
            description=(
                "Factor by which data should be downsampled prior to loading. "
                "Useful for faster loading of large files."
            )
        ),
    ] = 1,
    refresh_cache: Annotated[
        bool,
        Query(
            description=(
                "If true, any previously cached version of the file will be "
                "invalidated and the file will be re-downloaded from the source."
            )
        ),
    ] = False,
) -> AnalogSignal:
    """
    Get an analog signal including both data and metadata.

    Use the /structure/ endpoint first to discover available signals.
    """
    try:
        block = load_blocks(str(url), type, refresh_cache=refresh_cache)[block_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"block_id {block_id} is out of range.",
        )
    try:
        segment = block.segments[segment_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"segment_id {segment_id} is out of range.",
        )
    if len(segment.analogsignals) > 0:
        container = segment.analogsignals
    else:
        container = segment.irregularlysampledsignals
    try:
        signal = container[signal_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"signal_id {signal_id} is out of range.",
        )
    try:
        return AnalogSignal.from_neo(signal, down_sample_factor)
    except (ValueError, OSError) as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )


@router.get("/data/spiketrains/")
async def get_spiketrain_data(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    segment_id: Annotated[
        int,
        Query(description="Index of the segment containing the spike trains."),
    ],
    block_id: Annotated[
        int,
        Query(description="Index of the block containing the segment."),
    ] = 0,
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file. "
                "If not provided, Neo will try to determine which module to use."
            )
        ),
    ] = None,
    refresh_cache: Annotated[
        bool,
        Query(
            description=(
                "If true, any previously cached version of the file will be "
                "invalidated and the file will be re-downloaded from the source."
            )
        ),
    ] = False,
) -> dict[str, SpikeTrain]:
    """
    Get all spike trains from a given segment.

    Use the /structure/ endpoint first to discover available spike trains.
    """
    try:
        block = load_blocks(str(url), type, refresh_cache=refresh_cache)[block_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"block_id {block_id} is out of range.",
        )
    try:
        segment = block.segments[segment_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"segment_id {segment_id} is out of range.",
        )
    return {str(i): SpikeTrain.from_neo(st) for i, st in enumerate(segment.spiketrains)}