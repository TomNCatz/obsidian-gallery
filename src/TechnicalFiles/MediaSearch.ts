import { normalizePath, getAllTags, TFile, Notice, type CachedMetadata } from "obsidian"
import type GalleryTagsPlugin from "../main"
import
 {
	getImageInfo,
	getTags,
	validString
} from '../utils'
import { parseFilterInfo, type Criteria, Mods } from '../TechnicalFiles/GammarParse'
import { loc } from '../Loc/Localizer'

export enum Sorting
{
	UNSORTED,
	NAME,
	PATH,
	CDATE,
	MDATE,
	SIZE
}

export class MediaSearch
{
	plugin: GalleryTagsPlugin
	path: string;
	name: string;
	tag: string;
	regex: string;
	front: Record<string,string>
	matchCase: boolean;
	exclusive: boolean;
	sorting: Sorting;
	reverse : boolean;
	maxWidth : number;
	maxHeight : number;
	random : number;
	customList: number[];

	imgList: string[] = [];
	totalCount: number = 0;
	selectMode: boolean = false;
	
	redraw: boolean = false;
	selectedEls: (HTMLVideoElement|HTMLImageElement)[] = [];
	
	constructor(plugin: GalleryTagsPlugin)
	{
		this.plugin = plugin;
		this.clearFilter();
	}

	stringToSort(sort:string)
	{
		sort = sort.toLocaleLowerCase();
		switch(sort)
		{
		  case Sorting[Sorting.UNSORTED].toLocaleLowerCase(): this.sorting = Sorting.UNSORTED; break;
		  case Sorting[Sorting.NAME].toLocaleLowerCase(): this.sorting = Sorting.NAME; break;
		  case Sorting[Sorting.PATH].toLocaleLowerCase(): this.sorting = Sorting.PATH; break;
		  case Sorting[Sorting.CDATE].toLocaleLowerCase(): this.sorting = Sorting.CDATE; break;
		  case Sorting[Sorting.MDATE].toLocaleLowerCase(): this.sorting = Sorting.MDATE; break;
		  case Sorting[Sorting.SIZE].toLocaleLowerCase(): this.sorting = Sorting.SIZE; break;
		  default: this.sorting = Sorting.UNSORTED; break;
		}
	}

	updateSort(sorting:Sorting, reverse:boolean)
	{
		if(!this.redraw 
			&& sorting == this.sorting 
			&& reverse == this.reverse)
		{
			return;
		}

		if(this.redraw || sorting != this.sorting)
		{
			this.sorting = sorting;
			switch(this.sorting)
			{
				case Sorting.UNSORTED: break;
				case Sorting.NAME: 
				{
					this.imgList = this.imgList.sort((a,b)=>
					{
						let as = this.plugin.imgResources[a];
						let bs = this.plugin.imgResources[b];
						as = as.substring(as.lastIndexOf('/'));
						bs = bs.substring(bs.lastIndexOf('/'));
						return as.localeCompare(bs);
					}); 
					break;
				}
				case Sorting.PATH: 
				{
					this.imgList = this.imgList.sort((a,b)=>
					{
						return this.plugin.imgResources[a].localeCompare(this.plugin.imgResources[b]);
					}); 
					break;
				}
				case Sorting.CDATE: 
				{
					this.imgList = this.imgList.sort((a,b)=>
					{
						let af = this.plugin.app.vault.getAbstractFileByPath(this.plugin.imgResources[a]) as TFile;
						let bf = this.plugin.app.vault.getAbstractFileByPath(this.plugin.imgResources[b]) as TFile;

						if(af.stat.ctime < bf.stat.ctime)
						{
							return 1;
						}
						if(af.stat.ctime == bf.stat.ctime)
						{
							return 0;
						}
						return -1;
					}); 
					break;
				}
				case Sorting.MDATE: 
				{
					this.imgList = this.imgList.sort((a,b)=>
					{
						let ap = this.plugin.metaResources[this.plugin.imgResources[a]];
						let bp = this.plugin.metaResources[this.plugin.imgResources[b]];

						let af: TFile = this.plugin.app.vault.getAbstractFileByPath(ap) as TFile;
						let bf: TFile = this.plugin.app.vault.getAbstractFileByPath(bp) as TFile;
						if(!af)
						{
							af = this.plugin.app.vault.getAbstractFileByPath(this.plugin.imgResources[a]) as TFile;
						}
						if(!bf)
						{
							bf = this.plugin.app.vault.getAbstractFileByPath(this.plugin.imgResources[b]) as TFile;
						}

						if(af.stat.mtime < bf.stat.mtime)
						{
							return 1;
						}
						if(af.stat.mtime == bf.stat.mtime)
						{
							return 0;
						}
						return -1;
					}); 
					break;
				}
				case Sorting.SIZE:
				{
					this.imgList = this.imgList.sort((a,b)=>
					{
						let af = this.plugin.app.vault.getAbstractFileByPath(this.plugin.imgResources[a]) as TFile;
						let bf = this.plugin.app.vault.getAbstractFileByPath(this.plugin.imgResources[b]) as TFile;

						if(af.stat.size < bf.stat.size)
						{
							return 1;
						}
						if(af.stat.size == bf.stat.size)
						{
							return 0;
						}
						return -1;
					}); 
					break;
				}
			}
			this.redraw = true;
		}

		if(this.redraw)
		{
			if(reverse)
			{
				this.imgList = this.imgList.reverse();
			}
		}
		else if(reverse != this.reverse)
		{
			this.imgList = this.imgList.reverse();
			this.redraw = true;
		}

		this.reverse = reverse;
	}

