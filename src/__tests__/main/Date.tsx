import { extractSpeakingDates, getFriendlyDateGroup, replaceSpeakingDatesWithAbsoluteDates } from '../../main/modules/Date';
import dayjs from 'dayjs';

jest.mock('../../main/modules/File/Write', () => ({
  writeContentToFile: jest.fn(),
}));

jest.mock('../../main/config', () => ({
  config: {
    get: jest.fn(),
  }
}));

const currentDate = dayjs();
const nextMonday = currentDate.add(1, 'week').startOf('week').add(1, 'day');
const formattedNextMonday = nextMonday.format('YYYY-MM-DD');

describe('extractSpeakingDates', () => {
  it('should extract due date in absolute format', () => {
    const body = 'Test due:2023-09-13';
    const result = extractSpeakingDates(body);
    expect(result['due:']).toEqual({
      date: '2023-09-13',
      string: '2023-09-13',
      type: 'absolute',
      notify: false,
    });
  });

  it('should extract t date in relative format', () => {
    const body = 'Test t:next Monday';
    const result = extractSpeakingDates(body);
    expect(result['t:']).toEqual({
      date: formattedNextMonday,
      string: 'next Monday',
      type: 'relative',
      notify: false,
    });
  });

  it('should extract due date in relative format', () => {
    const body = 'Test due:Sunday, January 15th 2012';
    const result = extractSpeakingDates(body);
    expect(result['due:']).toEqual({
      date: '2012-01-15',
      string: 'Sunday, January 15th 2012',
      type: 'relative',
      notify: false,
    });
  });  

});

describe('replaceSpeakingDatesWithAbsoluteDates', () => {
  it('should replace due date with absolute date', () => {
    const body = 'Test due:2023-09-13';
    const result = replaceSpeakingDatesWithAbsoluteDates(body);
    expect(result).toBe('Test due:2023-09-13');
  });

  it('should replace t date with absolute date', () => {
    const body = 'Test t:next Monday';
    const result = replaceSpeakingDatesWithAbsoluteDates(body);
    expect(result).toBe('Test t:' + formattedNextMonday);
  });

});

describe('getFriendlyDateGroup', () => {
  expect(dayjs().format('YYYY-MM-DD')).toBe('2024-01-01');

  const cases = [
    { dateStr: '1970-01-01T00:00:00.000', expectedGroup: 'before-last-week' },
    { dateStr: '2023-12-24T23:59:59.999', expectedGroup: 'before-last-week' },
    { dateStr: '2023-12-25T00:00:00.000', expectedGroup: 'last-week' },
    { dateStr: '2023-12-30T23:59:59.999', expectedGroup: 'last-week' },
    { dateStr: '2023-12-31T00:00:00.000', expectedGroup: 'yesterday' },
    { dateStr: '2023-12-31T23:59:59.999', expectedGroup: 'yesterday' },
    { dateStr: '2024-01-01T00:00:00.000', expectedGroup: 'today' },
    { dateStr: '2024-01-01T23:59:59.999', expectedGroup: 'today' },
    { dateStr: '2024-01-02T00:00:00.000', expectedGroup: 'tomorrow' },
    { dateStr: '2024-01-02T23:59:59.999', expectedGroup: 'tomorrow' },
    { dateStr: '2024-01-03T00:00:00.000', expectedGroup: 'this-week' },
    { dateStr: '2024-01-07T23:59:59.999', expectedGroup: 'this-week' },
    { dateStr: '2024-01-08T00:00:00.000', expectedGroup: 'next-week' },
    { dateStr: '2024-01-14T23:59:59.999', expectedGroup: 'next-week' },
    { dateStr: '2024-01-15T00:00:00.000', expectedGroup: 'this-month' },
    { dateStr: '2024-01-31T23:59:59.999', expectedGroup: 'this-month' },
    { dateStr: '2024-02-15T00:00:00.000', expectedGroup: 'next-month' },
    { dateStr: '2024-02-29T23:59:59.999', expectedGroup: 'next-month' },
    { dateStr: '2024-03-01T00:00:00.000', expectedGroup: 'after-next-month' },
    { dateStr: '3000-01-01T00:00:00.000', expectedGroup: 'after-next-month' },
  ];

  test.each(cases)('should return $expectedGroup for $dateStr', ({ expectedGroup, dateStr }) => {
    const date = dayjs(dateStr);
    const result = getFriendlyDateGroup(date);
    expect(result).toBe(expectedGroup);
  });
});
