const mockAcceptEmailIntent = jest.fn();
const mockAudit = jest.fn();

jest.mock('@christian-listings/auth', () => ({
  requirePlatformAdmin: jest.fn(() => ({ firebaseUid: 'admin-1', email: 'support@example.test', roles: ['SUPPORT_AGENT'] })),
}));
jest.mock('../services/email-orchestration.service', () => ({
  acceptEmailIntent: mockAcceptEmailIntent,
  retryEmailDelivery: jest.fn(),
}));
jest.mock('./verification.resolver', () => ({ audit: mockAudit }));
jest.mock('../models', () => ({ EmailDeliveryModel: {} }));

import { emailResolvers } from './email.resolver';

describe('email resolver controlled tests', () => {
  const originalEnv = process.env;
  const context = { auth: {}, request: {} } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, EMAIL_ENABLED: 'true', EMAIL_PROVIDER: 'sendgrid' };
    mockAcceptEmailIntent.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      status: 'QUEUED',
      toObject: () => ({ to: 'recipient@example.test', subject: 'Christian Listings SendGrid test', status: 'QUEUED', events: [] }),
      events: [],
    });
  });

  afterAll(() => { process.env = originalEnv; });

  it('queues and audits a controlled SendGrid test', async () => {
    await expect(emailResolvers.Mutation.sendTestEmail(undefined, { to: ' Recipient@Example.Test ' }, context)).resolves.toEqual(expect.objectContaining({
      id: '507f1f77bcf86cd799439011', status: 'QUEUED', to: 'recipient@example.test',
    }));
    expect(mockAcceptEmailIntent).toHaveBeenCalledWith(expect.objectContaining({ templateKey: 'SENDGRID_TEST', to: 'recipient@example.test' }));
    expect(mockAudit).toHaveBeenCalledWith(context, 'admin-1', 'EMAIL_TEST', '507f1f77bcf86cd799439011', 'EMAIL_DELIVERY', expect.stringContaining('recipient@example.test'), null, 'QUEUED');
  });

  it('refuses to create a misleading suppressed test while delivery is disabled', async () => {
    process.env['EMAIL_ENABLED'] = 'false';
    await expect(emailResolvers.Mutation.sendTestEmail(undefined, { to: 'recipient@example.test' }, context)).rejects.toThrow('Email delivery is disabled');
    expect(mockAcceptEmailIntent).not.toHaveBeenCalled();
  });
});
