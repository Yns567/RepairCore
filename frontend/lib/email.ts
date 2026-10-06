import "server-only";

// Transactional email through Resend's HTTP API (https://resend.com).
// Without RESEND_API_KEY, emails are logged instead so local development works.

type Email = { to: string; subject: string; text: string; html?: string };

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

/** Simple branded HTML around plain text paragraphs, with an optional button. */
export function emailHtml(paragraphs: string[], action?: { label: string; url: string }) {
  const body = paragraphs.map((text) => `<p style="margin:0 0 14px">${escapeHtml(text)}</p>`).join("");
  const button = action
    ? `<p style="margin:22px 0"><a href="${escapeHtml(action.url)}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(action.label)}</a></p>`
    : "";
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111827;line-height:1.5"><h2 style="color:#2563eb">RepairCore</h2>${body}${button}<p style="color:#6b7280;font-size:12px">RepairCore · ${escapeHtml(siteUrl())}</p></div>`;
}

export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "RepairCore <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(`[email disabled] To: ${email.to} | ${email.subject}\n${email.text}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text, html: email.html }),
  });
  if (!response.ok) {
    throw new Error(`Email provider responded with ${response.status}.`);
  }
}

/** Notifications must never break the action that triggered them. */
export async function notify(email: Email) {
  try {
    await sendEmail(email);
  } catch (error) {
    console.error("Unable to send notification email.", { subject: email.subject, error: String(error) });
  }
}
