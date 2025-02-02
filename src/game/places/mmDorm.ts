// Reviewed on 2024-09-18

// [mfs]  We will want to be able to re-arrange the room, and have it stay
//        re-arranged.
//
// [mfs]  When we switch the quest system, this will stop needing `level`.

import { Actor, AnimationState, BoxBody, FilledBox, Obstacle, stage } from "../../jetlag";
import { InspectSystem } from "../interactions/inspectUi";
import { boundLine, cornerBoundBox } from "../common/boundBox";
import { createMap } from "../common/map";
import { Spawner } from "../common/spawner";
import { SessionInfo } from "../storage/session";
import { mmHallBuilder } from "./mmHall";
import { Inspectable } from "../interactions/inspectables";
import { LevelInfo } from "../storage/level";
import { HUD } from "../ui/hud";
import { KeyboardHandler } from "../ui/keyboard";
import { makeMainCharacter } from "../characters/character";
import { Places } from "./places";
import { spawnRegularNpc, NpcNames } from "../characters/NPC";
import { Builder } from "../multiplayer/loginSystem";

// [mfs]  I exported the tilemap as a json, so it can be imported like this.
//        Note that I didn't do the furniture, because that might change...
import * as dorm_objects from "../../../tilemaps/TileMaps/mfsDorm.json"

/**
 * Build all levels occurring the m&m dorm
 * 
 * @param level the level to build
 */
export const mmDormBuilder: Builder = function (level: number) {
  // Set up session and level storage
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = new LevelInfo();
  stage.storage.setLevel("levelInfo", lInfo);

  // Map and bounding box and collision boxes
  createMap(335, 480, "mmDorm.png");
  // NB:  Instead of calling mmDormBounding(), use the tilemap to draw some
  //      walls.
  // mmDormBounding();
  for (let layer of dorm_objects.layers) {
    if (layer.name === "border_objects") {
      // NB:  createMap says the background is 335x480, with a 50 pixel/meter
      //      ratio
      let pmr = 50;
      for (let o of layer.objects ?? []) {
        let width = o.width / pmr;
        let height = o.height / pmr;
        let cx = o.x / pmr + o.width / pmr / 2;
        let cy = o.y / pmr + o.height / pmr / 2;
        new Actor({
          appearance: new FilledBox({ width: o.width / pmr, height: o.height / pmr, fillColor: "#FF000000" }),
          rigidBody: new BoxBody({ width, height, cx, cy }),
          role: new Obstacle()
        });
      }
    }
  }

  // Set current location
  lInfo.hud = new HUD("M&M House", "Your Dorm Room");

  // Create player and keyboard handler
  let player = makeMainCharacter(3.4, 4.8, sStore.playerAppearance!, AnimationState.IDLE_W);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  // Create interactable items within our dorm room
  let closet = new InspectSystem(Inspectable.MM_DORM_CLOSET);
  new Spawner(4.8, 2.3, 1.3, 0.5, "empty.png", () => { closet.openUi() });

  let roommateCloset = new InspectSystem(Inspectable.MM_DORM_ROOMMATE_CLOSET);
  new Spawner(1.9, 2.3, 1.3, 0.5, "empty.png", () => { roommateCloset.openUi() });

  let bed = new InspectSystem(Inspectable.MM_DORM_BED);
  new Spawner(5.3, 5.1, 1, 1.4, "empty.png", () => { bed.openUi() });

  let trash = new InspectSystem(Inspectable.MM_DORM_TRASH);
  new Spawner(1.4, 7.6, 0.8, 0.8, "empty.png", () => { trash.openUi() });

  let boxes = new InspectSystem(Inspectable.MM_DORM_BOXES);
  new Spawner(5.2, 7.6, 0.8, 0.8, "empty.png", () => { boxes.openUi() });

  // Door for the player to exit into the hallway
  new Spawner(3.3, 10, 2, 0.8, "empty.png", () => {
    // Where the player should spawn
    sStore.locX = 5.3;
    sStore.locY = 2.5;
    stage.switchTo(mmHallBuilder, 1);
  });

  let jake = spawnRegularNpc(NpcNames.Jake, 2.1, 4.7, AnimationState.IDLE_E);

  // Update the map and NPC based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.MM_DORM, level);
  sStore.currQuest?.onMakeNpc(Places.MM_DORM, level, jake);
}
mmDormBuilder.builderName = "mmDorm";
mmDormBuilder.playerLimit = 1

/**
 * M&M dorm specific dorm boundaries and hitboxes
 */
function mmDormBounding() {
  cornerBoundBox(0, 8.7, 2.3, 9.6)
  cornerBoundBox(4.4, 8.7, 6.7, 9.6)
  cornerBoundBox(0.9, 3, 1.8, 8.1)
  boundLine(8.6, 1.9, 0.9, true)
  boundLine(8.6, 1.9, 5.8, true)
  cornerBoundBox(4.9, 3, 5.8, 7.9)
  cornerBoundBox(1, 1.9, 2.8, 2.5)
  cornerBoundBox(3.9, 1.9, 5.7, 2.5)
  boundLine(2.8, 3.9, 1.9, false)
  cornerBoundBox(4.1, 5.8, 4.7, 6.9)
  cornerBoundBox(1.9, 5.8, 2.4, 7)
}