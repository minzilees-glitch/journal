import type { TimePeriod } from './types';

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function timePeriodFromDate(date: Date): TimePeriod {
  const hour = date.getHours();
  if (hour < 5) return '새벽';
  if (hour < 11) return '아침';
  if (hour < 14) return '점심';
  if (hour < 19) return '저녁';
  return '밤';
}

export function formatKoreanDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일  ${WEEKDAYS[date.getDay()]}`;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}
