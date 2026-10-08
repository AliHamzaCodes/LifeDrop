import os
import sys

backend_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(backend_path, '..', 'backend')))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Profile, BloodInventory

hospitals_data = [
    {
        "username": "mayo_hospital",
        "email": "bloodbank@mayohospital.edu.pk",
        "hospital_name": "Mayo Hospital Blood Bank",
        "city": "Lahore",
        "address": "Hospital Road, Anarkali Bazaar, Lahore",
        "phone_number": "+923001122334",
        "helpline": "042-99200148",
        "license_number": "PB-LHR-9821",
        "lat": 31.5725,
        "lng": 74.3169,
        "stock": {
            "A+": 14, "A-": 4, "B+": 20, "B-": 2, "AB+": 8, "AB-": 1, "O+": 25, "O-": 3
        }
    },
    {
        "username": "aga_khan_karachi",
        "email": "bloodbank@aku.edu",
        "hospital_name": "Aga Khan University Hospital Blood Bank",
        "city": "Karachi",
        "address": "National Stadium Rd, Aga Khan Hospital Complex, Karachi",
        "phone_number": "+923212233445",
        "helpline": "021-111911911",
        "license_number": "SB-KHI-4412",
        "lat": 24.8924,
        "lng": 67.0747,
        "stock": {
            "A+": 18, "A-": 6, "B+": 22, "B-": 5, "AB+": 9, "AB-": 2, "O+": 32, "O-": 7
        }
    },
    {
        "username": "pims_islamabad",
        "email": "bloodbank@pims.gov.pk",
        "hospital_name": "PIMS Regional Blood Center",
        "city": "Islamabad",
        "address": "Sector G-8/3, Islamabad",
        "phone_number": "+923335566778",
        "helpline": "051-9261170",
        "license_number": "ICT-ISB-1102",
        "lat": 33.7027,
        "lng": 73.0456,
        "stock": {
            "A+": 11, "A-": 2, "B+": 16, "B-": 3, "AB+": 4, "AB-": 0, "O+": 18, "O-": 2
        }
    },
    {
        "username": "shaukat_khanum",
        "email": "bloodbank@skm.org.pk",
        "hospital_name": "Shaukat Khanum Memorial Blood Bank",
        "city": "Lahore",
        "address": "7A Block R-3, Johar Town, Lahore",
        "phone_number": "+923018899001",
        "helpline": "042-35905000",
        "license_number": "PB-LHR-7723",
        "lat": 31.4707,
        "lng": 74.2831,
        "stock": {
            "A+": 9, "A-": 5, "B+": 12, "B-": 4, "AB+": 7, "AB-": 2, "O+": 15, "O-": 4
        }
    },
    {
        "username": "holy_family",
        "email": "bloodbank@holyfamily.gov.pk",
        "hospital_name": "Holy Family Hospital Blood Center",
        "city": "Rawalpindi",
        "address": "Satellite Town, Rawalpindi",
        "phone_number": "+923126677889",
        "helpline": "051-9290321",
        "license_number": "PB-RWP-3341",
        "lat": 33.6339,
        "lng": 73.0683,
        "stock": {
            "A+": 7, "A-": 1, "B+": 10, "B-": 2, "AB+": 3, "AB-": 1, "O+": 8, "O-": 1
        }
    },
    {
        "username": "nishtar_multan",
        "email": "bloodbank@nishtar.edu.pk",
        "hospital_name": "Nishtar Hospital Regional Blood Bank",
        "city": "Multan",
        "address": "Nishtar Road, Multan",
        "phone_number": "+923457788990",
        "helpline": "061-9200231",
        "license_number": "PB-MLT-5519",
        "lat": 30.1887,
        "lng": 71.4503,
        "stock": {
            "A+": 12, "A-": 3, "B+": 14, "B-": 3, "AB+": 5, "AB-": 0, "O+": 19, "O-": 3
        }
    }
]

for h_data in hospitals_data:
    user, created = User.objects.get_or_create(
        username=h_data['username'],
        defaults={
            'email': h_data['email'],
            'role': User.Role.HOSPITAL,
            'is_verified': True
        }
    )
    if not created:
        user.email = h_data['email']
        user.role = User.Role.HOSPITAL
        user.is_verified = True
        user.save()
    user.set_password('Hospital@1234')
    user.save()

    profile, _ = Profile.objects.get_or_create(user=user)
    profile.hospital_name = h_data['hospital_name']
    profile.city = h_data['city']
    profile.address = h_data['address']
    profile.phone_number = h_data['phone_number']
    profile.helpline = h_data['helpline']
    profile.license_number = h_data['license_number']
    profile.latitude = h_data['lat']
    profile.longitude = h_data['lng']
    profile.save()

    for bg, units in h_data['stock'].items():
        BloodInventory.objects.update_or_create(
            hospital=user,
            blood_group=bg,
            defaults={'units_available': units}
        )

print(f"Successfully seeded {len(hospitals_data)} hospital blood banks.")
