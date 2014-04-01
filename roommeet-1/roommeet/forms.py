from django import forms

class LatLonForm(forms.Form):
    lat = forms.DecimalField(max_digits=13, decimal_places=10)
    lon = forms.DecimalField(max_digits=13, decimal_places=10)
