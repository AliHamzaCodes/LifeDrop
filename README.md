# LifeStream — Blood Donation Network (FYP Demo)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![SCSS](https://img.shields.io/badge/SCSS-BEM-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)

A **Pakistan-focused** React frontend for matching voluntary blood donors with patients. This is a Final Year Project **frontend demo**: sessions and records live in `localStorage`. There is **no Node/Express/Mongo backend yet**, and **Axios is not used**.

---

## Demo accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| Administrator | `admin@lifestream.com` | `Admin@1234` |
| Standard user / donor | `john@example.com` | `Test@1234` |

Clear `ls_seeded_v4` (or all `ls_*` keys) in DevTools if you still see old US seed data.

---

## What works in this frontend

* Login / register with return URL (`/auth?mode=login&redirect=`)
* Search donors by **name, city, and blood group**, including compatible groups
* Public blood **request** form (guest + email, or logged-in tracking)
* Donor registration with eligibility checklist (status stays **pending** until admin verifies)
* Dashboard: overview, active requests, donation history, profile, help, admin
* Public pages: Contact, FAQ, Eligibility checker, Compatibility chart, About, Privacy, Terms

Hospital names (Mayo, Shaukat Khanum, PIMS, Aga Khan, and others) are **illustrative demo data**.

---

## Architecture

* **Vite + React 19 + React Router 6**, SCSS/BEM, Context + services
* Mock data is seeded from `AppDataContext` into `localStorage`
* `src/api/apiClient.js` is unused until a backend and HTTP client exist — do not import it yet
* Domain services in `src/services/` are ready to swap for real APIs later

```text
src/
├── api/             # Unused HTTP stub (do not import until backend)
├── assets/
├── components/
├── constants/       # Blood groups, Pakistan cities/phones
├── context/         # AuthContext, AppDataContext
├── data/            # Static copy (FAQ, profile extras)
├── hooks/
├── pages/
├── routes/
├── services/        # localStorage-backed mocks
├── styles/
└── utils/
```

---

## Run locally

Requires [Node.js](https://nodejs.org/) v18+.

```bash
git clone https://github.com/your-username/blood-donation-website.git
cd blood-donation-website
npm install
npm run dev
```

Open `http://localhost:5173`. Production build: `npm run build`.

---

## Honesty notes (FYP)

* Passwords in the demo are stored in the browser, not hashed on a server
* Forgot-password does not send email; use the on-screen demo reset
* No Google sign-in, live chat, or inventory/appointment product
* Eligibility and compatibility screens are educational, not medical advice
