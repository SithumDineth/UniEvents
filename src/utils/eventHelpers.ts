
/**
 * Check if an event is completed
 * @param event Event object
 * @returns boolean indicating if event is completed
 */
export function isEventCompleted(event: any): boolean {
  // Use the 'completed' field if available; if not present, treat as not completed
  if (typeof event.completed === 'boolean') {
    return event.completed;
  }
  // Fallback for compatibility (treat missing completed field as false
  return false;
}

/**
 * Sort events: active first, then completed
 * @param events Array of events
 * @returns Sorted array of events
 */
export function sortEvents(events: any[]): any[] {
  return [...events].sort((a, b) => {
    const aCompleted = isEventCompleted(a);
    const bCompleted = isEventCompleted(b);

    // If one is completed and the other isn't, completed comes last
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    // Both are active: sort by date ascending
    try {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    } catch (e) {
      return 0;
    }
  });
}

