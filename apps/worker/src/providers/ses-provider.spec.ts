const mockSend = jest.fn();

jest.mock('@aws-sdk/client-sesv2', () => ({
  __esModule: true,
  SESv2Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  SendEmailCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

import { sesProvider } from './ses-provider';

const job = {
  deliveryId: '507f1f77bcf86cd799439011',
  to: 'member@example.test',
  subject: 'Test subject',
  html: '<p>Test</p>',
  text: 'Test',
  replyTo: null,
};

describe('SES email provider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env['EMAIL_ENABLED'];
    delete process.env['AWS_REGION'];
    delete process.env['AWS_ACCESS_KEY_ID'];
    delete process.env['AWS_SECRET_ACCESS_KEY'];
    delete process.env['SES_FROM_EMAIL'];
  });

  afterAll(() => { process.env = originalEnv; });

  it('suppresses delivery without contacting SES when email is disabled', async () => {
    await expect(sesProvider.deliver(job)).resolves.toEqual({ status: 'SUPPRESSED' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('suppresses delivery when a different provider is selected', async () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'sendgrid';
    await expect(sesProvider.deliver(job)).resolves.toEqual({ status: 'SUPPRESSED' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('tags the delivery ID and returns the SES message ID', async () => {
    process.env['EMAIL_ENABLED'] = 'true';
    process.env['EMAIL_PROVIDER'] = 'ses';
    process.env['AWS_REGION'] = 'eu-west-1';
    process.env['AWS_ACCESS_KEY_ID'] = 'test-key';
    process.env['AWS_SECRET_ACCESS_KEY'] = 'test-secret';
    process.env['SES_FROM_EMAIL'] = 'notifications@example.test';
    mockSend.mockResolvedValue({ MessageId: 'ses-message-id' });

    sesProvider.configure();
    await expect(sesProvider.deliver(job)).resolves.toEqual({ status: 'ACCEPTED', providerMessageId: 'ses-message-id' });
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      input: expect.objectContaining({
        EmailTags: [{ Name: 'cl_delivery_id', Value: job.deliveryId }],
      }),
    }));
  });

  it('requires AWS credentials at configure time when enabled', () => {
    process.env['EMAIL_ENABLED'] = 'true';
    expect(() => sesProvider.configure()).toThrow('AWS_REGION is required');
  });
});
