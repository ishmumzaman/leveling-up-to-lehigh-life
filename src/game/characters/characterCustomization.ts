// Reviewed on 2024-09-17

import { AnimationSequence, AnimationState, MultiColorReplaceFilter, Container, PixiSprite, stage } from "../../jetlag";

/**
 * A hex color is a hexadecimal number, e.g 0x000000 for black, 0xFFFFFF for white.
 * This type is specifically used for character customization related classes and operations.
 */
export type HexColor = number | number[] | Float32Array;

/**
 * The different attributes that can be customized for a character
 */
export enum Attribute {
  NONE = "", BODY = "BODY", EYES = "EYES", OUTFIT = "OUTFIT", HAIR = "HAIR", ACCESSORY = "ACCESSORY"
}

/** The texture ID of clothing items used througout character customization related operations */
export const enum TxID {
  None = "",
  Beanie01 = "beanie01",
  Beard01 = "beard01",
  Body01 = "body01",
  Body03 = "body03",
  Eyes01 = "eyes01",
  Glasses01 = "glasses01",
  Hair01 = "hair01",
  Hair04 = "hair04",
  Hair03 = "hair03",
  Hair05 = "hair05",
  Hair09 = "hair09",
  Hair10 = "hair10",
  Hair11 = "hair11",
  Hair12 = "hair12",
  Hair15 = "hair15",
  Hair18 = "hair18",
  Hair19 = "hair19",
  Hair22 = "hair22",
  Hair24 = "hair24",
  Hair25 = "hair25",
  Outfit01 = "outfit01",
  Outfit02 = "outfit02",
  Outfit03 = "outfit03",
  Outfit04 = "outfit04",
  Outfit07 = "outfit07",
  Outfit10 = "outfit10",
  Outfit11 = "outfit11",
  Outfit14 = "outfit14",
  Snapback04 = "snapback04"
}


/**
 * ColorPallette main purpose is to give info to the character customization screen.
 * It has a simple color that represents the pallette for display, and an array of new
 * colors to apply to a character part texture.
 */
export class ColorPallette {
  /**
   * Construct a ColorPallette
   *
   * @param toDisplay  The color to display in the character customization screen
   * @param newColor   An array of colors to apply to a character part texture
   */
  constructor(public toDisplay: string, public newColor: HexColor[]) { }
}

/**
 * CharacterPart is a simple class that names a texture and describes an set of colors to be replaced
 * and the new colors to replace them with. We create characters by merging the TextureInfo for all of their parts.
 */
export class CharacterPart {
  /**
   * Construct a CharacterPart
   *
   * @param texture     The name of the image file for this part of the
   *                    character without the file extension. e.g. "outfit01" or "hair02"
   * @param originalColor An array of color that will be replaced in the texture image
   * @param newColor    An array of color that will replace the original color in the texture image
   */
  constructor(public texture: TxID, public originalColor: HexColor[], public newColor: HexColor[]) { }

  /**
   * Set the texture, original color, and new color of a CharacterPart
   *
   * @param texture     The name of the image file for this part of the
   *                    character without the file extension. e.g. "outfit01" or "hair02"
   * @param originalColor An array of color that will be replaced in the texture image
   * @param newColor An array of color that will replace the original color in the texture image
   */
  set(texture?: TxID, originalColor?: HexColor[], newColor?: HexColor[]) {
    if (texture !== undefined) this.texture = texture;
    if (originalColor !== undefined) this.originalColor = originalColor;
    if (newColor !== undefined) this.newColor = newColor;
  }
  /** Copy a CharacterPart into a new one */
  clone() { return new CharacterPart(this.texture, this.originalColor, this.newColor); }
};

/**
 * The essential state for creating a character. CharacterAnimations is
 * ephemeral... we can make it on the fly, as long as we have a good
 * CharacterConfig.
 */
export class CharacterConfig {
  /**
   * @param body      The configuration for the character's body
   * @param eyes      The configuration for the character's eyes
   * @param outfit    The configuration for the character's outfit
   * @param hair      The configuration for the character's hair
   * @param accessory The configuration for the character's accessory
   */
  constructor(public body: CharacterPart, public eyes: CharacterPart, public outfit: CharacterPart, public hair: CharacterPart, public accessory: CharacterPart) { }

  /** Copy a CharacterConfig into a new one */
  clone() { return new CharacterConfig(this.body.clone(), this.eyes.clone(), this.outfit.clone(), this.hair.clone(), this.accessory.clone()); }
}

/**
 * Make a PixiSprite from a CharacterPart, and apply a color replace filter to it
 *
 * @param part      The CharacterPart describing the image and color values
 * @param movement  Walk or Idle
 * @param direction W, E, S, N
 * @param frame     The frame number
 * @returns         A PixiSprite
 */
