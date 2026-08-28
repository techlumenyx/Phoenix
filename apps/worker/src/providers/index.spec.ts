jest.mock('@sendgrid/mail', () => ({ __esModule: true, default: { send: jest.fn(), setApiKey: jest.fn() } }));
jest.mock('@aws-sdk/client-sesv2', () => ({ __esModule: true, SESv2Client: jest.fn(), SendEmailCommand: jest.fn() }));

import { getEmailProvider } from './index';
import { sendgridProvider } from './sendgrid-provider';
import { sesProvider } from './ses-provider';
import { brevoProvider } from './brevo-provider';

describe('getEmailProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['EMAIL_PROVIDER'];
  });

  afterAll(() => { process.env = originalEnv; });

  it('defaults to SendGrid when EMAIL_PROVIDER is unset', () => {
    expect(getEmailProvider()).toBe(sendgridProvider);
  });

  it('returns the SendGrid provider explicitly', () => {
    process.env['EMAIL_PROVIDER'] = 'sendgrid';
    expect(getEmailProvider()).toBe(sendgridProvider);
  });

  it('returns the SES provider', () => {
    process.env['EMAIL_PROVIDER'] = 'ses';
    expect(getEmailProvider()).toBe(sesProvider);
  });

  it('returns the Brevo provider', () => {
    process.env['EMAIL_PROVIDER'] = 'brevo';
    expect(getEmailProvider()).toBe(brevoProvider);
  });

  it('rejects an unrecognised provider', () => {
    process.env['EMAIL_PROVIDER'] = 'smtp';
    expect(() => getEmailProvider()).toThrow('Unrecognised EMAIL_PROVIDER: smtp');
  });
});
