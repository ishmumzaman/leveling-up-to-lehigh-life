// Reviewed on 2024-09-18

import { stage } from "../../jetlag/Stage";
import { SessionInfo } from "../storage/session";
import { boundLine, diagBoundLine, cornerBoundBox } from "../common/boundBox";
import { createMap } from "../common/map";
import { HUD } from "../ui/hud";
import { AnimationState } from "../../jetlag";
import { InspectSystem } from '../interactions/inspectUi';
import { NpcBehavior, NpcNames, spawnRegularNpc } from '../characters/NPC';
import { Spawner } from '../common/spawner';
import { mmStairsBuilder } from './mmStairs';
import { hawksNestBuilder } from './hawksNest';
import { rauchBuilder } from './rauch'; 
import { rathboneBuilder } from './rathbone';
import { Inspectable } from "../interactions/inspectables";
import { LevelInfo } from "../storage/level";
import { getRegularDir, makeMainCharacter } from "../characters/character";
import { KeyboardHandler } from "../ui/keyboard";
import { professor_first_time } from "../interactions/professorDlg";
import { DialogueDriver } from "../interactions/dialogue";
import { Places } from "./places";
import { Builder } from "../multiplayer/loginSystem";
import { loadPlacedObjects } from "../interactions/pickupable";
import { TimedEvent } from "../../jetlag";
import { DnkrReadRoomBuilder } from "./DnkrReadRoom";
import { DnkrWashingRoomBuilder } from "./DnkrWashingRoom";
import { DnkrGameRoomBuilder } from "./DnkrGameRoom";
import { DnkrKitchenBuilder } from "./DnkrKitchen";

/**
 * Build the "outside world"
 *
 * [mfs]  This should be more general, so that it's not just for building the
 *        outside world as part of the Hawks quest.
 *
 * [mfs]  Switch to a tile map for making the outside world
 *
 * @param level Which level should be displayed
 */
