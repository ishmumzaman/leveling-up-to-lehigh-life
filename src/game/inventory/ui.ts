// Reviewed on 2024-09-27

// [mfs]  There is probably some opportunity to share more code between the two
//        inventory render functions.  When we add another function (maybe for
//        the closet), we can revisit.

import { ImageSprite, BoxBody, CircleBody, FilledBox, Actor, stage, ManualMovement, Obstacle, TimedEvent } from "../../jetlag";
import { ItemExtra, itemRender } from "../inventory/item";
import { LevelInfo } from "../storage/level";
import { SessionInfo } from "../storage/session";
import { fillShelvesPartial, Inventory } from "./inventory";

/**
 * InventoryConfig is a helper class, so that we can avoid copy-and-paste of
 * inventory drawing code, even though there are different inventories that get
 * drawn differently
 */
class InventoryConfig {
  /**
   * Construct an InventoryConfig
   *
   * @param xFix      X coordinate of top left
   * @param yFix      Y coordinate of top left
   * @param dx        X distance between items
   * @param dy        Y distance between items
   * @param itemWidth Width of items
   * @param itemHeight Height of items
   */
  constructor(readonly xFix: number, readonly yFix: number, readonly dx: number, readonly dy: number, readonly itemWidth: number, readonly itemHeight: number) { }
}

export abstract class InventoryUI {
  /** The inventory to show */
  protected abstract inventory: Inventory;

  /** The configuration for the inventory */
  protected abstract cfg: InventoryConfig;

  /** The items in the inventory */
  protected abstract items: Actor[];

  /** The components of the UI */
  protected abstract components: Actor[];

  /** Whether the inventory is currently showing */
  protected abstract showing: boolean;

  public abstract toggle(): void;

  protected abstract open(): void;

  protected abstract close(): void;

  /** Render an inventory (clears and re-renders when needed) */
  protected rerenderInventory() {
    // Disable the actor of all inventory items
    while (this.items.length > 0)
      this.items.shift()?.remove();

    // Render each inventory item and its tooltip, and put them into items[]
    let inv = this.inventory; // alias
    let cfg = this.cfg; //alias
    for (let i = 0; i < inv.rows; i++) {
      for (let j = 0; j < inv.cols; j++) {
        let itemActors = itemRender(inv.items[i * inv.cols + j], cfg.itemWidth,
          cfg.itemHeight, cfg.xFix + (cfg.dx * j), cfg.yFix + (cfg.dy * i), true);
        this.items.push(itemActors.actor);
        if (itemActors.toolTipActor) this.items.push(itemActors.toolTipActor);
      }
    }
  }
}

/**
 * Create a HUD screen to show the player's inventory, acts like a singleton class
 */
export class PlayerInventoryUI extends InventoryUI {

  protected inventory: Inventory;

  protected cfg: InventoryConfig = new InventoryConfig(5.15, 4.2, 1.139, 1.1, .7, .7);;

  protected components: Actor[] = [];

  /* For every Item in the inventory, we put its actor here, so we can
    un-render and re-render them as needed */
  protected items: Actor[] = [];

  protected showing = false;

  constructor() {
    super();
    // Get the inventory from the session storage
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

    this.inventory = sStore.inventories.player;

    // Image for the main inventory UI
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 8, height: 4, img: "overlay/inventory.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    }));

    // Button for closing the inventory, must go through the HUD
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 0.34, height: 0.34, img: "overlay/closeButton.png", z: 2 }),
      rigidBody: new CircleBody({ cx: 4.6, cy: 3, radius: .27 }, { scene: stage.hud }),
      gestures: { tap: () => { lInfo.hud!.toggleModal('inventory'); return true; } }
    }));

    // Hide everything for now
    for (let c of this.components)
      c.enabled = false;
  }

  toggle() {
    // If the inventory isn't showing, show the inventory
    if (!this.showing) this.open()

    // If the inventory is showing, turn it off.
    else this.close();
  }

  protected open() {
    this.showing = true;
    for (let c of this.components)
      c.enabled = true;

    // Now we can render the inventory
    this.rerenderInventory();

    // Set up a drag gesture for moving things within the inventory
    //
    // NB:  This takes the coords of the drop, and the inventory index of the
    //      dragged item
    itemDragGestures((x: number, y: number, fromLoc: { row: number, col: number }) => {
      // Find the inventory slot where we're doing a drop, make sure it's not
      // the initial actor
      for (let actor of stage.hud!.physics!.actorsAt({ x, y })) {
        if ((actor.extra instanceof ItemExtra) && fromLoc != actor.extra.item.location) {
          // NB: Must make copies of both locations
          let from = { ...fromLoc };
          let to = { ...actor.extra.item.location };
          let inv = this.inventory;
          let tempSwap = inv.items[to.row * inv.cols + to.col];
          inv.removeAt({ row: to.row, col: to.col });
          inv.addItem(inv.items[from.row * inv.cols + from.col], { row: to.row, col: to.col });
          inv.removeAt({ row: from.row, col: from.col });
          inv.addItem(tempSwap, { row: from.row, col: from.col });
          break;
        }
      }
      // NB:  Even a bad drop needs redrawing
      // This check prevents the visual bug when the inventory is closed during item dragging
      if (this.showing) this.rerenderInventory();
    });
  }

  protected close() {
    this.showing = false;
    for (let c of this.components)
      c.enabled = false;

    while (this.items.length > 0)
      this.items.shift()?.remove();
  }
}

/**
 * Create an hud screen of a snack shelf
 *
 *
 * @param shelfChoice Which shelf to render in
 */
export class ShelfInventoryUI extends InventoryUI {

