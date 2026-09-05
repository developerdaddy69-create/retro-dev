# PRD v0 (draft) — Photo/Video Studio Booking Platform

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

## PM's restatement

A two-sided marketplace/booking platform connecting photo/video studios
("vendors") with people who want to book a shoot ("public" users):

- **Vendors** sign up, set their own pricing per service package, define
  what's included in each package (e.g. drone footage, physical album,
  video edit, number of hours/photos), and manage their own availability
  calendar.
- **Public users** browse vendors, pick a shoot type (birthday, pre-wedding,
  wedding, travel, and others), see live availability, and book/pay for a
  slot against a specific vendor's package.
- The public-facing site should be a modern, animated, "3D-website" style
  experience (per your other instruction to add a Designer role for this)
  — not a plain form-based booking page.

## Clarifying questions — round 1

1. **Marketplace vs. single studio**: Is this a marketplace with *many*
   independent vendors competing side by side (like a mini-Airbnb for photo
   studios), or one studio's own booking site with multiple staff/packages
   under one brand? This changes almost everything downstream (vendor
   onboarding/verification, discovery/search, commission model).
2. **Payments**: Should booking require online payment upfront (full or
   deposit) through the site, or is payment handled offline between vendor
   and client, with the site only handling scheduling? If online, do you
   have a preferred payment processor, or should I pick one (e.g. Stripe)?
3. **Vendor take/commission**: If it's a marketplace, does the platform
   take a commission/fee per booking, a vendor subscription fee, or is it
   free to vendors for v1?
4. **Vendor verification**: Can anyone sign up as a vendor immediately, or
   does a new vendor need approval/verification (ID, portfolio review)
   before their listing goes live?
5. **Availability model**: Is availability just "date + time slot" (like a
   calendar), or does it also depend on things like travel distance,
   number of staff/crew, or equipment (e.g. can't book two drone shoots at
   once if there's only one drone)?
6. **Cancellation/rescheduling**: What's the policy — can a public user
   cancel/reschedule, up to how close to the date, and does the vendor
   need to approve reschedules?
7. **Reviews/ratings**: Do public users need to be able to rate/review a
   vendor after a completed shoot?
8. **Notifications**: Do you want email/SMS notifications for booking
   confirmations, reminders, and cancellations in v1, or is that a
   nice-to-have for later?
9. **Admin role**: Do you (the platform owner) need an admin dashboard to
   moderate vendors/listings/disputes, or is that out of scope for v1?
10. **Must-have vs. nice-to-have for v1**: Given everything above, what's
    the smallest version you'd consider a usable v1 launch? (e.g. is
    payment integration a launch blocker, or can bookings be "confirmed,
    pay vendor directly" for v1?)
11. **Deadline**: Is there a target date you're working toward?

No PRD will be locked until these are answered — this is round 1 of the
intake loop (see `.claude/agents/product-manager.md`).
