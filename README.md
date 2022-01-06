# HTML TO SCENE <a href='https://ko-fi.com/rollingjaviondox' target='_blank'><img height='35' style='border:0px;height:25px;' src='https://theme.zdassets.com/theme_assets/2141020/171bb773b32c4a72bcc2edfee4d01cbc00d8a004.png' border='0' alt='Buy Me a Coffee at ko-fi.com'/></a>
  

  A FoundryVTT module that allows embedding HTML files on scenes.

## Usage

  Go to your world and enable the module. When the module is enabled you will be able to see a new tab appear on your scene configuration dialog.
  
  ![HTMLToScene Options](moduleoptions.png)
  
  There, you will be able to change how the module works. By default, if you enable it for the current scene, it creates a view for the file and removes controls that normally would be unused. But you can change that on its settings.
  
1 - Allows the module to create a view on the current scene.

2 - Allows you to indicate the module a path to the HTML file you want to open. (You have to a relative path from the Data folder to the HTML file)

3 - Removes all the UI at the left of the screen, leaving the right controls intact. (By default)

4 - Leaves a space under the right controls (Used if you don't want to render the HTML file under that)

5 - Removes the right controls and, if the 3rd option is enabled, displays back the scene changer at the top (That you can make smaller clicking on the arrow).

6 - Hides 'Game Paused'.
  
  ## Limitations
  
  As it is loaded as an iframe, FoundryVTT doesn't have a way to sync them between players without the use of advanced techniques.
  
  ## Use cases (Ideas)
  
  - You can make custom landing pages with fully animated elements, shaders and/or 3D graphics.
 
  - You can link your wiki or other tools in FoundryVTT. (And even host it with <Your IP>:3000/Relative/Path/to/your.html) (You don't need the module for the last bit).
  
  - You can play other games inside FoundryVTT (Even 3D ones). It *may* even work for more advanced puzzles!
  
  - You can make custom websites for fake organizations for sci-fi games.
  
  ... and more!
  
 ## Thanks
Special thanks to [zeel01](https://github.com/zeel01) for allowing me to learn how to make the interfaces on FoundryVTT properly and copy some code of [pin-fixer](https://github.com/zeel01/pin-fixer) for that purpose.
  
Thanks to the amazing people on the FoundryVTT and the League of Extraordinary FoundryVTT Developers discords for some help and tips.
