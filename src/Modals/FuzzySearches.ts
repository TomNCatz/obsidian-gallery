import { FuzzySuggestModal, TFile, TFolder, getAllTags } from "obsidian";
import type GalleryTagsPlugin from "../main";

export class FuzzyFolders extends FuzzySuggestModal<TFolder>
{
	onSelection: (result:string) => void

	getItems(): TFolder[]
	{
		const files = this.app.vault.getAllLoadedFiles()
		const filtered = files.filter((f) => f instanceof TFolder)
		return filtered.map((f) => f as TFolder)
	}
	getItemText(item: TFolder): string
	{
		return item.path
	}
	onChooseItem(item: TFolder, evt: MouseEvent | KeyboardEvent): void
	{
		this.onSelection(item.path);
	}
}

export class FuzzyFiles extends FuzzySuggestModal<TFile>
{
	onSelection: (result:string) => void

	getItems(): TFile[]
	{
		const files = this.app.vault.getAllLoadedFiles()
		const filtered = files.filter((f) => f instanceof TFile)
		return filtered.map((f) => f as TFile)
	}
	getItemText(item: TFile): string
	{
		return item.path
	}
	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void
	{
		this.onSelection(item.path);
	}
}

export class FuzzyTags extends FuzzySuggestModal<string>
{
	onSelection: (result:string) => void
	plugin: GalleryTagsPlugin;

	constructor(plugin: GalleryTagsPlugin)
	{
		super(plugin.app);

		this.plugin = plugin;
	}

	getItems(): string[]
	{
		return this.plugin.getTags();
	}
	getItemText(item: string): string
	{
		return item
	}
	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void
	{
		this.onSelection(item);
	}
}