from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import BloodRequest

class Command(BaseCommand):
    help = 'Expires old pending blood requests based on urgency.'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        expired_count = 0

        # CRITICAL requests older than 24 hours
        critical_threshold = now - timedelta(hours=24)
        critical_requests = BloodRequest.objects.filter(
            status=BloodRequest.Status.PENDING,
            urgency=BloodRequest.Urgency.CRITICAL,
            created_at__lt=critical_threshold
        )
        for req in critical_requests:
            req.status = BloodRequest.Status.EXPIRED
            req.save()
            expired_count += 1
            self.stdout.write(f"Expired CRITICAL request {req.id}")

        # HIGH requests older than 48 hours (Optional addition)
        high_threshold = now - timedelta(hours=48)
        high_requests = BloodRequest.objects.filter(
            status=BloodRequest.Status.PENDING,
            urgency=BloodRequest.Urgency.HIGH,
            created_at__lt=high_threshold
        )
        for req in high_requests:
            req.status = BloodRequest.Status.EXPIRED
            req.save()
            expired_count += 1
            self.stdout.write(f"Expired HIGH request {req.id}")

        # ROUTINE requests older than 7 days
        routine_threshold = now - timedelta(days=7)
        routine_requests = BloodRequest.objects.filter(
            status=BloodRequest.Status.PENDING,
            urgency=BloodRequest.Urgency.ROUTINE,
            created_at__lt=routine_threshold
        )
        for req in routine_requests:
            req.status = BloodRequest.Status.EXPIRED
            req.save()
            expired_count += 1
            self.stdout.write(f"Expired ROUTINE request {req.id}")

        self.stdout.write(self.style.SUCCESS(f'Successfully expired {expired_count} requests.'))
