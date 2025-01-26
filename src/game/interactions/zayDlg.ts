// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let zay_default = new Map<string, Conversation>([
    ["start", new Conversation("I need to study for finals now and my order is taking longer than usual. Oh my god I'm so stressed. What am I gonna do?!??! I might fail chem!", [
        new ConversationResponse("You'll be fine don't worry", "fine")
    ])],
    ["fine", new Conversation("W-wait really?!?!?! Did you do good on it?", [
        new ConversationResponse("Nah bro I failed you're cooked", "cooked0"),
        new ConversationResponse("Yes, you'll do fine I promise!", "promise")
    ])],
    ["cooked0", new Conversation("Oh no, oh no, oh no! You think I'm cooked for the final? I mean, I kind of knew it deep down, but hearing it out loud, it's just... oh no!", "cooked1", "Shake", true)],
    ["cooked1", new Conversation("What am I going to do? I can't fail this! My parents will flip, and I'll lose my scholarship, and then what? I'll have to drop out and get a job, but who hires someone who can't even pass a chemistry final?",
        "cooked2", "Shake", true)],
    ["cooked2", new Conversation("Maybe if I pull an all-nighter, I can cram everything in. But wait, they say lack of sleep affects memory, right? So maybe that's a bad idea. But then what if I don't study enough?",
        "cooked3", "Shake", true)],
    ["cooked3", new Conversation("Okay, okay, deep breaths, deep breaths. I need to calm down.", [])],
    ["promise", new Conversation("Wow thank you so much. I feel a lot better now!", [])]
]);

export let zay_hawks_nest = new Map<string, Conversation>([
    ["notFull", new Conversation("H-hi what do you need?", [
        new ConversationResponse("HELP ME I BEG!!", "help")
    ])],
    ["help", new Conversation("I-I can't help you right now I'm too busy stressing about chemistry. If you can't hold anymore I can help you.", [])],
    ["full", new Conversation("O-oh my gosh that is a lot of items! I'm not that strong but I can take a bag off you if you'd like.", [
        new ConversationResponse("YES HELP ME PLEASE!!!", "fullNest")
    ])],
    ["fullNest", new Conversation("A-Alright but if I fail this chemistry test it's on you.", [])]
]);

export let zay_mm_cut_sceen = new Map<string, Conversation>([
    ["start", new Conversation("I don't know how you are going to finish allat but here you go.", [
        new ConversationResponse("Don't worry, I have help.", "goodbye")
    ], "Talk")],
    ["goodbye", new Conversation("Yeah, good luck. Catch you later.", [], "Talk")]
]);