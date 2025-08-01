import { Component, Input } from '@angular/core';
import { CatBreed } from '../../../shared/models/cat-breed.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CatsService } from '../../../core/services/cats.service';

@Component({
  selector: 'app-breed-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breed-detail.component.html',
  styleUrls: ['./breed-detail.component.scss']
})
export class BreedDetailComponent {
  breed!: CatBreed;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly catService: CatsService
  ) {}

  ngOnInit() {
    const breedId = this.route.snapshot.paramMap.get('breedId');
    if (breedId) {
      this.catService.getBreedById(breedId).subscribe(data => {
        this.breed = data;
        console.log('Breed details:', this.breed);
      });
    } else {
      // Handle the case where breedId is null, e.g., show an error or fallback
      console.error('Breed ID is missing from route parameters.');
    }
  }

  get temperamentList(): string[] {
    return this.breed.temperament.split(', ');
  }

  getWeightInKg(): string {
    return this.breed.weight.metric || 'N/A';
  }
}
