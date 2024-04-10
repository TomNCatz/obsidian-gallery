import { offScreenPartial, screenOffset } from "../utils";

export class MenuPopup
{
	#onResult: (result:string) => void
	#self: HTMLDivElement
	#optionsArea: HTMLDivElement
	#selected: HTMLDivElement


	constructor(posX:number, posY:number, onResult: (result:string) => void)
	{
		this.#onResult = onResult;
		this.#self = createDiv({cls: "suggestion-container"})
		this.#optionsArea = this.#self.createDiv("#suggestions-scroll");
		this.#optionsArea.style.width = "200px";
		this.#optionsArea.style.overflowY = "auto";
		this.#self.tabIndex = 0;
		

		this.#self.addEventListener("blur",async () => 
		{
			// TODO: I hate every single one of these, cause it means I'm waiting on something and I don't know what
			await new Promise(f => setTimeout(f, 100));
			this.#cleanUp();
		});

		this.#self.addEventListener("mouseleave", (e) => 
		{
			this.#cleanUp();
		});
	}

	AddLabel(label:string, color:string = null)
	{
		const info = this.#optionsArea.createDiv({cls: "suggestion-item"});
		info.innerText = label;
		info.style.overflowWrap = "break-word";

		if(color)
		{
			info.style.color = color;
		}
	}

	addSeparator(color:string = null)
	{
		const line = this.#optionsArea.createDiv({cls: "suggestion-item-separator"});

		if(color)
		{
			line.style.color = color;
		}
	}

	addItem(label: string, command:string, color:string = null)
	{
		const item = this.#optionsArea.createDiv({cls: "suggestion-item"});
		item.textContent = label;
		item.dataset.href = command;
		item.style.overflowWrap = "break-word";
	
		item.addEventListener("mouseover", (e) => {
			this.#select(item)
		});

		item.addEventListener("mousedown", () => {
			this.#submit();
		})

		if(color)
		{
			item.style.color = color;
		}
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

	#submit()
	{
		let result: string = null;
		if(this.#selected)
		{
			result = this.#selected.dataset.href;
		}

		this.#cleanUp();

		this.#onResult(result);
	}

	show(posX:number,posY:number)
	{
		activeDocument.body.appendChild(this.#self);
		
		this.#self.style.left = (posX)+"px";
		this.#self.style.top = (posY)+"px";

		const optionsRect = this.#optionsArea.getBoundingClientRect();
		this.#self.style.width = optionsRect.width+"px";

		if(offScreenPartial(this.#self))
		{
			let x, y;
			[x,y] = screenOffset(this.#self);
			this.#self.style.left = (posX+x)+"px";
			this.#self.style.top = (posY+y)+"px";
		}
		
		this.#self.focus();
	}

	#cleanUp()
	{
		this.#select(null);

		if(this.#self)
		{
			this.#self.remove();
		}
	}
}