export default
{
	// main.ts
	PLUGIN_NAME: "Gallery Tags",
	LOADED_PLUGIN_MESSAGE: "Loaded {0} Plugin",
	UNLOADING_PLUGIN_MESSAGE: 'Unloading {0} Plugin',

	// utils.ts
	MISSING_RESOURCE_WARNING: "Resource not found '{0}'",
	META_OVERWRITE_CONFLICT: "Unable to get meta file for '{0}', file exists at path '{1}' but cannot be read at this time.",

	// Standard stuff
	CONFIRM: "OK",
	CANCEL: "CANCEL",
	GENERIC_CANCELED: "Canceled",

	// Settings
	SETTING_DATA_REFRESH_TITLE: "Rebuild data cache",
	SETTING_DATA_REFRESH_DESC: "If the plugin is having issues finding certain files, you can try this.",
	SETTING_DATA_REFRESH_BUTTON: "Rebuild",
	SETTING_MAIN_PATH_TITLE: "Main gallery default path",
	SETTING_MAIN_PATH_DESC: `The path from which to show images when the main gallery is opened. 
	Setting it to '/' will show all images in the vault. 
	Can be used to avoid the loading all images and affecting on open performance 
	(especially if vault has a huge amount of high quality images). 
	Setting it to an invalid path to have no images shown when gallery is opened.`,
	SETTING_FILTER_TITLE: "Default search bar",
	SETTING_FILTER_DESC: "Which search bar to show when opening the gallery view.",
	SETTING_DEFAULT_FILTER_TITLE: "Default filter",
	SETTING_DEFAULT_FILTER_DESC: "If set, gallery view will open with the selected filter already active",
	SETTING_DEFAULT_FILTER_NONE: "None",
	LAST_USED_FILTER: "Last Used",
	SETTING_IMAGE_WIDTH_TITLE: "Default image width",
	SETTING_IMAGE_WIDTH_DESC: "Display default image width in 'pixels'. Image collumns will be no wider than this by default",
	SETTING_MAX_HEIGHT_TOGGLE_TITLE: "Use max image height",
	SETTING_MAX_HEIGHT_TOGGLE_DESC: "Toggle this option to set a max image height for images to display in collumns.",
	SETTING_MAX_HEIGHT_TITLE: "Max image height",
	SETTING_MAX_HEIGHT_DESC: "Max image height in `pixels` for images to display in collumns.",
	SETTING_METADATA_HEADER: "Image Metadata",
	SETTING_META_FOLDER_TITLE: "Gallery info folder",
	SETTING_META_FOLDER_DESC1: "Specify an existing vault folder for the gallery plugin to store image information/notes as markdown files.",
	SETTING_META_FOLDER_DESC2: "E.g. \`Resources/Gallery\`.",
	SETTING_META_FOLDER_DESC3: "On first activation the default is unspecified. Thus the info functionality of the Main gallery is diabled.",
	SETTING_META_FOLDER_DESC4: "Folder must already exist (plugin will not create it).",
	SETTING_META_FOLDER_DESC5: "If a folder is not specified no Image Information notes are created (to be used in the main gallery).",
	SETTING_META_TEMPLATE_TITLE: "Meta file template override",
	SETTING_META_TEMPLATE_DESC1: "Location of template file to use for generating image meta files. If blank will use default.",
	SETTING_META_TEMPLATE_DESC2: "These keys will be replaced with the apropriate info for the file:",
	SETTING_META_TEMPLATE_DESC3: "<% IMG LINK %> : Clickable link to the image with its name as the text",
	SETTING_META_TEMPLATE_DESC4: "<% IMG EMBED %> : Embeded view of the image",
	SETTING_META_TEMPLATE_DESC5: "<% IMG INFO %> : Info block for the image",
	SETTING_META_TEMPLATE_DESC6: "<% IMG URI %> : The formatted URI for the image that can be used to generate a link to it",
	SETTING_META_TEMPLATE_DESC7: "<% IMG PATH %> : Path to the image(including file name)",
	SETTING_META_TEMPLATE_DESC8: "<% IMG NAME %> : File name for the image",
	SETTING_QUICK_IMPORT_TITLE: "Skip Keyword import for existing keys",
	SETTING_ALTERNATIVE_TAGS_TITLE: "Alternative tags",
	SETTING_ALTERNATIVE_TAGS_DESC: "Name of frontmatter field to use for tags instead of tags. Leave blank to used tags.",
	SETTING_QUICK_IMPORT_DESC: "If this is toggled then when pulling metadata from the image file, it will be skipped if there is already an internal metadate file with keywords. This saves time on imports, but if you change the meta in the original files those changes will not be reflected.",
	SETTING_HIDDEN_INFO_TITLE: "Default hidden info",
	SETTING_HIDDEN_INFO_DESC: "When no hidden info items are specified in an image info block these info items will be hidden.",
	SETTING_HIDDEN_INFO_PLACEHOLDER: "New Hidden Field",
	SETTING_HIDDEN_INFO_ADD: "Add this field to hidden info list",
	SETTING_HIDDEN_INFO_RESET: "Reset hidden info list to defaults",
	SETTING_HIDDEN_INFO_REMOVE: "Remove from List",
	SETTING_AUTO_COMPLETE_TITLE: "Autocomplete fields",
	SETTING_AUTO_COMPLETE_DESC: "Property fields to be searched for auto complete and display in the info block like extra tag fields",
	SETTING_AUTO_COMPLETE_PLACEHOLDER: "New Autocomplete Field",
	SETTING_AUTO_COMPLETE_ADD: "Add this field to autocomplete list",
	SETTING_AUTO_COMPLETE_RESET: "Reset autocomplete list to defaults",
	SETTING_UNIQUE_MOBILE_TITLE: "Distinct settings on mobile",
	SETTING_UNIQUE_MOBILE_DESC: "Should settings in the Platform settings section be different on mobile than desktop?",
	SETTING_PLATFORM_HEADER: "Platform settings",
	SETTING_CONTEXT_INFO_TITLE: "Info panel anywhere",
	SETTING_CONTEXT_INFO_DESC: "Should right clicking on an image anywhere open the info panel?",
	SETTING_CONTEXT_MENU_TITLE: "Image menu anywhere",
	SETTING_CONTEXT_MENU_DESC: "Should right clicking on an image anywhere open the info menu?",
	SETTING_FILTER_HEADER: "User filters",
	SETTING_FILTER_REMOVE: "Remove from List",

	// Gallery View
	GALLERY_VIEW_TITLE: "Gallery View",
	FILTER_TOOLTIP: "Filter Actions",
	SEARCH_TOOLTIP: "Change Search Bar",
	INFO_TOGGLE_TOOLTIP: "Toggle the info panel",
	SORT_ORDER_TOOLTIP: "Sort Options",
	COUNT_TOOLTIP: "Number of files displayed by filter out of files the gallery could display",
	FILTER_PATH_TOOLTIP: "Folder to search",
	FILTER_PATH_PROMPT: "Path",
	FILTER_NAME_TOOLTIP: "File name contains",
	FILTER_NAME_PROMPT: "File Name",
	FILTER_TAGS_TOOLTIP: `partial tags seperated by spaces. Minus in front of a tag excludes it. eg "drawing -sketch fant" to include drawing and fantasy tags, but exclude sketches.`,
	FILTER_TAGS_PROMPT: "Tags to search",
	FILTER_MATCH_CASE_TOOLTIP: "Should tags match exact case",
	FILTER_EXCLUSIVE_TOOLTIP: "Should search include only results that match all tags?",
	FILTER_WIDTH_TOOLTIP: "Change the display width of columns",
	FILTER_RANDOM_TOOLTIP: "Randomise images",
	FILTER_RANDOM_COUNT_TOOLTIP: "number of random images to grab",
	FILTER_ADVANCED_TOOLTIP: `Build a complex filter
	---
	path: path to search in (strict)
	name: file name criteria (strict)
	regex: custom search regex (strict)
	tags: search for tags
	<front matter field>: search a custom frontmatter field
	
	Tag and frontmatter fields can also use these modifiers in front of a tag
	---
	!tag Strictly require this tag to be on the image
	-tag Strictly exclude images that have this tag
	^tag match case on this tag`,
	CANCEL_LOAD_NOTICE: "Canceled indexing, Tag search may be limited",
	BAD_REGEX_WARNING: "Gallery Search - BAD REGEX! regex set to '.*' as default!!",

	// Sort Menu
	SORT_HEADER: "Change Sorting",
	SORT_OPTION_1: "File Name",
	SORT_OPTION_2: "File Path",
	SORT_OPTION_3: "Date Added",
	SORT_OPTION_4: "Date Modified",
	SORT_OPTION_5: "File Size",
	SORT_OPTION_6: "Reverse",
	
	// Filter Menu
	FILTER_HEADER: "Filter Actions",
	FILTER_OPTION_1: "Copy Current Filter",
	FILTER_OPTION_2: "Filter From Clipboard",
	FILTER_OPTION_3: "Clear Filter",
	FILTER_OPTION_4: "Save Filter From Clipboard",
	FILTER_OPTION_5: "Save Filter From Current",
	FILTER_NEW_INFO: "Enter name for new filter",

	// Filter Type Menu
	FILTER_TYPE_HEADER: "Change Search Bar",
	FILTER_TYPE_OPTION_0: "Hidden",
	FILTER_TYPE_OPTION_1: "Simple Filter",
	FILTER_TYPE_OPTION_2: "Classic Filter",
	FILTER_TYPE_OPTION_3: "Advanced Filter",

	// Image Menu
	IMAGE_MENU_NOTHING: "Nothing selected",
	IMAGE_MENU_SINGLE: `"{0}" selected`,
	IMAGE_MENU_COUNT: "{0} selected",
	IMAGE_MENU_COMMAND_0: "You should never see this",
	IMAGE_MENU_COMMAND_1: "Open image file",
	IMAGE_MENU_COMMAND_2: "Open meta file",
	IMAGE_MENU_COMMAND_3: "Start Selection",
	IMAGE_MENU_COMMAND_4: "End Selection",
	IMAGE_MENU_COMMAND_5: "Select all",
	IMAGE_MENU_COMMAND_6: "Clear selection",
	IMAGE_MENU_COMMAND_7: "Copy image links",
	IMAGE_MENU_COMMAND_8: "Copy meta links",
	IMAGE_MENU_COMMAND_9: "Add tag",
	IMAGE_MENU_COMMAND_10: "Pull meta from file",
	IMAGE_MENU_COMMAND_11: "Remove tag",
	IMAGE_MENU_COMMAND_12: "Move images",
	IMAGE_MENU_COMMAND_13: "Rename",
	IMAGE_MENU_COMMAND_14: "Delete image(and meta)",
	IMAGE_MENU_COMMAND_15: "Delete just meta",
	IMAGE_MENU_COMMAND_16: "Copy image",
	IMAGE_MENU_COMMAND_17: "Share media",
	IMAGE_MENU_COMMAND_18: "Open info panel",
	IMAGE_MENU_COMMAND_19: "Copy images as filter",
	MENU_OPTION_FAULT: "context options {0} is not accounted for",
	MASS_CONTEXT_CONFIRM: "There are {0} files selected for '{1}' are you sure?",
	COPIED_MEDIA: "Media copied to clipboard",
	COPIED_LINKS: "Links copied to clipboard",
	COPIED_FILTER: "Filter copied to clipboard",
	ADDED_TAG: "Tag added to files",
	REMOVED_TAG: "Tag removed from files",
	MOVED_IMAGE: "Images moved",
	DELETED_META: "Meta deleted",
	DELETED_IMAGE: "Images and meta deleted",
	PROMPT_FOR_NEW_NAME: "Select a new name and path",
	CONFLICT_NOTICE_PATH: "ERROR: File already exists at '{0}'",
	PLATFORM_COPY_NOT_SUPPORTED: "This platform does not currently support copying videos to the clipboard",
	PLATFORM_EXEC_FAILURE: "Copy to clipboard failed, full error sent to console.",
	CAN_NOT_SHARE: "Unable to share",

	// Side Panel
	SIDE_PANEL_EDIT_TOOLTIP: "Switch to edit mode",
	SIDE_PANEL_VIEW_TOOLTIP: "Switch to view mode",
	SIDE_PANEL_SAVE_NOTICE: "Saved Changes",

	// Info Block
	IMAGE_INFO_TITLE: "Image Info",
	IMAGE_PATH_FAILED_FIND_WARNING: "### File path not found. Were you looking for one of these?\n",
	IMAGE_INFO_FIELD_NAME: "Name",
	IMAGE_INFO_FIELD_PATH: "Path",
	IMAGE_INFO_FIELD_EXTENSION: "Extension",
	IMAGE_INFO_FIELD_SIZE: "Size",
	IMAGE_INFO_FIELD_DIMENSIONS: "Dimensions",
	IMAGE_INFO_FIELD_DATE: "Date",
	IMAGE_INFO_FIELD_IMAGE_TAGS: "Image Tags",
	IMAGE_INFO_FIELD_NEW_TAG: "New Tag",
	IMAGE_INFO_FIELD_BACKLINKS: "Backlinks",
	IMAGE_INFO_FIELD_INFOLINKS: "Info Links",
	IMAGE_INFO_FIELD_RELATED: "Related Files",
	IMAGE_INFO_FIELD_PALETTE: "Color Palette",
	IMAGE_INFO_PAGING_START: "|Start|",
	IMAGE_INFO_PAGING_PREV: "<<Prev",
	IMAGE_INFO_PAGING_NEXT: "Next>>",

	// Warning instructions
	TOAST_ADDITIONAL_CONTEXT: "(click=Dismiss, right-click={0})",
	TOAST_ADDITIONAL: "(click=Dismiss)",
	CONTEXT_INFO: "Info",
	BOOTSTRAP_FAILURE: "Bootstrap process failure in {0}. Plugin may not function without restart.",
	CONTEXT_RETRY: "Restart",
	CAUSE_TAG_CACHE: "tag cache",
	CAUSE_IMAGE_RESOURCES: "image resources",
	CAUSE_META_RESOURCES: "meta resources",
	WARN_NO_FILTER_NAME: "No filter found named {0}",
	WARN_NO_FILTER_INDEX: "There are fewer than {0} filters.",
	GALLERY_RESOURCES_MISSING: `
<div class="gallery-resources-alert">
	<strong>Missing or Unspecified Image Information Resources folder</strong>
</div>

Please make sure that a Valid Folder is specified in the settings for the plugin to use to store image information notes!
`,

	GALLERY_INFO_USAGE: `
e.g. Input:

\`\`\`
imgPath:Resources/Images/Image_example_1.png
ignoreInfo:Name;tags;size;backlinks
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
`,

	GALLERY_DISPLAY_USAGE: `
e.g. Input:

\`\`\`gallery
type:active-thumb
path:Weekly
name:.*Calen
tags:photo -car fam
exclusive:true
matchCase:false
imgWidth:400
imgHeight:400
divWidth:70
divAlign:left
divHeight:1400
reverseOrder:false
customList:5 10 2 4
random:0
\`\`\`

----
Full documentation on gallery blocks at:<br>
https://github.com/TomNCatz/obsidian-gallery/blob/main/docs/READEME_DisplayBlocks.md
`
}