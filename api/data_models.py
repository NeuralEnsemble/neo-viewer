"""
Pydantic data models, including methods for conversion from Neo data objects.

Copyright CNRS 2023
Authors: Andrew P. Davison, Onur Ates, Shailesh Appukuttan, Hélissande Fragnaud and Corentin Fragnaud
Licence: MIT (see LICENSE)
"""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, HttpUrl
import dateparser
import numpy as np
from neo.io import iolist, proxyobjects
import neo


def sanitise_annotations(annotations):
    """Ensure that annotation values can be serialized to JSON, by converting them to strings."""
    return {k: str(v) for k, v in annotations.items()}


def parse_datetime(datetime_repr):
    # not sure this is needed. Can we guarantee
    # rec_datetime is always a datetime object when loaded with a Neo IO?
    if datetime_repr:
        if isinstance(datetime_repr, datetime):
            return datetime_repr
        else:
            try:
                return dateparser.parse(datetime_repr)
            except TypeError:
                print(type(datetime_repr))
                raise
    else:
        return None


exclude = ["neo.io.exampleio", "neo.io.nixio_fr", "neo.io.neurosharectypesio"]

IOModule = Enum(
    "IOModule",
    [(cls.__name__, cls.__name__) for cls in iolist if cls.__module__ not in exclude],
)


class SpikeTrain(BaseModel):
    """
    An ensemble of action potentials (spikes) emitted by the same unit in a period of time.
    """

    units: str
    t_stop: float
    times: list[float]

    @classmethod
    def from_neo(cls, spike_train):
        if isinstance(spike_train, proxyobjects.BaseProxy):
            spike_train = spike_train.load()
        return cls(
            units=str(spike_train.units.dimensionality),
            t_stop=spike_train.t_stop.magnitude,
            times=spike_train.times.magnitude.tolist(),
        )


class AnalogSignal(BaseModel):
    """
    Array of one or more continuous analog signals,
    with either a fixed sampling interval
    or an explicit array of sample times.
    """

    t_start: float
    t_stop: float
    sampling_period: float | None = None
    name: str
    times_dimensionality: str
    values_units: str
    values: list[float] | list[list[float]]
    times: list[float] | None = None

    @classmethod
    def from_neo(cls, signal, down_sample_factor):
        if isinstance(signal, proxyobjects.BaseProxy):
            signal = signal.load()
        assert isinstance(signal, neo.AnalogSignal)
        # see https://stackoverflow.com/questions/6736590/fast-check-for-nan-in-numpy
        contains_nan = np.isnan(np.min(signal.magnitude))
        if contains_nan:
            raise ValueError("Data contains NaN")
        data = {
            "t_start": signal.t_start.magnitude,
            "t_stop": signal.t_stop.magnitude,
            "name": signal.name or "",
            "times_dimensionality": str(signal.t_start.units.dimensionality),
            "values_units": str(signal.units.dimensionality),
        }
        try:
            down_sample_factor = int(down_sample_factor)
        except (ValueError, TypeError):
            down_sample_factor = 1
        if isinstance(signal, neo.AnalogSignal):
            data["sampling_period"] = (
                signal.sampling_period.magnitude * down_sample_factor
            )
        else:
            data["times"] = signal.times.magnitude.tolist()
        n_channels = signal.shape[1]
        values = []
        for channel_id in range(n_channels):
            values.append(
                signal[::down_sample_factor, channel_id].magnitude.ravel().tolist()
            )
        if n_channels == 1:
            values = values[0]
        data["values"] = values
        return cls(**data)

    model_config = {  # todo: include all fields
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Name of the signal",
                    "values": [
                        -71.0,
                        -72.0,
                        -71.5,
                        -71.5,
                        -71.5,
                        -71.0,
                        -72.0,
                        -71.0,
                        -71.5,
                        -71.0,
                        -71.0,
                        -72.0,
                    ],
                    "values_units": "mV",
                    "times": [
                        0.0,
                        0.0001,
                        0.0002,
                        0.0003,
                        0.0004,
                        0.0005,
                        0.0006,
                        0.0007,
                        0.0008,
                        0.0009,
                        0.001,
                    ],
                    "times_dimensionality": "ms",
                    "t_start": 0.0,
                    "t_stop": 1000.0,
                    "sampling_rate": 10.0,
                    "sampling_rate_units": "kHz",
                }
            ]
        }
    }


