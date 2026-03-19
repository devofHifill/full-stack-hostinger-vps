export function buildDateMatch({ range, startDate, endDate, field = "startedAt" }) {
  const match = {};

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    match[field] = { $gte: start, $lte: end };
    return match;
  }

  if (range === "7d") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    match[field] = { $gte: start, $lte: end };
    return match;
  }

  if (range === "30d") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    match[field] = { $gte: start, $lte: end };
    return match;
  }

  if (startDate || endDate) {
    match[field] = {};

    if (startDate) {
      match[field].$gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      match[field].$lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    if (Object.keys(match[field]).length === 0) {
      delete match[field];
    }

    return match;
  }

  return match;
}