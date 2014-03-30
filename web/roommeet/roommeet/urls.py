from django.conf.urls import patterns, include, url
from roommeet.views import hello, current_datetime, hours_ahead, boot_home

#regex to view function mapping
urlpatterns = patterns('',
    url(r'^hello/$', hello),
    url(r'^time/$', current_datetime),
    #parentheset around parts of regex pass as string arguments
    url(r'^time/plus/(\d{1,2})/$', hours_ahead),
    url(r'^boot/$', boot_home),
)