import React from 'react';

interface CustomDateRangePickerProps {
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  disabled?: boolean;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({ 
  startDate, 
  onStartDateChange, 
  endDate, 
  onEndDateChange,
  disabled = false
}) => {
  return (
    <div className="my-4 p-3 bg-slate-700/50 rounded-md border border-slate-600 space-y-3">
      <p className="text-sm text-slate-300 font-medium">Custom Date Range:</p>
      <div>
        <label htmlFor="startDate" className="block text-xs font-medium text-slate-400 mb-1">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
      <div>
        <label htmlFor="endDate" className="block text-xs font-medium text-slate-400 mb-1">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
      {(!startDate || !endDate) && !disabled && <p className="text-xs text-amber-400 mt-1">Both start and end dates are required for a custom range search.</p>}
    </div>
  );
};

export default CustomDateRangePicker;
