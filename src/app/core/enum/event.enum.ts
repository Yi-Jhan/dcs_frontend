export enum BreadcrumbEvent {
  LabelOverwrite = 'labelOverwrite'
}

export enum TableEvent {
  UpdateTableData = 'updateTableData',
  MasterToggle = 'masterToggle',
  ColumnVisible = 'columnVisible',

  // Row Event
  RowClicked = 'rowClicked',
  RowSelectToggle = 'rowSelectToggle',
  SelectToggleRequest = 'selectToggleRequest', /* for Table component */

  // Cell Element Event
  CellEvent = 'cellEvent'
}

export enum DialogEvent {
  ButtonClicked = 'dialogButtonClicked',
  UpdateButtonStatus = 'updateDialogButtonStatus',
  CloseDialog = 'closeDialog',
  CloseAllDialog = 'closeAllDialog',
  CancelDialog = 'cancelDialog',
  UpdateButtons = 'updateButtons'
}

export enum ChipsInputEvent {
  InputChange = 'inputChange'
}

export enum CardEvent {
  UpdateCardData = 'updateCardData',
  ChangeCardFilter = 'changeCardFilter'
}

export enum SearchBarEvent {
  StartDateChange = 'startDateChange',
  EndDateChange = 'endDateChange',
  RemoveDateRange = 'removeDateRange',
  CancelDateChange = 'cancelDateChange',
  ClearSearchInput = 'clearSearchInput'
}

export enum ExportEvent {
  Export = 'export',
  ExportPrivilege = 'exportPrivilege'
}
