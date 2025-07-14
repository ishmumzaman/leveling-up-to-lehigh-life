// Reviewed on 2024-09-17

import { Scene } from '../../jetlag/Entities/Scene';
import { stage } from "../../jetlag/Stage";
import { SessionInfo, } from "../storage/session";
import { Actor, AnimatedSprite, AnimationState, BoxBody, FilledBox, ImageSprite, SpriteLocation, TextSprite, TimedEvent } from "../../jetlag";
import { Attribute, CharacterAnimations, CharacterConfig, CharacterPart, TxID } from "./characterCustomization";
import { makeSimpleAnimation } from "./character";
import { mmDormBuilder } from "../places/mmDorm";
import { voidBuilder } from "../places/theVoid";
import { FadingBlurFilter } from "../common/filter";
import { attributeIconData as aData, optionIconData as oData, palletteIconData as pData } from "./constants";
import { Builder } from '../multiplayer/loginSystem';
import { partToItem } from './characterChange';

/**
 * The defaults for the character creation UI page
 */
export const defaultCharacter = new CharacterConfig(
  new CharacterPart(TxID.Body03, [], []),
  new CharacterPart(TxID.Eyes01, [], []),
  new CharacterPart(TxID.Outfit01, [], []),
  new CharacterPart(TxID.Hair04, [], []),
  new CharacterPart(TxID.None, [], [])
);

/**
 * This builder has a complex UI, with lots of interrelated parts.  It makes
 * sense to organize the builder as a class.
 *
 * This is a stateful UI component.  As its actors are clicked, it modifies a
 * local `state` object, which makes (or remakes) the configuration of the
 * character.
 *
 * The heriarchy of operations to create a character goes from Attribute -> Option -> Pallette
 * You need to select an attribute, then an option, then a pallette to change the character's appearance.
 *
 * [mfs]  I think this could be a lot simpler if we pushed and popped
 *        appearances from actors, instead of removing and re-creating them.
 */
class UserInterface {
  /** All of the state that gets updated and eventually passed to the session */
  state: {
    /** The configuration information needed to make the CharacterAnimation */
    config: CharacterConfig,
    /** The animations that are produced from `config` */
    animations: CharacterAnimations,
  };

  /**
   *  The UI will show some previews of the character being created, via these
   *  actors
   */
  previews: {
    /** A preview of the character, animated from the front */
    front?: Actor;
    /** A preview of the character, animated from the side */
    side?: Actor;
    /** A preview of the character's portrait */
    portrait?: Actor;
  } = {};

  /**
   * The UI has some buttons for the different parts/attributes that can be
   * configured, such as "eyes" or "hair" or "accessory"
   */
  attributes: {
    /** The set of (currently 5) parts of the character that can be customized */
    icons: Actor[];
    /** A "next page" button (unused) */
    nextButton?: Actor;
    /** A "previous page" button (unused) */
    prevButton?: Actor;
    /** A text box for saying which attribute is chosen */
    titleText?: Actor;
    /** A text box for the page number (1/1, etc) */
    pageText?: Actor;
    /**
     * Though not currently in use, attributes supports paging, so we need to
     * know which page we're on (always starts at 1)
     */
    currPage: number;
    /**
     * This is the currently selected attribute, so we know what to draw in the
     * options section of the UI
     */
    selection: Attribute;
  } = { icons: [], currPage: 1, selection: Attribute.NONE };

  /**
   * The UI has a section where we draw the options for the currently selected
   * attribute
   */
  options: {
    /** The set of options from which to chose, in a 2d grid */
    icons: Actor[];
    /** A "next page" button (unused) */
    nextButton?: Actor;
    /** A "previous page" button (unused) */
    prevButton?: Actor;
    /**
     * If there are no options for the current attribute, we put some text in
     * the area instead
     */
    notAvailMessage?: Actor;
    /** A text box for saying which option is chosen */
    titleText?: Actor;
    /** A text box for the page number (1/1, etc) */
    pageText?: Actor;
    /**
     * Though not currently in use, we can have several pages of options, so we
     * need to know which page we're on (always starts at 1)
     */
    currPage: number;
    /**
     * This is the currently selected clothing item, so we know what to draw in the
     * options section of the UI
     */
    selection: TxID;
  } = { icons: [], currPage: 1, selection: TxID.None };

