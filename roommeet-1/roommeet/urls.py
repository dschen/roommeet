from django.conf.urls import *
from django.contrib import admin

##threaded messages:
from django.conf.urls import *
from django.views.generic import RedirectView
from threaded_messages.views import *


admin.autodiscover()


#regex to view function mapping
urlpatterns = patterns('roommeet.views',
    url(r'^$', 'meet'),
    url(r'^profile/$', 'profile'),
    url(r'^meet/$', 'meet'),
    url(r'^talk/$', 'talk'),
    url(r'^/$', 'talk'),
    url(r'^get_marks/$', 'get_marks'),
    url(r'^meet_person/$', 'meet_person'),
    url(r'^remove_person/$', 'remove_person'),
    url(r'^get_list/$', 'get_list'),
    url(r'^user/$', 'user'),
    url(r'^admin/', include(admin.site.urls)),
)

#CAS
urlpatterns += patterns('',
    url(r'^accounts/login/$', 'django_cas.views.login'),
    url(r'^accounts/logout/$', 'django_cas.views.logout'),
    )

#threaded-messages
urlpatterns += patterns('threaded_messages.views',
    url(r'^talk/chat/$', RedirectView.as_view(url='inbox/')),
    url(r'^search/$', search, name='messages_search'),
    url(r'^inbox/$', inbox, name='messages_inbox'),
    url(r'^outbox/$', outbox, name='messages_outbox'),
    url(r'^compose/$', compose, name='messages_compose'),
    url(r'^compose/(?P<recipient>[\+\w]+)/$', compose, name='messages_compose_to'),
    url(r'^view/(?P<thread_id>[\d]+)/$', view, name='messages_detail'),
    url(r'^delete/(?P<thread_id>[\d]+)/$', delete, name='messages_delete'),
    url(r'^undelete/(?P<thread_id>[\d]+)/$', undelete, name='messages_undelete'),
    url(r'^batch-update/$', batch_update, name='messages_batch_update'),
    url(r'^trash/$', trash, name='messages_trash'),
    
    url(r"^recipient-search/$", recipient_search, name="recipient_search"),
    url(r'^message-reply/(?P<thread_id>[\d]+)/$', message_ajax_reply, name="message_reply"),
    
    # modal composing 
    url(r'^modal-compose/(?P<recipient>[\w.+-_]+)/$', compose, {
                            "template_name":"django_messages/modal_compose.html",
                            "form_class": ComposeForm
                        }, name='modal_messages_compose_to'),
    
    url(r'^modal-compose/$', compose, {
                            "template_name":"django_messages/modal_compose.html",
                            "form_class": ComposeForm
                        }, name='modal_messages_compose'),
    )
