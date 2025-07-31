import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue when casey is not part of a quest
export const casey_default = new Map<string, Conversation>([
    ["start", new Conversation("Hey there, I am Casey!",[])]
]);
  
// Dialogue when the Rathbone quest begins (Objective 0)
export const casey_questObj0_start = new Map<string, Conversation>([
    ["start", new Conversation("Hey there, I am casey! What's up?", [
        new ConversationResponse("Tell me about the challange", "details"),
    ])],
    ["details", new Conversation("Oh!!! \nWho told you about it?! It was Maria wasn't it?", [
        new ConversationResponse("Yes...", "agree")
    ])],
    ["agree", new Conversation("I knew it! \nOh well. I promise to tell you more about the challange, but first I need you to do something.", [
        new ConversationResponse("What is it?", "more")
    ])],
    ["more", new Conversation("I need you to visit the 5 stations in Rathbone. You will find a person behind every station.", [
        new ConversationResponse("That sounds easy enough.", "end")
    ])],
    ["end", new Conversation("Alright bro! Meet me to the left of Stacks once you've finished them all", [])],
]);

// Dialogue when the player is mid objective 0
export const casey_questObj0_mid = new Map<string, Conversation>([
    ["start", new Conversation("Come on bro you got this! I am waiting for you to finish all 5 stations.", [])],
]);

// Dialogue for the Rathbone quest (Objective 1)
export const casey_questObj1_start = new Map<string, Conversation>([
    ["start", new Conversation("Hello again bro! You must be hungry after all of those stations you visited.", [
        new ConversationResponse("You bet I am!", "agree"),
    ])],
    ["agree", new Conversation("Alright I will tell you about the challange now", [
        new ConversationResponse("Yes please!", "more")
    ])],
    ["more", new Conversation("You need to fill up your plate with 4 food items, maximizing the taste and nutrition.", [
        new ConversationResponse("Oh!", "continue")
    ])],
    ["continue", new Conversation("I will then rate your plate and score it. Is everything clear?", [
        new ConversationResponse("Yes. Let's start!", "end"),
        new ConversationResponse("Can you repeat again", "repeat")
    ])],
    ["repeat", new Conversation("Sure! You just need to fill up your plate with 4 food items, maximizing the taste and nutrition.", [
        new ConversationResponse("Alright.", "continue")
    ])],
    ["end", new Conversation("Alright come talk to me after you finish making your plate from the 5 stations.", [])],
]);