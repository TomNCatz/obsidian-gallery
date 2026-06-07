import {moment} from "obsidian";
import en from "./Languages/en"

// This localization system was mostly taken from https://github.com/sissilab/obsidian-image-toolkit

const localeMap: { [k: string]: Partial<typeof en> } = 
{
	// ar,
	// cs: cz,
	// da,
	// de,
	en,
	// "en-gb": enGB,
	// es,
	// fr,
	// hi,
	// id,
	// it,
	// ja,
	// ko,
	// nl,
	// nn: no,
	// pl,
	// pt,
	// "pt-br": ptBR,
	// ro,
	// ru,
	// tr,
	// "zh-cn": zhCN,
	// "zh-tw": zhTW,
};
  
let locale = localeMap[moment.locale()];

export function loc(str: keyof typeof en, param1:string = null, param2:string = null): string 
{
	if (!locale) 
	{
		console.error("No supported localization for region '"+moment.locale()+"' falling back to english.", moment.locale());
		locale = en;
	}

	const result = locale ? locale[str] : en[str];
	return result.format(param1,param2);
}
