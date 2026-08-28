import { brevoProvider } from './brevo-provider';

const originalFetch = global.fetch;

const job = {
  deliveryId: '507f1f77bcf86cd799439011',
  to: 'member@example.test',
  subject: 'Test subject',
  html: '<p>Test</p>',
  text: 'Test',
  replyTo: null,
};

describe('Brevo email provider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['EMAIL_ENABLED'];
    delete process.env['BREVO_API_KEY'];
    delete process.env['BREVO_FROM_EMAIL'];
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('suppresses delivery without contacting Brevo when email is disabled', async () => {
    await expect(brevoProvider.deliver(job)).resolves.toEqual({ status: 'SUPPRESSED' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('suppresses delivery when a different provider is selected', async () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'sendgrid';
    await expect(brevoProvider.deliver(job)).resolves.toEqual({ status: 'SUPPRESSED' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('tags the send with the internal delivery ID and returns the provider message ID', async () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'brevo';
    process.env['BREVO_API_KEY'] = 'test-api-key';
    process.env['BREVO_FROM_EMAIL'] = 'notifications@example.test';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: 'provider-message-id' }),
    });

    brevoProvider.configure();
    await expect(brevoProvider.deliver(job)).resolves.toEqual({ status: 'ACCEPTED', providerMessageId: 'provider-message-id' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'api-key': 'test-api-key' }),
        body: expect.stringContaining(`"cl_delivery_id:${job.deliveryId}"`),
      }),
    );
  });

  it('throws with the response body when Brevo rejects the send', async () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'brevo';
    process.env['BREVO_API_KEY'] = 'test-api-key';
    process.env['BREVO_FROM_EMAIL'] = 'notifications@example.test';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400, text: async () => 'invalid sender' });

    await expect(brevoProvider.deliver(job)).rejects.toThrow('Brevo send failed (HTTP 400): invalid sender');
  });

  it('requires BREVO_API_KEY at configure time when enabled', () => {
    process.env['EMAIL_ENABLED'] = 'true';
    expect(() => brevoProvider.configure()).toThrow('BREVO_API_KEY is required');
  });

  it('requires BREVO_FROM_EMAIL at configure time when enabled', () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['BREVO_API_KEY'] = 'test-api-key';
    expect(() => brevoProvider.configure()).toThrow('BREVO_FROM_EMAIL is required');
  });
});
