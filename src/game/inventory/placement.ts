import { Actor, ImageSprite, BoxBody, stage, CircleBody, KeyCodes, FilledBox } from "../../jetlag";
import { Item } from "./item";
import { Inventory } from "./inventory";
import { LevelInfo } from "../storage/level";
import { SessionInfo } from "../storage/session";
import { createPickupableObject } from "../interactions/pickupable";
import { isWithinRange } from "../common/helpers";

/** Maximum range for placing objects from player position */
const PLACEMENT_RANGE = 30.0;

/** Current placement state */
let placementState: {
  preview: Actor | null;
  item: Item | null;
  fromInventory: { inv: Inventory, row: number, col: number } | null;
  active: boolean;
  overlay: Actor | null;
} = {
  preview: null,
  item: null,
  fromInventory: null,
  active: false,
  overlay: null
};

/**
 * Get the current room identifier from the stage
 * @returns The current room/level identifier
 */
function getCurrentRoomId(): string {
  // [Ishmum Zaman] Each builder now stamps its own unique `roomId` on the LevelInfo object.
  //                 Checking this first guarantees we know which room we are *currently*
  //                 in even before JetLag updates its internal `currentBuilder` pointer.
  //                  I did this because objects transferred over to other rooms if placed in the initial room
  //                  This way we can track on what room the object is placed and save it.
  const lvl: any = stage.storage.getLevel("levelInfo");
  if (lvl && lvl.roomId) return lvl.roomId;
  const currentBuilder = (stage as any).currentBuilder;
  if (currentBuilder && currentBuilder.builderName) return currentBuilder.builderName;
  return "unknown_room";
}

/**
 * Start placement mode for an item
 * @param item The item to place
 * @param fromInventory The inventory location the item came from
 */
export function startPlacementMode(item: Item, fromInventory: { inv: Inventory, row: number, col: number }) {
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
  
  // Close inventory UI
  if (lInfo.hud!.getMode() === 'inventory') {
    lInfo.hud!.toggleMode('inventory');
  }
  
  // Set up placement state
  placementState.item = item;
  placementState.fromInventory = fromInventory;
  placementState.active = true;
  
  // Create placement preview and controls
  createPlacementPreview(item);
  setupPlacementControls(item, fromInventory);
}

/**
 * Create a placement preview
 * @param item The item to preview
 */
function createPlacementPreview(item: Item) {
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
  let playerPos = lInfo.mainCharacter!.rigidBody.getCenter();
  
  // Create preview actor at player position initially
  placementState.preview = new Actor({
    appearance: new ImageSprite({ 
      width: item.cfg.w, 
      height: item.cfg.h, 
      img: item.img,
      offset: { dx: item.cfg.ox, dy: item.cfg.oy }
    }),
    rigidBody: new CircleBody({ 
      cx: playerPos.x, 
      cy: playerPos.y, 
      radius: 0.1
    }, { scene: stage.world, collisionsEnabled: false })
  });
  
  // Set initial appearance
  (placementState.preview.appearance[0] as any).alpha = 0.5;
}

/**
 * Set up mouse controls for placement
 * @param item The item being placed
 * @param fromInventory The inventory location the item came from
 */
