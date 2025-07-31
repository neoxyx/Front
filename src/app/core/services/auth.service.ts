import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment'
import { User } from '../../shared/models/user.model'
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Intenta cargar el usuario desde localStorage al inicializar
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  /**
   * Registra un nuevo usuario
   * @param name Nombre del usuario
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con el usuario registrado
   */
  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/register`, {
      name,
      email,
      password
    });
  }

  /**
   * Inicia sesión con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con el usuario autenticado
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/login`, { email, password })
      .pipe(
        tap(user => {
          // Almacena el usuario y emite el nuevo estado
          this.storeUserData(user);
        })
      );
  }

  /**
   * Cierra la sesión actual
   */
  logout(): void {
    // Elimina los datos del usuario y navega al login
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns boolean indicando si hay un usuario logueado
   */
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  /**
   * Obtiene el token de autenticación (si existe)
   * @returns string | null con el token JWT
   */
  getAuthToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || null;
  }

  /**
   * Obtiene el usuario actual (valor sincrónico)
   * @returns User | null
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Almacena los datos del usuario en localStorage y emite el nuevo estado
   * @param user Datos del usuario
   */
  private storeUserData(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Verifica si el email ya está registrado
   * @param email Email a verificar
   * @returns Observable<boolean>
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(
      `${environment.apiUrl}/users/check-email`,
      { email }
    );
  }

  checkCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap(user => this.storeUserData(user)),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Not authenticated'));
      })
    );
  }
}
