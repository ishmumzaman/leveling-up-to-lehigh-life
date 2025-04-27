import { CharacterPart, TxID } from './../characters/characterCustomization';
// Reviewed on 2024-09-23

import { ImageSprite, TextSprite, BoxBody, CircleBody, Actor, ManualMovement, Obstacle, FilledBox, stage, PixiSprite } from "../../jetlag";
import { Extra } from "../../jetlag/Entities/Actor";
import { textSlicer } from '../common/textFormatting';
import { Inventory } from "./inventory";

/** The different types of items that are supported in the game */
export enum ItemType {
  /** Food items */
  Food,

  /** A placeholder for non-existent items */
  Empty,

  /** */
  Outfit,

  Accessory,
}

/**
 * Item stores information about the different things that can be picked up and
 * kept in an inventory.
 */
export class Item {
  /**  Where the item is in an inventory (if it is in an inventory), or {row:-1,  col:-1} */
  readonly location: { inv: Inventory | null, row: number, col: number } = { inv: null, row: -1, col: -1 };

  /** Only if the item has type accessory or outfit */
  charPart?: CharacterPart

  /** Config for drawing items in inventory */
  cfg: { w: number, h: number, ox: number, oy: number } = { w: 1, h: 1, ox: 0, oy: 0 };

  /**
   * Creates an instance of the Item class.
    * @param type - The type of the item (e.g., food, clothing).
    * @param draggable - Indicates whether the item can be dragged.
    * @param name - The name of the item.
    * @param desc - A description of the item.
    * @param img - The image associated with the item.
    * @returns A new instance of the Item class.
   */
  constructor(readonly type: ItemType, readonly draggable: boolean, readonly name: string = "defaultName",
    readonly desc: string = "defaultDescription", public img: string | PixiSprite = "icon/defaultImg.png",) { }

  /**
   * Set the location of an item within an inventory array
   * @param row the row to set the location to
   * @param col the column to set the location to
   */
  setLocation(inv: Inventory | null, row: number, col: number,) {
    this.location.row = row;
    this.location.col = col;
    this.location.inv = inv;
  }

  /** Make a copy of this item */
  clone() {
    let item = new Item(this.type, this.draggable, this.name, this.desc, this.img);
    item.setLocation(this.location.inv, this.location.row, this.location.col);
    item.charPart = this.charPart;
    item.cfg = this.cfg;
    return item;
  }
}

/** A type for holding extra information attached to an Item */
export class ItemExtra extends Extra {
  constructor(public item: Item) { super(); }
}

/**
 * Renders an item as an Actor on the screen.
 * @param item - The item to render.
 * @param cx - The x-coordinate of the item.
 * @param cy - The y-coordinate of the item.
 * @param scale - The scale factor for the item. Default is 1x.
 * @param toolTipEnabled - Whether the tooltip is enabled. Default is false.
 */
