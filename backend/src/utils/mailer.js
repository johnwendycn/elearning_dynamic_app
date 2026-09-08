const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.nutrappai.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'info@nutrappai.com',
    pass: process.env.SMTP_PASS || 'JOHWEN2019ry@com'
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000
});

const FROM = process.env.SMTP_FROM || 'JONIKWIRIA Academy <info@jonikwiria.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@jonikwiria.com';

/**
 * Send a single email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @param {string} [text] - Plain text fallback
 */
async function sendMail(to, subject, html, text) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '')
    });
    console.log(`[Mailer] Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Mailer] Failed to send email to ${to}:`, err.message);
    // Don't throw — let the app continue even if email fails
    return null;
  }
}

/**
 * Send an email to multiple recipients
 * @param {string[]} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
async function sendBulkMail(recipients, subject, html) {
  const results = [];
  for (const to of recipients) {
    const r = await sendMail(to, subject, html);
    results.push({ to, success: !!r });
  }
  return results;
}

/**
 * Notify admin of a new contact message
 */
async function notifyAdminNewContact(contact) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#007bff;border-bottom:2px solid #007bff;padding-bottom:8px">New Contact Message</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold;color:#555">Name:</td><td style="padding:8px">${contact.name}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#555">Email:</td><td style="padding:8px"><a href="mailto:${contact.email}">${contact.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555">Phone:</td><td style="padding:8px">${contact.phone || '—'}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#555">Subject:</td><td style="padding:8px">${contact.subject}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f4f6f9;border-radius:8px">
        <strong>Message:</strong><br/><br/>
        ${contact.message.replace(/\n/g, '<br/>')}
      </div>
      <p style="margin-top:20px;font-size:12px;color:#999">This email was sent from the NutrAppAI website contact form.</p>
    </div>
  `;
  return sendMail(ADMIN_EMAIL, `New Contact: ${contact.subject}`, html);
}

/**
 * Send confirmation email to contact submitter
 */
async function sendContactConfirmation(contact) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#007bff">Thank you for contacting us!</h2>
      <p>Hi <strong>${contact.name}</strong>,</p>
      <p>We've received your message and will get back to you within 24–48 hours.</p>
      <div style="margin:20px 0;padding:16px;background:#f4f6f9;border-radius:8px;border-left:4px solid #007bff">
        <strong>Your message:</strong><br/><br/>
        ${contact.message.replace(/\n/g, '<br/>')}
      </div>
      <p>Best regards,<br/><strong>The NutrAppAI Team</strong></p>
    </div>
  `;
  return sendMail(contact.email, 'We received your message — NutrAppAI', html);
}

/**
 * Send reply to a contact message
 */
async function sendContactReply(contact, replyMessage) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#007bff">Reply to your enquiry</h2>
      <p>Hi <strong>${contact.name}</strong>,</p>
      <p>We have responded to your recent enquiry regarding: <strong>${contact.subject}</strong></p>
      <div style="margin:20px 0;padding:16px;background:#f4f6f9;border-radius:8px;border-left:4px solid #28a745">
        <strong>Our response:</strong><br/><br/>
        ${replyMessage.replace(/\n/g, '<br/>')}
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
      <p style="color:#777;font-size:13px"><em>Your original message:</em><br/>${contact.message.replace(/\n/g, '<br/>')}</p>
      <p>Best regards,<br/><strong>The NutrAppAI Team</strong></p>
    </div>
  `;
  return sendMail(contact.email, `Re: ${contact.subject}`, html);
}

/**
 * Send event registration confirmation to registrant
 */
async function sendEventRegistrationConfirmation(registration, event) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#007bff,#0069d9);padding:32px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">🎉 Registration Confirmed!</h1>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
        <p>Hi <strong>${registration.firstName} ${registration.lastName}</strong>,</p>
        <p>Your registration for <strong>${event.title}</strong> has been successfully received!</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="background:#f4f6f9"><td style="padding:10px;font-weight:bold">Event</td><td style="padding:10px">${event.title}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Date</td><td style="padding:10px">${event.startDate ? new Date(event.startDate).toDateString() : 'TBD'}</td></tr>
          <tr style="background:#f4f6f9"><td style="padding:10px;font-weight:bold">Location</td><td style="padding:10px">${event.location || 'TBD'}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Ticket Type</td><td style="padding:10px">${registration.ticketType || 'Free'}</td></tr>
        </table>
        <div style="padding:16px;background:#e8f5e9;border-radius:8px;border-left:4px solid #28a745">
          ✅ Your spot has been reserved. We will notify you of any updates.
        </div>
        <p style="margin-top:24px">Best regards,<br/><strong>The NutrAppAI Team</strong></p>
      </div>
    </div>
  `;
  return sendMail(registration.email, `Registration Confirmed: ${event.title}`, html);
}

