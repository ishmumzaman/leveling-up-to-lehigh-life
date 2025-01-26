import { b2AABB, b2Contact, b2ContactImpulse, b2DistanceJoint, b2DistanceJointDef, b2Fixture, b2Manifold, b2Vec2, b2World, b2WorldManifold } from "@box2d/core";
import { Actor } from "../Entities/Actor";
import { Scene } from "../Entities/Scene";
import { Sides } from "../Config";

/**
 * PointToActorCallback queries the world to find the actor at a given
 * coordinate
 */
class PointToActorCallback {
  /** If we found any actors, we'll put them here */
  foundEntities: Actor[] = [];

  /** A helper vector for tracking the location that is being queried */
  private readonly touchVector = new b2Vec2(0, 0);

  /** The tolerance (in meters) when looking in a region around a point */
  private readonly tolerance = 0.1;

  /** The bounding box around the point that is being tested */
  private readonly aabb = new b2AABB();

  /**
   * When query() finds a rigidBody, we may not want to return it.  This makes a
   * more refined decision by seeing if the found body is Active
   *
   * @param fixture The fixture that was found, and which needs to be tested
   *
   * @returns True if the fixture isn't satisfactory, and the search should
   *          continue
   */
  private checkIfActive(fixture: b2Fixture) {
    // Make sure the fixture's Entity is active
    let b = fixture.GetBody().GetUserData() as Actor;
    if (!b.enabled) return true;
    // It's active, so save the Entity
    this.foundEntities.push(b);
    return true;
  }

  /**
   * See if there is an Entity at point (x, y)
   *
   * @param pt    The point that is being checked
   * @param world The world in which the check is happening
   */
  query(pt: { x: number, y: number }, world: b2World) {
    this.foundEntities.length = 0;
    this.touchVector.Set(pt.x, pt.y);
    this.aabb.lowerBound.Set(pt.x - this.tolerance, pt.y - this.tolerance);
    this.aabb.upperBound.Set(pt.x + this.tolerance, pt.y + this.tolerance);
    world.QueryAABB(this.aabb, (fix: b2Fixture) => this.checkIfActive(fix));
  }
}

/**
 * BasicCollisionService is a physics simulator that is suitable for the HUD and
 * overlays.  It lacks a few complex/expensive features that might be desired in
 * a playable level of a game.
 */
export class BasicCollisionService {
  /** The physics world in which all actors interact */
  readonly world = b2World.Create(new b2Vec2(0, 0));

  /** For querying the point that was touched */
  protected readonly pointQuerier = new PointToActorCallback();

  /**
   * Query to find the actors at a screen coordinate
   *
   * @param coords.x  The X coordinate (in meters) to look up
   * @param coords.y  The Y coordinate (in meters) to look up
   */
  public actorsAt(coords: { x: number, y: number }) {
    this.pointQuerier.query(coords, this.world);
    return this.pointQuerier.foundEntities;
  }
}

/**
 * ContactListener wraps up all of the functions that Box2D needs in order to
 * run custom code on a collision event.  Strictly speaking, it is supposed to
 * extend the b2ContactListener type, but b2ContactListener doesn't have any
 * default implementations (meaning it ought to be an interface), and using a
 * flat class hierarchy works slightly better for the way we build tutorials, so
 * we omit the `extends` clause.
 */
class ContactListener {
  /**
   * Create a contact listener by saving the scene and collision service
   */
  constructor(private scene: Scene, private collisionService: AdvancedCollisionService) { /*super();*/ }
  

