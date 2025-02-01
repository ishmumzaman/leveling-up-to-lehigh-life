// Reviewed on 2024-09-17
// [mfs]  This looks like it is not doing anything yet.

import { Actor, BoxBody, ImageSprite, Scene, stage, TextSprite } from "../../jetlag";

export class Stats {
  public hunger: number = 100;
  constructor(public energy: number) {
    this.energy = energy;
  };

  /**
    * Display stats in a given scene
    * 
    * @param scene The scene where the stat will be displayed
    */
  renderStat(scene: Scene | undefined) {
    let energyWarning = "";
    let stat = new Actor({
      rigidBody: new BoxBody({ cx: 14.5, cy: 1, width: 2, height: 1.2 }, { scene: scene }),
      appearance: [
        new ImageSprite({ width: 2.5, height: 1.7, img: "statUI.png", z: 2 }),
        //new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: -0.7 } }, () => "Wellbeing: " + sStore.playerStat.wellness),
        //new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: -0.2 } }, () => "Strength: " + sStore.playerStat.fitness),
        new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 10, z: 2, offset: { dx: -1.1, dy: 0.5 } },
          () => {
            if (this.energy <= 25) {
              energyWarning = "You're starving,\ngo get some food!";
            } else if (this.energy <= 50) {
              energyWarning = "You're peckish,\ngo get some food!";
            } else {
              energyWarning = "";
            }
            return energyWarning
          }),

        new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: 0.3 } },
          () => "Energy: " + Math.ceil(this.energy)
        ),
        new TextSprite({ face: stage.config.textFont, center: false, color: "#000000", size: 12, z: 2, offset: { dx: -1.1, dy: 0.1 } },
          () => "Hunger: " + Math.ceil(this.hunger)
        ),
      ],
    })
    return stat;
  }
}