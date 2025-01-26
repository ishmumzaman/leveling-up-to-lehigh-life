# Game Code

This folder has all of the LUTLL-specific code in it.  It's organized as
follows:

- `characters` -- Code related to NPCs, the main character, and character
  customization.
- `common` -- Code used by other parts of the game
- `interactions` -- Code related to Dialogues and Inspects
- `introScene` -- Code for making the opening scene
- `inventory` -- Code related to the inventory and items
- `places` -- Builders for all of the parts of campus
- `quests` -- Code related to the various game quests
- `storage` -- Code for keeping track of game state
- `ui` -- 


- `menus/` is the folder for things that happen *before* someone starts playing.
  This includes help screens, the welcome screen, the character creation screen,
  etc.
- `places/` is the folder where the builders for the different parts of campus
  should go.
- `quests/` is the folder where code related to the various game quests should
  go.
- `PlayerSystems/` is for things that are used in the rest of the code, like
  dialogs, the hud, etc. **This might change**
- `StorageSystems/` is for the objects we use to store all in-game state.  Right
  now it's just the session object, but it will include the persistent object
  eventually, once we have persistence.
- `WorldSystems/` is for other things that are used in the rest of the code.
  **This might change**