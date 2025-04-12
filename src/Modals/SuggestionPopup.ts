import { App, Modal, Setting } from "obsidian";
import { loc } from '../Loc/Localizer'
import { SuggestionDropdown } from "./SuggestionDropdown";

export class SuggestionPopup extends Modal 
{
	onConfirm: (result:string) => void
	onCancel: () => void
	onGetItems: () => string[]
	confirmLabel: string = loc('CONFIRM');
	cancelLabel: string = loc('CANCEL');
	#info: string
	#original: string
	#complete: boolean = false

	constructor(app: App, info:string, original:string, getItems: () => string[], onConfirm: (result:string) => void) 
	{
		super(app);
		this.onConfirm = onConfirm;
		this.onGetItems = getItems;
		this.#original = original;
		this.#info = info;
	}

	onOpen() 
	{
		const { contentEl } = this;

		contentEl.createEl("h1", { text: this.#info });

		const setting = new Setting(contentEl)
		.setDesc("")
		.addButton((btn) =>
			{
			btn
			.setButtonText(this.confirmLabel)
			.setCta()
			.onClick(() => 
			{
				this.close();
				this.#complete = true;
				if(this.onConfirm)
				{
					this.onConfirm(input.value);
				}
			});
		})
		.addButton((btn) =>
			{
			btn
			.setButtonText(this.cancelLabel)
			.setCta()
			.onClick(() => 
			{
				this.close();
				this.#complete = true;
				if(this.onCancel)
				{
					this.onCancel();
				}
			});
		});

		const input = setting.descEl.createEl("input", {cls: "new-tag-input"})
		input.value = this.#original;
		input.style.width = "100%";
		
		new SuggestionDropdown(input, 
			this.onGetItems,
			async(s) =>{
				this.close();
				if(this.onConfirm)
				{
					this.onConfirm(s);
				}
			});
		
	}

	onClose() 
	{
		if(!this.#complete && this.onCancel)
		{
			this.onCancel();
		}

		let { contentEl } = this;
		contentEl.empty();
	}
}