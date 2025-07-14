/**
 * Calculate the distance between two points
 * @param x1 X coordinate of first point
 * @param y1 Y coordinate of first point
 * @param x2 X coordinate of second point
 * @param y2 Y coordinate of second point
 * @returns The distance between the two points
 */
export function distanceBetween(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is within a certain range of another point
 * @param x1 X coordinate of first point
 * @param y1 Y coordinate of first point
 * @param x2 X coordinate of second point
 * @param y2 Y coordinate of second point
 * @param range The maximum distance
 * @returns True if within range, false otherwise
 */
export function isWithinRange(x1: number, y1: number, x2: number, y2: number, range: number): boolean {
  return distanceBetween(x1, y1, x2, y2) <= range;
} 