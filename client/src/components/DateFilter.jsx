import React from "react";
import "./styles/DateFilter.css";

export default function DateFilter({
  value = "all",
  onChange,
  customStartDate = "",
  customEndDate = "",
  onCustomStartDateChange,
  onCustomEndDateChange,
  className = "",
  options = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "custom", label: "Custom" },
  ],
  showCustomInputs = true,
  disabled = false,
}) {
  return (
    <div className={`date-filter ${className}`.trim()}>
      <div className="date-filter__select-wrap">
        <select
          className="date-filter__select"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {showCustomInputs && value === "custom" && (
        <div className="date-filter__custom-row">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onCustomStartDateChange?.(e.target.value)}
            className="date-filter__input"
            disabled={disabled}
          />
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => onCustomEndDateChange?.(e.target.value)}
            className="date-filter__input"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}