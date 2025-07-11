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

// Quest starter dialogue for Erick
export const erick_quest_starter = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! Have you stopped by your advisor's office yet? There is some helpful info waiting. Want to check it out now?", [
            new ConversationResponse("Yeah, lets go!", "accept", 1),
            new ConversationResponse("Maybe later.", "decline")
    ])],
    ["accept", new Conversation("Great! Talk to Sofia by the academic building entrance; she will show you the way.", [])],
    ["decline", new Conversation("No problem. Come find me when you’re ready!", [])]
]);

export const erick_quest = new Map<string, Conversation>([
    ["start", new Conversation("Hey! You checked in with your advisor, right? How did it go?",[
        new ConversationResponse("I learned about some great resources.", "resources"),
        new ConversationResponse("It was more personal than I expected.", "personal"),
        new ConversationResponse("I’m still not sure it helped.", "doubt")
    ])],
    ["resources", new Conversation("Nice! They have tutoring, counseling, and research opportunities. Definitely a good first step.",[
        new ConversationResponse("I feel more confident now.", "end")
    ])],
    ["personal", new Conversation("That’s the best part — advisors care about you, not just your schedule. Glad it felt genuine.",[
        new ConversationResponse("Yeah, it was humanizing.", "end")
    ])],
    ["doubt", new Conversation("Sometimes it takes a visit to see the support network. Give it some time and you can always follow up.",[
        new ConversationResponse("I’ll try again later.", "end")
    ])],
    ["end", new Conversation("Keep me posted if you need anything else!",[])]
]);