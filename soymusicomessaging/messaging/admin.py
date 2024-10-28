from django.contrib import admin
from .models import CustomUser, Message

admin.site.register(CustomUser)
admin.site.register(Message)
