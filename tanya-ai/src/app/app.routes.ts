import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'random-user',
    loadComponent: () => import('./pages/random-user/random-user.page').then((m) => m.RandomUserPage),
  },
  {
    path: 'grammar-checker',
    loadComponent: () => import('./pages/grammar-checker/grammar-checker.page').then((m) => m.GrammarCheckerPage),
  },
];
