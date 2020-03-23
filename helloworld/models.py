from django.db import models


class Sensor(models.Model):
	temp = models.IntegerField(default=0)
	humi = models.IntegerField(default=0)
	
class DateTime(models.Model):	
	date = models.DateTimeField('date published')
	#date = models.ForeignKey(Senor, on_delete=models.CASCADE)

class Location(models.Model):
	location = models.CharField(max_length=200)
