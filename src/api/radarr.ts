// Radarr API Service for movie downloads

export type RadarrLookupCard = {
  id?: number;
  title: string;
  year?: number;
  overview?: string;
  imageUrl?: string;
  tmdbId?: number;
};

interface RadarrMovie {
  id: number;
  title: string;
  originalTitle: string;
  alternateTitles: any[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: string;
  physicalRelease: string;
  digitalRelease: string;
  images: RadarrImage[];
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: any;
  movieFile?: RadarrMovieFile;
}

interface RadarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

interface RadarrMovieFile {
  id: number;
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: string;
  sceneName: string;
  indexerFlags: number;
  quality: any;
  mediaInfo: any;
  originalFilePath: string;
  qualityDetectionSource: string;
  revision: any;
}

interface RadarrQualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: any[];
  minFormatScore: number;
  cutoffFormatScore: number;
  formatItems: any[];
  language: any;
}

interface RadarrRootFolder {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace: number;
  unmappedFolders: any[];
}

interface RadarrSystemStatus {
  version: string;
  buildTime: string;
  isDebug: boolean;
  isProduction: boolean;
  isAdmin: boolean;
  isUserInteractive: boolean;
  startupPath: string;
  appData: string;
  osName: string;
  osVersion: string;
  isMonoRuntime: boolean;
  isMono: boolean;
  isLinux: boolean;
  isOsx: boolean;
  isWindows: boolean;
  mode: string;
  branch: string;
  authentication: string;
  sqliteVersion: string;
  migrationVersion: number;
  urlBase: string;
  runtimeVersion: string;
  runtimeName: string;
  startTime: string;
}

class RadarrService {
  private baseUrl: string = "";
  private apiKey: string = "";

  setCredentials(serverUrl: string, apiKey: string) {
    this.baseUrl = serverUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, method: string = "GET", body?: any): Promise<T> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("Radarr credentials not configured");
    }

    const url = `${this.baseUrl}/api/v3${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Radarr API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Radarr API request failed:", error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getSystemStatus();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get system status
  async getSystemStatus(): Promise<RadarrSystemStatus> {
    return this.makeRequest<RadarrSystemStatus>("/system/status");
  }

  // Get all movies
  async getMovies(): Promise<RadarrMovie[]> {
    return this.makeRequest<RadarrMovie[]>("/movie");
  }

  // Get movie by ID
  async getMovie(movieId: number): Promise<RadarrMovie> {
    return this.makeRequest<RadarrMovie>(`/movie/${movieId}`);
  }

  // Add movie
  async addMovie(movie: Partial<RadarrMovie>): Promise<RadarrMovie> {
    return this.makeRequest<RadarrMovie>("/movie", "POST", movie);
  }

  // Update movie
  async updateMovie(movieId: number, movie: Partial<RadarrMovie>): Promise<RadarrMovie> {
    return this.makeRequest<RadarrMovie>(`/movie/${movieId}`, "PUT", movie);
  }

  // Delete movie
  async deleteMovie(movieId: number, deleteFiles: boolean = false): Promise<void> {
    await this.makeRequest<void>(`/movie/${movieId}?deleteFiles=${deleteFiles}`, "DELETE");
  }

  // Search for movie
  async searchMovie(term: string): Promise<RadarrMovie[]> {
    return this.makeRequest<RadarrMovie[]>(`/movie/lookup?term=${encodeURIComponent(term)}`);
  }

  mapLookupToCard(item: Partial<RadarrMovie>): RadarrLookupCard {
    const img = Array.isArray(item.images) ? item.images.find((i: any) => i.coverType === "poster") : undefined;
    return {
      id: item.id,
      title: item.title || "",
      year: item.year,
      overview: item.overview,
      imageUrl: (img?.remoteUrl || img?.url || "") as string,
      tmdbId: item.tmdbId,
    };
  }

  // Get quality profiles
  async getQualityProfiles(): Promise<RadarrQualityProfile[]> {
    return this.makeRequest<RadarrQualityProfile[]>("/qualityprofile");
  }

  // Get root folders
  async getRootFolders(): Promise<RadarrRootFolder[]> {
    return this.makeRequest<RadarrRootFolder[]>("/rootfolder");
  }

  // Trigger movie search
  async searchMovieById(movieId: number): Promise<void> {
    await this.makeRequest<void>("/command", "POST", {
      name: "MoviesSearch",
      movieIds: [movieId],
    });
  }

  // Add movie from TMDB ID
  async addMovieFromTMDB(
    tmdbId: number,
    title: string,
    year: number,
    qualityProfileId: number,
    rootFolderPath: string,
    monitored: boolean = true,
    searchForMovie: boolean = true
  ): Promise<RadarrMovie> {
    const movieData = {
      title,
      year,
      tmdbId,
      qualityProfileId,
      rootFolderPath,
      monitored,
      addOptions: {
        searchForMovie,
      },
    };

    return this.addMovie(movieData);
  }

  // Mock data for development
  getMockMovies(): RadarrMovie[] {
    return [
      {
        id: 1,
        title: "The Dark Knight",
        originalTitle: "The Dark Knight",
        alternateTitles: [],
        secondaryYearSourceId: 0,
        sortTitle: "dark knight",
        sizeOnDisk: 0,
        status: "released",
        overview: "Batman raises the stakes in his war on crime.",
        inCinemas: "2008-07-18T00:00:00Z",
        physicalRelease: "2008-12-09T00:00:00Z",
        digitalRelease: "2008-12-09T00:00:00Z",
        images: [],
        website: "",
        year: 2008,
        hasFile: false,
        youTubeTrailerId: "",
        studio: "Warner Bros.",
        path: "/movies/The Dark Knight (2008)",
        qualityProfileId: 1,
        monitored: true,
        minimumAvailability: "released",
        isAvailable: true,
        folderName: "The Dark Knight (2008)",
        runtime: 152,
        cleanTitle: "thedarkknight",
        imdbId: "tt0468569",
        tmdbId: 155,
        titleSlug: "the-dark-knight-155",
        certification: "PG-13",
        genres: ["Action", "Crime", "Drama"],
        tags: [],
        added: "2023-01-01T00:00:00Z",
        ratings: {},
      },
    ];
  }

  getMockQualityProfiles(): RadarrQualityProfile[] {
    return [
      {
        id: 1,
        name: "HD-1080p",
        upgradeAllowed: true,
        cutoff: 7,
        items: [],
        minFormatScore: 0,
        cutoffFormatScore: 0,
        formatItems: [],
        language: { id: 1, name: "English" },
      },
      {
        id: 2,
        name: "Ultra-HD",
        upgradeAllowed: true,
        cutoff: 16,
        items: [],
        minFormatScore: 0,
        cutoffFormatScore: 0,
        formatItems: [],
        language: { id: 1, name: "English" },
      },
    ];
  }

  getMockRootFolders(): RadarrRootFolder[] {
    return [
      {
        id: 1,
        path: "/movies",
        accessible: true,
        freeSpace: 1000000000000,
        unmappedFolders: [],
      },
    ];
  }
}

// Create and export a singleton instance
const radarrService = new RadarrService();
export default radarrService;