import { storeCookie } from './browser-cookie';

describe('storeCookie', () => {
  it('should store the value in a cookie the server receives on the next visits', () => {
    expect(document.cookie).not.toContain('leboncoin-test-cookie');
    storeCookie('leboncoin-test-cookie', 'stored value');
    expect(document.cookie).toContain('leboncoin-test-cookie=stored%20value');
  });
});
