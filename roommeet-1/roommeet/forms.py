from django import forms

class ProfileForm(forms.Form):
	first_name = forms.CharField(max_length=50)
	last_name = forms.CharField(max_length=50)
	cyear = forms.RegexField(regex=r'\d\d\d\d', label='Year')
	company = forms.CharField(max_length=100)
	start = forms.DateField()
	end = forms.DateField()
	desired = forms.CharField(max_length=100)
	lat_s = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)
	lon_s = forms.DecimalField(max_digits=13, decimal_places=10, widget=forms.HiddenInput)