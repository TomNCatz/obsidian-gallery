# Tagged Gallery
![GitHub release)](https://img.shields.io/github/v/release/TomNCatz/obsidian-gallery)
![GitHub all releases](https://img.shields.io/github/downloads/TomNCatz/obsidian-gallery/total)

- Main Gallery to tag / filter / add notes to images.
- Display blocks to embed images inside notes
- Display block to an image information

## Examples:

### Main Gallery
![](docs/images/Example_main_gallery.gif)

### [Display blocks](https://github.com/TomNCatz/obsidian-gallery/blob/main/docs/README_DisplayBlocks.md)
![](docs/images/Example_Display_Block.gif)

### [Meta Files and Templates](https://github.com/TomNCatz/obsidian-gallery/blob/main/docs/README_MetaFiles.md)
![](docs/images/MetaFile.png)

### [Context Menu](https://github.com/TomNCatz/obsidian-gallery/blob/main/docs/README_ContextMenu.md)
![](docs/images/ContextMenu.png)

### Settings:
![](docs/images/Gallery_Settings.png)

## [Tenative Roadmap](https://github.com/TomNCatz/obsidian-gallery/blob/main/docs/README_Roadmap.md)

# Release Notes
## 1.2.0
 - Fixing a bug in detecting new images added while while open
 - Fixed an issue where you could select or try to preview nothing
 - Fixing critical mobile bug that prevented the gallery working with new caching techniques
 - Got right click menu working anywhere and added setting to turn it off
 - Moved several settings into a platform specific set of options
 - I spent an hour trying to write handling for an edge case where in large vaults a combination of the sync plugin and the dataview plugin would cause a loading fault for THIS plugin, and now I can't get it to happen to test it so this code doesn't break anything, but also might not fix anything.

## 1.1.5
 - Caches were not getting generated if there was any delay in app start, moved most startup into a bootstrap process
 - Globalization work should be done, now I just need to figure out how to translate into a dozen or so languages so it's actually useful

## 1.1.4
 - GH#16 Changed how pathing and caching are handled while trying to account for multilingual file paths
 - Some other small cleanup

## 1.1.3
 - GH#16 sometimes if your info block path was wrong in just the right way it would break all the other links in the file while trying to fix the path. Now it just suggests the path it thinks you should use instead of trying to change it automagically
 - Swapped out some text buttons for icon buttons
 - Adding an option to rename image files and update their path in the meta file(if they have one)

This is a continuation of developement from Darakah's obsidian-gallery, found here https://github.com/Darakah/obsidian-gallery