  /**
   * Figure out what to do when two bodies start to collide
   *
   * @param contact A description of the contact event
   */
  public BeginContact(contact: b2Contact) {
    // Get the bodies, make sure both are actors
    let a = contact.GetFixtureA().GetBody().GetUserData();
    let b = contact.GetFixtureB().GetBody().GetUserData();
    if (!(a instanceof Actor) || !(b instanceof Actor)) return;

    // Check for begin contact handlers
    const handler = this.collisionService.getBeginContactHandler(a, b);
    if (handler && handler.length > 0) {
        handler.forEach(callback => {
          this.scene.oneTimeEvents.push(() => {
          callback(a, b);
        })
      })
    }

    // The world is in mid-render, so we can't really change anything, so
    // defer handling the event until after the next render.
    this.scene.oneTimeEvents.push(() => {
      // NB: if `a` handles the collision, don't ask `b` to handle it
      if (!a.role?.onCollide(b)) b.role?.onCollide(a);
    });

    
  }

  /**
   * Figure out what to do when two bodies stop being in contact with each
   * other
   *
   * @param contact A description of the contact event
   */
  public EndContact(contact: b2Contact) {
    // Get the bodies, make sure both are actors
    let a = contact.GetFixtureA().GetBody().GetUserData();
    let b = contact.GetFixtureB().GetBody().GetUserData();
    if (!(a instanceof Actor) || !(b instanceof Actor)) return;

    // If this pair is in the array, splice it out and run the array entry
    for (let ch of this.collisionService.endContactHandlers)
      if ((ch.actor1 == a && ch.actor2 == b) || (ch.actor1 == b && ch.actor2 == a)) {
        let i = this.collisionService.endContactHandlers.indexOf(ch);
        this.collisionService.endContactHandlers.splice(i, 1);
        // The world is in mid-render, so we can't really change anything, so
        // defer handling the event until after the next render.
        this.scene.oneTimeEvents.push(() => {
          ch.callback(ch.actor1, ch.actor2);
        });
      }
  }

  /**
   * Before handling a collision, PreSolve runs.  We can use it to disable
   * certain contacts
   *
   * @param contact     A description of the contact event
   * @param oldManifold The manifold from the previous world step
   */
  public PreSolve(contact: b2Contact, _oldManifold: b2Manifold) {
    // get the bodies, make sure both are actors
    let a = contact.GetFixtureA().GetBody().GetUserData();
    let b = contact.GetFixtureB().GetBody().GetUserData();
    if (!(a instanceof Actor) || !(b instanceof Actor) || !a.rigidBody || !b.rigidBody) return;
    let ab = a.rigidBody, bb = b.rigidBody;

    // is either one-sided?
    let oneSided: Actor | undefined = undefined;
    let other: Actor | undefined = undefined;
    if (ab.singleRigidSide != undefined) {
      oneSided = a; other = b;
    } else if (bb.singleRigidSide != undefined) {
      oneSided = b; other = a;
    }
    // Should we disable a one-sided collision?
    if (oneSided && other && !oneSided.rigidBody!.stickyDistJoint && !other.rigidBody!.stickyDistJoint) {
      if (true) {
        let ot = oneSided.rigidBody.getCenter().y - oneSided.rigidBody.h / 2;
        let ob = oneSided.rigidBody.getCenter().y + oneSided.rigidBody.h / 2;
        let ol = oneSided.rigidBody.getCenter().x - oneSided.rigidBody.w / 2;
        let or = oneSided.rigidBody.getCenter().x + oneSided.rigidBody.w / 2;
        let ct = other.rigidBody.getCenter().y - other.rigidBody.h / 2;
        let cb = other.rigidBody.getCenter().y + other.rigidBody.h / 2;
        let cl = other.rigidBody.getCenter().x - other.rigidBody.w / 2;
        let cr = other.rigidBody.getCenter().x + other.rigidBody.w / 2;
        let vx = other.rigidBody.getVelocity().x;
        let vy = other.rigidBody.getVelocity().y;
        if (oneSided.rigidBody!.singleRigidSide == Sides.TOP && cb >= ot && vy <= 0) contact.SetEnabled(false);
        else if (oneSided.rigidBody!.singleRigidSide == Sides.LEFT && cr >= ol && vx <= 0) contact.SetEnabled(false);
        else if (oneSided.rigidBody!.singleRigidSide == Sides.RIGHT && cl <= or && vx >= 0) contact.SetEnabled(false);
        else if (oneSided.rigidBody!.singleRigidSide == Sides.BOTTOM && ct <= ob && vy >= 0) contact.SetEnabled(false);

      }
    }

    // If at least one entity is sticky, then see about making them stick
    if (ab.stickySides.length > 0) {
      this.collisionService.handleSticky(a, b, contact);
      return;
    } else if (bb.stickySides.length > 0) {
      this.collisionService.handleSticky(b, a, contact);
      return;
    }

    // if the entities have a matching passthrough ID
    //
    // TODO: is there a more efficient option than this n^2 code?
    if (ab.passThroughId && bb.passThroughId) {
      for (let i1 of ab.passThroughId) {
        for (let i2 of bb.passThroughId) {
          if (i1 == i2) {
            contact.SetEnabled(false);
            return;
          }
        }
      }
    }

    // if the entities have a special exemption to keep them from
    // interacting, then disable the contact
    let exA = a.role?.collisionRules;
    let exB = b.role?.collisionRules;
    if (exA && exB) {
      for (let a of exA.ignores)
        for (let b of exB.properties)
          if (a == b) {
            contact.SetEnabled(false);
            return;
          }
      for (let b of exB.ignores)
        for (let a of exA.properties)
          if (b == a) {
            contact.SetEnabled(false);
            return;
          }
    }
    // If we get here, it's a real collision
  }

