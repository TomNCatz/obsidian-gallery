import { Keymap, type UserEvent } from "obsidian"
import type GalleryTagsPlugin from "../main"
import
 {
	setLazyLoading,
	updateFocus,
} from '../utils'
import 
{
	GALLERY_LOADING_IMAGE,
	VIDEO_REGEX
} from '../TechnicalFiles/Constants'
import { GalleryInfoView } from "./GalleryInfoView"
import { ImageMenu } from "../Modals/ImageMenu"
import type { MediaSearch } from "../TechnicalFiles/MediaSearch"

export class MediaGrid
{
	plugin: GalleryTagsPlugin
	mediaSearch: MediaSearch
	
	#tempImg: string
	#oldWidth: number = 0;
	#columnEls: HTMLDivElement[] = [];
	
	displayEl: HTMLDivElement
	columnContainer: HTMLUListElement
	imageFocusEl : HTMLDivElement
	focusImage: HTMLImageElement
	focusVideo: HTMLVideoElement
	infoView:GalleryInfoView
	#imgFocusIndex: number
	#pausedVideo: HTMLVideoElement 
	#pausedVideoUrl: string = '';


	constructor(parent: HTMLDivElement, mediaSearch: MediaSearch, plugin: GalleryTagsPlugin)
	{
		this.plugin = plugin;
		this.mediaSearch = mediaSearch;
		this.displayEl = parent;
		this.columnContainer = this.displayEl.createEl('ul');
		this.#tempImg = GALLERY_LOADING_IMAGE;
	}

	haveColumnsChanged(): boolean
	{
		const columnCount = Math.ceil(this.areaWidth()/this.mediaSearch.maxWidth);
		const result = columnCount != this.#columnEls.length;

		if(result)
		{
			this.mediaSearch.redraw = true;
		}

		return result;
	}

	areaWidth(): number
	{
		return this.columnContainer.offsetWidth
	}

