#!/usr/bin/env python

import os, sys
import cgi
import json

sys.path.append('..')

from lib import mongodb

db = mongodb.connect()

print "Content-Type: application/json"
print 

form = cgi.FieldStorage()

if "lat" not in form or "lng" not in form:
	print "{'error': 'invalid request'}"
	os._exit(0)

lat = float(form.getvalue("lat"))
lng = float(form.getvalue("lng"))

points = []

for point in db["points"].find({"loc": {"$near": [lat,lng]}}).limit(100):
	points.append(point)

print json.dumps({"error": False, "results": points})
