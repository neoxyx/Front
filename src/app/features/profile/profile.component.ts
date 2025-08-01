import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'
import { User } from '../../shared/models/user.model'
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    DatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = true;
  private userSub!: Subscription;
  name: string = '';
  email: string = '';
  createdAt: string | Date = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('Usuario actual:', user);

        this.name = user.name;
        this.email = user.email;
        this.createdAt = user.createdAt;
      }
      this.isLoading = false;
    });

    // Carga inicial si no hay usuario
    if (!this.authService.currentUserValue) {
      this.authService.checkCurrentUser().subscribe({
        error: () => this.router.navigate(['/login'])
      });
    }
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get formattedJoinDate(): string {
    if (!this.user?.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
