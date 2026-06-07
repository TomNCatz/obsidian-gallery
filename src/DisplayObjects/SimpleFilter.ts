import { SortingMenu } from "../Modals/SortingMenu";
import { loc } from "../Loc/Localizer";
import type { MediaGrid } from "./MediaGrid";
import type { MediaSearch } from "../TechnicalFiles/MediaSearch";
import { setIcon } from "obsidian";
import { MIN_IMAGE_WIDTH } from "../TechnicalFiles/Constants";
import type { IFilter } from "../TechnicalFiles/IFilter";

export class SimpleFilter implements IFilter
{
	containerEl: HTMLElement

	#mediaSearch: MediaSearch
	#mediaGrid: MediaGrid
	#tagFilterEl: HTMLInputElement
	#sortReverseDiv: HTMLAnchorElement
	#exclusiveFilterDiv: HTMLDivElement
	#widthScaleEl: HTMLInputElement

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
	
		// Filter by Tags
		this.#tagFilterEl = filterTopDiv.createEl('input', {
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
		  
		// Filter Exclusive or inclusive
		this.#exclusiveFilterDiv = filterTopDiv.createDiv({
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
		
		// image width scaler
		this.#widthScaleEl = filterTopDiv.createEl("input", {
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
	}

	
	filterFill()
	{
		this.#tagFilterEl.value = this.#mediaSearch.tag.trim();
		this.#widthScaleEl.value = this.#mediaSearch.maxWidth+"px";
		if(this.#mediaSearch.exclusive)
		{
			this.#exclusiveFilterDiv.addClass("icon-checked");
		}
		else
		{
			this.#exclusiveFilterDiv.removeClass("icon-checked");
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
	}

	async updateDisplay(): Promise<void>
	{
	  await this.#mediaGrid.updateDisplay();
	}
}