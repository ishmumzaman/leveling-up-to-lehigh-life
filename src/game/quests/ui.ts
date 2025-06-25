// Reviewed on 2024-09-25

import { SessionInfo } from '../storage/session';
import { Actor, BoxBody, ImageSprite, TextSprite, stage } from "../../jetlag";
import { textSlicer } from '../common/textFormatting';
import { LevelInfo } from '../storage/level';


/** Report a color code based on the completion status of an objective */
function getStatusColor(completed?: boolean) {
  if (completed === undefined) return "000000";
  else return completed ? "0B6623" : "800000";
}

// TODO: Make this support multiple quests
/** The quest menu HUD screen displays information about the current quest */
export class QuestMenuUI {

  private components: Actor[] = [];

  private quest = (stage.storage.getSession("sStore") as SessionInfo).currQuest;

  private showing: boolean = false;

  constructor() {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    // Close button
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 0.34, height: 0.34, img: "overlay/closeButton.png", z: 2 }),
      rigidBody: new BoxBody({ cx: 3.09, cy: 2.38, width: 0.6, height: 0.6 }, { scene: stage.hud }),
      gestures: {
        tap: () => {
          lInfo.hud?.toggleMode("quest");
          return true;
        }
      }
    }));
    // Temporary Pause button
    // This button is only shown if there is a quest in progress
    if (this.quest !== undefined) {
      this.components.push(new Actor({
        appearance: new ImageSprite({ width: 1.8, height: 1, img: "overlay/pauseButton.png", z: 2 }),
        rigidBody: new BoxBody({ cx: 4.4, cy: 6.4, width: 1.8, height: 1 }, { scene: stage.hud }),
        gestures: {
          tap: () => {
            console.log(`Paused quest: ${this.quest?.name}`);
            this.quest?.pause();
            return true;
          }
        }
      }));
    }
    // Quest overlay background
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 11, height: 5.5, img: "questOverlayBackground.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }, { scene: stage.hud }),
    }));
    // Objectives tab background
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 3.9 * 1.63, height: 3.9, img: "objBackground.png" }),
      rigidBody: new BoxBody({ cx: 9.51, cy: 4.5, width: 0, height: 0 }, { scene: stage.hud }),
    }));
    // Quest menu title
    this.components.push(new Actor({
      appearance:
        [new ImageSprite({ width: 1 * 3.74, height: 1, img: "questMenuTitle.png" }),
        new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 40 }, "QUEST")],
      rigidBody: new BoxBody({ cx: 8, cy: 1, width: 0, height: 0 }, { scene: stage.hud }),
    }));
    // Quest selection box
    this.components.push(new Actor({
      appearance:
        [new ImageSprite({ width: 0.56 * 5, height: 0.56, img: "questSelectBox.png" }),
        new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 17 }, this.quest?.name ?? "qName")],
      rigidBody: new BoxBody({ cx: 4.4, cy: 2.98, width: 0, height: 0 }, { scene: stage.hud }),
    }));
    // Quest name box
    this.components.push(new Actor({
      appearance:
        [new ImageSprite({ width: 0.56 * 7.43, height: 0.56, img: "questName.png" }),
        new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 20, offset: { dx: 0, dy: 0.04 } }, this.quest?.name ?? "qName")],
      rigidBody: new BoxBody({ cx: 9.5, cy: 2.38, width: 0, height: 0 }, { scene: stage.hud }),
    }));

    // Auto-formatting for quest description and objectives texts.
    // Takes into account the number of space the above this.components take and puts the below this.components accordingly.
    let yAnchor = 2.9; // anchor point for the first text component

    // Formats quest description
    let slicedData = textSlicer(35, this.quest?.description ?? "qDesc");
    this.components.push(new Actor({
      appearance: new TextSprite({ center: false, face: stage.config.textFont, color: "000000", size: 12 }, slicedData.newText),
      rigidBody: new BoxBody({ cx: 6.6, cy: yAnchor, width: 0, height: 0 }, { scene: stage.hud }),
    }));
    let extraSpace = yAnchor + 0.3 + slicedData.totalLines * 0.2; // extra space for the next text component

    // Formats objectives and steps information
    for (let i = 0; i < (this.quest?.numObjectives() ?? 1); i++) {
      // Formats objective name
      slicedData = textSlicer(30, this.quest?.objectives[i].name ?? "objName");
      this.components.push(new Actor({
        appearance: [
          new TextSprite({ center: false, face: stage.config.textFont, color: "000000", size: 13.5, offset: { dx: 0.3, dy: -0.08 } }, slicedData.newText),
          new ImageSprite({ width: 0.26, height: 0.26, img: "objBullets.png" })],
        rigidBody: new BoxBody({ cx: 6.8, cy: extraSpace, width: 0, height: 0 }, { scene: stage.hud }),
      }));
      extraSpace += slicedData.totalLines * 0.2;
      // Formats objective description
      slicedData = textSlicer(35, this.quest?.objectives[i].description ?? "objDesc");
      this.components.push(new Actor({
        appearance: new TextSprite({ center: false, face: stage.config.textFont, color: "000000", size: 12 }, slicedData.newText),
        rigidBody: new BoxBody({ cx: 6.7, cy: extraSpace, width: 0, height: 0 }, { scene: stage.hud }),
      }));
      extraSpace += slicedData.totalLines * 0.2;
      // Formats objective status text
      slicedData = textSlicer(35, this.quest?.objectives[i].statusText() ?? "objStatus");
      this.components.push(new Actor({
        appearance: new TextSprite({ center: false, face: stage.config.textFont, color: getStatusColor(this.quest?.objectives[i].isComplete()), size: 12 }, slicedData.newText),
        rigidBody: new BoxBody({ cx: 6.7, cy: extraSpace, width: 0, height: 0 }, { scene: stage.hud }),
      }));
      extraSpace += slicedData.totalLines * 0.2 + 0.3;
    }
    // Temporarily disable all this.components for now
    for (let c of this.components)
      c.enabled = false;
  }


  /* Toggle the quest menu on and off */
  toggle() {
    // If the menu isn't showing, show the menu
    if (!this.showing) this.open();
    // If the menu is showing, turn it off.
    else this.close();
  }

  /** Show the quest menu */
  private open() {
    this.showing = true;
    this.quest?.readQuest();
    for (let c of this.components)
      c.enabled = true;
  }

  /** Close the quest menu */
  private close() {
    this.showing = false;
    for (let c of this.components)
      c.enabled = false;
  }
}