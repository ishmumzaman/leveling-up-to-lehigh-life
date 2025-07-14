// Reviewed on 2024-09-18

// [mfs]  This should switch to tilemaps

import { stage } from "../../jetlag/Stage";
import { SessionInfo } from "../storage/session";
import { HUD } from "../ui/hud";
import { boundLine, cornerBoundBox } from "../common/boundBox";
import { createMap } from "../common/map"
import { Spawner } from "../common/spawner";
import { mmHallBuilder } from './mmHall';
import { buildAsaPackerOutside } from './asa_campus_outside';
import { InspectSystem } from "../interactions/inspectUi";
import { AnimationState } from "../../jetlag";
import { NpcBehavior, NpcNames, spawnRegularNpc } from "../characters/NPC";
import { Inspectable } from "../interactions/inspectables";
import { LevelInfo } from "../storage/level";
import { getRegularDir, makeMainCharacter } from "../characters/character";
import { KeyboardHandler } from "../ui/keyboard";
import { Places } from "./places";
import { Builder } from "../multiplayer/loginSystem";
import { DialogueDriver } from "../interactions/dialogue";
import { martina_eminem_reference } from "../interactions/martinaDlg";
import { loadPlacedObjects } from "../interactions/pickupable";
import { TimedEvent } from "../../jetlag";


/*** Build the stairs in M&M */
export const mmStairsBuilder: Builder = function (level: number) {
  // session storage
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;

  let lInfo = new LevelInfo();
  (lInfo as any).roomId = "mmStairs"; // [Ishmum Zaman] Unique identifier used for placed-object persistence
  stage.storage.setLevel("levelInfo", lInfo);

  lInfo.hud = new HUD("M&M House", "Stairs");

  // set the location and player
  createMap(672, 528, "mmStairs.png");
  mmStairsBounding();

  // Create player
  let player = makeMainCharacter(6.7, 5.9, sStore.playerAppearance!, AnimationState.IDLE_W);
  lInfo.mainCharacter = player;
  stage.world.camera.setCameraFocus(player);
  lInfo.keyboard = new KeyboardHandler(player);
  // Make the "Martina" NPC:
  let martina = spawnRegularNpc(NpcNames.Martina, 4.4, 5.4, AnimationState.IDLE_S);

  // mailbox spawnables
  let mailbox = new InspectSystem(Inspectable.MM_STAIR_MAILBOX);
  new Spawner(7, 4.4, 4.5, 0.8, () => { mailbox.open() });

  // blocked doors spawnables
  let blocked = new InspectSystem(Inspectable.MM_STAIR_BLOCKED);
  new Spawner(2.9, 10.9, 1.5, 0.8, () => { blocked.open() });
  new Spawner(10.6, 10.9, 1.5, 0.8, () => { blocked.open() });

  // stairs and doors spawnables
  new Spawner(6.7, 10, 1.5, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 97.6; sStore.goToY = 20.2; stage.switchTo(buildAsaPackerOutside, 1); });
  new Spawner(2.9, 1.7, 1.5, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 2.9; sStore.goToY = 5; stage.switchTo(mmHallBuilder, 1); });
  new Spawner(10.6, 1.7, 1.5, 0.8, () => { sStore.dir = getRegularDir(player); sStore.goToX = 10.5; sStore.goToY = 5; stage.switchTo(mmHallBuilder, 1); });

  // Update the map based on the current quest, if any
  sStore.currQuest?.onBuildPlace(Places.MM_STAIRS, level);

  // [Ishmum Zaman] Delay one tick so Stage switch completes before loading saved objects
  stage.world.timer.addEvent(new TimedEvent(0, false, () => { loadPlacedObjects(); }));

  sStore.currQuest?.onMakeNpc(Places.MM_STAIRS, level, martina);

  // Check if after quests initilization, martina would still be using the default dialogue (no next dlg)
  // [anh] I think this is a nice way to have a proper default dialogue for Martina while also keeping the rapper reference.
  if ((martina.extra as NpcBehavior).nextDialogue != undefined) {
    let rapperRandom = () => {
      let rap_driver = new DialogueDriver(martina_eminem_reference, "start", rapperRandom);
      if (Math.floor(Math.random() * 2)) {
        (martina.extra as NpcBehavior).setNextDialogue(rap_driver);
      } else {
        (martina.extra as NpcBehavior).setNextDialogue(undefined);
      }
    }
    (martina.extra as NpcBehavior).config.defaultDialogue.endFunc = rapperRandom;
  }
}
mmStairsBuilder.builderName = "mmStairs";
mmStairsBuilder.playerLimit = 5

// bounding for the M&M Stairs level
function mmStairsBounding() {
  boundLine(1.9, 3.8, 2.1, false);
  boundLine(2.1, 4.8, 1.9, true);
  boundLine(0.9, 1.9, 4.8, false);
  boundLine(4.8, 9.6, 0.9, true);
  boundLine(0.9, 1.9, 9.6, false);
  boundLine(9.6, 12.5, 1.9, true);
  boundLine(9.6, 10.5, 3.9, true);
  boundLine(3.9, 4.8, 9.6, false);
  boundLine(9.6, 6.7, 4.8, true);
  boundLine(4.8, 5.7, 6.7, false);
  boundLine(6.7, 9.6, 5.7, true);
  boundLine(5.7, 7.7, 9.6, false);
  boundLine(9.6, 6.7, 7.7, true);
  boundLine(7.7, 8.6, 6.7, false);
  boundLine(6.7, 9.6, 8.6, true);
  boundLine(8.6, 9.6, 9.6, false);
  cornerBoundBox(8.6, 9.6, 9.6, 10.5);
  cornerBoundBox(11.5, 9.6, 12.5, 10.5);
  boundLine(9.6, 4.8, 12.5, true);
  boundLine(11.6, 12.5, 4.8, false);
  cornerBoundBox(3.9, 2.1, 9.6, 4.8);
  boundLine(2.1, 4.8, 11.6, true);
  boundLine(9.6, 11.6, 2.1, false)
}