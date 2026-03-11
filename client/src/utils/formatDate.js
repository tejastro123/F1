export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    // Handle "Mar 16" format
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const parts = dateStr.trim().split(' ');
    if (parts.length === 2 && months[parts[0]] !== undefined) {
      const date = new Date(2026, months[parts[0]], parseInt(parts[1]));
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const parseRaceDate = (dateStr) => {
  if (!dateStr) return null;
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parts = dateStr.trim().split(' ');
  if (parts.length === 2 && months[parts[0]] !== undefined) {
    return new Date(2026, months[parts[0]], parseInt(parts[1]));
  }
  return null;
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};
