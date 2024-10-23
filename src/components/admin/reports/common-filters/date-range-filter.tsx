import React from 'react';
import { DateRange, DateRangePicker } from '@mui/x-date-pickers-pro';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersShortcutsItem } from '@mui/x-date-pickers/PickersShortcuts';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangeFilterProps {
  dateRange?: DateRange<Dayjs>;
  onDateChange?: (dateRange: DateRange<Dayjs>) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onDateChange }) => {
  const handleDateChange = (newValue: DateRange<Dayjs>) => {
    if (onDateChange) {
      onDateChange(newValue);
    }
  };

  const shortcutsItems: PickersShortcutsItem<DateRange<Dayjs>>[] = [
    {
      label: 'This Week',
      getValue: () => {
        const today = dayjs();
        return [today.startOf('week'), today.endOf('week')];
      },
    },
    {
      label: 'Last Week',
      getValue: () => {
        const today = dayjs();
        const prevWeek = today.subtract(7, 'day');
        return [prevWeek.startOf('week'), prevWeek.endOf('week')];
      },
    },
    {
      label: 'Last 7 Days',
      getValue: () => {
        const today = dayjs();
        return [today.subtract(7, 'day'), today];
      },
    },
    {
      label: 'Current Month',
      getValue: () => {
        const today = dayjs();
        return [today.startOf('month'), today];
      },
    },
    {
      label: 'Last Month',
      getValue: () => {
        const today = dayjs();
        const startOfLastMonth = today.subtract(1, 'month').startOf('month');
        const endOfLastMonth = today.subtract(1, 'month').endOf('month');
        return [startOfLastMonth, endOfLastMonth];
      },
    },
    {
      label: 'Current Year',
      getValue: () => {
        const today = dayjs();
        const startOfYear = today.startOf('year');
        const endOfYear = today;
        return [startOfYear, endOfYear];
      },
    },
    {
      label: 'Last Year',
      getValue: () => {
        const today = dayjs();
        const startOfLastYear = today.subtract(1, 'year').startOf('year');
        const endOfLastYear = today.subtract(1, 'year').endOf('year');
        return [startOfLastYear, endOfLastYear];
      },
    },
    { label: 'Reset', getValue: () => [null, null] },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateRangePicker
        localeText={{ start: 'Start Date', end: 'End Date' }}
        value={dateRange}
        onChange={handleDateChange}
        slots={{ field: SingleInputDateRangeField }}
        slotProps={{
          shortcuts: {
            items: shortcutsItems,
          },
          actionBar: { actions: [] },
        }}
        calendars={2}
      />
    </LocalizationProvider>
  );
};

export default DateRangeFilter;
