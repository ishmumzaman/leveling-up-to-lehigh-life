#!/bin/bash

# WARNING: This script is intended for use on Windows Git Bash and with TexturePacker installed.

# Set the correct TexturePacker path
TP="/c/Program Files/CodeAndWeb/TexturePacker/bin/TexturePacker.exe"
spritesname="$1"

#TODO: Add an option to specify the template file as a command line argument
template="../assets/TexurePacker/body03.tps"

# Ensure TexturePacker exists
if [ ! -f "${TP}" ]; then
    echo "Error: TexturePacker tool not installed in ${TP}"
    exit 1
fi

# Ensure a sprite name is provided
if [ -z "$spritesname" ]; then
    echo "Error: No sprite name provided."
    echo "Usage: ./build_sprites.sh <sprite_name>"
    exit 1
fi

# Run TexturePacker command with correct arguments
if [ ! -d "./assets/CharacterSpriteSheet/${spritesname}" ]; then
    echo "Error: Folder containing split-up sprites: ./assets/CharacterSpriteSheet/${spritesname} not found"
    exit 1
elif [ -f "./assets/CharacterSpriteSheet/${spritesname}/${spritesname}.png" ]; then
    echo -e "Error: There is a spritesheet in your sprites. Please delete the spritesheet before running this script again.\n"
    exit 1
else
    echo -e "Packing spritesheets for a new sprite body type\n"

    # Run TexturePacker with necessary arguments
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
    echo -e "\tSprite sheets at: "./assets/CharacterSpriteSheet/${spritesname}/${spritesname}.png", "../assets/characterSpriteSheets/${spritesname}.png""
    echo -e "\tJSON data at: "./assets/CharacterSpriteSheet/${spritesname}/${spritesname}.json", "../assets/characterSpriteSheets/${spritesname}.json""
    echo -e "\tTexturePacker template at: "../assets/TexurePacker/${spritesname}.tps""

    exit 0
fi