	async updateDisplay()
	{
		if(this.areaWidth() <= 0)
		{
			return;
		}

		if(!this.mediaSearch.redraw
		&& this.areaWidth() >= this.#oldWidth 
		&& this.areaWidth() - this.#oldWidth < 20)
		{
			return;
		}

		this.#oldWidth = this.areaWidth();

		if(!this.mediaSearch.redraw&& !this.haveColumnsChanged())
		{
			this.#resize();
			return;
		}
		
		const scrollPosition = this.displayEl.scrollTop;
        this.columnContainer.empty();
		this.#columnEls = [];
		
		const columnCount = Math.ceil(this.areaWidth()/this.mediaSearch.maxWidth);
		const columnWidth = (this.areaWidth()-55)/columnCount;

		for(let col = 0; col < columnCount; col++)
		{
			this.#columnEls.push(this.columnContainer.createDiv({ cls: 'gallery-grid-column' }));
			this.#columnEls[col].style.width = columnWidth+"px";
		}

		const selection: string[] = [];
		if(this.mediaSearch.selectedEls && this.mediaSearch.selectedEls.length > 0)
		{
			for (let i = 0; i < this.mediaSearch.selectedEls.length; i++) 
			{
				selection.push(this.mediaSearch.selectedEls[i].src);
			}

			this.mediaSearch.selectedEls = []
		}

		let index = 0;
		while(index < this.mediaSearch.imgList.length)
		{
			for(let col = 0; col < this.#columnEls.length; col++)
			{
				if(index >= this.mediaSearch.imgList.length)
				{
					break;
				}

				let source = this.mediaSearch.imgList[index];
				let visualEl: HTMLVideoElement | HTMLImageElement;
				index++;
				
				if(source.match(VIDEO_REGEX))
				{
					const vid = this.#columnEls[col].createEl("video");
					vid.src = source;
					vid.classList.add("gallery-grid-vid");
					vid.controls = true;
					visualEl = vid;
				}
				else
				{
					const img = this.#columnEls[col].createEl("img");
					img.src = this.#tempImg;
					img.classList.add("gallery-grid-img");
					img.classList.add("lazy");
					img.loading = "lazy";
					img.alt = source;
					img.dataset.src = source;
					visualEl = img;
				}

				if(this.mediaSearch.maxHeight > 10)
				{
					visualEl.style.maxHeight = this.mediaSearch.maxHeight+"px";
				}

				// Multiselect code
				if(selection.contains(source))
				{
					this.mediaSearch.selectedEls.push(visualEl);
					visualEl.addClass("selected-item");
				}
			}
		}

		this.mediaSearch.redraw= false;
		setLazyLoading();
		
		this.displayEl.scrollTop = scrollPosition;
		await new Promise(f => setTimeout(f, 100));
		this.displayEl.scrollTop = scrollPosition;
	}

	setupClickEvents()
	{
    	// Create gallery display Element		
		this.imageFocusEl = this.displayEl.createDiv({ cls: 'ob-gallery-image-focus', attr: { style: 'display: none;' } })
		const focusElContainer = this.imageFocusEl.createDiv({ attr: { class: 'focus-element-container' } })
		this.focusImage = focusElContainer.createEl('img', { attr: { style: 'display: none;' } })
		this.focusVideo = focusElContainer.createEl('video', { attr: { controls: 'controls', src: ' ', style: 'display: none; margin:auto;' } })
			
		if ('ontouchstart' in document.documentElement === true)
		{
			this.displayEl.addEventListener('touchstart', (e) => {this.vidTouch(e)},true);
		}
		this.displayEl.addEventListener('click', (e) => {this.itemClick(e)});

		this.displayEl.addEventListener('auxclick', this.plugin.auxClick.bind(this.plugin));

		this.displayEl.addEventListener('contextmenu', async (e) =>
		{
			if(this.mediaSearch.selectedEls.length == 0 && (e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement))
			{
				new ImageMenu(e.pageX, e.pageY, [e.target], this.mediaSearch, this, this.plugin);
			}
			else
			{
				new ImageMenu(e.pageX, e.pageY, this.mediaSearch.selectedEls, this.mediaSearch, this, this.plugin);
			}
		})

		const focusShift = async () =>
		{	
			if (this.#imgFocusIndex < 0)
			{
				this.#imgFocusIndex = this.mediaSearch.imgList.length - 1
			}
			
			if (this.#imgFocusIndex >= this.mediaSearch.imgList.length)
			{
				this.#imgFocusIndex = 0
			}

			if (this.mediaSearch.imgList[this.#imgFocusIndex].match(VIDEO_REGEX))
			{
				updateFocus(this.focusImage, this.focusVideo, this.mediaSearch.imgList[this.#imgFocusIndex], true)
			}
			else
			{
				updateFocus(this.focusImage, this.focusVideo, this.mediaSearch.imgList[this.#imgFocusIndex], false)
			}
			
			if(this.plugin.platformSettings().rightClickInfoGallery)
			{
				if(this.infoView)
				{
					await this.infoView.updateInfoDisplay(this.plugin.getImgResources()[this.mediaSearch.imgList[this.#imgFocusIndex]]);
				}
				else
				{
					this.infoView = await GalleryInfoView.OpenLeaf(this.plugin, this.plugin.getImgResources()[this.mediaSearch.imgList[this.#imgFocusIndex]]);
				}
			}
		}

		document.addEventListener('keydown', async (event) =>
		{
			// Mobile clicks don't seem to include shift key information
			if(event.shiftKey)
			{
				this.mediaSearch.selectMode = true;
			}

		}, false)

		document.addEventListener('keyup', async (event) =>
		{
			if(this.mediaSearch.selectMode && !event.shiftKey)
			{
				this.mediaSearch.selectMode = false;
			}

			if (this.imageFocusEl.style.getPropertyValue('display') != 'block')
			{
				return;
			}

			if (this.infoView && this.infoView.sourceEl.style.getPropertyValue('display') === 'block')
			{
				return;
			}

			switch (event.key)
			{
			case 'ArrowLeft':
				this.#imgFocusIndex--;
				await focusShift();
				break;
			case 'ArrowRight':
				this.#imgFocusIndex++
				await focusShift();
				break;
			}

		}, false)
	}

	async itemClick (evt:Event)
	{
		if (this.imageFocusEl.style.getPropertyValue('display') === 'block')
		{
			this.imageFocusEl.style.setProperty('display', 'none')
			// Clear Focus video
			this.focusVideo.src = ''
			// Clear Focus image
			this.focusImage.src = ''
			// Set Video Url back to disabled grid video
			if (this.#pausedVideo)
			{
				this.#pausedVideo.src = this.#pausedVideoUrl
			}
			// Hide focus image div
			this.focusImage.style.setProperty('display', 'none')
			// Hide focus video div
			this.focusVideo.style.setProperty('display', 'none')
			return;
		}
		evt.stopImmediatePropagation();

		let visualEl: (HTMLVideoElement | HTMLImageElement);
		if(evt.target instanceof HTMLVideoElement || evt.target instanceof HTMLImageElement)
		{
			visualEl = evt.target;
		}
		else
		{
			return;
		}
			
			
		if(this.plugin.platformSettings().rightClickInfoGallery)
		{
			if(this.infoView)
			{
				await this.infoView.updateInfoDisplay(this.plugin.getImgResources()[visualEl.src]);
			}
			else
			{
				this.infoView = await GalleryInfoView.OpenLeaf(this.plugin, this.plugin.getImgResources()[visualEl.src]);
			}
		}

		if(Keymap.isModifier(evt as UserEvent, 'Shift') || this.mediaSearch.selectMode)
		{
			if(!visualEl.classList.contains("gallery-grid-vid") && !visualEl.classList.contains("gallery-grid-img"))
			{
				return;
			}

			evt.stopImmediatePropagation();

			this.#selectElement(visualEl);
			return;
		}

		if (visualEl instanceof HTMLImageElement)
		{
			// Read New image info
			const focusImagePath = visualEl.src
			this.#imgFocusIndex = this.mediaSearch.imgList.indexOf(focusImagePath)
			this.imageFocusEl.style.setProperty('display', 'block')
			updateFocus(this.focusImage, this.focusVideo, this.mediaSearch.imgList[this.#imgFocusIndex], false)
		}

		if (visualEl instanceof HTMLVideoElement)
		{
			// Read video info
			const focusImagePath = visualEl.src
			this.#imgFocusIndex = this.mediaSearch.imgList.indexOf(focusImagePath)
			this.imageFocusEl.style.setProperty('display', 'block')
			// Save clicked video info to set it back later
			this.#pausedVideo = visualEl
			this.#pausedVideoUrl = this.#pausedVideo.src
			// disable clicked video
			this.#pausedVideo.src = ''
			updateFocus(this.focusImage, this.focusVideo, this.mediaSearch.imgList[this.#imgFocusIndex], true)
		}
	}

	async vidTouch (evt:Event)
	{
		let visualEl: (HTMLVideoElement);
		if(evt.target instanceof HTMLVideoElement)
		{
			this.itemClick(evt);
		}
	}

	selectAll()
	{
		this.mediaSearch.selectedEls = [];

		for (let col = 0; col < this.#columnEls.length; col++) 
		{
			const column = this.#columnEls[col];

			for (let index = 0; index < column.childElementCount; index++) 
			{
				this.#selectElement(column.children[index] as (HTMLVideoElement | HTMLImageElement));
			}
		}
	}
	
	clearSelection()
	{
		if(this.mediaSearch.selectedEls && this.mediaSearch.selectedEls.length > 0)
		{
			for (let i = 0; i < this.mediaSearch.selectedEls.length; i++) 
			{
				this.mediaSearch.selectedEls[i].removeClass("selected-item");
			}

			this.mediaSearch.selectedEls = []
		}
	}

	#selectElement(visualEl:(HTMLVideoElement | HTMLImageElement))
	{
		if(this.mediaSearch.selectedEls.contains(visualEl))
		{
			this.mediaSearch.selectedEls.remove(visualEl);
			visualEl.removeClass("selected-item");
		}
		else
		{
			this.mediaSearch.selectedEls.push(visualEl);
			visualEl.addClass("selected-item");
		}
	}

	#resize()
	{
		const columnWidth = (this.areaWidth()-55)/this.#columnEls.length;

		for(let col = 0; col < this.#columnEls.length; col++)
		{
			this.#columnEls[col].style.width = columnWidth+"px";
		}
	}
}