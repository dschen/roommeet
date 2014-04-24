from django import forms
from django.forms import ModelForm
from django.contrib.admin import widgets
from people.models import Person

from functools import partial
DateInput = partial(forms.DateInput, {'class': 'datepicker'}, format='%m/%d/%Y')

class ProfileForm(forms.Form):
	first_name = forms.CharField(max_length=50)
	last_name = forms.CharField(max_length=50)
	year = forms.RegexField(regex=r'\d\d\d\d', label='Year')
	company = forms.CharField(max_length=100)
	start = forms.DateField(widget=DateInput(), input_formats=('%m/%d/%Y',))
	end = forms.DateField(widget=DateInput(),  input_formats=('%m/%d/%Y',))
	choices = (('RM','Roommate'), ('FR','Friends'),)
	desired = forms.ChoiceField(choices=choices)
	lat_s = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)
	lon_s = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)