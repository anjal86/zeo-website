/**
 * Formats duration from various formats to "XN/YD" format
 * where nights = days - 1
 * 
 * Examples:
 * "13 nights 14 days" -> "13N/14D"
 * "14 days" -> "13N/14D"
 * "2 weeks" -> "13N/14D"
 * "16 Days" -> "15N/16D"
 */
export const formatDuration = (duration: string | number): string => {
  if (!duration && duration !== 0) return '';
  
  // Handle number input (days only)
  if (typeof duration === 'number') {
    const days = Math.round(duration); // Ensure it's a whole number
    const nights = Math.max(0, days - 1);
    return `${nights}N/${days}D`;
  }
  
  // Handle string that might be a number
  if (typeof duration === 'string') {
    const numericValue = parseFloat(duration);
    if (!isNaN(numericValue) && duration.trim() === numericValue.toString()) {
      const days = Math.round(numericValue);
      const nights = Math.max(0, days - 1);
      return `${nights}N/${days}D`;
    }
  }
  
  const durationLower = duration.toLowerCase().trim();
  
  // Try to extract days from various formats
  let days = 0;
  
  // Pattern 1: "X nights Y days" or "X days Y nights"
  const nightsDaysMatch = durationLower.match(/(\d+)\s*nights?\s*(\d+)\s*days?|(\d+)\s*days?\s*(\d+)\s*nights?/);
  if (nightsDaysMatch) {
    if (nightsDaysMatch[1] && nightsDaysMatch[2]) {
      // "X nights Y days"
      days = parseInt(nightsDaysMatch[2]);
    } else if (nightsDaysMatch[3] && nightsDaysMatch[4]) {
      // "X days Y nights"
      days = parseInt(nightsDaysMatch[3]);
    }
  }
  
  // Pattern 2: Just "X days"
  if (days === 0) {
    const daysMatch = durationLower.match(/(\d+)\s*days?/);
    if (daysMatch) {
      days = parseInt(daysMatch[1]);
    }
  }
  
  // Pattern 3: Just "X nights"
  if (days === 0) {
    const nightsMatch = durationLower.match(/(\d+)\s*nights?/);
    if (nightsMatch) {
      const nights = parseInt(nightsMatch[1]);
      days = nights + 1; // days = nights + 1
    }
  }
  
  // Pattern 4: "X weeks"
  if (days === 0) {
    const weeksMatch = durationLower.match(/(\d+)\s*weeks?/);
    if (weeksMatch) {
      days = parseInt(weeksMatch[1]) * 7;
    }
  }
  
  // If we found days, calculate nights and format
  if (days > 0) {
    const nights = Math.max(0, days - 1); // nights = days - 1
    return `${nights}N/${days}D`;
  }
  
  // If no pattern matched, return original duration
  return duration;
};