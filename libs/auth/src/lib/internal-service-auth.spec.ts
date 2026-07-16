import { isInternalServiceRequest } from './internal-service-auth';

describe('isInternalServiceRequest', () => {
  const original = process.env['INTERNAL_SERVICE_KEY'];

  afterEach(() => {
    if (original === undefined) delete process.env['INTERNAL_SERVICE_KEY'];
    else process.env['INTERNAL_SERVICE_KEY'] = original;
  });

  it('accepts the exact configured service credential', () => {
    process.env['INTERNAL_SERVICE_KEY'] = 'test-secret-with-sufficient-entropy';
    expect(isInternalServiceRequest({ headers: { 'x-cl-service-key': 'test-secret-with-sufficient-entropy' } } as never)).toBe(true);
  });

  it('rejects missing and incorrect credentials', () => {
    process.env['INTERNAL_SERVICE_KEY'] = 'expected-secret';
    expect(isInternalServiceRequest({ headers: {} } as never)).toBe(false);
    expect(isInternalServiceRequest({ headers: { 'x-cl-service-key': 'wrong-secret' } } as never)).toBe(false);
  });
});
