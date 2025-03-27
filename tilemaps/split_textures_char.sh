#!/bin/bash

# IMPORTANT: This script is intended for use on Windows Git Bash and with ImageMagick v.07 installed at the path below.
# IMPORTANT: If your path to ImageMagick is different, please change the MG variable below.

# This script splits a character sprite sheet from ModernInterior (the proper
#name of the texture pack we bought) into individual sprites using ImageMagick.
# These sprites can then be used in junction with pack_texture_char.sh to create
# a more usable sprite sheet form for the game.

# The sprite sheet is split into sets of <=6 sprites. Each set represents a
# character doing an action and is renamed accordingly.
# The set is further split into <=6 individual sprite frames, each sprite being 48x96 px.
# The sprites are then stored in the assets/CharacterSpriteSheet directory for later assembly.

# Note: An action is a movement combined with a direction, e.g. IdleE, WalkN, etc.
# Note: <=6 sprites means that a set can have less than 6 sprites, but not more than 6 sprites.

usage() {
    echo "Usage: ./split_textures_char.sh <sprite_sheet_path> <sprite_name>"
    echo "  <sprite_sheet_path> - Specify the path to the input sprite sheet"
    echo "  <sprite_name>       - Specify the name of the output sprite"
    echo " -h                   - Display this help message"
    echo "Example: ./split_textures_char.sh \"assets/2_Characters/Bodies/48x48/Body_48x48_09.png\" \"body09\""
}

[ -z "$1" ] || [[ " $@ " =~ " -h " ]] && {
    usage
    exit 1
}

# The path to the ImageMagick tool in your system
MG="/c/Program Files/ImageMagick-7.1.1-Q16-HDRI/magick.exe"

# This should be the path to the sprite sheet you want to split up
# e.g. "assets/2_Characters/Bodies/48x48/Body_48x48_09.png"
spritesheet="$1"

# The id name for the output sprites, this should follow the naming convention
# found in the game's assets folder
# e.g. "body09"
spritesname="$2"

# Step 0: Do some error checking
if [ ! -f "${MG}" ]; then
    echo "Error: ImageMagick tool not found at ${MG}"
    usage
    exit 1
fi

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

#
# Step 1: Split the sprite sheet into individual sets of sprites
#

# We split the sheet into sets of 288x96 pixels
# Each set has <= 6 continuouse sprite frames, characterized by the character doing an action
# ImageMagick has a cropping feature that allows us to crop an image into tiles of a certain size
# and save those tiles as separate images in a directory. Read about it here: https://usage.imagemagick.org/crop/#crop_tile

echo -e "\n|DO NOT CANCEL OR INTERRUPT THIS SCRIPT UNTIL IT IS COMPLETE|"
echo -e "\nSplitting the sprite sheet into individual sets of sprites..."

# Create a directory to store the individual sets
mkdir -p "./assets/CharacterSpriteSheet/${spritesname}"
"$MG" "mogrify" \
    -path "./assets/CharacterSpriteSheet/${spritesname}" \
    "+repage" \
    "+gravity" \
    -crop "288x96" \
    "${spritesheet}"

#
# Step 2: Rename wanted sets and delete unwanted sets
#

# A wanted set is a set that is not an empty png, and has an animation that we want to use in the game.
# Any needed animation from the spritesheet should be added to the action array.
# We will also delete any sets that aren't paired with an action, just to save memory space.

# Move into the directory where the sets are stored for easier manipulation
cd "./assets/CharacterSpriteSheet/${spritesname}"

# Now that we're done splitting, the first set in the sheet is always the demo set, which we don't need
rm *-0.png

# Start renaming the wanted sets and deleting unwanted sets
# Each wanted set will be sequentially paired with action and renamed accordingly
# IMPORTANT: The order of the action in the array is the order in which a wanted set should be appear sprite sheet after being cut out
# IMPORTANT: For example, if the 5th set in the sheet (ommiting the starting 4-sprite demo set, so the 1st should be the walking-east set)
# IMPORTANT: has an action you want, then the 5th action in the array should be the name of that animation

# TODO: Add a way to add sets that aren't continuous in the sheet and delete unwanted sets in between wanted sets
action=("IdleE" "IdleN" "IdleW" "IdleS" "WalkE" "WalkN" "WalkW" "WalkS")

i=0 # Index for the action array

echo -e "\nRenaming wanted sets and deleting unwanted sets..."
# Sort the sets/files numerically and loop over them
for set in $(ls ./* | sort -t'-' -k2,2n); do
    # If the set is an empty png, delete it
    if [ $(du -k "$set" | cut -f1) -le 1 ]; then
        rm "$set"
    # Else, rename it to the next action name
    elif [ $i -lt ${#action[@]} ]; then
        mv "$set" "${spritesname}${action[$i]}.png"
        ((i++))
    # Remaining sets with no action associated with them are deleted
    else
        rm "$set"
    fi
done

#
# Step 3: Split the sets into individual sprite frames
#

# We crop each set into 6 frames, a frame being 48x96 px
# The resulting filename of each frame is the name of the set with the animation frame number appended to it

echo -e "\nSplitting the sets into individual sprite frames..."
for set in ./*.png; do
    filename="${set%.*}" # Removes .png extension

    "$MG" "$set" \
        "+repage" \
        "+gravity" \
        -crop "48x96" \
        "${filename}%d.png" # Uses filename

    rm "$set"
done

echo -e "\nSplitting completed!\n"
echo -e "Output sprites in:     ./assets/CharacterSpriteSheet/${spritesname}\n"

exit 0
