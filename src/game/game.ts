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
  "fatalError.png", "overlay/inventory.png", "overlay/keyBackground.png",
  "overlay/questMenu.json", "overlay/closeButton.png", "overlay/pauseButton.png",
  "locBg/mvpLocs.json", "locBg/hawksPath.png", "locBg/rauch.png", "icon/defaultImg.png",
  "empty.png", "statUI.png", "icon/questNoti.png", "icon/hudElements.json",
  "icon/wasd.png", "icon/e.png", "icon/qKeys.json",
  "icon/indicator.json", "MVPDemo/POSMachine.png", "overlay/dialogueMenu.json",
  "MVPDemo/HandSwiper.png", "icon/foodIcon.json", "MVPDemo/shelf.png",
  "MVPDemo/bag.png", "MVPDemo/bags.png", "MVPDemo/back.png", "MVPDemo/cart.png",
  "characterSpriteSheets/Alyssa.json", "characterSpriteSheets/Emelia.json",
  "characterSpriteSheets/HughYan.json", "characterSpriteSheets/body03.json",
  "characterSpriteSheets/eyes01.json", "characterSpriteSheets/hair01.json",
  "characterSpriteSheets/hair03.json", "characterSpriteSheets/hair04.json",
  "characterSpriteSheets/hair09.json", "characterSpriteSheets/hair10.json",
  "characterSpriteSheets/hair11.json", "characterSpriteSheets/hair05.json",
  "characterSpriteSheets/hair12.json", "characterSpriteSheets/hair15.json",
  "characterSpriteSheets/hair18.json", "characterSpriteSheets/hair19.json",
  "characterSpriteSheets/hair22.json", "characterSpriteSheets/hair24.json",
  "characterSpriteSheets/hair25.json", "advancedErrorInfo.png",
  "characterSpriteSheets/outfit01.json", "characterSpriteSheets/outfit02.json",
  "characterSpriteSheets/outfit03.json", "characterSpriteSheets/outfit10.json",
  "characterSpriteSheets/outfit04.json", "characterSpriteSheets/outfit07.json",
  "characterSpriteSheets/outfit11.json", "characterSpriteSheets/outfit14.json",
  "characterSpriteSheets/snapback04.json", "characterSpriteSheets/beanie01.json",
  "characterSpriteSheets/beard01.json", "characterSpriteSheets/glasses01.json",
  "characterSpriteSheets/mainChar.json", "characterSpriteSheets/Professor.json",
  "characterSpriteSheets/Martina.json", "characterSpriteSheets/Jake.json",
  "characterCustomization/characterCustomizationUI.json", "missingMPChar.png",
  "characterSpriteSheets/Zay.json",
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
  minuteRate = 1;

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

console.log((globalThis as any).MultiPlayerServerAddress);

// Start in the opening screen that shows the instructions
initializeAndLaunch("game-player", new Config(), () => { loginBuilder(1) });
