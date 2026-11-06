import { nowLocalInput, toLocalInput } from './news-admin';

describe('date inputs', () => {
  it('trims an API time to what a datetime-local input accepts, without shifting it', () => {
    expect(toLocalInput('2026-10-26T08:00:00')).toBe('2026-10-26T08:00');
  });

  it('leaves a missing time blank', () => {
    expect(toLocalInput(null)).toBe('');
    expect(toLocalInput(undefined)).toBe('');
  });

  it('fills in the current local time for a new record', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2027, 2, 1, 14, 30));
    try {
      expect(nowLocalInput()).toBe('2027-03-01T14:30');
    } finally {
      vi.useRealTimers();
    }
  });
});
