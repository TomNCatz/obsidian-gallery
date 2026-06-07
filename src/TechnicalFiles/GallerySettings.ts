import type { FilterType } from "./FilterType"

export interface GallerySettings
{
  imgDataFolder: string | null
  imgmetaTemplatePath: string | null
  hiddenInfoTicker: Record<string, boolean>
  autoCompleteFields: Record<string, boolean>
  uniqueMobileSettings: boolean
  desktop: PlatformSettings
  mobile: PlatformSettings
  skipMetadataOverwrite: boolean
  alternativeTags: string
  namedFilters: NamedFilter[]
}

export interface PlatformSettings
{
  filterType: FilterType
  defaultFilter: string
  lastFilter: string
  rightClickInfo: boolean
  rightClickInfoGallery: boolean
  rightClickMenu: boolean
  width: number
  useMaxHeight: boolean
  maxHeight: number
}

export interface NamedFilter
{
  name: string
  filter: string
}