import {LOCALE_ID, NgModule} from '@angular/core';
import {HashLocationStrategy, LocationStrategy, PathLocationStrategy, registerLocaleData} from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import localeFr from '@angular/common/locales/fr';
import {AuthInterceptor} from "./demo/auth-interceptor.interceptor";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthService} from "./demo/service/auth.service";
import {JwtInterceptor} from "./demo/components/auth/jwt.interceptor";

registerLocaleData(localeFr);

@NgModule({
    declarations: [AppComponent, NotfoundComponent],
    imports: [AppRoutingModule, AppLayoutModule],
    providers: [
        AuthService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: LOCALE_ID, useValue: 'fr' },
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService,
    ],
    bootstrap: [AppComponent],

})
export class AppModule {}
