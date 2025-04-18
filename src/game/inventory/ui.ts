// Reviewed on 2024-09-27

// [mfs]  There is probably some opportunity to share more code between the two
//        inventory render functions.  When we add another function (maybe for
//        the closet), we can revisit.

import { ImageSprite, BoxBody, CircleBody, FilledBox, Actor, Scene, stage, ManualMovement, Obstacle, SpriteLocation, TimedEvent } from "../../jetlag";
import { FadingBlurFilter } from "../common/filter";
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

/**
 * Create an overlay to show the player's inventory
 *
 * [mfs] Do we really want an *overlay*?  Overlays stop the clock, which is
 *       probably not desirable.
 */
export class PlayerInventoryUI {

  private inventory: Inventory;

  private config: InventoryConfig = new InventoryConfig(5.15, 4.2, 1.139, 1.1, .7, .7);;

  private inventoryBox: Actor;

  /* For every Item in the inventory, we put its actor here, so we can
    un-render and re-render them as needed */
  private items: Actor[] = [];

  private showing = false;

  private closeButton: Actor;

  private fadeFilter: FadingBlurFilter;

  constructor() {
    // Get the inventory from the session storage
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    this.inventory = sStore.inventories.player;

    // Image for the main inventory UI
    this.inventoryBox = new Actor({
      appearance: new ImageSprite({ width: 8, height: 4, img: "overlay/inventory.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    });

    // Button for closing the inventory
    this.closeButton = new Actor({
      appearance: new ImageSprite({ width: 0.34, height: 0.34, img: "overlay/closeButton.png", z: 2 }),
      rigidBody: new CircleBody({ cx: 4.6, cy: 3, radius: .27 }, { scene: stage.hud }),
      gestures: { tap: () => { this.close(); return true; } }
    });

    // Initialize the blur filter to be used later
    this.fadeFilter = new FadingBlurFilter(0, 5, false);
    stage.renderer.addFilter(this.fadeFilter, SpriteLocation.WORLD);

    // Hide everything for now
    this.inventoryBox.enabled = false;
    this.closeButton.enabled = false;

    for (let i of this.items)
      i.enabled = false;
  }

  toggle() {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo

    // Don't open the inventory if there's an overlay
    if (lInfo.overlayShowing) return;

    // If the inventory isn't showing, show the inventory
    if (!this.showing) this.open()

    // If the inventory is showing, turn it off.
    else this.close();
  }

  private open() {
    this.showing = true;
    this.inventoryBox.enabled = true;
    this.closeButton.enabled = true;
    stage.renderer.addZFilter(this.fadeFilter, 1, SpriteLocation.WORLD);

    // Now we can render the inventory
    rerenderInventory(this.items, this.inventory, this.config);

    // Set up a drag gesture for moving things within the inventory
    //
    // NB:  This takes the coords of the drop, and the inventory index of the
    //      dragged item
    itemDragGestures((x: number, y: number, fromLoc: { row: number, col: number }) => {
      // Find the inventory slot where we're doing a drop, make sure it's not
      // the initial actor
      for (let actor of stage.overlay!.physics!.actorsAt({ x, y })) {
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
      rerenderInventory(this.items, this.inventory, this.config);
    });
  }

  private close() {
    this.showing = false;
    this.fadeFilter.toggled = false;
    this.inventoryBox.enabled = false;
    this.closeButton.enabled = false;
    while (this.items.length > 0)
      this.items.shift()?.remove();
  }
}

/** Render an inventory (clears and re-renders when needed) */
function rerenderInventory(itemList: Actor[], inv: Inventory, cfg: InventoryConfig) {
  // Remove all of the inventory items' actors
  while (itemList.length > 0)
    itemList.shift()?.remove();

  // Render each inventory item and its tooltip, and put them into itemList
  for (let i = 0; i < inv.rows; i++) {
    for (let j = 0; j < inv.cols; j++) {
      let itemActors = itemRender(inv.items[i * inv.cols + j], cfg.itemWidth, cfg.itemHeight, cfg.xFix + (cfg.dx * j), cfg.yFix + (cfg.dy * i), true)
      itemList.push(itemActors.actor);
      if (itemActors.toolTipActor) itemList.push(itemActors.toolTipActor);
    }
  }
}


/**
 * Create an overlay to show a shelf
 *
 * [mfs] Do we really want an *overlay*?  Overlays stop the clock, which is
 *       probably not desirable.
 *
 * @param shelfChoice Which shelf to render in
 */
export function renderShelfInventory(shelfChoice: number) {
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
  let shelfInv = sStore.inventories.shelves[shelfChoice];
  let playerInv = sStore.inventories.player;

  // Don't open the inventory unless there's no other interaction, and the shelf
  // isn't cooling down
  if (!lInfo.overlayShowing && !shelfInv.onCooldown && !lInfo.playerInvState) {
    // Track all items in the inventory
    let itemList: Actor[] = [];

    // Immediately install the overlay, to pause the game
    stage.requestOverlay((overlay: Scene, screenshot: ImageSprite | undefined) => {
      // Track that it's showing
      lInfo.overlayShowing = true;

      // Draw the screenshot, put a fade filter on it to blur it a bit
      screenshot!.z = -2;
      new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }), });
      let fadeFilter = new FadingBlurFilter(0, 5, false);
      stage.renderer.addZFilter(fadeFilter, -2, SpriteLocation.OVERLAY);
      fadeFilter.toggled = true;

      // Image for the main inventory UI
      new Actor({
        appearance: new ImageSprite({ width: 11.34, height: 6.426, img: "MVPDemo/shelf.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 3.5, width: 16, height: 9 }, { scene: overlay }),
      });

      // Button for closing the inventory
      new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "MVPDemo/back.png" }),
        rigidBody: new BoxBody({ cx: 1.5, cy: .8, width: 1, height: 1 }, { scene: overlay }),
        gestures: { tap: () => { stage.clearOverlay(); lInfo.overlayShowing = false; fadeFilter.toggled = false; return true; } },
      });

      // The bag to drag stuff into
      let bag = new Actor({
        appearance: new ImageSprite({ width: 5, height: 5, img: "MVPDemo/bag.png" }),
        rigidBody: new BoxBody({ cx: 8, cy: 8, width: 16, height: 4 }, { scene: overlay, elasticity: 1 }),
        movement: new ManualMovement(),
        role: new Obstacle(),
      });

      // Now we can render the inventory
      let config = new InventoryConfig(3.5, 1, 1.8, 2, 1.3, 1.3);
      rerenderInventory(itemList, shelfInv, config);
      itemDragGestures((x: number, y: number, fromLoc: { row: number, col: number }) => {
        for (let actor of stage.overlay!.physics!.actorsAt({ x: x, y: y })) {
          // Handle swapping within the shelf, making sure not to swap with self
          if ((actor.extra instanceof ItemExtra) && fromLoc != actor.extra.item.location) {
            // NB: Must make copies of both locations
            let from = { ...fromLoc };
            let to = { ...actor.extra.item.location };
            let tempSwap = shelfInv.items[to.row * shelfInv.cols + to.col];
            shelfInv.removeAt({ row: to.row, col: to.col });
            shelfInv.addItem(shelfInv.items[from.row * shelfInv.cols + from.col], { row: to.row, col: to.col });
            shelfInv.removeAt({ row: from.row, col: from.col });
            shelfInv.addItem(tempSwap, { row: from.row, col: from.col });
            break;
          }
          // Handle dragging to the bag (moving into player's inventory)
          else if (actor == bag) {
            // Save the item and put it into the player's inventory
            let from = { ...fromLoc };
            let tempSwap = shelfInv.items[from.row * shelfInv.cols + from.col];
            if (playerInv.addItem(tempSwap)) {
              shelfInv.removeAt({ row: from.row, col: from.col });
              // Close the shelf if empty, and start cooling down
              if (shelfInv.count == 0) {
                lInfo.overlayShowing = false;
                shelfInv.onCooldown = true;
                stage.clearOverlay();
                stage.world.timer.addEvent(new TimedEvent(7.5, false, () => { shelfInv.onCooldown = false; fillShelvesPartial(shelfInv, false) }));
              }
              // Close the shelf if player inventory full
              else if (playerInv.count >= playerInv.capacity) {
                lInfo.overlayShowing = false;
                fadeFilter.toggled = false;
                stage.clearOverlay();
              }
              break;
            }
          }
        }
        rerenderInventory(itemList, shelfInv, config);
      });
    }, true);
  }

  // Hide the shelf inventory by clearing the overlay
  else if (lInfo.overlayShowing && !lInfo.playerInvState) {
    stage.clearOverlay();
    lInfo.overlayShowing = false;
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
    let pixels = stage.overlay!.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let world_coords = stage.overlay!.camera.screenToMeters(pixels.x, pixels.y);
    for (let actor of stage.overlay!.physics!.actorsAt(world_coords)) {
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
    let pixels = stage.overlay!.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let meters = stage.overlay!.camera.screenToMeters(pixels.x, pixels.y);
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
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.overlay }),
    gestures: { panStart, panMove, panStop }
  });
}
