import {
  stage, AnimationSequence, AnimationState, Sides,
  FilledBox, ImageSprite, TextSprite, ManualMovement,
  ProjectileMovement, BoxBody, CircleBody, Hero, Obstacle,
  Projectile, Actor, KeyCodes, AnimatedSprite, ActorPoolSystem
} from "../../jetlag";

// Session storage class to keep track of score
class SStore {
  score = 0;
};


export function gymMinigameBuilder(_level: number) {
  // Create session state storage if it does not exist yet
  if (!stage.storage.getSession("sStore"))
    stage.storage.setSession("sStore", new SStore());
  let sStore = stage.storage.getSession("sStore");

  // On game timer reaching 0 (on win), send player to the end screen (level 2)
  stage.score.onWin = { level: 2, builder: gymMinigameBuilder };

  // The actual basketball minigame level
  if (_level == 1) {
    // Create basketball background
    new Actor({
      appearance: new ImageSprite({ width: 16, height: 9, img: "locBg/taylorBasketballCourt.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }),
    });

    // Sets 20 second timer and creates text to display time left
    stage.score.setVictorySurvive(20);
    new Actor({
      appearance: new TextSprite({ center: true, face: "Poetsen One", size: 120, color: "white", strokeColor: "#000000", strokeWidth: 10, z: 1 }, () => "" + stage.score.getWinCountdownRemaining()?.toFixed(0)),
      rigidBody: new BoxBody({ cx: 15.1, cy: .7, width: 2.5, height: 1.25 }),
    });

    // Create text that keeps track of score and a score basketball icon
    new Actor({
      appearance: new TextSprite({ center: false, face: "Poetsen One", size: 120, color: "white", strokeColor: "#000000", strokeWidth: 10, z: 1 }, () => `${sStore.score}`),
      rigidBody: new BoxBody({ cx: 1.5, cy: -.2, width: 2.5, height: 1.25 }),
    });
    let scoreIcon = new Actor({
      appearance: new ImageSprite({ width: 1.2, height: 1.2, img: "gymMinigame/basketball.png", z: 1 }),
      rigidBody: new BoxBody({ cx: .7, cy: .7, width: 2, height: 2 }),
    });

    // Set world logic
    stage.world.setGravity(0, 10);
    let walls = boundingBox();

    // Create hero with according animation and key handling
    let heroAnimation = makeCharacterAnimation();
    const hero = new Actor({
      appearance: new AnimatedSprite({ width: 3, height: 4, animations: heroAnimation.animations, remap: heroAnimation.remap }),
      rigidBody: new BoxBody({ cx: 0, cy: 8, width: 3, height: 4 }, { disableRotation: true, passThroughId: [0] },),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    keyHandler(hero);

    // Create basketball barriers
    let leftBasket = new Actor({
      appearance: new FilledBox({ width: 0, height: 0, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 7.3, cy: 2.9, width: 0.1, height: 1 }, { friction: .3, disableRotation: true }),
      role: new Obstacle({ projectileCollision: () => false }),
    });
    let rightBasket = new Actor({
      appearance: new FilledBox({ width: 0, height: 0, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 8.7, cy: 2.9, width: 0.1, height: 1 }, { friction: .3 }),
      role: new Obstacle({ projectileCollision: () => false }),
    });
    new Actor({
      appearance: new FilledBox({ width: 0, height: 0, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 8., cy: 3.4, width: 1.1, height: 0.1 }, { singleRigidSide: Sides.BOTTOM }), // makes it impossible for players to throw basketball in through the bottom
      role: new Obstacle({ projectileCollision: () => false }),
    });
    // Sets left and right basket wall barriers
    leftBasket.rigidBody.setRotation(-.5);
    rightBasket.rigidBody.setRotation(.5);

    // Place an enemy in the bucket to detect the basketball and increment score by one when detected
    new Actor({
      appearance: new ImageSprite({ width: 1.5, height: 0.8, img: "gymMinigame/basketball.png", z: -1 }),
      rigidBody: new BoxBody({ cx: 8, cy: 2.9, width: 1, height: 0.8 }, { passThroughId: [0] }),
      role: new Obstacle({
        projectileCollision: () => {
          sStore.score = sStore.score + 1;
          return false;
        }
      }),
    });

    // This section creates the basketball and its pickup/throw logic
    let projectiles = new ActorPoolSystem();
    for (let i = 0; i < 1; ++i) { // Make it so that only one ball can be thrown before pickup
      // Physical appearance and behavior of the basketball
      let appearance = new ImageSprite({ width: 0.7, height: 0.7, img: "gymMinigame/basketball.png", z: 0 });
      let rigidBody = new CircleBody({ radius: 0.25, cx: -100, cy: -100 }, { passThroughId: [0], disableRotation: false, rotationSpeed: 1.25, friction: .3, elasticity: .7 });
      let reclaimer = (actor: Actor) => { projectiles.put(actor); }
      let role = new Projectile({ damage: 1, disappearOnCollide: false, },);
      let p = new Actor({ appearance, rigidBody, movement: new ProjectileMovement({ multiplier: 1.75 }), role });
      let collisions = 0;
      rigidBody.body.SetGravityScale(1);
      rigidBody.setCollisionsEnabled(true);

      // Start basketball pickup detection
      role.prerenderTasks.push((_elapsedMs: number, actor?: Actor) => {
        // Determine distance from the character to the ball
        let dx = Math.abs(hero.rigidBody.getCenter().x - p.rigidBody.getCenter().x);
        let dy = Math.abs(hero.rigidBody.getCenter().y - p.rigidBody.getCenter().y);
        if ((dx > 1.85 || dy > 2.35) && collisions == 0) { // Make sure the ball is not picked up when the character first throws it
          collisions = 1;
        }

        if ((dx < 1.5 && dy < 2) && collisions == 1) { // Given the ball has already been thrown and player is attempting to pick up
          (scoreIcon.appearance[0] as ImageSprite).setImage("gymMinigame/basketball.png"); // Reset basketball image to full color from gray
          reclaimer(p);
          // Reset first-touch detection, position, and rotation
          collisions = 0;
          rigidBody.setCenter(-100, -100);
          rigidBody.setRotation(1.25);
        }
      });
      projectiles.put(p);

    }

    // cover screen with a button for throwing projectiles
    // TODO: Normalize ball throw speed to be consistent/more understandable
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }), // this button is invisible
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: stage.hud }),
      gestures: {
        // Once tapped, toss the ball
        tap: (_actor: Actor, hudCoords: { x: number; y: number }) => {
          let pixels = stage.hud.camera.metersToScreen(hudCoords.x, hudCoords.y);
          let world = stage.world.camera.screenToMeters(pixels.x, pixels.y);
          let p = projectiles.get(); if (!p) return true;
          (p.role as Projectile).tossAt(hero.rigidBody.getCenter().x, hero.rigidBody.getCenter().y, world.x, world.y, hero, 0, 0);
          (scoreIcon.appearance[0] as ImageSprite).setImage("gymMinigame/basketballUsed.png"); // Set basketball icon to gray to indicate it has been thrown
          return true;
        }
      }
    });
  }
  // End screen which displays score and asks if player wants to try again
  if (_level == 2) {
    new Actor({ // background
      appearance: new ImageSprite({ width: 16, height: 9, img: "locBg/taylorBasketballCourt.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 0, height: 0 }),
    });
    new Actor({ // Good job!
      appearance: new TextSprite({ center: true, face: "Poetsen One", size: 100, color: "white", strokeColor: "#000000", strokeWidth: 10, z: 1 }, () => "Congratulations! You did great!"),
      rigidBody: new BoxBody({ cx: 8, cy: 2.5, width: 2.5, height: 1.25 }),
    });
    new Actor({ // score
      appearance: new TextSprite({ center: true, face: "Poetsen One", size: 120, color: "white", strokeColor: "#000000", strokeWidth: 10, z: 1 }, () => "Final Score: " + sStore.score),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 2.5, height: 1.25 }),
    });
    new Actor({ // try again
      appearance: new TextSprite({ center: true, face: "Poetsen One", size: 120, color: "white", strokeColor: "#000000", strokeWidth: 10, z: 1 }, () => "Try again?"),
      rigidBody: new BoxBody({ cx: 8, cy: 6.5, width: 2.5, height: 1.25 }),
      gestures: { tap: () => { stage.switchTo(gymMinigameBuilder, 1); return true; } }
    });
  }

}

