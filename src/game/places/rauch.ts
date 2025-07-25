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
import { spawnRegularNpc, NpcNames } from "../characters/NPC";
import { makeQuestStartingNpc } from "../quests/helper";
import { erick_quest_starter, erick_busy, erick_quest_completed } from "../interactions/erickDlg";
import { FindAdvisorQuest } from "../quests/FindAdvisorQuest";

// [mfs]  I exported the tilemap as a json, so it can be imported like this.
//        Note that I didn't do the furniture, because that might change...
import * as hall_objects from "../../../tilemaps/TileMaps/rauch.json"

/**
 * Build all levels occurring in rathbone
 *
 * @param level the level to build
 */
export const rauchBuilder: Builder = function (level: number) {
  // Set up session and level storage
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = new LevelInfo();
  stage.storage.setLevel("levelInfo", lInfo);

  // Draw the map, make the walls from the objects in the json
  createMap(4608, 4608, "locBg/rauch.png");
  hall_objects.layers.forEach(layer => drawObjects(50, layer.objects ?? []));

  // Set current location
  lInfo.hud = new HUD("Rauch", "The business hall");

  // Create player and keyboard handler
  let player = makeMainCharacter(10, 10, sStore.playerAppearance!, AnimationState.IDLE_W);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  // door to leave rauch (Currently just takes back to temp spawner location in asa_campus_outside.ts)
  new Spawner(12.41, 75.5, 7, 0.5, () => { sStore.goToX = 101.25; sStore.goToY = 38.1; stage.switchTo(buildAsaPackerOutside, 1); });

  // Spawn FindAdvisor quest NPCs
  // (This is a temporary spawn location, until we have the quest)
  let erick = spawnRegularNpc(NpcNames.Erick, 10.99, 61.95, AnimationState.IDLE_S);
  let sofia = spawnRegularNpc(NpcNames.Sofia, 10.1, 57.18, AnimationState.IDLE_S);
  let hamza = spawnRegularNpc(NpcNames.NervousStudent, 8.13, 48.41, AnimationState.IDLE_S);
  let advisor = spawnRegularNpc(NpcNames.Advisor, 2.7, 45.57, AnimationState.IDLE_E);
  
  // Set erick quest starting behavior
  makeQuestStartingNpc({
    npc: erick,
    quest: new FindAdvisorQuest(),
    prestartDialogue: erick_quest_starter,
    busyDialogue: erick_busy,
    completeDialogue: erick_quest_completed,
    levelNumber: level,
    place: Places.RAUCH,
    acceptFootprint: 1,
    otherNPCs: [sofia, advisor, hamza],
  });

  // Update the map and NPC based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.RAUCH, level);
  sStore.currQuest?.onMakeNpc(Places.RAUCH, level, erick);
  sStore.currQuest?.onMakeNpc(Places.RAUCH, level, sofia);
  sStore.currQuest?.onMakeNpc(Places.RAUCH, level, hamza);
  sStore.currQuest?.onMakeNpc(Places.RAUCH, level, advisor);
}
rauchBuilder.builderName = "rauch";
rauchBuilder.playerLimit = 15