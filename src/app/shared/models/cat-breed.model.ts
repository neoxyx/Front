/**
 * Modelo que representa una raza de gato con todas sus propiedades
 */
export interface CatBreed {
  /** ID único de la raza */
  breedId: string;

  /** Nombre de la raza */
  name: string;

  /** Descripción de la raza */
  description: string;

  /** Origen geográfico de la raza */
  origin: string;

  /** Características de temperamento */
  temperament: string;

  /** Esperanza de vida en años */
  life_span: string;

  /** Peso promedio en kilogramos (rango) */
  weight: {
    imperial: string; // Ejemplo: "7 - 10" (libras)
    metric: string;   // Ejemplo: "3 - 5" (kg)
  };

  /** Puntuaciones de características (1-5) */
  adaptability: number;
  affection_level: number;
  child_friendly: number;
  dog_friendly: number;
  energy_level: number;
  grooming: number;
  health_issues: number;
  intelligence: number;
  shedding_level: number;
  social_needs: number;
  stranger_friendly: number;
  vocalisation: number;

  /** Categorías y etiquetas */
  breed_group?: string;
  cfa_url?: string;
  vetstreet_url?: string;
  vcahospitals_url?: string;
  country_codes?: string;
  country_code?: string;

  /** Información de imágenes */
  reference_image_id?: string;
  image?: CatImage;
  images?: CatImage[];

  /** Estadísticas de búsqueda */
  search_count?: number;
}

/**
 * Modelo para imágenes de gatos
 */
export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds?: CatBreed[];
  categories?: {
    id: number;
    name: string;
  }[];
}

/**
 * Respuesta paginada para búsquedas de razas
 */
export interface PaginatedCatBreeds {
  data: CatBreed[];
  pagination: {
    current_page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Parámetros para búsqueda/filtrado de razas
 */
export interface CatBreedSearchParams {
  q?: string;           // Término de búsqueda
  limit?: number;       // Límite de resultados
  page?: number;        // Página actual
  order?: 'ASC' | 'DESC'; // Ordenamiento
}
