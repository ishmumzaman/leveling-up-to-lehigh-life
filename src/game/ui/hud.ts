import { QuestMenuUI } from './../quests/ui';
// Reviewed on 2024-09-18

import { TextSprite, BoxBody, Actor, stage, ImageSprite, TimedEvent, SpriteLocation } from "../../jetlag";
import { FadingBlurFilter } from "../common/filter";
import { InventoryUI, PlayerInventoryUI } from "../inventory/ui";
import { LevelInfo } from "../storage/level";
import { SessionInfo } from "../storage/session";
import { DialogueUI } from "./dialogue";

export type HUDModal = "none" | "inventory" | "quest" | "dialogue" | "inspect" | "otherContainer";

/**
 * The Heads-Up Display (HUD) consists of two buttons (for opening the inventory
 * and opening the quest log), health info, and some text for showing where the
 * character is.
 */
export class HUD {
  private modal: HUDModal = "none";

  public baseHUD: {
    /** The clock for the game */
    clock: Actor,

    /** The health and wellness statistics for the player */
    stats: Actor,

    /** The button that leads to the inventory being shown */
    inventoryButton: Actor,

    /** The button that leads to the quests being shown */
    questButton: Actor,

    /** A "new quest" notification that goes on the quest button */
    questNotification: Actor,

    /** Text that announces the player's location */
    locationText: Actor,
  }

  /** Player's inventory UI */
  readonly inventory = new PlayerInventoryUI();

  /** The (complex) UI for dialogue interactions */
  readonly dialogue = new DialogueUI();

  readonly quest = new QuestMenuUI();

  private fadeFilter = new FadingBlurFilter(0, 5, false);