  /**
   * The UI has a section where we draw some pallettes that can be chosen to
   * customize the attribute/option
   */
  pallettes: Actor[] = [];

  /**
   * Construct the user interface's state from an initial seed of how the
   * character should look
   */
  constructor(config: CharacterConfig) {
    let cfg = config.clone();
    this.state = { config: cfg, animations: new CharacterAnimations(cfg) };
  }

  /**
   * (re)Draw the previews for the front, side, and portrait view
   */
  makePreviews() {
    // NB: Remove each before making a new one
    if (this.previews.front) { this.previews.front.remove(); this.previews.front = undefined; }
    this.previews.front = new Actor({
      appearance: new AnimatedSprite({ initialDir: AnimationState.IDLE_S, width: 1.6, height: 3.2, animations: this.state.animations.animations }),
      rigidBody: new BoxBody({ cx: 3.2, cy: 2.8, width: 0, height: 0 }),
    });

    if (this.previews.side) { this.previews.side.remove(); this.previews.side = undefined; }
    this.previews.side = new Actor({
      appearance: new AnimatedSprite({ initialDir: AnimationState.IDLE_E, width: 1.6, height: 3.2, animations: this.state.animations.animations }),
      rigidBody: new BoxBody({ cx: 5.7, cy: 2.8, width: 0, height: 0 }),
    });

    if (this.previews.portrait) { this.previews.portrait.remove(); this.previews.portrait = undefined; }
    this.previews.portrait = new Actor({
      appearance: new ImageSprite({ width: 2.6, height: 2.6, img: this.state.animations.still }),
      rigidBody: new BoxBody({ cx: 9.05, cy: 2.7, width: 0, height: 0 }),
    });
  }

