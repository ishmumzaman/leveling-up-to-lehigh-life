// Reviewed on 2024-09-18

// [mfs]  This looks pretty good for now.  Once we have a tilemap it will need
//        to change, of course.  Other than that, we need a way out of hawks,
//        and once we redo the quests, we can probably stop needing to use
//        `level`.  Oh, and it's kind of bland right now if there isn't a quest.

import { stage } from "../../jetlag/Stage";
import { cornerBoundBox } from "../common/boundBox";
import { createMap } from "../common/map";
import { SessionInfo } from "../storage/session";
import { AnimationState } from "../../jetlag";
import { LevelInfo } from "../storage/level";
import { HUD } from "../ui/hud";
import { makeMainCharacter } from "../characters/character";
import { KeyboardHandler } from "../ui/keyboard";
import { Spawner } from "../common/spawner";
import { buildAsaPackerOutside } from "./asa_campus_outside";
import { Places } from "./places";
import { spawnFollowingNpc, NpcNames, FollowingNpcBehavior } from "../characters/NPC";
import { Builder } from "../multiplayer/loginSystem";

/**
 * Create Hawks Nest portion of the game
 * @param level Which level should be displayed
 */
export const hawksNestBuilder:Builder = function(level: number) {
  // Level and session storage setup
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
  let sStore = stage.storage.getSession("sStore") as SessionInfo;

  // Initialize level info
  let lInfo = new LevelInfo();
  stage.storage.setLevel("levelInfo", lInfo);
  lInfo.hud = new HUD("Hawks Nest", "Food Court");

  // Create player and their respective NPC for dialogue
  let player = makeMainCharacter(8, 7, sStore.playerAppearance!, AnimationState.IDLE_W);
  stage.world.camera.setCameraFocus(player);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  createMap(1488, 833, "hawksNest.png"); // background

  // Create non-interactive collisions for the map
  cornerBoundBox(8.9, 12.1, 25.3, 16.6); // Bottom Shelves
  cornerBoundBox(25.33, 13.48, 29.7, 16.3); // Bottom Counter
  cornerBoundBox(27.9, 7.17, 29.7, 13.45); // Right Counter
  cornerBoundBox(0, 0, 29.7, 1.823); // Top Wall
  cornerBoundBox(0, 0, 1, 16.67); // Left Wall
  cornerBoundBox(28.75, 0.072, 29.73, 16.61); // Right Wall
  cornerBoundBox(0, 16.35, 29.8, 16.67) // Bottom Wall
  cornerBoundBox(1.01, 2.51, 1.85, 9.5); // Fridges
  cornerBoundBox(1.94, .96, 15.36, 3.132); // Top Shelf
  cornerBoundBox(13.69, 5.869, 16.97, 10.51); // Left Shelf
  cornerBoundBox(21.42, 5.91, 24.61, 10.53); // Right Shelf
  cornerBoundBox(20.23, 1.914, 28.847, 4.80); // Stairs
  cornerBoundBox(1.05, 9.69, 1.83, 11.42); // Left Checkout
  cornerBoundBox(10.65, 4.884, 11.425, 6.6); // Middle Checkout 

  // make the door, for exiting
  //
  // [mfs]  Do we want to have a way to disable the door so you can't leave
  //        mid-quest?  That would require an "onMakeSpawner", which could be
  //        complex, but it's probably a good idea.
  new Spawner(4.7, 16.9, 3, 1, "empty.png", () => {
    sStore.locX = 29.7; sStore.locY = 48.3;
    stage.switchTo(buildAsaPackerOutside, 1);
  });

  // Make the NPCs
  let emelia = spawnFollowingNpc(NpcNames.Emelia, 27.1, 13.1, AnimationState.IDLE_S, lInfo.mainCharacter!);
  (emelia.extra as FollowingNpcBehavior).setNPCInteraction(() => { (emelia.extra as FollowingNpcBehavior).nextDialogue(); });

  let hughYan = spawnFollowingNpc(NpcNames.HughYan, 24.78, 11.4, AnimationState.IDLE_E, lInfo.mainCharacter!);
  (hughYan.extra as FollowingNpcBehavior).setNPCInteraction(() => { (hughYan.extra as FollowingNpcBehavior).nextDialogue(); });

  let zay = spawnFollowingNpc(NpcNames.Zay, 19.8, 8, AnimationState.IDLE_S, lInfo.mainCharacter!);
  (zay.extra as FollowingNpcBehavior).setNPCInteraction(() => { (zay.extra as FollowingNpcBehavior).nextDialogue(); });

  let alyssa = spawnFollowingNpc(NpcNames.Alyssa, 3.4, 4.4, AnimationState.IDLE_N, lInfo.mainCharacter!);
  (alyssa.extra as FollowingNpcBehavior).setNPCInteraction(() => { (alyssa.extra as FollowingNpcBehavior).nextDialogue(); });

  // Notify the quest
  sStore.currQuest?.onBuildPlace(Places.HAWKS_NEST, level);
  sStore.currQuest?.onMakeNpc(Places.HAWKS_NEST, level, emelia);
  sStore.currQuest?.onMakeNpc(Places.HAWKS_NEST, level, hughYan);
  sStore.currQuest?.onMakeNpc(Places.HAWKS_NEST, level, zay);
  sStore.currQuest?.onMakeNpc(Places.HAWKS_NEST, level, alyssa);
}
hawksNestBuilder.builderName = "hawksNest";
hawksNestBuilder.playerLimit = 5;