import type { FrontMatterCache } from 'obsidian'
import { MarkdownRenderer, TFile, getAllTags, Platform, MarkdownView, normalizePath } from 'obsidian'
import { extractColors } from '../../node_modules/extract-colors'
import
{
  getImageInfo,
  getTags,
  isRemoteMedia,
  searchForFile,
  validString
} from '../utils'
import
{
  EXTENSIONS, 
  EXTRACT_COLORS_OPTIONS,
  VIDEO_REGEX,
} from '../TechnicalFiles/Constants'
import type GalleryTagsPlugin from '../main'
import { GalleryInfo } from '../DisplayObjects/GalleryInfo'
import { loc } from '../Loc/Localizer'

export interface InfoBlockArgs
{
  imgPath: string
  ignoreInfo: string
}

export class ImageInfoBlock
{
  async galleryImageInfo(source: string, el: HTMLElement, sourcePath: string, plugin: GalleryTagsPlugin)
  {
    const args: InfoBlockArgs = {
      imgPath: '',
      ignoreInfo: ''
    };
    
    if(!(await plugin.strapped()))
    {
      return;
    }

    source.split('\n').map(e =>
    {
      if (e)
      {
        const param = e.trim().split('=');
        (args as any)[param[0]] = param[1]?.trim()
      }
    })

    let infoList = args.ignoreInfo.split(';')
      .map(param => param.trim().toLowerCase())
      .filter(e => validString(e))
    if(infoList.length == 0)
    {
      infoList = Object.keys(plugin.settings.hiddenInfoTicker)
      .filter(e => validString(e) && plugin.settings.hiddenInfoTicker[e])
      .map(param => param.trim().toLowerCase())
    }

    const elCanvas = el.createDiv({
      cls: 'ob-gallery-info-block',
      attr: { style: 'width: 100%; height: auto; float: left' }
    })

    let imgTFile: TFile;
    let imgURL: string;
    if(isRemoteMedia(args.imgPath))
    {
      imgURL = args.imgPath;
    }
    else
    {
      args.imgPath = normalizePath(args.imgPath);

      // Handle problematic arg
      if(!args.imgPath)
      {
        MarkdownRenderer.render(plugin.app, loc('GALLERY_INFO_USAGE'), elCanvas, '/', plugin)
        return;
      }
      
      const mightFile = plugin.app.vault.getAbstractFileByPath(args.imgPath);
      if (!(mightFile instanceof TFile))
      {
        const found = await searchForFile(args.imgPath, plugin);

        if(found.length == 0)
        {
          MarkdownRenderer.render(plugin.app,loc('GALLERY_INFO_USAGE'), elCanvas, '/', plugin)
          return;
        }
        else
        {
          // too many options, tell the user about it
          let output = loc('IMAGE_PATH_FAILED_FIND_WARNING');
          for(let i = 0; i < found.length; i++)
          {
            output += "- imgPath="+found[i]+"\n";
          }
          
          MarkdownRenderer.render(plugin.app, output, elCanvas, '/', plugin)
          return;
        }
      }
      else
      {
        imgTFile = mightFile;

        if(!EXTENSIONS.contains(imgTFile.extension))
        {
          // TODO: warn that we don't handle this file type
          return;
        }

        imgURL = plugin.app.vault.getResourcePath(imgTFile)
      }
    }
    
    const imgName = args.imgPath.split('/').slice(-1)[0];

    let measureEl, isVideo
    let hexList: string[] = [];
    // Get image dimensions
    if (args.imgPath.match(VIDEO_REGEX))
    {
      measureEl = document.createElement('video')
      measureEl.src = imgURL
      isVideo = true
    } 
    else
    {
      measureEl = new Image()
      measureEl.src = imgURL;
      
      if(Platform.isDesktopApp && imgTFile)
      {
        let colors = await extractColors(measureEl, EXTRACT_COLORS_OPTIONS)
        
        for(let i = 0; i < colors.length; i++)
        {
          hexList.push(colors[i].hex);
        }
      }
      
      isVideo = false
    }

    // Handle disabled img info functionality or missing info block
    const imgInfo = await getImageInfo(args.imgPath, false, plugin);
    let imgTags = null
    let imgFields:Record<string,string[]> = {}
    let start:string = null;
    let prev:string = null;
    let next:string = null;

    let imgInfoCache = null
    if (imgInfo)
    {
      imgInfoCache = plugin.app.metadataCache.getFileCache(imgInfo)
    }
    
    if (imgInfoCache)
    {
      imgTags = getTags(imgInfoCache);

		  const propertyList = Object.keys(plugin.settings.autoCompleteFields);
      for (let i = 0; i < propertyList.length; i++) 
      {
        if(plugin.settings.autoCompleteFields[propertyList[i]])
        {
          imgFields[propertyList[i]] = getTags(imgInfoCache, propertyList[i]);
        }
      }

      // get paging info if there is any
      if(imgInfoCache.frontmatter)
      {
        if(imgInfoCache.frontmatter.start)
        {
          start = imgInfoCache.frontmatter.start.trim();
        }
        if(imgInfoCache.frontmatter.prev)
        {
          prev = imgInfoCache.frontmatter.prev.trim();
        }
        if(imgInfoCache.frontmatter.next)
        {
          next = imgInfoCache.frontmatter.next.trim();
        }
      }

      // add colors if we got them
      if(hexList.length > 0)
      {
        if(!(imgInfoCache.frontmatter?.Palette))
        {
          await plugin.app.fileManager.processFrontMatter(imgInfo, frontmatter => 
          {
            if (frontmatter.Palette && frontmatter.Palette.length > 0) 
            { 
              return;
            }
            frontmatter.Palette = hexList
          });
        }
      }
    }

    const imgLinks: Array<{path : string, name: string}> = []
    const infoLinks: Array<{path : string, name: string}> = []
    const mdFiles = plugin.app.vault.getMarkdownFiles()
    for (let i = 0; i < mdFiles.length; i++) 
    {
      const mdFile = mdFiles[i];
      
      const cache = plugin.app.metadataCache.getFileCache(mdFiles[i])
      if(!cache)
      {
        continue;
      }

      cache.links?.forEach(link =>
      {
        if (link.link === args.imgPath || link.link === imgName)
        {
          imgLinks.push({ path: mdFile.path, name: mdFile.basename })
        }
        if (link.link === imgInfo.path || link.link === imgInfo.name)
        {
          infoLinks.push({ path: mdFile.path, name: mdFile.basename })
        }
      });

      cache.embeds?.forEach(link =>
        {
          if (link.link === args.imgPath || link.link === imgName)
          {
            imgLinks.push({ path: mdFile.path, name: mdFile.basename })
          }
          if (link.link === imgInfo.path || link.link === imgInfo.name)
          {
            infoLinks.push({ path: mdFile.path, name: mdFile.basename })
          }
        });
    }

    const relatedFiles: Array<{path : string, name: string}> = []
    if(imgTFile)
    {
      const nearFiles = imgTFile.parent.children;
      for (let i = 0; i < nearFiles.length; i++) 
      {
        const file = nearFiles[i];
        
        if(file instanceof TFile)
        {
          if(file != imgTFile
            && (file.basename.toLocaleLowerCase().contains(imgTFile.basename.toLocaleLowerCase())
            || imgTFile.basename.toLocaleLowerCase().contains(file.basename.toLocaleLowerCase())))
          {
            relatedFiles.push({ path: file.path, name: file.name });
          }
        }
      }
    }

    const frontmatter: FrontMatterCache = imgInfoCache?.frontmatter ?? []
    
    if(hexList.length == 0)
    {
      if(frontmatter["Palette"])
      hexList = frontmatter["Palette"];
    }

    let width, height;
    let vid: HTMLVideoElement;
    if(measureEl instanceof HTMLImageElement)
    {
      width = measureEl.naturalWidth;
      height = measureEl.naturalHeight;
    }
    else
    {
      vid = measureEl;
    }

    {
      const info = new GalleryInfo(elCanvas, el.parentElement, plugin);
      if(imgTFile)
      {
        info.imgFile = imgTFile;
      }
      info.imgPath = args.imgPath;
      info.imgInfo = imgInfo;
      info.width = width;
      info.height = height;
      info.dimensions = vid;
      info.colorList = hexList;
      info.tagList = imgTags;
      info.autoCompleteList = imgFields;
      info.isVideo = isVideo;
      info.imgLinks = imgLinks;
      info.infoLinks = infoLinks;
      info.relatedFiles = relatedFiles;
      info.start = start;
      info.prev = prev;
      info.next = next;
      info.frontmatter = frontmatter;
      info.infoList = infoList;
      
      info.updateDisplay();
    }
  }
}
