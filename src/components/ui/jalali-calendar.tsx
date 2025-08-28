'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DatePicker, { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

interface JalaliCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
}

interface JalaliDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function JalaliCalendar({ 
  selected, 
  onSelect, 
  className, 
  disabled 
}: JalaliCalendarProps) {
  const handleDateChange = (dateObject: any) => {
    if (dateObject && onSelect) {
      const jsDate = dateObject.toDate();
      if (!disabled?.(jsDate)) {
        onSelect(jsDate);
      }
    }
  };

  const selectedDateObject = selected ? new DateObject(selected).convert(persian) : null;

  return (
    <div className={cn("bg-background rounded-lg border", className)} dir="rtl">
      <DatePicker
        value={selectedDateObject}
        onChange={handleDateChange}
        calendar={persian}
        locale={persian_fa}
        onlyShowInRangeDates={false}
        showOtherDays
        renderInput={() => <div style={{ display: 'none' }} />}
        style={{
          width: "100%",
          boxSizing: "border-box",
          height: "auto"
        }}
        containerStyle={{
          width: "100%"
        }}
        calendarPosition="static"
      />
    </div>
  );
}

export function JalaliDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled
}: JalaliDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<DateObject | null>(null);

  // Update selected date when value prop changes
  React.useEffect(() => {
    if (value) {
      try {
        // Parse YYYY-MM-DD format to Date then convert to Persian DateObject
        const parts = value.split('-');
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        setSelectedDate(new DateObject(date).convert(persian));
      } catch (error) {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateSelect = (dateObject: any) => {
    if (dateObject) {
      setSelectedDate(dateObject);
      if (onChange) {
        // Convert to Gregorian date and format as YYYY-MM-DD
        const jsDate = dateObject.toDate();
        const gregorianDate = new DateObject(jsDate);
        const formattedDate = gregorianDate.format('YYYY-MM-DD');
        onChange(formattedDate);
      }
      // Force re-render to ensure font updates
      setTimeout(() => {
        setSelectedDate(dateObject);
      }, 0);
    }
    setOpen(false);
  };

  const displayValue = selectedDate 
    ? selectedDate.format('YYYY/MM/DD').replace(/[0-9]/g, (digit: string) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(digit)])
    : '';

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-start font-normal h-9 px-3 py-1 text-base md:text-sm text-center",
          !selectedDate && "text-muted-foreground placeholder:text-muted-foreground",
          className
        )}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        key={selectedDate?.toString() || 'empty'}
      >
        <span className="w-full text-center" style={{ fontFeatureSettings: '"numr" 1' }}>
          {displayValue || placeholder}
        </span>
      </Button>
      
      {open && (
        <>
          {/* Overlay to close calendar when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full mt-2 z-50">
            <div className="bg-white shadow-lg border rounded-lg overflow-hidden p-2" dir="rtl">
              <Calendar
                value={selectedDate}
                onChange={handleDateSelect}
                calendar={persian}
                locale={persian_fa}
                showOtherDays
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}