	async updateLastFilter()
	{
		this.plugin.platformSettings().lastFilter = this.getFilter();
		await this.plugin.saveSettings();
	}

	async updateData()
	{
		await this.#applyFilter();

		if(this.random > 0)
		{
			this.customList = [];
			if(this.random < this.imgList.length)
			{
				while(this.customList.length < this.random)
				{
					const value = Math.floor(Math.random()*this.imgList.length);

					if(!this.customList.contains(value))
					{
						this.customList.push(value);
					}
				}
			}
		}
		
		if (this.customList && this.customList.length > 0)
		{
			this.imgList = this.customList.filter(value => !Number.isNaN(value)).map(i => this.imgList[i])
		}

		this.redraw = true;
		this.updateSort(this.sorting, this.reverse);
		
	}

	setNamedFilter(filter:string)
	{
		this.plugin.settings.namedFilters
		for (let i = 0; i < this.plugin.settings.namedFilters.length; i++) 
		{
			if(this.plugin.settings.namedFilters[i].name.toLowerCase() == filter.toLowerCase())
			{
				this.setIndexedFilter(i);
				return;
			}
		}
		
		console.log(loc('WARN_NO_FILTER_NAME', filter));
		new Notice(loc('WARN_NO_FILTER_NAME', filter));
	}

	setIndexedFilter(index:number)
	{
		if(this.plugin.settings.namedFilters.length > index)
		{
			this.setFilter(this.plugin.settings.namedFilters[index].filter);
		}
		else
		{
			console.log(loc('WARN_NO_FILTER_INDEX', index.toString()));
			new Notice(loc('WARN_NO_FILTER_INDEX', index.toString()));
		}
	}

	getFilter(): string
	{
		let filterCopy = "```gallery"
		filterCopy += "\npath:" + this.path;
		filterCopy += "\nname:" + this.name;
		filterCopy += "\ntags:" + this.tag;
		filterCopy += "\nregex:" + this.regex;
		filterCopy += "\nmatchCase:" + this.matchCase;
		filterCopy += "\nexclusive:" + this.exclusive;
		filterCopy += "\nimgWidth:" + this.maxWidth;
		filterCopy += "\nsort:" + Sorting[this.sorting];
		filterCopy += "\nreverseOrder:" + this.reverse;
		filterCopy += "\nrandom:" + this.random;
		
		const frontList = Object.keys(this.front);
		if(frontList.length > 0)
		{
			for (let i = 0; i < frontList.length; i++) 
			{
				filterCopy += "\n" + frontList[i] + ":" + this.front[frontList[i]];
			}
		}

		filterCopy += "\n```"

		return filterCopy;
	}

	setFilter(filter:string)
	{		
		const lines = filter.split(/[\n\r]/);
		for(let i = 0; i < lines.length; i++)
		{
		  const parts = lines[i].split(':');
		  if(parts.length <2)
		  {
			continue;
		  }

		  parts[1] = parts[1].trim();

		  switch(parts[0].trim().toLocaleLowerCase())
		  {
			case 'path' : 
			this.path = parts[1];
			break;
			case 'name' : 
			this.name = parts[1];
			break;
			case 'tags' : 
			this.tag = parts[1];
			break;
			case 'regex' : 
			this.regex = parts[1];
			break;
			case 'matchcase' : 
			this.matchCase = (parts[1].toLocaleLowerCase() === "true");
			break;
			case 'exclusive' : 
			this.exclusive = (parts[1].toLocaleLowerCase() === "true");
			break;
			case 'imgwidth' : 
			this.maxWidth = parseInt(parts[1]);
			break;
			case 'sort' : 
			this.stringToSort(parts[1]);
			break;
			case 'reverseorder' : 
			this.reverse = (parts[1].toLocaleLowerCase() === "true");
			break;
			case 'random' : 
			this.random = parseInt(parts[1]);
			break;
			default :
			this.front[parts[0]] = parts[1];
			break;
		  }
		}
	}

	clearFilter()
	{
		this.path = "";
		this.name = "";
		this.tag = "";
		this.regex = "";
		this.front = {};
		this.matchCase = false;
		this.exclusive = false;
		this.sorting = Sorting.UNSORTED;
		this.reverse = false;
		this.random = 0;
		this.maxWidth = this.plugin.platformSettings().width;

		if(this.plugin.platformSettings().useMaxHeight)
		{
			this.maxHeight = this.plugin.platformSettings().maxHeight;
		}
		else
		{
			this.maxHeight = 0;
		}

		this.random = 0;
		this.customList = null;
	}

