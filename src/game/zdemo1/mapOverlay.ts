// Imports
import { BoxBody, Obstacle, Actor, stage, ImageSprite } from "../../jetlag";

// Map Class
export class Map {
    /**
     * Constructor with 3 parameters
     * @param name The name of the map area
     * @param image The image for the map
     * @param locations A list of locations to place on the map
     */
    constructor(private name: string, private image: string, private locations: Locs[]) {
        this.name = name;
        this.image = image;
        this.locations = locations;
    }

    /**
     * Public accessor for name variable
     * @returns name variable
     */
    public getName() {
        return this.name;
    }

    public mapBuilder(level: number) {
        // Create the image background of the map
        stage.world.camera.setBounds(0, 0, 16, 9);
        stage.world.camera.setCenter(8, 4.5);
        stage.backgroundColor = "#ff0000";
        stage.background.addLayer({ anchor: { cx: 8, cy: 4.5 }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: this.image }), speed: 1 });

        // Generate locations with the attribute of each location in the locations array
        this.locations.forEach(function (location) {
            new Actor({
                appearance: new ImageSprite({ width: location.getXSize(), height: location.getYSize(), img: location.getImage() }),
                rigidBody: new BoxBody({ cx: location.getXPos(), cy: location.getYPos(), width: location.getXSize(), height: location.getYSize() }),
                gestures: { tap: () => { stage.switchTo(location.getBuilder(), 1); return true; } },
                role: new Obstacle(),
            })
        })
    }

}

// Location Class
class Locs {
    /**
     * Constructor with 6 parameters
     * @param image The image to use for the location
     * @param xPos X position on map of location
     * @param yPos Y position on map of location
     * @param xSize X size on map of location
     * @param ySize Y size on map of location
     * @param builder The stage to bring the player to on click
     */
    constructor(private image: string, private xPos: number, private yPos: number, private xSize: number, private ySize: number, private builder: (level: number) => void) {
        this.image = image;
        this.xPos = xPos;
        this.yPos = yPos;
        this.xSize = xSize;
        this.ySize = ySize;
        this.builder = builder;
    }

    // Getters for each attribute of the map
    public getImage() {
        return this.image;
    }
    public getXPos() {
        return this.xPos;
    }
    public getYPos() {
        return this.yPos;
    }
    public getXSize() {
        return this.xSize;
    }
    public getYSize() {
        return this.ySize;
    }
    public getBuilder() {
        return this.builder;
    }
}