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
    ["details", new Conversation("Oh!!! \nWho told you about it?! \nIt was Maria wasn't it?", [
        new ConversationResponse("Yes...", "agree")
    ])],
    ["agree", new Conversation("I knew it! \nOh well. I promise to tell you more about the challange, but first I need you to do something.", [
        new ConversationResponse("What is it?", "more")
    ])],
    ["more", new Conversation("I need you to visit the 5 stations in Rathbone. You will find a person behind every station.", [
        new ConversationResponse("That sounds easy enough.", "end")
    ])],
    ["end", new Conversation("Alright bro! Come back once you've finished them all", [])],
]);

// Dialogue when the player is mid objective 0
export const casey_questObj0_mid = new Map<string, Conversation>([
    ["start", new Conversation("Come on bro you got this! I am waiting for you to finish all 5 stations.", [])],
]);

// Dialogue after completing the advisor check-in (Objective 2 completed)
export const casey_postAdvisor = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! I saw you coming out of the advisor's office, how did it go?", [
        new ConversationResponse("It was super helpful!", "positive"),
        new ConversationResponse("I have more questions than before.", "followup")
    ])],
    ["positive", new Conversation("That's fantastic! Advisors are really great to learn about support resources.", [ 
        new ConversationResponse("I feel so much more confident.", "end") 
    ])],
    ["followup", new Conversation("Don't worry, that's totally normal. You can always drop by again or send an email anytime.", [ 
        new ConversationResponse("I will do that. Thanks!", "end") 
    ])],
    ["end", new Conversation("Glad to hear. Let me know if you need a study buddy or just want to chat again.", [])]
]);