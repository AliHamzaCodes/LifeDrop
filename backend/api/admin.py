from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, BloodRequest, Donation, Campaign

admin.site.register(User, UserAdmin)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'blood_group', 'city', 'phone_number')
    list_filter = ('blood_group', 'city')
    search_fields = ('user__username', 'user__email', 'city', 'phone_number')

@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ('patient', 'required_blood_group', 'hospital_name', 'city', 'status')
    list_filter = ('status', 'required_blood_group', 'city')
    search_fields = ('hospital_name', 'city')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor', 'blood_request', 'hospital', 'date_donated')
    list_filter = ('date_donated',)

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'city', 'event_date')
    list_filter = ('city', 'event_date')