  /**
   * This runs after handling the collision.  Right now we don't use it.
   *
   * @param contact A description of the contact event
   * @param impulse The impulse of the contact
   */
  public PostSolve(_contact: b2Contact, _impulse: b2ContactImpulse) { }
}

/**
 * AdvancedCollisionService is a physics simulator that provides the ability to run
 * code in response to collisions.
 */
export class AdvancedCollisionService extends BasicCollisionService {
  /**
   * Callbacks to consider running in response to a contact *ending*.  These are
   * always one-time callbacks.
   *
   * NB:  This could become a performance bottleneck, since we're using an array
   *      with O(n) search overhead.  The assumption is that the array will be
   *      small.  If that changes, then this will need to be redesigned.
   */
  public endContactHandlers: { actor1: Actor, actor2: Actor, callback: (a: Actor, b: Actor) => void }[] = [];
  public beginContactHandlers: WeakMap<Actor, Map<Actor, ((a: Actor, b: Actor) => void)[]>> = new WeakMap();

  /** Provide a scene, so we can route collision events to it */
  public setScene(scene: Scene) {
    this.configureCollisionHandlers(scene);
  }

  /**
   * Register a new endContactHandler to run when a collision ends
   *
   * @param actor1    One of the actors of the collision.  This actor should be
   *                  the first argument to `callback`.
   * @param actor2    The other actor from the collision / the second argument
   *                  to `callback`.
   * @param callback  The code to run when the collision ends
   */
  public addEndContactHandler(actor1: Actor, actor2: Actor, callback: (a: Actor, b: Actor) => void) {
    this.endContactHandlers.push({ actor1, actor2, callback });
  }

  /**
   * Register a new beginCallHandler to run when a collision begins
   * @param actor1 One actor of the collision
   * @param actor2 Another actor of the collision
   * @param callback The code to run when the collision begins
   */
  public addBeginContactHandler(actor1: Actor, actor2: Actor, callback: (a: Actor, b: Actor) => void) {
    if (!this.beginContactHandlers.has(actor1)) {
      this.beginContactHandlers.set(actor1, new Map());
      this.beginContactHandlers.get(actor1)?.set(actor2, [callback]);
    }
    else if(!this.beginContactHandlers.get(actor1)?.has(actor2)){
      this.beginContactHandlers.get(actor1)?.set(actor2, [callback]);
    }
    else{
      this.beginContactHandlers.get(actor1)!.get(actor2)?.push(callback);
    }

    if (!this.beginContactHandlers.has(actor2)) {
      this.beginContactHandlers.set(actor2, new Map());
      this.beginContactHandlers.get(actor2)?.set(actor1, [callback]);
    }
    else if(!this.beginContactHandlers.get(actor2)?.has(actor1)){
      this.beginContactHandlers.get(actor2)?.set(actor1, [callback]);
    }
    else{
      this.beginContactHandlers.get(actor2)!.get(actor1)?.push(callback);
    }
  }

