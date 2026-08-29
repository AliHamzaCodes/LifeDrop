from rest_framework import serializers
from .models import User, Profile, BloodRequest, Donation, Campaign, BloodInventory

class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user_id', 'name', 'avatar', 'blood_group', 'phone_number', 'city', 'latitude', 'longitude', 'donations_made', 'badge', 'last_donation_date']
        read_only_fields = ['id', 'user_id', 'name', 'donations_made', 'badge', 'last_donation_date']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'profile', 'is_verified']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        # Update user fields
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data is not None:
            profile = instance.profile
            for attr, value in profile_data.items():
                # Prevent changing blood group once it's set
                if attr == 'blood_group' and profile.blood_group:
                    continue
                setattr(profile, attr, value)
            profile.save()
            
        return instance

class BloodRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    patient_phone = serializers.CharField(source='patient.profile.phone_number', read_only=True)
    accepted_donor_details = serializers.SerializerMethodField()
    is_patient_verified = serializers.SerializerMethodField()
    
    class Meta:
        model = BloodRequest
        fields = [
            'id', 'patient', 'patient_name', 'patient_phone', 'required_blood_group', 
            'hospital_name', 'city', 'latitude', 'longitude', 'units_needed', 'units_fulfilled', 'status', 'urgency', 'created_at',
            'accepted_donors', 'accepted_donor_details', 'donor_lat', 'donor_lng', 'tracking_active', 'is_patient_verified'
        ]
        read_only_fields = ['patient', 'status']

    def get_is_patient_verified(self, obj):
        return obj.patient.is_verified

    def get_accepted_donor_details(self, obj):
        donors = []
        for donor in obj.accepted_donors.all():
            if hasattr(donor, 'profile'):
                donors.append({
                    "id": donor.id,
                    "name": donor.username,
                    "phone": donor.profile.phone_number
                })
        return donors

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.username', read_only=True)
    hospital_name = serializers.CharField(source='hospital.username', read_only=True)
    city = serializers.SerializerMethodField()
    urgency = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = ['id', 'donor', 'donor_name', 'blood_request', 'hospital', 'hospital_name', 'date_donated', 'city', 'urgency', 'units']
        read_only_fields = ['donor']

    def get_city(self, obj):
        return obj.blood_request.city if obj.blood_request else ""

    def get_urgency(self, obj):
        return obj.blood_request.urgency if obj.blood_request else "ROUTINE"

    def get_units(self, obj):
        return obj.blood_request.units_needed if obj.blood_request else 1

class CampaignSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['organizer', 'created_at']

class BloodInventorySerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.username', read_only=True)
    
    class Meta:
        model = BloodInventory
        fields = ['id', 'hospital', 'hospital_name', 'blood_group', 'units_available', 'last_updated']
        read_only_fields = ['hospital']
