from django import forms

class ProfileForm(forms.Form):
	first_name = forms.CharField(max_length=50)
	last_name = forms.CharField(max_length=50)
	cyear = forms.RegexField(r'\d\d\d\d')
	company = forms.CharField(max_length=100)
	lat = forms.DecimalField(max_digits=13, decimal_places=10)
	lon = forms.DecimalField(max_digits=13, decimal_places=10)
