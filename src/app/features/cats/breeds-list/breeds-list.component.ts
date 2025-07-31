import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CatsService } from '../../../core/services/cats.service'
import { CatBreed } from '../../../shared/models/cat-breed.model'
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

// Angular Material Imports
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-breeds-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './breeds-list.component.html',
  styleUrls: ['./breeds-list.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class BreedsListComponent implements OnInit, OnDestroy {
  breeds: CatBreed[] = [];
  selectedBreed: CatBreed | null = null;
  currentImageIndex = 0;
  isLoading = false;
  error: string | null = null;
  imageLoading = true;
  private breedsSub!: Subscription;

  constructor(private readonly catsService: CatsService) {}

  ngOnInit(): void {
    this.loadBreeds();
  }

  ngOnDestroy(): void {
    this.breedsSub?.unsubscribe();
  }

  loadBreeds(): void {
    this.isLoading = true;
    this.error = null;

    this.breedsSub = this.catsService.getBreeds().subscribe({
      next: (breeds) => {
        this.breeds = breeds;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las razas. Por favor intenta nuevamente.';
        this.isLoading = false;
        console.error('Error loading breeds:', err);
      }
    });
  }

  onBreedSelected(breedId: string): void {
    if (!breedId) {
      this.selectedBreed = null;
      return;
    }

    const breed = this.breeds.find(b => b.id === breedId);
    if (breed) {
      this.selectedBreed = breed;
      this.currentImageIndex = 0;
      this.loadBreedImages(breed.id);
    }
  }

  loadBreedImages(breedId: string): void {
    if (!this.selectedBreed) return;

    this.imageLoading = true;
    this.catsService.getBreedImages(breedId, 5).subscribe({
      next: (images) => {
        if (this.selectedBreed) {
          this.selectedBreed.images = images;
          this.imageLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading images:', err);
        if (this.selectedBreed) {
          this.selectedBreed.images = [];
        }
        this.imageLoading = false;
      }
    });
  }

  nextImage(): void {
    if (!this.selectedBreed?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedBreed.images.length;
  }

  prevImage(): void {
    if (!this.selectedBreed?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedBreed.images.length) % this.selectedBreed.images.length;
  }

  getTraits(temperament: string = ''): string[] {
    return temperament.split(', ').filter(t => t.trim().length > 0);
  }

  onImageLoad(): void {
    this.imageLoading = false;
  }

  onImageError(): void {
    if (this.selectedBreed?.images?.[this.currentImageIndex]) {
      this.selectedBreed.images[this.currentImageIndex].url = 'assets/default-cat.jpg';
    }
    this.imageLoading = false;
  }
}
