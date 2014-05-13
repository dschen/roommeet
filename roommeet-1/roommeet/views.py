#render shortcut
from django.shortcuts import render, redirect
import time
import json
import math

#responses, httpresponse not necessary with render shortcut
from django.http import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, HttpResponseNotFound
#templates and contexts, not necessary with render shortcut
from django.template.loader import get_template
from django.template import Context, RequestContext
from django.utils.html import strip_tags

import datetime
from roommeet.forms import ProfileForm, HouseForm

from django.views.decorators.csrf import csrf_exempt
from people.models import Person
from houses.models import House
from django.contrib.auth.decorators import login_required

from django.forms.models import model_to_dict
from decimal import Decimal

from itertools import chain

#function to generate html and return

def meet(request):
        # check that user is authenticated
	if (not request.user.is_authenticated()):
		return render(request, 'product_page.html')
	first = "False"
	p = Person.objects.filter(netid=request.user.username)
	if (not p):
		p1 = Person(netid=request.user.username)
		p1.save()

        # get information about the user
	currentNetid = request.user.username
	me = Person.objects.get(netid=currentNetid)

        # first time visiting the site?
	if request.method == 'GET':
		if (not isinstance(me.lat, Decimal)):
			first = "True"

        # updating profile
	if request.method == 'POST':
                # get information from the form
		pf = ProfileForm(request.POST)

                # if the form is valid, update the user's information
		if pf.is_valid():
			cd = pf.cleaned_data
			p = Person.objects.filter(netid=currentNetid)

                        # is the user already in the database? If so, just updated their info
			if (p):
				p1 = p[0];
				p1.netid = currentNetid
				p1.first_name = cd['first_name']
				p1.last_name = cd['last_name']
				p1.lat = cd['lat_s']
				p1.lon = cd['lon_s']
				p1.start = cd['start']
				p1.end = cd['end']
				p1.company = cd['company']
				p1.year = (int)(cd['year'])
				p1.desired = cd['desired']
				p1.gender = cd['gender']
				p1.save()
                        # otherwise, create a new Person for the user
			else:
				p1 = Person(netid=currentNetid, first_name=['first_name'],
				last_name=cd['last_name'], lat=cd['lat_s'],
				lon=cd['lon_s'], company=cd['company'], year=cd['year'])
				p1.save()

                        # render the templates
			t = get_template('tablefill.html')
			friends = me.friends.all()
			tfhtml = t.render(RequestContext(request, {'friend_list': friends}))
			t = get_template('myhousetablefill.html')
			myhouses = me.myhouses.all()
			myhtfhtml = t.render(RequestContext(request, {'my_houses': myhouses, 'me':me}))
			t = get_template('profile.html')
			html = t.render(RequestContext(request, {'form': pf}))
			data = {'success':'true', 'html':html, 'tfhtml':tfhtml, 'myhtfhtml':myhtfhtml}
			return HttpResponse(json.dumps(data), content_type = "application/json")

                # form is not valid
		else:
			pf.errors['lat_s'] = pf.error_class()

		t = get_template('profile.html')
		html = t.render(RequestContext(request, {'form': pf}))

		data = {'success':'false', 'html':html}
		return HttpResponse(json.dumps(data), content_type = "application/json")

	else:
		pf = ProfileForm(initial=model_to_dict(me))

	friends = me.friends.all()
	houses = me.houses.all()
	myhouses = me.myhouses.all()
	return render(request, 'meet.html', {'form': pf, 'friend_list':friends, 'house_list':houses,'my_houses':myhouses, 'firstTime':first, 'me': me})