/**
 * Notify admin of a new event registration
 */
async function notifyAdminNewRegistration(registration, event) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#007bff">New Event Registration</h2>
      <p>A new registration has been submitted for: <strong>${event.title}</strong></p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${registration.firstName} ${registration.lastName}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${registration.email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${registration.phone || '—'}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Organization</td><td style="padding:8px">${registration.organization || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Ticket Type</td><td style="padding:8px">${registration.ticketType}</td></tr>
      </table>
    </div>
  `;
  return sendMail(ADMIN_EMAIL, `New Registration: ${event.title}`, html);
}

/**
 * Send bulk email to event registrants
 */
async function sendBulkEventEmail(recipients, subject, body) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      ${body.replace(/\n/g, '<br/>')}
      <hr style="border:none;border-top:1px solid #eee;margin-top:32px"/>
      <p style="font-size:12px;color:#999;text-align:center">JONIKWIRIA Limited — info@jonikwiria.com</p>
    </div>
  `;
  return sendBulkMail(recipients, subject, html);
}

/**
 * Generate Professional HTML Email Template for Certificate of Completion
 */
function getCertificateEmailTemplate({
  studentName,
  courseTitle,
  credentialId,
  issueDateFormatted,
  distinction,
  score,
  verificationUrl,
  certificateViewUrl,
  qrCodeUrl
}) {
  const distinctionBlock = distinction ? `
    <div style="margin-top:8px;display:inline-block;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.4);color:#b45309;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800;">
      ★ ${distinction}${score ? ` (Score: ${score}%)` : ''}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your JONIKWIRIA Certificate of Completion</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,0.07);border:1px solid #e2e8f0;">
          
          <!-- Header Banner with Jonikwiria Logo -->
          <tr>
            <td style="background:linear-gradient(135deg, #091732 0%, #102a5c 100%);padding:35px 40px;text-align:center;border-bottom:3px solid #d4af37;">
              <!-- Logo Mark -->
              <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 14px auto;">
                <tr>
                  <td style="background:linear-gradient(135deg, #007bff 0%, #7c3aed 100%);color:#ffffff;font-weight:900;font-size:18px;letter-spacing:1px;padding:8px 15px;border-radius:8px;text-align:center;border:1px solid rgba(255,255,255,0.25);">
                    JK
                  </td>
                  <td style="padding-left:14px;text-align:left;">
                    <div style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:1px;line-height:1.1;">JONIKWIRIA</div>
                    <div style="color:#d4af37;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Technology Limited • Global Academy</div>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:16px 0 6px 0;letter-spacing:0.5px;">Certificate of Completion Issued</h1>
              <p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1.5px;text-transform:uppercase;">Verified Academic &amp; Professional Credential</p>
            </td>
          </tr>

          <!-- Congratulatory Body -->
          <tr>
            <td style="padding:35px 40px 25px 40px;">
              <p style="font-size:16px;color:#1e293b;margin:0 0 16px 0;">Dear <strong>${studentName}</strong>,</p>
              <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px 0;">
                Congratulations! We are delighted to inform you that you have successfully fulfilled all course requirements, practical exercises, and assessments for:
              </p>

              <!-- Course Highlight Box -->
              <div style="background:#f8fafc;border-left:4px solid #007bff;border-radius:8px;padding:18px 22px;margin-bottom:26px;border:1px solid #e2e8f0;">
                <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Program Completed</div>
                <div style="font-size:18px;font-weight:800;color:#091732;line-height:1.3;">${courseTitle}</div>
                ${distinctionBlock}
              </div>

              <!-- Certificate Credential Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:26px;font-size:13px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;width:38%;">Recipient Name:</td>
                  <td style="padding:6px 0;color:#0f172a;font-weight:700;">${studentName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Credential ID:</td>
                  <td style="padding:6px 0;color:#007bff;font-weight:800;font-family:Consolas,Monaco,monospace;font-size:14px;">${credentialId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Issue Date:</td>
                  <td style="padding:6px 0;color:#0f172a;font-weight:700;">${issueDateFormatted}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b;font-weight:600;">Security Status:</td>
                  <td style="padding:6px 0;color:#16a34a;font-weight:700;">✓ Cryptographically Signed &amp; Active</td>
                </tr>
              </table>

              <!-- QR Code & Verification Callout -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #cbd5e1;border-radius:10px;padding:18px;margin-bottom:28px;background:#ffffff;">
                <tr>
                  <td width="125" align="center" style="vertical-align:middle;padding-right:16px;">
                    <img src="${qrCodeUrl}" alt="Verification QR Code" width="110" height="110" style="display:block;border-radius:6px;border:1px solid #e2e8f0;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="font-size:12px;font-weight:800;color:#091732;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Instant QR Code Authenticity</div>
                    <p style="font-size:12px;color:#64748b;line-height:1.5;margin:0 0 10px 0;">
                      This certificate is encoded with a public QR code. Anyone (employers, universities, or clients) can point their phone camera at the QR code to verify this credential directly on the JONIKWIRIA registry.
                    </p>
                    <a href="${verificationUrl}" target="_blank" style="color:#007bff;font-size:12px;font-weight:700;text-decoration:none;">Open Public Registry &rarr;</a>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${certificateViewUrl}" target="_blank" style="background:linear-gradient(135deg, #007bff 0%, #0056b3 100%);color:#ffffff;padding:14px 34px;font-size:14px;font-weight:800;text-decoration:none;border-radius:8px;display:inline-block;box-shadow:0 4px 14px rgba(0,123,255,0.35);letter-spacing:0.3px;">
                      View &amp; Download Certificate
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#64748b;line-height:1.5;margin:0;text-align:center;">
                You can print and save your certificate in high-resolution PDF format at any time from your student portal.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
              <p style="margin:0 0 4px 0;font-weight:700;color:#64748b;">JONIKWIRIA Technology Limited • Academic Credentials Division</p>
              <p style="margin:0 0 10px 0;">Building People. Building Technology. | Official Accreditation &amp; Learning Registry</p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} JONIKWIRIA Limited. All rights reserved. • <a href="${verificationUrl}" style="color:#64748b;text-decoration:underline;">Public Verification Portal</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send official Course Completion Certificate email to student
 */
async function sendCertificateIssuedEmail(recipientUser, certificate, course) {
  if (!recipientUser || !recipientUser.email) {
    console.warn('[Mailer] Cannot send certificate email: recipient has no email address.');
    return null;
  }

  const studentName = certificate.recipientName || 
    `${recipientUser.firstName || ''} ${recipientUser.lastName || ''}`.trim() || 
    'Distinguished Scholar';

  const courseTitle = course?.title || certificate.courseTitle || 'Executive Tech Program';
  const credentialId = certificate.credentialId;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/verify/${credentialId}`;
  const certificateViewUrl = `${baseUrl}/certificates/view/${certificate.courseId || course?.id || certificate.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(verificationUrl)}`;

  const issueDateFormatted = new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const distinction = certificate.metadata?.distinction || '';
  const score = certificate.metadata?.finalScore || '';

  const html = getCertificateEmailTemplate({
    studentName,
    courseTitle,
    credentialId,
    issueDateFormatted,
    distinction,
    score,
    verificationUrl,
    certificateViewUrl,
    qrCodeUrl
  });

  const subject = `🎓 Congratulations! Your Certificate of Completion for "${courseTitle}" is Ready`;
  return sendMail(recipientUser.email, subject, html);
}

/**
 * Send Welcome Email to a newly registered newsletter subscriber
 */
async function sendSubscriberWelcomeEmail(subscriber) {
  if (!subscriber || !subscriber.email) return null;

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
  const exploreCoursesUrl = `${baseUrl}/courses`;
  const name = subscriber.name || 'Tech Enthusiast';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JONIKWIRIA Tech Academy &amp; Solutions</title>
</head>
<body style="margin:0;padding:0;background-color:#080c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080c14;padding:35px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f1726;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);border:1px solid #1e293b;">
          
          <!-- Header Banner with Brand Identity -->
          <tr>
            <td style="background:linear-gradient(135deg, #091732 0%, #162035 100%);padding:35px 40px;text-align:center;border-bottom:2px solid #38bdf8;">
              <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 12px auto;">
                <tr>
                  <td style="background:linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%);color:#ffffff;font-weight:900;font-size:18px;letter-spacing:1px;padding:8px 16px;border-radius:8px;text-align:center;">
                    JK
                  </td>
                  <td style="padding-left:14px;text-align:left;">
                    <div style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:1px;line-height:1.1;">JONIKWIRIA</div>
                    <div style="color:#38bdf8;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Technology Academy &amp; Solutions</div>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:16px 0 6px 0;">🎉 You're Officially Subscribed!</h1>
              <p style="color:#94a3b8;font-size:13px;margin:0;letter-spacing:0.5px;">Building People. Building Technology.</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:35px 40px 25px 40px;">
              <p style="font-size:16px;color:#f1f5f9;margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
              <p style="font-size:15px;line-height:1.65;color:#cbd5e1;margin:0 0 20px 0;">
                Thank you for subscribing to the <strong>JONIKWIRIA Innovation &amp; Technology Digest</strong>! You are now part of our community of tech pioneers, developers, and learners.
              </p>

              <!-- Value Highlights Box -->
              <div style="background:#162035;border-radius:12px;padding:20px;border:1px solid #1e293b;margin-bottom:26px;">
                <div style="color:#38bdf8;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">What you can look forward to:</div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#cbd5e1;">
                  <tr>
                    <td style="padding:6px 0;vertical-align:top;width:24px;color:#38bdf8;">✦</td>
                    <td style="padding:6px 0;"><strong>Weekly Tech Insights:</strong> Software Engineering, AI &amp; Cloud architectures.</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;vertical-align:top;width:24px;color:#38bdf8;">✦</td>
                    <td style="padding:6px 0;"><strong>Exclusive Cohorts &amp; Bootcamps:</strong> Priority admission for hands-on certification training.</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;vertical-align:top;width:24px;color:#38bdf8;">✦</td>
                    <td style="padding:6px 0;"><strong>Live Webinars &amp; Hackathons:</strong> Guest speaker invitations and project demo days.</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${exploreCoursesUrl}" target="_blank" style="background:linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);color:#ffffff;padding:14px 34px;font-size:14px;font-weight:800;text-decoration:none;border-radius:10px;display:inline-block;box-shadow:0 4px 15px rgba(14,165,233,0.35);">
                      Explore Courses &amp; Programs &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:20px 0 0 0;text-align:center;">
                Have questions or need training guidance? Reply directly to this email or chat with our admissions team.
              </p>
            </td>
          </tr>

          <!-- Footer with 1-Click Unsubscribe -->
          <tr>
            <td style="background:#080c14;padding:24px 40px;border-top:1px solid #1e293b;text-align:center;font-size:12px;color:#64748b;">
              <p style="margin:0 0 6px 0;font-weight:700;color:#94a3b8;">JONIKWIRIA Technology Limited</p>
              <p style="margin:0 0 12px 0;">Empowering African innovators through world-class engineering &amp; digital skills.</p>
              <p style="margin:0;font-size:11px;">
                You are receiving this email because you subscribed on our website.
                <br/>
                <a href="${unsubscribeUrl}" style="color:#ef4444;text-decoration:underline;margin-top:6px;display:inline-block;">Unsubscribe from this mailing list</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendMail(subscriber.email, 'Welcome to JONIKWIRIA Technology Academy & Solutions! 🚀', html);
}

