from django.db import models

class Person(models.Model):
	first_name = models.CharField(max_length=50, blank=True)
	last_name = models.CharField(max_length=50, blank=True)
	netid = models.CharField(max_length=50)
	lat = models.DecimalField(max_digits=13, decimal_places=10)
	lon = models.DecimalField(max_digits=13, decimal_places=10)
	friends = models.ManyToManyField("self", blank=True, symmetrical=False)
	company = models.CharField(max_length=50, blank=True)
	year = models.IntegerField(blank=True)
	start = models.DateField(blank=True, null=True)
	end = models.DateField(blank=True, null=True)
	desired = models.CharField(max_length=100, blank=True)

	def __unicode__(self):
		return u'%s %s' % (self.first_name,self.last_name)