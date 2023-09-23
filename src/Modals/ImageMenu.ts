import type { ImageGrid } from "../DisplayObjects/ImageGrid";
import type GalleryTagsPlugin from "../main";
import { addEmbededTags, createMetaFile, offScreenPartial, preprocessUri } from "../utils";
import { Notice, Platform, TFile } from "obsidian";
import type { GalleryInfoView } from "../DisplayObjects/GalleryInfoView";
import { FuzzyFolders, FuzzyTags } from "./FuzzySuggestions";
import { ConfirmModal } from "./ConfirmPopup";
import { ProgressModal } from "./ProgressPopup";
import { loc } from '../Loc/Localizer'

enum Options
{
	Error = 0,
	OpenImageFile = 1,
	OpenMetaFile = 2,
	StartSelection = 3,
	EndSelection = 4,
	SelectAll = 5,
	ClearSelection = 6,
	CopyImageLinks = 7,
	CopyMetaLinks = 8,
	AddTag = 9,
	PullMetaFromFile = 10,
	RemoveTag = 11,
	MoveImages = 12,
	Rename = 13,
	DeleteImage = 14,
	DeleteMeta = 15
}

export class ImageMenu
{
	#plugin: GalleryTagsPlugin
	#imageGrid:ImageGrid
	#infoView:GalleryInfoView
	#self: HTMLDivElement
	#options: HTMLDivElement
	#selected: HTMLDivElement
	#targets:(HTMLVideoElement|HTMLImageElement)[]


