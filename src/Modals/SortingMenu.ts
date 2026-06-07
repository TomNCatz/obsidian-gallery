import { loc } from "../Loc/Localizer";
import { type MediaGrid } from "../DisplayObjects/MediaGrid";
import { Sorting, type MediaSearch } from "../TechnicalFiles/MediaSearch";
import { MenuPopup } from "./MenuPopup"

enum SortOptions
{
	NAME = 1,
	PATH = 2,
	CDATE = 3,
	MDATE = 4,
	SIZE = 5,
	FLIP = 6
}

export class SortingMenu extends MenuPopup
{
	#mediaSearch: MediaSearch;
	#mediaGrid: MediaGrid;

	constructor(posX:number, posY:number, mediaSearch: MediaSearch, mediaGrid: MediaGrid)
	{
		super(posX, posY, (result) => {this.#submit(result)});

		this.#mediaSearch = mediaSearch;
		this.#mediaGrid = mediaGrid;
		
		this.AddLabel(loc('SORT_HEADER'));
		this.addSeparator();

		this.#createItem(SortOptions.NAME);
		this.#createItem(SortOptions.PATH);
		this.#createItem(SortOptions.CDATE);
		this.#createItem(SortOptions.MDATE);
		this.#createItem(SortOptions.SIZE);

		this.addSeparator();
		this.#createItem(SortOptions.FLIP);

		this.show(posX,posY);
	}

	#createItem(option:SortOptions)
	{
		//@ts-ignore
		const label = loc("SORT_OPTION_"+option);
		let sorting : Sorting;
		switch(option)
		{
			case SortOptions.NAME: sorting = Sorting.NAME; break;
			case SortOptions.PATH: sorting = Sorting.PATH; break;
			case SortOptions.CDATE: sorting = Sorting.CDATE; break;
			case SortOptions.MDATE: sorting = Sorting.MDATE; break;
			case SortOptions.SIZE: sorting = Sorting.SIZE; break;
			case SortOptions.FLIP: sorting = Sorting.UNSORTED; break;
		}
		
		let color: string = null;
		if(sorting == this.#mediaSearch.sorting)
		{
			color = this.#mediaSearch.plugin.accentColor;
		}
		if(option == SortOptions.FLIP)
		{
			color = this.#mediaSearch.reverse ? this.#mediaSearch.plugin.accentColor : null;
		}

		this.addItem(label, SortOptions[option], color);
	}


	async #submit(result:string)
	{
		switch(result)
		{
			case SortOptions[SortOptions.NAME] : this.#mediaSearch.updateSort(Sorting.NAME, false); break;
			case SortOptions[SortOptions.CDATE] : this.#mediaSearch.updateSort(Sorting.CDATE, false); break;
			case SortOptions[SortOptions.MDATE] : this.#mediaSearch.updateSort(Sorting.MDATE, false); break;
			case SortOptions[SortOptions.PATH] : this.#mediaSearch.updateSort(Sorting.PATH, false); break;
			case SortOptions[SortOptions.SIZE] : this.#mediaSearch.updateSort(Sorting.SIZE, false); break;
			case SortOptions[SortOptions.FLIP] : this.#mediaSearch.updateSort(this.#mediaSearch.sorting, !this.#mediaSearch.reverse); break;
			default: return;
		}

		await this.#mediaGrid.updateDisplay();
	}
}