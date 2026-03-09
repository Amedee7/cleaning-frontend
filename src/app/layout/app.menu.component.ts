import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Accueil',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Paramétrages',
                items: [
                    { label: 'Proprietaires', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/owners'] },
                    { label: 'Locataires', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/tenants'] },
                    { label: 'Maisons', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/houses'] },
                    { label: 'Parcelles', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/plots'] },
                    { label: 'Contrats', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/contracts'] },
                    { label: 'Contrats de gestion', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/contrats-gestion'] },
                    { label: 'Paiements', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/payments'] },
                    { label: 'Paiements en retard', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/payments-late'] },
                    { label: 'Utilisateurs', icon: 'pi pi-fw pi-eye', routerLink: ['/pages/users-management'] }

                    ]
            },
        ];
    }
}
