// Sonarr API Service for TV show downloads

export type SonarrLookupCard = {
  id?: number;
  name: string;
  year?: number;
  overview?: string;
  imageUrl?: string;
  tvdbId?: number;
  firstAired?: string;
};

interface SonarrSeries {
  id: number;
  title: string;
  alternateTitles: any[];
  sortTitle: string;
  status: string;
  ended: boolean;
  profileName: string;
  overview: string;
  nextAiring: string;
  previousAiring: string;
  network: string;
  airTime: string;
  images: SonarrImage[];
  originalLanguage: any;
  remotePoster: string;
  seasons: SonarrSeason[];
  year: number;
  path: string;
  qualityProfileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  seriesType: string;
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  rootFolderPath: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: any;
  statistics: SonarrStatistics;
}

interface SonarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

interface SonarrSeason {
  seasonNumber: number;
  monitored: boolean;
  statistics: SonarrSeasonStatistics;
}

interface SonarrSeasonStatistics {
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  percentOfEpisodes: number;
}

interface SonarrStatistics {
  seasonCount: number;
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  percentOfEpisodes: number;
}

interface SonarrEpisode {
  id: number;
  seriesId: number;
  tvdbId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string;
  airDateUtc: string;
  overview: string;
  hasFile: boolean;
  monitored: boolean;
  absoluteEpisodeNumber: number;
  unverifiedSceneNumbering: boolean;
  series: SonarrSeries;
  images: SonarrImage[];
}

interface SonarrQualityProfile {
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

interface SonarrRootFolder {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace: number;
  unmappedFolders: any[];
}

interface SonarrSystemStatus {
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

class SonarrService {
  private baseUrl: string = "";
  private apiKey: string = "";

  setCredentials(serverUrl: string, apiKey: string) {
    this.baseUrl = serverUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, method: string = "GET", body?: any): Promise<T> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("Sonarr credentials not configured");
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
        throw new Error(`Sonarr API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Sonarr API request failed:", error);
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
  async getSystemStatus(): Promise<SonarrSystemStatus> {
    return this.makeRequest<SonarrSystemStatus>("/system/status");
  }

  // Get all series
  async getSeries(): Promise<SonarrSeries[]> {
    return this.makeRequest<SonarrSeries[]>("/series");
  }

  // Get series by ID
  async getSeriesById(seriesId: number): Promise<SonarrSeries> {
    return this.makeRequest<SonarrSeries>(`/series/${seriesId}`);
  }

  // Add series
  async addSeries(series: Partial<SonarrSeries>): Promise<SonarrSeries> {
    return this.makeRequest<SonarrSeries>("/series", "POST", series);
  }

  // Update series
  async updateSeries(seriesId: number, series: Partial<SonarrSeries>): Promise<SonarrSeries> {
    return this.makeRequest<SonarrSeries>(`/series/${seriesId}`, "PUT", series);
  }

  // Delete series
  async deleteSeries(seriesId: number, deleteFiles: boolean = false): Promise<void> {
    await this.makeRequest<void>(`/series/${seriesId}?deleteFiles=${deleteFiles}`, "DELETE");
  }

  // Search for series
  async searchSeries(term: string): Promise<SonarrSeries[]> {
    return this.makeRequest<SonarrSeries[]>(`/series/lookup?term=${encodeURIComponent(term)}`);
  }

  mapLookupToCard(item: Partial<SonarrSeries>): SonarrLookupCard {
    const img = Array.isArray(item.images) ? item.images.find((i: any) => i.coverType === "poster") : undefined;
    return {
      id: item.id,
      name: (item as any).title || "",
      year: item.year,
      overview: item.overview,
      imageUrl: (img?.remoteUrl || img?.url || (item as any).remotePoster || "") as string,
      tvdbId: item.tvdbId,
      firstAired: (item as any).firstAired,
    };
  }

  // Get episodes for series
  async getEpisodes(seriesId: number): Promise<SonarrEpisode[]> {
    return this.makeRequest<SonarrEpisode[]>(`/episode?seriesId=${seriesId}`);
  }

  // Get quality profiles
  async getQualityProfiles(): Promise<SonarrQualityProfile[]> {
    return this.makeRequest<SonarrQualityProfile[]>("/qualityprofile");
  }

  // Get root folders
  async getRootFolders(): Promise<SonarrRootFolder[]> {
    return this.makeRequest<SonarrRootFolder[]>("/rootfolder");
  }

  // Trigger series search
  async searchSeriesById(seriesId: number): Promise<void> {
    await this.makeRequest<void>("/command", "POST", {
      name: "SeriesSearch",
      seriesId,
    });
  }

  // Trigger season search
  async searchSeason(seriesId: number, seasonNumber: number): Promise<void> {
    await this.makeRequest<void>("/command", "POST", {
      name: "SeasonSearch",
      seriesId,
      seasonNumber,
    });
  }

  // Add series from TVDB ID
  async addSeriesFromTVDB(
    tvdbId: number,
    title: string,
    qualityProfileId: number,
    rootFolderPath: string,
    monitored: boolean = true,
    searchForMissingEpisodes: boolean = true
  ): Promise<SonarrSeries> {
    const seriesData = {
      title,
      tvdbId,
      qualityProfileId,
      rootFolderPath,
      monitored,
      seasonFolder: true,
      addOptions: {
        searchForMissingEpisodes,
      },
    };

    return this.addSeries(seriesData);
  }

  // Mock data for development
  getMockSeries(): SonarrSeries[] {
    return [
      {
        id: 1,
        title: "Breaking Bad",
        alternateTitles: [],
        sortTitle: "breaking bad",
        status: "ended",
        ended: true,
        profileName: "HD-1080p",
        overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        nextAiring: "",
        previousAiring: "2013-09-29T21:00:00Z",
        network: "AMC",
        airTime: "21:00",
        images: [],
        originalLanguage: { id: 1, name: "English" },
        remotePoster: "",
        seasons: [
          {
            seasonNumber: 1,
            monitored: true,
            statistics: {
              episodeFileCount: 7,
              episodeCount: 7,
              totalEpisodeCount: 7,
              sizeOnDisk: 0,
              percentOfEpisodes: 100,
            },
          },
        ],
        year: 2008,
        path: "/tv/Breaking Bad",
        qualityProfileId: 1,
        languageProfileId: 1,
        seasonFolder: true,
        monitored: true,
        useSceneNumbering: false,
        runtime: 47,
        tvdbId: 81189,
        tvRageId: 18164,
        tvMazeId: 169,
        firstAired: "2008-01-20T00:00:00Z",
        seriesType: "standard",
        cleanTitle: "breakingbad",
        imdbId: "tt0903747",
        titleSlug: "breaking-bad",
        rootFolderPath: "/tv",
        certification: "TV-MA",
        genres: ["Crime", "Drama", "Thriller"],
        tags: [],
        added: "2023-01-01T00:00:00Z",
        ratings: {},
        statistics: {
          seasonCount: 5,
          episodeFileCount: 62,
          episodeCount: 62,
          totalEpisodeCount: 62,
          sizeOnDisk: 0,
          percentOfEpisodes: 100,
        },
      },
    ];
  }

  getMockQualityProfiles(): SonarrQualityProfile[] {
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

  getMockRootFolders(): SonarrRootFolder[] {
    return [
      {
        id: 1,
        path: "/tv",
        accessible: true,
        freeSpace: 1000000000000,
        unmappedFolders: [],
      },
    ];
  }
}

// Create and export a singleton instance
const sonarrService = new SonarrService();
export default sonarrService;