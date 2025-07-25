import { Conversation, ConversationResponse } from "./conversation";

// Dialogue for Rathbone's GLOBOWL station
export const GLOBOWL_default = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to GLOBOWL!",[])]
]);

export const GLOBOWL_quest = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to GLOBOWL. We serve halal meals and global flavors made with care. On the sides you will find TWISTS for pasta and SLICES for pizza.",[])]
]);
  

// Dialogue for Rathbone's DINER station
export const DINER_default = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to the DINER!",[])]
]);

export const DINER_quest = new Map<string, Conversation>([
    ["start", new Conversation("Hey hey. This is the DINER. Start your day or end it right. In the morning we serve eggs made your way, omelets, and classic sides like hashbrowns and sausage. Later on we flip burgers, toast hotdogs, and keep the fries coming.",[])]
]);


// Dialogue for Rathbone's SIMPLE SERVINGS station
export const SIMPLE_SERVINGS_default = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to SIMPLE SERVINGS!",[])]
]);

export const SIMPLE_SERVINGS_quest = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to SIMPLE SERVINGS! Everything here is made with food allergies in mind. We avoid common allergens and cross contact so everyone can eat safely.",[])]
]);


// Dialogue for Rathbone's VEG OUT station
export const VEG_OUT_default = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to VEG OUT!",[])]
]);

export const VEG_OUT_quest = new Map<string, Conversation>([
    ["start", new Conversation("Hey there. This is VEG OUT. Everything here is vegetarian and full of flavor. We use fresh ingredients to make veggie-based meals feel exciting.",[])]
]);

// Dialogue for Rathbone's STACKS station
export const STACKS_default = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to STACKS!",[])]
]);

export const STACKS_quest = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to STACKS. This is where we build sandwiches and wraps your way. Pick your bread, your fillings, and your flavor. We got it all.",[])]
]);


// Default dialogue for Rathbone's stations after they are visited in objective 0
export const station_visited = new Map<string, Conversation>([
    ["start", new Conversation("Already visited this station! Make sure to find the other stations!",[])]
]);