#!/bin/bash

# IMPORTANT: This script is intended for use on Windows Git Bash and with TexturePacker installed at the path below.
# IMPORTANT: If your path to TexturePacker is different, please change the TP variable below.

# This script looks at a folder containing already-split-up sprites and packs them into a workable spritesheet using TexturePacker.
# split_textures_char.sh should be run before this script to create the individual sprites.
# The output is a spritesheet and a JSON file that can be used in the game.

usage() {
    echo "Usage: ./pack_textures_char.sh <sprite_name>"
    echo "  <sprite_name> - Specify the name of the output sprite"
    echo "Example: ./pack_textures_char.sh \"body09\""
}

[ -z "$1" ] || [[ " $@ " =~ " -h " ]] && {
    usage
    exit 1
}

# Set the correct TexturePacker path
TP="/c/Program Files/CodeAndWeb/TexturePacker/bin/TexturePacker.exe"
spritesname="$1"

#TODO: Add an option to specify the template file as a command line argument
template="../assets/TexurePacker/body03.tps"

# Ensure TexturePacker exists
if [ ! -f "${TP}" ]; then
    echo "Error: TexturePacker tool not installed in ${TP}"
    usage
    exit 1
fi

# Ensure a sprite name is provided
if [ -z "$spritesname" ]; then
    echo "Error: No sprite name provided."
    usage
    exit 1
fi

# Do some more error checking
if [ ! -d "./assets/CharacterSpriteSheet/${spritesname}" ]; then
    echo "Error: Folder containing split-up sprites: ./assets/CharacterSpriteSheet/${spritesname} not found"
    exit 1
elif [ -f "./assets/CharacterSpriteSheet/${spritesname}/${spritesname}.png" ]; then
    echo -e "Error: There seems to be a spritesheet in your sprites. Please delete the spritesheet before running this script again.\n"
    exit 1
else
    echo -e "Packing into spritesheet...\n"

    # Run TexturePacker
    "$TP" --max-size 512 \
        --format "pixijs4" \
        "./assets/CharacterSpriteSheet/${spritesname}" \
        --data "../assets/characterSpriteSheets/${spritesname}.json" \
        --sheet "../assets/characterSpriteSheets/${spritesname}.png"

    "$TP" --max-size 512 \
        --format "pixijs4" \
        "./assets/CharacterSpriteSheet/${spritesname}" \
        --save "../assets/TexurePacker/${spritesname}.tps"

    if [ ! -f "../assets/characterSpriteSheets/${spritesname}.json" ]; then
        echo "Error: JSON file not created."
        exit 1
    fi
    if [ ! -f "../assets/characterSpriteSheets/${spritesname}.png" ]; then
        echo "Error: PNG file not created."
        exit 1
    fi
    if [ ! -f "../assets/TexurePacker/${spritesname}.tps" ]; then
        echo "Error: TexturePacker template file not created."
        exit 1
    fi

    echo -e "\nPacking completed!\n"
    echo -e "Output files:"
    echo -e "Sprite sheets at:            "../assets/characterSpriteSheets/${spritesname}.png""
    echo -e "JSON data at:                "../assets/characterSpriteSheets/${spritesname}.json""
    echo -e "TexturePacker template at:   "../assets/TexurePacker/${spritesname}.tps""

    exit 0
fi
