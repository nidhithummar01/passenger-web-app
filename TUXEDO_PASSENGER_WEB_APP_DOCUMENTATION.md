# TUXEDO — Passenger Web Application Documentation

> **Document Type:** Web Application Documentation
> **Application Name:** Tuxedo — Luxury Chauffeur Service
> **Platform:** Web (Browser-based, Mobile-first Responsive)
> **Frontend Only:** This document covers the frontend application exclusively. No backend or API layer is included in this codebase.
> **Version:** 0.0.1
> **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, React Router v7, Framer Motion (motion/react), Lucide React Icons

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Global State Management](#4-global-state-management)
5. [Data Models & Types](#5-data-models--types)
6. [Routing Structure](#6-routing-structure)
7. [Page-by-Page Feature Breakdown](#7-page-by-page-feature-breakdown)
   - 7.1 [Passenger Tracking & Ride Request Screen](#71-passenger-tracking--ride-request-screen-track-ride)
   - 7.2 [Membership Screen](#72-membership-screen-membership)
   - 7.3 [Membership Payment Screen](#73-membership-payment-screen-membership-payment)
   - 7.4 [Driver List Screen](#74-driver-list-screen-driver-list)
   - 7.5 [Driver Profile Screen](#75-driver-profile-screen-driver-profile)
   - 7.6 [Reserve a Ride Screen](#76-reserve-a-ride-screen-reserve-ride)
8. [Complete User Flow Diagrams](#8-complete-user-flow-diagrams)
9. [Membership System](#9-membership-system)
10. [Payment System](#10-payment-system)
11. [Pricing Logic](#11-pricing-logic)
12. [Mock Driver Data](#12-mock-driver-data)
13. [Reusable UI Components](#13-reusable-ui-components)
14. [App Download & Coupon System](#14-app-download--coupon-system)
15. [Local Storage Usage](#15-local-storage-usage)
16. [Design System & Theming](#16-design-system--theming)
17. [Feature Access Control (Membership Gating)](#17-feature-access-control-membership-gating)
18. [Navigation & Back Handling](#18-navigation--back-handling)

---

## 1. Application Overview

Tuxedo is a luxury chauffeur booking web application designed for hotel guests and premium passengers. It operates as a **mobile-first, browser-based web app** that allows passengers to request a chauffeur, track their ride in real time (simulated), manage a premium membership, browse and select from a curated list of professional drivers, and schedule future rides.

The application is built entirely as a **frontend-only** product. There is no live backend, real-time server, or database connection. All data is mocked, and state is managed in-memory (React context) or persisted via `localStorage`.

### Core Purpose
- Allow hotel guests/passengers to request a luxury chauffeur ride
- Provide a premium membership tier (Tuxedo Gold) that unlocks advanced features
- Enable passengers to browse, filter, and manually select their preferred chauffeur
- Simulate live ride tracking with an animated map
- Offer a seamless payment flow with multiple payment method options
- Promote the Tuxedo mobile app via a post-payment popup with a $100 coupon incentive

### Brand Identity
- Name: **TUXEDO**
- Color Palette: Black background (`#000000`), Gold accent (`#D4AF37`), White text
- Typography: Bold, uppercase, italic headings — premium luxury aesthetic
- UI Style: Glassmorphism cards with gold borders, dark theme throughout

---

## 2. Technology Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 18.3.1 |
| Language | TypeScript | Latest |
| Build Tool | Vite | ^6.4.1 |
| Routing | React Router DOM | ^7.10.1 |
| Animation | motion (Framer Motion) | 12.23.24 |
| Styling | Tailwind CSS | 4.1.12 |
| Icons | Lucide React | 0.487.0 |
| Date Utilities | date-fns | 3.6.0 |
| State Management | React Context API | Built-in |
| Persistence | localStorage | Browser API |

---

## 3. Application Architecture

```
src/
├── App.tsx                  — Root component, router setup, route definitions
├── main.tsx                 — React DOM entry point
├── components/
│   └── GlassCard.tsx        — Reusable GlassCard and GoldButton UI components
├── context/
│   └── AppContext.tsx       — Global state: user and activeRide
├── data/
│   └── mockDrivers.ts       — Static mock driver data (5 drivers)
├── screens/
│   ├── PassengerTrackingWeb.tsx   — Main ride request + tracking screen
│   ├── MembershipScreen.tsx       — Membership benefits & upsell screen
│   ├── MembershipPaymentScreen.tsx — Membership payment completion
│   ├── DriverListScreen.tsx       — Browse & filter available chauffeurs
│   ├── DriverProfileScreen.tsx    — Detailed individual driver profile
│   └── ReserveRideScreen.tsx      — Schedule a future ride (date/time picker)
├── styles/
│   ├── index.css            — Base styles
│   ├── tailwind.css         — Tailwind directives
│   ├── theme.css            — Theme variables
│   └── fonts.css            — Font definitions
├── types/
│   └── index.ts             — TypeScript type definitions
└── utils/
    └── pricing.ts           — Fare and commission calculation logic
```

---

## 4. Global State Management

The app uses React Context API via `AppContext`. The context is provided at the root level in `App.tsx` and wraps all routes.

### Context Shape

```typescript
interface AppContextType {
  user: User | null;           // Currently logged-in user (null by default)
  setUser: Dispatch<...>;      // Update user state
  activeRide: Ride | null;     // Currently active ride object
  setActiveRide: Dispatch<...>; // Update active ride state
}
```

### Notes
- The `user` starts as `null` — the app does not have a login screen in this frontend build
- `user.isMember` and `localStorage.getItem('isMember')` are both checked for membership status (dual-check for persistence across refreshes)
- `activeRide` tracks the current ride's status, drop-off location, payment method, and driver movement state

---

## 5. Data Models & Types

Defined in `src/types/index.ts`:

### UserRole
```typescript
type UserRole = 'concierge' | 'manager' | 'passenger';
```

### RideStatus
```typescript
type RideStatus = 'creating' | 'matching' | 'assigned' | 'arriving' | 'onboard' | 'enroute' | 'completed' | 'cancelled';
```

### VehicleType
```typescript
type VehicleType = 'sedan' | 'suv' | 'luxury' | 'van';
```

### PaymentType
```typescript
type PaymentType = 'card' | 'cash';
```

### User Object
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  hotelId: string;
  hotelName: string;         // Used as default pickup location
  deviceBound: boolean;
  deviceName?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isMember: boolean;         // Tuxedo Gold membership flag
  rideCredit: number;        // Available ride credit balance ($)
}
```

### Ride Object
```typescript
interface Ride {
  id: string;
  status: RideStatus;
  pickupLocation: string;
  destination?: string;
  vehicleType: VehicleType;
  paymentType: PaymentType;
  fare: number;
  commission: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  dropOffLocation?: string;
  paymentMethod?: string | null;
  driverMoving?: boolean;
}
```

### Driver Object (from mockDrivers.ts)
```typescript
interface Driver {
  id: string;
  name: string;
  rating: number;
  experience: number;        // Years of experience
  vehicle: {
    brand: string;
    model: string;
    year: number;
    color: string;
    interior: string;
    plate: string;           // Partially masked (e.g., ***LUX24)
  };
  amenities: {
    wifi: boolean;
    water: boolean;
    charger: boolean;
    childSeat: boolean;
    luggage: number;         // Luggage capacity count
    music: boolean;
  };
  eta: number;               // Estimated arrival in minutes
  distance: number;          // Distance in miles
  status: 'online' | 'busy';
  verified: boolean;         // Background-checked badge
  hotelPreferred: boolean;   // Hotel-preferred driver flag
}
```

---

## 6. Routing Structure

Defined in `src/App.tsx` using React Router v7:

| Route | Component | Description |
|---|---|---|
| `/` | Redirect | Redirects to `/track-ride` |
| `/track-ride` | `PassengerTrackingWeb` | Main ride request and live tracking screen |
| `/membership` | `MembershipScreen` | Membership benefits and purchase prompt |
| `/membership-payment` | `MembershipPaymentScreen` | Membership payment completion |
| `/reserve-ride` | `ReserveRideScreen` | Schedule a future ride |
| `/driver-list` | `DriverListScreen` | Browse and filter available chauffeurs |
| `/driver-profile` | `DriverProfileScreen` | Detailed profile of a single driver |
| `*` (catch-all) | Redirect | Any unknown route redirects to `/track-ride` |

The app wraps all routes in a `div` with `dark min-h-screen bg-black` — enforcing the dark theme globally.

---

## 7. Page-by-Page Feature Breakdown

---

### 7.1 Passenger Tracking & Ride Request Screen (`/track-ride`)

**File:** `src/screens/PassengerTrackingWeb.tsx`

This is the **home screen** and the most feature-rich screen in the application. It manages a 4-step internal flow using a `step` state variable.

#### Steps / Internal States

| Step | Value | Description |
|---|---|---|
| 1 | `config` | Ride configuration — enter drop-off location |
| 2 | `payment` | Select payment method |
| 3 | `secure-payment` | Review fare breakdown and confirm payment |
| 4 | `tracking` | Live ride tracking view with driver info |

---

#### Step 1 — Ride Configuration (`config`)

**What the user sees:**
- App branding: "TUXEDO" title with "RIDE CONFIGURATION" badge
- Pickup location displayed (read-only, set by concierge or from user's hotel name)
  - Falls back to `"The Grand Majestic Hotel"` if no user or deep link is present
  - Supports URL query param `?pickup=...` for deep-link pre-fill
- Drop-off location input field (free text, required)
- "Request Chauffeur" button — disabled until drop-off is entered

**Actions:**
- User types their destination in the drop-off field
- Tapping "Request Chauffeur" advances to Step 2 (payment selection)
- The `activeRide` context is updated with the drop-off location and status

---

#### Step 2 — Payment Method Selection (`payment`)

**What the user sees:**
- "Select Payment Method" heading
- 4 payment options displayed as selectable cards:
  1. Apple Pay (Apple icon)
  2. PayPal (Wallet icon)
  3. Credit Card (CreditCard icon)
  4. Cash Payment (DollarSign icon)
- Selected method shows a gold checkmark

**Actions:**
- Tapping any payment method selects it and immediately advances to Step 3 (secure payment)
- Back button returns to Step 1

---

#### Step 3 — Secure Payment Confirmation (`secure-payment`)

**What the user sees:**
- Lock icon with "Secure Payment" heading
- "256-bit SSL Encrypted" label (UI indicator)
- Selected payment method displayed
- Fare breakdown:
  - Ride Fare: $24.00
  - Service Fee: $3.00
  - Total: $27.00 (displayed in gold)
- "Confirm Payment" button
- "Secured by Tuxedo Financial" footer note

**Actions:**
- Tapping "Confirm Payment":
  - Updates `activeRide` with payment method and tracking status
  - Triggers the App Download Popup to appear
  - Advances to Step 4 (tracking)
- Back button returns to Step 2

---

#### Step 4 — Live Ride Tracking (`tracking`)

**What the user sees:**
- Animated SVG map (DummyMap component) showing:
  - Grid-based city map simulation
  - Bezier curve route path in gold
  - Animated gold dot (driver) moving along the route
  - Green dot = pickup, Red dot = drop-off
  - "Live Tracking" label with pulsing navigation icon
  - Driver name shown as "en route"
  - "Simulation" label (indicating mock data)
- Green checkmark confirmation card below the map
- Driver avatar placeholder + vehicle image placeholder
- Driver name: "Michael S." (default assigned driver)
- 5-star rating display with "4.9 Rating"
- Animated progress bar (driver arrival progress, loops 10%→85%)
- ETA text: "Live: Driver is 3 mins away in a Black S-Class"
- Premium Amenities section:
  - If member: Shows amenity tags (WiFi, Refreshments, Leather Interior)
  - If not member: Shows "Premium amenities locked" with "Buy Membership" button
- Promo banner (shown only after membership purchase): "20% Off Your Next Journey!"

**Actions:**
- "Buy Membership" button (non-members) → navigates to `/membership` with `fromTrackRide: true` state
- Back button returns to Step 2 (payment)

---

#### Membership Status Banner (Bottom of Screen — Persistent)

Visible on all steps of this screen at the bottom:

- **Non-member:** Shows "Tuxedo Basic Status" with "Join for $100 & Get $100 Credit" and an arrow button → tapping navigates to `/membership`
- **Member:** Shows "Tuxedo Gold Member" with ride credit balance and a green "Active" checkmark
- The banner is always visible and acts as a persistent membership upsell/status indicator

---

#### App Download Popup (Modal Overlay)

Triggered automatically after payment confirmation (Step 3 → Step 4 transition) AND when returning from membership purchase flow.

**What the user sees:**
- Gift icon
- "FREE $100 Coupon" headline
- Description: Download app or buy membership to get $100 free
- Three action buttons:
  1. "Download App" (gold primary button)
  2. "Buy Membership" (gold outline button)
  3. "Skip for Now" (text button)

**Actions:**
- "Download App":
  - Generates a unique coupon code (`TUX100-XXXXXX`)
  - Saves coupon to `localStorage` key `pendingAppDownloadCoupon` with user identity, status, and timestamp
  - Opens `https://apps.apple.com` in a new tab
  - Closes the popup
- "Buy Membership" → navigates to `/membership`, closes popup
- "Skip for Now" → closes popup only

---

#### Navigation into Tracking from Other Screens

The tracking screen also handles incoming navigation state from other screens:

- `fromMembershipPurchase: true` → sets step to `tracking`, enables premium amenities, shows promo banner, shows app popup
- `fromMembershipSkip: true` → sets step to `tracking`, no premium amenities
- `paymentMethod` from state → pre-fills the payment method
- `selectedDriver` from state → updates the assigned driver display (name, rating, vehicle, amenities)

---

### 7.2 Membership Screen (`/membership`)

**File:** `src/screens/MembershipScreen.tsx`

The membership upsell screen presenting the Tuxedo Gold membership offer.

#### What the user sees:
- Back button
- Crown icon with "Tuxedo Gold" heading
- Membership price card: **$100/year**
- "Get $100 Instant Ride Credit" incentive (green, with lightning bolt icon)
- 5 membership benefits listed with animated checkmarks:
  1. Manual Chauffeur Selection
  2. View Full Driver Amenities
  3. Advanced Search Filters
  4. Priority Dispatching
  5. Exclusive Luxury Fleet Access
- "Buy Membership" gold button → navigates to `/membership-payment`
- "Continue Without Membership" text button (only shown if user came from `/track-ride`)

#### Navigation Context:
- Receives `fromTrackRide: boolean` and `paymentMethod: string` via route state
- If `fromTrackRide` is true, the "Continue Without Membership" button appears
- "Continue Without Membership" → navigates to `/driver-list` with `fromTrackRide: true` and the payment method

---

### 7.3 Membership Payment Screen (`/membership-payment`)

**File:** `src/screens/MembershipPaymentScreen.tsx`

The payment completion screen for purchasing the Tuxedo Gold membership.

#### What the user sees:
- Back button
- Shield check icon with "Complete Payment" heading
- "Annual Gold Membership" subtitle
- Total due: **$100.00**
- "Includes $100 Ride Credit" incentive
- Two payment method buttons:
  1. Apple Pay
  2. Credit Card
- Security note: "Secure payment processed by Tuxedo Financial"

#### Actions:
- Tapping either payment method triggers `handlePayment()`:
  - Sets `localStorage.setItem('isMember', 'true')`
  - Updates user context: `isMember: true`, `rideCredit: 100`
  - Navigates to `/driver-list` with `fromMembershipPurchase: true` and the payment method from incoming state

#### Note:
Both payment buttons perform the same action — there is no actual payment processing. This is a frontend-only simulation.

---

### 7.4 Driver List Screen (`/driver-list`)

**File:** `src/screens/DriverListScreen.tsx`

The chauffeur browsing screen where passengers can view and select from available drivers.

#### What the user sees:
- Back button
- Ride credit balance badge (members only, top right)
- "Filters" button (members) or "Unlock Filters" with lock icon (non-members)
- "Available Chauffeurs" heading
- Count of filtered drivers found
- Collapsible filter panel (members only):
  - "Hotel Preferred Only" checkbox
  - "Verified Only" checkbox (default: checked)
- List of driver cards (5 mock drivers)

#### Driver Card Contents:
- Driver avatar (placeholder user icon) with verified shield badge (if verified)
- Vehicle image placeholder (car icon)
- Driver first name + last initial (e.g., "Michael T.")
- Star rating with gold star icon
- Vehicle brand and model
- Distance in miles
- ETA in minutes
- Two action buttons:
  - "View Profile" → navigates to `/driver-profile` with driver data
  - "Select Chauffeur" → navigates to `/track-ride` with `fromMembershipPurchase: true` and driver data

#### Filter Logic:
Filters are applied client-side on the `mockDrivers` array:
- `hotelPreferred`: filters to only hotel-preferred drivers
- `verified`: filters to only verified drivers
- `minRating`: minimum rating threshold (default 4.5)
- `maxDistance`: maximum distance in miles (default 5)

#### Access Control:
- Filter button for non-members shows a lock icon and navigates to `/membership` instead of opening filters
- All driver cards are visible to both members and non-members
- The "Select Chauffeur" action is available to all users

---

### 7.5 Driver Profile Screen (`/driver-profile`)

**File:** `src/screens/DriverProfileScreen.tsx`

A detailed profile view for a single chauffeur.

#### What the user sees:
- Back button
- Ride credit balance badge (members only)
- Large driver avatar with first initial, gold border
- Verified shield badge (if driver is verified)
- Driver first name + last initial
- Two stats: Rating and Years of Experience
- Vehicle Details section:
  - Make/Model
  - License Plate (partially masked)
  - Year
  - Interior type
- Premium Amenities section:
  - **Members:** See all amenities as gold-bordered tags (WiFi, Audio/Music, Child Seat)
  - **Non-members:** Locked section with lock icon and "Join Membership to View" link
- Driver bio quote (static): "Professional chauffeur providing a seamless luxury experience..."
- "Assign This Chauffeur" gold button

#### Actions:
- "Assign This Chauffeur" → navigates to `/track-ride` with `fromMembershipPurchase: true` and the driver data
- "Join Membership to View" (non-members) → navigates to `/membership`
- Back button → returns to previous screen (driver list)

#### Fallback:
If no driver is passed via route state, the screen defaults to `mockDrivers[0]` (Michael Thompson).

---

### 7.6 Reserve a Ride Screen (`/reserve-ride`)

**File:** `src/screens/ReserveRideScreen.tsx`

A full-featured ride scheduling screen allowing passengers to book a chauffeur for a future date and time.

#### What the user sees:
- Back button
- Calendar icon with "Reserve a Ride" heading and subtitle
- Pickup location card (read-only, from route state or default hotel)
- Date picker card with "Tap to choose a date" button
- Time picker card with:
  - Large time display (e.g., "09:00 AM") in gold
  - Horizontal scrollable hour selector (01–12)
  - Minute selector buttons (00, 15, 30, 45)
  - AM/PM toggle buttons
- Booking Summary card (appears after date is selected):
  - Selected date (formatted: "Monday, April 28, 2026")
  - Selected time
  - Pickup location
- Fixed bottom "Confirm Reservation" button (disabled until date is selected)

#### Calendar Modal:
Triggered by tapping the date picker button. Appears as a centered modal overlay.
- Month navigation (previous/next arrows)
- Month and year header
- Day-of-week headers (SU, MO, TU, WE, TH, FR, SA)
- Day grid with:
  - Past dates: grayed out and disabled
  - Today: gold border highlight
  - Selected date: gold filled background
- Cancel button to dismiss without selecting

#### Actions:
- Selecting a date closes the calendar modal and shows the booking summary
- Adjusting hour, minute, or AM/PM updates the time display in real time
- "Confirm Reservation" → navigates to `/track-ride` with:
  - `reservedDate` (ISO string)
  - `reservedTime` (formatted string)
  - `pickupLocation`

#### Note:
The reservation data is passed to the tracking screen via route state. There is no backend persistence — the reservation is not stored anywhere permanently.

---

## 8. Complete User Flow Diagrams

### Flow A — Standard Ride Request (Non-Member)

```
App Launch (/)
    │
    ▼
/track-ride — Step: config
    │  User enters drop-off location
    │  Taps "Request Chauffeur"
    ▼
/track-ride — Step: payment
    │  User selects payment method (Apple Pay / PayPal / Credit Card / Cash)
    ▼
/track-ride — Step: secure-payment
    │  User reviews fare ($24 + $3 = $27)
    │  Taps "Confirm Payment"
    ▼
/track-ride — Step: tracking
    │  App Download Popup appears
    │  ├── "Download App" → Opens App Store + saves coupon to localStorage
    │  ├── "Buy Membership" → /membership
    │  └── "Skip for Now" → Popup closes
    │
    │  Tracking screen shows:
    │  - Animated map with driver moving
    │  - Driver info (Michael S., 4.9 rating, Black S-Class)
    │  - Progress bar (3 mins away)
    │  - Premium Amenities: LOCKED
    │      └── "Buy Membership" button → /membership
    │
    └── Bottom banner: "Join for $100 & Get $100 Credit" → /membership
```

---

### Flow B — Ride Request with Membership Purchase (Mid-Flow)

```
/track-ride — Step: config
    │  Enter drop-off → "Request Chauffeur"
    ▼
/track-ride — Step: payment
    │  Select payment method
    ▼
/track-ride — Step: secure-payment
    │  Confirm Payment
    ▼
/track-ride — Step: tracking
    │  App Download Popup → "Buy Membership"
    ▼
/membership
    │  View benefits
    │  Tap "Buy Membership"
    ▼
/membership-payment
    │  Select Apple Pay or Credit Card
    │  handlePayment() fires:
    │    - localStorage: isMember = 'true'
    │    - user context: isMember = true, rideCredit = 100
    ▼
/driver-list (fromMembershipPurchase: true)
    │  Browse 5 chauffeurs
    │  Apply filters (now unlocked)
    │  ├── "View Profile" → /driver-profile
    │  │       └── "Assign This Chauffeur" → /track-ride (tracking, with driver)
    │  └── "Select Chauffeur" → /track-ride (tracking, with driver)
    ▼
/track-ride — Step: tracking
    │  App Download Popup appears again
    │  Premium Amenities: UNLOCKED (WiFi, Refreshments, Leather Interior)
    │  Promo Banner: "20% Off Your Next Journey!"
    └── Bottom banner: "Tuxedo Gold Member — $100.00 Ride Credit — Active"
```

---

### Flow C — Membership Purchase from Home Screen Banner

```
/track-ride (any step)
    │  User taps bottom membership banner (non-member)
    ▼
/membership
    │  View benefits
    │  Tap "Buy Membership"
    ▼
/membership-payment
    │  Complete payment
    ▼
/driver-list
    │  Browse and select chauffeur
    ▼
/track-ride — Step: tracking (with selected driver + premium amenities)
```

---

### Flow D — Continue Without Membership (Skip Membership)

```
/track-ride — Step: tracking
    │  Tap "Buy Membership" in locked amenities section
    ▼
/membership (fromTrackRide: true, paymentMethod passed)
    │  Tap "Continue Without Membership"
    ▼
/driver-list (fromTrackRide: true, no membership purchase)
    │  Browse drivers (filters locked)
    │  Select a chauffeur
    ▼
/track-ride — Step: tracking
    │  Premium Amenities: still LOCKED
    └── No promo banner shown
```

---

### Flow E — Reserve a Future Ride

```
/reserve-ride (accessible via direct navigation)
    │  Pickup location shown (from state or default hotel)
    │  Tap date picker → Calendar modal opens
    │  Select future date → Calendar closes
    │  Adjust time (hour scroll + minute + AM/PM)
    │  Booking summary appears
    │  Tap "Confirm Reservation"
    ▼
/track-ride
    │  Receives reservedDate, reservedTime, pickupLocation via state
    └── Proceeds through normal ride request flow
```

---

### Flow F — Driver Profile Deep Dive

```
/driver-list
    │  Tap "View Profile" on any driver card
    ▼
/driver-profile (driver data passed via state)
    │  View: name, rating, experience, vehicle details
    │  Amenities:
    │    ├── Member: WiFi, Audio, Child Seat tags visible
    │    └── Non-member: Locked → "Join Membership to View" → /membership
    │  Tap "Assign This Chauffeur"
    ▼
/track-ride — Step: tracking (with this specific driver assigned)
```

---

### Flow G — App Download Coupon Flow

```
/track-ride — Step: tracking (after payment)
    │  App Download Popup appears
    │  Tap "Download App"
    │    ├── Generates coupon: TUX100-XXXXXX
    │    ├── Saves to localStorage['pendingAppDownloadCoupon']:
    │    │     { code, amount: 100, linkedIdentity: {phone, email},
    │    │       status: 'pending_app_login', issuedAt: timestamp }
    │    └── Opens https://apps.apple.com in new tab
    └── Popup closes
```

---

## 9. Membership System

### Tuxedo Gold Membership

| Property | Value |
|---|---|
| Price | $100/year |
| Ride Credit Included | $100 (instant upon purchase) |
| Storage | `localStorage` key: `isMember = 'true'` + React context `user.isMember` |

### Features Unlocked by Membership

| Feature | Non-Member | Member |
|---|---|---|
| Request a ride | Yes | Yes |
| View driver list | Yes | Yes |
| Select specific chauffeur | Yes | Yes |
| Advanced search filters | No (locked) | Yes |
| View driver amenities | No (locked) | Yes |
| Premium in-ride amenities | No (locked) | Yes |
| Ride credit balance display | No | Yes |
| 20% promo after membership purchase | No | Yes (one-time) |

### Membership State Detection

The app checks membership status in two ways (both must be considered):
```typescript
const isMember = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
```
This dual-check ensures membership persists across page refreshes (via localStorage) while also reflecting real-time context updates.

---

## 10. Payment System

### Ride Payment Methods (on `/track-ride`)

| Method | Icon | Notes |
|---|---|---|
| Apple Pay | Apple icon | Frontend only, no real processing |
| PayPal | Wallet icon | Frontend only |
| Credit Card | CreditCard icon | Frontend only |
| Cash Payment | DollarSign icon | Frontend only |

### Membership Payment Methods (on `/membership-payment`)

| Method | Icon | Notes |
|---|---|---|
| Apple Pay | Apple icon | Triggers membership activation |
| Credit Card | CreditCard icon | Triggers membership activation |

### Fare Breakdown (Ride Payment — Step 3)

| Item | Amount |
|---|---|
| Ride Fare | $24.00 |
| Service Fee | $3.00 |
| Total | $27.00 |

These values are hardcoded in the UI. The `pricing.ts` utility defines a separate base fare of $45.00 (used for future backend integration).

---

## 11. Pricing Logic

**File:** `src/utils/pricing.ts`

```typescript
export const BASE_FARE = 45.00;
export const COMMISSION_RATE = 0.15;  // 15%

// Cash payments incur a 20% surcharge
export const calculateFare = (paymentType: PaymentType = 'card') => {
  return paymentType === 'cash' ? BASE_FARE * 1.2 : BASE_FARE;
};

// Commission = 15% of fare
export const calculateCommission = (fare: number) => fare * COMMISSION_RATE;
```

| Payment Type | Base Fare | Multiplier | Final Fare |
|---|---|---|---|
| Card | $45.00 | 1.0x | $45.00 |
| Cash | $45.00 | 1.2x | $54.00 |
| Commission (any) | — | 15% | $6.75 / $8.10 |

Note: These utility functions are defined but the tracking screen currently displays hardcoded values ($24 + $3 = $27). The utility is available for future integration.

---

## 12. Mock Driver Data

**File:** `src/data/mockDrivers.ts`

5 pre-defined drivers are available in the application:

| ID | Name | Rating | Experience | Vehicle | ETA | Distance | Verified | Hotel Preferred |
|---|---|---|---|---|---|---|---|---|
| drv-001 | Michael Thompson | 4.9 | 12 yrs | Mercedes-Benz S-Class 2024 | 3 min | 0.8 mi | Yes | Yes |
| drv-002 | Sarah Martinez | 4.8 | 8 yrs | BMW 7 Series 2023 | 5 min | 1.2 mi | Yes | Yes |
| drv-003 | James Anderson | 5.0 | 15 yrs | Rolls-Royce Phantom 2024 | 7 min | 2.1 mi | Yes | Yes |
| drv-004 | David Chen | 4.7 | 6 yrs | Cadillac Escalade ESV 2024 | 4 min | 1.0 mi | Yes | No |
| drv-005 | Emily Roberts | 4.9 | 10 yrs | Mercedes-Benz Maybach S680 2024 | 6 min | 1.5 mi | Yes | Yes |

### Amenities by Driver

| Driver | WiFi | Water | Charger | Child Seat | Luggage | Music |
|---|---|---|---|---|---|---|
| Michael Thompson | Yes | Yes | Yes | No | 3 | Yes |
| Sarah Martinez | Yes | Yes | Yes | Yes | 2 | Yes |
| James Anderson | Yes | Yes | Yes | No | 4 | Yes |
| David Chen | Yes | Yes | Yes | Yes | 6 | No |
| Emily Roberts | Yes | Yes | Yes | No | 3 | Yes |

---

## 13. Reusable UI Components

**File:** `src/components/GlassCard.tsx`

### GlassCard

A glassmorphism-styled card container used throughout the entire application.

```typescript
interface GlassCardProps {
  children: ReactNode;
  className?: string;   // Additional Tailwind classes
  animate?: boolean;    // Enable/disable entrance animation (default: true)
  onClick?: () => void; // Optional click handler
}
```

**Visual Properties:**
- Background: `bg-black/60` with `backdrop-blur-xl`
- Border: `border-2 border-[#D4AF37]/20` (gold, 20% opacity)
- Border radius: `rounded-2xl`
- Shadow: `shadow-2xl shadow-black/50`
- Hover: border brightens to `border-[#D4AF37]/40`, shadow turns gold-tinted
- Entrance animation: fades in from `y: 20` to `y: 0` over 0.4s (when `animate=true`)

---

### GoldButton

A premium gold-styled button with three variants.

```typescript
interface GoldButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';  // default: 'primary'
  disabled?: boolean;
  icon?: ReactNode;
}
```

**Variants:**

| Variant | Background | Text | Border |
|---|---|---|---|
| primary | `#D4AF37` gold | Black | None |
| secondary | Transparent | Gold | 2px gold |
| ghost | Transparent | Gold | Transparent (gold on hover) |

**Interactions:**
- Hover: scales up to 1.03x
- Tap/Click: scales down to 0.97x
- Disabled: 50% opacity, no scale animation, `cursor-not-allowed`
- All transitions use spring-like easing `[0.22, 1, 0.36, 1]`

---

### DummyMap (Internal Component in PassengerTrackingWeb)

An animated SVG-based map simulation rendered inside the tracking screen.

**Props:** `pickup: string`, `dropoff: string`, `driverName: string`

**Features:**
- SVG canvas: 340×200 viewBox
- Grid lines every 40px (dark gray `#1a1a1a`)
- 6 building rectangles (simulated city blocks)
- Bezier curve route path in gold (dashed background + solid progress overlay)
- Animated driver dot moving along the bezier curve (loops from 15% to 88%)
- Green circle = pickup point, Red circle = drop-off point
- Gold animated dot = driver position
- Progress updates every 80ms (+0.004 per tick)
- Header: "Live Tracking" with pulsing navigation icon
- Footer: driver name + "Live" pulsing indicator

---

## 14. App Download & Coupon System

After a successful ride payment, the app presents a popup offering a **$100 coupon** to incentivize mobile app download.

### Coupon Generation Logic

```typescript
const token = Math.random().toString(36).slice(2, 8).toUpperCase();
const coupon = {
  code: `TUX100-${token}`,          // e.g., TUX100-A3F9KZ
  amount: 100,
  linkedIdentity: {
    phone: user?.phone || null,
    email: user?.email || null,
  },
  status: 'pending_app_login',       // Awaiting app login to activate
  issuedAt: new Date().toISOString(),
};
localStorage.setItem('pendingAppDownloadCoupon', JSON.stringify(coupon));
```

### Coupon States
- `pending_app_login` — Coupon issued, waiting for user to log in on the mobile app to activate

### App Store Link
- Opens: `https://apps.apple.com` (iOS App Store)
- Opens in a new browser tab

---

## 15. Local Storage Usage

The application uses `localStorage` for lightweight persistence across page refreshes:

| Key | Value | Set When | Read Where |
|---|---|---|---|
| `isMember` | `'true'` | After membership payment | All screens (membership checks) |
| `pendingAppDownloadCoupon` | JSON object | After "Download App" tapped | Not read in frontend (for backend/app use) |

### Membership Persistence
```typescript
// Written on membership purchase:
localStorage.setItem('isMember', 'true');

// Read everywhere membership is checked:
const isMember = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
```

---

## 16. Design System & Theming

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Gold Primary | `#D4AF37` | Buttons, borders, icons, accents |
| Gold Dark | `#B8962A` | Gold hover states |
| Background | `#000000` | Page background |
| Card Background | `rgba(0,0,0,0.6)` | GlassCard background |
| Text Primary | `#FFFFFF` | Main text |
| Text Secondary | `#9CA3AF` (gray-400) | Subtitles, labels |
| Text Muted | `#4B5563` (gray-600) | Disabled/placeholder text |
| Success | `#22C55E` (green-500) | Confirmation states |
| Error/Destination | `#EF4444` (red-500) | Drop-off marker |

### Typography
- Font family: System sans-serif (`font-sans`)
- Headings: `font-black` (900 weight), `uppercase`, `italic`
- Labels: `font-black`, `uppercase`, `tracking-widest` (very wide letter spacing)
- Body: `font-medium` or `font-bold`

### Animation Library
All animations use `motion/react` (Framer Motion):
- Page transitions: `AnimatePresence` with `mode="wait"`
- Entrance: fade + slide up (`opacity: 0, y: 20` → `opacity: 1, y: 0`)
- Scale animations: spring physics (`stiffness: 200, damping: 15`)
- Progress bar: linear animation over 15s, loops infinitely
- Driver map dot: interval-based position update every 80ms

### Responsive Design
- Max width containers: `max-w-md` (448px) for single-column screens, `max-w-2xl` (672px) for driver list/profile
- Mobile-first layout
- `overflow-x-hidden` on root to prevent horizontal scroll

---

## 17. Feature Access Control (Membership Gating)

Several features are locked behind the Tuxedo Gold membership. Here is a complete map of all gated features:

### Gated Features

| Screen | Feature | Non-Member Behavior | Member Behavior |
|---|---|---|---|
| `/track-ride` (tracking) | Premium Amenities display | Shows "locked" with Buy Membership CTA | Shows amenity tags (WiFi, Refreshments, Leather Interior) |
| `/track-ride` (tracking) | 20% promo banner | Not shown | Shown after membership purchase |
| `/track-ride` (bottom) | Membership banner | Shows upsell CTA | Shows Gold status + credit balance |
| `/driver-list` | Search filters | Lock icon, tapping goes to /membership | Filter panel opens |
| `/driver-list` | Ride credit badge | Not shown | Shows credit balance |
| `/driver-profile` | Premium amenities section | Locked with "Join Membership" link | Full amenity grid shown |
| `/driver-profile` | Ride credit badge | Not shown | Shows credit balance |

### Membership Check Pattern (used across all screens)
```typescript
const isMember = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
```

---

## 18. Navigation & Back Handling

### Back Button Behavior

| Screen | Back Button Action |
|---|---|
| `/track-ride` — config step | `navigate(-1)` (browser back) |
| `/track-ride` — payment step | Returns to config step |
| `/track-ride` — secure-payment step | Returns to payment step |
| `/track-ride` — tracking step | Returns to payment step |
| `/membership` | `navigate(-1)` |
| `/membership-payment` | `navigate(-1)` |
| `/driver-list` | `navigate(-1)` |
| `/driver-profile` | `navigate(-1)` |
| `/reserve-ride` | `navigate(-1)` |

### Route State Passing

The app heavily uses React Router's `location.state` to pass context between screens without URL parameters:

| From | To | State Passed |
|---|---|---|
| `/track-ride` | `/membership` | `{ fromTrackRide: true, paymentMethod }` |
| `/membership` | `/membership-payment` | Forwards incoming state |
| `/membership` | `/driver-list` | `{ fromTrackRide: true, paymentMethod }` |
| `/membership-payment` | `/driver-list` | `{ fromMembershipPurchase: true, paymentMethod }` |
| `/driver-list` | `/driver-profile` | `{ driver, fromTrackRide: true, paymentMethod }` |
| `/driver-list` | `/track-ride` | `{ fromMembershipPurchase: true, paymentMethod, selectedDriver }` |
| `/driver-profile` | `/track-ride` | `{ fromMembershipPurchase: true, paymentMethod, selectedDriver }` |
| `/reserve-ride` | `/track-ride` | `{ reservedDate, reservedTime, pickupLocation }` |

### Deep Link Support
The `/track-ride` screen supports a `?pickup=` URL query parameter to pre-fill the pickup location:
```
https://app.tuxedo.com/track-ride?pickup=The+Ritz+Carlton
```

---

*End of Tuxedo Passenger Web Application Documentation*

---

> This document was generated based on a complete analysis of the frontend source code.
> All features, flows, and behaviors described reflect the current state of the frontend-only application.
> No backend, API, or real payment processing exists in this codebase.