class Segment(BaseModel):
    """
    A container for data sharing a common time basis.
    """

    name: str
    description: str
    annotations: dict[str, str]
    file_origin: HttpUrl
    rec_datetime: datetime | None = None
    spiketrains: list[dict]
    analogsignals: list[dict]
    irregularlysampledsignals: list[dict]
    consistency: str | None = None

    @classmethod
    def from_neo(cls, neo_segment, data_file_url, metadata_only=False):
        data = {
            "name": neo_segment.name or "",
            "description": neo_segment.description or "",
            "annotations": sanitise_annotations(neo_segment.annotations),
            "file_origin": str(data_file_url),
            "rec_datetime": parse_datetime(neo_segment.rec_datetime),
        }
        if metadata_only:
            data.update(
                {
                    "spiketrains": [],
                    "analogsignals": [],
                    "irregularlysampledsignals": [],
                    "consistency": None,
                }
            )
        else:
            data.update(
                {
                    "spiketrains": [{} for s in neo_segment.spiketrains],
                    "analogsignals": [{} for a in neo_segment.analogsignals],
                    "irregularlysampledsignals": [
                        {} for ir in neo_segment.irregularlysampledsignals
                    ],
                    "consistency": cls.check_consistency(neo_segment),
                }
            )
        return cls(**data)

    @classmethod
    def check_consistency(cls, neo_segment):
        """Check for multiple 'matching' (same units/sampling rates) analog signals in a single Segment."""
        if neo_segment.analogsignals:
            if len(neo_segment.analogsignals) < 2:
                return None
            else:
                for signal in neo_segment.analogsignals[1:]:
                    if (
                        str(signal.units.dimensionality)
                        == str(neo_segment.analogsignals[0].units.dimensionality)
                    ) and (
                        float(signal.sampling_rate.magnitude)
                        == float(neo_segment.analogsignals[0].sampling_rate.magnitude)
                    ):
                        continue
                    else:
                        return None
                return "consistent"
        elif neo_segment.irregularlysampledsignals:
            if len(neo_segment.irregularlysampledsignals) < 2:
                return None
            else:
                for signal in neo_segment.irregularlysampledsignals[1:]:
                    if (
                        str(signal.units.dimensionality)
                        == str(
                            neo_segment.irregularlysampledsignals[
                                0
                            ].units.dimensionality
                        )
                    ) and (
                        str(signal.times.dimensionality)
                        == str(
                            neo_segment.irregularlysampledsignals[
                                0
                            ].times.dimensionality
                        )
                    ):
                        continue
                    else:
                        return None
                return "consistent"

    model_config = {  # todo: include all fields
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Name of the segment",
                    "description": "Description of the segment",
                    "file_origin": "original_file_name.dat",
                    "annotations": {"key3": "value3", "key4": "value4"},
                    "analogsignals": [{}, {}],
                }
            ]
        }
    }


class Block(BaseModel):
    """
    Main container gathering all the data, whether discrete or continuous, for a
    given recording session.
    """

    name: str
    description: str
    annotations: dict[str, str]
    file_origin: HttpUrl
    file_name: str
    rec_datetime: datetime | None = None
    segments: list[Segment]
    consistency: str | None = None
    channels: str | None = None
    spike_trains: str | None = None

    @classmethod
    def from_neo(cls, neo_block, data_file_url):
        return cls(
            name=neo_block.name or "",
            description=neo_block.description or "",
            annotations=sanitise_annotations(neo_block.annotations),
            file_origin=str(data_file_url),
            file_name=data_file_url.path,
            rec_datetime=parse_datetime(neo_block.rec_datetime),
            segments=[
                Segment.from_neo(neo_seg, data_file_url, metadata_only=True)
                for neo_seg in neo_block.segments
            ],
            consistency=cls.check_consistency(neo_block),
            channels=cls.check_channels(neo_block),
            spike_trains=cls.check_spike_trains(neo_block),
        )

    @classmethod
    def check_consistency(cls, neo_block):
        """Check for multiple Segments with 'matching' (same count) analog signals in each."""
        if len(neo_block.segments) < 2:
            return None
        else:
            seg0 = neo_block.segments[0]
            if seg0.analogsignals:
                signal_count = len(seg0.analogsignals)
                for seg in neo_block.segments[1:]:
                    if len(seg.analogsignals) == signal_count:
                        continue
                    else:
                        return None
                return "consistent"
            elif seg0.irregularlysampledsignals:
                signal_count = len(seg0.irregularlysampledsignals)
                for seg in neo_block.segments[1:]:
                    if len(seg.irregularlysampledsignals) == signal_count:
                        continue
                    else:
                        return None
                return "consistent"
            else:
                return None

    @classmethod
    def check_channels(cls, neo_block):
        seg0 = neo_block.segments[0]
        if (seg0.analogsignals and seg0.analogsignals[0].shape[1] > 1) or (
            seg0.irregularlysampledsignals
            and seg0.irregularlysampledsignals[0].shape[1] > 1
        ):
            return "multi"
        else:
            return "single"

    @classmethod
    def check_spike_trains(cls, neo_block):
        for s in neo_block.segments:
            if len(s.spiketrains) > 0:
                return "exist"
        return None


