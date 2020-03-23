from django.shortcuts import render
from django.http import HttpResponse
import requests
import subprocess
import sys
# Create your views here.

def home(request):
	return render(request,'index.html')

def onServer(request):
	subprocess.call(["npm", "start", "--prefix", "/Users/xavier/Programming/SecurityWebApp/webrtc/easyrtc/server"] )
	print("im in")
	return render(request, 'index.html')
def offServer(request):
    subprocess.call(["killall", "node"])
    return render(request, 'index.html')
