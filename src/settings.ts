import { type App, PluginSettingTab, Setting } from 'obsidian'
import type GalleryTagsPlugin from './main'
import { FuzzyFiles, FuzzyFolders } from './DisplayObjects/FuzzySuggestions'


export class GallerySettingTab extends PluginSettingTab
{
  plugin: GalleryTagsPlugin

  constructor(app: App, plugin: GalleryTagsPlugin)
  {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void
  {
    const { containerEl } = this
    let hiddenInfoInput = ''
    let fuzzyFolders = new FuzzyFolders(this.app)
    let fuzzyFiles = new FuzzyFiles(this.app)

    containerEl.empty()

    // Main gallery path
    const galleryOpenPathSetting = new Setting(containerEl)
    .setName('Main gallery default path')
    .setDesc(`The path from which to show images when the main gallery is opened. 
          Setting it to \`/\` will show all images in the vault. 
          Can be used to avoid the loading all images and affecting on open performance 
          (especially if vault has a huge amount of high quality images). 
          Setting it to an invalid path to have no images shown when gallery is opened.`)
    .addButton(text => text
      .setButtonText(this.plugin.settings.galleryLoadPath)
      .onClick(() =>
      {
        fuzzyFolders.onSelection = (s) =>{
          this.plugin.settings.galleryLoadPath = s
          galleryOpenPathSetting.settingEl.querySelector('button').textContent = this.plugin.settings.galleryLoadPath
          this.plugin.saveSettings()
        }

        fuzzyFolders.open()
      }))
    
    // Gallery search bar
    new Setting(containerEl)
      .setName('Filter starts open in main gallery')
      .setDesc('Toggle this option to have the filter header start open.')
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.settings.filterStartOpen)
        toggle.onChange(async (value) =>
        {
          this.plugin.settings.filterStartOpen = value
          await this.plugin.saveSettings()
        });
      })

    // Default image width
    new Setting(containerEl)
      .setName('Default image width')
      .setDesc('Display default image width in `pixels`. Image collumns will be no wider than this by default')
      .addText(text => text
        .setPlaceholder(`${this.plugin.settings.width}`)
        .onChange(async (value) =>
        {
          const numValue = parseInt(value)
          if (isNaN(numValue))
          {
            return;
          }

          this.plugin.settings.width = Math.abs(numValue)
          await this.plugin.saveSettings()
        }))
     
    
    // Use max height?
    new Setting(containerEl)
      .setName('Use max image height')
      .setDesc('Toggle this option to set a max image height for images to display in collumns.')
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.settings.useMaxHeight)
        toggle.onChange(async (value) =>
        {
          this.plugin.settings.useMaxHeight = value;
          await this.plugin.saveSettings();
          this.display();
        });
      })

    // Max image height
    if(this.plugin.settings.useMaxHeight)
    {
      new Setting(containerEl)
      .setName('Max image height')
      .setDesc('Max image height in `pixels` for images to display in collumns.')
      .addText(text => text
        .setPlaceholder(`${this.plugin.settings.maxHeight}`)
        .onChange(async (value) =>
        {
          const numValue = parseInt(value)
          if (isNaN(numValue))
          {
            return;
          }

          this.plugin.settings.maxHeight = Math.abs(numValue)
          await this.plugin.saveSettings()
        }))
    }
    
    // Hidden meta fields
    new Setting(containerEl)
      .setName('Default hidden info')
      .setDesc(`When no hidden info items are specified in an image info block these info items will be hidden.`)
      .addButton(text => text
        .setButtonText('Save')
        .onClick(() =>
        {
          this.plugin.settings.hiddenInfo = hiddenInfoInput
          hiddenInfoInput = ''
          this.plugin.saveSettings()
        }))
      .addText(text => text
        .setPlaceholder(this.plugin.settings.hiddenInfo)
        .onChange(async (value) =>
        {
          hiddenInfoInput = value.trim()
        }))

    // Gallery Meta Section
    containerEl.createEl('h2', { text: 'Image Metadata' })
    
    // Gallery meta folder
    const infoPathSetting = new Setting(containerEl)
      .setName('Gallery info folder')
      .setDesc('')
      .addButton(text => text
        .setButtonText(this.plugin.settings.imgDataFolder)
        .onClick(() =>
        {
          fuzzyFolders.onSelection = (s) =>{
            this.plugin.settings.imgDataFolder = s
            infoPathSetting.settingEl.querySelector('button').textContent = this.plugin.settings.imgDataFolder
            this.plugin.saveSettings()
          }

          fuzzyFolders.open()
        }))
        
    infoPathSetting.descEl.createDiv({ text: 'Specify an existing vault folder for the gallery plugin to store image information/notes as markdown files.' })
    infoPathSetting.descEl.createDiv({ text: 'E.g. \`Resources/Gallery\`.', attr: { style: 'color: indianred;' } })
    infoPathSetting.descEl.createDiv({ text: 'On first activation the default is unspecified. Thus the info functionality of the Main gallery is diabled.' })
    infoPathSetting.descEl.createDiv({ text: 'Folder must already exist (plugin will not create it).', attr: { style: 'font-weight: 900;' } })
    infoPathSetting.descEl.createDiv({ text: 'If a folder is not specified no Image Information notes are created (to be used in the main gallery).' })

    // Meta template file    
    const metaTemplatSetting = new Setting(containerEl)
      .setName('Meta file template override')
      .setDesc('')
      .addButton(text => text
        .setButtonText(this.plugin.settings.imgmetaTemplatePath)
        .onClick(() =>
        {
          fuzzyFiles.onSelection = (s) =>{
            this.plugin.settings.imgmetaTemplatePath = s.substring(0,s.length-3)
            metaTemplatSetting.settingEl.querySelector('button').textContent = this.plugin.settings.imgmetaTemplatePath
            this.plugin.saveSettings()
          }

          fuzzyFiles.open()
        }))
    metaTemplatSetting.descEl.createDiv({ text: 'Location of template file to use for generating image meta files. If blank will use default.' })
    metaTemplatSetting.descEl.createDiv({ text: 'These keys will be replaced with the apropriate info for the file:' })
    metaTemplatSetting.descEl.createDiv({ text: '<% IMG LINK %> : Clickable link to the image with its name as the text' })
    metaTemplatSetting.descEl.createDiv({ text: '<% IMG EMBED %> : Embeded view of the image' })
    metaTemplatSetting.descEl.createDiv({ text: '<% IMG INFO %> : Info block for the image' })
    metaTemplatSetting.descEl.createDiv({ text: '<% IMG URI %> : The formatted URI for the image that can be used to generate a link to it' })
    metaTemplatSetting.descEl.createDiv({ text: '<% IMG PATH %> : Path to the image(including file name)' })
    metaTemplatSetting.descEl.createDiv({ text: '<% IMG NAME %> : File name for the image' })
  }
}
