import { fuzzySearch } from "obsidian";

export class SuggestionDropdown
{
	target: HTMLInputElement
	showOnClick: boolean = true
	onGetItems: () => string[]
	onSubmit: (submission: string) => void
	onEmptyBackspace: () => void

	#self: HTMLDivElement
	#suggestions: HTMLDivElement
	#showing: boolean = false
	#selected: HTMLDivElement
	#input: string
	
	constructor(target: HTMLInputElement, getItems: () => string[], onSubmit: (submission: string) => void)
	{
		this.target = target;
		this.onGetItems = getItems;
		this.onSubmit = onSubmit;

		this.#self = createDiv({cls: "suggestion-container"})
		this.#suggestions = this.#self.createDiv("#suggestions-scroll");
		this.#suggestions.style.maxHeight = 300+"px";
		this.#suggestions.style.overflowY = "auto";
		
		this.target.addEventListener("input", () =>{
			this.#updateSuggestions(this.target.value)
			this.#show();
		});
		
		this.target.addEventListener("click", () =>{
			if(this.showOnClick)
			{
				this.#updateSuggestions(this.target.value)
				this.#show();
			}
		});

		this.target.addEventListener("keydown", (ev) => {this.#onKeyDown(ev)});

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
			default: // new Notice(e.key)
		}
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

	#updateSuggestions(input: string)
	{
		if(input == this.#input)
		{
			return;
		}

		this.#suggestions.empty();
		const items = this.onGetItems();
		if(items.length == 0)
		{
			return;
		}
		
		input = input.toLowerCase();
		const matches: [string,number][] = []
		for (let i = 1; i < items.length; i++) 
		{
			const result = fuzzySearch({fuzzy: input.split(""), query: input, tokens: input.split(" ") }, items[i]);
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

	#show()
	{
		let top, left;
		[top, left] = this.getCoords();
		activeDocument.body.appendChild(this.#self);
		this.#self.style.left = left+"px";
		this.#self.style.top = top+"px";
		this.#showing = true;
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

		this.#showing = false;
	}
}