// [mfs] TODO: Switch from width/height to a radius, since they're the same?
export function itemRender(item: Item, cx: number, cy: number, scale: number, toolTipEnabled: boolean = false) {
  // Create an actor as a circle
  let actor = new Actor({
    appearance: new ImageSprite({ width: item.cfg.w * scale, height: item.cfg.h * scale, img: item.img, offset: { dx: item.cfg.ox, dy: item.cfg.oy } }),
    rigidBody: new CircleBody({ cx, cy, radius: 0.42 * scale }, { scene: stage.hud, elasticity: 1 }),
    movement: new ManualMovement(),
    role: new Obstacle(),
    extra: new ItemExtra(item)
  });

  // allow tooltip if item is not an empty Item
  //
  // [mfs]  The tooltip should get attached to the extra, so that the caller
  //        doesn't have to manage the association
  if ((item.type !== ItemType.Empty) && toolTipEnabled) {
    // Tooltip configuration
    let nameData = textSlicer(15, item.name);
    let newName = nameData.newText;
    let dyToolTip = nameData.totalLines * 0.2;
    let descData = textSlicer(20, item.desc);
    let newDesc = descData.newText;
    let boxWidth = 3.5;
    let boxHeight = dyToolTip + descData.totalLines * 0.2 + 0.3;
    let boxXFix = cx + 2.2;
    let boxYFix = cy - 0.3;

    let toolTipActor = new Actor({
      rigidBody: new BoxBody({ cx: boxXFix, cy: boxYFix, width: boxWidth, height: boxHeight }, { scene: stage.hud }),
      appearance: [
        new FilledBox({ width: boxWidth, height: boxHeight, fillColor: "#a8a198", lineWidth: 0.04, lineColor: "#6c5454", z: 2, offset: { dx: 0, dy: -0.65 + boxHeight / 2 } }),
        new TextSprite({ center: false, face: stage.config.textFont, color: "#000000", size: 14, z: 2, offset: { dx: -1.7, dy: -0.60 } }, newName),
        new TextSprite({ center: false, face: stage.config.textFont, color: "#000000", size: 12, z: 2, offset: { dx: -1.7, dy: -0.40 + dyToolTip } }, newDesc),
      ]
    })

    // Initially disable tooltips and the player
    // is not holding an item with drag feature
    let holdingItem = false;
    toolTipActor.enabled = false;

    // If the player is not currently dragging and the item has a tooltip,
    // enable the tooltip. Otherwise disable it.
    actor.gestures.mouseHover = () => { if (!holdingItem) { toolTipActor.enabled = true } return true; }
    actor.gestures.mouseUnHover = () => { toolTipActor.enabled = false; return true; }

    // When the player starts dragging something, disable the tooltip.
    actor.gestures.touchDown = () => { toolTipActor.enabled = false; holdingItem = true; return true; }
    actor.gestures.touchUp = () => { toolTipActor.enabled = true; holdingItem = false; return true; }

    // Return item and tooltip actor in order to disable them later in inventory.ts
    return ({ actor, toolTipActor });
  }
  return ({ actor }); // if the item has no tooltip, just return the actor
}

/** All of the items in the game, for fast lookup */
export enum Items {
  empty, water, coke, cokeBottle, orangeJuice, chips, kettleChips, eCereal,
  aCereal, kCereal, iCereal, pretzel, muffin, chocoPiece, chocoWafer, chocoBar,
  pinkDonut, donutBox, iceCream, popsicle, lolipop, pie, snapback04 = TxID.Snapback04,
  outfit01 = TxID.Outfit01, outfit02 = TxID.Outfit02, outfit03 = TxID.Outfit03,
  outfit04 = TxID.Outfit04, outfit07 = TxID.Outfit07, outfit10 = TxID.Outfit10,
  outfit11 = TxID.Outfit11, outfit14 = TxID.Outfit14, beanie01 = TxID.Beanie01,
  glasses01 = TxID.Glasses01,
};

/**
 * A map of all the game items, for fast lookup
 *
 * [mfs] This should be a field of the Session, not a static.
 */
