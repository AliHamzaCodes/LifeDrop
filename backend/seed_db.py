import os
import django
import sys
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Profile, BloodRequest

User = get_user_model()

SEED_DONORS = [
  { 'username': 'ahmed_khan', 'name': 'Ahmed Khan', 'email': 'ahmed@example.com', 'blood_group': 'O+', 'city': 'Lahore', 'phone': '0300-1112233', 'donations': 14, 'lat': 31.5204, 'lng': 74.3587 },
  { 'username': 'fatima_noor', 'name': 'Fatima Noor', 'email': 'fatima@example.com', 'blood_group': 'O+', 'city': 'Lahore', 'phone': '0321-4455667', 'donations': 8, 'lat': 31.5504, 'lng': 74.3887 },
  { 'username': 'hassan_ali', 'name': 'Hassan Ali', 'email': 'hassan@example.com', 'blood_group': 'A+', 'city': 'Karachi', 'phone': '0333-7788990', 'donations': 11, 'lat': 24.8607, 'lng': 67.0011 },
  { 'username': 'ayesha_siddiqui', 'name': 'Ayesha Siddiqui', 'email': 'ayesha@example.com', 'blood_group': 'B+', 'city': 'Islamabad', 'phone': '0345-1122334', 'donations': 6, 'lat': 33.6844, 'lng': 73.0479 },
  { 'username': 'usman_tariq', 'name': 'Usman Tariq', 'email': 'usman@example.com', 'blood_group': 'AB+', 'city': 'Rawalpindi', 'phone': '0312-5566778', 'donations': 17, 'lat': 33.5959, 'lng': 73.0538 },
  { 'username': 'sana_qureshi', 'name': 'Sana Qureshi', 'email': 'sana@example.com', 'blood_group': 'AB-', 'city': 'Multan', 'phone': '0301-6677889', 'donations': 12, 'lat': 30.1978, 'lng': 71.4697 },
]

SEED_REQUESTS = [
  {
    'patient_username': 'sara_ahmed', 'patient_name': 'Sara Ahmed', 'email': 'sara@example.com',
    'bloodGroup': 'O+', 'hospital': 'Mayo Hospital, Lahore', 'units': 2, 'urgency': 'CRITICAL', 'city': 'Lahore'
  },
  {
    'patient_username': 'danish_raza', 'patient_name': 'Danish Raza', 'email': 'danish@example.com',
    'bloodGroup': 'B+', 'hospital': 'Holy Family Hospital, Rawalpindi', 'units': 1, 'urgency': 'HIGH', 'city': 'Rawalpindi'
  },
  {
    'patient_username': 'zain_malik', 'patient_name': 'Zain Malik', 'email': 'zain@example.com',
    'bloodGroup': 'A-', 'hospital': 'Aga Khan Hospital, Karachi', 'units': 3, 'urgency': 'ROUTINE', 'city': 'Karachi'
  }
]

def run():
    print("Seeding Users and Profiles (Donors)...")
    for d in SEED_DONORS:
        # Create User
        user, created = User.objects.get_or_create(username=d['username'], defaults={
            'email': d['email'],
            'first_name': d['name'].split()[0],
            'last_name': d['name'].split()[-1] if len(d['name'].split()) > 1 else '',
            'role': User.Role.DONOR
        })
        if created:
            user.set_password('password123')
            user.save()
            print(f"  Created user: {user.username}")
        
        # Profile might have been created by signal or serializer in normal flow, but let's check
        profile, p_created = Profile.objects.get_or_create(user=user)
        profile.blood_group = d['blood_group']
        profile.city = d['city']
        profile.phone_number = d['phone']
        profile.latitude = d['lat']
        profile.longitude = d['lng']
        profile.donations_made = d['donations']
        profile.save()

    print("Seeding Blood Requests...")
    for r in SEED_REQUESTS:
        # Create Patient User
        patient, created = User.objects.get_or_create(username=r['patient_username'], defaults={
            'email': r['email'],
            'first_name': r['patient_name'].split()[0],
            'last_name': r['patient_name'].split()[-1] if len(r['patient_name'].split()) > 1 else '',
            'role': User.Role.PATIENT
        })
        if created:
            patient.set_password('password123')
            patient.save()
            print(f"  Created patient: {patient.username}")
            
        BloodRequest.objects.get_or_create(
            patient=patient,
            required_blood_group=r['bloodGroup'],
            hospital_name=r['hospital'],
            city=r['city'],
            units_needed=r['units'],
            urgency=r['urgency'],
            status=BloodRequest.Status.PENDING
        )
    print("Done seeding data.")

if __name__ == '__main__':
    run()
