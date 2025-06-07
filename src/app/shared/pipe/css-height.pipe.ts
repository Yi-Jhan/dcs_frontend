import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cssHeight',
  standalone: true
})
export class CssHeightPipe implements PipeTransform {

  transform(value: number | string, ...args: any[]): string {
    if(typeof value === 'number') {
      return value + 'px';
    }

    return value;
  }

}
