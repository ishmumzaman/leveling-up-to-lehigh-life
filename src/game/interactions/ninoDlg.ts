import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue for Nino npc
export const nino_default = new Map<string, Conversation>([
    ["start", new Conversation("Hey there again! I am so hungry but I realllyyyy love your outfit!",[
        new ConversationResponse("Thanks! I love your style too!", "end")])],
    ["end", new Conversation("Aww Thanks! I am just waiting for my food to be ready. Catch ya later!", [])]
]);

// Dialouge for first interaction with Nino
export const nino_first_interacion = new Map<string, Conversation>([
    ["start", new Conversation("I really like your outfit! I'm Nino, from Georgia. The country. Not the state. Do you like the food here?",[
        new ConversationResponse("Thanks! Yeah the food slaps!", "positive"),
        new ConversationResponse("Uhh... Georgia the country?", "confused"),
        new ConversationResponse("Don't talk to me.", "rude"),
    ])],
    ["positive", new Conversation("Ooooh, I knew you had good taste, both in fashion and food. So… how was your day?", [
        new ConversationResponse("It was great, thanks for asking!", "greatDay"),
        new ConversationResponse("Meh, mid.", "midDay"),
        new ConversationResponse("I barely survived.", "badDay")
    ])],
    ["greatDay", new Conversation("Yay! I am proud of you, stranger-friend. May your socks always stay dry.", [
        new ConversationResponse("Thank you!", "end")
    ])],
    ["midDay", new Conversation("I hope it gets better. If not… stage a musical number. That helps me.", [
        new ConversationResponse("I will try lol", "end")
    ])],
    ["badDay", new Conversation("Go try some Lehigh brownies ASAP! I recommend microwaving them. That's gotta make your day sweeter.", [
        new ConversationResponse("Will do Nino", "end")
    ])],
    ["confused", new Conversation("Between Europe and Asia. It's a real place, not a myth lol.", [
        new ConversationResponse("Sorry, I didn't know.", "sorry"),
        new ConversationResponse("Still doesn't sound real.", "notReal"),
        new ConversationResponse("Are you okay?", "okay?")
    ])],
    ["sorry", new Conversation("No worries! It's a common mistake. I get it all the time.", [
        new ConversationResponse("Thanks for understanding!", "end")
    ])],
    ["notReal", new Conversation("Are you real? Or are we just two dialogue boxes pretending we have free will?", [
        new ConversationResponse("Amm...", "end")
    ])],
    ["okay?", new Conversation("No. I'm stuck in this conversation loop forever. But at least you're cool'", [
        new ConversationResponse("What?...", "end")
    ])],
    ["rude", new Conversation("...K. \nJust know that by saying that, you've activated the Sad Universe. Everyone's soup is now slightly colder. Hope you're proud.", [])],
    ["end", new Conversation("Anyway, bon appétit!", [])]
]);