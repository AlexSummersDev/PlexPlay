// Plex API Service
// Note: Plex API is unofficial and requires authentication

// Interface for future use
// interface PlexServer {
//   name: string;
//   host: string;
//   port: number;
//   machineIdentifier: string;
//   version: string;
// }

interface PlexLibrary {
  key: string;
  title: string;
  type: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
}

interface PlexMediaItem {
  ratingKey: string;
  key: string;
  guid: string;
  title: string;
  summary: string;
  thumb: string;
  art: string;
  year: number;
  addedAt: number;
  updatedAt: number;
}

class PlexService {
  private baseUrl: string = "";
  private token: string = "";

  setCredentials(serverUrl: string, token: string) {
    this.baseUrl = serverUrl.replace(/\/$/, ""); // Remove trailing slash
    this.token = token;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.baseUrl || !this.token) {
      throw new Error("Plex credentials not configured");
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append("X-Plex-Token", this.token);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
          "X-Plex-Client-Identifier": "PlexMediaApp",
          "X-Plex-Product": "Plex Media App",
          "X-Plex-Version": "1.0.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Plex API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Plex API request failed:", error);
      throw error;
    }
  }

  // Test connection to Plex server
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/");
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get server information
  async getServerInfo(): Promise<any> {
    return this.makeRequest("/");
  }

  // Get all libraries
  async getLibraries(): Promise<PlexLibrary[]> {
    const response = await this.makeRequest<any>("/library/sections");
    return response.MediaContainer?.Directory || [];
  }

  // Get library content
  async getLibraryContent(libraryKey: string, start: number = 0, size: number = 50): Promise<PlexMediaItem[]> {
    const response = await this.makeRequest<any>(`/library/sections/${libraryKey}/all`, {
      "X-Plex-Container-Start": start.toString(),
      "X-Plex-Container-Size": size.toString(),
    });
    return response.MediaContainer?.Metadata || [];
  }

  // Search Plex library
  async search(query: string): Promise<PlexMediaItem[]> {
    const response = await this.makeRequest<any>("/search", { query });
    return response.MediaContainer?.Metadata || [];
  }

  // Get recently added items
  async getRecentlyAdded(libraryKey?: string): Promise<PlexMediaItem[]> {
    const endpoint = libraryKey 
      ? `/library/sections/${libraryKey}/recentlyAdded`
      : "/library/recentlyAdded";
    
    const response = await this.makeRequest<any>(endpoint);
    return response.MediaContainer?.Metadata || [];
  }

  // Get item details
  async getItemDetails(ratingKey: string): Promise<PlexMediaItem> {
    const response = await this.makeRequest<any>(`/library/metadata/${ratingKey}`);
    return response.MediaContainer?.Metadata?.[0];
  }

  // Get image URL
  getImageUrl(path: string): string {
    if (!path || !this.baseUrl) return "";
    return `${this.baseUrl}${path}?X-Plex-Token=${this.token}`;
  }

  // Mock data for development
  getMockLibraries(): PlexLibrary[] {
    return [
      {
        key: "1",
        title: "Movies",
        type: "movie",
        agent: "com.plexapp.agents.themoviedb",
        scanner: "Plex Movie Scanner",
        language: "en",
        uuid: "mock-uuid-1",
      },
      {
        key: "2",
        title: "TV Shows",
        type: "show",
        agent: "com.plexapp.agents.thetvdb",
        scanner: "Plex Series Scanner",
        language: "en",
        uuid: "mock-uuid-2",
      },
    ];
  }

  getMockRecentlyAdded(): PlexMediaItem[] {
    return [
      {
        ratingKey: "1",
        key: "/library/metadata/1",
        guid: "plex://movie/5d776846880197001ec967c8",
        title: "The Matrix",
        summary: "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        thumb: "/library/metadata/1/thumb/1234567890",
        art: "/library/metadata/1/art/1234567890",
        year: 1999,
        addedAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000,
      },
      {
        ratingKey: "2",
        key: "/library/metadata/2",
        guid: "plex://show/5d9c086fe98e47001eb84c6d",
        title: "The Office",
        summary: "A mockumentary on a group of typical office workers.",
        thumb: "/library/metadata/2/thumb/1234567890",
        art: "/library/metadata/2/art/1234567890",
        year: 2005,
        addedAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 172800000,
      },
    ];
  }
}

// Create and export a singleton instance
const plexService = new PlexService();
export default plexService;