export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export function getPeriodDateRange(period: string, customStart?: string, customEnd?: string): DateRange {
  if (period === 'custom' && customStart && customEnd) {
    const s = new Date(customStart); s.setHours(0, 0, 0, 0);
    const e = new Date(customEnd); e.setHours(23, 59, 59, 999);
    return { start: s, end: e, label: `${customStart} → ${customEnd}` };
  }
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const day = todayStart.getDay();
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - (day === 0 ? 6 : day - 1));

  switch (period) {
    case 'week':
      return { start: weekStart, end: now, label: '本周' };

    case 'lastweek': {
      const s = new Date(weekStart);
      s.setDate(s.getDate() - 7);
      const e = new Date(weekStart);
      e.setMilliseconds(-1);
      return { start: s, end: e, label: '上周' };
    }

    case 'twoweeksago': {
      const s = new Date(weekStart);
      s.setDate(s.getDate() - 14);
      const e = new Date(weekStart);
      e.setDate(e.getDate() - 7);
      e.setMilliseconds(-1);
      return { start: s, end: e, label: '上上周' };
    }

    case 'lastmonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: s, end: e, label: '上月' };
    }

    case 'year': {
      const s = new Date(now.getFullYear(), 0, 1);
      return { start: s, end: now, label: '今年' };
    }

    default: { // month
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: s, end: now, label: '本月' };
    }
  }
}
