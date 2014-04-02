#render shortcut
from django.shortcuts import render
import time
import json
import math

#responses, httpresponse not necessary with render shortcut
from django.http import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
#templates and contexts, not necessary with render shortcut
from django.template.loader import get_template
from django.template import Context
from django.utils.html import strip_tags

import datetime
from forms import LatLonForm

from django.views.decorators.csrf import csrf_exempt
from people.models import Person


#function to generate html and return

def meet(request):
	return render(request, 'meet.html')


def profile(request):
    return render(request, 'profile.html')


def talk(request):
	currentNetid = 'ltolias'
	me = Person.objects.get(netid=currentNetid)
	friends = me.friends.all()
	print friends[0].first_name
	return render(request, 'talk.html', {'friend_list':friends})


def get_marks(request):
	currentNetid = 'ltolias'
	radius = 200*69.172;
	if request.POST:
		if 'radius' in request.POST:
			radius = int(request.POST['radius']);
	
	me = Person.objects.get(netid=currentNetid)
	lrad = math.cos(math.radians(float(me.lat))) * 111.325 * 0.621371;
	lonrad = radius / lrad;
	radius = radius / 69.172;
	p = Person.objects.filter(lat__gt=float(me.lat)-radius).filter(lat__lt=float(me.lat)+radius).filter(lon__gt=float(me.lon)-lonrad).filter(lon__lt=float(me.lon)+lonrad)
	locs = []
	for p1 in p:
		locs.append({'lat':str(p1.lat), 'lon':str(p1.lon), 'fname':p1.first_name, 'lname':p1.last_name, 'netid':p1.netid})
	#locs.append({'lat':str(me.lat), 'lon':str(me.lon)})
	return HttpResponse(json.dumps(locs), mimetype='application/json; charset=UTF-8')
	#form = LatLonForm(request.POST)
	#if form.is_valid():
	#	cd = form.cleaned_data
	#	lat = cd['lat']
	#	lon = cd['lon']

	#return HttpResponse('OK', mimetype='text/plain; charset=UTF-8')

def user(request):
	if request.POST:
		if '_save' in request.POST:
			p = Person.objects.filter(netid=request.POST['netid'])
			if (p):
				p1 = p[0];
				p1.netid = request.POST['netid']
				p1.first_name = request.POST['firstname']
				p1.last_name = request.POST['lastname']
				p1.lat = request.POST['lat-s']
				p1.lon = request.POST['lon-s']
				p1.save();
			else:
				p1 = Person(netid=request.POST['netid'], first_name=request.POST['firstname'], 
					last_name=request.POST['lastname'], lat=request.POST['lat-s'], lon=request.POST['lon-s'])
				p1.save();
			return HttpResponseRedirect('/')
		elif '_cancel' in request.POST:
			return HttpResponseRedirect('/')
			


