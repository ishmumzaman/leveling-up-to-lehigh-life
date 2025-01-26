// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let alyssa_default = new Map<string, Conversation>([
    ["start", new Conversation("Yo", [
        new ConversationResponse("Yo", "yo")
    ])],
    ["yo", new Conversation("Hey", [
        new ConversationResponse("Hey there", "yo1")
    ])],
    ["yo1", new Conversation("What's up", [
        new ConversationResponse("What's up", "yo2")
    ])],
    ["yo2", new Conversation("Hi", [
        new ConversationResponse("Okay dude what do you want.", "okay")
    ])],
    ["okay", new Conversation("What do you mean what do I want? You walked up to me bro. I'm literally just waiting for my order.", [
        new ConversationResponse("you right my bad", "myB")
    ])],
    ["myB", new Conversation("You're good bro.", [])]
]);

export let alyssa_hawks_nest = new Map<string, Conversation>([
    ["notFull", new Conversation("Yo", [
        new ConversationResponse("Yo", "yo")
    ])],
    ["yo", new Conversation("Yo", [
        new ConversationResponse("We're not doing this again. HELP!", "help")
    ])],
    ["help", new Conversation("Dude you don't even need help you're good. You can carry more.", [])],
    ["full", new Conversation("Oh dang alright I can help you with your items if you need.", [
        new ConversationResponse("Take my bags bro", "fullNest")
    ])],
    ["fullNest", new Conversation("Gotchu.", [])]
]);

export let alyssa_mm_cut_scene = new Map<string, Conversation>([
    ["start", new Conversation("Here you go. Also, can I have a bag of chips?", [
        new ConversationResponse("no.", "denied")
    ], "Talk")],
    ["denied", new Conversation("Please? I mean, you have plenty.", [
        new ConversationResponse("no.", "goodbye")
    ], "Talk")],
    ["goodbye", new Conversation("Oh, okay my bad. I'll just go hungry then.", [], "Shake")]
]);