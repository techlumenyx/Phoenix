const mockSend = jest.fn();
const mockSetApiKey = jest.fn();

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: { send: mockSend, setApiKey: mockSetApiKey },
}));

import { configureEmailProvider, deliverEmail } from './email-provider';

const job = {
  deliveryId: '507f1f77bcf86cd799439011',
  to: 'member@example.test',
  subject: 'Test subject',
  html: '<p>Test</p>',
  text: 'Test',
  replyTo: null,
};

describe('SendGrid email provider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env['EMAIL_ENABLED'];
    delete process.env['SENDGRID_API_KEY'];
    delete process.env['SENDGRID_FROM_EMAIL'];
  });

  afterAll(() => { process.env = originalEnv; });

  it('suppresses delivery without contacting SendGrid when email is disabled', async () => {
    await expect(deliverEmail(job)).resolves.toEqual({ status: 'SUPPRESSED' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('adds the internal delivery ID to SendGrid custom arguments', async () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'sendgrid';
    process.env['SENDGRID_API_KEY'] = 'test-api-key';
    process.env['SENDGRID_FROM_EMAIL'] = 'notifications@example.test';
    mockSend.mockResolvedValue([{ headers: { 'x-message-id': 'provider-message-id' } }]);

    configureEmailProvider();
    await expect(deliverEmail(job)).resolves.toEqual({ status: 'ACCEPTED', providerMessageId: 'provider-message-id' });
    expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      customArgs: { cl_delivery_id: job.deliveryId },
    }));
  });

  it('rejects an unsupported enabled provider at startup', () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'smtp';
    expect(() => configureEmailProvider()).toThrow('EMAIL_PROVIDER must be sendgrid');
  });
});
