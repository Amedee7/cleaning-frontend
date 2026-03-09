import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: true,
    styleUrls: ['./login.component.css'],
    providers: [MessageService],
    imports: [
        CommonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule,
        RippleModule,
        ToastModule,
        MessageModule,
    ],
})
export class LoginComponent {
    valCheck: string[] = ['remember'];
    email!: string; // Pour stocker l'email saisi
    password!: string;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    login(): void {
        if (this.email && this.password) {
            this.authService
                .login({ email: this.email, password: this.password })
                .subscribe({
                    next: (res: any) => {
                        this.authService.setToken(res.access_token);
                        this.router.navigate(['/']);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Connexion réussie.',
                        });
                    },
                    error: (error) => {
                        console.error('Erreur de connexion', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Veuillez saisir votre email et votre mot de passe.',
                        });
                    },
                });
        } else {
            console.warn('Veuillez saisir votre email et votre mot de passe.');
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez saisir votre email et votre mot de passe.',
            });
        }
    }
}
