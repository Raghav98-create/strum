# Strum — Project Notes

## Stage 1 ✅
Built Strum homepage (index.html) with hero, bio, lesson plans, booking form, footer. Warm brown/orange design.

## Stage 2 ✅
Deployed to Vercel. Live at strum-seven.vercel.app. GitHub repo: Raghav98-create/strum

## Stage 3 ✅
Connected Supabase (https://eidjxnwoynimgrbmmicb.supabase.co). Created bookings table with columns: id, created_at, name, email, phone, lesson_type, preferred_datetime. RLS enabled. Insert policy allows anyone to submit bookings.

## Stage 4 ✅
Built login.html and admin.html. Supabase authentication used. Admin can log in and view all bookings. RLS SELECT policy added so only authenticated users can read bookings.

## Stage 5 — Partially Complete
Supabase Edge Function called send-booking-emails was created and deployed. Resend API key and owner email stored as Supabase secrets. Database webhook created called on_booking_insert that fires on INSERT to bookings table. Owner alert email works successfully. Customer confirmation email does NOT work because onboarding@resend.dev can only send to raghavsood045@gmail.com — a verified domain is needed to send to customers. This will be revisited when a domain is purchased. Resend API key is stored securely as a Supabase secret, not in any code file.

## Stage 6 — Zapier Automations
Not started yet.
