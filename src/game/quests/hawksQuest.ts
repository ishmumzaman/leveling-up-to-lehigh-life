// Reviewed on 2024-10-03

import { Actor, AnimatedSprite, AnimationState, BoxBody, FilledRoundedBox, ImageSprite, ManualMovement, Path, PathMovement, SpriteLocation, stage, TextSprite, TimedEvent } from "../../jetlag";
import { FollowingNpcBehavior, NpcBehavior, NpcNames, spawnRegularNpc } from "../characters/NPC";
import { SessionInfo } from "../storage/session";
import { DialogueDriver } from "../interactions/dialogue";
import { InspectSystem } from "../interactions/inspectUi";
import { Objective, Quest, Step } from "./questLogic";
import { buildAsaPackerOutside } from "../places/asa_campus_outside";
import { mmDormBuilder } from "../places/mmDorm";
import { FadeOutFilterComponent, FadeInFilterComponent, AlarmFilter, FadingBlurFilter } from "../common/filter";
import { hawksNestBuilder } from "../places/hawksNest";
import { fillShelvesPartial, Inventory } from "../inventory/inventory";
import { renderShelfInventory } from "../inventory/ui";
import { Spawner } from "../common/spawner";
import { Inspectable } from "../interactions/inspectables";
import { LevelInfo } from "../storage/level";
import { main_character_hawks_nest } from "../interactions/mainCharDialogue";
import { jake_dorm_cut_scene, jake_hawks_return } from "../interactions/jakeDlg";
import { alyssa_hawks_nest, alyssa_mm_cut_scene } from "../interactions/alyssaDlg";
import { zay_hawks_nest, zay_mm_cut_sceen } from "../interactions/zayDlg";
import { hughyan_hawks_nest, hughyan_mm_cut_scene } from "../interactions/hughYanDlg";
import { emelia_hawks_nest, emelia_mm_cut_scene } from "../interactions/emeliaDlg";
import { QuestNames } from "./questNames";
import { Places } from "../places/places";

/**
 * HawksQuest is a quest that involves going to Hawks Nest and getting a lot of
 * food.
 * 
 * [mfs] The last step of updating the quest UI never really happens...
 */
export class HawksQuest extends Quest {
  /**
   * Track the player's progress through the quest:
   * 0. Haven't talked to roommate yet
   * 1. Talked to roommate, haven't swiped at Hawks Nest yet
   * 2. In HawksNest swipe cut scene
   * 3. HawksNest mini-game
   * 4. Walking to M&M in a caravan
   * 5. Back outside M&M saying goodbye
   * 6. Back with Jake
   * 7. Done
   */
  private progress = 0;

  /** When in progress mode 3, this counts how many NPCs are helping */
  private helpingNpcs: Actor[] = [];

  /** The objectives of the quest */
  static objectives = [
    new Objective("Go to Hawk's Nest", "Head East on University Drive and reach Hawk's Nest.", [new Step("Not there yet!"), new Step("You made it!")]),
    new Objective("Get food", "Gather as much food as you can from the food shelves.", [new Step("You can still get more food."), new Step("Successfully hoarded food!")])
  ];

  /** Construct the quest for getting food from Hawks Nest */
  constructor() {
    super(QuestNames.HawksQuest, "Quest 0", "The First of many", HawksQuest.objectives);
  }

  /** Score data for Hawk's minigame */
  hawksScore: number = 0;

  /** When an NPC is made, this allows the quest to customize its behavior */
  onMakeNpc(place: Places, level: number, npc: Actor) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    let sStore = stage.storage.getSession("sStore") as SessionInfo;

