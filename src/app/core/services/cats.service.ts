import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CatBreed, CatBreedSearchParams, CatImage } from '../../shared/models/cat-breed.model';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, shareReplay, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CatsService {
  private readonly apiUrl = environment.apiUrl;
  private readonly catApiKey = environment.catApiKey;
  private imageCache: { [breedId: string]: CatImage[] } = {};
  private breedsCache$?: Observable<CatBreed[]>;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos en milisegundos

  constructor(private readonly http: HttpClient) { }

  getBreeds(forceRefresh = false): Observable<CatBreed[]> {
    // Verificar si hay caché válido
    if (this.breedsCache$ && !this.isCacheExpired() && !forceRefresh) {
      return this.breedsCache$;
    }

    // Hacer nueva petición
    this.breedsCache$ = this.http.get<CatBreed[]>(`${this.apiUrl}/cats/breeds`, {
      headers: { 'x-api-key': this.catApiKey }
    }).pipe(
      map(breeds => this.transformBreeds(breeds)),
      tap(() => this.lastFetchTime = Date.now()),
      shareReplay(1), // Compartir el último valor con nuevos suscriptores
      catchError(error => this.handleError('Error al obtener razas', error))
    );

    return this.breedsCache$;
  }

  /**
   * Transforma los datos de la API al modelo CatBreed
   * @param breeds Datos crudos de la API
   * @private
   */
  private transformBreeds(breeds: any[]): CatBreed[] {
    return breeds.map(breed => ({
      id: breed.id,
      name: breed.name,
      description: breed.description || 'Descripción no disponible',
      origin: breed.origin || 'Origen desconocido',
      temperament: breed.temperament || 'Temperamento no especificado',
      life_span: breed.life_span || 'N/A',
      weight: {
        imperial: breed.weight?.imperial || 'N/A',
        metric: breed.weight?.metric || 'N/A'
      },
      adaptability: breed.adaptability || 0,
      affection_level: breed.affection_level || 0,
      intelligence: breed.intelligence || 0,
      reference_image_id: breed.reference_image_id,
      image: breed.image ? {
        id: breed.image.id,
        url: breed.image.url,
        width: breed.image.width,
        height: breed.image.height
      } : undefined
    } as CatBreed));
  }

  /**
   * Verifica si el caché ha expirado
   * @private
   */
  private isCacheExpired(): boolean {
    return Date.now() - this.lastFetchTime > this.CACHE_TTL;
  }

  /**
   * Maneja errores de las peticiones HTTP
   * @param message Mensaje de error personalizado
   * @param error Error original
   * @private
   */
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => new Error(message));
  }

  /**
   * Limpia el caché de razas
   */
  clearBreedsCache(): void {
    this.breedsCache$ = undefined;
    this.lastFetchTime = 0;
  }

  /**
   * Obtiene imágenes para una raza específica
   * @param breedId ID de la raza
   * @param limit Número máximo de imágenes a retornar (default: 1)
   * @param forceRefresh Ignorar caché y forzar nueva petición (default: false)
   * @returns Observable con array de CatImage
   */
  getBreedImages(breedId: string, limit: number = 1, forceRefresh: boolean = false): Observable<CatImage[]> {
    // Verificar caché primero
    if (this.imageCache[breedId] && !forceRefresh) {
      return of(this.imageCache[breedId].slice(0, limit));
    }

    return this.http.get<any[]>(`${this.apiUrl}/imagesbybreedid/${breedId}`, {
      params: { limit: limit.toString() },
      headers: { 'x-api-key': this.catApiKey }
    }).pipe(
      map(images => this.transformImages(images)),
      tap(images => {
        // Almacenar en caché
        this.imageCache[breedId] = images;
      }),
      catchError(error => {
        console.error('Error fetching breed images:', error);
        return throwError(() => new Error('No se pudieron cargar las imágenes'));
      })
    );
  }

  /**
   * Transforma la respuesta de la API al modelo CatImage
   * @param images Datos crudos de la API
   * @private
   */
  private transformImages(images: any[]): CatImage[] {
    return images.map(img => ({
      id: img.id,
      url: img.url || 'assets/default-cat.jpg',
      width: img.width || 0,
      height: img.height || 0,
      breeds: img.breeds ? [{
        id: img.breeds[0]?.id,
        name: img.breeds[0]?.name
      }] : []
    } as CatImage));
  }

  /**
   * Limpia la caché de imágenes para una raza específica o todas
   * @param breedId Opcional - ID de la raza a limpiar
   */
  clearImageCache(breedId?: string): void {
    if (breedId) {
      delete this.imageCache[breedId];
    } else {
      this.imageCache = {};
    }
  }

  /**
   * Busca razas de gatos según criterios
   * @param params Objeto con parámetros de búsqueda
   * @returns Observable con array de CatBreed
   */
  searchBreeds(params: CatBreedSearchParams): Observable<CatBreed[]> {
    // Crear parámetros HTTP
    let httpParams = new HttpParams();

    if (params.q) httpParams = httpParams.append('q', params.q);
    if (params.limit) httpParams = httpParams.append('limit', params.limit.toString());
    if (params.page) httpParams = httpParams.append('page', params.page.toString());
    if (params.order) httpParams = httpParams.append('order', params.order);

    // Verificar caché para búsquedas vacías
    if (!params.q && this.breedsCache$) {
      return this.breedsCache$.pipe(
        map(breeds => this.filterAndPaginate(breeds, params))
      );
    }

    return this.http.get<CatBreed[]>(`${this.apiUrl}/cats/breeds/search`, {
      params: httpParams,
      headers: { 'x-api-key': this.catApiKey }
    }).pipe(
      map(breeds => this.transformBreeds(breeds)),
      catchError(error => this.handleError('Error en búsqueda', error)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      debounceTime(300) // Evitar múltiples peticiones rápidas
    );
  }

  /**
   * Filtra y pagina localmente cuando no hay query
   * @param breeds Lista completa de razas
   * @param params Parámetros de búsqueda
   * @private
   */
  private filterAndPaginate(breeds: CatBreed[], params: CatBreedSearchParams): CatBreed[] {
    let result = [...breeds];

    // Paginación
    if (params.page && params.limit) {
      const startIndex = (params.page - 1) * params.limit;
      result = result.slice(startIndex, startIndex + params.limit);
    }

    // Ordenamiento
    if (params.order) {
      result.sort((a, b) => {
        return params.order === 'ASC'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    }

    return result;
  }

  /**
   * Versión reactiva para usar con formularios
   * @param searchTerm$ Observable del término de búsqueda
   */
  createSearchObservable(searchTerm$: Observable<string>): Observable<CatBreed[]> {
    return searchTerm$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => this.searchBreeds({ q: term }))
    );
  }
}