function setupPlacementControls(item: Item, fromInventory: { inv: Inventory, row: number, col: number }) {
  const lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

  // Overlay actor that captures gestures over the full screen (HUD scene)
  placementState.overlay = new Actor({
    appearance: new FilledBox({ width: 0, height: 0, fillColor: "#00000000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud, collisionsEnabled: false }),
    gestures: {
      // Moving the pointer updates the preview location
      panMove: (_: Actor, hudCoords: { x: number; y: number }) => {
        if (!placementState.preview || !placementState.active) return false;

        const pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
        const worldCoords = stage.world.camera.screenToMeters(pixels.x, pixels.y);

        // Update player position (might have moved)
        const currentPlayerPos = lInfo.mainCharacter!.rigidBody.getCenter();

        const inRange = isWithinRange(currentPlayerPos.x, currentPlayerPos.y, worldCoords.x, worldCoords.y, PLACEMENT_RANGE);
        const validPlacement = inRange && isValidPlacement(worldCoords, currentPlayerPos);

        placementState.preview.rigidBody.setCenter(worldCoords.x, worldCoords.y);
        (placementState.preview.appearance[0] as any).alpha = validPlacement ? 0.8 : 0.3;

        return true;
      },

      // On tap (mouse click / touch up), attempt to place
      tap: (_: Actor, hudCoords: { x: number; y: number }) => {
        if (!placementState.active) return false;

        const pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
        const worldCoords = stage.world.camera.screenToMeters(pixels.x, pixels.y);

        const currentPlayerPos = lInfo.mainCharacter!.rigidBody.getCenter();

        if (!isValidPlacement(worldCoords, currentPlayerPos)) {
          cancelPlacement();
          return true;
        }

        placeObject(item, worldCoords);
        endPlacementMode();
        return true;
      }
    }
  });

  // ESC key cancels placement
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_ESCAPE, () => cancelPlacement());
}

/**
 * Check if placement position is valid
 * @param worldCoords The world coordinates to place at
 * @param playerPos The player's current position
 * @returns True if placement is valid
 */
function isValidPlacement(worldCoords: { x: number, y: number }, playerPos: { x: number, y: number }): boolean {
  // Check range
  if (!isWithinRange(playerPos.x, playerPos.y, worldCoords.x, worldCoords.y, PLACEMENT_RANGE)) {
    return false;
  }
  
  // [Ishmum Zaman] Ensure the placement location is within the map rectangle
  const lInfo = stage.storage.getLevel("levelInfo") as any;
  if (lInfo.mapBounds) {
    const { width, height } = lInfo.mapBounds;
    if (worldCoords.x < 0 || worldCoords.y < 0 || worldCoords.x > width || worldCoords.y > height)
      return false;
  }
  
  // Use JetLag's built-in collision detection
  let actors = stage.world.physics!.actorsAt(worldCoords);
  for (let actor of actors) {
    // Skip the preview itself and the player
    if (actor === placementState.preview) continue;
    if (actor === (stage.storage.getLevel("levelInfo") as LevelInfo).mainCharacter) continue;
    
    // Allow placement if there are no solid obstacles
    if (actor.rigidBody && actor.role && (actor.role as any).type === "obstacle") {
      let hasCollisions = true;
      for (let f = actor.rigidBody.body.GetFixtureList(); f; f = f.GetNext()) {
        if (f.IsSensor()) {
          hasCollisions = false;
          break;
        }
      }
      if (hasCollisions) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Place an object in the world
 * @param item The item to place
 * @param worldCoords The coordinates to place at
 */
function placeObject(item: Item, worldCoords: { x: number, y: number }) {
  console.log(`Creating pickupable object for ${item.name} at ${worldCoords.x}, ${worldCoords.y}`);
  
  // Create the pickupable object using the refactored system
  createPickupableObject({
    item: item.clone(),
    x: worldCoords.x,
    y: worldCoords.y,
    useCircleBody: true,
    showIndicator: true
  });
  
  // Store placed object in session for persistence
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  
  if (!sStore.placedObjects) {
    sStore.placedObjects = [];
  }
  
  let currentRoom = getCurrentRoomId();
  
  sStore.placedObjects.push({
    item: item.name,
    x: worldCoords.x,
    y: worldCoords.y,
    room: currentRoom
  });
  
  console.log(`Object placement completed in room: ${currentRoom}`);
}

/**
 * Cancel placement and return item to inventory
 */
function cancelPlacement() {
  if (placementState.item && placementState.fromInventory) {
    // Return item to inventory
    placementState.fromInventory.inv.addItem(placementState.item, { 
      row: placementState.fromInventory.row, 
      col: placementState.fromInventory.col 
    });
  }
  
  // Clean up and reopen inventory
  endPlacementMode();
  
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
  lInfo.hud!.toggleMode('inventory');
}

/**
 * Clean up placement mode
 */
function endPlacementMode() {
  // Remove overlay actor if present
  if (placementState.overlay) {
    placementState.overlay.remove();
    placementState.overlay = null;
  }

  // Remove ESC handler
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_ESCAPE, () => {});

  // Remove preview actor
  if (placementState.preview) {
    placementState.preview.remove();
    placementState.preview = null;
  }

  // Reset state
  placementState.item = null;
  placementState.fromInventory = null;
  placementState.active = false;
}

// Remove the duplicate loadPlacedObjects implementation and re-export the definitive version
export { loadPlacedObjects } from "../interactions/pickupable"; 