/**
 * Send a broadcast announcement / push email to a subscriber with per-recipient unsubscribe link
 */
async function sendSubscriberBroadcastEmail({ to, name, subject, title, type, content }) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(to)}`;
  const greeting = name ? `Hello ${name},` : 'Hello valued subscriber,';

  const typeLabels = {
    news: '📰 Technology News &amp; Insights',
    event: '📅 Upcoming Event &amp; Workshop',
    course: '🎓 Academic &amp; Training Update',
    announcement: '📢 Official Announcement',
    custom: '✨ JONIKWIRIA Community Update'
  };

  const badgeText = typeLabels[type] || '📢 JONIKWIRIA Update';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#080c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080c14;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f1726;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);border:1px solid #1e293b;">
          
          <!-- Top Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #091732 0%, #162035 100%);padding:30px 40px;text-align:left;border-bottom:2px solid #38bdf8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                      ${badgeText}
                    </div>
                    <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:4px 0 0 0;line-height:1.3;">${title || subject}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:15px;color:#f1f5f9;margin:0 0 18px 0;"><strong>${greeting}</strong></p>
              
              <div style="font-size:15px;line-height:1.7;color:#cbd5e1;margin-bottom:26px;">
                ${content.replace(/\n/g, '<br/>')}
              </div>

              <!-- Call to Action Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0 10px 0;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}" target="_blank" style="background:linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);color:#ffffff;padding:12px 30px;font-size:14px;font-weight:800;text-decoration:none;border-radius:8px;display:inline-block;box-shadow:0 4px 14px rgba(14,165,233,0.3);">
                      Visit JONIKWIRIA Platform &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with Unsubscribe -->
          <tr>
            <td style="background:#080c14;padding:22px 40px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#64748b;">
              <p style="margin:0 0 6px 0;font-weight:700;color:#94a3b8;">JONIKWIRIA Technology Limited</p>
              <p style="margin:0 0 10px 0;">Building People. Building Technology.</p>
              <p style="margin:0;">
                Sent to <span style="color:#94a3b8;">${to}</span> • 
                <a href="${unsubscribeUrl}" style="color:#ef4444;text-decoration:underline;">Unsubscribe instantly</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendMail(to, subject, html);
}

/**
 * Send Email Verification Link to newly registered user
 * @param {object} user - User object { id, firstName, lastName, email }
 * @param {string} token - Verification token
 * @param {string} [clientOrigin] - Frontend base URL (e.g. http://10.252.40.78:5173 or http://localhost:5173)
 */
async function sendVerificationEmail(user, token, clientOrigin) {
  const baseUrl = clientOrigin || process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify-email?token=${token}`;
  const subject = `Verify Your Email Address - JONIKWIRIA Academy`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b132b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b132b;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111c44;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);padding:36px 40px;text-align:center;border-bottom:1px solid #334155;">
              <div style="display:inline-block;padding:8px 18px;border-radius:20px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.4);color:#60a5fa;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                Account Security &amp; Activation
              </div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.02em;">
                Verify Your Email Address
              </h1>
              <p style="color:#94a3b8;font-size:14px;margin:0;">
                Welcome to JONIKWIRIA Technology &amp; Learning Platform
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 40px;color:#cbd5e1;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 16px 0;font-size:17px;color:#f8fafc;">
                Hello <strong>${user.firstName || 'Learner'}</strong>,
              </p>
              <p style="margin:0 0 20px 0;">
                Thank you for registering with <strong>JONIKWIRIA</strong>. To complete your registration and unlock full access to our courses, phase-locked student dashboard, quizzes, and verified certificates, please click the button below to confirm your email:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="background:linear-gradient(135deg, #007bff 0%, #0056b3 100%);color:#ffffff;padding:15px 36px;font-size:15px;font-weight:800;text-decoration:none;border-radius:10px;display:inline-block;box-shadow:0 6px 20px rgba(0,123,255,0.4);letter-spacing:0.02em;">
                      Verify &amp; Activate Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background:rgba(234,179,8,0.1);border-left:4px solid #eab308;padding:14px 18px;border-radius:6px;margin:24px 0;font-size:13px;color:#fef08a;line-height:1.5;">
                <strong>Security Notice:</strong> This activation link will expire in <strong>24 hours</strong>. If you did not create an account on JONIKWIRIA, please ignore this email.
              </div>

              <!-- Fallback Link -->
              <p style="margin:24px 0 6px 0;font-size:12px;color:#94a3b8;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <div style="background:#0b132b;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;font-size:11px;color:#60a5fa;word-break:break-all;font-family:monospace;">
                ${verifyUrl}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#080c14;padding:22px 40px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#64748b;">
              <p style="margin:0 0 6px 0;font-weight:700;color:#94a3b8;">JONIKWIRIA Technology Limited</p>
              <p style="margin:0 0 10px 0;">Building People. Building Technology.</p>
              <p style="margin:0;color:#475569;">
                Need assistance? Contact support at <a href="mailto:info@jonikwiria.com" style="color:#60a5fa;text-decoration:none;">info@jonikwiria.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendMail(user.email, subject, html);
}

