// Reviewed on 2024-09-18

// [mfs]  I feel like mmDorm, mmHall, and mmStairs should all just be in an "mm"
//        file, as different levels.  This will be easier if we don't have the
//        hawks quest tied to levels of mmdorm anymore.
//
// [mfs]  Other than that, all we need to change is to use tilemaps

import { stage } from "../../jetlag/Stage";
import { SessionInfo } from "../storage/session";
import { boundLine, cornerBoundBox } from "../common/boundBox";
import { createMap } from "../common/map";
import { HUD } from "../ui/hud";
import { Spawner } from "../common/spawner";
import { InspectSystem } from "../interactions/inspectUi";
import { mmDormBuilder } from "./mmDorm";
import { mmStairsBuilder } from "./mmStairs";
import { AnimationState } from "../../jetlag";
import { Inspectable } from "../interactions/inspectables";
import { LevelInfo } from "../storage/level";
import { getRegularDir, makeMainCharacter } from "../characters/character";
import { KeyboardHandler } from "../ui/keyboard";
import { Places } from "./places";
import { Builder } from "../multiplayer/loginSystem";
import { spawnRegularNpc, NpcNames } from "../characters/NPC";
import { loadPlacedObjects } from "../interactions/pickupable";
import { TimedEvent } from "../../jetlag";

/**
 * Build the hallway in M&M
 */
export const mmHallBuilder: Builder = function (level: number) {
  // session storage
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;

  let lInfo = new LevelInfo();
  (lInfo as any).roomId = "mmHall"; // [Ishmum Zaman] Tag for persistence system
  stage.storage.setLevel("levelInfo", lInfo);

  lInfo.hud = new HUD("M&M House", "Hallway");
  // set the location and player
  createMap(672, 288, "mmHall.png");
  mmHallBounding();
  let player = makeMainCharacter(6.6, 3.4, sStore.playerAppearance!, AnimationState.IDLE_S);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);
  // blocked doors spawnables
  let otherDoors = new InspectSystem(Inspectable.MM_HALL_OTHER_DOORS);
  new Spawner(2.4, 1.4, 1.5, 0.8, () => { otherDoors.open() });
  new Spawner(8.15, 1.4, 1.5, 0.8, () => { otherDoors.open() });
  new Spawner(11.1, 1.4, 1.5, 0.8, () => { otherDoors.open() });
  // doors and stairs spawnables
  new Spawner(5.3, 1.4, 1.5, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 3.35; sStore.goToY = 9; stage.switchTo(mmDormBuilder, 1); });
  new Spawner(2.9, 6.2, 1.5, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 2.9; sStore.goToY = 2.9; stage.switchTo(mmStairsBuilder, 1); });
  new Spawner(10.6, 6.2, 1.5, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 10.6; sStore.goToY = 2.9; stage.switchTo(mmStairsBuilder, 1); });

  // Update the map and NPC based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.MM_HALL, level);

  // Load placed objects after one tick to ensure correct builder context
  stage.world.timer.addEvent(new TimedEvent(0, false, () => { loadPlacedObjects(); })); // [Ishmum Zaman] load after builder completes
}
mmHallBuilder.builderName = "mmHall";
mmHallBuilder.playerLimit = 5

// bounding for the M&M Hallway level
function mmHallBounding() {
  cornerBoundBox(0, 4.8, 1.9, 5.8)
  cornerBoundBox(3.9, 4.8, 9.6, 5.75)
  cornerBoundBox(11.6, 4.8, 13.4, 5.75)
  boundLine(0.9, 12.5, 1.85, false)
  boundLine(1.9, 4.8, 0.9, true)
  boundLine(1.9, 4.8, 12.5, true)
  cornerBoundBox(3.1, 1.9, 3.6, 2.4)
  cornerBoundBox(6.4, 1.8, 7, 2.2)
  cornerBoundBox(9.8, 1.9, 10.3, 2.4)
  cornerBoundBox(11.5, 1.9, 12.4, 2.2)
  cornerBoundBox(4, 1.9, 4.5, 2.1)
  cornerBoundBox(1, 4, 1.8, 4.8)
  cornerBoundBox(11.6, 4, 12.4, 4.8)
}