	async #applyFilter(): Promise<void>
	{
		this.totalCount = 0;
		let reg:RegExp[] = this.#buildRegex();

		let validFilter = false;
		const tagFilter = parseFilterInfo(this.tag);
		if(tagFilter.length > 0)
		{
			validFilter = true;
		}
		const frontList = Object.keys(this.front);
		const frontFilters:Criteria[][] = [];

		for (let f = 0; f < frontList.length; f++) 
		{
			frontFilters[f] = parseFilterInfo(this.front[frontList[f]])
			if(frontFilters[f].length > 0)
			{
				validFilter = true;
			}
		}

		const keyList = Object.keys(this.plugin.getImgResources());
		this.imgList= [];
		for (const key of keyList)
		{
			const file = this.plugin.getImgResources()[key];
			for (let i = 0; i < reg.length; i++)
			{
				if (file.match(reg[i]))
				{
					this.totalCount++;
					let imgTags: string[] = [];
					let frontMatter: Record<string,string[]> = {};
					let infoFile = await getImageInfo(file, false, this.plugin);
					if(infoFile)
					{
						let imgInfoCache = this.plugin.app.metadataCache.getFileCache(infoFile)
						if (imgInfoCache)
						{
							imgTags = getTags(imgInfoCache);
							frontMatter = this.#getFrontmatter(imgInfoCache);
						}
					}

					let score = this.#matchScore(imgTags, tagFilter, this.matchCase, this.exclusive);

					for (let f = 0; f < frontList.length; f++) 
					{
						let field:string[] = [];
						if(frontMatter.hasOwnProperty(frontList[f]))
						{
							field = frontMatter[frontList[f]];
						}
						score += this.#matchScore(field, frontFilters[f], this.matchCase, this.exclusive);
					}

					if(( validFilter && score > 0 ) 
					|| ( !validFilter && score >= 0 ))
					{
						this.imgList.push(key);
					}
					break;
				}
			}
		}
	}	

	#buildRegex():RegExp[]
	{
		let reg:RegExp[] = [];
		const names = this.name.split(/[;,\n\r]/);
		for (let i = 0; i < names.length; i++) 
		{
			names[i] = names[i].trim();
			if(names[i] == "")
			{
				continue;
			}

			try 
			{
				if(this.regex.trim() != "")
				{
					reg.push(new RegExp(this.regex.replaceAll("{PATH}", this.path).replaceAll("{NAME}",this.name[i])));
				}
				else if (this.path === '/')
				{
					reg.push(new RegExp(`^.*${names[i]}.*$`));
				}
				else
				{
					reg.push(new RegExp(`^${this.path}.*${names[i]}.*$`));
				}
			} 
			catch (error)
			{
				console.log(loc('BAD_REGEX_WARNING'))
			}
		}

		if(reg.length == 0)
		{
			reg.push(new RegExp(`^${this.path}.*$`));
		}
		return reg;
	}

	#matchScore(imgTags: string[], filter: Criteria[], matchCase: boolean, exclusive: boolean): number
	{
		const fail = -999;
		if(filter == null || filter.length == 0)
		{
			return 0;
		}

		if(imgTags == null)
		{
			return fail;
		}

		let hasPositive: boolean = false;
		let exclusiveMatched: boolean = false;

		for(let k = 0; k < filter.length; k++)
		{
			let criteria = filter[k];
			let negate: boolean = criteria.mods.contains(Mods.NEGATE);
			let exclusiveInternal: boolean = criteria.mods.contains(Mods.EXPLICIT);
			if(!negate)
			{
				hasPositive = true;
			}

			if(!validString(criteria.key))
			{
				continue;
			}

			if(this.#containsTag(criteria.key, imgTags, matchCase || criteria.mods.contains(Mods.CASE)))
			{
				if(negate)
				{
					return fail;
				}
				
				if(!exclusive && !exclusiveInternal)
				{
					return 1;
				}
				else
				{
					exclusiveMatched = true;
				}
			}
			else if((exclusive || exclusiveInternal) && !negate)
			{
				return fail;
			}
		}

		if(!hasPositive)
		{
			return 1;
		}
		if(exclusive || exclusiveMatched)
		{
			return 1;
		}
		return fail;
	}

	#containsTag(tagFilter:string, tags: string[], matchCase: boolean): boolean
	{
		if(!matchCase)
		{
			tagFilter = tagFilter.toLowerCase();
		}

		for(let i = 0; i < tags.length; i++)
		{
			if(matchCase)
			{
				if(tags[i].contains(tagFilter))
				{
					return true;
				}
			}
			else
			{
				if(tags[i].toLowerCase().contains(tagFilter))
				{
					return true;
				} 
			}
		}

		return false;
	}

	#getFrontmatter(imgInfoCache: CachedMetadata): Record<string,string[]>
	{
		const result:Record<string,string[]>= {};
		if(imgInfoCache.frontmatter)
		{
			const frontList = Object.keys(imgInfoCache.frontmatter);
			for (let i = 0; i < frontList.length; i++) 
			{
				let element = imgInfoCache.frontmatter[frontList[i]] ?? []
				if (!Array.isArray(element)) 
				{ 
					element = [element]; 
				}
				
				result[frontList[i]] = element;
			}
		}
		return result;
	}
}