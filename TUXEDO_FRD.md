# Functional Requirements Document (FRD)
# Tuxedo — Passenger Web Application

> Document Type: Functional Requirements Document (FRD)
> Application: Tuxedo Passenger Web App
> Platform: Web Browser (Mobile-First)
> Scope: Frontend Only — No backend or real payment processing exists

---

## Table of Contents

1. [Screen 1 — Ride Request: Step 1 (Config)](#screen-1--ride-request-step-1-config)
2. [Screen 2 — Ride Request: Step 2 (Payment Method)](#screen-2--ride-request-step-2-payment-method)
3. [Screen 3 — Ride Request: Step 3 (Secure Payment)](#screen-3--ride-request-step-3-secure-payment)
4. [Screen 4 — Ride Request: Step 4 (Live Tracking)](#screen-4--ride-request-step-4-live-tracking)
5. [Screen 5 — App Download Popup (Modal)](#screen-5--app-download-popup-modal)
6. [Screen 6 — Membership Screen](#screen-6--membership-screen)
7. [Screen 7 — Membership Payment Screen](#screen-7--membership-payment-screen)
8. [Screen 8 — Driver List Screen](#screen-8--driver-list-screen)
9. [Screen 9 — Driver Profile Screen](#screen-9--driver-profile-screen)
10. [Screen 10 — Reserve a Ride Screen](#screen-10--reserve-a-ride-screen)
11. [Screen 11 — Calendar Modal](#screen-11--calendar-modal)

---

---

## Screen 1 — Ride Request: Step 1 (Config)

Route: `/track-ride` | Step State: `config`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 1: Ride Config ]

&nbsp;

---

### What the User Sees

- App name "TUXEDO" at the top center
- A badge showing "RIDE CONFIGURATION"
- Pickup location displayed as a read-only field labeled "Set by Concierge"
- A text input field for the drop-off location
- A "Request Chauffeur" button at the bottom
- A persistent membership status banner at the very bottom of the screen

### Functional Requirements

FR-01: The system must display the pickup location automatically. It is resolved in this priority order:
  - First: URL query parameter `?pickup=` (deep link)
  - Second: `user.hotelName` from app context
  - Fallback: "The Grand Majestic Hotel"

FR-02: The pickup location field must be read-only. The passenger cannot edit it.

FR-03: The passenger must type a drop-off location in the input field before proceeding.

FR-04: The "Request Chauffeur" button must remain disabled (non-clickable) as long as the drop-off field is empty.

FR-05: When the drop-off field has any text and the passenger taps "Request Chauffeur", the system must:
  - Save the drop-off location and ride status to the active ride context
  - Move the screen to Step 2 (Payment Method)

FR-06: The Back button must be hidden (invisible) on this step since it is the first step.

FR-07: The membership banner at the bottom must always be visible on this screen regardless of step.
  - If the passenger is NOT a member: show "Tuxedo Basic Status" with "Join for $100 & Get $100 Credit" and a right-arrow button. Tapping it navigates to `/membership`.
  - If the passenger IS a member: show "Tuxedo Gold Member" with their ride credit balance and a green "Active" checkmark. Tapping does nothing.

### Screen Flow

```
[User opens app] → /track-ride (Step: config)
    ↓ User enters drop-off location
    ↓ Taps "Request Chauffeur"
→ Step 2: Payment Method
```

### Business Rules

BR-01: Pickup location is always set externally (by concierge or deep link). The passenger has no control over it.

BR-02: A ride cannot be initiated without a drop-off location. The button is disabled to enforce this.

BR-03: Membership status is checked from both localStorage (`isMember = 'true'`) and the user context (`user.isMember`). Both are evaluated together.

---

---

## Screen 2 — Ride Request: Step 2 (Payment Method)

Route: `/track-ride` | Step State: `payment`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 2: Payment Method ]

&nbsp;

---

### What the User Sees

- "Select Payment Method" heading
- "Secure Payment Processing" subtitle
- Four payment method options listed as selectable cards:
  1. Apple Pay
  2. PayPal
  3. Credit Card
  4. Cash Payment
- A Back button at the top left

### Functional Requirements

FR-08: The system must display all four payment options: Apple Pay, PayPal, Credit Card, Cash Payment.

FR-09: Each payment option must be a tappable card. Tapping any option must:
  - Store the selected payment method in local state
  - Immediately navigate to Step 3 (Secure Payment) — no separate confirm button needed

FR-10: The selected payment method card must show a gold checkmark to indicate selection.

FR-11: The Back button must be visible and functional. Tapping it returns the user to Step 1 (Config).

FR-12: The passenger cannot proceed without selecting a payment method. Since tapping a method immediately advances the step, there is no way to reach Step 3 without a selection.

### Screen Flow

```
Step 1 (Config)
    ↓ Taps "Request Chauffeur"
→ Step 2: Payment Method
    ↓ Taps any payment option
→ Step 3: Secure Payment
    ↑ Back button
→ Step 1: Config
```

### Business Rules

BR-04: Selecting a payment method is a single-tap action — it both selects and advances the flow simultaneously.

BR-05: All four payment methods are treated equally in the frontend. No method triggers different behavior at this step.

---

---

## Screen 3 — Ride Request: Step 3 (Secure Payment)

Route: `/track-ride` | Step State: `secure-payment`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 3: Secure Payment ]

&nbsp;

---

### What the User Sees

- A lock icon with "Secure Payment" heading
- "256-bit SSL Encrypted" label
- A summary box showing the selected payment method name
- Fare breakdown:
  - Ride Fare: $24.00
  - Service Fee: $3.00
  - Total: $27.00
- "Confirm Payment" gold button
- "Secured by Tuxedo Financial" footer note
- Back button at top left

### Functional Requirements

FR-13: The system must display the payment method selected in Step 2 inside the summary box.

FR-14: The fare breakdown must always show:
  - Ride Fare: $24.00
  - Service Fee: $3.00
  - Total: $27.00

FR-15: The "Confirm Payment" button must be always enabled on this screen (no additional validation required).

FR-16: When the passenger taps "Confirm Payment", the system must:
  - Update the active ride context with the payment method and status "tracking"
  - Trigger the App Download Popup to appear
  - Advance the screen to Step 4 (Live Tracking)

FR-17: The Back button must return the user to Step 2 (Payment Method).

### Screen Flow

```
Step 2 (Payment Method)
    ↓ Taps a payment option
→ Step 3: Secure Payment
    ↓ Taps "Confirm Payment"
→ Step 4: Live Tracking + App Download Popup appears
    ↑ Back button
→ Step 2: Payment Method
```

### Business Rules

BR-06: The fare values ($24.00, $3.00, $27.00) are fixed display values. They do not change based on payment method or destination.

BR-07: Payment confirmation does not trigger any real transaction. It is a frontend-only state transition.

BR-08: The App Download Popup is always triggered after payment confirmation, regardless of membership status.

---

---

## Screen 4 — Ride Request: Step 4 (Live Tracking)

Route: `/track-ride` | Step State: `tracking`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 4: Live Tracking ]

&nbsp;

---

### What the User Sees

- Badge changes to "CHAUFFEUR EN ROUTE"
- An animated map simulation showing:
  - A route path from pickup (green dot) to drop-off (red dot)
  - A gold animated dot representing the driver moving along the route
  - Pickup and drop-off location labels on the map
  - "Live Tracking" label with a pulsing icon
  - Driver name shown as "en route" at the bottom of the map
- A confirmation card below the map showing:
  - Green checkmark
  - Driver avatar placeholder and vehicle placeholder
  - Driver name (default: "Michael S." or the selected driver's name)
  - 5-star rating display with rating value (default: "4.9")
  - An animated progress bar showing driver arrival progress
  - ETA text: "Live: Driver is 3 mins away in a [vehicle name]"
  - Premium Amenities section (behavior depends on membership)
  - A promo banner (only shown after membership purchase)
- Persistent membership banner at the bottom

### Functional Requirements

FR-18: The map must animate continuously — the driver dot moves from pickup toward drop-off in a loop (15% to 88% of the route, then resets).

FR-19: The driver information displayed must come from:
  - The `selectedDriver` passed via route state (if user came from driver list)
  - Default values (Michael S., 4.9 rating, Black S-Class) if no driver was selected

FR-20: The Premium Amenities section must behave as follows:
  - If the passenger IS a member: display amenity tags (WiFi, Refreshments, Leather Interior)
  - If the passenger is NOT a member: show "Premium amenities locked" text and a "Buy Membership" button

FR-21: Tapping "Buy Membership" in the locked amenities section must navigate to `/membership` and pass `fromTrackRide: true` and the current `paymentMethod` in route state.

FR-22: The promo banner "20% Off Your Next Journey!" must only appear if the passenger arrived at this screen after completing a membership purchase (`fromMembershipPurchase: true` in route state).

FR-23: When this screen receives `fromMembershipPurchase: true` in route state, the system must:
  - Skip Steps 1–3 and go directly to tracking
  - Enable premium amenities display
  - Show the promo banner
  - Trigger the App Download Popup

FR-24: When this screen receives `fromMembershipSkip: true` in route state, the system must:
  - Skip Steps 1–3 and go directly to tracking
  - Keep premium amenities locked
  - Not show the promo banner
  - Still trigger the App Download Popup

FR-25: The Back button on this step must return the user to Step 2 (Payment Method), not Step 1.

### Screen Flow

```
Step 3 (Secure Payment) → Confirm Payment
    ↓
Step 4: Live Tracking
    + App Download Popup appears automatically

OR

Driver List / Driver Profile → Select/Assign Chauffeur
    ↓
Step 4: Live Tracking (with selected driver, premium amenities unlocked)
    + App Download Popup appears automatically
```

### Business Rules

BR-09: The map is a simulation only. It does not use real GPS or live driver data.

BR-10: Premium amenities are only visible to Gold members. Non-members see a locked state with a membership upsell.

BR-11: The promo banner is a one-time display triggered only by the membership purchase flow, not by simply being a member.

BR-12: Route state is cleared after being consumed (navigate with `state: null`) to prevent re-triggering on refresh.

---

---

## Screen 5 — App Download Popup (Modal)

Route: Overlay on `/track-ride` (Step 4) | Trigger: Auto after payment or membership purchase

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 5: App Download Popup ]

&nbsp;

---

### What the User Sees

- A full-screen dark overlay (backdrop blur)
- A centered modal card with:
  - Gift icon
  - "Exclusive Offer" label
  - "FREE $100 Coupon" headline
  - Description: "Download our app or buy a membership and get $100 free on your next ride."
  - Three action buttons:
    1. "Download App" (primary gold button)
    2. "Buy Membership" (gold outline button)
    3. "Skip for Now" (text-only button)

### Functional Requirements

FR-26: The popup must appear automatically after the passenger confirms payment (Step 3 → Step 4 transition).

FR-27: The popup must also appear when the passenger returns to the tracking screen after a membership purchase.

FR-28: Tapping "Download App" must:
  - Generate a unique coupon code in the format `TUX100-XXXXXX` (6 random uppercase alphanumeric characters)
  - Save the coupon to localStorage under the key `pendingAppDownloadCoupon` with the following data:
    - `code`: the generated coupon string
    - `amount`: 100
    - `linkedIdentity`: `{ phone: user.phone or null, email: user.email or null }`
    - `status`: "pending_app_login"
    - `issuedAt`: current ISO timestamp
  - Open `https://apps.apple.com` in a new browser tab
  - Close the popup

FR-29: Tapping "Buy Membership" must:
  - Close the popup
  - Navigate to `/membership`

FR-30: Tapping "Skip for Now" must:
  - Close the popup only
  - No navigation, no data saved

FR-31: The popup must block interaction with the screen behind it while open (modal overlay behavior).

FR-32: The popup must be dismissible only via one of the three buttons. Tapping the backdrop does not close it.

### Screen Flow

```
Step 4: Live Tracking
    ↓ Popup appears automatically
    ├── "Download App" → Coupon saved to localStorage + App Store opens + Popup closes
    ├── "Buy Membership" → Popup closes + Navigate to /membership
    └── "Skip for Now" → Popup closes, stay on tracking
```

### Business Rules

BR-13: A new coupon code is generated every time "Download App" is tapped. Previous coupons in localStorage are overwritten.

BR-14: The coupon status "pending_app_login" means it is not yet active — it requires the user to log in on the mobile app to redeem it.

BR-15: The popup is shown regardless of whether the user is already a member.

---

---

## Screen 6 — Membership Screen

Route: `/membership`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 6: Membership ]

&nbsp;

---

### What the User Sees

- Back button
- Crown icon with "Tuxedo Gold" heading
- Membership price card: $100/year
- "Get $100 Instant Ride Credit" incentive in green
- A list of 5 membership benefits with gold checkmarks:
  1. Manual Chauffeur Selection
  2. View Full Driver Amenities
  3. Advanced Search Filters
  4. Priority Dispatching
  5. Exclusive Luxury Fleet Access
- "Buy Membership" gold button
- "Continue Without Membership" text button (only visible in certain flows)

### Functional Requirements

FR-33: The screen must always display all 5 membership benefits regardless of how the user arrived.

FR-34: Tapping "Buy Membership" must navigate to `/membership-payment` and forward the current route state (so the payment screen knows where to redirect after completion).

FR-35: The "Continue Without Membership" button must only be visible when the passenger arrived from the tracking screen (`fromTrackRide: true` in route state).

FR-36: Tapping "Continue Without Membership" must navigate to `/driver-list` and pass:
  - `fromTrackRide: true`
  - `paymentMethod`: the payment method from the incoming route state (or null)

FR-37: The Back button must navigate to the previous screen in browser history.

### Screen Flow

```
Arrived from /track-ride (locked amenities or membership banner):
    ↓
/membership
    ├── "Buy Membership" → /membership-payment (with state forwarded)
    ├── "Continue Without Membership" → /driver-list (fromTrackRide: true)
    └── Back → /track-ride

Arrived from App Download Popup:
    ↓
/membership
    ├── "Buy Membership" → /membership-payment
    └── Back → /track-ride
```

### Business Rules

BR-16: The "Continue Without Membership" option is only shown when the user is mid-ride-flow (came from track-ride). It is not shown when the user navigates to membership from other entry points.

BR-17: Membership price is fixed at $100/year. This is a display value only.

BR-18: The $100 ride credit is an incentive shown on this screen. It is applied after payment is completed on the next screen.

---

---

## Screen 7 — Membership Payment Screen

Route: `/membership-payment`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 7: Membership Payment ]

&nbsp;

---

### What the User Sees

- Back button
- Shield check icon with "Complete Payment" heading
- "Annual Gold Membership" subtitle
- Total due: $100.00
- "Includes $100 Ride Credit" incentive in green
- Two payment method buttons:
  1. Apple Pay
  2. Credit Card
- Security note: "Secure payment processed by Tuxedo Financial. Membership unlocks full driver profiles and amenities."

### Functional Requirements

FR-38: The screen must display the total amount as $100.00 (fixed, non-editable).

FR-39: Both payment buttons (Apple Pay and Credit Card) must trigger the same `handlePayment` function when tapped.

FR-40: When `handlePayment` is triggered, the system must:
  - Set `localStorage` key `isMember` to `'true'`
  - Update the user context: `isMember = true`, `rideCredit = 100`
  - Navigate to `/driver-list` with route state:
    - `fromMembershipPurchase: true`
    - `paymentMethod`: the payment method from the incoming route state (or null)

FR-41: The Back button must navigate to the previous screen (Membership Screen).

FR-42: There is no payment method selection state on this screen — tapping either button immediately processes the "payment" and redirects.

### Screen Flow

```
/membership → "Buy Membership"
    ↓
/membership-payment
    ├── Tap "Apple Pay" or "Credit Card"
    │     → localStorage: isMember = 'true'
    │     → user context: isMember = true, rideCredit = 100
    │     → Navigate to /driver-list (fromMembershipPurchase: true)
    └── Back → /membership
```

### Business Rules

BR-19: Both Apple Pay and Credit Card perform identical actions. There is no differentiation between them.

BR-20: After payment, the user is always redirected to the Driver List screen, not back to the tracking screen directly. This is intentional — the user must now select a chauffeur.

BR-21: The $100 ride credit is set in the user context immediately upon payment. It is not fetched from a server.

BR-22: Membership status persists across page refreshes via localStorage.

---

---

## Screen 8 — Driver List Screen

Route: `/driver-list`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 8: Driver List ]

&nbsp;

---

### What the User Sees

- Back button (top left)
- Ride credit balance badge (top center — members only)
- Filters button (top right):
  - Members: shows "Filters" with a sliders icon
  - Non-members: shows "Unlock Filters" with a lock icon
- "Available Chauffeurs" heading
- Count of drivers currently shown (e.g., "4 drivers found for your schedule")
- Collapsible filter panel (members only, shown when Filters button is tapped):
  - "Hotel Preferred Only" checkbox (default: unchecked)
  - "Verified Only" checkbox (default: checked)
- List of driver cards, each showing:
  - Driver avatar (placeholder) with a verified shield badge if verified
  - Vehicle placeholder icon
  - Driver first name + last initial (e.g., "Michael T.")
  - Star rating
  - Vehicle brand and model
  - Distance in miles
  - ETA in minutes
  - "View Profile" button
  - "Select Chauffeur" gold button

### Functional Requirements

FR-43: The system must load and display all drivers from the mock driver data on screen load.

FR-44: The driver list must be filtered in real time based on active filter values:
  - `hotelPreferred: true` → only show drivers where `driver.hotelPreferred === true`
  - `verified: true` → only show drivers where `driver.verified === true`
  - `minRating: 4.5` → only show drivers with `driver.rating >= 4.5`
  - `maxDistance: 5` → only show drivers with `driver.distance <= 5`

FR-45: Default filter state on load:
  - Hotel Preferred: false (unchecked)
  - Verified Only: true (checked)
  - Min Rating: 4.5
  - Max Distance: 5 miles

FR-46: The filter panel must only be accessible to members. If a non-member taps the "Unlock Filters" button, the system must navigate to `/membership`.

FR-47: The ride credit badge must only be visible to members. It must display the user's current `rideCredit` value formatted to 2 decimal places.

FR-48: Tapping "View Profile" on a driver card must navigate to `/driver-profile` and pass:
  - The full driver object
  - `fromTrackRide: true`
  - `paymentMethod` from the incoming route state (or null)

FR-49: Tapping "Select Chauffeur" on a driver card must navigate to `/track-ride` and pass:
  - `fromMembershipPurchase: true`
  - `paymentMethod` from the incoming route state (or null)
  - The full driver object as `selectedDriver`

FR-50: The Back button must navigate to the previous screen in browser history.

FR-51: The driver count label must update dynamically as filters change (e.g., "3 drivers found").

### Screen Flow

```
/membership-payment → payment complete
    ↓
/driver-list
    ├── Tap "Filters" (member) → Filter panel expands/collapses
    ├── Tap "Unlock Filters" (non-member) → /membership
    ├── Tap "View Profile" → /driver-profile (with driver data)
    ├── Tap "Select Chauffeur" → /track-ride (tracking step, with driver)
    └── Back → previous screen
```

### Business Rules

BR-23: All 5 mock drivers are always loaded. Filtering reduces what is displayed but does not remove data.

BR-24: The "Verified Only" filter is ON by default. This means non-verified drivers are hidden unless the user unchecks it.

BR-25: Non-members can still view the driver list and select a chauffeur — they just cannot use filters or see driver amenities.

BR-26: The driver name is displayed as first name + last initial only (e.g., "Michael T.") for privacy consistency.

BR-27: The verified shield badge on the driver avatar is only shown if `driver.verified === true`.

---

---

## Screen 9 — Driver Profile Screen

Route: `/driver-profile`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 9: Driver Profile ]

&nbsp;

---

### What the User Sees

- Back button (top left)
- Ride credit balance badge (top right — members only)
- Large driver avatar showing the driver's first initial in gold
- Verified shield badge on the avatar (if driver is verified)
- Driver first name + last initial
- Two stats side by side: Rating and Years of Experience
- Vehicle Details section showing:
  - Make/Model
  - License Plate (partially masked, e.g., ***LUX24)
  - Year
  - Interior type
- Premium Amenities section:
  - Members: see amenity tags for WiFi, Audio/Music, Child Seat (only those the driver has)
  - Non-members: see a locked section with "Join Membership to View" link
- A static driver bio quote
- "Assign This Chauffeur" gold button at the bottom

### Functional Requirements

FR-52: The screen must display the driver passed via route state (`location.state.driver`). If no driver is passed, it must fall back to the first driver in the mock data list.

FR-53: The vehicle details section must always be visible to all users (members and non-members).

FR-54: The Premium Amenities section must be gated by membership:
  - Members: display only the amenities the driver actually has (`driver.amenities.wifi`, `driver.amenities.music`, `driver.amenities.childSeat`)
  - Non-members: show a locked placeholder with a "Join Membership to View" link

FR-55: Tapping "Join Membership to View" (non-members) must navigate to `/membership`.

FR-56: Tapping "Assign This Chauffeur" must navigate to `/track-ride` and pass:
  - `fromMembershipPurchase: true`
  - `paymentMethod` from the incoming route state (or null)
  - The full driver object as `selectedDriver`

FR-57: The ride credit badge must only be visible to members and must show the current credit balance.

FR-58: The Back button must navigate to the previous screen (Driver List).

FR-59: The license plate must always be displayed in its masked format (e.g., `***LUX24`). The masking is applied in the data source, not on this screen.

### Screen Flow

```
/driver-list → "View Profile"
    ↓
/driver-profile
    ├── Non-member: Amenities locked → "Join Membership to View" → /membership
    ├── Member: Amenities visible
    ├── "Assign This Chauffeur" → /track-ride (tracking, with this driver)
    └── Back → /driver-list
```

### Business Rules

BR-28: Vehicle details (make, model, plate, year, interior) are visible to all users. Only amenities are membership-gated.

BR-29: The driver bio is a static string — it is the same for all drivers.

BR-30: Assigning a chauffeur from this screen sends `fromMembershipPurchase: true` in route state, which causes the tracking screen to show premium amenities and the promo banner — regardless of whether the user actually purchased a membership on this visit. This is the intended behavior for the driver selection flow.

---

---

## Screen 10 — Reserve a Ride Screen

Route: `/reserve-ride`

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 10: Reserve a Ride ]

&nbsp;

---

### What the User Sees

- Back button
- Calendar icon with "Reserve a Ride" heading and "Schedule your chauffeur in advance" subtitle
- Pickup location card (read-only)
- Date picker card with a "Tap to choose a date" button
- Time picker card with:
  - Large time display in gold (e.g., "09:00 AM")
  - Scrollable hour selector (01 through 12)
  - Minute selector with 4 options: 00, 15, 30, 45
  - AM/PM toggle
- Booking Summary card (appears only after a date is selected):
  - Selected date (full format: e.g., "Monday, April 28, 2026")
  - Selected time
  - Pickup location
- Fixed "Confirm Reservation" button pinned to the bottom of the screen

### Functional Requirements

FR-60: The pickup location must be read from route state (`location.state.pickupLocation`). If not provided, it defaults to "The Grand Majestic Hotel".

FR-61: The pickup location field must be read-only. The passenger cannot change it.

FR-62: Tapping the date picker button must open the Calendar Modal.

FR-63: The time picker must allow the passenger to select:
  - Hour: any value from 01 to 12 (scrollable horizontal list)
  - Minute: one of 00, 15, 30, 45
  - Period: AM or PM

FR-64: The time display must update in real time as the passenger changes hour, minute, or AM/PM.

FR-65: The default time on load must be 09:00 AM.

FR-66: The Booking Summary card must only appear after the passenger has selected a date. It must not be visible before a date is chosen.

FR-67: The "Confirm Reservation" button must be disabled until a date is selected. Time selection alone is not sufficient to enable it.

FR-68: When the passenger taps "Confirm Reservation", the system must navigate to `/track-ride` and pass:
  - `reservedDate`: the selected date as an ISO string
  - `reservedTime`: the formatted time string (e.g., "09:00 AM")
  - `pickupLocation`: the pickup location

FR-69: The Back button must navigate to the previous screen.

### Screen Flow

```
[Navigate to /reserve-ride]
    ↓
Pickup shown (read-only)
    ↓ Tap date picker
→ Calendar Modal opens
    ↓ Select a date
→ Calendar closes, date shown, Booking Summary appears
    ↓ Adjust time (optional, defaults to 09:00 AM)
    ↓ Tap "Confirm Reservation"
→ /track-ride (with reservedDate, reservedTime, pickupLocation)
```

### Business Rules

BR-31: Past dates are disabled in the calendar. The passenger can only select today or future dates.

BR-32: Time selection is always available regardless of date selection. However, the confirm button only activates after a date is chosen.

BR-33: Minutes are restricted to 15-minute intervals (00, 15, 30, 45). Free-form minute entry is not supported.

BR-34: The reservation data is passed to the tracking screen via route state only. It is not stored in localStorage or any persistent storage.

---

---

## Screen 11 — Calendar Modal

Route: Overlay on `/reserve-ride` | Trigger: Tapping the date picker button

&nbsp;

[ INSERT SCREENSHOT HERE — Screen 11: Calendar Modal ]

&nbsp;

---

### What the User Sees

- A full-screen dark overlay (backdrop blur)
- A centered modal with:
  - Previous month arrow button (left)
  - Current month and year label (center, e.g., "APRIL 2026")
  - Next month arrow button (right)
  - Day-of-week headers: SU, MO, TU, WE, TH, FR, SA
  - A 7-column grid of day buttons for the current month
  - A "Cancel" button at the bottom

### Functional Requirements

FR-70: The calendar must open showing the current month and year by default.

FR-71: The previous month arrow must navigate to the prior month. When on January, it must wrap to December of the previous year.

FR-72: The next month arrow must navigate to the next month. When on December, it must wrap to January of the next year.

FR-73: Past dates (before today) must be displayed as grayed out and must not be tappable.

FR-74: Today's date must be highlighted with a gold border.

FR-75: The selected date must be highlighted with a solid gold background and black text.

FR-76: Tapping a valid (non-past) date must:
  - Set that date as the selected date
  - Close the calendar modal automatically

FR-77: Tapping "Cancel" must close the calendar without changing the selected date.

FR-78: Tapping the backdrop (outside the modal card) must close the calendar without changing the selected date.

### Screen Flow

```
/reserve-ride → Tap date picker
    ↓
Calendar Modal opens
    ├── Navigate months with arrows
    ├── Tap a valid date → date selected + modal closes
    ├── Tap "Cancel" → modal closes, no change
    └── Tap backdrop → modal closes, no change
```

### Business Rules

BR-35: The calendar prevents selection of past dates at the UI level. The disabled state is calculated by comparing each date against today's date at midnight.

BR-36: Month navigation has no upper or lower limit — the user can navigate to any future or past month, but past dates within those months remain disabled.

BR-37: Only one date can be selected at a time. Selecting a new date replaces the previous selection.

---

*End of Functional Requirements Document*

> This FRD is based entirely on the Tuxedo Passenger Web Application frontend source code.
> All requirements described reflect actual implemented behavior in the frontend.
> No backend, API, or real payment processing is part of this document's scope.
