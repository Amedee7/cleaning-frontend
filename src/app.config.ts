import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { tokenInterceptor } from './app/core/interceptors/token.interceptor';
import { routes } from './app.routes';

registerLocaleData(localeFr, 'fr-FR');

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withViewTransitions()),
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideAnimations(),

        // Configuration de la locale française pour toute l'application
        { provide: LOCALE_ID, useValue: 'fr-FR' },
    ],
};
