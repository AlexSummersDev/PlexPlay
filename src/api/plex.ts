// Plex API Service
// Note: Plex API is unofficial and requires authentication

import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface PlexServer {
  name: string;
  host: string;
  port: number;
  machineIdentifier: string;
  version: string;
  address: string;
  publicAddress?: string;
  localAddresses?: string[];
  owned: boolean;
  accessToken: string;
}

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

interface PlexAuthPinResponse {
  id: number;
  code: string;
  authToken?: string;
}

class PlexService {
  private baseUrl: string = "";
  private token: string = "";
  private readonly CLIENT_IDENTIFIER = "vibecode-plex-app";
  private readonly PRODUCT_NAME = "Vibecode Plex Client";
  private readonly PLEX_TV_URL = "https://plex.tv";

  setCredentials(serverUrl: string, token: string) {
    this.baseUrl = serverUrl.replace(/\/$/, ""); // Remove trailing slash
    this.token = token;
  }

  // Plex OAuth Authentication Flow
  async authenticate(): Promise<{ authToken: string; servers: PlexServer[] } | null> {
    try {
      // Step 1: Request a PIN from Plex
      const pinResponse = await fetch(`${this.PLEX_TV_URL}/api/v2/pins`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Product': this.PRODUCT_NAME,
          'X-Plex-Client-Identifier': this.CLIENT_IDENTIFIER,
        },
        body: JSON.stringify({ strong: true }),
      });

      if (!pinResponse.ok) {
        throw new Error('Failed to request Plex PIN');
      }

      const pinData: PlexAuthPinResponse = await pinResponse.json();
      const { id, code } = pinData;

      // Step 2: Open browser for user to authenticate
      const authUrl = `https://app.plex.tv/auth#?clientID=${this.CLIENT_IDENTIFIER}&code=${code}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(this.PRODUCT_NAME)}`;

      // Open the browser (don't wait for it to close, start polling immediately)
      WebBrowser.openAuthSessionAsync(authUrl, 'exp://');

      // Step 3: Poll for auth token (start immediately, don't wait for browser to close)
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts = 30 seconds

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const checkResponse = await fetch(`${this.PLEX_TV_URL}/api/v2/pins/${id}`, {
          headers: {
            'Accept': 'application/json',
            'X-Plex-Client-Identifier': this.CLIENT_IDENTIFIER,
          },
        });

        if (checkResponse.ok) {
          const checkData: PlexAuthPinResponse = await checkResponse.json();

          if (checkData.authToken) {
            // Step 4: Get user's servers
            const servers = await this.getServers(checkData.authToken);

            return {
              authToken: checkData.authToken,
              servers,
            };
          }
        }

        attempts++;
      }

      // Return null instead of throwing error to allow graceful handling
      return null;
    } catch (error: any) {
      // Only log errors that aren't user cancellations
      if (!error.message?.includes('cancel') && !error.message?.includes('dismiss')) {
        console.error('Plex authentication error:', error);
      }
      return null;
    }
  }

  // Get user's Plex servers
  async getServers(authToken: string): Promise<PlexServer[]> {
    try {
      const response = await fetch(`${this.PLEX_TV_URL}/api/v2/resources?includeHttps=1&includeRelay=1`, {
        headers: {
          'Accept': 'application/json',
          'X-Plex-Token': authToken,
          'X-Plex-Client-Identifier': this.CLIENT_IDENTIFIER,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch servers');
      }

      const servers: PlexServer[] = await response.json();

      // Filter for owned servers that are online
      return servers.filter(server =>
        server.owned &&
        server.name &&
        (server.address || server.publicAddress || (server.localAddresses && server.localAddresses.length > 0))
      );
    } catch (error) {
      console.error('Error fetching servers:', error);
      return [];
    }
  }

  // Get best connection URL for a server
  getBestServerUrl(server: PlexServer): string {
    const port = server.port || 32400; // Default to 32400 if port is undefined

    // Prefer local address if available
    if (server.localAddresses && server.localAddresses.length > 0) {
      return `http://${server.localAddresses[0]}:${port}`;
    }

    // Then public address
    if (server.publicAddress) {
      return `https://${server.publicAddress}:${port}`;
    }

    // Fallback to address
    if (server.address) {
      return server.address.includes('://') ? server.address : `http://${server.address}:${port}`;
    }

    // Last resort - use host
    return `http://${server.host}:${port}`;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}, timeoutMs: number = 5000): Promise<T> {
    if (!this.baseUrl || !this.token) {
      throw new Error("Plex credentials not configured");
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append("X-Plex-Token", this.token);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
          "X-Plex-Client-Identifier": "PlexMediaApp",
          "X-Plex-Product": "Plex Media App",
          "X-Plex-Version": "1.0.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Plex API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      // Silently fail for timeout/network errors to avoid console spam
      if (error.name === 'AbortError' || error.message?.includes('Network request failed') || error.message?.includes('timeout')) {
        throw new Error('Plex connection timeout');
      }
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

  // Check if a movie or TV show is in the Plex library
  async findMediaByTitle(title: string, year?: number, type?: 'movie' | 'tv'): Promise<PlexMediaItem | null> {
    try {
      // First try searching
      const searchResults = await this.search(title);

      // Filter by type if specified
      let filteredResults = searchResults;
      if (type) {
        const plexType = type === 'movie' ? 'movie' : 'show';
        filteredResults = searchResults.filter(item => {
          // Extract type from GUID
          const guidLower = item.guid.toLowerCase();
          return guidLower.includes(plexType);
        });
      }

      // Try to find exact match by title and year
      for (const item of filteredResults) {
        const titleMatch = item.title.toLowerCase() === title.toLowerCase();
        const yearMatch = !year || item.year === year;

        if (titleMatch && yearMatch) {
          return item;
        }
      }

      // If no exact match, try partial title match with year
      if (year) {
        for (const item of filteredResults) {
          const titleSimilar = item.title.toLowerCase().includes(title.toLowerCase()) ||
                               title.toLowerCase().includes(item.title.toLowerCase());
          const yearMatch = item.year === year;

          if (titleSimilar && yearMatch) {
            return item;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error searching Plex library:", error);
      return null;
    }
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