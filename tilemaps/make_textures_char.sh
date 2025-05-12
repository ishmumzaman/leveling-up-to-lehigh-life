# This script combines the process of splitting and packing character sprites into a single script.
# It takes in a non-compatible sprite sheet path and a sprite name id, and spits out a game-compatible sprite sheet.
# For more information on the individual scripts, see split_textures_char.sh and pack_textures_char.sh.

usage() {
    echo "Usage: ./make_textures_char.sh <sprite_sheet_path> <sprite_name>"
    echo "  <sprite_sheet_path> - Specify the path to the input sprite sheet"
    echo "  <sprite_name>       - Specify the id name of the output sprite"
    echo "  -h                   - Display this help message"
    echo "Example: ./make_textures_char.sh \"assets/2_Characters/Bodies/48x48/Body_48x48_09.png\" \"body09\""
}

[ -z "$1" ] || [[ " $@ " =~ " -h " ]] && {
    usage
    exit 1
}

# This should be the path to the sprite sheet you want to split up
# e.g. "assets/2_Characters/Bodies/48x48/Body_48x48_09.png"
spritesheet="$1"

# The id name for the output sprites, this should follow the naming convention
# found in the game's assets folder
# e.g. "body09"
spritesname="$2"

# Error checking
if [ -z "${spritesname}" ]; then
    echo "Error: No sprite name provided."
    usage
    exit 1
fi

if [ ! -f "${spritesheet}" ]; then
    echo "Error: Sprite sheet not found at: ${spritesheet} "
    usage
    exit 1
fi

# Split the sprite sheet into individual sprites
./split_textures_char.sh "$spritesheet" "$spritesname"

# Then pack them together into a workable sprite sheet
./pack_textures_char.sh "$spritesname"

exit 0
