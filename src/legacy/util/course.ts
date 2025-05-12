import { format } from 'date-fns';

export function courseTimeToString(time: number) {
  return format(new Date(0, 0, 0, time / 100, time % 100), 'HH:mm');
}
