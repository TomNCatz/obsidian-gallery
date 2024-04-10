import type { MediaGrid } from "../DisplayObjects/MediaGrid";
import type { MediaSearch } from "../TechnicalFiles/MediaSearch"
import type GalleryTagsPlugin from "../main";
import { addEmbededTags, addTag, createMetaFile, getImageInfo, isRemoteMedia, preprocessUri, removeTag, validString } from "../utils";
import { Notice, Platform, TFile } from "obsidian";
import { GalleryInfoView } from "../DisplayObjects/GalleryInfoView";
import { FuzzyFolders, FuzzyTags } from "./FuzzySearches";
import { ConfirmModal } from "./ConfirmPopup";
import { ProgressModal } from "./ProgressPopup";
import { loc } from '../Loc/Localizer'
import { SuggestionPopup } from "./SuggestionPopup";
import { MenuPopup } from "./MenuPopup";
import { exec } from "child_process";
import { CONVERSION_SUPPORT } from "../TechnicalFiles/Constants";

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
	DeleteMeta = 15,
	CopyImage = 16,
	ShareMedia = 17,
	OpenInfoLeaf = 18,
	CopyImagesBlock = 19
}

export class ImageMenu extends MenuPopup
{
	#plugin: GalleryTagsPlugin
	#mediaSearch:MediaSearch
	#mediaGrid:MediaGrid
	#infoView:GalleryInfoView
	#targets:(HTMLVideoElement|HTMLImageElement)[]
	#isRemote:boolean


