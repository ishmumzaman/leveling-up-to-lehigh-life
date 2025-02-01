# Leveling Up to Lehigh Life

The Leveling Up to Lehigh Life project aims to combine computer science, graphic design, music, storytelling, and marketing to create a casual 2-D game to help new students of all backgrounds adapt to life at Lehigh University. 

## Description

The experience of being a first-year student represents a significant change in social norms, complete with strange vocabulary; unfamiliar social customs; a set of complex, implicit rules for how to interact with professors in person and electronically. The goal of this project is for the game to allow admitted students to learn about life at Lehigh before they set foot on campus. 

## Getting Started

The full documentation for the currently utilized JetLag framework can be found [here.](https://www.cse.lehigh.edu/~spear/jetlag_tutorials/)

### Dependencies

* Any terminal (most likely included with your OS)
* [Git](https://git-scm.com/downloads)
* [Node.js/NPM](https://nodejs.org/en/download/) (Choose an installer from the highlighted LTS section at the top)
* Any modern web browser
* [VSCode](https://code.visualstudio.com/)

### Dependencies Setup

* Use [this](https://support.atlassian.com/bitbucket-cloud/docs/set-up-personal-ssh-keys-on-macos/) link to setup your SSH key (if you don't have one setup already) and add it to your Github account.
* If it is your first time using/installing git, do the following commands with any brackets being replaced by your own information:
```
git config --global init.defaultBranch main
git config --global user.email "[Email]"
git config --global user.name "[Username]"
git config --global pull.rebase false
```
* In VSCode, search for "Editor: Format On Save" and set it to true
* Search for "Typescript > Format: Enable" and check it

### Project Workspace Setup
* Create a folder to keep the project files and navigate to it in your terminal (this is `cd [FILEPATH]` in most consoles)
* At the top of this page, find the bright green `Code` button, click the SSH option, and copy the `text` under it.
* In your terminal, type `git clone [TEXT COPIED HERE]`. This will take a little.
* Navigate to the new created folder by using `cd` (`ls` will list the name of the folder)
* In your terminal, type `npm install`.

### Run the game

* In your terminal, in the project folder, type `npm start`.
* Two links should show up within the terminal, `Ctrl (command if on mac) + click`ing on them should open them on most terminals but you can always type them manually.

## Add assets (images, sounds, etc.) to the game

* Copy the asset to assets folder
* Add the name of the asset to `src/game/game.ts`
* You can now refer to this file by its name in the code

* For spritesheets use [TexturePacker](https://www.codeandweb.com/texturepacker)

## Want to run multiplayer?

1. Open a terminal (``Ctrl + Shift + \`` in VSCode) and navigate to the multiplayer folder by running:
   
   ```sh
   cd multiplayer-server
   ```

2. Start the multiplayer server by running:
   
   ```sh
   npm start
   ```
   
   The server will immediately crash, but it will display a **MultiPlayerServer Address**. Copy this address.

3. Open a **new terminal tab** (keep the previous one open) and start the game's web server using the copied address:
   
   ```sh
   npm start (MultiPlayerServer Address)
   ```
   
   This will launch the web server and provide a new **Network Address**.

4. Copy the **Network Address** (**DO NOT** include `HTTP://`). Then, return to the multiplayer folder's terminal and run:
   
   ```sh
   npm start (Network Address)
   ```

5. Open your browser and enter the **Network Address**. Click **Log In**.

### **You are now connected to multiplayer!**  
Other players can join by using the same **Network Address**.  

### **Troubleshooting**
If the login screen gets stuck on "Logging in..." for more than a second, you likely made a mistake. Double-check the following:  

1. Ensure you **did not** include `HTTP://` when starting the multiplayer server.  
   
2. Verify that you used the **correct IP** for the web server from the multiplayer server.  
   
3. Confirm that you used the **correct IP** from the web server when starting the multiplayer server.  
   
4. Make sure you included **an IP at all** for the web server.  

**Note:**  
The game may take some time to load on a black screen. Be patient—it **will** eventually load.   

## Authors

Faculty Mentor  
* [Mike Spear](emailto:mfs409@lehigh.edu)  

Student Developers  
* [Anh Nguyen](emailto:ahn227@lehigh.edu)  
* [Emma Valle](emailto:emv226@lehigh.edu)  
* [Maureen Phelan](emailto:mcp227@lehigh.edu)  
* [Yassine Rafih](emailto:yar227@lehigh.edu)  
* [Hamza Al Farsi](emailto:haa428@lehigh.edu)  
* [Karina Makhani](kamb26@lehigh.edu)  
* [Ishmum Zaman](isz228@lehigh.edu)  
* [Nina Chau](nic627@lehigh.edu)  

## Changelog

* 0.0.1
   * Record future changes here

## Acknowledgments

* Jetlag Engine Contributors
   * Mike Spear  
   * Dan Spear  
   * Greyson Parrelli  
   * Jennifer Bayzick  
   * Rachel Santangelo  
   * Micah Carlisle  
   * Maximilian Hasselbusch  
   * Jimmy Johnson  
   * Marc Soda  
   * Egide Ntwari  
   * Nana Nyanor  
   * Sebastian Chavarro  
   * Anh H. Nguyen  
   * Yassine Rafih  


🤎🤍 made with love from Lehigh


