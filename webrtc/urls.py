from django.urls import path

from . import views

urlpatterns = [
    path('', views.home),
    path(r'^on', views.onServer, name='start'),
    path(r'^off', views.offServer, name='stop'),
]
