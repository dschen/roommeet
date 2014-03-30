#render shortcut
from django.shortcuts import render

#responses, httpresponse not necessary with render shortcut
from django.http import Http404, HttpResponse
#templates and contexts, not necessary with render shortcut
from django.template.loader import get_template
from django.template import Context

import datetime



#function to generate html and return
def hello(request):
    return HttpResponse("Hello world")

def current_datetime_long(request):
    now = datetime.datetime.now()

    t = get_template('current_datetime.html')
    html = t.render(Context({'current_date': now}))
    return HttpResponse(html)

def current_datetime(request):
    now = datetime.datetime.now()
    return render(request, 'current_datetime.html', {'current_date': now})

#offset comes as argument from urls.py
def hours_ahead(request, offset):
    try:
        offset = int(offset)
    except ValueError:
        raise Http404()
    dt = datetime.datetime.now() + datetime.timedelta(hours=offset)
    return render(request, 'hours_ahead.html', {'offset': offset, 'time': dt})

def boot_home(request):
	return render(request, 'boot_home.html')

