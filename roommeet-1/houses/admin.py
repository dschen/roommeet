from django.contrib import admin

from people.models import Person


class PersonAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'netid')
    search_fields = ('first_name', 'last_name')
    list_filter = ('netid',)
    filter_horizontal = ('friends',)

admin.site.register(Person, PersonAdmin)
# Register your models here.
