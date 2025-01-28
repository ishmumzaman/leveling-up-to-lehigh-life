import { initializeAndLaunch, AccelerometerMode, JetLagGameConfig } from "../jetlag";
import { loginBuilder } from "./multiplayer/loginSystem";

// [mfs] I think some reorganization of the folders would be beneficial.  
// - One folder should be for "builders" or "worlds".  I think that's MVPDemo
//   right now, so maybe it just needs to be renamed.
// - One folder should be for UI things that are used by many builders.  One
//   example is the dialog overlay.  Another is the HUD.  Also, perhaps, the
//   quest UI and the inventory.
// - One folder should be for quests.  We don't have any yet, but we'll get
//   there.
// - One folder should be for characters.  This should include "me" and also
//   NPCs.
//
// Then anything that is only associated with files in one folder should go into
// that folder.  For example, boundingBox in WorldSystems should probably go in
// builders.

// [mfs]  At some point it will be important to do some asset optimization,
//        including eliminating things that aren't in use an packing other
//        things into sprite sheets.  That should wait, since we probably want
//        to add tile map support first.
let imageNames = [
  "mainMenu/Images/menuButton.png", "mainMenu/Images/logo.png", "fatalError.png",
  "overlay/inventory.png", "overlay/map.jpeg", "overlay/keyBackground.png",
  "overlay/questMenu.png", "overlay/questMenu.json", "overlay/closeButton.png",
  "locBg/mvpLocs.png", "locBg/mvpLocs.json", "locBg/hawksPath.png",
  "locBg/fmlEntrance.png", "icon/iconSS.json", "icon/iconSS.png",
  "icon/defaultImg.png", "empty.png", "statUI.png", "icon/questNoti.png",
  "icon/hudElements.json", "icon/wasd.png", "icon/e.png", "icon/q.png",
  "icon/qKeys.json", "icon/qKeys.png", "icon/indicator.png",
  "icon/indicator.json", "gymMinigame/basketball.png",
  "gymMinigame/basketballUsed.png", "MVPDemo/MandMTEMP.jpg", "dialogueBox.png",
  "portraitBox.png", "characterName.png", "choiceBox.png", "optionChoice.png",
  "9Sprites/woodOutline.json", "portraitDefaultPTTalk0.png",
  "dialogueArrow.png", "MVPDemo/hawksNestTEMP.png", "MVPDemo/POSMachine.png",
  "MVPDemo/HandSwiper.png", "icon/foodIcon.json", "MVPDemo/shelf.png",
  "MVPDemo/bag.png", "MVPDemo/bags.png", "MVPDemo/back.png", "MVPDemo/cart.png",
  "characterSpriteSheets/Alyssa.json", "characterSpriteSheets/Emelia.json",
  "characterSpriteSheets/HughYan.json", "characterSpriteSheets/body03.json",
  "characterSpriteSheets/eyes01.json", "characterSpriteSheets/hair04.json",
  "characterSpriteSheets/hair12.json", "characterSpriteSheets/outfit01.json",
  "characterSpriteSheets/outfit02.json", "characterSpriteSheets/outfit10.json",
  "characterSpriteSheets/snapback04.json", "advancedErrorInfo.png",
  "characterSpriteSheets/mainChar.json", "characterSpriteSheets/Professor.json",
  "characterSpriteSheets/Martina.json", "characterSpriteSheets/Jake.json",
  "characterSpriteSheets/Zay.json",
  "characterCustomization/characterCustomizationUI.json", "missingMPChar.png"
];

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
export class Config implements JetLagGameConfig {
  aspectRatio = { width: 16, height: 9 };
  pixelMeterRatio = 100;
  screenDimensions = { width: 1600, height: 900 };
  adaptToScreenSize = true;

  canVibrate = false;
  accelerometerMode = AccelerometerMode.DISABLED;
  // [mfs] This needs to be in a Lehigh domain eventually
  storageKey = "com.github.YassCoding.LUTLL";
  hitBoxes = true;
  textFont = "kongtext";
  minuteRate = 60;

  resources = {
    prefix: "./assets/",
    musicNames: [],
    soundNames: ["MVPDemo/hungry.mp3"],
    imageNames,
    // [mfs] Are these still in use?
    videoNames: ["mainMenu/Video/afternoonLoop.mp4",
      "mainMenu/Video/midnightLoop.mp4",
      "mainMenu/Video/morningLoop.mp4",
      "mainMenu/Video/nightLoop.mp4"]
  }
}

// Start in the opening screen that shows the instructions
initializeAndLaunch("game-player", new Config(), () => { loginBuilder(0) });
