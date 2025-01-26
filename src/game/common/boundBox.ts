// Reviewed on 2024-09-18

import { FilledBox, BoxBody, Obstacle, Actor } from "../../jetlag";

/**
 * Draws a empty bounding box around a given center point, with the given width
 * and height.
 *
 * @param cx  The x-coordinate of the center point.
 * @param cy  The y-coordinate of the center point.
 * @param w   The width of the bounding box.
 * @param h   The height of the bounding box.
 *
 * @returns An object containing the four sides of the bounding box as actors.
 */
export function centerBoundBox(cx: number, cy: number, w: number, h: number) {
  // Top side of the bounding box
  let t = new Actor({
    appearance: new FilledBox({ width: w, height: 0.01, fillColor: "#ff000000" }),
    rigidBody: new BoxBody({ cx: cx, cy: cy - (h / 2) - 0.01, width: w, height: 0.01 }),
    role: new Obstacle(),
  });

  // Bottom side of the bounding box
  let b = new Actor({
    appearance: new FilledBox({ width: w, height: 0.01, fillColor: "#ff000000" }),
    rigidBody: new BoxBody({ cx: cx, cy: cy + (h / 2) + 0.01, width: w, height: 0.01 }),
    role: new Obstacle(),
  });

  // Left side of the bounding box
  let l = new Actor({
    appearance: new FilledBox({ width: 0.01, height: h, fillColor: "#ff000000" }),
    rigidBody: new BoxBody({ cx: cx - (w / 2) - 0.01, cy: cy, width: 0.01, height: h }),
    role: new Obstacle(),
  });

  // Right side of the bounding box
  let r = new Actor({
    appearance: new FilledBox({ width: 0.01, height: h, fillColor: "#ff000000" }),
    rigidBody: new BoxBody({ cx: cx + (w / 2) + 0.01, cy: cy, width: 0.01, height: h }),
    role: new Obstacle(),
  });

  return { t, b, l, r };
}

/**
 * Draws a full bounding box with the given top-left and bottom-right
 * coordinates.
 *
 * @param tlx The x-coordinate of the top-left corner.
 * @param tly The y-coordinate of the top-left corner.
 * @param brx The x-coordinate of the bottom-right corner.
 * @param bry The y-coordinate of the bottom-right corner.
 * 
 * @returns An actor representing the bounding box.
 */
export function cornerBoundBox(tlx: number, tly: number, brx: number, bry: number) {
  return new Actor({
    appearance: new FilledBox({ width: 0, height: 0, fillColor: "#ff000000" }),
    rigidBody: new BoxBody({ cx: (tlx + brx) / 2, cy: (tly + bry) / 2, width: Math.abs(tlx - brx), height: Math.abs(tly - bry) }),
    role: new Obstacle(),
  });
}

/**
 * Draws a straight bounding line with the given start and end points on one
 * single axis.  The line will be very thin (.01 meters).
 *
 * [mfs]  I don't understand why this is needed.  Couldn't we just use
 *        diagBoundLine?
 *
 * @param start       The start coordinate of the line. (x if horizontal or y if
 *                    vertical)
 * @param end         The end coordinate of the line. (x if horizontal or y if
 *                    vertical)
 * @param c           The free constant coordinate of the line. (x if vertical
 *                    or y if horizontal) (yes it's confusing)
 * @param isVertical  Indicates whether the line is vertical (true) or
 *                    horizontal (false).
 *
 * @returns An actor representing the bounding line.
 */
export function boundLine(start: number, end: number, c: number, isVertical: boolean) {
  let length = Math.abs(start - end);

  if (isVertical) {
    return new Actor({
      appearance: new FilledBox({ width: .01, height: length, fillColor: "#ff000000" }),
      rigidBody: new BoxBody({ cx: c, cy: (start + end) / 2, width: 0.01, height: length }),
      role: new Obstacle(),
    });
  } else {
    return new Actor({
      appearance: new FilledBox({ width: length, height: 0.01, fillColor: "#ff000000" }),
      rigidBody: new BoxBody({ cx: (start + end) / 2, cy: c, width: length, height: 0.01 }),
      role: new Obstacle(),
    });
  }
}

/**
 * Draws a diagonal bounding line with the given start and end points.
 * 
 * @param sx  The x-coordinate of the start point.
 * @param sy  The y-coordinate of the start point.
 * @param ex  The x-coordinate of the end point.
 * @param ey  The y-coordinate of the end point.
 * 
 * @returns An actor representing the diagonal bounding line.
 */
export function diagBoundLine(sx: number, sy: number, ex: number, ey: number) {
  let height = Math.sqrt(Math.pow(sx - ex, 2) + Math.pow(sy - ey, 2));
  let l = new Actor({
    appearance: new FilledBox({ width: 0, height, fillColor: "#000000" }), // NOTE: DO NOT MAKE THIS TRANSPARENT. IT BREAKS FILTERS.
    rigidBody: new BoxBody({ cx: (sx + ex) / 2, cy: (sy + ey) / 2, width: 0.01, height }),
    role: new Obstacle(),
  });
  // Rotate the line to the correct angle
  let slope = (sy - ey) / (sx - ex);
  l.rigidBody.setRotation(Math.PI - Math.atan(slope));
  return l;
}