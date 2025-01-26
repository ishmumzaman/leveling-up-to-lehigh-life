// Reviewed on 2024-09-27

import { Item, GameItems, ItemType, Items } from "../inventory/item";

/**
 * An inventory is just an array that can hold up to `capacity` Items.
 *
 * Note that it is visualized as having rows and columns, but they are not
 * fundamental to the Inventory object.
 */
export class Inventory {
  /**
   * An inventory that automatically restocks after some time can use this field
   * to track how long to wait before the restock happens.
   *
   * [mfs] If we were willing to show empty shelves, we wouldn't need this
   */
  public onCooldown = false;

  /** All of the items currently in the inventory */
  readonly items: Item[] = [];

  /** The capacity of the inventory */
  readonly capacity: number;

  /** The number of non-empty items in this inventory */
  public count = 0;

  /**
   * Create a new inventory
   * 
   * @param rows    number of rows that one can imagine the inventory having
   * @param cols    number of columns that one can imagine the inventory having
   * @param name    A name for the inventory
   * @param onEmpty code to run when the inventory is empty
   * @param onFull  code to run when the inventory is full
   */
  constructor(readonly rows: number, readonly cols: number, public onEmpty?: () => void, public onFull?: () => void) {
    // Fill the 2D array with empty items and set their location within the array
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.items[row * cols + col] = GameItems.getItem(Items.empty);
        this.items[row * cols + col].setLocation(row, col);
      }
    }
    // Set other parameters
    this.capacity = rows * cols;
  }

  /**
   * Increase the amount of items within the inventory. If this makes it full,
   * run onFull.
   */
  private incrementItemCount() {
    this.count++;
    if (this.count == this.capacity && this.onFull) this.onFull();
  }

  /**
   * Decrease the amount of items within the inventory. If this makes it empty,
   * run onEmpty.
   */
  private decrementItemCount() {
    this.count--;
    if (this.onEmpty && this.count == 0) this.onEmpty();
  }

  /** Report if the inventory is full */
  public isFull() { return this.count >= this.capacity; }

  /**
   * Adds an item to the first empty slot in the inventory.
   *
   * @param item  The item to be added.
   * @param slot  An optional parameter specifying where an item should go
   *              instead of putting it the first empty
   *
   * @returns True if the item is added, false otherwise.
   */
  public addItem(item: Item, slot?: { row: number, col: number }) {
    // You cannot add an empty item to slots
    if (item.type === ItemType.Empty)
      return false;

    if (slot) {
      if (this.items[slot.row * this.cols + slot.col].type === ItemType.Empty) { // Check if the slot is empty
        item.setLocation(slot.row, slot.col); // Change the item's meta location
        this.items[slot.row * this.cols + slot.col] = item; // set the slot to that item
        this.incrementItemCount(); // Increase how many items are in the inventory
        return true;
      }
      return false // If it is not empty
    }

    // Search for the first empty slot and put the item there.
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.items[i * this.cols + j].type === ItemType.Empty) {
          item.setLocation(i, j);
          this.items[i * this.cols + j] = item;
          this.incrementItemCount();
          return true;
        }
      }
    }
    return false; // If there is no slot
  }

  /**
   * Removes the first item from the inventory.
   *
   * @param item  The item to be removed.
   * @param inv   The inventory object.
   *
   * @returns True if the item is removed, false otherwise.
   */
  public removeFirst(item: Item): boolean {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // [mfs] Is a "name match" sufficient, or do we want more?
        if (this.items[i * this.cols + j].name === item.name) {
          this.items[i * this.cols + j] = GameItems.getItem(Items.empty);
          this.items[i * this.cols + j].setLocation(i, j);
          this.decrementItemCount();
          return true;
        }
      }
    }
    return false; // if the inventory is completely empty
  }

  /**
   * Given a row and a column, remove the item at that spot
   * 
   * @param slot  the row and column of the array
   * 
   * @returns true if removed, false otherwise
   */
  public removeAt(slot: { row: number, col: number }) {
    if (this.items[slot.row * this.cols + slot.col].type === ItemType.Empty)
      return undefined;

    // Sets the array slot to empty and updates the empty item's location
    let res = this.items[slot.row * this.cols + slot.col];
    this.items[slot.row * this.cols + slot.col] = GameItems.getItem(Items.empty);
    this.items[slot.row * this.cols + slot.col].setLocation(slot.row, slot.col);
    this.decrementItemCount();
    return res;
  }

  /**
   * Transfers as many items as possible from this inventory to another
   *
   * @param to  The target inventory to transfer items to.
   */
  public transferAll(to: Inventory) {
    for (let i = 0; i < this.items.length; ++i)
      if (this.items[i].type !== ItemType.Empty)
        if (to.addItem(this.items[i]))
          this.removeAt({ row: Math.floor(i / this.cols), col: i % this.cols });
  }
}

/**
 * Fill some slots of the shelves (about 30% of the slots on average) with items
 * @param areDrinks if the shelves are filled with drinks or not
 */
export function fillShelvesPartial(i: Inventory, areDrinks: boolean) {
  // Depending on the boolean, change use to either the drinks or food array
  let use = (areDrinks) ? GameItems.drinkTypes : GameItems.foodTypes;

  // Does a math.random() check for both if it should fill the slot with an item (30% chance)
  // and a check for what item it should use (6.66% per item)
  for (let row = 0; row < i.rows; row++) {
    for (let col = 0; col < i.cols; col++) {
      if (Math.random() > .7)
        i.addItem(GameItems.getItem(use[Math.floor(Math.random() * use.length)]), { row, col });
    }
  }
}