  private playerInv: Inventory;

  protected inventory: Inventory;

  protected cfg: InventoryConfig = new InventoryConfig(3.5, 1, 1.8, 2, 1.3, 1.3);

  protected items: Actor[] = [];

  protected components: Actor[] = [];

  protected showing = false;

  private bag: Actor;

  constructor(shelfChoice: number) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    super();

    this.inventory = sStore.inventories.shelves[shelfChoice];
    this.playerInv = sStore.inventories.player;

    // Image for the main inventory UI
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 11.34, height: 6.426, img: "MVPDemo/shelf.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 3.5, width: 16, height: 9 }, { scene: stage.hud }),
    }));

    // Button for closing the inventory, must go through the HUD
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "MVPDemo/back.png" }),
      rigidBody: new BoxBody({ cx: 1.5, cy: .8, width: 1, height: 1 }, { scene: stage.hud }),
      gestures: { tap: () => { lInfo.hud?.toggleModal("otherContainer", this); return true; } },
    }))

    // The bag to drag stuff into
    this.components.push(this.bag = new Actor({
      appearance: new ImageSprite({ width: 5, height: 5, img: "MVPDemo/bag.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 8, width: 16, height: 4 }, { scene: stage.hud, elasticity: 1 }),
      movement: new ManualMovement(),
      role: new Obstacle(),
    }));

    // Hide everything for now
    for (let c of this.components)
      c.enabled = false;
  }

  toggle() {
    // If the inventory isn't showing, show the inventory
    if (!this.showing && !this.inventory.onCooldown) this.open();

    // If the inventory is showing, turn it off.
    else { this.close(); }
  }

  protected open() {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    this.showing = true;
    for (let c of this.components)
      c.enabled = true;

    // Now we can render the inventory
    this.rerenderInventory();
    itemDragGestures((x: number, y: number, fromLoc: { row: number, col: number }) => {
      for (let actor of stage.hud!.physics!.actorsAt({ x: x, y: y })) {
        // Handle swapping within the shelf, making sure not to swap with self
        if ((actor.extra instanceof ItemExtra) && fromLoc != actor.extra.item.location) {
          // NB: Must make copies of both locations
          let from = { ...fromLoc };
          let to = { ...actor.extra.item.location };
          let tempSwap = this.inventory.items[to.row * this.inventory.cols + to.col];
          this.inventory.removeAt({ row: to.row, col: to.col });
          this.inventory.addItem(this.inventory.items[from.row * this.inventory.cols + from.col], { row: to.row, col: to.col });
          this.inventory.removeAt({ row: from.row, col: from.col });
          this.inventory.addItem(tempSwap, { row: from.row, col: from.col });
          break;
        }
        // Handle dragging to the bag (moving into the player's inventory)
        else if (actor == this.bag) {
          // Save the item and put it into the player's inventory
          let from = { ...fromLoc };
          let tempSwap = this.inventory.items[from.row * this.inventory.cols + from.col];
          if (this.playerInv.addItem(tempSwap)) {
            this.inventory.removeAt({ row: from.row, col: from.col });
            // Close the shelf if empty, and start cooling down
            if (this.inventory.count == 0) {
              lInfo.hud?.toggleModal("otherContainer", this);
              this.inventory.onCooldown = true;
              stage.world.timer.addEvent(new TimedEvent(7.5, false, () => { this.inventory.onCooldown = false; fillShelvesPartial(this.inventory, false) }));
            }
            // Close the shelf if player inventory full
            else if (this.playerInv.count >= this.playerInv.capacity) {
              lInfo.hud?.toggleModal("otherContainer", this);
            }
          }
        }
      }
      if (this.showing) this.rerenderInventory();
    });
  }

  protected close() {
    this.showing = false;
    for (let c of this.components)
      c.enabled = false;

    while (this.items.length > 0)
      this.items.shift()?.remove();
  }
}

/**
 * Set up a HUD region for dragging items
 *
 * @param onDrop Code to run when the drag ends
 */
function itemDragGestures(onDrop: (x: number, y: number, dropLoc: { row: number, col: number }) => void) {
  // the actor being dragged
  let foundActor: Actor | undefined;

  // Starting the pan leads to identifying an actor, if there is one
  let panStart = (_: Actor, hudCoords: { x: number; y: number }) => {
    let pixels = stage.hud!.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let world_coords = stage.hud!.camera.screenToMeters(pixels.x, pixels.y);
    for (let actor of stage.hud!.physics!.actorsAt(world_coords)) {
      if ((actor.extra instanceof ItemExtra) && actor.extra.item.draggable) {
        foundActor = actor;
        return true;
      }
    }
    return false;
  };

  // Panning moves the actor, if there is one
  let panMove = (_: Actor, hudCoords: { x: number; y: number }) => {
    if (!foundActor) return false;
    let pixels = stage.hud!.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let meters = stage.hud!.camera.screenToMeters(pixels.x, pixels.y);
    foundActor.rigidBody.setCenter(meters.x, meters.y); // move the actor
    return true;
  };

  // Letting go calls onDrop
  let panStop = () => {
    if (!foundActor) return false;
    // NB: Passing location by reference is dangerous, but it works for now...
    onDrop(foundActor.rigidBody.getCenter().x, foundActor.rigidBody.getCenter().y, (foundActor.extra as ItemExtra).item.location);
    foundActor = undefined;
    return true;
  };

  // Now we can cover the HUD with a button that handles the pan gestures
  new Actor({
    appearance: new FilledBox({ width: 0, height: 0, fillColor: "#00000000", z: 2 }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: { panStart, panMove, panStop }
  });
}