  /**
   * Constructs a new instance of the HUD class
   *
   * @param building  The name of the current building
   * @param place     The place within that building
   */
  constructor(building: string, place: string) {
    let sStore = stage.storage.getSession("sStore") as SessionInfo;

    this.baseHUD = {
      // Date and time display
      clock: sStore.clock.drawClock(),

      // Set up the stat information
      stats: sStore.playerStat.renderStat(stage.hud),

      // Draw the toggle inventory button
      inventoryButton: new Actor({
        appearance: [new ImageSprite({ width: 1, height: 1, img: "hudButton.png" }), new ImageSprite({ width: 0.7, height: 0.7, img: "bag.png" }),],
        rigidBody: new BoxBody({ cx: 1, cy: 1, width: 1, height: 1 }, { scene: stage.hud }),
        gestures: { tap: () => { this.toggleModal('inventory'); return true; } }
      }),

      // Draw the quest button
      questButton: new Actor({
        appearance: [new ImageSprite({ width: 1, height: 1, img: "hudButton.png" }), new ImageSprite({ width: 0.7, height: 0.7, img: "quest.png" })],
        rigidBody: new BoxBody({ cx: 1, cy: 2, width: 1, height: 1 }, { scene: stage.hud }),
        gestures: {
          tap: () => {
            this.toggleModal('quest');
            return true;
          }
        }
      }),

      // The quest notification button, which we usually hide...
      questNotification: new Actor({
        appearance: new ImageSprite({ width: 0.43, height: 0.5, img: "icon/questNoti.png", offset: { dx: 0.5, dy: -0.4 } }),
        rigidBody: new BoxBody({ cx: 1, cy: 2, width: 1, height: 1 }, { scene: stage.hud })
      }),

      // Location display when entering a new building or place
      locationText: new Actor({
        appearance:
          [new TextSprite({ center: true, face: stage.config.textFont, color: "ffffff00", size: 24, strokeColor: "00000000", strokeWidth: 5 }, () => building.toUpperCase()),
          new TextSprite({ center: true, face: stage.config.textFont, color: "ffffff00", size: 19, strokeColor: "00000000", strokeWidth: 5, offset: { dx: 0, dy: 0.4 } }, () => place.toUpperCase())],
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0.1, height: 0.1 }, { scene: stage.hud }),
      })
    }

    this.baseHUD.questNotification.enabled = sStore.currQuest?.Unread ?? false;
    stage.renderer.addFilter(this.fadeFilter, SpriteLocation.WORLD);

    // Fade in/out the location display
    //
    // [mfs]  Spamming 25 timers is kind of strange, but I guess it's OK?
    for (let i = 0; i < 25; i++) {
      stage.hud.timer.addEvent(new TimedEvent(i * 0.1, false, () => {
        (this.baseHUD.locationText.appearance[0] as TextSprite).color = this.textFade("ffffff", i);
        (this.baseHUD.locationText.appearance[0] as TextSprite).text.text.style.fill = this.textFade("ffffff", i);
        (this.baseHUD.locationText.appearance[1] as TextSprite).color = this.textFade("ffffff", i);
        (this.baseHUD.locationText.appearance[1] as TextSprite).text.text.style.fill = this.textFade("ffffff", i);
      }));
    }
  }

  /** Show or hide the stats, mainly because stats look ugly right now */
  public showStats(isVisible: boolean) { this.baseHUD.stats.enabled = isVisible; }

  /** Show or hide the base HUD */
  private showBaseHUD(isVisible: boolean) {
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    for (let elements of Object.values(this.baseHUD)) elements.enabled = isVisible;

    // During toggling, only when the base HUD is visible AND there are unread quests, we show the quest notification
    this.baseHUD.questNotification.enabled = isVisible && (sStore.currQuest?.Unread ?? false);
  }

  /**
   * The primary controller for different HUD elements and HUD modals.
   * This allow us to centralize and certify the act of toggling on and off different HUD screens,
   * through the checking of the current modal and the modal to change to.
   *
   * IMPORTANT:   Due to the fact that this is toggling, if you want to open or close a modal, you need to pass in the same modal name.
   *              E.g. if you want to open the inventory, you need to pass in 'inventory' and then call it again with 'inventory' to close it.
   *              As such, "none" should NEVER be passed in as a parameter.
   * @param modal
   */
  public toggleModal(modal: HUDModal, otherContainer?: InventoryUI) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

    // Check if the modal to toggle is valid
    if (modal == 'none')
      throw new Error("Cannot pass in 'none' as a parameter to toggleModal");

    // This is the case for turning ON different hud screens.
    if (this.modal == 'none') {
      switch (modal) {
        case 'otherContainer': otherContainer?.toggle(); break;
        case 'inventory': this.inventory.toggle(); break;
        case 'quest': this.quest.toggle(); break;
        case 'dialogue': break;  // Opening the dialogue UI is handled in the NpcBehavior class, not here.
        case 'inspect': break;  // Opening the inspect UI is handled in the Inspectable class, not here.
      }

      this.modal = modal;
      this.showBaseHUD(false); // Hide the base HUD
      if (modal !== 'inspect') this.fadeFilter.enabled = true;

      // [mfs]  It seems that sometimes, an Inspectable or Dialogue won't supress
      //        *all* of the controls, and we can still move around and/or press
      //        HUD buttons and/or press "E".  Someone should look into this.
      lInfo.keyboard?.stopPlayerControls();
    }

    // This is the case for turning OFF different hud screens.
    else if (this.modal == modal) {
      switch (modal) {
        case 'otherContainer':
          if (otherContainer == undefined)
            throw new Error("Expecting an inventoryUI to be passed in, but got undefined.");
          otherContainer.toggle();
          break;
        case 'inventory': this.inventory.toggle(); break;
        case 'quest': this.quest.toggle(); break;
        case 'dialogue': break; // Closing the dialogue UI is handled in the NpcBehavior class, not here.
        case 'inspect': break; // Closing the inspect UI is handled in the Inspectable class, not here.
      }

      this.modal = 'none';
      this.showBaseHUD(true); // Show the base HUD
      if (modal !== 'inspect') this.fadeFilter.enabled = false;
      lInfo.keyboard?.startPlayerControls();
    }
  }

  public getModal() { return this.modal; }

  /**
   * Calculates the color with fading opacity based on the frame number.
   *
   * @param color - The color code.
   * @param frame - The frame number.
   *
   * @returns The color with fading opacity.
   */
  private textFade(color: string, frame: number) {
    switch (frame) {
      case 0: return color + '00'; // 0% opacity
      case 1: return color + '40'; // 25% opacity
      case 2: return color + '80'; // 50% opacity
      case 3: return color + 'BF'; // 75% opacity
      case 4: return color + 'FF'; // 100% opacity
      case 20: return color + 'FF'; // 100% opacity
      case 21: return color + 'BF'; // 75% opacity
      case 22: return color + '80'; // 50% opacity
      case 23: return color + '40'; // 25% opacity
      case 24: return color + '00'; // 0% opacity
      default: return color + 'FF'; // Default to fully transparent if frame is out of range
    }
  }
}
