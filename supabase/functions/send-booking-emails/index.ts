import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const OWNER_EMAIL    = Deno.env.get('OWNER_EMAIL')!;
const FROM_ADDRESS   = 'onboarding@resend.dev';

interface BookingRecord {
  name:               string;
  email:              string;
  phone:              string;
  lesson_type:        string;
  preferred_datetime: string;
}

function formatDateTime(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : d.toLocaleString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

function customerEmailHtml(r: BookingRecord): string {
  return `
    <div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fdf6ec;border-radius:10px;overflow:hidden;">
      <div style="background:#3b1f0e;padding:24px 32px;">
        <h1 style="margin:0;font-size:24px;color:#c8762b;letter-spacing:2px;text-transform:uppercase;">Strum</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#3b1f0e;margin-top:0;">Booking Confirmed!</h2>
        <p style="color:#7a5c3e;">Hi <strong>${r.name}</strong>, thanks for booking a guitar lesson with Strum. Here's a summary of your request:</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr style="border-bottom:1px solid #e6d5bf;">
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;width:40%;">Lesson Type</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${r.lesson_type}</td>
          </tr>
          <tr style="border-bottom:1px solid #e6d5bf;">
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;">Preferred Date &amp; Time</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${formatDateTime(r.preferred_datetime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;">Phone</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${r.phone}</td>
          </tr>
        </table>
        <p style="color:#7a5c3e;">I'll be in touch within <strong>24 hours</strong> to confirm your slot. Looking forward to playing with you!</p>
        <p style="color:#7a5c3e;margin-bottom:0;">— Alex at <strong style="color:#c8762b;">Strum</strong></p>
      </div>
      <div style="background:#3b1f0e;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#fdf6ec;opacity:0.6;">&copy; 2026 Strum Guitar Lessons</p>
      </div>
    </div>
  `;
}

function ownerEmailHtml(r: BookingRecord): string {
  return `
    <div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fdf6ec;border-radius:10px;overflow:hidden;">
      <div style="background:#3b1f0e;padding:24px 32px;">
        <h1 style="margin:0;font-size:24px;color:#c8762b;letter-spacing:2px;text-transform:uppercase;">Strum</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#3b1f0e;margin-top:0;">New Booking Request</h2>
        <p style="color:#7a5c3e;">You have a new lesson enquiry. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr style="border-bottom:1px solid #e6d5bf;">
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;width:40%;">Name</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${r.name}</td>
          </tr>
          <tr style="border-bottom:1px solid #e6d5bf;">
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;">Email</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${r.email}</td>
          </tr>
          <tr style="border-bottom:1px solid #e6d5bf;">
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;">Phone</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${r.phone}</td>
          </tr>
          <tr style="border-bottom:1px solid #e6d5bf;">
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;">Lesson Type</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${r.lesson_type}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#7a5c3e;font-size:14px;">Preferred Date &amp; Time</td>
            <td style="padding:10px 0;color:#2b1a0a;font-weight:600;">${formatDateTime(r.preferred_datetime)}</td>
          </tr>
        </table>
        <p style="color:#7a5c3e;margin-bottom:0;">Log in to the <a href="https://strum-seven.vercel.app/admin.html" style="color:#c8762b;">admin dashboard</a> to view all bookings.</p>
      </div>
      <div style="background:#3b1f0e;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#fdf6ec;opacity:0.6;">&copy; 2026 Strum Guitar Lessons</p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const record: BookingRecord = payload.record;

    if (!record?.email) {
      return new Response('Missing record data', { status: 400 });
    }

    await Promise.all([
      sendEmail(
        record.email,
        'Your Strum lesson booking is confirmed!',
        customerEmailHtml(record)
      ),
      sendEmail(
        OWNER_EMAIL,
        `New booking from ${record.name}`,
        ownerEmailHtml(record)
      ),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-booking-emails error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