    // Are we making Jake in the dorm room?
    if (place == Places.MM_DORM && level == 1 && (npc.extra as NpcBehavior).name == NpcNames.Jake) {
      // If we're at progress 0, Jake's job is to kick off the quest
      if (this.progress == 0) {
        // Turn off the HUD buttons
        lInfo.hud?.toggleButtons(false);
        lInfo.hud?.toggleStats(false);
        // Play the stomach grumbling sound effect
        stage.musicLibrary.getSound("MVPDemo/hungry.mp3").play();
        // Pause player controls, to fix a weird timing bug
        lInfo.keyboard?.stopPlayerControls();
        // Give Jake some extra dialogue:
        let driver = new DialogueDriver(jake_dorm_cut_scene, "start");
        // When the conversation is over, reset the UI and move the quest
        // forward
        driver.endFunc = () => {
          lInfo.hud?.toggleButtons(true);
          lInfo.hud?.toggleQuestNotification(true);
          this.progress = 1;
          this.start();
        };
        (npc.extra as NpcBehavior).setNextDialogue(driver);
        // Auto-start the conversation
        stage.world.timer.addEvent(new TimedEvent(2, false, () => { (npc.extra as NpcBehavior).nextDialogue() }));
      }
      // If we're at progress 6, Jake's job is to finish the quest
      else if (this.progress == 6) {
        // [anh] A glitch where keyboard isnt disabled when entering the cutscene
        lInfo.keyboard?.stopPlayerControls();
        lInfo.mainCharacter?.rigidBody.setCenter(3.3, 9);
        // Make the main character move a tad, then kick off the conversation
        (lInfo.mainCharacter!.movement as ManualMovement).updateYVelocity(-3);
        stage.world.timer.addEvent(new TimedEvent(.5, false, () => {
          (lInfo.mainCharacter!.movement as ManualMovement).updateYVelocity(0);

          (npc.extra as NpcBehavior).setNextDialogue(new DialogueDriver(jake_hawks_return, "start", () => {
            // Set up time/score based dialogue tree
            let scoredriver: DialogueDriver;
            if (this.hawksScore > 180)
              scoredriver = new DialogueDriver(jake_hawks_return, "timeReallySlow", () => this.progress = 7);
            else if (this.hawksScore > 130)
              scoredriver = new DialogueDriver(jake_hawks_return, "timeSlow", () => this.progress = 7);
            else if (this.hawksScore > 80)
              scoredriver = new DialogueDriver(jake_hawks_return, "timeFast", () => this.progress = 7);
            else
              scoredriver = new DialogueDriver(jake_hawks_return, "timeReallyFast", () => this.progress = 7);

            // Mark the quest done
            //
            // [mfs]  We also need to do something with the Quest object, because
            //        the UI is not updating right now.
            (npc.extra as NpcBehavior).setNextDialogue(scoredriver);
            (npc.extra as NpcBehavior).nextDialogue();
          }));

          (npc.extra as NpcBehavior).nextDialogue();
        }));
      }
    }

