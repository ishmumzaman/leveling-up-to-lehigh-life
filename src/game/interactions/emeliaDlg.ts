// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let emelia_default = new Map<string, Conversation>([
    ["start", new Conversation("Hi there! How's your day going?", [
        new ConversationResponse("I'm doing great! How are you??", "great"),
        new ConversationResponse("I'm so stressed about finals :(", "finals")
    ])],
    ["great", new Conversation("Aw that's great to hear! Good luck on finals!", [
        new ConversationResponse("Thanks!", "thanks")
    ])],
    ["finals", new Conversation("Don't worry you'll do great! Just study hard and it will pay off.", [
        new ConversationResponse("Thanks!", "thanks")
    ])],
    ["thanks", new Conversation("No problem! I'll see you later!", [])]
]);

export let emelia_hawks_nest = new Map<string, Conversation>([
    ["notFull", new Conversation("Hey! I don't think you need help right now. You can still carry more stuff!", [])],
    ["full", new Conversation("Oh wow that's a lot of items. I can carry those for you if you'd like?", [
        new ConversationResponse("YES PLEASE!!", "fullNest")
    ])],
    ["fullNest", new Conversation("Of course! Here hand me your bags-", [])]
]);

export let emelia_mm_cut_scene = new Map<string, Conversation>([
    ["start", new Conversation("Here's all of your stuff.", [
        new ConversationResponse("Appreciate it.", "goodbye")
    ], "Talk")],
    ["goodbye", new Conversation("See you around.", [], "Talk")]
]);