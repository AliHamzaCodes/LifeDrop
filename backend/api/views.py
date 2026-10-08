import json
import base64
import io
import qrcode
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
import math

from .models import User, BloodRequest, Donation, Profile, Campaign, BloodInventory, BloodExchangeRequest
from .serializers import (
    UserSerializer, BloodRequestSerializer, DonationSerializer, 
    ProfileSerializer, CampaignSerializer, BloodInventorySerializer, HospitalSerializer,
    BloodExchangeRequestSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method in ['PATCH', 'PUT']:
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_avatar(self, request):
        if 'avatar' not in request.FILES:
            return Response({'detail': 'No avatar provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        profile.avatar = request.FILES['avatar']
        profile.save()
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

class DonorViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only endpoint for searching donors on the map/list."""
    queryset = Profile.objects.filter(user__role='DONOR')
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'slug'

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        if lookup_value and str(lookup_value).isdigit():
            obj = Profile.objects.filter(Q(id=lookup_value) | Q(user__id=lookup_value)).first()
            if obj:
                return obj
        return super().get_object()

    def get_queryset(self):
        # Feature 3: Smart Matching Algorithm (Priority System)
        qs = super().get_queryset()
        
        # Priority Algorithm: We inject a custom sort. 
        # Since SQLite/Django ORM doesn't easily do complex heuristic math in query, 
        # we will fetch and sort in python for this demo.
        # However, DRF expects a queryset if we use pagination, but let's just annotate if possible.
        # Actually, let's keep it simple: we can do Python sorting if we override `list`.
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        # Mock user location (e.g. Lahore) for distance calculation
        user_lat, user_lng = 31.5204, 74.3587
        
        donors = list(qs)
        now = timezone.now().date()
        
        for donor in donors:
            # 1. Distance Score (0-50 points)
            dist_score = 0
            if donor.latitude and donor.longitude:
                # Basic Euclidean distance mock for priority
                dist = math.hypot(donor.latitude - user_lat, donor.longitude - user_lng)
                dist_score = max(0, 50 - int(dist * 100)) # Closer = higher score
            else:
                dist_score = 25 # Average if unknown

            # 2. Eligibility/Recency Score (0-30 points)
            elig_score = 0
            if not donor.last_donation_date or (now - donor.last_donation_date).days > 90:
                elig_score = 30 # Safe to donate
            else:
                elig_score = 0 # Cannot donate yet
                
            # 3. Response/Activity Score (0-20 points)
            act_score = min(20, donor.donations_made * 2)
            
            # Attach priority score dynamically (not in DB)
            donor.priority_score = dist_score + elig_score + act_score

        # Sort descending by priority_score
        donors.sort(key=lambda x: getattr(x, 'priority_score', 0), reverse=True)
        
        serializer = self.get_serializer(donors, many=True)
        data = serializer.data
        
        # Inject the priority score into the response for the frontend
        for i, donor_data in enumerate(data):
            donor_data['priority_score'] = getattr(donors[i], 'priority_score', 0)

        return Response(data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def qr_code(self, request, *args, **kwargs):
        """Feature 5: Generate Donor QR Code Health Card"""
        donor = self.get_object()
        
        # Create a JSON payload of health data
        health_data = {
            "name": donor.user.username,
            "blood_group": donor.blood_group,
            "last_donated": str(donor.last_donation_date) if donor.last_donation_date else "Never",
            "badge": donor.badge,
            "donations": donor.donations_made
        }
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(json.dumps(health_data))
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        
        # Save image to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return Response({"qr_code_base64": f"data:image/png;base64,{img_str}"})

class AnalyticsViewSet(viewsets.ViewSet):
    """Feature 4: Predictive Analytics Shortage Warning"""
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def predict_shortage(self, request):
        # Mock ML Model output for the final year project demo
        # E.g. Predicting Dengue season platelet shortages in Lahore
        
        mock_predictions = {
            "alert_level": "WARNING",
            "city": "Lahore",
            "predicted_shortage": "O- and Platelets",
            "confidence": "89%",
            "reasoning": "Historical data shows a 45% spike in platelet requests during August-September due to Dengue outbreaks. Current stock depletion rate suggests a critical shortage in 14 days."
        }
        return Response(mock_predictions)

class BloodRequestViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        
        # Auto-expire old requests lazily on read
        pending_requests = BloodRequest.objects.filter(status=BloodRequest.Status.PENDING)
        for req in pending_requests:
            age = now - req.created_at
            if req.urgency == BloodRequest.Urgency.CRITICAL and age > timedelta(hours=48):
                req.status = BloodRequest.Status.EXPIRED
                req.save(update_fields=['status'])
            elif req.urgency != BloodRequest.Urgency.CRITICAL and age > timedelta(days=7):
                req.status = BloodRequest.Status.EXPIRED
                req.save(update_fields=['status'])
                
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False):
            return BloodRequest.objects.none()
            
        return BloodRequest.objects.all().order_by('-created_at')
    
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)
        
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def accept(self, request, pk=None):
        """Allow a donor to accept a pending blood request."""
        blood_request = self.get_object()
        
        if request.user.role != 'DONOR':
            return Response({"error": "Only donors can accept requests"}, status=status.HTTP_403_FORBIDDEN)
            
        if blood_request.status != BloodRequest.Status.PENDING:
            return Response({"error": "This request is no longer pending"}, status=status.HTTP_400_BAD_REQUEST)
            
        if blood_request.units_fulfilled + blood_request.accepted_donors.count() >= blood_request.units_needed:
            return Response({"error": "This request has already been fully pledged by other donors"}, status=status.HTTP_400_BAD_REQUEST)

        # Check 90-day cooldown
        profile = request.user.profile
        if profile.last_donation_date:
            days_since = (timezone.now().date() - profile.last_donation_date).days
            if days_since < 90:
                return Response({"error": f"You are in a 90-day cool-down period. Eligible in {90 - days_since} days."}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user in blood_request.accepted_donors.all():
            return Response({"error": "You have already accepted this request"}, status=status.HTTP_400_BAD_REQUEST)
            
        blood_request.accepted_donors.add(request.user)
        
        # Check if fully pledged
        total_pledged = blood_request.units_fulfilled + blood_request.accepted_donors.count()
        if total_pledged >= blood_request.units_needed:
            blood_request.status = BloodRequest.Status.FULFILLED
            
        blood_request.save()
        
        return Response({"status": "Request accepted successfully", "request_id": blood_request.id})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel_accept(self, request, pk=None):
        blood_request = self.get_object()
        if request.user in blood_request.accepted_donors.all():
            blood_request.accepted_donors.remove(request.user)
            # If it was FULFILLED and they cancel, check if total pledged drops below needed
            total_pledged = blood_request.units_fulfilled + blood_request.accepted_donors.count()
            if blood_request.status == BloodRequest.Status.FULFILLED and total_pledged < blood_request.units_needed:
                blood_request.status = BloodRequest.Status.PENDING
                blood_request.save()
            return Response({"status": "Acceptance cancelled"})
        return Response({"error": "You have not accepted this request"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def fulfill(self, request, pk=None):
        blood_request = self.get_object()
        donor_id = request.data.get('donor_id')
        
        # Only Patient or Hospital can fulfill
        if request.user != blood_request.patient and request.user.role != 'HOSPITAL':
            return Response({"error": "Only the patient or a hospital can mark this as fulfilled"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            donor = User.objects.get(id=donor_id)
        except User.DoesNotExist:
            return Response({"error": "Invalid donor ID"}, status=status.HTTP_400_BAD_REQUEST)
            
        if donor not in blood_request.accepted_donors.all():
            return Response({"error": "This donor has not accepted this request"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create a donation record
        Donation.objects.create(
            donor=donor,
            blood_request=blood_request,
            hospital=request.user if request.user.role == 'HOSPITAL' else None
        )
        
        blood_request.units_fulfilled += 1
        blood_request.accepted_donors.remove(donor) # Remove from active list
        
        if blood_request.units_fulfilled >= blood_request.units_needed:
            blood_request.status = BloodRequest.Status.FULFILLED
            
        blood_request.save()
        return Response({"status": "Donation verified and fulfilled!"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_location(self, request, pk=None):
        """Feature 6: Live Donor Tracking (Update Location)"""
        blood_request = self.get_object()
        
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat is not None and lng is not None:
            blood_request.donor_lat = float(lat)
            blood_request.donor_lng = float(lng)
            blood_request.tracking_active = True
            blood_request.save()
            return Response({"status": "Location updated"})
        return Response({"error": "Missing coordinates"}, status=status.HTTP_400_BAD_REQUEST)

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

class CampaignViewSet(viewsets.ModelViewSet):
    """Feature 8: Blood Drives & NGO Campaigns"""
    queryset = Campaign.objects.all().order_by('event_date')
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

class BloodInventoryViewSet(viewsets.ModelViewSet):
    """Feature 6: Hospital Blood Bank Module"""
    serializer_class = BloodInventorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        hospital_id = self.request.query_params.get('hospital_id')
        if hospital_id:
            return BloodInventory.objects.filter(hospital_id=hospital_id).order_by('blood_group')
        if user.is_authenticated and user.role == User.Role.HOSPITAL:
            for bg in Profile.BloodGroup.values:
                BloodInventory.objects.get_or_create(
                    hospital=user,
                    blood_group=bg,
                    defaults={'units_available': 0}
                )
            return BloodInventory.objects.filter(hospital=user).order_by('blood_group')
        return BloodInventory.objects.all().order_by('blood_group')

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def set_stock(self, request):
        blood_group = request.data.get('blood_group')
        units = request.data.get('units', 0)
        if not blood_group:
            return Response({'error': 'blood_group is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        obj, _ = BloodInventory.objects.update_or_create(
            hospital=request.user,
            blood_group=blood_group,
            defaults={'units_available': max(0, int(units))}
        )
        return Response(self.get_serializer(obj).data)

class HospitalViewSet(viewsets.ReadOnlyModelViewSet):
    """Public & Authenticated Hospital Directory & Command Actions"""
    queryset = Profile.objects.filter(user__role=User.Role.HOSPITAL)
    serializer_class = HospitalSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Profile.objects.filter(user__role=User.Role.HOSPITAL)
        city = self.request.query_params.get('city')
        search = self.request.query_params.get('search')
        if city and city.lower() != 'all':
            qs = qs.filter(city__iexact=city)
        if search:
            qs = qs.filter(
                Q(hospital_name__icontains=search) | 
                Q(user__username__icontains=search) | 
                Q(city__icontains=search) |
                Q(address__icontains=search)
            )
        return qs

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_inventory(self, request):
        if request.user.role != User.Role.HOSPITAL:
            return Response({'error': 'Only hospitals can access inventory'}, status=status.HTTP_403_FORBIDDEN)
        
        for bg in Profile.BloodGroup.values:
            BloodInventory.objects.get_or_create(
                hospital=request.user,
                blood_group=bg,
                defaults={'units_available': 0}
            )
        qs = BloodInventory.objects.filter(hospital=request.user).order_by('blood_group')
        return Response(BloodInventorySerializer(qs, many=True).data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_external_donors(self, request):
        """Allows hospital staff to broadcast an emergency request to community donors"""
        if request.user.role != User.Role.HOSPITAL:
            return Response({'error': 'Only registered hospitals can broadcast emergency requests.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        blood_group = data.get('blood_group')
        units_needed = int(data.get('units_needed', 1))
        urgency = data.get('urgency', BloodRequest.Urgency.CRITICAL)
        patient_ref = data.get('patient_ref', 'Emergency Patient')
        notes = data.get('notes', '')
        
        profile = getattr(request.user, 'profile', None)
        hospital_name = (profile.hospital_name if profile and profile.hospital_name else request.user.get_full_name()) or request.user.username
        city = profile.city if profile and profile.city else 'Lahore'

        blood_request = BloodRequest.objects.create(
            patient=request.user,
            required_blood_group=blood_group,
            hospital_name=hospital_name,
            city=city,
            units_needed=units_needed,
            urgency=urgency,
            status=BloodRequest.Status.PENDING,
            latitude=profile.latitude if profile else None,
            longitude=profile.longitude if profile else None,
        )

        return Response(BloodRequestSerializer(blood_request).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def community_donors(self, request):
        """Hospital search for community donors"""
        qs = Profile.objects.filter(user__role=User.Role.DONOR, user__is_verified=True)
        blood_group = request.query_params.get('blood_group')
        city = request.query_params.get('city')
        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        if city and city.lower() != 'all':
            qs = qs.filter(city__iexact=city)
        return Response(ProfileSerializer(qs, many=True).data)

class BloodExchangeViewSet(viewsets.ModelViewSet):
    """Mutual Blood Replacement / Exchange Desk (خون کا تبادلہ)"""
    queryset = BloodExchangeRequest.objects.all()
    serializer_class = BloodExchangeRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = BloodExchangeRequest.objects.all().order_by('-created_at')
        hospital_id = self.request.query_params.get('hospital_id')
        if hospital_id:
            qs = qs.filter(hospital_id=hospital_id)
        
        user = self.request.user
        if user and user.is_authenticated:
            if user.role == User.Role.HOSPITAL:
                return qs.filter(hospital=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user and user.is_authenticated:
            serializer.save(requester=user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        exchange = self.get_object()
        if request.user != exchange.hospital and request.user.role != User.Role.HOSPITAL:
            return Response({'error': 'Only the assigned hospital can approve this exchange.'}, status=status.HTTP_403_FORBIDDEN)
        
        exchange.status = BloodExchangeRequest.Status.APPROVED
        exchange.save()
        return Response(self.get_serializer(exchange).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        """Atomically perform the mutual blood swap in the hospital blood bank"""
        from django.db import transaction
        exchange = self.get_object()
        if request.user != exchange.hospital and request.user.role != User.Role.HOSPITAL:
            return Response({'error': 'Only the assigned hospital can complete this exchange.'}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            # 1. Decrease required blood group units
            req_inv, _ = BloodInventory.objects.get_or_create(
                hospital=exchange.hospital, blood_group=exchange.required_blood_group,
                defaults={'units_available': 0}
            )
            req_inv.units_available = max(0, req_inv.units_available - exchange.units)
            req_inv.save()

            # 2. Increase offered blood group units
            off_inv, _ = BloodInventory.objects.get_or_create(
                hospital=exchange.hospital, blood_group=exchange.offered_blood_group,
                defaults={'units_available': 0}
            )
            off_inv.units_available += exchange.units
            off_inv.save()

            exchange.status = BloodExchangeRequest.Status.COMPLETED
            exchange.completed_at = timezone.now()
            exchange.save()

        return Response({
            'status': 'Exchange completed successfully',
            'exchange': self.get_serializer(exchange).data,
            'message': f'{exchange.units} unit(s) of {exchange.offered_blood_group} received into blood bank, and {exchange.units} unit(s) of {exchange.required_blood_group} issued to patient {exchange.patient_name}.'
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        exchange = self.get_object()
        if request.user != exchange.hospital and request.user.role != User.Role.HOSPITAL:
            return Response({'error': 'Only the assigned hospital can reject this exchange.'}, status=status.HTTP_403_FORBIDDEN)
        
        exchange.status = BloodExchangeRequest.Status.REJECTED
        exchange.save()
        return Response(self.get_serializer(exchange).data)

