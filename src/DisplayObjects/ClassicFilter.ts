import { SortingMenu } from "../Modals/SortingMenu";
import { loc } from "../Loc/Localizer";
import type { MediaGrid } from "./MediaGrid";
import type { MediaSearch } from "../TechnicalFiles/MediaSearch";
import { setIcon } from "obsidian";
import { MIN_IMAGE_WIDTH } from "../TechnicalFiles/Constants";
import type { IFilter } from "../TechnicalFiles/IFilter";

export class ClassicFilter implements IFilter
{
	containerEl: HTMLElement


	#mediaSearch: MediaSearch
	#mediaGrid: MediaGrid
	#pathFilterEl: HTMLInputElement
	#nameFilterEl: HTMLInputElement
	#tagFilterEl: HTMLInputElement
	#sortReverseDiv: HTMLAnchorElement
	#matchFilterDiv: HTMLDivElement
	#exclusiveFilterDiv: HTMLDivElement
	#widthScaleEl: HTMLInputElement
	#randomDiv: HTMLDivElement
	#randomEl: HTMLInputElement
	#countEl: HTMLLabelElement

	constructor(containerEl:HTMLElement, mediaGrid: MediaGrid, mediaSearch: MediaSearch)
	{
		if(!containerEl)
		{
		  return;
		}

		this.containerEl = containerEl;
		this.#mediaSearch = mediaSearch;
		this.#mediaGrid = mediaGrid;
		
		const filterTopDiv = this.containerEl.createDiv({cls:"gallery-search-bar"});
		const filterBottomDiv = this.containerEl.createDiv({cls:"gallery-search-bar"});
	
		// Filter by path
		this.#pathFilterEl = filterTopDiv.createEl('input', {
		  cls: 'ob-gallery-filter-input',
		  type: 'text',
		  attr: { 'aria-label': loc('FILTER_PATH_TOOLTIP'), spellcheck: false, placeholder: loc('FILTER_PATH_PROMPT') }
		})
	
		this.#pathFilterEl.addEventListener('input', async () =>
		{
		  this.#mediaSearch.path = this.#pathFilterEl.value.trim();
		  await this.updateData();
		  this.updateDisplay();
		});
	
		// Filter by Name
		this.#nameFilterEl = filterTopDiv.createEl('input', {
		  cls: 'ob-gallery-filter-input',
		  type: 'text',
		  attr: { 'aria-label': loc('FILTER_NAME_TOOLTIP'), spellcheck: false, placeholder: loc('FILTER_NAME_PROMPT') }
		})
	
		this.#nameFilterEl.addEventListener('input', async () =>
		{
		  this.#mediaSearch.name = this.#nameFilterEl.value.trim();
		  await this.updateData();
		  this.updateDisplay();
		});
	
		// Sort menu
		this.#sortReverseDiv = filterTopDiv.createEl('a', {
		  cls: 'view-action',
		  attr: { 'aria-label': loc('SORT_ORDER_TOOLTIP')}
		})
		setIcon(this.#sortReverseDiv, "arrow-up-down")
		
		this.#sortReverseDiv.addEventListener('click', (event) =>
		{
		  new SortingMenu(event.pageX, event.pageY, this.#mediaSearch, this.#mediaGrid);
		});
	
		// file filter counts
		this.#countEl = filterTopDiv.createEl('label', {attr: { 'aria-label': loc('COUNT_TOOLTIP')}});
		this.#countEl.setText(this.#mediaSearch.imgList.length+"/"+this.#mediaSearch.totalCount);
	
		// Filter by Tags
		this.#tagFilterEl = filterBottomDiv.createEl('input', {
		  cls: 'ob-gallery-filter-input',
		  type: 'text',
		  attr: { 'aria-label': loc('FILTER_TAGS_TOOLTIP'), spellcheck: false, placeholder: loc('FILTER_TAGS_PROMPT') }
		})
	
		this.#tagFilterEl.addEventListener('input', async () =>
		{
		  this.#mediaSearch.tag = this.#tagFilterEl.value.trim();
		  await this.updateData();
		  this.updateDisplay();
		});
	
		// Filter Match Case
		this.#matchFilterDiv = filterBottomDiv.createDiv({
		  cls: 'icon-toggle',
		  attr: { 'aria-label': loc('FILTER_MATCH_CASE_TOOLTIP')}
		})
		setIcon(this.#matchFilterDiv, "case-sensitive")
	
		this.#matchFilterDiv.addEventListener('mousedown', async () =>
		{
		  this.#mediaSearch.matchCase = !this.#mediaSearch.matchCase;
		  if(this.#mediaSearch.matchCase)
		  {
			this.#matchFilterDiv.addClass("icon-checked");
		  }
		  else
		  {
			this.#matchFilterDiv.removeClass("icon-checked");
		  }
		  await this.updateData();
		  this.updateDisplay();
		});
	
		// Filter Exclusive or inclusive
		this.#exclusiveFilterDiv = filterBottomDiv.createDiv({
		  cls: 'icon-toggle',
		  attr: { 'aria-label': loc('FILTER_EXCLUSIVE_TOOLTIP')}
		})
		setIcon(this.#exclusiveFilterDiv, "check-check")
	
		this.#exclusiveFilterDiv.addEventListener('mousedown', async () =>
		{
		  this.#mediaSearch.exclusive = !this.#mediaSearch.exclusive;
		  if(this.#mediaSearch.exclusive)
		  {
			this.#exclusiveFilterDiv.addClass("icon-checked");
		  }
		  else
		  {
			this.#exclusiveFilterDiv.removeClass("icon-checked");
		  }
		  await this.updateData();
		  this.updateDisplay();
		});
	
		// image width scaler
		this.#widthScaleEl = filterBottomDiv.createEl("input", {
		  cls: 'ob-gallery-filter-slider-input',
		  type: 'range',
		  attr: { 'aria-label': loc('FILTER_WIDTH_TOOLTIP')}
		});
		this.#widthScaleEl.name = 'maxWidth';
		this.#widthScaleEl.id = 'maxWidth';
		this.#widthScaleEl.min = MIN_IMAGE_WIDTH+"";
		this.#widthScaleEl.max = (this.#mediaGrid.areaWidth())+"";
		this.#widthScaleEl.value = this.#mediaSearch.maxWidth+"";
		this.#widthScaleEl.addEventListener('input', async () =>
		{
		  this.#mediaSearch.maxWidth = parseInt(this.#widthScaleEl.value);
		  if(this.#mediaGrid.haveColumnsChanged())
		  {
			this.updateDisplay();
		  }
		});
	
		// Add action button to show random options and randomize them
		this.#randomDiv = filterBottomDiv.createDiv();
		const randomButton = filterTopDiv.createEl('a', { cls: 'view-action', attr: { 'aria-label': loc('FILTER_RANDOM_TOOLTIP') } })
		setIcon(randomButton, 'dice')
		this.#randomDiv.style.display = "none";
		this.#randomDiv.style.marginLeft= "auto";
		this.#randomEl = this.#randomDiv.createEl('input', {
		  cls: 'ob-gallery-filter-input',
		  type: 'number',
		  attr: { 'aria-label': loc('FILTER_RANDOM_COUNT_TOOLTIP'), min:"1", value: "10" }
		})
		this.#randomEl.style.marginLeft= "auto";
		this.#randomEl.addEventListener("focus", async ()=>{
		  await this.updateData();
		  this.updateDisplay();
		})
		this.#randomEl.addEventListener("input", async ()=>{
		  this.#mediaSearch.random = parseInt(this.#randomEl.value);
		  await this.updateData();
		  this.updateDisplay();
		})
	
		randomButton.onClickEvent(async () =>
		{
		  const currentMode = this.#randomDiv.style.getPropertyValue('display')
		  if (currentMode === 'block')
		  {
			this.#randomDiv.style.setProperty('display', 'none')
			this.#mediaSearch.random = 0;
			this.#mediaSearch.customList = [];
			await this.updateData();
			this.updateDisplay();
			return;
		  }
		  this.#randomDiv.style.setProperty('display', 'block')
		  this.#mediaSearch.random = parseInt(this.#randomEl.value);
		  await this.updateData();
		  this.updateDisplay();
		});
	}

	
	filterFill()
	{
		this.#pathFilterEl.value = this.#mediaSearch.path.trim();
		this.#nameFilterEl.value = this.#mediaSearch.name.trim();
		this.#tagFilterEl.value = this.#mediaSearch.tag.trim();
		this.#widthScaleEl.value = this.#mediaSearch.maxWidth+"px";
		if(this.#mediaSearch.matchCase)
		{
			this.#matchFilterDiv.addClass("icon-checked");
		}
		else
		{
			this.#matchFilterDiv.removeClass("icon-checked");
		}
		if(this.#mediaSearch.exclusive)
		{
			this.#exclusiveFilterDiv.addClass("icon-checked");
		}
		else
		{
			this.#exclusiveFilterDiv.removeClass("icon-checked");
		}
		if(this.#mediaSearch.random > 0)
		{
		  this.#randomEl.value = this.#mediaSearch.random+"";
		  this.#randomDiv.style.setProperty('display', 'block');
		}
		else
		{
			this.#randomDiv.style.setProperty('display', 'none');
		}
	}

	onResize()
	{
		this.#widthScaleEl.max = (this.#mediaGrid.areaWidth())+"";
	}
	
	async updateData(): Promise<void>
	{
	  await this.#mediaSearch.updateData();
	  await this.#mediaSearch.updateLastFilter();

	  this.#countEl.setText(this.#mediaSearch.imgList.length+"/"+this.#mediaSearch.totalCount);
	  this.#randomEl.max = this.#mediaSearch.totalCount+"";
	}

	async updateDisplay(): Promise<void>
	{
	  await this.#mediaGrid.updateDisplay();
	}
}