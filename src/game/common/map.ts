// Reviewed on 2024-09-18

import { Actor, BoxBody, ImageSprite, stage } from "../../jetlag";
import { centerBoundBox } from "./boundBox";

/**
 * Creates a map with the specified width, height, and image.
 * 
 * [mfs]  What are the units for w and h?
 * 
 * @param w   The width of the map.
 * @param h   The height of the map.
 * @param img The image for the map.
 * @returns   The created map actor.
 */
export function createMap(w: number, h: number, img: string) {
  // Calculate the center and dimensions of the map
  let width = w / 50;
  let height = h / 50;
  let cx = width / 2;
  let cy = height / 2;
  let map = new Actor({
    appearance: new ImageSprite({ width, height, img, z: -1 }),
    rigidBody: new BoxBody({ cx, cy, width, height }, { collisionsEnabled: false }),
  });

  // Sets a bounding box around the map
  centerBoundBox(cx, cy, width, height);

  // Set the background color of the stage
  stage.backgroundColor = "#0F0F0F";

  // Set the camera bounds according to the map size
  //
  // [mfs]  This seems kind of strange to me.  Why not move the image right or
  //        down if it's not big enough to fill the screen, and then also
  //        maybe have some default minimum margins?  Doing that might address
  //        the slight left-right scroll issues that occur in the dorm room...
  let minX = (width < 16) ? (cx - 8) : 0;
  let minY = (height < 9) ? (cy - 4.5) : 0;
  let maxX = (width < 16) ? (cx + 8) : width;
  let maxY = (height < 9) ? (cy + 4.5) : height;

  // Set the camera bounds
  stage.world.camera.setBounds(minX, minY, maxX, maxY);
  return map;
}