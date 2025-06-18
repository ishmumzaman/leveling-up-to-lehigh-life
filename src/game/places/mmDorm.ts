// Reviewed on 2024-09-18

// [mfs]  We will want to be able to re-arrange the room, and have it stay
//        re-arranged.
//
// [mfs]  When we switch the quest system, this will stop needing `level`.

import { AnimationState, stage } from "../../jetlag";
import { InspectSystem } from "../interactions/inspectUi";
import { createMap, PIXEL_TO_METER_RATIO } from "../common/map";
import { Spawner } from "../common/spawner";
import { SessionInfo } from "../storage/session";
import { mmHallBuilder } from "./mmHall";
import { Inspectable } from "../interactions/inspectables";
import { LevelInfo } from "../storage/level";
import { HUD } from "../ui/hud";
import { KeyboardHandler } from "../ui/keyboard";
import { getRegularDir, makeMainCharacter } from "../characters/character";
import { Places } from "./places";
import { spawnRegularNpc, NpcNames } from "../characters/NPC";
import { Builder } from "../multiplayer/loginSystem";
import { drawObjects } from "./walls";
import { HawksQuest } from "../quests/hawksQuest";
import { NpcBehavior } from "../characters/NPC";

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

  // Draw the map, make the walls from the objects in the json
  createMap(335, 480, "mmDorm.png");
  dorm_objects.layers.forEach(layer => drawObjects(PIXEL_TO_METER_RATIO, layer.objects ?? []));

  // Set current location
  lInfo.hud = new HUD("M&M House", "Your Dorm Room");

  // Create player and keyboard handler
  let player = makeMainCharacter(3.4, 4.8, sStore.playerAppearance!, AnimationState.IDLE_W);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  // Create interactable items within our dorm room
  let closet = new InspectSystem(Inspectable.MM_DORM_CLOSET);
  new Spawner(4.8, 2.3, 1.3, 0.5, () => { closet.open() });

  let roommateCloset = new InspectSystem(Inspectable.MM_DORM_ROOMMATE_CLOSET);
  new Spawner(1.9, 2.3, 1.3, 0.5, () => { roommateCloset.open() });

  let bed = new InspectSystem(Inspectable.MM_DORM_BED);
  new Spawner(5.3, 5.1, 1, 1.4, () => { bed.open() });

  let trash = new InspectSystem(Inspectable.MM_DORM_TRASH);
  new Spawner(1.4, 7.6, 0.8, 0.8, () => { trash.open() });

  let boxes = new InspectSystem(Inspectable.MM_DORM_BOXES);
  new Spawner(5.2, 7.6, 0.8, 0.8, () => { boxes.open() });

  // Door for the player to exit into the hallway
  new Spawner(3.3, 10, 2, 0.8, () => {
    sStore.dir = getRegularDir(player);
    // Where the player should spawn
    sStore.goToX = 5.3;
    sStore.goToY = 2.5;
    stage.switchTo(mmHallBuilder, 1);
  });

  let jake = spawnRegularNpc(NpcNames.Jake, 2.1, 4.7, AnimationState.IDLE_E);
  let questActivated = false;

  // Define custom interaction logic
  (jake.extra as NpcBehavior).onInteract = () => {
    if (!questActivated) {
      console.log("Interacting with Jake...");
      
      // Activate the quest
      sStore.currQuest = new HawksQuest();
      console.log("Quest changed to HawksQuest!");

      // Update the level and NPC based on the new quest
      sStore.currQuest?.onBuildPlace(Places.MM_DORM, level);
      sStore.currQuest?.onMakeNpc(Places.MM_DORM, level, jake);

      questActivated = true; // Mark the quest as activated
    } else {
      console.log("Jake has nothing new to say.");
    }
  };

  // Update the map and NPC based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.MM_DORM, level);
  sStore.currQuest?.onMakeNpc(Places.MM_DORM, level, jake);
}
mmDormBuilder.builderName = "mmDorm";
mmDormBuilder.playerLimit = 1