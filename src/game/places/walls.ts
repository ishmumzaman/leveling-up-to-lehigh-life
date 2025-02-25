import { Actor, BoxBody, FilledBox, Obstacle } from "../../jetlag";

/** TmxObject describes the Objects in an Object Layer of a TMX file */
export interface TmxObject {
  /** The height of the object in pixels */
  height: number;
  /** The object's ID.  We don't use this */
  id: number;
  /** A name for the object.  We don't use this */
  name: string;
  /** The object's rotation (pivot is top left corner) */
  rotation: number;
  /** The object's type.  Our TMX has "" in all cases? */
  type: string;
  /** The visibility of the object.  We don't use this */
  visible: boolean;
  /** The width of the object in pixels */
  width: number;
  /** The X coordinate of the top left, in pixels */
  x: number;
  /** The Y coordinate of the top left, in pixels */
  y: number;
}

/**
 * Given an array of objects from a TMX, draw them
 *
 * @param pmr     The pixel-to-meter ratio of the TMX.  It's probably 50
 * @param objects An array of TmxObjects
 */
export function drawObjects(pmr: number, objects: TmxObject[]) {
  for (let o of objects) {
    let width = o.width / pmr;
    let height = o.height / pmr;
    // NB: The rotation is around the top-left corner, so we need some trig
    let rot = o.rotation * Math.PI / 180;// We need radians
    let l = o.x / pmr; // X coord of top left
    let t = o.y / pmr; // Y coord of top left
    // The length from TL to center
    let h = Math.sqrt(width / 2 * width / 2 + height / 2 * height / 2);
    // Only do the trig if we have rotation!
    let cx = rot != 0 ? l + h * Math.sin(rot) : l + width / 2;
    let cy = rot != 0 ? t + h * Math.cos(rot) : t + height / 2;
    let a = new Actor({
      appearance: new FilledBox({ width: o.width / pmr, height: o.height / pmr, fillColor: "#FF000000" }),
      rigidBody: new BoxBody({ width, height, cx, cy }),
      role: new Obstacle()
    });
    if (rot != 0) a.rigidBody.setRotation(rot);
  }
}  