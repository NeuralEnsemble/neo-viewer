"""
neural_activity_app URL configuration
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic.base import TemplateView

from neoview.views import Block, Segment, AnalogSignal, SpikeTrain


urlpatterns = [

    # API
    url(r'^blockdata/$', Block.as_view()),
    url(r'^segmentdata/$', Segment.as_view()),
    url(r'^analogsignaldata/$', AnalogSignal.as_view()),
    url(r'^spiketraindata/$', SpikeTrain.as_view()),
]
