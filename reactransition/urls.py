from django.conf.urls import url
from django.urls import path
from . import views

app_name = 'reactransition'

urlpatterns = [
    url(r'^/?$', views.index, name='index'),
    path("api/upload", views.upload, name='upload'),
    path("api/transfer", views.transfer, name='transfer'),
    path("api/interp", views.interp, name='interp'),
    path("api/download", views.download, name='download'),
]