/** Draw a bounding box that surrounds the default world viewport */
function boundingBox() {
  // Draw a box around the world
  let t = new Actor({
    appearance: new FilledBox({ width: 16, height: .1, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: -.05, width: 16, height: .1 }, { friction: .3 }),
    role: new Obstacle({ projectileCollision: () => false }),
  });
  let b = new Actor({
    appearance: new FilledBox({ width: 0, height: 0, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 8, cy: 9, width: 16, height: .1 }, { friction: .3 }),
    role: new Obstacle({ projectileCollision: () => false }),
  });
  let l = new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: -.05, cy: 4.5, width: .1, height: 9 }, { friction: .3 }),
    role: new Obstacle({ projectileCollision: () => false }),
  });
  let r = new Actor({
    appearance: new FilledBox({ width: .1, height: 9, fillColor: "#ff0000" }),
    rigidBody: new BoxBody({ cx: 16.05, cy: 4.5, width: .1, height: 9 }, { friction: .3 }),
    role: new Obstacle({ projectileCollision: () => false }),
  });
  // Return the four sides as an object with fields "t", "b", "l", and "r" 
  // (for top/bottom/left/right)
  return { t, b, l, r };
}

function keyHandler(hero: Actor) {
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_A, () => ((hero.movement as ManualMovement).updateXVelocity(0)));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_D, () => ((hero.movement as ManualMovement).updateXVelocity(0)));

  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => ((hero.role as Hero).jump(0, -7.5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => ((hero.role as Hero).jump(0, -7.5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => ((hero.movement as ManualMovement).updateXVelocity(-5)));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_D, () => ((hero.movement as ManualMovement).updateXVelocity(5)));
}

function makeCharacterAnimation() {
  let animations = new Map();
  animations.set(AnimationState.WALK_W, new AnimationSequence(true).to("walkW1.png", 75).to("walkW2.png", 75).to("walkW3.png", 75).to("walkW4.png", 75).to("walkW5.png", 75).to("walkW6.png", 75).to("walkW7.png", 75).to("walkW8.png", 75).to("walkW9.png", 75));
  animations.set(AnimationState.WALK_E, new AnimationSequence(true).to("walkE1.png", 75).to("walkE2.png", 75).to("walkE3.png", 75).to("walkE4.png", 75).to("walkE5.png", 75).to("walkE6.png", 75).to("walkE7.png", 75).to("walkE8.png", 75).to("walkE9.png", 75));


  animations.set(AnimationState.IDLE_W, new AnimationSequence(true).to("idleW.png", 1000));
  animations.set(AnimationState.IDLE_E, new AnimationSequence(true).to("idleE.png", 1000));

  let remap = new Map();
  remap.set(AnimationState.WALK_NW, AnimationState.WALK_W);
  remap.set(AnimationState.WALK_SW, AnimationState.WALK_W);
  remap.set(AnimationState.WALK_NE, AnimationState.WALK_E);
  remap.set(AnimationState.WALK_SE, AnimationState.WALK_E);

  remap.set(AnimationState.IDLE_NW, AnimationState.IDLE_W);
  remap.set(AnimationState.IDLE_SW, AnimationState.IDLE_W);
  remap.set(AnimationState.IDLE_NE, AnimationState.IDLE_E);
  remap.set(AnimationState.IDLE_SE, AnimationState.IDLE_E);

  remap.set(AnimationState.JUMP_E, AnimationState.WALK_E);
  remap.set(AnimationState.JUMP_W, AnimationState.WALK_W);
  remap.set(AnimationState.JUMP_NW, AnimationState.WALK_W);
  remap.set(AnimationState.JUMP_SW, AnimationState.WALK_W);
  remap.set(AnimationState.JUMP_NE, AnimationState.WALK_E);
  remap.set(AnimationState.JUMP_SE, AnimationState.WALK_E);

  remap.set(AnimationState.JUMP_IDLE_E, AnimationState.IDLE_E);
  remap.set(AnimationState.JUMP_IDLE_W, AnimationState.IDLE_W);
  remap.set(AnimationState.JUMP_IDLE_NW, AnimationState.IDLE_W);
  remap.set(AnimationState.JUMP_IDLE_SW, AnimationState.IDLE_W);
  remap.set(AnimationState.JUMP_IDLE_NE, AnimationState.IDLE_E);
  remap.set(AnimationState.JUMP_IDLE_SE, AnimationState.IDLE_E);

  return { animations, remap };
}