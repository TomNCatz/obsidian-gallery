
import type { MediaGrid } from "./MediaGrid";
import type { MediaSearch } from "../TechnicalFiles/MediaSearch";
import type { IFilter } from "../TechnicalFiles/IFilter";

export class NullFilter implements IFilter
{
	containerEl: HTMLElement

	#mediaSearch: MediaSearch
	#mediaGrid: MediaGrid

	constructor(containerEl:HTMLElement, mediaGrid: MediaGrid, mediaSearch: MediaSearch)
	{
		if(!containerEl)
		{
		  return;
		}

		this.containerEl = containerEl;
		this.#mediaSearch = mediaSearch;
		this.#mediaGrid = mediaGrid;

		this.containerEl.style.setProperty('display', 'none');
	}
	filterFill(): void
	{
		
	}
	onResize(): void
	{
		
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