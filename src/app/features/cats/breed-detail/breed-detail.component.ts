import { Component, Input } from '@angular/core';
import { CatBreed } from '../../../shared/models/cat-breed.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breed-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breed-detail.component.html',
  styleUrls: ['./breed-detail.component.scss']
})
export class BreedDetailComponent {
  @Input() breed!: CatBreed;

  get temperamentList(): string[] {
    return this.breed.temperament.split(', ');
  }

  getWeightInKg(): string {
    return this.breed.weight.metric || 'N/A';
  }
}
