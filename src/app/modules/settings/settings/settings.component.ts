import { Component, OnInit, signal } from '@angular/core';
import {ArticleService, PressingSettingsService} from '../../../core/services/pressing.services';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CategoriesComponent} from "../../articles/components/categories/categories.component";
import {ToastModule} from "primeng/toast";
import {TabViewModule} from "primeng/tabview";
import {DividerModule} from "primeng/divider";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService, MessageService} from "primeng/api";


@Component({
  selector: 'app-settings',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CategoriesComponent, ToastModule, TabViewModule, DividerModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
    export class SettingsComponent implements OnInit {

    activeTabIndex: number = 0;

    form = this.fb.group({
        shop_name:              [''],
        shop_address:           [''],
        shop_phone:             [''],
        shop_email:             [''],
        tax_number:             [''],
        default_tax_rate:       [18],
        default_processing_days:[2],
        currency:               ['XOF'],
        currency_symbol:        ['FCFA'],
        receipt_footer:         [''],
        print_auto_receipt:     [false],
        print_auto_sticker:     [false],
        sms_notification:       [false],
        sms_api_key:            [''],
        sms_template_ready:     [''],
    });

    saving = signal(false);
    saved  = signal(false);

    constructor(
        private fb: FormBuilder,
        private settingsService: PressingSettingsService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        // Restaurer le tab sauvegardé
        const savedTab = localStorage.getItem('settingActiveTab');
        if (savedTab !== null) {
            this.activeTabIndex = parseInt(savedTab);
        }
        this.settingsService.get$().subscribe(s => this.form.patchValue(s as any));
    }

    onTabChange(event: any): void {
        this.activeTabIndex = event.index;
        localStorage.setItem('settingActiveTab', event.index.toString());
    }

    toggle(field: string): void {
        const current = this.form.get(field)?.value;
        this.form.get(field)?.setValue(!current);
    }

    save(): void {
        this.saving.set(true);
        this.settingsService.update(this.form.value as any).subscribe({
            next: () => {
                this.saving.set(false);
                this.saved.set(true);
                setTimeout(() => this.saved.set(false), 3000);
            },
            error: () => this.saving.set(false),
        });
    }
}
