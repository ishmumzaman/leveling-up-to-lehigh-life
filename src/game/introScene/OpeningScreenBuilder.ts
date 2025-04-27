// Reviewed on 2024-09-18

import { TimedEvent, stage, FilledBox, ImageSprite, TextSprite, BoxBody, Actor, Scene, SpriteLocation } from "../../jetlag";
import { SessionInfo } from "../storage/session";
import { LevelInfo } from "../storage/level";
import { createMap } from "../common/map";
import { FadingBlurFilter } from '../common/filter';
import { defaultCharacter, makeCharacterBuilder } from '../characters/makeCharacterBuilder';
import { CharacterAnimations } from "../characters/characterCustomization";
import { makeMainCharacter } from "../characters/character";
import { KeyboardHandler } from "../ui/keyboard";
import { Builder } from "../multiplayer/loginSystem";

/**
 * Create the opening scene, which consists of some instructions about the keys
 * in use.
 *
 * @param level Which level should be displayed (unused)
 */
export const openingScreenBuilder: Builder = function (_level: number) {

  // Initialize the session storage
  //
  // [mfs]  This code assumes that it's possible to "go back" to the opening
  //        screen.  If not, then we don't need the `if` guard.
  //
  // [mfs]  If openingScreenBuilder stops being the first builder, then these
  //        lines need to move to some other builder
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());

  // Get the session storage, because we might need it later
  let sStore = stage.storage.getSession("sStore") as SessionInfo;

  // Set up the Player object in the SessionInfo
  //
  // [mfs]  I don't think we actually want this code here.  If
  //        openingScreenBuilder always goes straight to the characterBuilder,
  //        and characterBuilder always goes to mmDormBuilder, then we can just
  //        do the Player configuration in characterBuilder.
  //
  // [mfs]  It would be better for Player() to just return an object, and this
  //        code to put it into the session storage.
  let player = makeMainCharacter(74.4, 48.7, sStore.playerAppearance ?? new CharacterAnimations(defaultCharacter.clone()));
  stage.world.camera.setCameraFocus(player);

  let lInfo = new LevelInfo();
  stage.storage.setLevel("levelInfo", lInfo);
  lInfo.mainCharacter = player;
  lInfo.keyboard = new KeyboardHandler(player);

  // [mfs] This is really inefficient, given the huge size of hawksPath!
  //
  // [mfs] Switch to a tilemap?
  createMap(5651, 3120, "locBg/hawksPath.png");

  // puts filter on the background
  let fadeFilter = new FadingBlurFilter(0, 5, false);
  stage.renderer.addZFilter(fadeFilter, -1, SpriteLocation.OVERLAY);
  fadeFilter.enabled = true;
  fadeFilter.toggled = true;

  // make the overlay for the controls screen
  //
  // [mfs]  I don't understand why this needs to be an overlay.  Why can't it
  //        just be drawn on top of the background?
  stage.requestOverlay((overlay: Scene, screenshot: ImageSprite | undefined) => {
    screenshot!.z = -2;
    // screen shot of the background
    new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }), });
    // overlay background for the controls screen
    //
    // [mfs] The image has more than one font, which looks really weird.
    new Actor({ appearance: new ImageSprite({ width: 8 * 1.5, height: 4.5 * 1.5, img: "overlay/keyBackground.png" }), rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }, { scene: overlay }), });
    // 'wasd' image and text
    new Actor({
      appearance:
        [new ImageSprite({ width: 2.6, height: 1.8, img: "icon/wasd.png" }),
        new TextSprite({ center: true, face: stage.config.textFont, color: "black", size: 27, offset: { dx: 4.5, dy: 0 } }, "Movement")],
      rigidBody: new BoxBody({ cx: 4.2, cy: 2.9, width: 0, height: 0 }, { scene: overlay }),
    });
    // 'q' image and text
    new Actor({
      appearance: [new ImageSprite({ width: 0.9, height: 0.9, img: "qKeys0.png" }),
      new TextSprite({ center: true, face: stage.config.textFont, color: "black", size: 27, offset: { dx: 4.5, dy: 0 } }, "Interact")],
      rigidBody: new BoxBody({ cx: 4.2, cy: 4.7, width: 0, height: 0 }, { scene: overlay }),
    });
    // 'e' image and text
    new Actor({
      appearance: [new ImageSprite({ width: 0.9, height: 0.9, img: "icon/e.png" }),
      new TextSprite({ center: true, face: stage.config.textFont, color: "black", size: 27, offset: { dx: 4.5, dy: 0 } }, "Open/Close Inventory")],
      rigidBody: new BoxBody({ cx: 4.2, cy: 6.2, width: 0, height: 0 }, { scene: overlay }),
    });

    // Wait 5 seconds, then put a button for starting the game
    //
    // [mfs]  5 seems pretty long.  Why?  Is it because something is loading in
    //        the background?
    overlay.timer.addEvent(new TimedEvent(1, false, () => {
      new Actor({
        appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "black", size: 30 }, "Press Anywhere to Continue"),
        rigidBody: new BoxBody({ cx: 8, cy: 8.4, width: 0, height: 0 }, { scene: overlay }),
      });
      new Actor({
        appearance: new FilledBox({ width: 0, height: 0, fillColor: "ffffff" }),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }),
        gestures: {
          tap: () => {
            stage.clearOverlay();
            fadeFilter.toggled = false;
            sStore.goToX = 3.4;
            sStore.goToY = 4.7
            stage.switchTo(makeCharacterBuilder, 1);
            return true;
          }
        }
      });
    }))
  }, true);
}
openingScreenBuilder.builderName = "openingScreen";
openingScreenBuilder.playerLimit = 1;