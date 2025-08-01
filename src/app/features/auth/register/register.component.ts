import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email], [this.validateEmailAvailability.bind(this)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';
  emailAvailable: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  // Validador personalizado para coincidencia de contraseñas
  passwordMatchValidator(form: any) {
    return form.get('password').value === form.get('confirmPassword').value 
      ? null 
      : { mismatch: true };
  }

  // Validador asíncrono para disponibilidad de email
  validateEmailAvailability(control: any) {
    return this.authService.checkEmailAvailability(control.value).pipe(
      tap(({ available }) => {
        this.emailAvailable = available;
        if (!available) {
          control.setErrors({ emailTaken: true });
        }
      })
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.register(name!, email!, password!).subscribe({
      next: (user) => {
        // Auto-login después del registro
        this.authService.login(email!, password!).subscribe({
          next: () => {
            this.router.navigate(['/profile']);
          },
          error: (err) => {
            this.errorMessage = 'Error al iniciar sesión automáticamente';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Error en el registro. Por favor intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }
}