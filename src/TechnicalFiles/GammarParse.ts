import { validString } from "../utils";
import type { MediaSearch } from "./MediaSearch";

export enum InfoType
{
	NAME = 'name',
	PATH = 'path',
	TAG = 'tag',
	REGEX = 'regex',
	FRONTMATTER = ''
}

export enum Mods
{
	EXPLICIT = '!',
	NEGATE = '-',
	CASE = '^'
}

export type Filter = 
{
	infoType:string
	info:string
}

export type Criteria = 
{
	mods: Mods[]
	key: string
}

export const parseAdvanceSearch = (input: string, mediaSearch:MediaSearch, clear: boolean = false) =>
{
	const parts = input.split(/([ ,;\n\r])/);
	const rules:Filter[] = [];
	let rule : Filter;
	while(parts.length > 0)
	{
		let part = parts.shift().trim();

		if(part.contains(':'))
		{
			let id = part.substring(0,part.indexOf(':'));
			part = part.substring(part.indexOf(':')+1);

			if(rule!= null)
			{
				rules.push(rule);
				rule = null;
			}

			switch(id.toLowerCase())
			{
				case InfoType.PATH : rule = {infoType: InfoType.PATH, info: ""}; break;
				case InfoType.REGEX : rule = {infoType: InfoType.REGEX, info: ""}; break;
				case InfoType.NAME : rule = {infoType: InfoType.NAME, info: ""}; break;
				case InfoType.TAG : rule = {infoType: InfoType.TAG, info: ""};  break;
				default : rule = {infoType: id, info: ""};  break;
			}
		}

		if(part != "")
		{
			if(rule == null)
			{
				rule = {infoType: InfoType.TAG, info: ""};
			}
			
			rule.info += " " + part;
		}
	}
	if(rule != null)
	{
		rules.push(rule);
	}

	if(clear)
	{
		mediaSearch.exclusive = false;
		mediaSearch.path = "";
		mediaSearch.name = "";
		mediaSearch.tag = "";
		mediaSearch.regex = "";
		mediaSearch.front = {};
	}

	for (let i = 0; i < rules.length; i++)
	{
		const item = rules[i];
		switch(item.infoType)
		{
			case InfoType.PATH : mediaSearch.path = item.info.trim(); break;
			case InfoType.REGEX : mediaSearch.regex = item.info.trim(); break;
			case InfoType.NAME : mediaSearch.name = item.info.trim(); break;
			case InfoType.TAG : mediaSearch.tag = item.info.trim(); break;
			default: mediaSearch.front[item.infoType] = item.info.trim(); break;
		}
	}
}

export const parseFilterInfo = (filter: string): Criteria[] =>
{
	let result: Criteria[] = [];
	
	if(validString(filter))
	{
		const filterItems = filter.split(/[ ,;\n\r]/);
		for(let k = 0; k < filterItems.length; k++)
		{
			const current:Criteria = {mods:[],key:filterItems[k]}

			let checking = true;
			while(checking)
			{
				switch(current.key[0])
				{
					case Mods.EXPLICIT: 
						current.mods.push(Mods.EXPLICIT);
						current.key = current.key.substring(1);
						break;
					case Mods.NEGATE: 
						current.mods.push(Mods.NEGATE);
						current.key = current.key.substring(1);
						break;
					case Mods.CASE: 
						current.mods.push(Mods.CASE);
						current.key = current.key.substring(1);
						break;
					default: checking = false; break;
				}
			}

			if(validString(current.key))
			{
				if(current.mods.length > 0)
				{
					result.unshift(current);
				}
				else
				{
					result.push(current);
				}
			}
		}
	}

	return result;
}