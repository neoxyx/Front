import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/cats/breeds-list/breeds-list.component')
      .then(m => m.BreedsListComponent)
  },
  {
    path: 'cats',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/cats/breeds-list/breeds-list.component')
          .then(m => m.BreedsListComponent)
      },
      {
        path: 'table',
        loadComponent: () => import('./features/cats/breeds-table/breeds-table.component')
          .then(m => m.BreedsTableComponent)
      },
      {
        path: 'detail/:breedId',
        loadComponent: () => import('./features/cats/breed-detail/breed-detail.component')
          .then(m => m.BreedDetailComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    data: {
      title: 'Mi Perfil',
      requiresAuth: true
    }
  },
  { path: '**', redirectTo: '' }
];
