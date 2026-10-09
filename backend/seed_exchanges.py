import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, BloodExchangeRequest, BloodInventory

hospitals = User.objects.filter(role=User.Role.HOSPITAL)
print(f"Found {hospitals.count()} hospitals")

if hospitals.exists():
    shaukat = hospitals.filter(username__icontains='shaukat').first() or hospitals.first()
    mayo = hospitals.filter(username__icontains='mayo').first() or hospitals.last()

    # Clear old or add sample exchanges
    BloodExchangeRequest.objects.get_or_create(
        patient_name="Zubair Ahmed",
        attendant_name="Kamran Ahmed (Brother)",
        contact_number="0300-8451234",
        hospital=shaukat,
        required_blood_group="B+",
        offered_blood_group="A+",
        units=1,
        status=BloodExchangeRequest.Status.PENDING,
        urgency="CRITICAL",
        notes="Patient in emergency surgery at Shaukat Khanum. Brother giving 1 unit of A+ in immediate exchange for B+."
    )

    BloodExchangeRequest.objects.get_or_create(
        patient_name="Sana Malik",
        attendant_name="Tariq Malik (Father)",
        contact_number="0321-4567890",
        hospital=shaukat,
        required_blood_group="O-",
        offered_blood_group="O+",
        units=2,
        status=BloodExchangeRequest.Status.APPROVED,
        urgency="HIGH",
        notes="Thalassemia patient needs O- urgently. Family offering 2 units of O+ blood for exchange."
    )

    if mayo and mayo != shaukat:
        BloodExchangeRequest.objects.get_or_create(
            patient_name="Bilal Shah",
            attendant_name="Hamza Shah (Cousin)",
            contact_number="0333-9876543",
            hospital=mayo,
            required_blood_group="AB-",
            offered_blood_group="B+",
            units=1,
            status=BloodExchangeRequest.Status.PENDING,
            urgency="CRITICAL",
            notes="Accident case. Replacing with B+ donor."
        )

    print(f"Total Blood Exchanges now: {BloodExchangeRequest.objects.count()}")
