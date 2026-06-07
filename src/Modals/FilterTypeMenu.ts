import { loc } from "../Loc/Localizer";
import { MenuPopup } from "./MenuPopup"
import { FilterType } from "../TechnicalFiles/FilterType";

export class FilterTypeMenu extends MenuPopup
{
	#current: FilterType;
	#accentColor: string;
	#onResult: (filterType:FilterType) => void

	constructor(posX:number, posY:number, current: FilterType, accentColor: string, onResult: (filterType:FilterType) => void)
	{
		super(posX, posY, (result) => {this.#submit(result)});

		this.#current = current;
		this.#accentColor = accentColor;
		this.#onResult = onResult;
		
		this.AddLabel(loc('FILTER_TYPE_HEADER'));
		this.addSeparator();

		this.#createItem(FilterType.NONE);
		this.#createItem(FilterType.SIMPLE);
		this.#createItem(FilterType.CLASSIC);
		this.#createItem(FilterType.ADVANCED);

		this.show(posX,posY);
	}

	#createItem(option:FilterType)
	{
		//@ts-ignore
		const label = loc("FILTER_TYPE_OPTION_"+option);
		let filterType : FilterType;
		
		let color: string = null;
		if(filterType == this.#current)
		{
			color = this.#accentColor;
		}

		this.addItem(label, FilterType[option], color);
	}


	async #submit(result:string)
	{
		switch(result)
		{
			case FilterType[FilterType.NONE] : this.#onResult(FilterType.NONE); break;
			case FilterType[FilterType.SIMPLE] : this.#onResult(FilterType.SIMPLE); break;
			case FilterType[FilterType.CLASSIC] : this.#onResult(FilterType.CLASSIC); break;
			case FilterType[FilterType.ADVANCED] : this.#onResult(FilterType.ADVANCED); break;
			default: return;
		}
	}
}