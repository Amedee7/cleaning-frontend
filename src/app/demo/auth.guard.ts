import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "./service/auth.service";

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this.authService.isAuthenticated()) {
            return true;
        } else {
            // Redirigez vers la page de connexion
            return this.router.parseUrl('/auth/login'); // Adaptez le chemin si nécessaire
        }
    }
}
