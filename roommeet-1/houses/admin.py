from django.contrib import admin

from houses.models import House


class HouseAdmin(admin.ModelAdmin):
    list_display = ('contact_email', 'description',)
    search_fields = ('contact_email',)
    list_filter = ('contact_email',)

admin.site.register(House, HouseAdmin)
# Register your models here.