export class GameItems {
  // Dictionary of all game items
  // [mfs] Why is EMPTY in here?
  private static gameItems = new Map([
    [Items.empty, new Item(ItemType.Empty, false, "empty", "empty", "empty.png")],
    //Food items
    [Items.water, new Item(ItemType.Food, true, "Water Bottle", "Nature's finest beverage, stay hydrated!", "bottle2.png")],
    [Items.coke, new Item(ItemType.Food, true, "Coke", "Just a drink", "soda.png")],
    [Items.cokeBottle, new Item(ItemType.Food, true, "Diet Vepsi", "They say mankind's greatest invention was Diet Wepsi", "bottle3.png")],
    [Items.orangeJuice, new Item(ItemType.Food, true, "Orange Juice", "An orange died for this. You monster.", "bottle4.png")],
    [Items.chips, new Item(ItemType.Food, true, "Chips", "Crispy!", "snackBag1.png")],
    [Items.kettleChips, new Item(ItemType.Food, true, "Kettle Cooked Jalapeno Chips", "Objectively the best chips", "snackBag2.png")],
    [Items.eCereal, new Item(ItemType.Food, true, "E Cereal", "The highly anticipated E Cereal from the E Corporation!", "snackBox2.png")],
    [Items.aCereal, new Item(ItemType.Food, true, "A Cereal", "E cereal's fiercest competitor and a cereal to be reckoned with", "snackBox3.png")],
    [Items.kCereal, new Item(ItemType.Food, true, "K Cereal", "Not as good as E or A's cereal, but a good budget option!", "snackBox4.png")],
    [Items.iCereal, new Item(ItemType.Food, true, "iCereal", "Apple's newest product", "snackBox5.png")],
    [Items.pretzel, new Item(ItemType.Food, true, "Pretzel", "It ain't no Auntie Anne's but it's still good.", "pretzel.png")],
    [Items.muffin, new Item(ItemType.Food, true, "Chocolate Chip Muffin", "The objective worse kind of muffin.", "muffin1.png")],
    [Items.chocoPiece, new Item(ItemType.Food, true, "Brobero Broche", "Your parents told you this candy was exquisite.", "candy3.png")],
    [Items.chocoWafer, new Item(ItemType.Food, true, "SnickSnack", "Take a period of relaxation for yourself", "candy4.png")],
    [Items.chocoBar, new Item(ItemType.Food, true, "Mr. Least Bar", "If you put it up to your ear you hear a voice telling you to subscribe", "candy5.png")],
    [Items.pinkDonut, new Item(ItemType.Food, true, "Strawberry Frosted Donut", "An American delicacy.", "donut.png")],
    [Items.donutBox, new Item(ItemType.Food, true, "Box of Donuts", "A pack of American delicacies. You will finish these in an hour max.", "donutBox.png")],
    [Items.iceCream, new Item(ItemType.Food, true, "Ice Cream", "\"The Ice Cream\" is not real.", "iceCream.png")],
    [Items.popsicle, new Item(ItemType.Food, true, "Blueberry Popsicle", "Everyone's favorite flavor.", "popsicle.png")],
    [Items.lolipop, new Item(ItemType.Food, true, "Zootsie-Pop", "If you bite it an owl might attack you.", "lolipop.png")],
    [Items.pie, new Item(ItemType.Food, true, "Pie", "This pie is so good I could die!!", "pie.png")],
    // Clothing items
    [Items.snapback04, new Item(ItemType.Accessory, true, "Snapback", "Looking \"snappy\", yuh", "snapback04PTTalk0.png")],
    [Items.beanie01, new Item(ItemType.Accessory, true, "Beanie", "Looking \"snappy\", yuh", "beanie01PTTalk0.png")],
    [Items.glasses01, new Item(ItemType.Accessory, true, "Glasses", "Looking \"snappy\", yuh", "glasses01PTTalk0.png")],
    [Items.outfit01, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit01IdleS0.png")],
    [Items.outfit02, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit02IdleS0.png")],
    [Items.outfit03, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit03IdleS0.png")],
    [Items.outfit04, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit04IdleS0.png")],
    [Items.outfit07, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit07IdleS0.png")],
    [Items.outfit10, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit10IdleS0.png")],
    [Items.outfit11, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit11IdleS0.png")],
    [Items.outfit14, new Item(ItemType.Outfit, true, "Outfit", "Just something casual", "outfit14IdleS0.png")],
  ]);

  /**
   * @param key name of the item's key in the gameItems dictionary
   * @returns a clone of that item
   */
  public static getItem(key: Items): Item {
    const item = this.gameItems.get(key);
    if (!item) throw new Error(`Item with key ${key} not found`);

    if (item.type === ItemType.Accessory) { item.cfg.w = 1.2; item.cfg.h = 1.2; item.cfg.ox = 0.05; item.cfg.oy = 0.2; }
    if (item.type === ItemType.Outfit) { item.cfg.w = 0.8; item.cfg.h = 1.6; item.cfg.oy = -0.5; }
    if (item.type === ItemType.Food) { item.cfg.w = 0.7; item.cfg.h = 0.7; }
    return item.clone();
  }

  /** All Items that are foods */
  static foodTypes = [
    Items.chips, Items.kettleChips, Items.eCereal, Items.aCereal, Items.kCereal,
    Items.iCereal, Items.pretzel, Items.muffin, Items.chocoPiece,
    Items.chocoWafer, Items.chocoBar, Items.pinkDonut, Items.donutBox,
    Items.lolipop, Items.pie
  ];

  /** All Items that are drinks */
  static drinkTypes = [Items.water, Items.coke, Items.cokeBottle, Items.orangeJuice];
}