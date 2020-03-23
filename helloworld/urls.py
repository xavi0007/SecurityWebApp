from django.urls import path

from . import views

urlpatterns = [
    path('', views.home),
    path(r'^output', views.startMQTT, name='script'),
    
]
