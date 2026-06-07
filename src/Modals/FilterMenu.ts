import { loc } from "../Loc/Localizer";
import { MenuPopup } from "./MenuPopup"
import type { IFilter } from "../TechnicalFiles/IFilter";
import type GalleryTagsPlugin from "../main";
import { validString } from "../utils";
import { SuggestionPopup } from "./SuggestionPopup";
import type { NamedFilter } from "../TechnicalFiles/GallerySettings"
import type { MediaSearch } from "../TechnicalFiles/MediaSearch";

enum FilterOptions
{
	COPY = 1,
	PASTE = 2,
	CLEAR = 3,
	NEWCLIP = 4,
	NEWCURRENT = 5,
	USER = 10
}

export class FilterMenu extends MenuPopup
{
	#filterView: IFilter;
	#mediaSearch: MediaSearch;
	#plugin: GalleryTagsPlugin;
	#userList: string[];

	constructor(posX:number, posY:number, filterView: IFilter, mediaSearch: MediaSearch, plugin: GalleryTagsPlugin)
	{
		super(posX, posY, (result) => {this.#submit(result)});

		this.#filterView = filterView;
		this.#mediaSearch = mediaSearch;
		this.#plugin = plugin;
		
		this.AddLabel(loc('FILTER_HEADER'));
		this.addSeparator();

		this.#createItem(FilterOptions.COPY);
		this.#createItem(FilterOptions.PASTE);
		this.#createItem(FilterOptions.CLEAR);
		this.addSeparator();
		this.#createItem(FilterOptions.NEWCLIP);
		this.#createItem(FilterOptions.NEWCURRENT);
		this.addSeparator();

		this.#userList = this.#plugin.settings.namedFilters.map(x => { return x.name;});
	
		for (let i = 0; i < this.#userList.length; i++) 
		{			
			this.#createItem(FilterOptions.USER+i);
		}

		this.show(posX,posY);
	}

	#createItem(option:number)
	{
		let label: string;
		if(option < FilterOptions.USER)
		{
			//@ts-ignore
			label = loc("FILTER_OPTION_"+option);
		}
		else
		{
			label = this.#userList[option-FilterOptions.USER];
		}

		this.addItem(label, option.toString());
	}


	async #submit(result:string)
	{
		const index = parseInt(result);
		switch(index)
		{
			case FilterOptions.COPY : await navigator.clipboard.writeText(this.#mediaSearch.getFilter()); break;
			case FilterOptions.PASTE : await this.#resultPaste(); break;
			case FilterOptions.CLEAR : await this.#resultClear(); break;
			case FilterOptions.NEWCLIP : this.#promptFilterName(await navigator.clipboard.readText()); break;
			case FilterOptions.NEWCURRENT : this.#promptFilterName(this.#mediaSearch.getFilter()); break;
			default:
			{
				if(index < FilterOptions.USER)
				{
					return;
				}

				await this.#resultUser(index - FilterOptions.USER);
			}
		}
	}

	async #resultPaste()
	{
		const filterString = await navigator.clipboard.readText();
		this.#mediaSearch.setFilter(filterString);
  
		this.#filterView.filterFill();
  
		await this.#filterView.updateData();
		await this.#filterView.updateDisplay();
	}

	async #resultClear()
	{
		this.#mediaSearch.clearFilter();
  
		this.#filterView.filterFill();
  
		await this.#filterView.updateData();
		await this.#filterView.updateDisplay();
	}

	async #resultUser(index: number)
	{
		this.#mediaSearch.setIndexedFilter(index);
  
		this.#filterView.filterFill();
  
		await this.#filterView.updateData();
		await this.#filterView.updateDisplay();
	}

	#promptFilterName(filter:string)
	{
		if(!validString(filter))
		{
			filter = "";
		}

		new SuggestionPopup(
			this.#plugin.app, 
			loc('FILTER_NEW_INFO'), 
			"",
			() => { return this.#userList;},
			async (name) => 
			{
				name = name.trim();
				if(!validString(name))
				{
					return;
				}

				if(this.#userList.contains(name))
				{
					this.#plugin.settings.namedFilters[this.#userList.indexOf(name)].filter = filter;
				}
				else
				{
					const newFilter: NamedFilter = {name: name, filter: filter};
					this.#plugin.settings.namedFilters.push(newFilter);
				}

				await this.#plugin.saveSettings();
			}).open();
	}
}