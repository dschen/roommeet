from django.db import models

class House(models.Model):

	lat = models.DecimalField(max_digits=13, decimal_places=10, null=True)
	lon = models.DecimalField(max_digits=13, decimal_places=10, null=True)
	start = models.DateField(blank=True, null=True)
	end = models.DateField(blank=True, null=True)
	contact_email = models.EmailField(max_length=50)
	description = models.CharField(max_length=1000)

	def __unicode__(self):
		return u'%s' % (self.contact_email)