import React from 'react';

interface Timeframe {
  value: string;
  label: string;
}

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (newTimeframe: string) => void;
  timeframes: Timeframe[];
  disabled?: boolean;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ 
  selectedTimeframe, 
  onTimeframeChange, 
  timeframes,
  disabled = false 
}) => {
  return (
    <div className="mb-4">
      <label htmlFor="timeframeSelect" className="block text-sm font-medium text-slate-300 mb-1">Select Timeframe:</label>
      <select 
        id="timeframeSelect"
        value={selectedTimeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
        disabled={disabled}
        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {timeframes.map(tf => (
          <option key={tf.value} value={tf.value}>{tf.label}</option>
        ))}
      </select>
    </div>
  );
};

export default TimeframeSelector;
