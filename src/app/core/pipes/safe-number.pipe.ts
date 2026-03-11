import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeNumber', standalone: true })
export class SafeNumberPipe implements PipeTransform {
    transform(value: any, digitsInfo = '1.0-0'): string {
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    }
}
