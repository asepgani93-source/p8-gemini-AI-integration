import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// IMPORT INI untuk koneksi ke internet
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    // Tetap pakai PreloadAllModules agar aplikasi ringan
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // TAMBAHKAN INI (Agar bisa request ke API AI)
    provideHttpClient(),
  ],
});