	constructor(posX:number, posY:number, targets:(HTMLVideoElement|HTMLImageElement)[], imageGrid:ImageGrid, plugin: GalleryTagsPlugin, infoView:GalleryInfoView = null)
	{
		this.#plugin = plugin;
		this.#imageGrid = imageGrid;
		this.#infoView = infoView;
		this.#targets = targets;
		this.#self = createDiv({cls: "suggestion-container"})
		this.#options = this.#self.createDiv("#suggestions-scroll");
		this.#options.style.maxHeight = "500px";
		this.#options.style.maxWidth = "200px";
		this.#options.style.overflowY = "auto";
		this.#self.tabIndex = 0;

		if(this.#targets.length == 0)
		{
			const info = this.#options.createDiv({cls: "suggestion-item"});
			info.innerText = 'Nothing selected';

			this.#options.createDiv({cls: "suggestion-item-separator"});

			if(!Platform.isDesktopApp)
			{
				this.#createItem(this.#imageGrid.selectMode ? Options.EndSelection : Options.StartSelection);
			}
			this.#createItem(Options.SelectAll);
		}
		else
		{
			if(this.#targets.length == 1)
			{
				const info = this.#options.createDiv({cls: "suggestion-item"});
				info.innerText = '"'+this.#imageGrid.imgResources[this.#targets[0].src]+'" selected';

				this.#options.createDiv({cls: "suggestion-item-separator"});

				this.#createItem(Options.OpenImageFile);
				this.#createItem(Options.OpenMetaFile);
			}

			if(this.#targets.length > 1)
			{
				const info = this.#options.createDiv({cls: "suggestion-item"});
				info.innerText = this.#targets.length+" selected";

				this.#options.createDiv({cls: "suggestion-item-separator"});

				this.#createItem(Options.ClearSelection);
			}

			if(this.#imageGrid && !Platform.isDesktopApp)
			{
				this.#createItem(this.#imageGrid.selectMode ? Options.EndSelection : Options.StartSelection);
			}
			this.#createItem(Options.SelectAll);
			
			this.#options.createDiv({cls: "suggestion-item-separator"});

			this.#createItem(Options.CopyImageLinks);
			this.#createItem(Options.CopyMetaLinks);
			
			this.#options.createDiv({cls: "suggestion-item-separator"});

			this.#createItem(Options.AddTag);
			this.#createItem(Options.PullMetaFromFile);
			this.#createItem(Options.RemoveTag);
			this.#createItem(Options.MoveImages);
			
			// if(this.#targets.length == 1)
			// {
			// 	this.#createItem("Rename");
			// }
			
			this.#options.createDiv({cls: "suggestion-item-separator"});

			this.#createItem(Options.DeleteImage);
			this.#createItem(Options.DeleteMeta);
		}

		this.#self.addEventListener("blur",async () => 
		{
			// TODO: I hate every single one of these, cause it means I'm waiting on something and I don't know what
			await new Promise(f => setTimeout(f, 100));
			this.#cleanUp();
		});

		this.#self.addEventListener("mouseleave", (e) => 
		{
			this.#cleanUp();
		});

		this.#show(posX,posY);
		
		this.#self.focus();
	}

	#createItem(command: Options)
	{
		const item = this.#options.createDiv({cls: "suggestion-item"});
		//@ts-ignore
		item.textContent = loc("IMAGE_MENU_COMMAND_"+command);
		item.dataset.href = Options[command];
		item.addEventListener("mouseover", (e) => {
			this.#select(item)
		});
		item.addEventListener("mousedown", () => {
			this.#submit();
		})

		if(Options[command].contains("Delete"))
		{
			item.style.color = "#cc2222";
		}
	}

	#select(item: HTMLDivElement)
	{
		if(this.#selected)
		{
			this.#selected.removeClass("is-selected");
		}

		this.#selected = item;

		if(item == null)
		{
			return;
		}

		item.addClass("is-selected");
	}

	#submit()
	{
		let result: Options = Options.Error;
		if(this.#selected)
		{
			//@ts-ignore
			const input : keyof typeof Options = this.#selected.dataset.href;
			result = Options[input]
		}

		this.#cleanUp();

		if(this.#targets.length < 50 ||
			(result == Options.StartSelection ||
			result == Options.EndSelection ||
			result == Options.SelectAll ||
			result == Options.ClearSelection ||
			result == Options.CopyImageLinks))
		{
			this.#results(result);
			return;
		}

		//@ts-ignore
		const commandText = loc("IMAGE_MENU_COMMAND_"+result);
		let confirmText: string = loc('MASS_CONTEXT_CONFIRM');
		confirmText = confirmText
			.replace('{count}', this.#targets.length.toString())
			.replace('{commandText}', commandText)

		const confirm = new ConfirmModal(this.#plugin.app, 
			confirmText,
			() => {this.#results(result);})
		confirm.open();
	}

	#results(result: Options)
	{
		switch(result)
		{
			case Options.OpenImageFile: this.#resultOpenImage(); break;
			case Options.OpenMetaFile: this.#resultOpenMeta(); break;
			case Options.StartSelection: this.#imageGrid.selectMode = true; break;
			case Options.EndSelection: this.#imageGrid.selectMode = false; break;
			case Options.SelectAll: this.#imageGrid.selectAll(); break;
			case Options.ClearSelection: this.#imageGrid.clearSelection(); break;
			case Options.CopyImageLinks: this.#resultCopyImageLink(); break;
			case Options.CopyMetaLinks: this.#resultCopyMetaLink(); break;
			case Options.AddTag: this.#resultAddTag(); break;
			case Options.PullMetaFromFile: this.#resultPullTags(); break;
			case Options.RemoveTag: this.#resultRemoveTag(); break;
			case Options.MoveImages: this.#resultMoveImages(); break;
			case Options.Rename:  break;
			case Options.DeleteImage: this.#resultDeleteImage(); break;
			case Options.DeleteMeta: this.#resultDeleteMeta(); break;
			default: 
				new Notice(`context options "${result}" is not accounted for`);
				console.error(`context options "${result}" is not accounted for`);
		}
	}

	#resultOpenImage()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		const source = this.#getSource(this.#targets[0]);
		const file = this.#plugin.app.vault.getAbstractFileByPath(this.#imageGrid.imgResources[source])
		if (file instanceof TFile)
		{
			this.#plugin.app.workspace.getLeaf(false).openFile(file)
		}
	}

	async #resultOpenMeta()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		const source = this.#getSource(this.#targets[0]);
		const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
			true);
		if (infoFile instanceof TFile)
		{
			this.#plugin.app.workspace.getLeaf(false).openFile(infoFile)
		}
	}

	async #resultCopyImageLink()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}
		
		let links = "";

		for (let i = 0; i < this.#targets.length; i++) 
		{
			const source = this.#getSource(this.#targets[i]);
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#imageGrid.imgResources[source])
			if(file instanceof TFile)
			{
				links += `![${file.basename}](${preprocessUri(file.path)})\n`
			}
		}

		await navigator.clipboard.writeText(links);

		new Notice(loc('COPIED_LINKS'));
	}

	async #resultCopyMetaLink()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}
		
		let links = "";

		let cancel = false;
		const progress = new ProgressModal(this.#plugin, this.#targets.length, ()=>{cancel = true;})
		progress.open();

		for (let i = 0; i < this.#targets.length; i++) 
		{
			if(cancel)
			{
				new Notice(loc('GENERIC_CANCELED'));
				return;
			}
			
			progress.updateProgress(i);

			const source = this.#getSource(this.#targets[i]);
			const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
				true);
			if(infoFile)
			{
				links += `[${infoFile.basename}](${preprocessUri(infoFile.path)})\n`
			}
		}

		await navigator.clipboard.writeText(links);

		new Notice(loc('COPIED_LINKS'));
	}

	#resultAddTag()
	{
		const fuzzyTags = new FuzzyTags(this.#plugin)
		fuzzyTags.onSelection = async (s) =>{
			const tag = s.trim();
			if(tag === '')
			{
				return;
			}

			let cancel = false;
			const progress = new ProgressModal(this.#plugin, this.#targets.length, ()=>{cancel = true;})
			progress.open();
	
			for (let i = 0; i < this.#targets.length; i++) 
			{
				if(cancel)
				{
					new Notice(loc('GENERIC_CANCELED'));
					return;
				}
				
				progress.updateProgress(i);
	
				const source = this.#getSource(this.#targets[i]);
				const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
					true);
				this.#plugin.app.fileManager.processFrontMatter(infoFile, frontmatter => {
					let tags = frontmatter.tags ?? []
					if (!Array.isArray(tags)) 
					{ 
						tags = [tags]; 
					}

					if(tags.contains(tag))
					{
						return;
					}

					tags.push(tag);
					frontmatter.tags = tags;
				});
			}
			
			new Notice(loc('ADDED_TAG'));
		}

		fuzzyTags.open()
	}

	async #resultPullTags()
	{
		const promises: Promise<any>[] = []

		let cancel = false;
		const progress = new ProgressModal(this.#plugin, this.#targets.length+1, ()=>{cancel = true;})
		progress.open();

		for (let i = 0; i < this.#targets.length; i++) 
		{
			if(cancel)
			{
				new Notice(loc('GENERIC_CANCELED'));
				return;
			}
			progress.updateProgress(i);

			const source = this.#getSource(this.#targets[i]);
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#imageGrid.imgResources[source])
			let infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
				false);

			if(infoFile)
			{
				this.#imageGrid.metaResources[file.path] = infoFile.path
				promises.push(addEmbededTags(file as TFile,infoFile, this.#plugin));
			}
			else
			{
				infoFile = await createMetaFile(this.#imageGrid.imgResources[source], this.#plugin);
				
				if(infoFile)
				{
					this.#imageGrid.metaResources[file.path] = infoFile.path;
				}
			}
		}

		await Promise.all(promises);
		progress.updateProgress(this.#targets.length);
		
		new Notice(loc('ADDED_TAG'));
	}
	

	#resultRemoveTag()
	{
		const fuzzyTags = new FuzzyTags(this.#plugin)
		fuzzyTags.onSelection = async (s) =>{
			const tag = s.trim();
			if(tag === '')
			{
				return;
			}

			let cancel = false;
			const progress = new ProgressModal(this.#plugin, this.#targets.length, ()=>{cancel = true;})
			progress.open();
	
			for (let i = 0; i < this.#targets.length; i++) 
			{
				if(cancel)
				{
					new Notice(loc('GENERIC_CANCELED'));
					return;
				}
				
				progress.updateProgress(i);
	
				const source = this.#getSource(this.#targets[i]);
				const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
					true);
				this.#plugin.app.fileManager.processFrontMatter(infoFile, frontmatter => {
					let tags = frontmatter.tags ?? []
					if (!Array.isArray(tags)) 
					{ 
						tags = [tags]; 
					}

					let change = false;
					const tagNoHash = tag.replace('#','');
					const tagAddHash = '#'+tag;

					if(tags.contains(tagNoHash))
					{
						tags.remove(tagNoHash);
						change = true;
					}
					if(tags.contains(tag))
					{
						tags.remove(tag);
						change = true;
					}
					if(tags.contains(tagAddHash))
					{
						tags.remove(tagAddHash);
						change = true;
					}

					if(change)
					{
						frontmatter.tags = tags;
					}
				});
			}
			
			new Notice(loc('REMOVED_TAG'));
		}

		fuzzyTags.open()
	}

	#resultMoveImages()
	{
		const fuzzyFolders = new FuzzyFolders(this.#plugin.app)
        fuzzyFolders.onSelection = async (s) =>
		{
			let cancel = false;
			const progress = new ProgressModal(this.#plugin, this.#targets.length, ()=>{cancel = true;})
			progress.open();

			for (let i = 0; i < this.#targets.length; i++) 
			{
				if(cancel)
				{
					new Notice(loc('GENERIC_CANCELED'));
					return;
				}
				
				progress.updateProgress(i);

				const source = this.#getSource(this.#targets[i]);
				const file = this.#plugin.app.vault.getAbstractFileByPath(this.#imageGrid.imgResources[source])
				const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
					false);
				if(file)
				{
					const oldPath = file.path
					const newPath = s+"/"+file.name
					// new Notice(newPath);
					await this.#plugin.app.vault.rename(file, newPath);

					if(infoFile)
					{
						// update the links in the meta file
						this.#plugin.app.vault.process(infoFile, (data) =>{
							data = data.replaceAll(oldPath, newPath);

							const oldUri = preprocessUri(oldPath)
							const newUri = preprocessUri(newPath)
							data = data.replaceAll(oldUri, newUri);

							return data;
						});
					}
				}
			}
	
			new Notice(loc('MOVED_IMAGE'));

          	// TODO: I hate every single one of these, cause it means I'm waiting on something and I don't know what
			await new Promise(f => setTimeout(f, 100));
			await this.#imageGrid.updateData();
			await this.#imageGrid.updateDisplay();
		}

		fuzzyFolders.open()
	}

	async #resultDeleteMeta()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		let cancel = false;
		const progress = new ProgressModal(this.#plugin, this.#targets.length, ()=>{cancel = true;})
		progress.open();

		for (let i = 0; i < this.#targets.length; i++) 
		{
			if(cancel)
			{
				new Notice(loc('GENERIC_CANCELED'));
				return;
			}
			
			progress.updateProgress(i);

			const source = this.#getSource(this.#targets[i]);
			const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
				false);
			if(infoFile)
			{
				await this.#plugin.app.vault.delete(infoFile);
			}
		}
		
		new Notice(loc('DELETED_META'));
	}

	async #resultDeleteImage()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		let cancel = false;
		const progress = new ProgressModal(this.#plugin, this.#targets.length, ()=>{cancel = true;})
		progress.open();

		for (let i = 0; i < this.#targets.length; i++) 
		{
			if(cancel)
			{
				new Notice(loc('GENERIC_CANCELED'));
				return;
			}
			
			progress.updateProgress(i);

			const source = this.#getSource(this.#targets[i]);
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#imageGrid.imgResources[source])
			const infoFile = await this.#imageGrid.getImageInfo(this.#imageGrid.imgResources[source],
				false);
			if(file)
			{
				await this.#plugin.app.vault.delete(file);
			}
			if(infoFile)
			{
				this.#plugin.app.vault.delete(infoFile);
			}
		}

		new Notice(loc('DELETED_IMAGE'));

        // TODO: I hate every single one of these, cause it means I'm waiting on something and I don't know what
		await new Promise(f => setTimeout(f, 100));
		await this.#imageGrid.updateData();
		await this.#imageGrid.updateDisplay();
	}

	#getSource(target: (HTMLVideoElement | HTMLImageElement)) : string
	{
		if(target.dataset.src)
		{
			return target.dataset.src;
		}
		return target.src;
	}

	#show(posX:number,posY:number)
	{
		activeDocument.body.appendChild(this.#self);
		
		this.#self.style.left = (posX)+"px";
		this.#self.style.top = (posY)+"px";

		const optionsRect = this.#options.getBoundingClientRect();
		this.#self.style.width = optionsRect.width+"px";

		if(offScreenPartial(this.#self))
		{
			const box = this.#self.getBoundingClientRect();
			this.#self.style.left = (posX-box.width)+"px";
			this.#self.style.top = (posY-box.height)+"px";
		}
	}

	#cleanUp()
	{
		this.#select(null);

		if(this.#self)
		{
			this.#self.remove();
		}
	}
}