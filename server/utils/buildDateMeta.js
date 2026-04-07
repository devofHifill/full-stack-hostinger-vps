export function buildDateMeta({ range, startDate, endDate }) {
  if (range === "today") {
    return {
      dateRangeLabel: "Today",
      groupedBy: "Hours",
    };
  }

  if (range === "7d") {
    return {
      dateRangeLabel: "Last 7 Days",
      groupedBy: "Days",
    };
  }

  if (range === "30d") {
    return {
      dateRangeLabel: "Last 30 Days",
      groupedBy: "Days",
    };
  }

  if (startDate && endDate) {
    return {
      dateRangeLabel: `${startDate} → ${endDate}`,
      groupedBy: "Days",
    };
  }

  if (startDate) {
    return {
      dateRangeLabel: `${startDate} onward`,
      groupedBy: "Days",
    };
  }

  if (endDate) {
    return {
      dateRangeLabel: `Until ${endDate}`,
      groupedBy: "Days",
    };
  }

  return {
    dateRangeLabel: "All Time",
    groupedBy: "Days",
  };
}