    // Are we making an NPC in Hawks Nest?
    if (place == Places.HAWKS_NEST && level == 1 && this.progress == 3) {
      // Change the interaction so that we pick a conversation on the fly, based
      // on whether the player's inventory is currently full or not.
      let fullConvoDriver: DialogueDriver | undefined = undefined;
      let notfullConvoDriver: DialogueDriver | undefined = undefined;

      // Get the conversation for the given NPC
      if ((npc.extra as NpcBehavior).name == NpcNames.Emelia) {
        fullConvoDriver = new DialogueDriver(emelia_hawks_nest, "full");
        notfullConvoDriver = new DialogueDriver(emelia_hawks_nest, "notFull");
      }
      else if ((npc.extra as NpcBehavior).name == NpcNames.HughYan) {
        fullConvoDriver = new DialogueDriver(hughyan_hawks_nest, "full");
        notfullConvoDriver = new DialogueDriver(hughyan_hawks_nest, "notFull");
      }
      else if ((npc.extra as NpcBehavior).name == NpcNames.Zay) {
        fullConvoDriver = new DialogueDriver(zay_hawks_nest, "full");
        notfullConvoDriver = new DialogueDriver(zay_hawks_nest, "notFull");
      }
      else if ((npc.extra as NpcBehavior).name == NpcNames.Alyssa) {
        fullConvoDriver = new DialogueDriver(alyssa_hawks_nest, "full");
        notfullConvoDriver = new DialogueDriver(alyssa_hawks_nest, "notFull");
      }
      else {
        // Not an important NPC, so there's nothing more to do
        return;
      }

      // Code to run when dialogue ends
      let endDialogue = () => {
        // If this is the first actor in helpingNpcs, we'll chase the main
        // character.  Otherwise, chase the one who came before this one.
        let actor_to_chase = this.helpingNpcs.length == 1 ? lInfo.mainCharacter! : this.helpingNpcs[this.helpingNpcs.length - 2];
        (npc.extra as FollowingNpcBehavior).followActor(actor_to_chase);

        // Now transfer the player's inventory to this NPC
        //
        // [mfs]  This looks like it's not using the NPC's inventory in sStore.
        //        That's going to mess stuff up if we ever want to actually use
        //        the stuff the character just picked up.
        sStore.inventories.player.transferAll((npc.extra as FollowingNpcBehavior).inventory);

        // If all possible NPCs are following, fade out and leave
        if (this.helpingNpcs.length >= 4) {
          // Update quest information
          if (sStore.currQuest?.activeObjectiveIndex() == 1 && !sStore.currQuest?.activeObjective()?.isComplete())
            sStore.currQuest?.advance();

          // Play dialogue to let player know the minigame is ending
          let doneShopping = new InspectSystem(Inspectable.HAWK_DONE_SHOPPING);
          doneShopping.openUi();

          // Fade out and then switch to hawk's path builder
          stage.world.timer.addEvent(new TimedEvent(2.25, false, () => {
            stage.renderer.addFilter(new FadeOutFilterComponent(), SpriteLocation.WORLD);
            stage.world.timer.addEvent(new TimedEvent(1.5, false, () => {
              this.progress = 4;
              stage.switchTo(buildAsaPackerOutside, 1);
            }))
          }))
        }
      }

      // Set up the NPC's interaction
      (npc.extra as FollowingNpcBehavior).setNPCInteraction(() => {
        // If the inventory is full when interacting queue the full dialogue, 
        if (sStore.inventories.player.isFull()) {
          fullConvoDriver.endFunc = endDialogue;
          (npc.extra as FollowingNpcBehavior).setNextDialogue(fullConvoDriver);
          this.helpingNpcs.push(npc);
        }
        // Otherwise tell the player they can't help. 
        else {
          (npc.extra as FollowingNpcBehavior).setNextDialogue(notfullConvoDriver)
        }
        (npc.extra as FollowingNpcBehavior).nextDialogue();
      });
    }
  }

  /** 
   * When a place is made, this updates / reconfigures it
   *
   * [mfs]  We aren't using any levels, anywhere.  Is that going to change, or
   *        should we stop passing them around?
   */
  onBuildPlace(place: Places, level: number) {
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

    // Are we building the outdoors of Asa Packer campus?
    if (place == Places.ASA_CAMPUS_OUTSIDE && level == 1) {
      // Scripted cut-scene of NPCs caravaning back to M&M
      if (this.progress == 4) {
        // Fade in to cutscene
        stage.renderer.addFilter(new FadeInFilterComponent(), SpriteLocation.WORLD);

        // Hide the "real" main character, because this is a cut scene
        lInfo.mainCharacter!.enabled = false;

        // Make a phony main character with a path movement, and focus the
        // camera on it
        let path = new Path().to(29.4, 48.5).to(33.00, 48.5).to(33.00, 40).to(53, 40);
        let mainChar = new Actor({
          appearance: new AnimatedSprite({ width: 0.8, height: 1.6, ...sStore.playerAppearance!, offset: { dx: 0, dy: -0.6 }, z: 2 }),
          rigidBody: new BoxBody({ cx: 29.4, cy: 48.5, width: 0.5, height: 0.5 }),
          movement: new PathMovement(path, 3.5, false),
        });
        stage.world.camera.setCameraFocus(mainChar);

        // Spawn the NPCs at an interval, so they seem to be following the main
        // character.
        let delay = 0.4;
        // Looping over NpcNames is pretty clean. Just be sure to vary the timer
        for (let npc of [NpcNames.Alyssa, NpcNames.Zay, NpcNames.HughYan, NpcNames.Emelia]) {
          stage.world.timer.addEvent(new TimedEvent(delay, false, () => {
            new Actor({
              appearance: new AnimatedSprite({ initialDir: 2, width: 0.8, height: 1.6, ...sStore.npcs.get(npc)!.npcAnimation, offset: { dx: 0, dy: -0.6 }, z: 2 }),
              rigidBody: new BoxBody({ cx: 29.4, cy: 48.5, width: 0.5, height: 0.5 }),
              movement: new PathMovement(path, 3.5, false),
            });
          }));
          delay += 0.4;
        }

        // Fade out of cutscene and enter the next scene
        stage.world.timer.addEvent(new TimedEvent(6, false, () => {
          stage.renderer.addFilter(new FadeOutFilterComponent(), SpriteLocation.WORLD);
        }));
        stage.world.timer.addEvent(new TimedEvent(7.6, false, () => { this.progress = 5; stage.switchTo(buildAsaPackerOutside, 1); }));
      }
      // Scripted cut-scene of NPCs saying goodbye to the player
      else if (this.progress == 5) {
        // Fade in to cutscene
        stage.renderer.addFilter(new FadeInFilterComponent(), SpriteLocation.WORLD);

        // Hide the "real" main character, because this is a cut scene
        lInfo.mainCharacter!.enabled = false;

        // Make a phony main character, and focus the camera on it
        let mainChar = new Actor({
          appearance: new AnimatedSprite({ initialDir: AnimationState.IDLE_S, width: 0.8, height: 1.6, ...sStore.playerAppearance!, offset: { dx: 0, dy: -0.6 }, z: 2 }),
          rigidBody: new BoxBody({ cx: 97.5, cy: 20.2, width: 0.5, height: 0.5 }),
        });
        stage.world.camera.setCameraFocus(mainChar);

        // *Inject* some NPCs into this place, because the HawksQuest NPCs don't
        // appear in AsaCampusOutside otherwise, so we can't work with them via
        // onMakeNpc.
        let alyssa_path = new PathMovement(new Path().to(99.1, 21.8).to(99.1, 27), 3.5, false);
        let alyssa = spawnRegularNpc(NpcNames.Alyssa, 99.1, 21.8, AnimationState.IDLE_N, alyssa_path);
        alyssa_path.halt();
        let alyssa_driver = new DialogueDriver(alyssa_mm_cut_scene, "start");
        alyssa_driver.endFunc = () => { this.pathRunner(alyssa_path, zay.extra as NpcBehavior) };
        (alyssa.extra as NpcBehavior).setNextDialogue(alyssa_driver);

        let zay_path = new PathMovement(new Path().to(98.4, 22.5).to(98.4, 27), 3.5, false);
        let zay = spawnRegularNpc(NpcNames.Zay, 98.4, 22.4, AnimationState.IDLE_N, zay_path);
        zay_path.halt();
        let zay_driver = new DialogueDriver(zay_mm_cut_sceen, "start");
        zay_driver.endFunc = () => { this.pathRunner(zay_path, hughYan.extra as NpcBehavior) };
        (zay.extra as NpcBehavior).setNextDialogue(zay_driver);

        let hughYan_path = new PathMovement(new Path().to(97, 22.7).to(97, 27), 3.5, false);
        let hughYan = spawnRegularNpc(NpcNames.HughYan, 97, 22.7, AnimationState.IDLE_N, hughYan_path);
        hughYan_path.halt();
        let hughYanDriver = new DialogueDriver(hughyan_mm_cut_scene, "start");
        hughYanDriver.endFunc = () => { this.pathRunner(hughYan_path, emelia.extra as NpcBehavior) };
        (hughYan.extra as NpcBehavior).setNextDialogue(hughYanDriver);

        let emelia_path = new PathMovement(new Path().to(96, 21.5).to(96, 27), 3.5, false);
        let emelia = spawnRegularNpc(NpcNames.Emelia, 96, 21.5, AnimationState.IDLE_N, emelia_path);
        emelia_path.halt();
        let emelia_driver = new DialogueDriver(emelia_mm_cut_scene, "start");
        emelia_driver.endFunc = () => { this.progress = 6; this.lastPathRunner(emelia_path) };
        (emelia.extra as NpcBehavior).setNextDialogue(emelia_driver);

        // timer to start npcOne's dialogue
        stage.world.timer.addEvent(new TimedEvent(3, false, () => { (alyssa.extra as NpcBehavior).nextDialogue(); }));
      }
    }

    // Are we building Hawks Nest?
    else if (place == Places.HAWKS_NEST && level == 1) {
      let fadeFilter = new FadingBlurFilter(0, 5, false);
      // This is the first thing the player see's when first walking into Hawk's
      // Nest, before swiping their ID and before the minigame
      if (this.progress == 1) {
        // Kick off the dialogue
        let walkInDialogue = new InspectSystem(Inspectable.HAWK_ENTER_QUEST);
        walkInDialogue.openUi();

        // Set up the checkout machines:
        let checkout_machine_behavior = () => {
          this.progress = 2;
          sStore.locX = lInfo.mainCharacter!.rigidBody.getCenter().x;
          sStore.locY = lInfo.mainCharacter!.rigidBody.getCenter().y;
          stage.switchTo(hawksNestBuilder, 1);
        };
        new Spawner(1.3, 10.5, 1, 1.75, "empty.png", checkout_machine_behavior);
        new Spawner(11.05, 5.75, .75, 1.75, "empty.png", checkout_machine_behavior);
      }

      // In this stage, the character will swipe their Lehigh card at the
      // register and freak out at their swipes. This is a transition stage.
      else if (this.progress == 2) {
        lInfo.hud?.toggleButtons(false);
        // After finishing dialogue cutscene, restart player controls and teleport the player to stage 3 of hawk's
        let endDialogue = () => {
          sStore.locX = lInfo.mainCharacter!.rigidBody.getCenter().x
          sStore.locY = lInfo.mainCharacter!.rigidBody.getCenter().y
          stage.switchTo(hawksNestBuilder, 1)
        }

        // stop player controls, and enable blur filter.
        lInfo.keyboard?.stopPlayerControls();
        stage.renderer.addFilter(fadeFilter, SpriteLocation.WORLD);
        fadeFilter.enabled = true;
        fadeFilter.toggled = true;

        // Set up the point-of-sale kiosk
        let tapped = false;
        new Actor({
          appearance: new ImageSprite({ width: 16, height: 9, img: "MVPDemo/POSMachine.png", z: 1 }),
          rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
          gestures: {
            tap: () => {
              if (tapped) return true;
              tapped = true;

              // Make the ID card swipe animation, run a dialogue when it's done
              new Actor({
                appearance: new ImageSprite({ width: 2, height: 4, img: "MVPDemo/HandSwiper.png", z: 1 }),
                rigidBody: new BoxBody({ cx: 18, cy: 4.5, width: 0, height: 0 }, { scene: stage.hud }),
                movement: new PathMovement(new Path().to(13.6, -2.2).to(13.6, 8).to(13.6, 12), 9, false, (which: number) => {
                  if (which == 1) {
                    // Start the dialogue
                    let driver = new DialogueDriver(main_character_hawks_nest, "ironicDialogue");
                    driver.endFunc = endDialogue;
                    lInfo.hud!.dialogue.newDialogue(sStore.npcs.get(NpcNames.MainCharacter)!, driver);

                    // Show the remaining swipes
                    new Actor({
                      appearance: [
                        new FilledRoundedBox({ width: 4.15, height: 7.2, radius: 0, z: 1, fillColor: "#FFFFFF" }),
                        new TextSprite({ center: true, color: "#FFFFFF", strokeColor: "#653600", strokeWidth: 4, face: stage.config.textFont, size: 20, z: 2 }, "You Have: \n 50 Meal\n Swipes Left \n ($7 equivalent\n Per)")
                      ],
                      rigidBody: new BoxBody({ cx: 7.99, cy: 4.25, width: 4.1, height: 7.2 }, { scene: stage.hud })
                    });
                    // Move to next phase
                    this.progress = 3;
                  }
                })
              });
              return true;
            }
          }
        });
      }

      // This level contains the main mini-game for hawk's nest. Players will go
      // shelf to shelf grabbing items and getting help from various NPCs.
      else if (this.progress == 3) {
        // Advance the quest info that goes into the UI
        if (sStore.currQuest?.activeObjectiveIndex() == 0 && !sStore.currQuest?.activeObjective()?.isComplete()) sStore.currQuest?.advance();

        // Put up the red alarm
        let filter = new AlarmFilter(0xFF0000, true);
        stage.renderer.addFilter(filter, SpriteLocation.WORLD);

        // Keep track of how many seconds the player has spent in the level for
        // later dialogue sequence in dorm room.
        this.hawksScore = 0;
        stage.world.timer.addEvent(new TimedEvent(1, true, () => {
          this.hawksScore++;
        }));

        // Just in case you left and came back, we're going to reset the count
        // of helping NPCs.
        this.helpingNpcs = [];

        // Create a shelf for each actual shelf on the map and assign hitboxes
        // to them
        //
        // [mfs]  If it's possible to leave and then come back, then these
        //        should be getting reset, not just blindly pushed.  But
        //        actually, it would be smarter for these to be fields of *this
        //        class*, instead of being part of the session at all.
        for (let shelf = 1; shelf < 6; shelf++) {
          let inventory = new Inventory(3, 6);
          fillShelvesPartial(inventory, false);
          sStore.inventories.shelves.push(inventory)
        }
        // Make each shelf interactable
        new Spawner(8.75, 2.16, 13.5, 2.2, "empty.png", () => { renderShelfInventory(0) }); // Top Shelf
        new Spawner(1.51, 5.95, .7, 7, "empty.png", () => { renderShelfInventory(1) }); // Fridge
        new Spawner(9.61, 14.41, 1.35, 3.75, "empty.png", () => { renderShelfInventory(2) }); // Entrance Chips
        new Spawner(15.4, 8.2, 3.3, 4.5, "empty.png", () => { renderShelfInventory(3) }); // Left shelf
        new Spawner(22.9, 8.2, 3.3, 4.5, "empty.png", () => { renderShelfInventory(4) }); // Right Shelf

        // When your inventory is full, tell the player to go talk to an NPC 
        sStore.inventories.player.onFull = () => {
          let invenFull = new InspectSystem(Inspectable.HAWK_INVENTORY_FULL);
          invenFull.openUi();
        };
      }
    }
  }

  /**
   * When the last NPC accepts stuff from the player's inventory, start the
   * NPC's path and fade out to the next scene
   */
  private lastPathRunner(path: PathMovement) {
    path.start();
    stage.world.timer.addEvent(new TimedEvent(1.5, false, () => {
      stage.renderer.addFilter(new FadeOutFilterComponent(), SpriteLocation.WORLD);
      stage.world.timer.addEvent(new TimedEvent(1.5, false, () => { stage.switchTo(mmDormBuilder, 1); }));
    }))
  }

  /**
   * When an NPC other than the last accepts stuff from the player's inventory,
   * start the NPC's path
   */
  private pathRunner(path: PathMovement, npc: NpcBehavior) {
    path.start();
    // [mfs]  I don't understand why we need to do another conversation.
    //        Someone should double-check that it's needed.
    stage.world.timer.addEvent(new TimedEvent(1.5, false, () => { npc.nextDialogue() }))
  }
}