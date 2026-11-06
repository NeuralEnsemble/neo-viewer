"""
Implementation of endpoints, API version 1.

Copyright CNRS 2023
Authors: Andrew P. Davison, Onur Ates, Shailesh Appukuttan, Hélissande Fragnaud and Corentin Fragnaud
Licence: MIT (see LICENSE)

"""

from typing import Annotated
from pydantic import HttpUrl, PositiveInt

from fastapi import Query, HTTPException, APIRouter, status

from ..metadata import title, description
from ..data_models import (
    IOModule,
    Segment,
    AnalogSignal,
    SpikeTrain,
    BlockContainer,
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


@router.get("/blockdata/")
async def get_block_data(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file."
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
) -> BlockContainer:
    """
    Return metadata about all the blocks in a data file,
    including metadata about the segments within each block,
    but without any information about the data contained within each segment.
    """
    blocks = load_blocks(str(url), type, refresh_cache=refresh_cache)
    return BlockContainer.from_neo(blocks, url)


@router.get("/segmentdata/")
async def get_segment_data(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    segment_id: Annotated[
        int,
        Query(
            description="Index of the segment for which metadata should be returned."
        ),
    ],
    block_id: Annotated[
        int,
        Query(
            description="Index of the block for which metadata should be returned."
        ),
    ] = 0,
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file."
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
) -> Segment:
    """
    Return information about an individual Segment within a block,
    including metadata about the signals contained in the segment,
    but not the signal data themselves.
    """
    try:
        block = load_blocks(str(url), type, refresh_cache=refresh_cache)[block_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on block_id",
        )
    try:
        segment = block.segments[segment_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on segment_id",
        )
    return Segment.from_neo(segment, url)


@router.get("/analogsignaldata/")
async def get_analogsignal_data(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    segment_id: Annotated[
        int,
        Query(description="Index of the segment in which the analog signal is found."),
    ],
    analog_signal_id: Annotated[
        int, Query(description="Index of the signal within the segment.")
    ],
    block_id: Annotated[
        int,
        Query(
            description="Index of the block for which metadata should be returned."
        ),
    ] = 0,
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file."
                "If not provided, Neo will try to determine which module to use."
            )
        ),
    ] = None,
    down_sample_factor: Annotated[
        PositiveInt | None | str,
        Query(
            description=(
                "Factor by which data should be downsampled prior to loading. "
                "Useful for faster loading of large files. Accepts positive integer values."
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
    """Get an analog signal from a given segment, including both data and metadata."""
    try:
        block = load_blocks(str(url), type, refresh_cache=refresh_cache)[block_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on block_id",
        )
    try:
        segment = block.segments[segment_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on segment_id",
        )
    if len(segment.analogsignals) > 0:
        container = segment.analogsignals
    else:
        container = segment.irregularlysampledsignals
    try:
        signal = container[analog_signal_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on analog_signal_id",
        )
    try:
        asig = AnalogSignal.from_neo(signal, down_sample_factor)
    except (ValueError, OSError) as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )
    return asig


@router.get("/spiketraindata/")
async def get_spiketrain_data(
    url: Annotated[
        HttpUrl, Query(description="Location of a data file that can be read by Neo.")
    ],
    segment_id: Annotated[
        int,
        Query(
            description="Index of the segment for which spike trains should be returned."
        ),
    ],
    block_id: Annotated[
        int,
        Query(
            description="Index of the block for which metadata should be returned."
        ),
    ] = 0,
    type: Annotated[
        IOModule,
        Query(
            description=(
                "Specify a specific Neo IO module that should be used to open the data file."
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
    """Get the spike trains from a given segment, including both data and metadata."""
    try:
        block = load_blocks(str(url), type, refresh_cache=refresh_cache)[block_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on block_id",
        )
    try:
        segment = block.segments[segment_id]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IndexError on segment_id",
        )
    return {str(i): SpikeTrain.from_neo(st) for i, st in enumerate(segment.spiketrains)}
