export function buildDateFilterParams(dateFilter, customStartDate, customEndDate) {
  const params = new URLSearchParams();

  if (dateFilter === "today") {
    params.set("range", "today");
  } else if (dateFilter === "7d") {
    params.set("range", "7d");
  } else if (dateFilter === "30d") {
    params.set("range", "30d");
  } else if (dateFilter === "custom") {
    if (customStartDate) params.set("startDate", customStartDate);
    if (customEndDate) params.set("endDate", customEndDate);
  }

  return params;
}