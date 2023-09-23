import type { GallerySettings } from "./GallerySettings"

export const DEFAULT_HIDDEN_INFO = 
{
  name:false,
  path:false,
  extension:false,
  size:false,
  dimensions:false,
  date:false,
  imageTags:false,
  backlinks:false,
  infolinks:false,
  colorPalette:false,
  tags:true,
  palette:true,
  targetImage:true
}

export const DEFAULT_SETTINGS: GallerySettings = {
  imgDataFolder: null,
  galleryLoadPath: '/',
  imgmetaTemplatePath: null,
  width: 400,
  useMaxHeight: false,
  maxHeight: 400,
  hiddenInfoTicker: DEFAULT_HIDDEN_INFO,
  filterStartOpen: false,
  skipMetadataOverwrite: false
}

export const DEFAULT_TEMPLATE = '---\ntags:\n---\n<%IMGEMBED%>\n<%IMGINFO%>\n%% Description %%\n'

export const EXTRACT_COLORS_OPTIONS = {
  pixels: 20000,
  distance: 0.2,
  saturationImportance: 0.2,
  splitPower: 10,
  colorValidator: (red: number, green: number, blue: number, alpha = 255) => alpha > 250
}

export const EXTENSIONS = ['png', 'jpg', 'jpeg', "webp", "gif", "webm", 'mp4']

export const VIDEO_REGEX = new RegExp('.*\\.(mp4|webm)($|\\?)')

export const OB_GALLERY = 'ob-gallery'

export const OB_GALLERY_INFO = 'ob-gallery-info'

export const GALLERY_ICON = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="images" class="svg-inline--fa fa-images fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M480 416v16c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V176c0-26.51 21.49-48 48-48h16v208c0 44.112 35.888 80 80 80h336zm96-80V80c0-26.51-21.49-48-48-48H144c-26.51 0-48 21.49-48 48v256c0 26.51 21.49 48 48 48h384c26.51 0 48-21.49 48-48zM256 128c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-96 144l55.515-55.515c4.686-4.686 12.284-4.686 16.971 0L272 256l135.515-135.515c4.686-4.686 12.284-4.686 16.971 0L512 208v112H160v-48z"></path></svg>'

export const GALLERY_SEARCH_ICON = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg>'

export const GALLERY_LOADING_IMAGE = "data:image/gif;base64,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";

export const GALLERY_DISPLAY_USAGE = `
e.g. Input:

\`\`\`gallery
type=active-thumb
path=Weekly
name=.*Calen
tags=photo -car fam
exclusive=true
matchCase=false
imgWidth=400
imgHeight=400
divWidth=70
divAlign=left
divHeight=1400
reverseOrder=false
customList=5 10 2 4
random=0
\`\`\`

----
Full documentation on gallery blocks at:<br>
https://github.com/TomNCatz/obsidian-gallery/blob/main/docs/READEME_DisplayBlocks.md
`

export const GALLERY_INFO_USAGE = `
e.g. Input:

\`\`\`
imgPath=Resources/Images/Image_example_1.png
ignoreInfo=Name;tags;size;backlinks
\`\`\`

----

- Block takes a single argument which is the \`PATH\` of the image.
- Path is the relative path of the file withing the obsidian vault.
- Make sure the image exists!!
- It is case sensitive!
- IgnoreInfo is a list of fields NOT to display(if not included uses Default Hidden Info setting)

----

Please Check Release Notes for plugin changes:<br>
https://github.com/TomNCatz/obsidian-gallery#release-notes
`

export const GALLERY_RESOURCES_MISSING = `
<div class="gallery-resources-alert">
  <strong>Missing or Unspecified Image Information Resources folder</strong>
</div>

Please make sure that a Valid Folder is specified in the settings for the plugin to use to store image information notes!
`