  /**
   * Draw the current page of the attribute selection tab for the player to
   * choose which attribute they want to modify.
   *
   * The tab may have multiple pages depending on the number of attributes
   * available.
   */
  makeAttributePage() {
    // We'll just reset the current options selection and remove all the actors, then re-draw them
    for (let o of this.attributes.icons) o.remove(); this.attributes.icons = [];
    if (this.attributes.nextButton) { this.attributes.nextButton.remove(); this.attributes.nextButton = undefined; }
    if (this.attributes.prevButton) { this.attributes.prevButton.remove(); this.attributes.prevButton = undefined; }
    if (this.attributes.titleText) { this.attributes.titleText.remove(); this.attributes.titleText = undefined; }
    if (this.attributes.pageText) { this.attributes.pageText.remove(); this.attributes.pageText = undefined; }

    // use size of aData to determine how many pages (5 icons per page)
    let size = aData.size;
    let pages = Math.ceil(size / 5);

    // Draw a page with up to 5 icons
    if (this.attributes.currPage <= pages && this.attributes.currPage > 0) {
      // calculate number of icons to draw in current page
      let numIcon = (this.attributes.currPage < pages || (this.attributes.currPage == pages && size % 5 == 0)) ? 5 : (size % 5);

      // Figure out first and last icons' indices in the constants array
      let startIndex = 5 * (this.attributes.currPage - 1);
      let endIndex = startIndex + numIcon;

      // Icon placement config
      let xFix = 1.93; // Most left icon x coords
      let yFix = 6.7; // Most left icon y coords
      let dx = 1.9; // subsequent icons x displacement

      // Draw each as a tappable image:
      for (let i = startIndex; i < endIndex; i++) {
        let value = Array.from(aData.values())[i];
        let icon = new Actor({
          appearance: [
            new ImageSprite({ width: 1.6, height: 1.6, img: "attributeSelectBox.png" }),
            new ImageSprite({ width: value.w, height: value.h, img: value.img, offset: { dx: value.ox, dy: value.oy } })
          ],
          rigidBody: new BoxBody({ cx: xFix + (dx * (i % 5)), cy: yFix, width: 1.6, height: 1.6 }),
          gestures: {
            tap: () => {
              // On a tap, remember the chosen attribute, redraw the option page, and clear the color page
              this.attributes.selection = Array.from(aData.keys())[i];
              this.options.currPage = 1;
              this.makeOptionPage();
              return true;
            }
          }
        });
        this.attributes.icons.push(icon);
      }

      // Make the prev/next buttons if appropriate
      if (this.attributes.currPage !== pages) {
        this.attributes.nextButton = new Actor({
          appearance: [new ImageSprite({ width: .6, height: .6, img: "rightButton0.png", z: 1 }),],
          rigidBody: new BoxBody({ cx: 7.4, cy: 8.1, width: .73, height: .73 }),
          gestures: {
            tap: () => {
              this.animateButton(this.attributes.nextButton!);
              this.attributes.currPage++;
              this.makeAttributePage();
              return true;
            }
          }
        });
      }
      if (this.attributes.currPage !== 1) {
        this.attributes.prevButton = new Actor({
          appearance: [new ImageSprite({ width: 0.6, height: 0.6, img: "leftButton0.png", z: 1 }),],
          rigidBody: new BoxBody({ cx: 4.09, cy: 8.1, width: .73, height: .73 }),
          gestures: {
            tap: () => {
              this.animateButton(this.attributes.prevButton!);
              this.attributes.currPage--;
              this.makeAttributePage();
              return true;
            }
          }
        });
      }

      // Set up the text boxes
      this.attributes.titleText = new Actor({
        appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 18 }, () => this.attributes.selection),
        rigidBody: new BoxBody({ cx: 5.74, cy: 8.1, width: 0, height: 0 }),
      });
      this.attributes.pageText = new Actor({
        appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "#262626", size: 14 }, () => "Page " + this.attributes.currPage + "/" + pages),
        rigidBody: new BoxBody({ cx: 5.74, cy: 8.6, width: 0, height: 0 }),
      });
    }
    else {
      throw ("invalid attribute page number");
    }
  }

  /**
   * Draw the current page of the option selection tab for the player to choose
   * which option they want for the current attribute
   *
   * The tab may have multiple pages depending on the number of options
   * available for the selected attribute.
   */
  makeOptionPage() {
    // Remove all actors, then we'll redraw them
    for (let o of this.pallettes) o.remove(); this.pallettes = [];
    for (let o of this.options.icons) o.remove(); this.options.icons = [];
    if (this.options.nextButton) { this.options.nextButton.remove(); this.options.nextButton = undefined; }
    if (this.options.prevButton) { this.options.prevButton.remove(); this.options.prevButton = undefined; }
    if (this.options.pageText) { this.options.pageText.remove(); this.options.pageText = undefined; }
    if (this.options.titleText) { this.options.titleText.remove(); this.options.titleText = undefined; }
    if (this.options.notAvailMessage) { this.options.notAvailMessage.remove(); this.options.notAvailMessage = undefined; }


    // Figure out which page and how many options to draw (some attributes have 0 options like BODY and EYES)
    let page = this.options.currPage;
    let size = oData.get(this.attributes.selection)!.size;

    // If attribute is body or eyes go straight to making pallettes because they dont have any options
    // Otherwise, draw the options for the selected attribute
    if (this.attributes.selection != Attribute.BODY && this.attributes.selection != Attribute.EYES) {
      // Figure out the page (each page is a 3x3 grid)
      let pages = Math.ceil(size / 9);
      if (page <= pages && page > 0) {
        // Figure out number of icons to draw, starting and ending icon indices
        let numIcon = (page < pages || (page == pages && size % 9 == 0)) ? 9 : (size % 9);
        let rows = Math.ceil(numIcon / 3)
        let startIndex = 9 * (page - 1);

        // Icon placement config
        let xFix = 11.85; // Most top-left icon x coords
        let yFix = 1.55; // Most top-left icon y coords
        let dx = 1.3; // Subsequent icons x displacement
        let dy = 1.3; // Subsequent icons y displacement

        // Draws the icons for this page in a 3x3 grid
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < 3; j++) {
            // NB:  exit condition is based on number drawn, not index of last drawn
            let currIndex = i * 3 + j;
            if (currIndex < numIcon) {
              // This looks complicated, but it's just getting the value from each IconDisplay object under the selected attribute
              let value = Array.from(oData.get(this.attributes.selection)!.values())[currIndex + startIndex];
              let sIcon = new Actor({
                appearance: [
                  new ImageSprite({ width: 1, height: 1, img: "optionSelectBox.png" }),
                  new ImageSprite({ width: value.w, height: value.h, img: value.img, offset: { dx: value.ox, dy: value.oy } })
                ],
                rigidBody: new BoxBody({ cx: xFix + (dx * j), cy: yFix + (dy * i), width: 1, height: 1 }),
                gestures: {
                  tap: () => {
                    // Like above, but for key so we know which option was chosen
                    let optionKey = Array.from(oData.get(this.attributes.selection)!.keys())[currIndex + startIndex] as TxID;

                    // Tapping will update the `state` and immediately re-generate the previews
                    switch (this.attributes.selection) {
                      case Attribute.OUTFIT: this.state.config.outfit.set(optionKey, [], []); break;
                      case Attribute.HAIR: this.state.config.hair.set(optionKey, [], []); break;
                      case Attribute.ACCESSORY: this.state.config.accessory.set(optionKey, [], []); break;
                      default: break;
                    }
                    // On a tap, remember the chosen option, and redraw the option and pallette pages
                    this.options.selection = optionKey;
                    // [mfs]  This could create a lot of churn in the
                    //        texturemaps... consider having a way to purge the
                    //        old ones?
                    this.state.animations = new CharacterAnimations(this.state.config);
                    // Refresh the UI
                    this.makeOptionPage();
                    this.makePreviews(); // Remake the models to reflect the new option changes
                    this.makePallettePage();
                    this.options.titleText = new Actor({
                      appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 18 },
                        () => value.displayName ? value.displayName : value.img),
                      rigidBody: new BoxBody({ cx: 13.15, cy: 5.4, width: 0.6, height: 0.6 }),
                    })
                    return true;
                  }
                }
              });
              this.options.icons.push(sIcon); // Add each icon actor to the icons array
            }
          }
        }

        // Make the next/prev buttons:
        if (page !== pages) {
          this.options.nextButton = new Actor({
            appearance: new ImageSprite({ width: .6, height: .6, img: "rightButton0.png" }),
            rigidBody: new BoxBody({ cx: 14.8, cy: 5.4, width: .6, height: .6, }),
            gestures: {
              tap: () => {
                this.animateButton(this.options.nextButton!);
                this.options.currPage++;
                this.makeOptionPage();
                return true;
              }
            }
          });
        }
        if (page !== 1) {
          this.options.prevButton = new Actor({
            appearance: new ImageSprite({ width: .6, height: .6, img: "leftButton0.png" }),
            rigidBody: new BoxBody({ cx: 11.5, cy: 5.4, width: .6, height: .6, }),
            gestures: {
              tap: () => {
                this.animateButton(this.options.prevButton!);
                this.options.currPage--;
                this.makeOptionPage();
                return true;
              }
            }
          });
        }
        // And add the text for the page number and selection
        this.options.pageText = new Actor({
          appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "#262626", size: 14 }, () => "Page " + this.options.currPage + "/" + pages),
          rigidBody: new BoxBody({ cx: 13.15, cy: 5.9, width: 0, height: 0 }),
        });
      } else { throw ("invalid option page number") }
    } else {
      // The "not available" message
      this.options.notAvailMessage = new Actor({
        appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "#262626", size: 25 }, () => "No options\navailable"),
        rigidBody: new BoxBody({ cx: 13.15, cy: 3, width: 0, height: 0 }),
      });
      this.options.selection = TxID.None; // Reset the selection to none
      this.makePallettePage();
    }
  }

  /**
   * Draw the pallette options that the player can choose for the current
   * option/attribute.
   */
  makePallettePage() {
    // Erase existing pallettes, then we'll redraw them
    for (let o of this.pallettes) o.remove(); this.pallettes = [];
    let plts = pData.get(this.attributes.selection)!.get(this.options.selection)?.pallettes;
    let og = pData.get(this.attributes.selection)!.get(this.options.selection)?.originalColor;
    if (plts && og) {
      // Icon placement config
      let xFix = 11.55; // Most top-left icon x coords
      let yFix = 7.14; // Most top-left icon y coords
      let dx = 0.644; // Subsequent icons x displacement
      let dy = 0.64; // Subsequent icons y displacement

      // Figure out how many pallettes we need to draw and put them in a grid
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 6 && i * 6 + j < plts.length; j++) {
          let plt = plts[i * 6 + j];
          let pIcon = new Actor({ // pallette icons
            appearance: new FilledBox({ width: 0.5, height: 0.5, fillColor: plt.toDisplay, lineColor: "#3c3c54", lineWidth: 0.05 }),
            rigidBody: new BoxBody({ cx: xFix + (dx * j), cy: yFix + (dy * i), width: 0.5, height: 0.5 }),
            gestures: {
              tap: () => {
                // Change the pallette of the selected attribute while keeping their texture
                switch (this.attributes.selection) {
                  case Attribute.BODY: this.state.config.body.set(undefined, og, plt.newColor); break;
                  case Attribute.EYES: this.state.config.eyes.set(undefined, og, plt.newColor); break;
                  case Attribute.OUTFIT: this.state.config.outfit.set(undefined, og, plt.newColor); break;
                  case Attribute.HAIR: this.state.config.hair.set(undefined, og, plt.newColor); break;
                  case Attribute.ACCESSORY: this.state.config.accessory.set(undefined, og, plt.newColor); break;
                  default: break;
                }
                this.state.animations = new CharacterAnimations(this.state.config);
                // [anh] Do we need to redraw the pallette? I commented it out and nothing seems to be wrong
                //this.makePallettePage();
                this.makePreviews();
                return true;
              }
            }
          });
          this.pallettes.push(pIcon); // Add each icon actor to the icons array
        }
      }
    } else {
      // The "not available" message
      let notAvail = new Actor({
        appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "#262626", size: 18 }, () => "No pallettes\navailable"),
        rigidBody: new BoxBody({ cx: 13.15, cy: 7.46, width: 0, height: 0 }),
      });
      this.pallettes.push(notAvail);
    }
  }

  /**
   * Make a pop-up text box to ask a yes/no question.  Uses an overlay so the
   * rest of the UI can be disabled easily.
   *
   * @param inquiry The question to ask
   * @param func    Code to run if "yes" is chosen
   */
  makeYNOverlay(inquiry: string, func: () => void) {
    // Blur the background
    let fadeFilter = new FadingBlurFilter(0, 5, false);
    stage.renderer.addZFilter(fadeFilter, -2, SpriteLocation.OVERLAY);
    fadeFilter.enabled = true;
    // Start an overlay
    stage.requestOverlay((overlay, screenshot) => {
      screenshot!.z = -2;
      // screenshot, then background
      new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0, }, { scene: overlay }), });
      new Actor({
        appearance: [
          new ImageSprite({ width: 3 * 2.5, height: 3, img: "choiceBox.png" }),
          new TextSprite({ center: true, face: stage.config.textFont, color: "ffffff", size: 21 }, inquiry)
        ],
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 1, height: 1 }, { scene: overlay }),
      });

      // The "no" button clears the overlay without running func()
      let no = new Actor({
        appearance: new ImageSprite({ width: 0.9, height: 0.9, img: "noButton0.png" }),
        rigidBody: new BoxBody({ cx: 6.5, cy: 6, width: 0.9, height: 0.9 }, { scene: overlay }),
        gestures: {
          tap: () => {
            fadeFilter.enabled = false;
            this.animateButton(no, overlay);
            stage.clearOverlay();
            return true;
          }
        }
      })

      // The "yes" button runs func and then clears the overlay
      let yes = new Actor({
        appearance: new ImageSprite({ width: 0.9, height: 0.9, img: "yesButton0.png" }),
        rigidBody: new BoxBody({ cx: 9.5, cy: 6, width: 0.9, height: 0.9 }, { scene: overlay }),
        gestures: {
          tap: () => {
            func();
            fadeFilter.enabled = false;
            this.animateButton(yes, overlay);
            stage.clearOverlay();
            return true;
          }
        }
      });
    }, true);
  };

  /**
   * Give the appearance of animation for a button, by drawing an animation atop
   * it.
   *
   * @param button  The button actor to animate
   * @param scene   The scene in which the button exists, so we can put an
   *                animation in place
   */
  animateButton(button: Actor, scene: Scene = stage.world) {
    let sprite = button.appearance[0] as ImageSprite;
    let x = button.rigidBody.getCenter().x;
    let y = button.rigidBody.getCenter().y;
    let w = sprite.width;
    let h = sprite.height;
    // NOTE: Make sure the image file you are using when it is static ends with a '0'.
    let imgName = sprite.img.split("0.")[0]; // The name of the image file without the frame number

    // Create an actor with the button animation
    let b = new Actor({
      appearance: new AnimatedSprite({ width: w, height: h, animations: makeSimpleAnimation(imgName, 3, 33, true, true), z: 2 }),
      rigidBody: new BoxBody({ cx: x, cy: y, width: w, height: h }, { scene: scene }),
    });
    scene.timer.addEvent(new TimedEvent(0.166, false, () => { b.enabled = false; }));
  }

  /**
   * Make a random option/pallette selection for the current attribute
   */
  attributeRandomizer() {
    // Figure out which attribute we're on and get from it a random option
    if (this.attributes.selection !== Attribute.NONE) {
      let options = Array.from(oData.get(this.attributes.selection)!.keys());
      let randOption = options[Math.floor(Math.random() * options.length)];

      // Get the original color and pallettes from the random option and pick
      // from it a random pallette (if applicable)
      let og = pData.get(this.attributes.selection)!.get(randOption)?.originalColor;
      let plts = pData.get(this.attributes.selection)!.get(randOption)?.pallettes;
      let randNewColor = plts ? plts[Math.floor(Math.random() * plts.length)].newColor : undefined;

      switch (this.attributes.selection) {
        case Attribute.BODY: this.state.config.body.set(randOption, og, randNewColor); break;
        case Attribute.EYES: this.state.config.eyes.set(randOption, og, randNewColor); break;
        case Attribute.OUTFIT: this.state.config.outfit.set(randOption, og, randNewColor); break;
        case Attribute.HAIR: this.state.config.hair.set(randOption, og, randNewColor); break;
        case Attribute.ACCESSORY: this.state.config.accessory.set(randOption, og, randNewColor); break;
        default: break;
      }
      // Make new animations and then preview them
      this.state.animations = new CharacterAnimations(this.state.config);
      this.makePreviews();
    }
  }
}


