import os
import sys

# Ensure backend root is on sys.path
backend_path = os.path.dirname(os.path.abspath(__file__))
# If script is in scratch/, backend is ../backend
sys.path.insert(0, os.path.abspath(os.path.join(backend_path, '..', 'backend')))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Profile, User

# Ensure users are verified so contact options are open
User.objects.filter(role=User.Role.DONOR).update(is_verified=True)

for p in Profile.objects.all():
    if not p.phone_number:
        p.phone_number = '+923001234567'
    else:
        # Normalize to +923xxxxxxxxx
        clean = p.phone_number.replace('-', '').replace(' ', '').replace('+', '')
        if clean.startswith('0092'):
            clean = clean[4:]
        elif clean.startswith('92'):
            clean = clean[2:]
        elif clean.startswith('0'):
            clean = clean[1:]
        p.phone_number = f"+92{clean}"
    p.save()

print("Updated Profiles:")
for p in Profile.objects.all():
    print(f"{p.user.username}: {p.phone_number} (verified={p.user.is_verified})")