# get the map markers to display
@login_required
def get_marks(request):
	currentNetid = request.user.username

        # filter variables
	radius = 100000000000;
	gender = 'either'
	olap = -10000
	hp = 'People and Housing'
	year = 0

        # what are we filtering wtih?
	if request.POST:
		if 'radius' in request.POST:
			radius = int(request.POST['radius'])
		if 'gender' in request.POST:
			gender = str(request.POST['gender'])
		if 'year' in request.POST:
			year = int(request.POST['year'])
		if 'olap' in request.POST:
			olap = int(request.POST['olap'])
		if 'hp' in request.POST:
			hp = str(request.POST['hp'])
		if radius == 0:
			radius = 100000000000;

	me = Person.objects.get(netid=currentNetid)

        # math needed for the radius filter
	lrad = math.cos(math.radians(float(me.lat))) * 111.325 * 0.621371;
	lonrad = radius / lrad;
	radius = radius / 69.172;

	olap = olap

        # actually filter the people in the database
	if gender == 'either' and year == 0:
		p = Person.objects.filter(lat__gt=float(me.lat)-radius).filter(lat__lt=float(me.lat)+radius).filter(lon__gt=float(me.lon)-lonrad).filter(lon__lt=float(me.lon)+lonrad)
	elif gender == 'either' and year != 0:
		p = Person.objects.filter(lat__gt=float(me.lat)-radius).filter(lat__lt=float(me.lat)+radius).filter(lon__gt=float(me.lon)-lonrad).filter(lon__lt=float(me.lon)+lonrad).filter(year=year)
	elif gender != 'either' and year == 0:
		p = Person.objects.filter(lat__gt=float(me.lat)-radius).filter(lat__lt=float(me.lat)+radius).filter(lon__gt=float(me.lon)-lonrad).filter(lon__lt=float(me.lon)+lonrad).filter(gender=gender)
	else :
		p = Person.objects.filter(lat__gt=float(me.lat)-radius).filter(lat__lt=float(me.lat)+radius).filter(lon__gt=float(me.lon)-lonrad).filter(lon__lt=float(me.lon)+lonrad).filter(gender=gender).filter(year=year)

	locs = []
	people = []

        # filter the houses, too
	h = House.objects.filter(lat__gt=float(me.lat)-radius).filter(lat__lt=float(me.lat)+radius).filter(lon__gt=float(me.lon)-lonrad).filter(lon__lt=float(me.lon)+lonrad)

	p = list(p)
	h = list(h)

        # do we want to show people or houses?
	if (hp == 'People and Housing'):
		p = p + h
	elif (hp == 'Housing Only'):
		p = h

        # find overlaps
	for person in p:
		mylength = me.end - me.start
		personlength = person.end - person.start

		if me.start < person.start:
			startdiff = person.start - me.start
			overlapTime = min(mylength-startdiff, personlength)
		else :
			startdiff = me.start - person.start
			overlapTime = min(personlength-startdiff, mylength)
		if overlapTime.days > olap:
			people.append(person)

        # add self to list
	if not people or me not in people:
		people.append(me)

	for p1 in people:
                # if it's a person, then display accordingly
		if (isinstance(p1, Person)):
			f = True
			isSelf = False
			if (p1.netid == currentNetid):
				isSelf = True
			if (me.friends.filter(netid=p1.netid)):
				f = False
			t = get_template('buttonfill.html')
			html = t.render(Context({'person':p1, 'add':f, 'isSelf':isSelf}))
			locs.append({'lat':str(p1.lat), 'lon':str(p1.lon), 'netid':p1.netid, 'html':html, 'type':'person', 'user':currentNetid})
                # not a person--actually a house. Display accordingly
		else:
			f = True
			if (me.myhouses.filter(id=p1.id)):
				f = False
			t = get_template('housefill.html')
			html = t.render(Context({'house':p1, 'add':f}))
			locs.append({'lat':str(p1.lat), 'lon':str(p1.lon), 'html':html, 'type':'house', 'id':p1.id})
	if not (hp == 'Housing Only'):
		locs.append({'lat':str(me.lat), 'lon':str(me.lon),})
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")
	return HttpResponse(json.dumps(locs), mimetype='application/json; charset=UTF-8')

