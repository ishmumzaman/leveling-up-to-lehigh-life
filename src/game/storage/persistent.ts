// Reviewed on 2024-09-18

// [mfs]  It looks like persistent storage is not yet in use, so I'm disabling
//        it for now.

// import { stage } from "../../jetlag/Stage";

/**
 * The pStore class (short for persistent storage) stores all relevant data that needs to be remembered by the game across game sessions.
 * This include player stats, inventory items, ...
 */
// export class PStore {
//     private static num_times_played = 0;
//     last_played = new Date().toUTCString();
// }

/**
 * Saves/updates the current persistent storage
 * @param p current pStore
 * @param key String key of pStore
 */
// export function persist(p: PStore, key: string) {
//     stage.storage.setPersistent(key, JSON.stringify(p));
// }