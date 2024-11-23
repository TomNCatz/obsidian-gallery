import { prepareFuzzySearch } from "obsidian";
import { offScreenPartial } from "../utils";

export class SuggestionDropdown
{
	target: HTMLInputElement
	showOnClick: boolean = true
	ignoreList: string[] = []
	onGetItems: () => string[]
	onSubmit: (submission: string) => void
	onEmptyBackspace: () => void

	#self: HTMLDivElement
	#suggestions: HTMLDivElement
	#showing: boolean = false
	#selected: HTMLDivElement
	#input: string
	#leftLocked: boolean
	
	constructor(target: HTMLInputElement, getItems: () => string[], onSubmit: (submission: string) => void)
	{
		this.target = target;
		this.onGetItems = getItems;
		this.onSubmit = onSubmit;

		this.#self = createDiv({cls: "suggestion-container"})
		this.#suggestions = this.#self.createDiv("#suggestions-scroll");
		this.#suggestions.style.maxHeight = 300+"px";
		this.#suggestions.style.overflowY = "auto";
		
		this.target.addEventListener("input", async() =>{
			await this.#updateSuggestions(this.target.value)
			this.#show();
		});
		
		this.target.addEventListener('click', async () =>{
			if(this.showOnClick)
			{
				await this.#updateSuggestions(this.target.value)
				this.#show();
			}
		});

		this.target.addEventListener("keydown", (ev) => {this.#onKeyDown(ev)});
		this.target.addEventListener("keyup", (ev) => {this.#onKeyUp(ev)});

		this.target.addEventListener("blur", () => {this.#cleanUp()});
		this.target.addEventListener("change", () => {this.#cleanUp()});
	}

	cancel()
	{
		this.#cleanUp();
	}

	#onKeyDown(event:KeyboardEvent)
	{
		switch(event.key)
		{
			case "Enter":
				this.#submit();
				break;
			case "Escape":
				if(!this.#showing)
				{
					this.target.blur();
				}
				this.cancel();
				break;
			case "ArrowRight":
				this.cancel();
				break;
			case "ArrowLeft":
				this.cancel();
				break;
			case "ArrowUp":
			{
				if(!this.#selected) return;
	
				let index = Array.prototype.indexOf.call(this.#suggestions.children, this.#selected)
				index--;
				if(index >= 0 && index < this.#suggestions.childElementCount)
				{
					this.#select(this.#suggestions.children[index] as HTMLDivElement);
				}
				break;
			}
			case "ArrowDown":
			{
				if(!this.#selected) return;
	
				let index = Array.prototype.indexOf.call(this.#suggestions.children, this.#selected)
				index++;
				if(index >= 0 && index < this.#suggestions.childElementCount)
				{
					this.#select(this.#suggestions.children[index] as HTMLDivElement);
				}
				break;
			}
			case "Backspace":
				if(this.target.value === "")
				{
					if(this.onEmptyBackspace)
					{
						this.onEmptyBackspace();
					}
				}
				break;
			default: 
			// new Notice(e.key)
			return;
		}

		event.stopPropagation();
	}
	
	#onKeyUp(event:KeyboardEvent)
	{
		switch(event.key)
		{
			case "Enter":
			case "Escape":
			case "ArrowRight":
			case "ArrowLeft":
			case "ArrowUp":
			case "ArrowDown":
			case "Backspace":
				break;
			default: 
			// new Notice(e.key)
			return;
		}

		event.stopPropagation();
	}

	#submit()
	{
		let result = this.target.value;
		this.target.value = "";

		if(this.#showing && this.#selected)
		{
			result = this.#selected.textContent
		}

		this.#cleanUp();

		if(this.onSubmit)
		{
			this.onSubmit(result);
		}
	}

	async #updateSuggestions(input: string)
	{
		if(input == this.#input)
		{
			return;
		}

		this.#suggestions.empty();
		const items = await this.onGetItems();
		if(items.length == 0)
		{
			return;
		}
		
		input = input.toLowerCase();
		const matches: [string,number][] = []
		const fuzzySearch = prepareFuzzySearch(input);
		for (let i = 0; i < items.length; i++) 
		{
			if(this.ignoreList.contains(items[i]))
			{
				continue;
			}
			
			const result = fuzzySearch(items[i]);
			if(result)
			{
				matches.push([items[i],result.score]);
			}
		}

		if(matches.length == 0)
		{
			this.#select(null);
		}

		matches.sort((a,b) => b[1]-a[1]);

		for (let i = 0; i < matches.length; i++) 
		{
			const item = this.#suggestions.createDiv({cls: "suggestion-item"});
			item.textContent = matches[i][0];
			item.addEventListener("mouseover", (e) => {
				this.#select(item)
			});
			item.addEventListener("mousedown", () => {
				this.#submit();
			})
		}

		this.#select(this.#suggestions.children[0] as HTMLDivElement);
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

	async #show()
	{
		let top, left;
		[top, left] = this.getCoords();
		activeDocument.body.appendChild(this.#self);
		this.#self.style.left = left+"px";
		this.#self.style.top = top+"px";
		this.#showing = true;

		if(this.#leftLocked || offScreenPartial(this.#self))
		{
			this.#leftLocked = true
			const box = this.#self.getBoundingClientRect();
			this.#self.style.left = (left-box.width)+"px";
			this.#self.style.top = (top-box.height)+"px";
		}
	}

	getCoords()
	{
		if(!this.target)
		{
			return;
		}

		const box = this.target.getBoundingClientRect();
	
		const body = document.body;
		const docEl = document.documentElement;
	
		const scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop;
		const scrollLeft = window.scrollX || docEl.scrollLeft || body.scrollLeft;
	
		const clientTop = docEl.clientTop || body.clientTop || 0;
		const clientLeft = docEl.clientLeft || body.clientLeft || 0;

		const top  = box.top + box.height +  scrollTop - clientTop;
		const left = box.left + scrollLeft - clientLeft;
	
		return [Math.round(top), Math.round(left) ];
	}

	#cleanUp()
	{
		this.#select(null);

		if(this.#self)
		{
			this.#self.remove();
		}

		this.#leftLocked = false;
		this.#showing = false;
	}
}