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
from roommeet.forms import ProfileForm

from django.views.decorators.csrf import csrf_exempt
from people.models import Person
from django.contrib.auth.decorators import login_required

#function to generate html and return
@login_required
def meet(request):
	people = Person.objects.all()
	q = False
	for person in people:
		if (request.user.username == person.netid):
			q = True
			break

	if not q:
		p = Person(netid=request.user.username)
		p.save()
		return HttpResponseRedirect('profile/')
	return render(request, 'meet.html')

@login_required
def profile(request):
	currentNetid = request.user.username
	if request.method == 'POST':
		pf = ProfileForm(request.POST)
		pf.errors['lat_s'] = pf.error_class()
		if (not pf.errors) or (len(pf.errors) == len(pf.non_field_errors())):
			cd = pf.cleaned_data
			p = Person.objects.filter(netid=currentNetid)
			if (p):
				p1 = p[0];
				p1.netid = currentNetid
				p1.first_name = cd['first_name']
				p1.last_name = cd['last_name']
				p1.lat = cd['lat_s']
				p1.lon = cd['lon_s']
				p1.company = cd['company']
				p1.year = (int)(cd['cyear'])
				p1.save();
			else:
				p1 = Person(netid=currentNetid, first_name=['first_name'], 
					last_name=cd['last_name'], lat=cd['lat_s'], 
					lon=cd['lon_s'], company=cd['company'], year=cd['cyear'])
				p1.save();
			return HttpResponseRedirect('/meet/')
	else:
		pf = ProfileForm()
	return render(request, 'profile.html', {'form': pf})

@login_required
def talk(request):
	currentNetid = request.user.username
	me = Person.objects.get(netid=currentNetid)
	friends = me.friends.all()
	return render(request, 'talk.html', {'friend_list':friends})

@login_required
def get_marks(request):
	currentNetid = request.user.username
	radius = 100000000000;
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
		f = True
		if (me.friends.filter(netid=p1.netid)):
			friend = "yes"
			f = False
		t = get_template('buttonfill.html')
		html = t.render(Context({'person':p1, 'add':f}))
		locs.append({'lat':str(p1.lat), 'lon':str(p1.lon), 'netid':p1.netid, 'html':html})
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
	html = ''
	if (me.friends.filter(netid=addNetid)):
		r['result'] = 'already there'
	else:
		p1 = Person.objects.get(netid=addNetid)
		me.friends.add(p1)
		t = get_template('buttonfill.html')
		html = t.render(Context({'person':p1, 'add':False}))

	r['html'] = html
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
	p1 = Person.objects.get(netid=remNetid)
	me.friends.remove(p1)
	friends = me.friends.all()
	if (rtype == 'talk'):
		t = get_template('tablefill.html')
		html = t.render(Context({'friend_list':friends}))
		r = {'html':html}
	else:
		t = get_template('buttonfill.html')
		html = t.render(Context({'person':p1, 'add':True}))
		r = {'html':html}

	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')


@login_required
def user(request):
	currentNetid = request.user.username
	if request.POST:
		form = ProfileForm(request.POST)
		if form.is_valid():
			cd = form.cleaned_data
			if '_save' in request.POST:
				p = Person.objects.filter(netid=currentNetid)
				if (p):
					p1 = p[0];
					p1.netid = currentNetid
					p1.first_name = cd['first_name']
					p1.last_name = cd['last_name']
					p1.lat = request.POST['lat-s']
					p1.lon = request.POST['lon-s']
					p1.company = cd['company']
					p1.year = cd['cyear']
					p1.save();
				else:
					p1 = Person(netid=currentNetid, first_name=['first_name'], 
						last_name=cd['last_name'], lat=request.POST['lat-s'], 
						lon=request.POST['lon-s'], company=cd['company'], year=cd['year'])
					p1.save();
				return HttpResponseRedirect('/')
			elif '_cancel' in request.POST:
				return HttpResponseRedirect('/')
		else:
			form = ContactForm()
			


