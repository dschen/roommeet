#render shortcut
from django.shortcuts import render

#responses, httpresponse not necessary with render shortcut
from django.http import Http404, HttpResponse
#templates and contexts, not necessary with render shortcut
from django.template.loader import get_template
from django.template import Context

import datetime



#function to generate html and return

def meet(request):
	return render(request, 'meet.html')