class BlockContainer(BaseModel):
    """ """

    block: list[Block]

    @classmethod
    def from_neo(cls, neo_blocks, data_file_ur):
        return cls(block=[Block.from_neo(nb, data_file_ur) for nb in neo_blocks])

    model_config = {  # todo: include all fields
        "json_schema_extra": {
            "examples": [
                {
                    "block": [
                        {
                            "annotations": {"key1": "value1", "key2": "value2"},
                            "name": "Name of data block",
                            "description": "Description of data block",
                            "file_origin": "original_file_name.dat",
                            "rec_datetime": "2018-04-01T12:00:00",
                            "segments": [
                                {
                                    "name": "Name of data segment",
                                    "annotations": {
                                        "key3": "value3",
                                        "key4": "value4",
                                    },
                                    "description": "Description of data segment",
                                    "rec_datetime": "2018-04-01T12:00:00",
                                    "file_origin": "original_file_name.dat",
                                    "analogsignals": [],
                                    "spiketrains": [],
                                }
                            ],
                        },
                    ]
                }
            ]
        }
    }

# ============================================================
# API v2 models - Simplified structure endpoint
# ============================================================

class SignalInfo(BaseModel):
    """Metadata about an analog signal, without the actual data."""
    signal_id: int
    name: str
    units: str
    sampling_rate: float | None = None
    sampling_rate_units: str | None = None
    t_start: float
    t_stop: float
    duration: float
    n_channels: int
    n_samples: int
    is_irregular: bool = False

    @classmethod
    def from_neo(cls, signal, signal_id, irregular=False):
        if isinstance(signal, proxyobjects.BaseProxy):
            signal = signal.load()
        data = {
            "signal_id": signal_id,
            "name": signal.name or f"Signal {signal_id}",
            "units": str(signal.units.dimensionality),
            "t_start": float(signal.t_start.magnitude),
            "t_stop": float(signal.t_stop.magnitude),
            "duration": float((signal.t_stop - signal.t_start).magnitude),
            "n_channels": signal.shape[1] if len(signal.shape) > 1 else 1,
            "n_samples": signal.shape[0],
            "is_irregular": irregular,
        }
        if not irregular:
            data["sampling_rate"] = float(signal.sampling_rate.magnitude)
            data["sampling_rate_units"] = str(signal.sampling_rate.units.dimensionality)
        return cls(**data)


class SpikeTrainInfo(BaseModel):
    """Metadata about a spike train, without the actual data."""
    train_id: int
    name: str
    units: str
    t_stop: float
    count: int

    @classmethod
    def from_neo(cls, spike_train, train_id):
        if isinstance(spike_train, proxyobjects.BaseProxy):
            spike_train = spike_train.load()
        return cls(
            train_id=train_id,
            name=spike_train.name or f"Unit {train_id}",
            units=str(spike_train.units.dimensionality),
            t_stop=float(spike_train.t_stop.magnitude),
            count=len(spike_train.times),
        )


class SegmentStructure(BaseModel):
    """Structure of a segment with signal metadata."""
    segment_id: int
    name: str
    description: str
    rec_datetime: datetime | None = None
    analog_signals: list[SignalInfo]
    irregular_signals: list[SignalInfo]
    spike_trains: list[SpikeTrainInfo]

    @classmethod
    def from_neo(cls, neo_segment, segment_id):
        return cls(
            segment_id=segment_id,
            name=neo_segment.name or f"Segment {segment_id}",
            description=neo_segment.description or "",
            rec_datetime=parse_datetime(neo_segment.rec_datetime),
            analog_signals=[
                SignalInfo.from_neo(sig, i)
                for i, sig in enumerate(neo_segment.analogsignals)
            ],
            irregular_signals=[
                SignalInfo.from_neo(sig, i, irregular=True)
                for i, sig in enumerate(neo_segment.irregularlysampledsignals)
            ],
            spike_trains=[
                SpikeTrainInfo.from_neo(st, i)
                for i, st in enumerate(neo_segment.spiketrains)
            ],
        )


class BlockStructure(BaseModel):
    """Structure of a block with all segment metadata."""
    block_id: int
    name: str
    description: str
    rec_datetime: datetime | None = None
    annotations: dict[str, str]
    segments: list[SegmentStructure]

    @classmethod
    def from_neo(cls, neo_block, block_id):
        return cls(
            block_id=block_id,
            name=neo_block.name or f"Block {block_id}",
            description=neo_block.description or "",
            rec_datetime=parse_datetime(neo_block.rec_datetime),
            annotations=sanitise_annotations(neo_block.annotations),
            segments=[
                SegmentStructure.from_neo(seg, i)
                for i, seg in enumerate(neo_block.segments)
            ],
        )


class FileStructure(BaseModel):
    """Complete structure of a data file."""
    url: str
    blocks: list[BlockStructure]

    @classmethod
    def from_neo(cls, neo_blocks, url):
        return cls(
            url=str(url),
            blocks=[
                BlockStructure.from_neo(block, i)
                for i, block in enumerate(neo_blocks)
            ],
        )