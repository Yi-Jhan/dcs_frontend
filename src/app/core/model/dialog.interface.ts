import { MatDialogConfig } from "@angular/material/dialog";
import { DialogButtonType, DialogSize, DialogStatus } from "../enum";


export interface IDialogConfig {
  title: string;
  subtitle?: string;
  matConfig?: MatDialogConfig;
  buttons?: Array<IDialogButton>;
  status?: DialogStatus;
  size?: DialogSize;
}

export interface IDialogButton {
  id: string;
  type: DialogButtonType;
  desc?: string;
  disable?: boolean;
  icon?: string; // fontawesome class
  status?: DialogStatus
}
