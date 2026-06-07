import { ItemView, MarkdownRenderer, Notice, TFile, WorkspaceLeaf, setIcon, type ViewStateResult } from "obsidian"
import type GalleryTagsPlugin from "../main"
import { getImageInfo, validString } from "../utils"
import { OB_GALLERY_INFO } from "../TechnicalFiles/Constants"
import { loc } from '../Loc/Localizer'

export class GalleryInfoView extends ItemView
{
  viewEl: HTMLElement
  previewEl: HTMLElement
  sourceEl: HTMLElement
  editorEl: HTMLTextAreaElement
  infoFile: TFile | null = null
  plugin: GalleryTagsPlugin
  fileContent: string
  editing: boolean = false;
  editToggle: HTMLAnchorElement

  constructor(leaf: WorkspaceLeaf, plugin: GalleryTagsPlugin)
  {
    super(leaf)
    this.plugin = plugin

    // Get View Container Element
    this.viewEl = this.containerEl.getElementsByClassName('view-content')[0] as HTMLElement
    // Add Preview Mode Container
    this.previewEl = this.viewEl.createDiv({
      cls: 'markdown-preview-view',
    })
    
    this.editToggle = this.previewEl.createEl('a',{
      cls: 'view-action',
      attr: { 'aria-label': loc('SIDE_PANEL_EDIT_TOOLTIP')}
    })
    
    this.editToggle.addEventListener('click', (event) =>
    {
      this.editing = !this.editing;
      
      this.updateToggleButton();
      this.render();
    });

    this.contentEl = this.previewEl.createDiv({
      cls: 'markdown-preview-sizer markdown-preview-section gallery-info-panel'
    })
    // Add Source Mode Container
    this.sourceEl = this.viewEl.createDiv({ cls: 'cm-s-obsidian', attr: { style: 'display: none' } })
    // Add code mirro editor
    this.editorEl = this.sourceEl.createEl('textarea', { cls: 'image-info-cm-editor' })

    this.render = this.render.bind(this);
    this.clear = this.clear.bind(this);
    this.updateInfoDisplay = this.updateInfoDisplay.bind(this);
  }

  getViewType(): string
  {
    return OB_GALLERY_INFO
  }

  getDisplayText(): string
  {
    return loc("IMAGE_INFO_TITLE");
  }

  getIcon(): string
  {
    return 'image'
  }

	getState() 
  {
		return {
			filePath: this.infoFile.path,
		};
	}

	async setState(
		state: { filePath: string },
		result: ViewStateResult
	): Promise<void> 
  {
    if(this.infoFile != null)
    {
		  super.setState(state, result);
      return;
    }

		if (state && typeof state === "object") 
    {
			if ( "filePath" in state &&
				state.filePath &&
				typeof state.filePath === "string")
      {
        const infoFile = this.plugin.app.vault.getAbstractFileByPath(state.filePath);
      
        if(infoFile instanceof TFile)
        {
          this.infoFile = infoFile;
          this.updateInfoDisplay(null);
        }
			}
		}
    
		super.setState(state, result);
	}


  async onClose(): Promise<void>
  {
    // Clear the preview and editor history
    this.clear()
    await Promise.resolve()
  }

  onload(): void
  {    
  }

  static async OpenLeaf(plugin: GalleryTagsPlugin, imgPath:string = null) : Promise<GalleryInfoView>
  {
    if(!validString(imgPath, 4))
    {
      return;
    }
    
    // Open Info panel
    const workspace = plugin.app.workspace
    let infoView = workspace.getLeavesOfType(OB_GALLERY_INFO)[0]

    if (!infoView)
    {
      if (!workspace.layoutReady)
      {
        return;
      }

      await workspace.getRightLeaf(false).setViewState({ type: OB_GALLERY_INFO })
      infoView = workspace.getLeavesOfType(OB_GALLERY_INFO)[0];
    }
    
    workspace.revealLeaf(infoView);
    
    if (infoView?.view instanceof GalleryInfoView)
    {
      infoView.view.updateInfoDisplay(imgPath);
      
      return infoView.view;
    }

    return null;
  }

  static closeInfoLeaf(plugin: GalleryTagsPlugin)
  {
    plugin.app.workspace.detachLeavesOfType(OB_GALLERY_INFO)
  }

  async updateInfoDisplay(imgPath: string)
  {
    if(!validString(imgPath, 4))
    {
      if(!this.infoFile)
      {
        return;
      }
    }
    else
    {
      this.plugin.app.workspace.requestSaveLayout();

      this.infoFile = await getImageInfo(imgPath, true, this.plugin);
    }

    if(!this.infoFile)
    {
      return;
    }

    this.editing = false;
    this.updateToggleButton();

    this.plugin.app.workspace.requestSaveLayout();

    // Handle disabled img info functionality or missing info block
    let infoText = loc('GALLERY_RESOURCES_MISSING');
    if (this.infoFile)
    {
      infoText = await this.app.vault.cachedRead(this.infoFile)
    }

    // Clear the preview and editor history
    this.clear()

    this.fileContent = infoText
    this.render()
  }

  updateToggleButton()
  {
    if(this.infoFile)
    {
      setIcon(this.editToggle, this.editing ? "book-open" : "pencil");
    }
    else
    {
      setIcon(this.editToggle, "");
    }
  }

  async render(): Promise<void>
  {
    this.contentEl.empty();
    if(this.editing)
    {
      const test = this.contentEl.createEl("textarea", {cls: "gallery-info-panel-edit"} );
      test.value = this.fileContent;
      test.addEventListener('blur', async () => {
        if(this.fileContent == test.value)
        {
          return;
        }

        this.fileContent = test.value;
        await this.plugin.app.vault.modify(this.infoFile, this.fileContent);
        new Notice(loc('SIDE_PANEL_SAVE_NOTICE'));
      });
    }
    else
    {
      MarkdownRenderer.render(this.app, this.fileContent, this.contentEl, this.infoFile.path, this);
    }
  }

  clear(): void
  {
    this.contentEl.empty()
    this.fileContent = ''
  }
}
