// Reviewed on 2024-09-18

// [mfs]  We will want to be able to re-arrange the room, and have it stay
//        re-arranged.
//
// [mfs]  When we switch the quest system, this will stop needing `level`.

import { AnimationState, stage } from "../../jetlag";
import { createMap } from "../common/map";
import { Spawner } from "../common/spawner";
import { SessionInfo } from "../storage/session";
import { LevelInfo } from "../storage/level";
import { HUD } from "../ui/hud";
import { KeyboardHandler } from "../ui/keyboard";
import { makeMainCharacter } from "../characters/character";
import { Builder } from "../multiplayer/loginSystem";
import { buildAsaPackerOutside } from "./asa_campus_outside";
import { drawObjects } from "./walls";
import { Places } from "./places";
import { loadPlacedObjects } from "../interactions/pickupable";
import { TimedEvent } from "../../jetlag";

// [mfs]  I exported the tilemap as a json, so it can be imported like this.
//        Note that I didn't do the furniture, because that might change...
import * as hall_objects from "../../../tilemaps/TileMaps/DnkrReadRoom.json"

/**
 * Build all levels occurring in rathbone
 *
 * @param level the level to build
 */
export const DnkrReadRoomBuilder: Builder = function (_level: number) {
  // Set up session and level storage
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = new LevelInfo();
  (lInfo as any).roomId = "DnkrReadRoom"; // [Ishmum Zaman]
  stage.storage.setLevel("levelInfo", lInfo);

  // Draw the map, make the walls from the objects in the json
  createMap(1440, 960, "locBg/DnkrReadRoom.png");
  hall_objects.layers.forEach(layer => drawObjects(50, layer.objects ?? []));

  // Set current location
  lInfo.hud = new HUD("Drinker", "Read Room");

  // Create player and keyboard handler
  let player = makeMainCharacter(10, 10, sStore.playerAppearance!, AnimationState.IDLE_W);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  //door to leave rathbone (Currently just takes back to temp spawner location in asa_campus_outside.ts)
  new Spawner(32.6, 34.6, 2, 0.8, () => { sStore.goToX = 97.5; sStore.goToY = 21.3; stage.switchTo(buildAsaPackerOutside, 1); });

  // Update the map based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.DNKR_READ_ROOM, _level);

  // Load any previously placed objects for this room
  stage.world.timer.addEvent(new TimedEvent(0,false,() => { loadPlacedObjects(); }));
}
DnkrReadRoomBuilder.builderName = "DnkrReadRoom";
DnkrReadRoomBuilder.playerLimit = 15