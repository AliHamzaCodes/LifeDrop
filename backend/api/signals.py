from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import BloodRequest, Profile

@receiver(post_save, sender=BloodRequest)
def send_urgency_alerts(sender, instance, created, **kwargs):
    if created and instance.urgency == BloodRequest.Urgency.CRITICAL:
        # Find matching donors in the same city
        matching_donors = Profile.objects.filter(
            city__iexact=instance.city,
            blood_group=instance.required_blood_group,
            user__role='DONOR'
        )

        from django.core.mail import send_mail
        from django.conf import settings
        
        for donor in matching_donors:
            if donor.user.email:
                subject = f"URGENT: {instance.required_blood_group} Blood Required in {instance.city}"
                message = f"Dear {donor.user.username},\n\nA critical blood request for {instance.required_blood_group} has been posted at {instance.hospital_name} in {instance.city}. If you are able to donate, please log in to LifeStream immediately.\n\nThank you,\nLifeStream Team"
                
                try:
                    send_mail(
                        subject,
                        message,
                        settings.EMAIL_HOST_USER,
                        [donor.user.email],
                        fail_silently=True,
                    )
                    print(f"*** ALERT: Email sent to {donor.user.email} for CRITICAL need! ***")
                except Exception as e:
                    print(f"*** Failed to send email to {donor.user.email}: {e} ***")

        # Feature 7: Social Media Auto-Poster (Mock)
        tweet = f"URGENT: {instance.required_blood_group} Blood Required at {instance.hospital_name}, {instance.city}. Contact us on LifeDrop immediately if you can help! #BloodDonation #{instance.city} #SaveALife"
        print("================================================================")
        print("TWEETING TO @LifeDrop_PK:")
        print(tweet)
        print("================================================================")
