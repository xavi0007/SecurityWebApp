from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
import requests
import subprocess
import sys
import socket
from json.decoder import JSONObject
import json
import paho.mqtt.client as mqtt

server_address = "192.168.10.207"
id = "ymikzszg"
pw = "NI6tT_zFV1DF"
mqttc = mqtt.Client()
# Create your views here.

def home(request):
	return render(request,'home.html')

def startMQTT(requests):
	subprocess.call(["mosquitto", "-v"])
	print("MQTTSERVER IS ON")
	ip = socket.gethostbyname(socket.gethostname())
	startClient()
	printout = "port open on "  + ip
	return render(requests, 'home.html', {'data': printout})

# The callback for when the client receives a CONNACK response from the server
def on_connect(client,userdata,rc):
    print("Connected with result code:"+str(rc))
    
    #subscribe in on_connect() means that if connection is lost and reconnection is successful then subs are renewed
    client.subscribe('RbTask')

# The callback for when a PUBLISH message is received from the server.
def on_message(client,userdata,msg):
    print ("Topic",msg.topic + "\nMessage:" + str(msg.payload))

def on_log(client,userdata,level,buf):
    print("message:" + str(buf))
    print("userdata:" + str(userdata))

def publish_message(topic, message):
    mqttc.publish(topic, message)

def startClient():
	mqttc.on_connect=on_connect
	mqttc.on_message=on_message
	mqttc.username_pw_set(id, pw)
	mqttc.connect(server_address,1883,60)
	# and listen to server forever
	mqttc.loop_forever()
