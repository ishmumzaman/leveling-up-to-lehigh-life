import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue when maria is not part of a quest
export const maria_default = new Map<string, Conversation>([
    ["start", new Conversation("Welcome to Rathbone! Enjoy your stay and eat healthy!",[])]
]);

// Dialouge when player is busy with another quest
export const maria_busy = new Map<string, Conversation>([
    ["start", new Conversation("You look like you are a little busy now.", [
        new ConversationResponse("Yeah I am :(", "end")
    ])],
    ["end", new Conversation("Alright, come back when you are free and make sure to stay healthy!", [])]
]);

// dailogue to start the PerfectRathPlateQuest
export const maria_quest_starter = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! Welcome to the Rathbone dining hall! Do you wanna know a little secret?", [
        new ConversationResponse("Yeah!", "accept"),
        new ConversationResponse("Maybe later.", "decline")
    ])],
    ["accept", new Conversation("There is a little chalange going on called the Perfect Rathbone Plate Challange. Do you wanna participate?", [
        new ConversationResponse("Sure, I am in!", "quest", 1),
        new ConversationResponse("No thanks, I will pass.", "decline")
    ])],
    ["quest", new Conversation("Great! Talk to Casey; He will tell you more.", [])],
    ["decline", new Conversation("No problem. I will be here waiting for you when you want to.", [])]
]);
  
// Dialogue for maria throught the quest
export const maria_duringQuest = new Map<string, Conversation>([
    ["start", new Conversation("Hello again, how is the challange going so far?", [
        new ConversationResponse("Great! I am learning a lot", "well"),
        new ConversationResponse("Not the best", "notWell")
    ])],
    ["well", new Conversation("I am glad to hear that! There is definitly a lot to know about Rathbone. I am happy that you are learning along the way!", [
        new ConversationResponse("Me too!", "end")
    ])],
    ["notWell", new Conversation("Aww. Hey it is totally normal to feel overwhelmed. Try to tackle tha challange at your own pace. I believe you can do this!", [
        new ConversationResponse("Thank you ma'am", "end")
    ])],
    ["end", new Conversation("Keep going. You got this!", [])],
]);

// Dialogue after completing PerfectRathPlateQuest
export const maria_quest_completed = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! I heard you completed the Perfect Rathbone Plate Challange. I am proud of you!", [
        new ConversationResponse("Yeah it was fun!", "end"),
    ])],
    ["end", new Conversation("I am glad you enjoyed it. Make sure to eat well and stay healthy!", [])],
]);