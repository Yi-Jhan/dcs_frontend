export interface IExportConfig {
  screenName: string,
  pageOrientation: 'portrait' | 'landscape',
  exportContent: Array<IExportContent>
}

export interface IExportContent {
  dataType: string,
  data: any,
  position: number,
  title?: string,
  imageFit?: number
}
