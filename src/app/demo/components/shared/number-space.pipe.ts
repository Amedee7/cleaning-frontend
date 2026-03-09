import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    name: 'numberSpace'
})
export class NumberSpacePipe implements PipeTransform {
    transform(value: number | string): string {
        if (value == null) return '';

        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
}
