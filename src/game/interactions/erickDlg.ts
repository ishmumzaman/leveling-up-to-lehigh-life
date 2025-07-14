import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue
export const erick_default = new Map<string, Conversation>([
    ["start", new Conversation("Did you already talk to your advisor?",[
        new ConversationResponse("Not yet", "end")
    ])],
    ["end", new Conversation("Well, what are you waiting for? Get going!",[])]
]);

// Busy dialogue for Erick when another quest is active
export const erick_busy = new Map<string, Conversation>([
    ["start", new Conversation("You look like you are a little busy now.", [
        new ConversationResponse("Yeah I am :(", "end")
    ])],
    ["end", new Conversation("Alright, come back when you are free and do not burn yourself out!", [])]
]);

// Busy dialogue for Erick when another quest is active
export const erick_quest_completed = new Map<string, Conversation>([
    ["start", new Conversation("I am glad you talked to your advisor bro!", [
        new ConversationResponse("I'm glad too!", "end")
    ])],
    ["end", new Conversation("I am always here if you need anything. You can always find me around campus. See ya!", [])]
]);

// Quest starter dialogue for Erick
export const erick_quest_starter = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! Have you visited your advisor yet? He can answer all your questions. Want to go now?", [
            new ConversationResponse("Yeah, lets go!", "accept", 1),
            new ConversationResponse("Maybe later.", "decline")
    ])],
    ["accept", new Conversation("Great! Talk to Sofia; she will show you the way.", [])],
    ["decline", new Conversation("No problem. Come find me when you are ready!", [])]
]);

export const erick_quest = new Map<string, Conversation>([
    ["start", new Conversation("Hey! You checked in with your advisor, right? How did it go?",[
        new ConversationResponse("I learned some great resources.", "resources"),
        new ConversationResponse("It was surprisingly personal.", "personal"),
        new ConversationResponse("I am not sure it helped.", "doubt")
    ])],
    ["resources", new Conversation("Nice! There are many great resources at Lehigh. This is only the first step.",[
        new ConversationResponse("I feel more confident now.", "end")
    ])],
    ["personal", new Conversation("That is the best part, advisors care about you, not just your schedule. Glad it felt genuine.",[
        new ConversationResponse("Yeah, it was humanizing.", "end")
    ])],
    ["doubt", new Conversation("Hey do not worry. At least now you know about a great support network.",[
        new ConversationResponse("That is true.", "end")
    ])],
    ["end", new Conversation("Keep me posted if you need anything else!",[])]
]);