/**
 * Send Password Reset Link to user
 * @param {object} user - User object { id, firstName, email }
 * @param {string} token - Password reset token
 * @param {string} [clientOrigin] - Frontend base URL
 */
async function sendPasswordResetEmail(user, token, clientOrigin) {
  const baseUrl = clientOrigin || process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
  const subject = `Reset Your JONIKWIRIA Password`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b132b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b132b;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111c44;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);padding:36px 40px;text-align:center;border-bottom:1px solid #334155;">
              <div style="display:inline-block;padding:8px 18px;border-radius:20px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#f87171;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                Password Recovery
              </div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.02em;">
                Reset Your Password
              </h1>
              <p style="color:#94a3b8;font-size:14px;margin:0;">
                JONIKWIRIA Authentication &amp; Security Services
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 40px;color:#cbd5e1;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 16px 0;font-size:17px;color:#f8fafc;">
                Hello <strong>${user.firstName || 'User'}</strong>,
              </p>
              <p style="margin:0 0 20px 0;">
                We received a request to reset the password for your JONIKWIRIA account (<span style="color:#60a5fa;font-weight:600;">${user.email}</span>). Click the button below to choose a new, secure password:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%);color:#ffffff;padding:15px 36px;font-size:15px;font-weight:800;text-decoration:none;border-radius:10px;display:inline-block;box-shadow:0 6px 20px rgba(239,68,68,0.4);letter-spacing:0.02em;">
                      Reset Password Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background:rgba(239,68,68,0.1);border-left:4px solid #ef4444;padding:14px 18px;border-radius:6px;margin:24px 0;font-size:13px;color:#fca5a5;line-height:1.5;">
                <strong>Notice:</strong> This password reset link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email; your account remains secure.
              </div>

              <!-- Fallback Link -->
              <p style="margin:24px 0 6px 0;font-size:12px;color:#94a3b8;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <div style="background:#0b132b;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;font-size:11px;color:#60a5fa;word-break:break-all;font-family:monospace;">
                ${resetUrl}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#080c14;padding:22px 40px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#64748b;">
              <p style="margin:0 0 6px 0;font-weight:700;color:#94a3b8;">JONIKWIRIA Technology Limited</p>
              <p style="margin:0 0 10px 0;">Building People. Building Technology.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendMail(user.email, subject, html);
}

