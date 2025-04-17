// Reviewed on 2024-09-18

import { TextSprite, BoxBody, Actor, stage, ImageSprite, TimedEvent } from "../../jetlag";
import { PlayerInventoryUI } from "../inventory/ui";
import { renderQuestMenu } from "../quests/ui";
import { SessionInfo } from "../storage/session";
import { DialogueUI } from "./dialogue";

export type HUDModal = "none" | "inventory" | "quest" | "dialogue";

/**
 * The Heads-Up Display (HUD) consists of two buttons (for opening the inventory
 * and opening the quest log), health info, and some text for showing where the
 * character is.
 */
export class HUD {
  private modal: HUDModal = "none";

  /** The clock for the game */
  public clock: Actor;

  /** The health and wellness statistics for the player */
  public stats: Actor;

  /** Player's inventory UI */
  readonly inventory: PlayerInventoryUI;

  /** The button that leads to the inventory being shown */
  public inventoryButton: Actor;

  /** The button that leads to the quests being shown */
  public questButton: Actor;

  /** A "new quest" notification that goes on the quest button */
  public questNotification: Actor;

  /** Text that announces the player's location */
  private locationText: Actor;

  /** The (complex) UI for dialogue interactions */
  readonly dialogue: DialogueUI;

  /** Show or hide the Quest Notification icon */
  public toggleQuestNotification(value: boolean) {
    this.questNotification.enabled = value;
  }

  /** Show or hide the Stats */
  public toggleStats(value: boolean) { this.stats.enabled = value; }

  /** Show or hide the different buttons */
  public toggleHUDButtons(value: boolean) {
    this.inventoryButton.enabled = value;
    this.questButton.enabled = value;
    if (!value)
      this.questNotification.enabled = false;
  }

  /**
   * Constructs a new instance of the HUD class
   *
   * @param building  The name of the current building
   * @param place     The place within that building
   */
  constructor(building: string, place: string) {
    let sStore = stage.storage.getSession("sStore") as SessionInfo;

    // Set up the stat information
    this.stats = sStore.playerStat.renderStat(stage.hud);

    this.dialogue = new DialogueUI();

    this.inventory = new PlayerInventoryUI();

    // Draw the toggle inventory button
    this.inventoryButton = new Actor({
      appearance: [new ImageSprite({ width: 1, height: 1, img: "hudButton.png" }), new ImageSprite({ width: 0.7, height: 0.7, img: "bag.png" }),],
      rigidBody: new BoxBody({ cx: 1, cy: 1, width: 1, height: 1 }, { scene: stage.hud }),
      gestures: { tap: () => { this.inventory.toggle(); return true; } }
    });

    // Draw the quest button
    this.questButton = new Actor({
      appearance: [new ImageSprite({ width: 1, height: 1, img: "hudButton.png" }), new ImageSprite({ width: 0.7, height: 0.7, img: "quest.png" })],
      rigidBody: new BoxBody({ cx: 1, cy: 2, width: 1, height: 1 }, { scene: stage.hud }),
      gestures: {
        tap: () => {
          renderQuestMenu();
          return true;
        }
      }
    });

    // The quest notification button, which we usually hide...
    this.questNotification = new Actor({
      appearance: new ImageSprite({ width: 0.43, height: 0.5, img: "icon/questNoti.png", offset: { dx: 0.5, dy: -0.4 } }),
      rigidBody: new BoxBody({ cx: 1, cy: 2, width: 1, height: 1 }, { scene: stage.hud })
    });
    this.questNotification.enabled = false;

    // Location display when entering a new building or place
    this.locationText = new Actor({
      appearance:
        [new TextSprite({ center: true, face: stage.config.textFont, color: "ffffff00", size: 24, strokeColor: "00000000", strokeWidth: 5 }, () => building.toUpperCase()),
        new TextSprite({ center: true, face: stage.config.textFont, color: "ffffff00", size: 19, strokeColor: "00000000", strokeWidth: 5, offset: { dx: 0, dy: 0.4 } }, () => place.toUpperCase())],
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0.1, height: 0.1 }, { scene: stage.hud }),
    });

    // Date and time display
    this.clock = sStore.clock.drawClock();

    // Fade in/out the location display
    //
    // [mfs]  Spamming 25 timers is kind of strange, but I guess it's OK?
    for (let i = 0; i < 25; i++) {
      stage.hud.timer.addEvent(new TimedEvent(i * 0.1, false, () => {
        (this.locationText.appearance[0] as TextSprite).color = this.textFade("ffffff", i);
        (this.locationText.appearance[0] as TextSprite).text.text.style.fill = this.textFade("ffffff", i);
        (this.locationText.appearance[1] as TextSprite).color = this.textFade("ffffff", i);
        (this.locationText.appearance[1] as TextSprite).text.text.style.fill = this.textFade("ffffff", i);
      }));
    }
  }

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
