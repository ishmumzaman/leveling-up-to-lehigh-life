// Reviewed on 2024-09-17
// [mfs]  This looks like it is not doing anything yet.

import { Actor, BoxBody, ImageSprite, Scene, stage, TextSprite } from "../../jetlag";
import { SessionInfo } from "../storage/session";

/**
 * Display stats in a given scene
 * 
 * @param scene The scene where the stat will be displayed
 */
export function renderStat(scene: Scene | undefined) {
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let stat = new Actor({
    rigidBody: new BoxBody({ cx: 14.5, cy: 1, width: 2, height: 1.2 }, { scene: scene }),
    appearance: [
      new ImageSprite({ width: 2.5, height: 1.7, img: "statUI.png", z: 2 }),
      new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: -0.7 } }, () => "Wellbeing: " + sStore.playerStat.wellness),
      new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: -0.2 } }, () => "Strength: " + sStore.playerStat.fitness),
      new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: 0.3 } }, () => "Energy: " + sStore.playerStat.energy)
    ],
  })
  return stat;
}

/* NOTE: NOT APPROPRIATE FOR USE YET
export function eat(food: FoodItem) {
    let sStore = stage.storage.getSession("sStore") as SStore;
    if (sStore.gameInvs.playerInv.removeFirst(food)) {
        sStore.playerStat.energy += 5;
    }
}
export function hunger() {
    let sStore = stage.storage.getSession("sStore") as SStore;
    stage.world.timer.addEvent(new TimedEvent(100, true, () => {
        sStore.playerStat.energy -= 5;
    }))
} */