# add a person to your talk list
@login_required
def meet_person(request):
	currentNetid = request.user.username

        # who to add?
	addNetid = ''
	if request.POST:
		if 'netid' in request.POST:
			addNetid = request.POST['netid']

	me = Person.objects.get(netid=currentNetid)
	r = {'result':'success'}
	html = ''

        # you've already added this person!
	if (me.friends.filter(netid=addNetid)):
		r['result'] = 'already there'

        # you can't add yourself
        elif (currentNetid == addNetid):
                p1 = Person.objects.get(netid=addNetid)
                t = get_template('buttonfill.html')
                html = t.render(Context({'person':p1, 'add':True, 'isSelf':True}))

        # add the person
	else:
		p1 = Person.objects.get(netid=addNetid)
		me.friends.add(p1)
		t = get_template('buttonfill.html')
		html = t.render(Context({'person':p1, 'add':False, 'isSelf':False}))

        # render everything and return
	r['html'] = html
	t = get_template('tablefill.html')
	friends = me.friends.all()
	table = t.render(Context({'friend_list':friends, 'me':me}))
	r['table'] = table
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")
	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')

# add a house you're interested in to your housing list
@login_required
def meet_house(request):
	currentNetid = request.user.username

        # which house to add?
	addHid = ''
	if request.POST:
		if 'house_id' in request.POST:
			addHid = request.POST['house_id']

	me = Person.objects.get(netid=currentNetid)
	r = {'result':'success'}
	html = ''

        # you've already added this house
	if (me.myhouses.filter(id=addHid)):
		r['result'] = 'already there'

        # add the house
	else:
		h = House.objects.get(id=addHid)
		me.myhouses.add(h)
		t = get_template('housefill.html')
		html = t.render(Context({'house':h, 'add':False}))

        # render everything and return, throwing errors if necessary
	r['html'] = html
	t = get_template('myhousetablefill.html')
	myhouses = me.myhouses.all()
	table = t.render(Context({'my_houses':myhouses, 'me':me}))
	r['table'] = table
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")
	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')

# remove a person from your talk list
@login_required
def remove_person(request):
	currentNetid = request.user.username

        # who is being removed?
	remNetid = ''
	rtype = 'meet'
	if request.POST:
		if 'netid' in request.POST:
			remNetid = request.POST['netid']

        # get info about user and removee
	me = Person.objects.get(netid=currentNetid)
	p1 = Person.objects.get(netid=remNetid)

        # remove from friends list
	me.friends.remove(p1)

        # render everything and return, throwing errors if necessary
	friends = me.friends.all()
	t = get_template('tablefill.html')
	table = t.render(Context({'friend_list':friends, 'me':me}))
	r = {'table':table}
	t = get_template('buttonfill.html')
	html = t.render(Context({'person':p1, 'add':True}))
	r['html'] = html
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")
	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')

# remove a house from your interested housing list
@login_required
def remove_house(request):
	currentNetid = request.user.username

        # which house to remove?
	remHid = ''
	rtype = 'meet'
	if request.POST:
		if 'house_id' in request.POST:
			remHid = request.POST['house_id']

        # get info baout user and the house
	me = Person.objects.get(netid=currentNetid)
	h = House.objects.get(id=remHid)

        # remove the house
	me.myhouses.remove(h)
	me.save()

        # render, throw errors if needed, and return
	myhouses = me.myhouses.all()
	t = get_template('myhousetablefill.html')
	table = t.render(Context({'my_houses':myhouses, 'me':me}))
	r = {'table':table}
	t = get_template('housefill.html')
	html = t.render(Context({'house':h, 'add':True}))
	r['html'] = html
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")
	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')

# remove a house that you're managing
@login_required
def remove_managed_house(request):
	currentNetid = request.user.username

        # which house?
	remHid = ''
	rtype = 'meet'
	if request.POST:
		if 'house_id' in request.POST:
			remHid = request.POST['house_id']

        # get info about user and house
	me = Person.objects.get(netid=currentNetid)
	h = House.objects.get(id=remHid)

        # delete the house
	me.houses.remove(h)
	me.save();
	h.delete();

        # render, throw errors if needed, and return
	houses = me.houses.all()
	t = get_template('managehousetablefill.html')
	table = t.render(Context({'house_list':houses}))
	r = {'table':table}
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")
	return HttpResponse(json.dumps(r), mimetype='application/json; charset=UTF-8')

