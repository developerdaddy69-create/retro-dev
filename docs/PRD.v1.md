# PRD v1 (LOCKED) — Photo/Video Studio Booking Platform

Tracks issue [#2](https://github.com/developerdaddy69-create/retro-dev/issues/2).

## Requirement (as given)

> a website for photostudios which will be used to get appointment of
> photo/video contract based on availability of vendores. it will require
> two login one for vendor one for public , vendor can set the charge
> he/she will do for a photoshoot /types of page he should offer for photo
> album what are included like drone,album,video shoot, type of video
> shoot. it should also gave what type of photoshoot user can opt for. can
> give multiple option liker birthday shot,pre wedding,wedding,travelling
> and all. Rest you can add more details as musc as possible and create a
> new well #d animated website .

## Summary

A two-sided marketplace connecting independent photo/video studios
("vendors") with people who want to book a shoot ("public" users). Vendors
set their own pricing, package contents, and availability; public users
discover vendors, pick a shoot type, and book a slot with an online
deposit. The public-facing site is a modern, animated, Three.js-driven
experience — not a plain form-based booking page.

## Scope decision: v1.1 "Fast core first"

The human explicitly chose to launch the essential path first and
fast-follow with the rest, rather than shipping everything at once. This
locks the following phasing:

**v1.1 (this build, ship ASAP):**
- Vendor signup + admin approval/verification workflow (ID + portfolio
  review) before a vendor listing goes live
- Public browse/discovery of approved vendors
- Vendor package management: price, what's included (drone, album, video
  edit, hours/photos, etc.), and shoot types offered (birthday,
  pre-wedding, wedding, travel, and others — vendor-defined, not a fixed
  enum)
- Availability & booking engine that accounts for date/time slot **and**
  resource constraints (crew count, equipment such as a single drone —
  i.e. multi-factor availability, not just a calendar grid)
- Stripe-based online deposit (25–30% of package price) required to
  confirm a booking; remaining balance is paid to the vendor directly on
  shoot day, outside the platform
- Cancellation/rescheduling policy (tiered, see below), enforced by the
  system
- Email notifications for booking confirmation, reminders, and
  cancellations (no SMS in v1.1)
- Admin dashboard: vendor approval queue, listing moderation, dispute
  visibility
- The full animated/3D public marketing + browse experience (this is not
  deferred — it's part of the core launch, per the human's explicit
  instruction to make it a "well 3D animated website")

**v1.2 (fast-follow, not blocking v1.1 launch):**
- Reviews/ratings on completed shoots
- Any additional admin/dispute tooling beyond the basics above
- Extra polish/animation passes beyond the v1.1 baseline

## Decisions locked from human answers

1. **Marketplace model**: Many independent vendors competing side by
   side (not a single-studio multi-staff site).
2. **Payments**: Online deposit (25–30%) via **Stripe** at booking time;
   balance settled directly with the vendor on shoot day. The platform
   never touches or stores raw card data (Stripe Elements/Checkout
   handles that).
3. **Vendor commission**: None in v1 — free for vendors.
4. **Vendor verification**: Required. New vendors must be approved (ID +
   portfolio review) via the admin dashboard before their listing is
   publicly visible.
5. **Availability model**: Multi-factor — date/time slot plus resource
   constraints (crew, equipment such as drones). A vendor cannot be
   double-booked on a resource they don't have duplicates of.
6. **Cancellation/rescheduling** (system-enforced):
   - Reschedule: free up to 48 hours before the shoot; inside 48 hours is
     at the vendor's discretion.
   - Cancellation refund tiers: full deposit refund at 7+ days out, 50%
     refund at 3–7 days out, no refund inside 72 hours.
7. **Reviews/ratings**: Yes, wanted — deferred to v1.2 fast-follow.
8. **Notifications**: Email only for v1.1 (confirmation, reminder,
   cancellation). No SMS.
9. **Admin role**: Yes — vendor approval queue, listing moderation,
   dispute visibility, included in v1.1.
10. **v1 scope boundary**: "Fast core first" — see phasing above.
11. **Deadline**: ASAP, no fixed date given; phasing to v1.1/v1.2 exists
    specifically to get a usable launch out sooner rather than blocking
    on full scope.

## Roles / logins

Three account types:
- **Vendor** — manages packages, pricing, availability/resources,
  bookings, sees their own dashboard.
- **Public user** — browses vendors/packages, books with deposit,
  manages their own bookings.
- **Admin** (platform owner) — approves vendors, moderates listings,
  views disputes.

## Out of scope for v1.1

- SMS notifications
- Reviews/ratings UI (data model may be considered, but no user-facing
  review flow in v1.1)
- Vendor subscription/commission billing (none planned — free model
  confirmed, not just deferred)

## Status

- [x] PRD locked (`docs/PRD.v1.md` written, `prd_ready` emitted)