export function makeSprite(part: CharacterPart, movement: string, direction: string, frame: number) {
  let sprite = new PixiSprite(stage.imageLibrary.getImageAsTexture(part.texture + movement + direction + frame + ".png").clone());
  if (part.originalColor.length > 0 && part.newColor.length > 0) {
    if (part.originalColor.length !== part.newColor.length) { throw ("Original and pallette arrays are not the same length"); }

    let replacements: [HexColor, HexColor][] = []
    for (let i = 0; i < part.originalColor.length; i++) {
      replacements.push([part.originalColor[i], part.newColor[i]]);
    }

    sprite.filters = [new MultiColorReplaceFilter(replacements, 0.001)];
  }
  return sprite;
}

export function makeItemSprite(img: string, originalColor: HexColor[], newColor: HexColor[]) {
  let sprite = new PixiSprite(stage.imageLibrary.getImageAsTexture(img).clone());
  if (originalColor.length > 0 && newColor.length > 0) {
    if (originalColor.length !== newColor.length) { throw ("Original and pallette arrays are not the same length"); }

    let replacements: [HexColor, HexColor][] = []
    for (let i = 0; i < originalColor.length; i++) {
      replacements.push([originalColor[i], newColor[i]]);
    }

    sprite.filters = [new MultiColorReplaceFilter(replacements, 0.001)];
  }
  return sprite;
}

/**
 * Custom version of makeSprite for *portraits* with emotes
 *
 * @param part  The Characterpart describing the image and color values
 * @param emote Talk, Nod, or Shake
 * @param frame The frame number
 * @returns     A PixiSprite
 */
function makePortraitSprite(part: CharacterPart, emote: string, frame: number) {
  let sprite = new PixiSprite(stage.imageLibrary.getImageAsTexture(part.texture + "PT" + emote + frame + ".png").clone());
  if (part.originalColor.length > 0 && part.newColor.length > 0) {
    if (part.originalColor.length !== part.newColor.length) { throw ("Original and pallette arrays are not the same length"); }

    let replacements: [HexColor, HexColor][] = []
    for (let i = 0; i < part.originalColor.length; i++) {
      replacements.push([part.originalColor[i], part.newColor[i]]);
    }
    sprite.filters = [new MultiColorReplaceFilter(replacements, 0.001)];
  }
  return sprite;
}

/**
 * CharacterAnimations stores all of the information needed to draw the sprites
 * for a character, in all possible contexts. This is primarily some maps of
 * AnimationSequences and Remaps.
 */
export class CharacterAnimations {
  /** 8 animations, for walking and idle in the 4 cardinal directions */
  animations: Map<AnimationState, AnimationSequence> = new Map();
  /** 8 remappings, for walking and idle in the 4 diagonal directions */
  remap: Map<AnimationState, AnimationState> = new Map();

  /** The animation to run for a "talk" emote in a dialogue */
  talk: AnimationSequence;
  /** The animation to run for a "nod" emote in a dialogue */
  nod: AnimationSequence;
  /** The animation to run for a "shake" emote in a dialogue */
  shake: AnimationSequence;
  /** A still frame for the character in a dialogue */
  still: PixiSprite;

