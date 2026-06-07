import { type App, PluginSettingTab, Setting } from 'obsidian'
import type GalleryTagsPlugin from './main'
import { FuzzyFiles, FuzzyFolders } from './Modals/FuzzySearches'
import { DEFAULT_HIDDEN_INFO } from './TechnicalFiles/Constants'
import { loc } from './Loc/Localizer'
import { FilterType } from './TechnicalFiles/FilterType'
import { validString } from './utils'


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

    // Refresh Data button TODO: this is kinda stupid and I should figure out a way to have it sort itself out without the user needing to do anything
    new Setting(containerEl)
    .setName(loc('SETTING_DATA_REFRESH_TITLE'))
    .setDesc(loc('SETTING_DATA_REFRESH_DESC'))
    .addButton(text => text
      .setButtonText(loc('SETTING_DATA_REFRESH_BUTTON'))
      .onClick(() =>
      {
        this.plugin.buildCaches(); 
      }));
    
    // Unique Mobile Settings
    new Setting(containerEl)
      .setName(loc('SETTING_UNIQUE_MOBILE_TITLE'))
      .setDesc(loc('SETTING_UNIQUE_MOBILE_DESC'))
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.gSettings.uniqueMobileSettings)
        toggle.onChange(async (value) =>
        {
          this.plugin.gSettings.uniqueMobileSettings = value
          await this.plugin.saveSettings()
        });
      })
    
    // Platform Specific Section
    containerEl.createEl('h2', { text: loc('SETTING_PLATFORM_HEADER') })

    // Should right click open the side panel anywhere in the app?
    new Setting(containerEl)
      .setName(loc('SETTING_CONTEXT_INFO_TITLE'))
      .setDesc(loc('SETTING_CONTEXT_INFO_DESC'))
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.platformSettings().rightClickInfo)
        toggle.onChange(async (value) =>
        {
          this.plugin.platformSettings().rightClickInfo = value
          await this.plugin.saveSettings()
        });
      })

    // Should right click open the image menu anywhere in the app?
    new Setting(containerEl)
      .setName(loc('SETTING_CONTEXT_MENU_TITLE'))
      .setDesc(loc('SETTING_CONTEXT_MENU_DESC'))
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.platformSettings().rightClickMenu)
        toggle.onChange(async (value) =>
        {
          this.plugin.platformSettings().rightClickMenu = value
          await this.plugin.saveSettings()
        });
      })

    // Gallery search bar
    new Setting(containerEl)
      .setName(loc('SETTING_FILTER_TITLE'))
      .setDesc(loc('SETTING_FILTER_DESC'))
      .addDropdown(dropdown => 
      {
        if(this.plugin.platformSettings().filterType == undefined)
        {
          this.plugin.platformSettings().filterType = FilterType.NONE;
        }
        
        //@ts-ignore
        dropdown.addOption(FilterType[FilterType.NONE], loc("FILTER_TYPE_OPTION_"+FilterType.NONE));
        //@ts-ignore
        dropdown.addOption(FilterType[FilterType.SIMPLE], loc("FILTER_TYPE_OPTION_"+FilterType.SIMPLE));
        //@ts-ignore
        dropdown.addOption(FilterType[FilterType.CLASSIC], loc("FILTER_TYPE_OPTION_"+FilterType.CLASSIC));
        //@ts-ignore
        dropdown.addOption(FilterType[FilterType.ADVANCED], loc("FILTER_TYPE_OPTION_"+FilterType.ADVANCED));

        dropdown.setValue(FilterType[this.plugin.platformSettings().filterType]);

        dropdown.onChange( async value =>
        {
          switch(value)
          {
            case FilterType[FilterType.NONE] : this.plugin.platformSettings().filterType = FilterType.NONE; break;
            case FilterType[FilterType.SIMPLE] : this.plugin.platformSettings().filterType = FilterType.SIMPLE; break;
            case FilterType[FilterType.CLASSIC] : this.plugin.platformSettings().filterType = FilterType.CLASSIC; break;
            case FilterType[FilterType.ADVANCED] : this.plugin.platformSettings().filterType = FilterType.ADVANCED; break;
            default: return;
          }
          
          await this.plugin.saveSettings();
        });
      });

    
    // Default Filter
    new Setting(containerEl)
      .setName(loc('SETTING_DEFAULT_FILTER_TITLE'))
      .setDesc(loc('SETTING_DEFAULT_FILTER_DESC'))
      .addDropdown(dropdown => 
      {
        dropdown.addOption("", loc('SETTING_DEFAULT_FILTER_NONE'));
        dropdown.addOption("LAST_USED_FILTER", loc('LAST_USED_FILTER'));

        for (let i = 0; i < this.plugin.gSettings.namedFilters.length; i++) 
        {
          const name = this.plugin.gSettings.namedFilters[i].name;
          dropdown.addOption(name, name);
        }
        
        if(validString(this.plugin.platformSettings().defaultFilter))
        {
          dropdown.setValue(this.plugin.platformSettings().defaultFilter);
        }
        else
        {
          dropdown.setValue("");
        }

        dropdown.onChange( async value =>
        {
          this.plugin.platformSettings().defaultFilter = value;
          
          await this.plugin.saveSettings();
        });
      });

    // Default image width
    new Setting(containerEl)
      .setName(loc('SETTING_IMAGE_WIDTH_TITLE'))
      .setDesc(loc('SETTING_IMAGE_WIDTH_DESC'))
      .addText(text => text
        .setPlaceholder(`${this.plugin.platformSettings().width}`)
        .onChange(async (value) =>
        {
          const numValue = parseInt(value)
          if (isNaN(numValue))
          {
            return;
          }

          this.plugin.platformSettings().width = Math.abs(numValue)
          await this.plugin.saveSettings()
        }))
     
    
    // Use max height?
    new Setting(containerEl)
      .setName(loc('SETTING_MAX_HEIGHT_TOGGLE_TITLE'))
      .setDesc(loc('SETTING_MAX_HEIGHT_TOGGLE_DESC'))
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.platformSettings().useMaxHeight)
        toggle.onChange(async (value) =>
        {
          this.plugin.platformSettings().useMaxHeight = value;
          await this.plugin.saveSettings();
          this.display();
        });
      })

    // Max image height
    if(this.plugin.platformSettings().useMaxHeight)
    {
      new Setting(containerEl)
      .setName(loc('SETTING_MAX_HEIGHT_TITLE'))
      .setDesc(loc('SETTING_MAX_HEIGHT_DESC'))
      .addText(text => text
        .setPlaceholder(`${this.plugin.platformSettings().maxHeight}`)
        .onChange(async (value) =>
        {
          const numValue = parseInt(value)
          if (isNaN(numValue))
          {
            return;
          }

          this.plugin.platformSettings().maxHeight = Math.abs(numValue)
          await this.plugin.saveSettings()
        }))
    }
    
    // Gallery Meta Section
    containerEl.createEl('h2', { text: loc('SETTING_METADATA_HEADER') })
    
    // Gallery meta folder
    const infoPathSetting = new Setting(containerEl)
      .setName(loc('SETTING_META_FOLDER_TITLE'))
      .setDesc('')
      .addButton(text => text
        .setButtonText(this.plugin.gSettings.imgDataFolder)
        .onClick(() =>
        {
          fuzzyFolders.onSelection = (s) =>{
            this.plugin.gSettings.imgDataFolder = s
            infoPathSetting.settingEl.querySelector('button').textContent = this.plugin.gSettings.imgDataFolder
            this.plugin.saveSettings()
          }

          fuzzyFolders.open()
        }))
        
    infoPathSetting.descEl.createDiv({ text: loc('SETTING_META_FOLDER_DESC1') })
    infoPathSetting.descEl.createDiv({ text: loc('SETTING_META_FOLDER_DESC2'), attr: { style: 'color: indianred;' } })
    infoPathSetting.descEl.createDiv({ text: loc('SETTING_META_FOLDER_DESC3') })
    infoPathSetting.descEl.createDiv({ text: loc('SETTING_META_FOLDER_DESC4'), attr: { style: 'font-weight: 900;' } })
    infoPathSetting.descEl.createDiv({ text: loc('SETTING_META_FOLDER_DESC5') })
    
    // Alternative tags field
    new Setting(containerEl)
      .setName(loc('SETTING_ALTERNATIVE_TAGS_TITLE'))
      .setDesc(loc('SETTING_ALTERNATIVE_TAGS_DESC'))
      .addText(text =>
        {
          text
          .setValue(this.plugin.gSettings.alternativeTags)
          .onChange(async value =>
            {
              this.plugin.gSettings.alternativeTags = value;
              await this.plugin.saveSettings();
              this.plugin.buildTagCache();
            });
        })
        
    // Should add keys even if they already exist
    new Setting(containerEl)
      .setName(loc('SETTING_QUICK_IMPORT_TITLE'))
      .setDesc(loc('SETTING_QUICK_IMPORT_DESC'))
      .addToggle((toggle) =>
      {
        toggle.setValue(this.plugin.gSettings.skipMetadataOverwrite)
        toggle.onChange(async (value) =>
        {
          this.plugin.gSettings.skipMetadataOverwrite = value
          await this.plugin.saveSettings()
        });
      })

    // Meta template file    
    const metaTemplatSetting = new Setting(containerEl)
      .setName(loc('SETTING_META_TEMPLATE_TITLE'))
      .setDesc('')
      .addButton(text => text
        .setButtonText(this.plugin.gSettings.imgmetaTemplatePath)
        .onClick(() =>
        {
          fuzzyFiles.onSelection = (s) =>{
            this.plugin.gSettings.imgmetaTemplatePath = s.substring(0,s.length-3)
            metaTemplatSetting.settingEl.querySelector('button').textContent = this.plugin.gSettings.imgmetaTemplatePath
            this.plugin.saveSettings()
          }

          fuzzyFiles.open()
        }))
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC1') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC2') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC3') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC4') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC5') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC6') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC7') });
    metaTemplatSetting.descEl.createDiv({ text: loc('SETTING_META_TEMPLATE_DESC8') });
    
    // Hidden meta fields
    const hiddenInfoSetting = new Setting(containerEl)
      .setName(loc('SETTING_HIDDEN_INFO_TITLE'))
      .setTooltip(loc('SETTING_HIDDEN_INFO_DESC'))
      .setDesc(``)
      .addText(text => text
        .setPlaceholder(loc('SETTING_HIDDEN_INFO_PLACEHOLDER'))
        .onChange(async (value) =>
        {
          value = value.trim();
          hiddenInfoInput = value;
        }))
      .addButton(text => text
        .setIcon("plus")
        .setTooltip(loc('SETTING_HIDDEN_INFO_ADD'))
        .onClick(() =>
        {
          this.plugin.gSettings.hiddenInfoTicker[hiddenInfoInput] = true;
          hiddenInfoInput = '';
          this.plugin.saveSettings();
          this.display();
        }))
      .addButton(text => text
        .setIcon('rotate-ccw')
        .setTooltip(loc('SETTING_HIDDEN_INFO_RESET'))
        .onClick(() =>
        {
          this.plugin.gSettings.hiddenInfoTicker = Object.assign({}, DEFAULT_HIDDEN_INFO);
          this.plugin.saveSettings();
          this.display();
        }));
      
    this.drawToggleLists(hiddenInfoSetting.descEl, this.plugin.gSettings.hiddenInfoTicker);

    // Auto complete fields
    const autoCompleteSetting = new Setting(containerEl)
      .setName(loc('SETTING_AUTO_COMPLETE_TITLE'))
      .setTooltip(loc('SETTING_AUTO_COMPLETE_DESC'))
      .setDesc(``)
      .addText(text => text
        .setPlaceholder(loc('SETTING_AUTO_COMPLETE_PLACEHOLDER'))
        .onChange(async (value) =>
        {
          value = value.trim();
          hiddenInfoInput = value;
        }))
      .addButton(text => text
        .setIcon("plus")
        .setTooltip(loc('SETTING_AUTO_COMPLETE_ADD'))
        .onClick(() =>
        {
          this.plugin.gSettings.autoCompleteFields[hiddenInfoInput] = true;
          hiddenInfoInput = '';
          this.plugin.saveSettings();
          this.display();
        }))
      .addButton(text => text
        .setIcon('rotate-ccw')
        .setTooltip(loc('SETTING_AUTO_COMPLETE_RESET'))
        .onClick(() =>
        {
          this.plugin.gSettings.autoCompleteFields = {};
          this.plugin.saveSettings();
          this.display();
        }));
      
    this.drawToggleLists(autoCompleteSetting.descEl, this.plugin.gSettings.autoCompleteFields);
    
    // Gallery Meta Section
    containerEl.createEl('h2', { text: loc('SETTING_METADATA_HEADER') })
    
    for (let i = 0; i < this.plugin.gSettings.namedFilters.length; i++) 
    {
      const filter = this.plugin.gSettings.namedFilters[i];

      new Setting(containerEl)
        .setName(filter.name)
        .addTextArea(text =>
          {
            text
            .setValue(filter.filter)
            .onChange(async value =>
              {
                filter.filter = value;
                await this.plugin.saveSettings();
              });

            text.inputEl.style.width = "100%";
          })
        .addButton(button => 
          {
            button
            .setIcon("trash-2")
            .setTooltip(loc('SETTING_FILTER_REMOVE'))
            .onClick(async () => 
            {
              delete this.plugin.gSettings.namedFilters[i];
              await this.plugin.saveSettings();
              this.display();
            })
          })
    }
  }

  drawToggleLists(containerEl:HTMLElement, records:Record<string, boolean>)
  {
    const fields = Object.keys(records)
    for (let i = 0; i < fields.length; i++) 
    {
      const element = fields[i];
      new Setting(containerEl)
        .setName(element)
        .addToggle((toggle) =>
        {
          toggle.setValue(records[element])
          toggle.onChange(async (value) =>
          {
            records[element] = value;
            await this.plugin.saveSettings();
          });
        })
        .addButton(button => 
        {
          button
          .setIcon("trash-2")
          .setTooltip(loc('SETTING_HIDDEN_INFO_REMOVE'))
          .onClick(async () => 
          {
            delete records[element];
            await this.plugin.saveSettings();
            this.display();
          })
        })
    }
  }
}