/**
 * Create the character customization builder
 */
export const makeCharacterBuilder: Builder = function () {
  // Make sure we have a session storage object
  //
  // [mfs] This is probably not necessary since we have an opening scene
  if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());

  // Create our initial guess at the character's appearance, via the
  // defaultCharacter.
  let currentConfig = defaultCharacter.clone();

  // Now prepare to make the whole UI, using that character
  let ui = new UserInterface(currentConfig);

  // Make the UI: start with the previews and attribute page
  ui.makePreviews();
  ui.makeAttributePage();

  // Background
  new Actor({
    appearance: new ImageSprite({ width: 16.1, height: 9.1, img: "charCustomBackground.png", z: -2 }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }),
  });

  // Outline for the attribute name text box
  new Actor({
    appearance: new ImageSprite({ width: 6.6 * 0.36, height: 0.6, img: "optionNameBox.png", z: -2 }),
    rigidBody: new BoxBody({ cx: 5.74, cy: 8.1, width: 0.6, height: 0.6 }),
  });
  // Outline for the option title text box
  new Actor({
    appearance: [
      new ImageSprite({ width: 0.6 * 2.5, height: 0.6, img: "colorTitleBox.png" }),
      new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 18 }, () => "OPTION")
    ],
    rigidBody: new BoxBody({ cx: 13.15, cy: 0.65, width: 0, height: 0 }),
  })
  // Outline for the option name
  new Actor({ // Option name
    appearance: new ImageSprite({ width: 6.6 * 0.36, height: 0.6, img: "optionNameBox.png", z: -2 }),
    rigidBody: new BoxBody({ cx: 13.15, cy: 5.4, width: 0.6, height: 0.6 }),
  });
  // Outline for the color chooser, and the word "COLOR"
  new Actor({
    appearance: [
      new ImageSprite({ width: 0.6 * 2.5, height: 0.6, img: "colorTitleBox.png" }),
      new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 18 }, () => "COLOR")
    ],
    rigidBody: new BoxBody({ cx: 13.15, cy: 6.5, width: 0, height: 0 }),
  });

  // Button for going back to the main menu
  //
  // [mfs] This is currently not doing anything
  let mainMenuButton = new Actor({
    appearance: new ImageSprite({ width: .6, height: .6, img: "homeButton0.png" }),
    rigidBody: new BoxBody({ cx: 8.25, cy: 4.15, width: .6, height: .6, }),
    gestures: {
      tap: () => {
        ui.animateButton(mainMenuButton);
        ui.makeYNOverlay("Return to main menu?", () => { });
        return true;
      }
    }
  });

  // Button for clearing all customizations
  let clearAllButton = new Actor({
    appearance: new ImageSprite({ width: .6, height: .6, img: "clearButton0.png" }),
    rigidBody: new BoxBody({ cx: 8.96, cy: 4.15, width: .6, height: .6, }),
    gestures: {
      tap: () => {
        ui.animateButton(clearAllButton);
        ui.makeYNOverlay("Clear all customizations?", () => {
          ui.state.config = defaultCharacter.clone();
          ui.state.animations = new CharacterAnimations(ui.state.config);
          ui.makePreviews();
        });
        return true;
      }
    }
  });

  // Button for randomizing an attribute
  let randomizeButton = new Actor({
    appearance: new ImageSprite({ width: .6, height: .6, img: "randomizeButton0.png" }),
    rigidBody: new BoxBody({ cx: 9.65, cy: 4.15, width: .6, height: .6, }),
    gestures: {
      tap: () => {
        ui.animateButton(randomizeButton);
        ui.attributeRandomizer();
        return true;
      }
    }
  });

  // "Done" button, for moving on to the game
  new Actor({
    appearance: [
      new ImageSprite({ width: .6 * 4, height: .6, img: "completeButton.png" }),
      new TextSprite({ center: true, face: stage.config.textFont, color: "0b6623", size: 18, offset: { dx: 0, dy: -0.05 } }, () => "DONE!")
    ],
    rigidBody: new BoxBody({ cx: 8.96, cy: 4.78, width: .6 * 4, height: .6, }),
    gestures: {
      tap: () => {
        ui.makeYNOverlay("Save Character?", () => {
          let sStore = stage.storage.getSession("sStore") as SessionInfo;
          sStore.playerAppearance = ui.state.animations;

          if (ui.state.config.accessory.texture !== TxID.None)
            sStore.inventories.player.accessory.addItem(partToItem(ui.state.config.accessory))
          sStore.inventories.player.outfit.addItem(partToItem(ui.state.config.outfit))

          stage.switchTo(mmDormBuilder, 1);
        })
        return true;
      }
    }
  });
}
makeCharacterBuilder.playerLimit = 1;
makeCharacterBuilder.builderName = "makeCharacterBuilder";