  /**
   * Construct a CharacterAnimations object
   *
   * @param config  A CharacterConfig describing how to make the character
   */
  constructor(public config: CharacterConfig) {
    // This code needs to create eight AnimationSequences, each of which
    // contains several PixiSprite objects that this code makes.  Here's where
    // we keep the sprites:
    let walkW: PixiSprite[] = [];
    let walkE: PixiSprite[] = [];
    let walkS: PixiSprite[] = [];
    let walkN: PixiSprite[] = [];
    let idleW: PixiSprite[] = [];
    let idleE: PixiSprite[] = [];
    let idleS: PixiSprite[] = [];
    let idleN: PixiSprite[] = [];

    // Populate the above 8 arrays by building 8 x 6 PixiSprites
    //
    // NB:  There are 6 animation frames for walking and for idling
    //
    // [mfs]  This code is tightly coupled with the naming conventions that we
    //        use for character assets.  We may regret that later, but for now,
    //        it's fine.
    for (let movement of ["Walk", "Idle"]) {
      for (let direction of ["W", "E", "S", "N"]) {
        for (let frame = 0; frame < 6; frame++) {
          let c = new Container();
          // NB:  Hopefully the caller always gives us a valid body/eyes/outfit,
          //      but let's have guards just in case
          // NB:  We don't draw eyes when facing north
          if (config.body.texture)
            c.addChild(makeSprite(config.body, movement, direction, frame));
          if (direction !== "N" && config.eyes.texture)
            c.addChild(makeSprite(config.eyes, movement, direction, frame));
          if (config.outfit.texture)
            c.addChild(makeSprite(config.outfit, movement, direction, frame));
          if (config.hair.texture)
            c.addChild(makeSprite(config.hair, movement, direction, frame));
          if (direction !== "N" && config.accessory.texture)
            c.addChild(makeSprite(config.accessory, movement, direction, frame));

          let texture = stage.renderer.pixi.renderer.generateTexture(c);
          let sprite = new PixiSprite(texture);
          switch (movement + direction) {
            case "WalkW": walkW.push(sprite); break;
            case "WalkE": walkE.push(sprite); break;
            case "WalkS": walkS.push(sprite); break;
            case "WalkN": walkN.push(sprite); break;

            case "IdleW": idleW.push(sprite); break;
            case "IdleE": idleE.push(sprite); break;
            case "IdleS": idleS.push(sprite); break;
            case "IdleN": idleN.push(sprite); break;
            default: throw "Unexpected movement+direction";
          }
        }
      }
    }

    // Now that we've got the PixiSprites, make the animations
    //
    // NB:  "map" is really a "zip" in this case.  Zipping the two arrays into
    //      one means that we don't have to copy/paste the hard-coded numbers
    //      quite as much
    let states = [AnimationState.WALK_W, AnimationState.WALK_E, AnimationState.WALK_S, AnimationState.WALK_N, AnimationState.IDLE_W, AnimationState.IDLE_E, AnimationState.IDLE_S, AnimationState.IDLE_N];
    let seqs = [walkW, walkE, walkS, walkN, idleW, idleE, idleS, idleN];
    for (let s of states.map((state, i) => { return { state, seq: seqs[i] }; }))
      this.animations.set(s.state, new AnimationSequence(true).to(s.seq[0], 135).to(s.seq[1], 135).to(s.seq[2], 135).to(s.seq[3], 135).to(s.seq[4], 135).to(s.seq[5], 135));

    // Make a remap, because we aren't going to have diagonal animations
    this.remap.set(AnimationState.WALK_NW, AnimationState.WALK_W);
    this.remap.set(AnimationState.WALK_SW, AnimationState.WALK_W);
    this.remap.set(AnimationState.WALK_NE, AnimationState.WALK_E);
    this.remap.set(AnimationState.WALK_SE, AnimationState.WALK_E);
    this.remap.set(AnimationState.IDLE_NW, AnimationState.IDLE_W);
    this.remap.set(AnimationState.IDLE_SW, AnimationState.IDLE_W);
    this.remap.set(AnimationState.IDLE_NE, AnimationState.IDLE_E);
    this.remap.set(AnimationState.IDLE_SE, AnimationState.IDLE_E);


    // Now we make 3 AnimationSequences for the emotes
    //
    // NB:  Once again, there's some tight coupling
    //
    // NB:  The assets we are using have 10 animation frames for talking,
    //      nodding, and shaking
    let talkArr: PixiSprite[] = [];
    let nodArr: PixiSprite[] = [];
    let shakeArr: PixiSprite[] = [];
    for (let emote of ["Talk", "Nod", "Shake"]) {
      for (let animationFrame = 0; animationFrame < 10; animationFrame++) {
        let c = new Container();

        if (config.body.texture)
          c.addChild(makePortraitSprite(config.body, emote, animationFrame));
        if (config.hair.texture)
          c.addChild(makePortraitSprite(config.hair, emote, animationFrame));
        if (config.accessory.texture)
          c.addChild(makePortraitSprite(config.accessory, emote, animationFrame));
        // [mfs]  This is really not nice.  We don't have 10 eye images, so this
        //        code is using try/catch to swallow bugs
        try {
          if (config.eyes.texture)
            c.addChild(makePortraitSprite(config.eyes, emote, animationFrame));
        } catch (e) { }

        let new_texture = stage.renderer.pixi.renderer.generateTexture(c);
        let new_sprite = new PixiSprite(new_texture);

        switch (emote) {
          case "Talk": talkArr.push(new_sprite); break;
          case "Nod": nodArr.push(new_sprite); break;
          case "Shake": shakeArr.push(new_sprite); break;
        }
      }
    }

    // Capture a still frame to use as the portrait
    this.still = talkArr[0];

    // Make the three animation sequences
    this.talk = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: true, images: talkArr });
    this.nod = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: true, images: nodArr });
    this.shake = AnimationSequence.makeSimple({ timePerFrame: 100, repeat: true, images: shakeArr });
  }
}
