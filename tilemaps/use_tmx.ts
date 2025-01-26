import * as HawksPath from "./TileMaps/mfsHawksPath.json"

// [mfs] Don't forget about rotations

function processIt() {
    console.log(`width: ${HawksPath.tilewidth}, height: ${HawksPath.height}, tilewidth: ${HawksPath.tilewidth}, tileheight: ${HawksPath.tileheight}`)
    for (let l of HawksPath.layers) {
        if (l.objects) {
            for (let o of l.objects) {
                if (o.polygon) {
                    let base_x = o.x;
                    let base_y = o.y;
                    let out = `  Polygon with vertices at [`;
                    for (let pt of o.polygon)
                        out += `(${pt.x + base_x}, ${pt.y + base_y})`
                    out = out.trim() + "]";
                    console.log("  " + out);
                }
                else {
                    console.log(`  Rectangle from (${o.x}, ${o.y}) to (${o.x + o.width}, ${o.y + o.height})`)
                }
            }
        }
    }
}

processIt();