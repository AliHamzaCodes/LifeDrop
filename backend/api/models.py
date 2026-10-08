from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        DONOR = 'DONOR', 'Donor'
        PATIENT = 'PATIENT', 'Patient'
        HOSPITAL = 'HOSPITAL', 'Hospital'

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.DONOR)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {self.role}"

class Profile(models.Model):
    class BloodGroup(models.TextChoices):
        A_POS = 'A+', 'A Positive'
        A_NEG = 'A-', 'A Negative'
        B_POS = 'B+', 'B Positive'
        B_NEG = 'B-', 'B Negative'
        AB_POS = 'AB+', 'AB Positive'
        AB_NEG = 'AB-', 'AB Negative'
        O_POS = 'O+', 'O Positive'
        O_NEG = 'O-', 'O Negative'

    class BadgeLevel(models.TextChoices):
        NONE = 'NONE', 'None'
        BRONZE = 'BRONZE', 'Bronze'
        SILVER = 'SILVER', 'Silver'
        GOLD = 'GOLD', 'Gold'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    blood_group = models.CharField(max_length=3, choices=BloodGroup.choices, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Gamification Features
    donations_made = models.IntegerField(default=0)
    badge = models.CharField(max_length=10, choices=BadgeLevel.choices, default=BadgeLevel.NONE)
    last_donation_date = models.DateField(null=True, blank=True)

    # Hospital Specific Fields
    hospital_name = models.CharField(max_length=255, blank=True, default='')
    address = models.TextField(blank=True, default='')
    helpline = models.CharField(max_length=50, blank=True, default='')
    license_number = models.CharField(max_length=100, blank=True, default='')

    def update_gamification(self):
        """Update badge based on donations made."""
        if self.donations_made >= 10:
            self.badge = self.BadgeLevel.GOLD
        elif self.donations_made >= 5:
            self.badge = self.BadgeLevel.SILVER
        elif self.donations_made >= 1:
            self.badge = self.BadgeLevel.BRONZE
        self.save()

    def __str__(self):
        return f"Profile of {self.user.username}"

class BloodRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        FULFILLED = 'FULFILLED', 'Fulfilled'
        CANCELLED = 'CANCELLED', 'Cancelled'
        EXPIRED = 'EXPIRED', 'Expired'

    class Urgency(models.TextChoices):
        ROUTINE = 'ROUTINE', 'Routine (Next week)'
        HIGH = 'HIGH', 'High (Today)'
        CRITICAL = 'CRITICAL', 'Critical (Within 2 hours)'

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests')
    required_blood_group = models.CharField(max_length=3, choices=Profile.BloodGroup.choices)
    hospital_name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    units_needed = models.IntegerField(default=1)
    units_fulfilled = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.ROUTINE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Live Tracking Features
    accepted_donors = models.ManyToManyField(User, related_name='accepted_requests', blank=True)
    donor_lat = models.FloatField(null=True, blank=True)
    donor_lng = models.FloatField(null=True, blank=True)
    tracking_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.urgency} Request for {self.required_blood_group} at {self.hospital_name}"

class Donation(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    blood_request = models.ForeignKey(BloodRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    hospital = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_donations', help_text="Hospital that verified the donation")
    date_donated = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Trigger gamification update on save
        profile = self.donor.profile
        profile.donations_made = Donation.objects.filter(donor=self.donor).count()
        profile.last_donation_date = self.date_donated.date()
        profile.update_gamification()

    def __str__(self):
        return f"Donation by {self.donor.username} on {self.date_donated.date()}"

class Campaign(models.Model):
    """Model for Blood Drives & NGO Campaigns"""
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=255)
    description = models.TextField()
    city = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    event_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} in {self.city}"

class BloodInventory(models.Model):
    """Feature 6: Hospital Blood Bank Module"""
    hospital = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inventory')
    blood_group = models.CharField(max_length=3, choices=Profile.BloodGroup.choices)
    units_available = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('hospital', 'blood_group')

    def __str__(self):
        return f"{self.blood_group} - {self.units_available} units at {self.hospital.username}"

class BloodExchangeRequest(models.Model):
    """Mutual Blood Replacement / Exchange Program (خون کا تبادلہ)"""
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Approved for Exchange'
        COMPLETED = 'COMPLETED', 'Completed & Exchanged'
        REJECTED = 'REJECTED', 'Rejected'

    patient_name = models.CharField(max_length=255)
    attendant_name = models.CharField(max_length=255, help_text="Family member or attendant donating blood")
    contact_number = models.CharField(max_length=30)
    hospital = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exchange_requests')
    required_blood_group = models.CharField(max_length=3, choices=Profile.BloodGroup.choices, help_text="Blood group patient needs")
    offered_blood_group = models.CharField(max_length=3, choices=Profile.BloodGroup.choices, help_text="Blood group attendant is donating in replacement")
    units = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    urgency = models.CharField(max_length=20, choices=BloodRequest.Urgency.choices, default=BloodRequest.Urgency.CRITICAL)
    notes = models.TextField(blank=True, default='')
    requester = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='my_exchange_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Exchange: {self.offered_blood_group} -> {self.required_blood_group} ({self.units} units) at {self.hospital.username}"

