import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatsService } from '../../../core/services/cats.service'
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from "../../../shared/pipes/truncate.pipe";
import { CatBreed } from '../../../shared/models/cat-breed.model';

@Component({
  selector: 'app-breeds-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    TruncatePipe
  ],
  templateUrl: './breeds-table.component.html',
  styleUrls: ['./breeds-table.component.scss']
})
export class BreedsTableComponent implements OnInit, OnDestroy {
  breeds: CatBreed[] = [];
  filteredBreeds: CatBreed[] = [];
  isLoading = true;
  error: string | null = null;

  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalBreeds = 0;

  // Filtros
  searchQuery = '';

  // Columnas a mostrar
  displayedColumns: string[] = ['name', 'origin', 'temperament', 'lifeSpan', 'actions'];
  private breedsSub!: Subscription;
  private searchSub!: Subscription;

  private readonly subs = new Subscription();

  constructor(private readonly catsService: CatsService) { }

  ngOnInit(): void {
    this.loadBreeds();
    this.setupSearchDebounce('');
  }

  ngOnDestroy(): void {
    this.breedsSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  loadBreeds(): void {
    this.isLoading = true;
    this.error = null;

    this.breedsSub = this.catsService.getBreeds().subscribe({
      next: (breeds) => {
        this.breeds = breeds;
        this.filteredBreeds = [...breeds];
        this.totalBreeds = breeds.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las razas de gatos';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  setupSearchDebounce(term: string): void {
    this.searchSub = this.catsService.searchBreeds({q:term})
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(breeds => {
        this.filteredBreeds = breeds;
        this.totalBreeds = breeds.length;
        this.pageIndex = 0; // Resetear paginación al buscar
      });
  }

  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredBreeds = [...this.breeds];
      this.totalBreeds = this.breeds.length;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredBreeds = this.breeds.filter(breed =>
      breed.name.toLowerCase().includes(query) ||
      breed.origin.toLowerCase().includes(query) ||
      breed.temperament.toLowerCase().includes(query)
    );
    this.totalBreeds = this.filteredBreeds.length;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  get paginatedBreeds(): CatBreed[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredBreeds.slice(startIndex, startIndex + this.pageSize);
  }
}
