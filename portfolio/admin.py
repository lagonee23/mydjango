from django.contrib import admin
from .models import Assets

# Register your models here.
class ExampleModel(admin.ModelAdmin):
    pass

admin.site.register(Assets)