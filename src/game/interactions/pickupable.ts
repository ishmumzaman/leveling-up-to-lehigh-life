import { Actor, ImageSprite, CircleBody, BoxBody, TextSprite, stage, Obstacle } from "../../jetlag";
import { Extra } from "../../jetlag/Entities/Actor";
import { Item, ItemType } from "../inventory/item";
import { SessionInfo } from "../storage/session";
import { LevelInfo } from "../storage/level";
import { Spawner } from "../common/spawner";

/** Extra data for pickupable objects in the world */
export class PickupableExtra extends Extra {
  public spawner: Spawner;
  
  constructor(public item: Item, spawner: Spawner) { 
    super();
    this.spawner = spawner;
  }
}

/** Configuration for pickupable objects */
export interface PickupableConfig {
  item: Item;
  x: number;
  y: number;
  useCircleBody?: boolean;
  showIndicator?: boolean;
}

/**
 * Create a pickupable object in the world using the existing Spawner system (same as NPCs/doors)
 * @param config Configuration for the pickupable object
 * @returns The created actor
 */
export function createPickupableObject(config: PickupableConfig): Actor {
  let { item, x, y, useCircleBody = true, showIndicator = true } = config;
  
  // Mark the item as pickupable and set its world position
  item.isPickupable = true;
  item.worldPosition = { x, y };

  // Create the pickup function for the Spawner
  let pickupFunction = () => {
    return pickupObject(actor);
  };

  // Create a Spawner (same system NPCs and doors use)
  let spawner = new Spawner(x, y, 0.6, 0.6, pickupFunction);

  // Create the main pickupable actor as a proper obstacle (blocks movement, no collision pickup)
  let actor = new Actor({
    appearance: new ImageSprite({ 
      width: item.cfg.w, 
      height: item.cfg.h, 
      img: item.img,
      offset: { dx: item.cfg.ox, dy: item.cfg.oy }
    }),
    rigidBody: useCircleBody 
      ? new CircleBody({ cx: x, cy: y, radius: 0.4 }, { 
          scene: stage.world, 
          collisionsEnabled: true,
          disableRotation: true,
          density: 1000,  // Make it a solid obstacle
          friction: 1.0,
          elasticity: 0
        })
      : new BoxBody({ cx: x, cy: y, width: item.cfg.w, height: item.cfg.h }, { 
          scene: stage.world, 
          collisionsEnabled: true,
          disableRotation: true,
          density: 1000,  // Make it a solid obstacle
          friction: 1.0,
          elasticity: 0
        }),
    role: new Obstacle(),  // Proper obstacle that blocks movement
    extra: new PickupableExtra(item, spawner)
  });

  return actor;
}

/**
 * Pick up an object from the world and add it to inventory
 * @param actor The actor to pick up
 * @returns True if pickup successful, false otherwise
 */
function pickupObject(actor: Actor): boolean {
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
  
  if (!(actor.extra instanceof PickupableExtra)) return false;
  
  let item = actor.extra.item;
  let inventory = sStore.inventories.player.main;
  
  // Check if inventory has space
  if (inventory.isFull()) {
    console.log("Inventory is full!");
    return false;
  }
  
  // Add item to inventory
  if (inventory.addItem(item.clone())) {
    // Remove from placed objects tracking if this was a placed object
    if (sStore.placedObjects && item.worldPosition) {
      let currentRoom = getCurrentRoomId();
      
      sStore.placedObjects = sStore.placedObjects.filter(placedObj => 
        !(Math.abs(placedObj.x - item.worldPosition!.x) < 0.1 && 
          Math.abs(placedObj.y - item.worldPosition!.y) < 0.1 &&
          placedObj.room === currentRoom)
      );
      
      console.log(`Removed object from ${currentRoom} placed objects tracking`);
    }
    
    // Clean up the spawner completely - both sensor and obstacle
    actor.extra.spawner.sensorOff();  // Disable sensor and clear Q interaction
    actor.extra.spawner.obstacle.remove();  // Remove the obstacle (green box)
    actor.extra.spawner.sensor.remove();    // Remove the sensor completely
    
    // Play pickup sound if available
    if (actor.sounds?.disappear) {
      actor.sounds.disappear.play();
    }
    
    // Remove the main actor (the visual object)
    actor.remove();
    
    return true;
  }
  
  return false;
}

/**
 * Get the current room identifier from the stage
 * @returns The current room/level identifier
 */
function getCurrentRoomId(): string {
  const lvl: any = stage.storage.getLevel("levelInfo");
  if (lvl && lvl.roomId) return lvl.roomId;
  const currentBuilder = (stage as any).currentBuilder;
  if (currentBuilder && currentBuilder.builderName) return currentBuilder.builderName;
  return "unknown_room";
}

/**
 * Load previously placed objects when entering a scene
 */
export function loadPlacedObjects(roomIdOverride?: string) {
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  
  if (!sStore.placedObjects) return;
  
  let currentRoom = roomIdOverride ?? getCurrentRoomId();
  console.log(`Loading placed objects for room: ${currentRoom}`);
  
  // Filter objects to only load ones placed in the current room
  let roomObjects = sStore.placedObjects.filter(placedObj => 
    placedObj.room === currentRoom
  );
  
  console.log(`Found ${roomObjects.length} objects for room ${currentRoom}`);
  
  // Recreate each placed object for this room
  for (let placedObj of roomObjects) {
    // Find the item definition by name
    let item: Item;
    try {
      // Import here to avoid circular dependencies
      let { GameItems, Items } = require("../inventory/item");
      
      let itemKey = Object.keys(Items).find(key => 
        isNaN(Number(key)) && Items[key as keyof typeof Items] && 
        GameItems.getItem(Items[key as keyof typeof Items]).name === placedObj.item
      );
      
      if (itemKey) {
        item = GameItems.getItem(Items[itemKey as keyof typeof Items]);
      } else {
        item = GameItems.getItem(Items.plate);
      }
    } catch (error) {
      let { GameItems, Items } = require("../inventory/item");
      item = GameItems.getItem(Items.plate);
    }
    
    console.log(`Loading ${item.name} at (${placedObj.x}, ${placedObj.y}) in room ${currentRoom}`);
    
    createPickupableObject({
      item,
      x: placedObj.x,
      y: placedObj.y,
      showIndicator: true
    });
  }
} 