from django.conf.urls import *
from django.contrib import admin
admin.autodiscover()

#regex to view function mapping
urlpatterns = patterns('roommeet.views',
    url(r'^$', 'meet'),
    url(r'^admin/', include(admin.site.urls)),
)