	constructor(posX:number, posY:number, targets:(HTMLVideoElement|HTMLImageElement)[], mediaSearch:MediaSearch, mediaGrid:MediaGrid, plugin: GalleryTagsPlugin, infoView:GalleryInfoView = null)
	{
		super(posX, posY, (result) => {this.#submit(result)});

		this.#plugin = plugin;
		this.#mediaSearch = mediaSearch;
		this.#mediaGrid = mediaGrid;
		this.#infoView = infoView;
		this.#targets = targets;

		if(this.#targets.length == 0)
		{
			this.AddLabel(loc('IMAGE_MENU_NOTHING'));
			this.addSeparator();

			if( this.#mediaSearch && !Platform.isDesktopApp)
			{
				this.#createItem(this.#mediaSearch.selectMode ? Options.EndSelection : Options.StartSelection);
			}
			this.#createItem(Options.SelectAll);
		}
		else
		{
			if(this.#targets.length == 1)
			{
				let path = this.#targets[0].src
				if(isRemoteMedia(path))
				{
					this.#isRemote = true;
				}
				else
				{
					this.#isRemote = false;
					path = this.#plugin.getImgResources()[this.#targets[0].src];
				}
				this.AddLabel(loc('IMAGE_MENU_SINGLE', path));
				this.addSeparator();

				if(!this.#isRemote)
				{
					this.#createItem(Options.OpenImageFile);
				}

				if((this.#mediaSearch && !this.#plugin.platformSettings().rightClickInfoGallery)
					||(!this.#mediaSearch && !this.#plugin.platformSettings().rightClickInfo))
				{
					this.#createItem(Options.OpenInfoLeaf);
				}

				this.#createItem(Options.OpenMetaFile);
			}
			else
			{
				this.#isRemote = false;
				this.AddLabel(loc('IMAGE_MENU_COUNT',this.#targets.length.toString()));
				this.addSeparator();
				
				this.#createItem(Options.ClearSelection);
			}

			if(this.#mediaSearch && !Platform.isDesktopApp)
			{
				this.#createItem(this.#mediaSearch.selectMode ? Options.EndSelection : Options.StartSelection);
			}
			if(this.#mediaSearch)
			{
				this.#createItem(Options.SelectAll);
			}
			
			this.addSeparator();
			if(this.#targets.length == 1 && !this.#isRemote)
			{
				if(Platform.isMobile)
				{
					if(navigator.canShare)
					{
						this.#createItem(Options.ShareMedia);
					}
				}
				if(this.#canConvertToPng(this.#targets[0]) || this.#isVideoSupported())
				{
					this.#createItem(Options.CopyImage);
				}
			}

			this.#createItem(Options.CopyImageLinks);
			
			if(!this.#isRemote)
			{
				this.#createItem(Options.CopyImagesBlock);
			}

			this.#createItem(Options.CopyMetaLinks);
			
			this.addSeparator();

			this.#createItem(Options.AddTag);
			if(!this.#isRemote)
			{
				this.#createItem(Options.PullMetaFromFile);
			}
			this.#createItem(Options.RemoveTag);
			
			if(!this.#isRemote)
			{
				this.#createItem(Options.MoveImages);
			
				if(this.#targets.length == 1)
				{
					this.#createItem(Options.Rename);
				}
			}
			
			this.addSeparator();

			if(!this.#isRemote)
			{
				this.#createItem(Options.DeleteImage);
			}
			this.#createItem(Options.DeleteMeta);
		}

		this.show(posX,posY);
	}

	#createItem(command: Options)
	{
		//@ts-ignore
		const label = loc("IMAGE_MENU_COMMAND_"+command);

		let color:string = null;
		if(Options[command].contains("Delete"))
		{
			color = "#cc2222";
		}

		this.addItem(label, Options[command], color);
	}

	#submit(responce:string)
	{
		const result = Options[responce as keyof typeof Options];
		if(this.#targets.length < 50 ||
			(result == Options.StartSelection 
			|| result == Options.EndSelection 
			|| result == Options.SelectAll 
			|| result == Options.ClearSelection))
		{
			this.#results(result);
			return;
		}

		//@ts-ignore
		const commandText = loc("IMAGE_MENU_COMMAND_"+result);
		const confirmText= loc('MASS_CONTEXT_CONFIRM', this.#targets.length.toString(), commandText);

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
			case Options.StartSelection: this.#mediaSearch.selectMode = true; break;
			case Options.EndSelection: this.#mediaSearch.selectMode = false; break;
			case Options.SelectAll: this.#mediaGrid.selectAll(); break;
			case Options.ClearSelection: this.#mediaGrid.clearSelection(); break;
			case Options.CopyImageLinks: this.#resultCopyImageLink(); break;
			case Options.CopyMetaLinks: this.#resultCopyMetaLink(); break;
			case Options.AddTag: this.#resultAddTag(); break;
			case Options.PullMetaFromFile: this.#resultPullTags(); break;
			case Options.RemoveTag: this.#resultRemoveTag(); break;
			case Options.MoveImages: this.#resultMoveImages(); break;
			case Options.Rename: this.#resultRenameImage(); break;
			case Options.DeleteImage: this.#resultDeleteImage(); break;
			case Options.DeleteMeta: this.#resultDeleteMeta(); break;
			case Options.CopyImage: this.#resultCopyImage(); break;
			case Options.ShareMedia: this.#resultShareMedia(); break;
			case Options.OpenInfoLeaf: this.#resultOpenInfoLeaf(); break;
			case Options.CopyImagesBlock: this.#resultCopyImagesBlock(); break;
			default: 
				const error = loc('MENU_OPTION_FAULT', Options[result]);
				new Notice(error);
				console.error(error);
		}
	}

	#resultOpenImage()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		const source = this.#getSource(this.#targets[0]);
		const file = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[source])
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
		const infoFile = await getImageInfo(this.#getPath(source), true, this.#plugin);
		if (infoFile instanceof TFile)
		{
			this.#plugin.app.workspace.getLeaf(false).openFile(infoFile)
		}
	}

	async #resultOpenInfoLeaf()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		const source = this.#getSource(this.#targets[0]);
		
		await GalleryInfoView.OpenLeaf(this.#plugin, source);
	}

	async #resultShareMedia()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}
		
		const imgFile = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[this.#getSource(this.#targets[0])]) as TFile;
		const result = await fetch(this.#getSource(this.#targets[0]));
		const blob = await result.blob();

		if(navigator.canShare)
		{
			const shareData: ShareData = {}
			shareData.title = blob.name;
			const file:File = ({
				lastModified:imgFile.stat.mtime,
				webkitRelativePath:'/', 
				size:blob.size, 
				type:blob.type, 
				name:blob.name,
				arrayBuffer:blob.arrayBuffer,
				slice:blob.slice,
				stream:blob.stream,
				text:blob.text,
				prototype:blob.prototype
			} as File)
			shareData.files = [file];
			
			if(navigator.canShare(shareData))
			{
				try
				{
					await navigator.share(shareData);
				}
				catch(e)
				{
					new Notice(typeof(e));
					console.error(e)
				}
			}
			else
			{
				new Notice(loc('CAN_NOT_SHARE'));
			}
		}
		else
		{
			
			// const share = new Intent(Intent.ACTION_SEND);
            // share.setType(blob.type);

            // share.putExtra(Intent.EXTRA_SUBJECT, "abc");
            // share.putExtra(Intent.EXTRA_TITLE, "abcd");

            // const imageFileToShare = new File([blob],blob.name);

            // Uri uri = FileProvider.getUriForFile(Main2Activity.this, "abc.dcf.fileprovider", imageFileToShare);

            // share.putExtra(Intent.EXTRA_STREAM, uri);

            // share.setPackage("com.abc.in");
            // startActivity(Intent.createChooser(share, "Message"));
		}
	}

	async #resultCopyImage()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}

		if(this.#canConvertToPng(this.#targets[0]))
		{
			const blob = await this.#convertToPng(this.#targets[0] as HTMLImageElement);
			await navigator.clipboard.write([new ClipboardItem({[blob.type]:blob})]);

			new Notice(loc('COPIED_MEDIA'));
		}
		else
		{
			let path = this.#plugin.getImgResources()[this.#getSource(this.#targets[0])];
			//@ts-ignore
			path = this.#plugin.app.vault.adapter.getFullRealPath(path)
			let command = null;
			if(Platform.isWin)
			{
				path = path.replaceAll(' ', '\ ')
				command = `powershell Set-Clipboard -Path '${path}'`;
			}
			if(Platform.isMacOS)
			{
				command = `pbcopy < "${path}"`;
			}
			if(Platform.isLinux)
			{
				const result = await fetch(this.#getSource(this.#targets[0]));
				const blob = await result.blob();
				command = `xclip -selection clipboard -t ${blob.type} -o > "${path}""`;
			}
			// TODO: try to find an android solution? maybe on android we should have a share option instead? oh shit, that actually makes more sense...

			if(command == null)
			{
				new Notice(loc('PLATFORM_COPY_NOT_SUPPORTED'));
			}

			exec(command,
				(error, stdout, stderr) =>
				{
					if(error)
					{
						console.error(stderr);
						new Notice(loc("PLATFORM_EXEC_FAILURE"));
					}
					else
					{
						new Notice(loc('COPIED_MEDIA'));
					}
				});
		}
	}

	#canConvertToPng(image:HTMLImageElement|HTMLVideoElement): boolean
	{
		if(image instanceof HTMLVideoElement)
		{
			return false;
		}

		const src = this.#getSource(this.#targets[0]);
		if(src.match(CONVERSION_SUPPORT))
		{
			return true;
		}

		return false;
	}

	#isVideoSupported():boolean
	{
		if(Platform.isWin 
		|| Platform.isMacOS
		|| Platform.isLinux)
		{
			return true;
		}

		return false;
	}


	#convertToPng(image:HTMLImageElement): Promise<Blob>
	{
		return new Promise((result) =>
		{
			const canvas = createEl('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			ctx.drawImage(image,0,0);
			canvas.toBlob((blob) => {result(blob);}, 'image/png');
		});
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
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[source])
			if(file instanceof TFile)
			{
				links += `![${file.basename}](${preprocessUri(file.path)})\n`
			}
			else if(validString(source))
			{
				const name = source.substring(source.lastIndexOf("/")+1);
				links += `![${name}](${source})\n`
			}
		}

		await navigator.clipboard.writeText(links);

		new Notice(loc('COPIED_LINKS'));
	}

	async #resultCopyImagesBlock()
	{
		if(this.#infoView)
		{
			this.#infoView.clear()
		}
		
		let names = "";

		for (let i = 0; i < this.#targets.length; i++) 
		{
			const source = this.#getSource(this.#targets[i]);
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[source])
			if(file instanceof TFile)
			{
				names += `${file.basename},`
			}
		}

		let filter = this.#mediaSearch.getFilter();

		let result = filter.substring(0,filter.indexOf("name:"));
		
		result += "name:"+names;
		result += filter.substring(filter.indexOf("\n",filter.indexOf("name:")));
		
		await navigator.clipboard.writeText(result);

		new Notice(loc('COPIED_FILTER'));
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
			const infoFile = await getImageInfo(this.#getPath(source), true, this.#plugin);
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
			if(!validString(tag))
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
				const infoFile = await getImageInfo(this.#getPath(source), true, this.#plugin);
				addTag(infoFile, tag, this.#plugin);
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
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[source])
			let infoFile = await getImageInfo(this.#plugin.getImgResources()[source], false, this.#plugin);

			if(!(file instanceof TFile))
			{
				continue;
			}

			if(infoFile)
			{
				this.#plugin.getMetaResources()[file.path] = infoFile.path
				promises.push(addEmbededTags(file,infoFile, this.#plugin));
			}
			else
			{
				infoFile = await createMetaFile(this.#plugin.getImgResources()[source], this.#plugin);
				
				if(infoFile)
				{
					this.#plugin.getMetaResources()[file.path] = infoFile.path;
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
			if(!validString(tag))
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
				const infoFile = await getImageInfo(this.#getPath(source), true, this.#plugin);
				removeTag(infoFile, tag, this.#plugin);
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
				const file = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[source])
				if(file)
				{
					const newPath = s+"/"+file.name
					delete this.#plugin.getImgResources()[source];
					await this.#plugin.app.fileManager.renameFile(file, newPath);
				}
			}
	
			new Notice(loc('MOVED_IMAGE'));

			await this.#refreshImageGrid();
		}

		fuzzyFolders.open()
	}

	#resultRenameImage()
	{
		if(this.#targets.length != 1)
		{
			return;
		}

		const original: string = this.#plugin.getImgResources()[this.#targets[0].src];
		const suggesion = new SuggestionPopup(this.#plugin.app,
			loc("PROMPT_FOR_NEW_NAME"),
			original,
			() =>
			{
				const files = this.#plugin.app.vault.getAllLoadedFiles()
				const filtered = files.filter((f) => (f instanceof TFile))
				return filtered.map((f) => f.path)
			},
        	async (newName) =>
			{
				const file = this.#plugin.app.vault.getAbstractFileByPath(original) as TFile;
				if(!newName.contains(file.extension))
				{
					newName += file.extension;
				}

				const conflict = this.#plugin.app.vault.getAbstractFileByPath(newName);
				if(conflict)
				{
					new Notice(loc('CONFLICT_NOTICE_PATH', newName));
					return;
				}

				if(file)
				{
					delete this.#plugin.getImgResources()[this.#targets[0].src];
					await this.#plugin.app.fileManager.renameFile(file, newName);
				}
				new Notice(loc('MOVED_IMAGE'));
	
				await this.#refreshImageGrid();
			});
		suggesion.open();
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
			const infoFile = await getImageInfo(this.#getPath(source), false, this.#plugin);
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
			const file = this.#plugin.app.vault.getAbstractFileByPath(this.#plugin.getImgResources()[source])
			const infoFile = await getImageInfo(this.#plugin.getImgResources()[source], false, this.#plugin);
			if(file)
			{
				await this.#plugin.app.vault.delete(file);
				delete this.#plugin.getImgResources()[source];
			}
			if(infoFile)
			{
				this.#plugin.app.vault.delete(infoFile);
			}
		}

		new Notice(loc('DELETED_IMAGE'));
		await this.#refreshImageGrid();
	}

	async #refreshImageGrid()
	{
		if(!this.#mediaSearch)
		{
			return;
		}

        // TODO: I hate every single one of these, cause it means I'm waiting on something and I don't know what
		await new Promise(f => setTimeout(f, 100));

		await this.#mediaSearch.updateData();
		await this.#mediaGrid.updateDisplay();
	}

	#getPath(source:string)
	{
		if(this.#isRemote)
		{
			return source;
		}

		return this.#plugin.getImgResources()[source];
	}

	#getSource(target: (HTMLVideoElement | HTMLImageElement)) : string
	{
		if(target.dataset.src)
		{
			return target.dataset.src;
		}
		return target.src;
	}
}