import router from './app';

describe('application router', () => {
  it('defines the root application route', () => {
    expect(router.routes.some((route) => route.path === '/')).toBe(true);
  });

  it('includes the public home route', () => {
    const rootRoute = router.routes.find((route) => route.path === '/');
    expect(rootRoute?.children?.some((route) => route.index)).toBe(true);
  });
});
