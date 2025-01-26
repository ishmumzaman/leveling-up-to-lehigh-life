// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let hughyan_default = new Map<string, Conversation>([
    ["start", new Conversation("Ugh get away from me I don't feel like talking to you. People these days...", [
        new ConversationResponse("I like your hat", "really"),
        new ConversationResponse("That hurts my feelings :(", "really")
    ])],
    ["really", new Conversation("Wait really?? Aw I'm sorry I didn't mean to be mean to you. I'm just stressed cause of finals...", "sike")],
    ["sike", new Conversation("SIIIIIIKEEEE!! GET OUT OF MY FACE IDIOT!", [])]
]);

export let hughyan_hawks_nest = new Map<string, Conversation>([
    ["notFull", new Conversation("I thought I told you to get out of my face loser...", [
        new ConversationResponse("HELP ME PLEASE!!!", "help")
    ])],
    ["help", new Conversation("You don't even have that many items you can carry those yourself idiot. Come to me when you can't hold anymore.", [])],
    ["full", new Conversation("Wow that's impressive you can carry that much.", [
        new ConversationResponse("YES HELP ME PLEASE!!!", "fullNest")
    ])],
    ["fullNest", new Conversation("Fine, I'll help you out. Hand me a bag.", [])]
]);

export let hughyan_mm_cut_scene = new Map<string, Conversation>([
    ["start", new Conversation("This is everything I believe. Also, can I have a bag of chips?", [
        new ConversationResponse("Yea sure, take one", "goodbye")
    ], "Talk")],
    ["goodbye", new Conversation("Thank you so much! Take care!", [], "Nod")]
]);