// Reviewed on 2024-09-18

/**
 * All of the inspectables in the game.  We give each a name, for easy lookup
 */
export enum Inspectable {
    ASA_BUSH,
    ASA_CAR,
    ASA_BLOCKED,
    ASA_TREE,
    ASA_FLOWER,
    ASA_TRASH,
    MM_HALL_OTHER_DOORS,
    MM_DORM_CLOSET,
    MM_DORM_ROOMMATE_CLOSET,
    MM_DORM_BED,
    MM_DORM_BOXES,
    MM_DORM_TRASH,
    MM_STAIR_MAILBOX,
    MM_STAIR_BLOCKED,
    HAWK_ENTER_QUEST,
    HAWK_INVENTORY_FULL,
    HAWK_DONE_SHOPPING,
}

/**
 * Each inspectable's text will be stored like this.  Right now, there's just
 * one "text".  We'll change that to several, later, once we figure out voices.
 */
export class InspectableText {
    /**
     * Construct an inspectable by saving its (per-voice) text
     *
     * @param text The text to show for this inspectable
     */
    constructor(readonly text: string) { }
}

/**
 * Create a mapping of all the inspectables, for fast lookup.
 */
export function PrepareInspectables() {
    let m = new Map<Inspectable, InspectableText>();
    m.set(Inspectable.ASA_BUSH, new InspectableText("No thanks, I'd rather not get bitten by bugs."));
    m.set(Inspectable.ASA_CAR, new InspectableText("It would be very funny, say, if someone set the car alarm off with a rock or something. Hypothetically."));
    m.set(Inspectable.ASA_BLOCKED, new InspectableText("I don't think I'm allowed to go that way."));
    m.set(Inspectable.ASA_TREE, new InspectableText("https://maps.app.goo.gl/ufHad81MppPhM6hn8"));
    m.set(Inspectable.ASA_FLOWER, new InspectableText("These flowers look familiar..."));
    m.set(Inspectable.ASA_TRASH, new InspectableText("Smell like a Monday morning."));
    m.set(Inspectable.MM_HALL_OTHER_DOORS, new InspectableText("This isn't my room."));
    m.set(Inspectable.MM_DORM_CLOSET, new InspectableText("There are way too many mis-matched pairs of socks in here, but that's a future me problem."));
    m.set(Inspectable.MM_DORM_ROOMMATE_CLOSET, new InspectableText("I don't think it's wise to go through your mate's clo- is that my underwear?"));
    m.set(Inspectable.MM_DORM_BED, new InspectableText("Don't let the lack of asset variety deceive you; that bed is not made."));
    m.set(Inspectable.MM_DORM_BOXES, new InspectableText("I like to keep these boxes around for when I have to move out."));
    m.set(Inspectable.MM_DORM_TRASH, new InspectableText("I should take out the trash, but that's also a future me problem."));
    m.set(Inspectable.MM_STAIR_MAILBOX, new InspectableText("I don't have any mail right now."));
    m.set(Inspectable.MM_STAIR_BLOCKED, new InspectableText("I don't need to go that way."));
    m.set(Inspectable.HAWK_ENTER_QUEST, new InspectableText("I should probably go order something at one of the checkout machines."));
    m.set(Inspectable.HAWK_INVENTORY_FULL, new InspectableText("Oh no, I can't carry anything else! I need to ask someone for help."));
    m.set(Inspectable.HAWK_DONE_SHOPPING, new InspectableText("Alright guys I think that will be all for today. Lets head out"));
    return m;
}