/**
 * Send confirmation that password was successfully reset
 * @param {object} user - User object { firstName, email }
 */
async function sendPasswordResetSuccessEmail(user) {
  const subject = `Your JONIKWIRIA Password Has Been Changed`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b132b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b132b;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111c44;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);padding:30px;text-align:center;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">Password Updated Successfully</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px;color:#cbd5e1;font-size:15px;line-height:1.7;">
              <p>Hello <strong>${user.firstName || 'User'}</strong>,</p>
              <p>This email confirms that the password for your account (<strong>${user.email}</strong>) has been successfully changed.</p>
              <p style="color:#ef4444;font-size:13px;">If you did not perform this change, please contact our support team immediately at <a href="mailto:info@jonikwiria.com" style="color:#60a5fa;">info@jonikwiria.com</a> to lock and secure your account.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#080c14;padding:18px;text-align:center;font-size:11px;color:#64748b;">
              JONIKWIRIA Technology Limited • Account Security
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendMail(user.email, subject, html);
}

module.exports = {
  sendMail,
  sendBulkMail,
  notifyAdminNewContact,
  sendContactConfirmation,
  sendContactReply,
  sendEventRegistrationConfirmation,
  notifyAdminNewRegistration,
  sendBulkEventEmail,
  getCertificateEmailTemplate,
  sendCertificateIssuedEmail,
  sendSubscriberWelcomeEmail,
  sendSubscriberBroadcastEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail
};

