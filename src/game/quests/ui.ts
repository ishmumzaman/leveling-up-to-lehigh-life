// Reviewed on 2024-09-25

import { SessionInfo } from '../storage/session';
import { Actor, BoxBody, ImageSprite, SpriteLocation, TextSprite, stage } from "../../jetlag";
import { FadingBlurFilter } from '../common/filter';
import { textSlicer } from '../common/textFormatting';

import { LevelInfo } from '../storage/level';

/** Report a color code based on the completion status of an objective */
function getStatusColor(completed?: boolean) {
  if (completed === undefined) return "000000";
  else return completed ? "0B6623" : "800000";
}

/*** Render the quest menu overlay */
export function renderQuestMenu() {
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

  // Turn off the notification, if it was on
  //
  // [mfs]  If someone switches *builders* before opening the quest, the
  //        notification goes away.  That will need some extra UI code to fix.


  // Initialize the fading blur filter
  let fadeFilter = new FadingBlurFilter(0, 5, false);
  stage.renderer.addZFilter(fadeFilter, -2, SpriteLocation.OVERLAY);

  // If no other overlay is opened, open it
  if (!lInfo.overlayShowing && !lInfo.playerInvState) {
    // starts blur filter
    fadeFilter.enabled = true;
    fadeFilter.toggled = true;

    // Draws all quest menu components
    stage.requestOverlay((overlay, screenshot) => {
      screenshot!.z = -2; // Puts the screenshot in the background
      new Actor({
        appearance: screenshot!,
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }, { scene: overlay }),
      });
      // Close button
      new Actor({
        appearance: new ImageSprite({ width: 0.34, height: 0.34, img: "overlay/closeButton.png", z: 2 }),
        rigidBody: new BoxBody({ cx: 3.09, cy: 2.38, width: 0.6, height: 0.6 }, { scene: overlay }),
        gestures: {
          tap: () => {
            stage.clearOverlay();
            lInfo.overlayShowing = false;
            fadeFilter.toggled = false;
            return true;
          }
        }
      });
      // Quest overlay background
      new Actor({
        appearance: new ImageSprite({ width: 11, height: 5.5, img: "questOverlayBackground.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }, { scene: overlay }),
      });
      // Objectives tab background
      new Actor({
        appearance: new ImageSprite({ width: 3.9 * 1.63, height: 3.9, img: "objBackground.png" }),
        rigidBody: new BoxBody({ cx: 9.51, cy: 4.5, width: 0, height: 0 }, { scene: overlay }),
      });
      // Quest menu title
      new Actor({
        appearance:
          [new ImageSprite({ width: 1 * 3.74, height: 1, img: "questMenuTitle.png" }),
          new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 40 }, "QUEST")],
        rigidBody: new BoxBody({ cx: 8, cy: 1, width: 0, height: 0 }, { scene: overlay }),
      });
      // Quest selection box
      new Actor({
        appearance:
          [new ImageSprite({ width: 0.56 * 5, height: 0.56, img: "questSelectBox.png" }),
          new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 17 }, sStore.currQuest?.name ?? "qName")],
        rigidBody: new BoxBody({ cx: 4.4, cy: 2.98, width: 0, height: 0 }, { scene: overlay }),
      });
      // Quest name box
      new Actor({
        appearance:
          [new ImageSprite({ width: 0.56 * 7.43, height: 0.56, img: "questName.png" }),
          new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 20, offset: { dx: 0, dy: 0.04 } }, sStore.currQuest?.name ?? "qName")],
        rigidBody: new BoxBody({ cx: 9.5, cy: 2.38, width: 0, height: 0 }, { scene: overlay }),
      });

      // Auto-formatting for quest description and objectives texts.
      // Takes into account the number of space the above components take and puts the below components accordingly.
      let yAnchor = 2.9; // anchor point for the first text component
      // Formats quest description
      let slicedData = textSlicer(35, sStore.currQuest?.description ?? "qDesc");
      new Actor({
        appearance: new TextSprite({ center: false, face: stage.config.textFont, color: "000000", size: 12 }, slicedData.newText),
        rigidBody: new BoxBody({ cx: 6.6, cy: yAnchor, width: 0, height: 0 }, { scene: overlay }),
      });
      let extraSpace = yAnchor + 0.3 + slicedData.totalLines * 0.2; // extra space for the next text component

      for (let i = 0; i < (sStore.currQuest?.numObjectives() ?? 1); i++) {
        // Formats objective name
        slicedData = textSlicer(30, sStore.currQuest?.objectives[i].name ?? "objName");
        new Actor({
          appearance: [
            new TextSprite({ center: false, face: stage.config.textFont, color: "000000", size: 13.5, offset: { dx: 0.3, dy: -0.08 } }, slicedData.newText),
            new ImageSprite({ width: 0.26, height: 0.26, img: "objBullets.png" })],
          rigidBody: new BoxBody({ cx: 6.8, cy: extraSpace, width: 0, height: 0 }, { scene: overlay }),
        });
        extraSpace += slicedData.totalLines * 0.2;
        // Formats objective description
        slicedData = textSlicer(35, sStore.currQuest?.objectives[i].description ?? "objDesc");
        new Actor({
          appearance: new TextSprite({ center: false, face: stage.config.textFont, color: "000000", size: 12 }, slicedData.newText),
          rigidBody: new BoxBody({ cx: 6.7, cy: extraSpace, width: 0, height: 0 }, { scene: overlay }),
        });
        extraSpace += slicedData.totalLines * 0.2;
        // Formats objective status text
        slicedData = textSlicer(35, sStore.currQuest?.objectives[i].statusText() ?? "objStatus");
        new Actor({
          appearance: new TextSprite({ center: false, face: stage.config.textFont, color: getStatusColor(sStore.currQuest?.objectives[i].isComplete()), size: 12 }, slicedData.newText),
          rigidBody: new BoxBody({ cx: 6.7, cy: extraSpace, width: 0, height: 0 }, { scene: overlay }),
        });
        extraSpace += slicedData.totalLines * 0.2 + 0.3;
      }
    }, true);
    lInfo.overlayShowing = true;
  }
}