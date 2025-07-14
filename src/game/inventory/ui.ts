// Reviewed on 2024-09-27

// [mfs]  There is probably some opportunity to share more code between the two
//        inventory render functions.  When we add another function (maybe for
//        the closet), we can revisit.

import { ImageSprite, BoxBody, CircleBody, FilledBox, Actor, stage, ManualMovement, Obstacle, TimedEvent } from "../../jetlag";
import { changePlayerAppearance } from "../characters/characterChange";
import { CharacterPart } from "../characters/characterCustomization";
import { ItemExtra, itemRender, ItemType } from "../inventory/item";
import { LevelInfo } from "../storage/level";
import { SessionInfo } from "../storage/session";
import { fillShelvesPartial, Inventory } from "./inventory";
import { startPlacementMode } from "./placement";

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
   * @param itemScaler Width of items
   */
  constructor(readonly xFix: number, readonly yFix: number, readonly dx: number, readonly dy: number, readonly itemScaler: number = 1) { }
}

/**
 * InventoryUI defines the structure for rendering inventories UI, specfically the player's and shelves' inventories.
 */
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
        let itm = inv.items[i * inv.cols + j];
        let itemActors = itemRender(itm, cfg.xFix + (cfg.dx * j), cfg.yFix + (cfg.dy * i), cfg.itemScaler, true);
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

  protected cfg: InventoryConfig = new InventoryConfig(5.15, 4.2, 1.139, 1.1);

  /* For every Item in the inventory, we put its actor here, so we can
  un-render and re-render them as needed */
  protected items: Actor[] = [];

  private outfit: Inventory;

  private accessory: Inventory;

  protected clothesCfg: InventoryConfig = new InventoryConfig(2.15, 4.2, 1.139, 1.1);

  protected clothes: Actor[] = [];

  /** All of the visual components of the UI */
  protected components: Actor[] = [];

  public canChangeOutfit: boolean = false;

  protected showing = false;

  /**
   * Temporarily hide the inventory UI components (for dragging visibility)
   * @param hide Whether to hide (true) or show (false) the components
   */
  public setComponentsVisible(hide: boolean) {
    for (let c of this.components)
      c.enabled = hide;
  }

  constructor() {
    super();
    // Get the inventory from the session storage
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

    this.inventory = sStore.inventories.player.main;
    this.outfit = sStore.inventories.player.outfit;
    this.accessory = sStore.inventories.player.accessory;

    // Image for the main inventory UI
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 8, height: 4, img: "overlay/inventory.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    }));

    // Button for closing the inventory, must go through the HUD
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 0.34, height: 0.34, img: "overlay/closeButton.png", z: 2 }),
      rigidBody: new CircleBody({ cx: 4.6, cy: 3, radius: .27 }, { scene: stage.hud }),
      gestures: { tap: () => { lInfo.hud!.toggleMode('inventory'); return true; } }
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
    this.rerenderClothes();

    // Set up a drag gesture for moving things within the inventory
    //
    // NB:  This takes the coords of the drop, and the inventory index of the
    //      dragged item
    itemDragGestures((x: number, y: number, fromLoc: { inv: Inventory | null, row: number, col: number }, draggedItem: Actor | undefined) => {
      // Check if we're dropping in the HUD (inventory swap) or outside (placement)
      let actorsAtDrop = stage.hud!.physics!.actorsAt({ x, y });
      let droppedInHud = false;
      
      // Find the inventory slot where we're doing a drop, make sure it's not
      // the initial actor
      for (let actor of actorsAtDrop) {
        if ((actor.extra instanceof ItemExtra) && fromLoc != actor.extra.item.location) {
          droppedInHud = true;
          // NB: Must make copies of both locations
          let from = { ...fromLoc };
          let to = { ...actor.extra.item.location };

          // Here is we swap any two items that were dropped on each other
          // The two items could be from the same inventory or different inventories, doesn't matter
          if (from.inv && to.inv) {
            let fromItem = from.inv.items[from.row * from.inv.cols + from.col].clone(); // The clone of the item that was dragged
            let toItem = actor.extra.item.clone() // The clone of the item that was dropped on

            // Don't allow the swap if the inventory doesn't accept it
            if (to.inv.onlyAccept && to.inv.onlyAccept != fromItem.type) break;
            if (from.inv.onlyAccept && from.inv.onlyAccept != toItem.type) break;

            // Special cases of not allowing the player to just take off their outfit without swapping it with another
            if (!this.canChangeOutfit && (from.inv === this.outfit || to.inv === this.outfit)) break;
            if (from.inv === this.outfit && toItem.type === ItemType.Empty) break;

            // Swap the items in the same inventory or different inventories
            to.inv.removeAt({ row: to.row, col: to.col });
            to.inv.addItem(fromItem, { row: to.row, col: to.col });
            from.inv.removeAt({ row: from.row, col: from.col });
            from.inv.addItem(toItem, { row: from.row, col: from.col });
            break;
          }
        }
      }
      
      // If we didn't drop in the HUD and have a valid item, start placement mode
      if (!droppedInHud && fromLoc.inv && draggedItem) {
        let item = fromLoc.inv.items[fromLoc.row * fromLoc.inv.cols + fromLoc.col];
        if (item.type !== ItemType.Empty && item.isPickupable) {
          // Remove from inventory
          fromLoc.inv.removeAt({ row: fromLoc.row, col: fromLoc.col });
          
          // Remove the dragged actor from HUD (much simpler now)
          draggedItem.remove();
          
          // Start placement mode using the refactored system
          startPlacementMode(item, fromLoc as { inv: Inventory, row: number, col: number });
          return;
        }
      }
      
      // NB:  Even a bad drop needs redrawing
      // This check prevents the visual bug when the inventory is closed during item dragging
      if (this.showing) { this.rerenderInventory(); this.rerenderClothes(); }
    });
  }

  private rerenderClothes() {
    // Before disabling the items' actor, process their clothing texture info
    // If new textures are detected, update the player's appearance
    while (this.clothes.length > 0)
      this.clothes.shift()?.remove();

    let newAccessory: CharacterPart | undefined;
    let newOutfit: CharacterPart | undefined;

    if (this.accessory.items[0].type !== ItemType.Empty) newAccessory = this.accessory.items[0].charPart;
    if (this.outfit.items[0].type !== ItemType.Empty) newOutfit = this.outfit.items[0].charPart;
    // Detect new clothes and update the player's appearance
    changePlayerAppearance(undefined, newAccessory, newOutfit); // Update the player's appearance

    // Render each inventory item and its tooltip, and put them into clothes[]
    let cfg = this.clothesCfg; //alias
    let a = itemRender(this.accessory.items[0], cfg.xFix, cfg.yFix, this.clothesCfg.itemScaler, true);
    let o = itemRender(this.outfit.items[0], cfg.xFix, cfg.yFix + cfg.dy, this.clothesCfg.itemScaler, true);

    this.clothes.push(a.actor);
    this.clothes.push(o.actor);

    if (a.toolTipActor) this.clothes.push(a.toolTipActor);
    if (o.toolTipActor) this.clothes.push(o.toolTipActor);


  }

  protected close() {
    this.showing = false;
    for (let c of this.components)
      c.enabled = false;

    while (this.items.length > 0)
      this.items.shift()?.remove();
    while (this.clothes.length > 0)
      this.clothes.shift()?.remove();
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

  protected cfg: InventoryConfig = new InventoryConfig(3.5, 1, 1.8, 2, 1.3);

  protected items: Actor[] = [];

  protected components: Actor[] = [];

  protected showing = false;

  private bag: Actor;

  constructor(shelfChoice: number) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    super();

    this.inventory = sStore.inventories.shelves[shelfChoice];
    this.playerInv = sStore.inventories.player.main;

    // Image for the main inventory UI
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 11.34, height: 6.426, img: "MVPDemo/shelf.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 3.5, width: 16, height: 9 }, { scene: stage.hud }),
    }));

    // Button for closing the inventory, must go through the HUD
    this.components.push(new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "MVPDemo/back.png" }),
      rigidBody: new BoxBody({ cx: 1.5, cy: .8, width: 1, height: 1 }, { scene: stage.hud }),
      gestures: { tap: () => { lInfo.hud?.toggleMode("otherContainer", this); return true; } },
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
    itemDragGestures((x: number, y: number, fromLoc: { inv: Inventory | null, row: number, col: number }, draggedItem: Actor | undefined) => {
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
              lInfo.hud?.toggleMode("otherContainer", this);
              this.inventory.onCooldown = true;
              stage.world.timer.addEvent(new TimedEvent(7.5, false, () => { this.inventory.onCooldown = false; fillShelvesPartial(this.inventory, false) }));
            }
            // Close the shelf if player inventory full
            else if (this.playerInv.count >= this.playerInv.capacity) {
              lInfo.hud?.toggleMode("otherContainer", this);
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
function itemDragGestures(onDrop: (x: number, y: number, fromLoc: { inv: Inventory | null, row: number, col: number }, draggedItem: Actor | undefined) => void) {
  // the actor being dragged
  let foundActor: Actor | undefined;

  // Get reference to the inventory UI for hiding during drag
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
  let inventoryUI = lInfo.hud?.inventory;
  
  // Track if we're dragging for placement (outside HUD)
  let isDraggingForPlacement = false;

  // Starting the pan leads to identifying an actor, if there is one
  let panStart = (_: Actor, hudCoords: { x: number; y: number }) => {
    let pixels = stage.hud!.camera.metersToScreen(hudCoords.x, hudCoords.y);
    let world_coords = stage.hud!.camera.screenToMeters(pixels.x, pixels.y);
    for (let actor of stage.hud!.physics!.actorsAt(world_coords)) {
      if ((actor.extra instanceof ItemExtra) && actor.extra.item.draggable) {
        foundActor = actor;
        foundActor.appearance[0].z = 2; // bring the item being dragged to the front
        console.log("Dragging:", actor.extra.item.name)
        
        // Close the inventory properly to remove blur and free up screen space
        // Do NOT set showing=false manually - let toggleMode handle it properly
        if (lInfo.hud?.getMode() === 'inventory') {
          lInfo.hud.toggleMode('inventory');
        }
        
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
    
    // Check if we're dragging outside the HUD area (for potential placement)
    let actorsUnderCursor = stage.hud!.physics!.actorsAt(meters);
    isDraggingForPlacement = true; // Assume placement unless we find inventory slots
    for (let actor of actorsUnderCursor) {
      if ((actor.extra instanceof ItemExtra) && actor !== foundActor) {
        isDraggingForPlacement = false; // Dragging over another inventory slot
        break;
      }
    }
    
    return true;
  };

  // Letting go calls onDrop
  let panStop = () => {
    if (!foundActor) return false;
    
    // Store reference before calling onDrop
    let tempActor = foundActor;
    let dropLocation = foundActor.rigidBody.getCenter();
    let itemLocation = (foundActor.extra as ItemExtra).item.location;
    
    // Reset z-index of the dragged item
    if (foundActor.appearance && foundActor.appearance[0]) {
      foundActor.appearance[0].z = 0;
    }
    
    // Check if this is actually a placement (dropping outside inventory slots)
    let isPlacement = isDraggingForPlacement;
    if (isPlacement && itemLocation.inv) {
      let item = itemLocation.inv.items[itemLocation.row * itemLocation.inv.cols + itemLocation.col];
      isPlacement = item.type !== ItemType.Empty && item.isPickupable;
    }
    
    // Reset state
    foundActor = undefined;
    isDraggingForPlacement = false;
    
    // Call onDrop with stored values
    onDrop(dropLocation.x, dropLocation.y, itemLocation, tempActor);
    
    // If this was NOT a placement (item swap), reopen inventory
    if (!isPlacement && lInfo.hud?.getMode() === 'none') {
      setTimeout(() => {
        if (lInfo.hud?.getMode() === 'none') {
          lInfo.hud.toggleMode('inventory');
        }
      }, 50);
    }
    
    return true;
  };

  // Now we can cover the HUD with a button that handles the pan gestures
  new Actor({
    appearance: new FilledBox({ width: 0, height: 0, fillColor: "#00000000", z: 2 }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
    gestures: { panStart, panMove, panStop }
  });
}
