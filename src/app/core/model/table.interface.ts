// export interface ITable<T> {
//   id: string;
//   columnDefs: IColumnDef<T>[];
//   data: T[];
//   withSelection?: boolean;
// }

export interface IColumnDef<T> {
  field: string;
  headerName: string;
  width?: string;
  visible?: boolean;
  cellEvent?: string;
  cellRender?: (rowData: T) => {};
  headerCellRender?: (data: IColumnDef<T>) => {};
  cellType?: 'string'|'number'|'any';
}
