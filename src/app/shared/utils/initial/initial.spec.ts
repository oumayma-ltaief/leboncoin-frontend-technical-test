import { getInitial } from './initial';

describe('getInitial', () => {
  it('should give the first letter of the nickname in upper case', () => {
    expect(getInitial('alice')).toBe('A');
  });
});
