from django import forms
from django.forms import ModelForm
from django.contrib.admin import widgets
from people.models import Person
from houses.models import House

from functools import partial
DateInput = partial(forms.DateInput, {'class': 'datepicker'}, format='%m/%d/%Y')

class ProfileForm(forms.Form):
	first_name = forms.CharField(max_length=50)
	last_name = forms.CharField(max_length=50)
	gchoices = (('',''),('Male','Male'),('Female','Female'),('Decline','Decline to State'),)
	gender = forms.ChoiceField(choices=gchoices)
	year = forms.RegexField(regex=r'201[4-8]', label='Class Year')
	company = forms.CharField(max_length=100)
	start = forms.DateField(widget=DateInput(), input_formats=('%m/%d/%Y',))
	end = forms.DateField(widget=DateInput(),  input_formats=('%m/%d/%Y',))
	dchoices = (('',''),('Roommate','Roommate'), ('Friends','Friends'),)
	desired = forms.ChoiceField(choices=dchoices)
	lat_s = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)
	lon_s = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)

class HouseForm(forms.Form):

	name = forms.CharField(max_length=50, label='Contact Name')
	lat_h = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)
	lon_h = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)
	hstart = forms.DateField(widget=DateInput(), input_formats=('%m/%d/%Y',), label='Start')
	hend = forms.DateField(widget=DateInput(),  input_formats=('%m/%d/%Y',), label='End')
	contact_email = forms.EmailField(max_length=50)
	description = forms.CharField(max_length=1000, widget=forms.Textarea)	
	hid = forms.DecimalField(widget=forms.HiddenInput, required=False)