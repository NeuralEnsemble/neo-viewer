# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os.path
from django.http import JsonResponse
from rest_framework.views import APIView
from neo.io import get_io
from neo import io
from rest_framework import status
from os.path import basename
try:
    from urllib import urlretrieve, HTTPError
except ImportError:
    from urllib.request import urlretrieve, HTTPError
try:
    from urllib.request import urlopen
except ImportError:
    from urllib2 import urlopen
try:
    unicode
except NameError:
    unicode = str
# import logging
from time import sleep

# logger = logging.getLogger(__name__)


def _get_file_from_url(request):
    url = request.GET.get('url')
    if url:
        response = urlopen(url)
        filename = basename(response.url)
        if not os.path.isfile(filename):
            urlretrieve(url, filename)
        # todo: wrap previous line in try..except so we can return a 404 if the file is not found
        #       or a 500 if the local disk is full

        # if we have a text file, try to download the accompanying json file
        name, ext = os.path.splitext(filename)
        if ext[1:] in io.AsciiSignalIO.extensions:  # ext has a leading '.'
            metadata_filename = filename.replace(ext, "_about.json")
            metadata_url = url.replace(ext, "_about.json")
            try:
                urlretrieve(metadata_url, metadata_filename)
            except HTTPError:
                pass

        return filename
    else:
        return JsonResponse({'error': 'URL parameter is missing', 'message': ''},
                             status=status.HTTP_400_BAD_REQUEST)


def _handle_dict(ob):
    return {k: unicode(v) for k, v in ob.items()}


class Block(APIView):

    def get(self, request, format=None, **kwargs):
        lazy = False
        na_file = _get_file_from_url(request)
        neo_io = get_io(na_file)
        if 'type' in request.GET and request.GET.get('type'):
            iotype = request.GET.get('type')
            method = getattr(io, iotype)
            r = method(filename=na_file)
            if r.support_lazy:
                block = r.read_block(lazy=True)
                lazy = True
            else:
                block = r.read_block()
        else:
            try:
                if neo_io.support_lazy:
                    block = neo_io.read_block(lazy=True)
                    lazy = True
                else:
                    block = neo_io.read_block()

            except IOError as err:
                # todo: need to be more fine grained. There could be other reasons
                #       for an IOError
                return JsonResponse({'error': 'incorrect file type', 'message': str(err)},
                                    status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        block_data = {'block': [{
            'annotations': _handle_dict(block.annotations),
            # 'channel_indexes': block.channel_indexes,
            'description': block.description or "",
            # 'file_datetime': block.file_datetime,
            'file_origin': block.file_origin or "",
            # 'index': block.index,
            'name': block.name or "",
            'rec_datetime': block.rec_datetime,
            'file_name': na_file,
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
                    'file_origin': s.file_origin or "",
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
        lazy = False
        na_file = _get_file_from_url(request)
        neo_io = get_io(na_file)
        if neo_io.support_lazy:
            block = neo_io.read_block(lazy=True)
            lazy = True
        else:
            block = neo_io.read_block()
        id_segment = int(request.GET['segment_id'])
        # todo, catch MultiValueDictKeyError in case segment_id isn't given, and return a 400 Bad Request response
        segment = block.segments[id_segment]
        # todo, catch IndexError, and return a 404 response

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
                    'file_origin': segment.file_origin or "",
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
        lazy = False
        na_file = _get_file_from_url(request)
        while True:  # todo, find better solution
            try: 
                neo_io = get_io(na_file)
                break
            except OSError:
                sleep(5)

        if neo_io.support_lazy:
            block = neo_io.read_block(lazy=True)
            lazy = True
        else:
            block = neo_io.read_block()
        id_segment = int(request.GET['segment_id'])
        id_analog_signal = int(request.GET['analog_signal_id'])
        # todo, catch MultiValueDictKeyError in case segment_id or analog_signal_id aren't given, and return a 400 Bad Request response
        segment = block.segments[id_segment]

        graph_data = {}
        analogsignal = None
        if len(segment.analogsignals) > 0:
            if lazy:
                analogsignal = segment.analogsignals[id_analog_signal].load()
            else:
                analogsignal = segment.analogsignals[id_analog_signal]
            graph_data["t_start"] = analogsignal.t_start.item()
            graph_data["t_stop"] = analogsignal.t_stop.item()
            if request.GET['down_sample_factor']:
                graph_data["sampling_period"] = analogsignal.sampling_period.item() * int(request.GET['down_sample_factor'])
            else:
                graph_data["sampling_period"] = analogsignal.sampling_period.item()
        elif len(segment.irregularlysampledsignals) > 0:
            if lazy:
                analogsignal = segment.irregularlysampledsignals[id_analog_signal].load()
            else:
                analogsignal = segment.irregularlysampledsignals[id_analog_signal]
            graph_data["times"] = analogsignal.times.magnitude.tolist()

        # todo, catch any IndexErrors, and return a 404 response

        analog_signal_values = []

        if analogsignal.shape[1] > 1:
            # multiple channels
            if not len(segment.irregularlysampledsignals) > 0 and request.GET['down_sample_factor']:
                dsf = int(request.GET['down_sample_factor'])
                for i in range(0, len(analogsignal[0])):
                    analog_signal_values.append(analogsignal[::dsf, i].magnitude[:, 0].tolist())
            else:
                for i in range(0, len(analogsignal[0])):
                    analog_signal_values.append(analogsignal[::, i].magnitude[:, 0].tolist())
        else:
            # single channel
            if not len(segment.irregularlysampledsignals) > 0 and request.GET['down_sample_factor']:
                dsf = int(request.GET['down_sample_factor'])
                analog_signal_values = analogsignal[::dsf, 0].magnitude[:, 0].tolist()
            else:
                analog_signal_values = analogsignal.magnitude[:, 0].tolist()

        graph_data["values"] = analog_signal_values
        graph_data["name"] = analogsignal.name
        graph_data["times_dimensionality"] = str(analogsignal.t_start.units.dimensionality)
        graph_data["values_units"] = str(analogsignal.units.dimensionality)

        return JsonResponse(graph_data)


class SpikeTrain(APIView):

    def get(self, request, format=None, **kwargs):
        lazy = False
        na_file = _get_file_from_url(request)
        while True:
            try:
                neo_io = get_io(na_file)
                break
            except OSError:
                sleep(5)

        if neo_io.support_lazy:
            block = neo_io.read_block(lazy=True)
            lazy = True
        else:
            block = neo_io.read_block()
        id_segment = int(request.GET['segment_id'])
        segment = block.segments[id_segment]

        if lazy:
            spiketrains = segment.spiketrains.load()
        else:
            spiketrains = segment.spiketrains

        graph_data = {}

        for idx, st in enumerate(spiketrains):
            graph_data[idx] = {'units': st.units.item(), 't_stop': st.t_stop.item(), 'times': st.times.magnitude.tolist()}

        return JsonResponse(graph_data)
