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
import { InspectSystem } from '../interactions/inspectUi';
import { Inspectable } from "../interactions/inspectables";
import { spawnRegularNpc, NpcNames, NpcBehavior } from "../characters/NPC";
import { DialogueDriver } from "../interactions/dialogue";
import { makeQuestStartingNpc } from "../quests/helper";
import { nino_first_interacion } from "../interactions/ninoDlg";
import { maria_quest_starter, maria_busy, maria_quest_completed } from "../interactions/rathDeskLadyDlg";
import { PerfectRathPlateQuest } from "../quests/PerfectRathPlateQuest";

// [mfs]  I exported the tilemap as a json, so it can be imported like this.
//        Note that I didn't do the furniture, because that might change...
import * as hall_objects from "../../../tilemaps/TileMaps/rathbone.json"

/**
 * Build all levels occurring in rathbone
 *
 * @param level the level to build
 */
export const rathboneBuilder: Builder = function (level: number) {
  // Set up session and level storage
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = new LevelInfo();
  (lInfo as any).roomId = "rathbone"; // [Ishmum Zaman]
  stage.storage.setLevel("levelInfo", lInfo);

  // Draw the map, make the walls from the objects in the json
  createMap(2305, 2305, "locBg/rathbone.png");
  hall_objects.layers.forEach(layer => drawObjects(50, layer.objects ?? []));

  // Set current location
  lInfo.hud = new HUD("Rath", "The main dining hall");

  // Create player and keyboard handler
  let player = makeMainCharacter(10, 10, sStore.playerAppearance!, AnimationState.IDLE_W);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  //door to leave rathbone (Currently just takes back to temp spawner location in asa_campus_outside.ts)
  new Spawner(32.6, 34.6, 2, 0.8, () => { sStore.goToX = 97.5; sStore.goToY = 21.3; stage.switchTo(buildAsaPackerOutside, 1); });

  // Load any previously placed objects for this room
  stage.world.timer.addEvent(new TimedEvent(0,false,() => { loadPlacedObjects(); }));


  // Spawn NPCs
  let nino = spawnRegularNpc(NpcNames.Nino, 13.9, 12, AnimationState.IDLE_S);
  (nino.extra as NpcBehavior).setNextDialogue(new DialogueDriver(nino_first_interacion, "start"));
  let maria = spawnRegularNpc(NpcNames.Maria, 31.2,  27.15, AnimationState.IDLE_S, undefined, 3.6, 2.1);
  let casey = spawnRegularNpc(NpcNames.Casey, 24.5,  28.3, AnimationState.IDLE_S);
  let globowl = spawnRegularNpc(NpcNames.GLOBOWL, 11,  23, AnimationState.IDLE_E, undefined, 1.3, 2.68);
  let diner = spawnRegularNpc(NpcNames.DINER, 32,  7.15, AnimationState.IDLE_W, undefined, 1.5, 4.3);
  let simpleServings = spawnRegularNpc(NpcNames.SIMPLE_SERVINGS, 23.5,  22.56, AnimationState.IDLE_W, undefined, 1.3, 2.68);
  let vegOut = spawnRegularNpc(NpcNames.VEG_OUT, 23.5,  25.38, AnimationState.IDLE_W, undefined, 1.3, 2.68);
  let stacks = spawnRegularNpc(NpcNames.STACKS, 11.03,  9.7, AnimationState.IDLE_S, undefined, 3.8, 1.3);
  

  // Set maria quest starting behavior
    makeQuestStartingNpc({
      npc: maria,
      quest: new PerfectRathPlateQuest(),
      prestartDialogue: maria_quest_starter,
      busyDialogue: maria_busy,
      completeDialogue: maria_quest_completed,
      levelNumber: level,
      place: Places.RATHBONE,
      acceptFootprint: 1,
      otherNPCs: [casey, globowl, diner, simpleServings, vegOut, stacks],
    });

  // Update the map and NPC based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.RATHBONE, level);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, nino);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, maria);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, casey);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, globowl);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, diner);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, simpleServings);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, vegOut);
  sStore.currQuest?.onMakeNpc(Places.RATHBONE, level, stacks);
}
rathboneBuilder.builderName = "rathbone";
rathboneBuilder.playerLimit = 15