export const buildAsaPackerOutside: Builder = function (level: number) {
  // Get the session information
  //
  // [mfs]  If we're just going to be "getting", and never starting from this
  //        builder, then we can forgo some of this
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;

  // Initialize level info
  let lInfo = new LevelInfo();
  (lInfo as any).roomId = "asaPackerOutside"; // [Ishmum Zaman]
  stage.storage.setLevel("levelInfo", lInfo);
  lInfo.hud = new HUD("Outdoors", "University Drive");
  lInfo.hud.showStats(false); // [mfs] For now...

  // Create player
  let player = makeMainCharacter(80, 20, sStore.playerAppearance!, AnimationState.IDLE_N);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);
  createMap(5651, 3120, "locBg/hawksPath.png");
  hawksPathBounding();

  // NPCs spawning
  let professor = spawnRegularNpc(NpcNames.Professor, 79.7, 37.3, AnimationState.IDLE_S);
  (professor.extra as NpcBehavior).setNextDialogue(new DialogueDriver(professor_first_time, "start"));

  // Door Spawnables
  new Spawner(97.5, 19, 2, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 6.7; sStore.goToY = 8.9; stage.switchTo(mmStairsBuilder, 1); });
  new Spawner(28.3, 47.9, 1, 1.5, () => { sStore.dir = getRegularDir(player); sStore.goToX = 4.7; sStore.goToY = 15.5; stage.switchTo(hawksNestBuilder, 1); });
  new Spawner(22.43, 39.9, 1, 1.5, () => { sStore.dir = getRegularDir(player); sStore.goToX = 4.7; sStore.goToY = 15.5; stage.switchTo(DnkrReadRoomBuilder, 1); });
  new Spawner(103.44, 24.48, 1, 1.5, () => { sStore.dir = getRegularDir(player); sStore.goToX = 4.7; sStore.goToY = 15.5; stage.switchTo(DnkrWashingRoomBuilder, 1); });
  new Spawner(103.52, 20.35, 1, 1.5, () => { sStore.dir = getRegularDir(player); sStore.goToX = 4.7; sStore.goToY = 15.5; stage.switchTo(DnkrGameRoomBuilder, 1); });
  new Spawner(104.05, 26.85, 1, 1.5, () => { sStore.dir = getRegularDir(player); sStore.goToX = 4.7; sStore.goToY = 15.5; stage.switchTo(DnkrKitchenBuilder, 1); });
  //Temp spawner for rathbone when we implement it
  
  new Spawner(97.5, 22, 2, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 32.7; sStore.goToY = 34; stage.switchTo(rathboneBuilder, 1); });
  
  //Temp spawner for rauch when we implement it
  //new Spawner(97.5, 22, 2, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 4.7; sStore.goToY = 15.5; stage.switchTo(rauchBuilder, 1); });

  // Bush Spawnables
  let bush = new InspectSystem(Inspectable.ASA_BUSH);
  new Spawner(93.08, 21.2, 1.7, 1.7, () => { bush.open() });
  new Spawner(102.72, 22.19, 1.7, 1.7, () => { bush.open() });

  // Car Spawnables
  let car = new InspectSystem(Inspectable.ASA_CAR);
  new Spawner(89.3, 37.1, 3.6, 2, () => { car.open() });
  new Spawner(84.4, 37.1, 3.6, 2, () => { car.open() });

  // Tree Spawnables
  let tree = new InspectSystem(Inspectable.ASA_TREE);
  new Spawner(44, 37.6, 7, 1, () => { tree.open() });

  // Flower Spawnables
  let flower = new InspectSystem(Inspectable.ASA_FLOWER);
  let flower1 = new Spawner(96, 27.5, 1, 1, () => { flower.open() });
  let flower2 = new Spawner(98.9, 30.4, 1, 1, () => { flower.open() });
  let flower3 = new Spawner(95, 29.5, 1, 1, () => { flower.open() });
  let flower4 = new Spawner(99.8, 28.4, 1, 1, () => { flower.open() });
  let flower5 = new Spawner(88.3, 32.6, 1, 1, () => { flower.open() });
  let flower6 = new Spawner(84.4, 33.6, 1, 1, () => { flower.open() });
  flower1.obstacle.enabled = false;
  flower2.obstacle.enabled = false;
  flower3.obstacle.enabled = false;
  flower4.obstacle.enabled = false;
  flower5.obstacle.enabled = false;
  flower6.obstacle.enabled = false;

  // Trash Spawnable
  let trash = new InspectSystem(Inspectable.ASA_TRASH);
  new Spawner(29.7, 45.3, 1.5, 1.5, () => { trash.open() });

  // Blocked Path Spawnables
  let blocked = new InspectSystem(Inspectable.ASA_BLOCKED);
  new Spawner(84.9, 27.7, 3, 1.5, () => { blocked.open() });
  new Spawner(110, 27.6, 3, 1.5, () => { blocked.open() });
  new Spawner(114.4, 37.2, 3, 12, () => { blocked.open() });
  new Spawner(77.2, 28, 1, 1, () => { blocked.open() });
  new Spawner(85.9, 43.7, 2, 1, () => { blocked.open() });
  new Spawner(97.4, 43.7, 2, 1, () => { blocked.open() });
  new Spawner(60.4, 37.6, 3, 1, () => { blocked.open() });
  new Spawner(52.9, 41.9, 3, 1, () => { blocked.open() });
  new Spawner(20.5, 40.6, 1, 5, () => { blocked.open() });
  new Spawner(39.7, 49.7, 3, 1, () => { blocked.open() });

  // Update the map based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.ASA_CAMPUS_OUTSIDE, level);
  sStore.currQuest?.onMakeNpc(Places.ASA_CAMPUS_OUTSIDE, level, professor);

  // Load any previously placed objects for this room
  stage.world.timer.addEvent(new TimedEvent(0,false, () => { loadPlacedObjects(); }));
}
buildAsaPackerOutside.builderName = "asaPackerOutside";
buildAsaPackerOutside.playerLimit = 10;

// Bounding for the Hawks Path level
function hawksPathBounding() {
  boundLine(76.3, 21, 38.1, false);
  boundLine(38, 43, 21, true);
  boundLine(21, 28.8, 43.2, false);
  boundLine(43.2, 52.7, 28.8, true);
  boundLine(28.8, 41.8, 49.2, false);
  diagBoundLine(34.7, 42.2, 41.7, 49);
  boundLine(41.4, 42, 34.8, true)
  boundLine(54.6, 34.8, 41.4, false)
  diagBoundLine(54.7, 41.3, 56.5, 43.3);
  boundLine(56.6, 112.9, 43.2, false);
  boundLine(38.1, 28.6, 76.6, true)
  boundLine(76.6, 90.3, 28.6, true);
  boundLine(76.6, 90.2, 28.5, false);
  boundLine(28.5, 19.4, 90.21, true);
  boundLine(104.7, 90.21, 19.4, false)
  boundLine(19.4, 28.4, 104.7, true)
  boundLine(104.7, 113, 28.4, false)
  boundLine(29.6, 37.3, 78.05, true)
  cornerBoundBox(78.1, 29.6, 92.1, 30.6)
  cornerBoundBox(102.7, 29.5, 112.9, 30.7)
  diagBoundLine(92.1, 29.8, 95.9, 33.6)
  diagBoundLine(92.1, 29.8 + 0.7, 95.9, 33.6 + 0.7)
  cornerBoundBox(95.9, 33.6, 96.5, 34.5)
  cornerBoundBox(98.3, 33.6, 98.9, 34.5)
  diagBoundLine(98.9, 33.6, 102.6, 29.8)
  diagBoundLine(98.9, 33.6 + 0.7, 102.6, 29.8 + 0.7)
  cornerBoundBox(95, 19.4, 96, 20.1)
  cornerBoundBox(98.9, 19.4, 99.8, 20.1)
}