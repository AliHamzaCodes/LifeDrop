import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "LifeDrop — Voluntary Blood Donation Network (Pakistan)")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "FYP & Production Architecture Documentation")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    pdf_path = r"c:\Users\Javaria Amin\OneDrive\Desktop\DropLife\LifeDrop\LifeDrop_Project_Guide.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#dc2626')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569')
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#b91c1c'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        spaceAfter=4
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # ── HEADER BANNER ──────────────────────────────────────────────────────────
    story.append(Paragraph("LifeDrop — Blood Donation Network", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Complete Technical Project Guide, Newly Added Features & System Architecture", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#dc2626'), spaceAfter=14))

    # ── 1. PROJECT EXECUTIVE SUMMARY ──────────────────────────────────────────
    story.append(Paragraph("1. Executive Summary & Problem Solved", h1_style))
    story.append(Paragraph(
        "<b>LifeDrop</b> is a Pakistan-focused voluntary blood donation and hospital emergency coordination network. "
        "In Pakistan, acute blood shortages affect over 250,000 thalassemia children, emergency trauma victims, and post-partum mothers annually. "
        "The project eliminates middlemen and black marketing by directly matching voluntary donors with patients and hospitals in real time.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Key Technology Stack:</b> Frontend: React 19, TypeScript, Vite, SCSS, React-Router 6, Leaflet Maps, PWA. "
        "Backend: Django 6, Django REST Framework (DRF), Daphne ASGI Server, Django Channels (WebSockets), SQLite/PostgreSQL, SimpleJWT Authentication.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # ── 2. NEWLY ADDED & UPGRADED FEATURES ────────────────────────────────────
    story.append(Paragraph("2. Newly Added & Upgraded Features (Recent Enhancements)", h1_style))
    story.append(Paragraph(
        "The following 6 major features were newly designed, developed, and connected to make this project production-grade:",
        body_style
    ))

    features_data = [
        [
            Paragraph("<b>Feature</b>", table_header),
            Paragraph("<b>Module / File</b>", table_header),
            Paragraph("<b>What Was Added & How It Works</b>", table_header)
        ],
        [
            Paragraph("<b>1. Local Backend Sync & Dynamic BaseURL</b>", table_cell),
            Paragraph("<code>.env</code><br/><code>api.ts</code>", table_cell),
            Paragraph("Fixed inactive remote cloud URL. Created environment-based configuration pointing to active local Django REST API. Enabled media/avatar resolution.", table_cell)
        ],
        [
            Paragraph("<b>2. Hospital Blood Inventory Center</b>", table_cell),
            Paragraph("<code>HospitalPanel.tsx</code><br/><code>views.py (set_stock)</code>", table_cell),
            Paragraph("Interactive reserve management for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-). Live +/- unit adjustment buttons, critical low stock alerts (<3 units), and visual progress bars.", table_cell)
        ],
        [
            Paragraph("<b>3. NGO Blood Camps & Drives Page</b>", table_cell),
            Paragraph("<code>CampaignsPage.tsx</code><br/><code>/campaigns</code> route", table_cell),
            Paragraph("Directory of upcoming blood donation camps. City filters (Lahore, Karachi, Islamabad), event timings, perks (Free screening, Refreshments), 1-click volunteer registration, and a 'Host a Drive' modal.", table_cell)
        ],
        [
            Paragraph("<b>4. WhatsApp Emergency Quick-Contact</b>", table_cell),
            Paragraph("<code>SearchBloodPage.tsx</code><br/><code>DonorProfilePage.tsx</code>", table_cell),
            Paragraph("Added dedicated WhatsApp action buttons on verified donor cards and profile pages. Formats instant urgent coordination message with donor name, city, and needed blood group.", table_cell)
        ],
        [
            Paragraph("<b>5. Digital Certificate of Appreciation</b>", table_cell),
            Paragraph("<code>DonationHistory.tsx</code><br/><code>donations.data.ts</code>", table_cell),
            Paragraph("Automated LifeSaver award certificate generation for completed donations. Renders donor name, donated volume, date, hospital, gold seal, and Print/Save PDF support.", table_cell)
        ],
        [
            Paragraph("<b>6. Realtime WebSockets Chat & Live GPS</b>", table_cell),
            Paragraph("<code>Messages.tsx</code><br/><code>ActiveRequests.tsx</code>", table_cell),
            Paragraph("Direct Daphne/Django Channels WebSocket communication in the Messages tab with connection indicators. Added HTML5 GPS location sharing for donors pledging to donate.", table_cell)
        ],
    ]

    t_features = Table(features_data, colWidths=[120, 100, 284])
    t_features.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')])
    ]))
    story.append(t_features)
    story.append(Spacer(1, 14))

    # ── 3. TOTAL FEATURES OF THE PROJECT ──────────────────────────────────────
    story.append(Paragraph("3. Total Complete Feature Matrix", h1_style))
    story.append(Paragraph("<b>A. Donor Discovery & Matching:</b>", h2_style))
    story.append(Paragraph("• <b>Smart Compatibility Matching:</b> Matches both exact blood groups and medically compatible donor groups (e.g. O- universal donor, AB+ universal recipient).", bullet_style))
    story.append(Paragraph("• <b>Interactive Leaflet Map:</b> Visualizes nearby donors across Pakistani cities with distance calculation (km).", bullet_style))
    story.append(Paragraph("• <b>90-Day Medical Cooldown:</b> Automatically flags donors in cooldown rest periods to prevent unsafe donations.", bullet_style))
    story.append(Paragraph("• <b>Direct Call & WhatsApp Action:</b> Instant contact initiation without friction.", bullet_style))

    story.append(Paragraph("<b>B. Emergency Blood Request Workflow:</b>", h2_style))
    story.append(Paragraph("• <b>Urgency Priority Levels:</b> Routine (48-72 hrs), Urgent (12-24 hrs), and Critical (<2 hrs).", bullet_style))
    story.append(Paragraph("• <b>Auto-Expiration Daemon:</b> Background checks auto-expire stale requests to keep the feed fresh.", bullet_style))
    story.append(Paragraph("• <b>Progressive Units Tracking:</b> Visual bar showing units fulfilled vs units needed.", bullet_style))
    story.append(Paragraph("• <b>Pledge & Verification Lifecycle:</b> Donor RSVP -> Live GPS Share -> Hospital/Patient mark as Received.", bullet_style))

    story.append(Paragraph("<b>C. Hospital Command Center & Blood Bank:</b>", h2_style))
    story.append(Paragraph("• <b>Stock Reserves Module:</b> Real-time inventory tracking for all blood groups with critical threshold badges.", bullet_style))
    story.append(Paragraph("• <b>Predictive Dengue Season Analytics:</b> AI/ML model alerting hospitals of upcoming regional platelet shortages.", bullet_style))
    story.append(Paragraph("• <b>Hospital Requests Dashboard:</b> View and verify blood bags received for admitted patients.", bullet_style))

    story.append(Paragraph("<b>D. User Experience, PWA & Security:</b>", h2_style))
    story.append(Paragraph("• <b>QR Code Digital Health Card:</b> Base64 QR code with donor history, badge, and blood group for instant hospital verification.", bullet_style))
    story.append(Paragraph("• <b>Progressive Web App (PWA):</b> Installable on Android & iOS mobile devices with offline service worker caching.", bullet_style))
    story.append(Paragraph("• <b>Role-Based Authentication:</b> Dedicated roles for Donors, Patients, and Hospitals secured via JWT tokens.", bullet_style))
    story.append(Spacer(1, 12))

    # ── 4. HOW THE SYSTEM WORKS (STEP-BY-STEP WORKFLOW) ────────────────────────
    story.append(Paragraph("4. How The Project Works (Step-by-Step Workflow)", h1_style))
    
    workflow_steps = [
        ("Step 1: User & Donor Onboarding", 
         "A donor registers on <code>/auth</code> with their email, city, blood group, and phone number. "
         "Their profile is created with eligibility checks, cooldown dates, and an initial donor badge."),
        
        ("Step 2: Emergency Request Creation",
         "A patient or hospital creates an emergency request on <code>/request</code> specifying patient name, hospital, city, blood group, units, and urgency. "
         "Django signals auto-trigger email alerts and mock social media broadcasts to matching local donors."),

        ("Step 3: Discovery & Donor Matching",
         "Users locate donors on <code>/search</code> by searching cities or blood groups. "
         "The priority algorithm sorts donors by physical proximity, donation recency, and response rating."),

        ("Step 4: Real-time Coordination & Live Tracking",
         "The requester contacts the donor directly via Phone, 1-click WhatsApp, or Daphne WebSocket chat. "
         "When the donor clicks 'I will donate', they can activate 'Share GPS Location', sending live coordinates to the hospital/patient."),

        ("Step 5: Donation Verification & Gamification",
         "Once the donation is completed at the hospital, the patient or hospital marks it as 'Received'. "
         "The donor's total donation count increases, badges upgrade (Bronze -> Silver -> Gold), and an official Digital Certificate of Appreciation is generated."),

        ("Step 6: Hospital Blood Bank Management",
         "Hospital administrators manage their facility's blood inventory via the Hospital Command Center, adjusting available units and receiving automated low-stock warnings.")
    ]

    for title, desc in workflow_steps:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        story.append(Paragraph(desc, body_style))

    story.append(Spacer(1, 10))

    # ── 5. RUN & DEPLOYMENT GUIDE ──────────────────────────────────────────────
    story.append(Paragraph("5. Local Execution & Credentials", h1_style))
    story.append(Paragraph(
        "<b>Frontend:</b> Run <code>npm run dev</code> inside <code>LifeDrop/</code> (Runs at <code>http://localhost:5173</code>).<br/>"
        "<b>Backend:</b> Run <code>python manage.py runserver</code> inside <code>LifeDrop/backend/</code> (Runs at <code>http://127.0.0.1:8000/api/</code>).<br/>"
        "<b>Demo Accounts:</b><br/>"
        "• Hospital Admin: <code>admin@lifestream.com</code> / Password: <code>Admin@1234</code><br/>"
        "• Standard Donors: <code>salman@gmail.com</code>, <code>ahmad@gmail.com</code>, <code>amna@gmail.com</code> / Password: <code>password123</code>",
        body_style
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generated successfully at:", pdf_path)

if __name__ == '__main__':
    build_pdf()
