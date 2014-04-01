from django.conf.urls import *
from django.contrib import admin
admin.autodiscover()

#regex to view function mapping
urlpatterns = patterns('roommeet.views',
    url(r'^$', 'meet'),
    url(r'^profile/$', 'profile'),
    url(r'^meet/$', 'meet'),
    url(r'^talk/$', 'talk'),
    url(r'^/$', 'talk'),
    url(r'^get_marks/$', 'get_marks'),
    url(r'^user/$', 'user'),
    url(r'^admin/', include(admin.site.urls)),
)