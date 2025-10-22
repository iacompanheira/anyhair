/**
 * Provides a centralized function to get the current date and time.
 * This makes the application's concept of "now" consistent and easy to manage or mock for testing.
 * In a real testing scenario, you could mock this function to return a fixed date.
 * @returns The current Date object.
 */
export const getMockNow = (): Date => {
  return new Date('2025-10-15T12:00:00Z');
};