import type { EmailTemplateKey } from './contracts';

export interface RenderedEmail { subject: string; html: string; text: string }

const required: Record<EmailTemplateKey, string[]> = {
  ORGANISATION_INVITATION: ['organisationName', 'inviteUrl', 'roles'],
  JOB_APPLICATION_SUBMITTED: ['jobTitle', 'applicationUrl'],
  JOB_APPLICATION_RECEIVED: ['jobTitle', 'applicantName', 'applicationsUrl'],
  RSVP_STATUS: ['eventTitle', 'eventUrl', 'status'],
  VERIFICATION_UPDATE: ['organisationName', 'status', 'settingsUrl'],
  EVENT_REMINDER: ['eventTitle', 'eventUrl', 'startsAt'],
};

export function renderEmail(key: EmailTemplateKey, variables: Record<string, string | number | boolean | null>): RenderedEmail {
  for (const name of required[key]) if (variables[name] === undefined || variables[name] === null || variables[name] === '') throw new Error(`Missing email variable: ${name}`);
  const value = (name: string) => escapeHtml(String(variables[name] ?? ''));
  const link = (label: string, urlName: string) => `<a href="${escapeAttribute(String(variables[urlName] ?? ''))}" style="display:inline-block;padding:12px 18px;background:#24543d;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(label)}</a>`;
  let subject: string;
  let body: string;
  let text: string;
  switch (key) {
    case 'ORGANISATION_INVITATION':
      subject = `You're invited to join ${variables['organisationName']}`;
      body = `<p>You have been invited to join <strong>${value('organisationName')}</strong> as ${value('roles')}.</p>${link('Accept invitation', 'inviteUrl')}`;
      text = `You have been invited to join ${variables['organisationName']} as ${variables['roles']}. Accept: ${variables['inviteUrl']}`;
      break;
    case 'JOB_APPLICATION_SUBMITTED':
      subject = `Application received: ${variables['jobTitle']}`;
      body = `<p>Your application for <strong>${value('jobTitle')}</strong> has been received.</p>${link('View application', 'applicationUrl')}`;
      text = `Your application for ${variables['jobTitle']} has been received. View: ${variables['applicationUrl']}`;
      break;
    case 'JOB_APPLICATION_RECEIVED':
      subject = `New application: ${variables['jobTitle']}`;
      body = `<p><strong>${value('applicantName')}</strong> submitted an application for <strong>${value('jobTitle')}</strong>.</p>${link('Review applications', 'applicationsUrl')}`;
      text = `${variables['applicantName']} submitted an application for ${variables['jobTitle']}. Review: ${variables['applicationsUrl']}`;
      break;
    case 'RSVP_STATUS':
      subject = `RSVP ${String(variables['status']).toLowerCase()}: ${variables['eventTitle']}`;
      body = `<p>Your RSVP for <strong>${value('eventTitle')}</strong> is <strong>${value('status')}</strong>.</p>${link('View event', 'eventUrl')}`;
      text = `Your RSVP for ${variables['eventTitle']} is ${variables['status']}. View: ${variables['eventUrl']}`;
      break;
    case 'VERIFICATION_UPDATE':
      subject = `Verification update for ${variables['organisationName']}`;
      body = `<p>The verification status for <strong>${value('organisationName')}</strong> is now <strong>${value('status')}</strong>.</p>${variables['reason'] ? `<p>${value('reason')}</p>` : ''}${link('Review settings', 'settingsUrl')}`;
      text = `The verification status for ${variables['organisationName']} is now ${variables['status']}.${variables['reason'] ? ` ${variables['reason']}` : ''} ${variables['settingsUrl']}`;
      break;
    case 'EVENT_REMINDER':
      subject = `Reminder: ${variables['eventTitle']}`;
      body = `<p><strong>${value('eventTitle')}</strong> starts at ${value('startsAt')}.</p>${link('View event', 'eventUrl')}`;
      text = `${variables['eventTitle']} starts at ${variables['startsAt']}. View: ${variables['eventUrl']}`;
      break;
  }
  return { subject, text, html: layout(body) };
}

function layout(body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f6f4;font-family:Arial,sans-serif;color:#1d2520"><div style="max-width:620px;margin:0 auto;padding:32px 20px"><div style="background:#fff;border:1px solid #e1e5e2;border-radius:10px;padding:28px"><h1 style="font-size:22px;margin:0 0 20px">Christian Listings</h1>${body}<p style="margin-top:28px;color:#667069;font-size:13px">This is a transactional message about your Christian Listings account activity.</p></div></div></body></html>`;
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]!)); }
function escapeAttribute(value: string) { return escapeHtml(value).replace(/`/g, '&#096;'); }
