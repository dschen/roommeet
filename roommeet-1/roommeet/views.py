#render shortcut
from django.shortcuts import render, redirect
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
from django.contrib.auth.decorators import login_required

#function to generate html and return
@login_required
def meet(request):
	return render(request, 'meet.html')

@login_required
def profile(request):
    return render(request, 'profile.html')

@login_required
def talk(request):
	currentNetid = request.user.username
	me = Person.objects.get(netid=currentNetid)
	friends = me.friends.all()
	return render(request, 'talk.html', {'friend_list':friends})

@login_required
def get_marks(request):
	currentNetid = request.user.username
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
		friend = "no"
		if (me.friends.filter(netid=p1.netid)):
			friend = "yes"
	
		locs.append({'lat':str(p1.lat), 'lon':str(p1.lon), 'fname':p1.first_name, 'lname':p1.last_name, 'netid':p1.netid, 'friend':friend})
	#locs.append({'lat':str(me.lat), 'lon':str(me.lon)})
	return HttpResponse(json.dumps(locs), mimetype='application/json; charset=UTF-8')
	#form = LatLonForm(request.POST)
	#if form.is_valid():
	#	cd = form.cleaned_data
	#	lat = cd['lat']
	#	lon = cd['lon']

	#return HttpResponse('OK', mimetype='text/plain; charset=UTF-8')
@login_required
def meet_person(request):
	currentNetid = request.user.username
	addNetid = ''
	if request.POST:
		if 'netid' in request.POST:
			addNetid = request.POST['netid']
	me = Person.objects.get(netid=currentNetid)
	r = {'result':'success'}
	if (me.friends.filter(netid=addNetid)):
		r['result'] = 'already there'
	else:
		me.friends.add(Person.objects.get(netid=addNetid))

	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')

@login_required
def remove_person(request):
	currentNetid = request.user.username
	remNetid = ''
	rtype = 'meet'
	if request.POST:
		if 'netid' in request.POST:
			remNetid = request.POST['netid']
		if 'type' in request.POST:
			rtype = request.POST['type']
	me = Person.objects.get(netid=currentNetid)
	me.friends.remove(Person.objects.get(netid=remNetid))
	friends = me.friends.all()
	if (rtype == 'talk'):
		html = ''
		for person in friends:
			html += "<tr>\n<td class='col-md-8'>" + person.first_name + "  " + person.last_name + " " + str(person.year)
			html +=	"\n</td>\n<td>\nexample\n</td>\n<td>\n<a href='mailto:"
			html += person.netid + "@princeton.edu?Subject=RoomMeet%20Hello'>" + person.netid 
			html += '@princeton.edu </a>\n</td>\n<td>\n<button type="submit" class="btn btn-sm btn-danger" id=\''
			html += person.netid + '-remove\' onclick="removeList(\'' + person.netid + '\')"> remove </button> <br><br>\n</td>\n</tr>\n'
	
		r = {'html':html}
	else:
		r = {'result':'success'}

	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')


@login_required
def user(request):
	currentNetid = request.user.username
	if request.POST:
		if '_save' in request.POST:
			p = Person.objects.filter(netid=currentNetid)
			if (p):
				p1 = p[0];
				p1.netid = currentNetid
				p1.first_name = request.POST['firstname']
				p1.last_name = request.POST['lastname']
				p1.lat = request.POST['lat-s']
				p1.lon = request.POST['lon-s']
				p1.company = request.POST['company']
				p1.year = (int)(request.POST['cyear'])
				p1.save();
			else:
				p1 = Person(netid=currentNetid, first_name=request.POST['firstname'], 
					last_name=request.POST['lastname'], lat=request.POST['lat-s'], 
					lon=request.POST['lon-s'], company=request.POST['company'], year=request.POST['cyear'])
				p1.save();
			return HttpResponseRedirect('/')
		elif '_cancel' in request.POST:
			return HttpResponseRedirect('/')
			


