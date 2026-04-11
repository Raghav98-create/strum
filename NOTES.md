# Strum — Project Notes

## Stage 1 ✅ — Homepage
Built Strum homepage (index.html) with hero, bio, lesson plans, booking form, footer. Warm brown/orange design. Hosted locally using Python HTTP server on port 8080.

## Stage 2 ✅ — Deployment
Git repository initialised in the strum folder. Pushed to GitHub at Raghav98-create/strum. Deployed to Vercel — live at strum-seven.vercel.app. Vercel auto-deploys on every push to main.

## Stage 3 ✅ — Supabase & Booking Form
Connected Supabase (https://eidjxnwoynimgrbmmicb.supabase.co). Created bookings table with columns: id, created_at, name, email, phone, lesson_type, preferred_datetime. RLS enabled. Insert policy allows anyone (anon) to submit bookings. SELECT policy restricts reads to authenticated users only. Booking form in index.html inserts rows directly into Supabase using the publishable anon key. Form fields: name, email, phone, lesson_type (dropdown), preferred_datetime (datetime-local input). Success and error feedback shown inline on the form.

## Stage 4 ✅ — Login & Admin Pages
Built login.html and admin.html. login.html authenticates via Supabase email/password — redirects to admin.html on success, shows "Invalid email or password" on failure, and skips login if already authenticated. admin.html is auth-gated: checks for active session on load and redirects to login.html if none. Displays all bookings in a styled table with colour-coded lesson type badges. Includes a logout button. Admin user created via Supabase Dashboard → Authentication → Users.

## Stage 4b ✅ — Admin Footer Link
Added a subtle low-visibility "Admin" link at the bottom of the index.html footer. Uses 55% opacity cream text on the dark brown footer — visible but unobtrusive. Links to login.html.

## Stage 4c ✅ — Security Audit
Full security audit passed. Findings:
- No Resend API key or service role key exposed in any file
- Supabase key in all HTML files confirmed as anon/publishable key only (not service role)
- No admin credentials hardcoded anywhere
- Edge Function reads RESEND_API_KEY and OWNER_EMAIL from Supabase secrets via Deno.env.get()
- admin.html correctly redirects unauthenticated visitors to login.html before any data loads
- RLS policies confirmed: anon can INSERT, only authenticated can SELECT

## Stage 5 — Email Notifications (Partially Complete)
Supabase Edge Function called send-booking-emails created at supabase/functions/send-booking-emails/index.ts and deployed. Uses Resend API to send two emails on every new booking. RESEND_API_KEY and OWNER_EMAIL stored as Supabase secrets — not in any code file. Database webhook called on_booking_insert fires on INSERT to the bookings table and calls the Edge Function. Owner alert email (to raghavsood045@gmail.com) works successfully. Customer confirmation email does NOT work because onboarding@resend.dev can only send to the Resend account owner email — a verified custom domain is needed to send to arbitrary customers. Will be revisited when a domain is purchased.

## Stage 6 — Zapier Automations
Not started yet.