  public removeBeginContactHandler(actor1: Actor, actor2: Actor, index?:number){
    if(this.beginContactHandlers.has(actor1)){
      if(index){
        this.beginContactHandlers.get(actor1)?.get(actor2)?.splice(index, 1);
        this.beginContactHandlers.get(actor2)?.get(actor1)?.splice(index, 1);
        return true;
      }
      else{
        this.beginContactHandlers.get(actor1)?.delete(actor2);
        this.beginContactHandlers.get(actor2)?.delete(actor1);
        return true;
      }
    }
    return false;
  }

  /**
   * 
   * @param actor1 The first actor of the collision
   * @param actor2 The second actor of the collision
   * @returns An array of callbacks to be executed by the collision or undefined if the function is not defined
   */
  public getBeginContactHandler(actor1: Actor, actor2: Actor): ((a: Actor, b: Actor) => void)[] | undefined {
    return this.beginContactHandlers.get(actor1)?.get(actor2) || this.beginContactHandlers.get(actor2)?.get(actor1);
  }

  /** Configure collision handling for the current level */
  private configureCollisionHandlers(scene: Scene) {
    this.world.SetContactListener(new ContactListener(scene, this));
  }

  /**
   * When an actor collides with a "sticky" actor, this figures out what to do
   *
   * @param sticky  The sticky actor 
   * @param other   The other actor
   * @param contact A description of the contact event
   */
  public handleSticky(sticky: Actor, other: Actor, contact: b2Contact) {
    // don't create a joint if we've already got one
    if (other.rigidBody?.stickyDistJoint) return;
    // don't create a joint if we're supposed to wait
    if (window.performance.now() < (other.rigidBody?.stickyDelay ?? 0)) return;
    // only do something if we're hitting the actor from the correct direction
    let sBody = sticky.rigidBody!;
    let oBody = other.rigidBody!;
    let oy = oBody.getCenter().y, ox = oBody.getCenter().x, ow = oBody.w, oh = oBody.h;
    let sy = sBody.getCenter().y, sx = sBody.getCenter().x, sw = sBody.w, sh = sBody.h;
    if ((sBody.stickySides.indexOf(Sides.TOP) > -1 && ((oy + oh / 2) <= (sy - sh / 2))) ||
      (sBody.stickySides.indexOf(Sides.BOTTOM) > -1 && ((oy - oh / 2) >= (sy + sh / 2))) ||
      (sBody.stickySides.indexOf(Sides.RIGHT) > -1 && ((ox - ow / 2) >= (sx + sw / 2))) ||
      (sBody.stickySides.indexOf(Sides.LEFT) > -1 && ((ox + ow / 2) <= (sx - sw / 2)))) {
      // create a distance joint. Note that we need to make the joint in a
      // callback that runs later
      let m = new b2WorldManifold();
      contact.GetWorldManifold(m);
      let v = m.points[0];
      sticky.scene.oneTimeEvents.push(() => {
        let sb = sticky.rigidBody?.body;
        let ob = other.rigidBody?.body;
        if (!sb || !ob) return;
        ob?.SetLinearVelocity(new b2Vec2(0, 0));
        let d = new b2DistanceJointDef();
        d.Initialize(sb, ob, v, v);
        d.collideConnected = true;
        other.rigidBody!.stickyDistJoint = this.world.CreateJoint(d) as b2DistanceJoint;
      });
    }
  }
}
