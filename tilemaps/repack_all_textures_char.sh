#!/bin/bash

spritesnames=("beanie01" "beard01" "body01" "body03" "eyes01" "glasses01" "hair01" "hair03" "hair05" "hair09" "hair10" "hair11" "hair12" "hair15" "hair18" "hair19" "hair22" "hair24" "hair25" "outfit01" "outfit02" "outfit03" "outfit04" "outfit07" "outfit10" "outfit11" "outfit14" "snapback04")

for sprite in ${spritesnames[@]}; do
    echo -e "\nRepacking "$sprite""
    ./pack_textures_char.sh "$sprite"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to repack $sprite"
        exit 1
    fi
done

exit 0