# add a new house that you're managing
@login_required
def add_house(request):
        # get info about current user
	currentNetid = request.user.username
	me = Person.objects.get(netid=currentNetid)

        # handle the request
	if request.method == 'POST':
                # the form
		if 'type' in request.POST:
			t = get_template('addhouse.html')
			hf = HouseForm();
			html = t.render(RequestContext(request, {'form': hf}))
			data = {'html':html}
			return HttpResponse(json.dumps(data), content_type = "application/json")
                # process the form
		else:
			hf = HouseForm(request.POST)

                        # is the form valid?
			if hf.is_valid():
				cd = hf.cleaned_data

                                # create new House object
				h = House(name = cd['name'], lat = cd['lat_h'], lon = cd['lon_h'], start = cd['hstart'],
					end=cd['hend'], contact_email = cd['contact_email'],
					description = cd['description'])

                                # save the object and add it to user's list of houses
				h.save()
				me.houses.add(h)
				me.save()

                                # render and return
				t = get_template('addhouse.html')
				html = t.render(RequestContext(request, {'form': hf}))
				t = get_template('managehousetablefill.html')
				houses = me.houses.all()
				mhtfhtml = t.render(RequestContext(request, {'house_list': houses}))
				t = get_template('myhousetablefill.html')
				myhouses = me.myhouses.all()
				myhtfhtml = t.render(RequestContext(request, {'my_houses': myhouses, 'me':me}))

				data = {'success':'true', 'html':html, 'mhtfhtml':mhtfhtml, 'myhtfhtml':myhtfhtml}
				return HttpResponse(json.dumps(data), content_type = "application/json")

			else:
				hf.errors['lat_h'] = hf.error_class()

			t = get_template('addhouse.html')
			html = t.render(RequestContext(request, {'form': hf}))

			data = {'success':'false', 'html':html}
			return HttpResponse(json.dumps(data), content_type = "application/json")
	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")

# edit a house that the user manages
@login_required
def edit_house(request):
        # get user
	currentNetid = request.user.username
	me = Person.objects.get(netid=currentNetid)

        # handle the request
	if request.method == 'POST':
                # the edit form
		if 'type' in request.POST:
			t = get_template('edithouse.html')
			if 'hid' in request.POST:
				hid = request.POST['hid']
				h = House.objects.get(id=hid)
				inData = model_to_dict(h)
				inData['hid'] = h.id
				hf = HouseForm(initial=inData)
				html = t.render(RequestContext(request, {'form': hf}))
				data = {'html': html}
				return HttpResponse(json.dumps(data), content_type = "application/json")
			else:
				hf = HouseForm()
				html = t.render(RequestContext(request, {'form': hf}))
				data = {'html': html}
				return HttpResponse(json.dumps(data), content_type = "application/json")
                # process the form
		else:
			hf = HouseForm(request.POST)

                        # is the form valid?
			if hf.is_valid():
                                # clean the data
				cd = hf.cleaned_data

                                # get the house that's being edited
				h = House.objects.get(id=cd['hid'])

                                # set the new vaues
				h.name = cd['name']
				h.lat = cd['lat_h']
				h.lon = cd['lon_h']
				h.start = cd['hstart']
				h.end=cd['hend']
				h.contact_email = cd['contact_email']
				h.description = cd['description']

				h.save()

                                # render and return
				t = get_template('edithouse.html')
				html = t.render(RequestContext(request, {'form': hf}))
				t = get_template('managehousetablefill.html')
				houses = me.houses.all()
				mhtfhtml = t.render(RequestContext(request, {'house_list': houses}))
				t = get_template('myhousetablefill.html')
				myhouses = me.myhouses.all()
				myhtfhtml = t.render(RequestContext(request, {'my_houses': myhouses, 'me':me}))

				data = {'success':'true', 'html':html, 'mhtfhtml':mhtfhtml, 'myhtfhtml':myhtfhtml}
				return HttpResponse(json.dumps(data), content_type = "application/json")

                        # the form is not valid
			else:
				hf.errors['lat_h'] = hf.error_class()

			t = get_template('edithouse.html')
			html = t.render(RequestContext(request, {'form': hf}))


			data = {'success':'false', 'html':html}
			return HttpResponse(json.dumps(data), content_type = "application/json")

	if not request.POST:
		return HttpResponseNotFound("<h1>404 Error: Not Found</h1>")

# displays the product page
def product_page(request):
	return render(request, 'product_page.html')
