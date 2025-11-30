import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PlexSettings {
  serverUrl: string;
  token: string;
  isConnected: boolean;
  selectedServerId?: string;
  autoSync: boolean;
  syncLibraries: string[];
}

interface IPTVSettings {
  serverUrl: string;
  username: string;
  password: string;
  isConnected: boolean;
  favoriteChannels: string[];
  lastError?: string | null;
}

interface DownloadSettings {
  nzbget: {
    serverUrl: string;
    username: string;
    password: string;
    apiKey: string; // legacy, unused
    isConnected: boolean;
  };
  radarr: {
    serverUrl: string;
    apiKey: string;
    isConnected: boolean;
    qualityProfile: string; // display name (legacy)
    qualityProfileId: number; // selected profile id
    rootFolder: string; // display name/path (legacy)
    rootFolderPath: string; // selected root folder path
  };
  sonarr: {
    serverUrl: string;
    apiKey: string;
    isConnected: boolean;
    qualityProfile: string; // display name (legacy)
    qualityProfileId: number; // selected profile id
    rootFolder: string; // display name/path (legacy)
    rootFolderPath: string; // selected root folder path
  };
}

interface AppSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  autoPlay: boolean;
  videoQuality: "auto" | "720p" | "1080p" | "4k";
  tmdbApiKey: string;
}

interface SettingsState {
  // Settings
  plex: PlexSettings;
  iptv: IPTVSettings;
  downloads: DownloadSettings;
  app: AppSettings;
  
  // Actions
  updatePlexSettings: (settings: Partial<PlexSettings>) => void;
  updateIPTVSettings: (settings: Partial<IPTVSettings>) => void;
  updateDownloadSettings: (settings: Partial<DownloadSettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  
  // Connection testing
  testPlexConnection: () => Promise<boolean>;
  testIPTVConnection: () => Promise<boolean>;
  testNZBGetConnection: () => Promise<boolean>;
  testRadarrConnection: () => Promise<boolean>;
  testSonarrConnection: () => Promise<boolean>;
  
  // Reset functions
  resetPlexSettings: () => void;
  resetIPTVSettings: () => void;
  resetDownloadSettings: () => void;
  resetAllSettings: () => void;
}

const defaultPlexSettings: PlexSettings = {
  serverUrl: "",
  token: "",
  isConnected: false,
  autoSync: true,
  syncLibraries: [],
};

const defaultIPTVSettings: IPTVSettings = {
  serverUrl: "",
  username: "",
  password: "",
  isConnected: false,
  favoriteChannels: [],
  lastError: null,
};

const defaultDownloadSettings: DownloadSettings = {
  nzbget: {
    serverUrl: "",
    username: "",
    password: "",
    apiKey: "",
    isConnected: false,
  },
  radarr: {
    serverUrl: "",
    apiKey: "",
    isConnected: false,
    qualityProfile: "",
    qualityProfileId: 0,
    rootFolder: "",
    rootFolderPath: "",
  },
  sonarr: {
    serverUrl: "",
    apiKey: "",
    isConnected: false,
    qualityProfile: "",
    qualityProfileId: 0,
    rootFolder: "",
    rootFolderPath: "",
  },
};

const defaultAppSettings: AppSettings = {
  theme: "dark",
  notifications: true,
  autoPlay: false,
  videoQuality: "auto",
  tmdbApiKey: "",
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      plex: defaultPlexSettings,
      iptv: defaultIPTVSettings,
      downloads: defaultDownloadSettings,
      app: defaultAppSettings,
      
      // Actions
      updatePlexSettings: (settings) => {
        const { plex } = get();
        set({ plex: { ...plex, ...settings } });
      },
      
      updateIPTVSettings: (settings) => {
        const { iptv } = get();
        set({ iptv: { ...iptv, ...settings } });
      },
      
      updateDownloadSettings: (settings) => {
        const { downloads } = get();
        set({ downloads: { ...downloads, ...settings } });
      },
      
      updateAppSettings: (settings) => {
        const { app } = get();
        set({ app: { ...app, ...settings } });
      },
      
      // Connection testing (mock implementations for now)
      testPlexConnection: async () => {
        const { plex } = get();
        if (!plex.serverUrl || !plex.token) return false;

        try {
          const plexService = (await import("../api/plex")).default;
          plexService.setCredentials(plex.serverUrl, plex.token);

          // Try to fetch libraries to verify the connection
          const libraries = await plexService.getLibraries();
          const isConnected = libraries && libraries.length > 0;

          set({
            plex: { ...plex, isConnected }
          });

          return isConnected;
        } catch (error) {
          set({
            plex: { ...plex, isConnected: false }
          });
          return false;
        }
      },
      
      testIPTVConnection: async () => {
        const { iptv } = get();
        if (!iptv.serverUrl || !iptv.username || !iptv.password) return false;
        
        try {
          const iptvService = (await import("../api/iptv")).default;
          iptvService.setCredentials(iptv.serverUrl, iptv.username, iptv.password);
          const info = await iptvService.getUserInfo();
          const isConnected = (info as any)?.auth === 1 || String((info as any)?.status || "").toLowerCase() === "active";
          set({ iptv: { ...iptv, isConnected, lastError: null } });
          return isConnected;
        } catch (error: any) {
          const msg = typeof error?.message === "string" ? error.message : "Connection failed";
          let host = iptv.serverUrl;
          try {
            const u = new URL(host.startsWith("http") ? host : `http://${host}`);
            host = u.host;
          } catch {}
          set({ iptv: { ...iptv, isConnected: false, lastError: `${msg} (server: ${host})` } });
          return false;
        }
      },
      
      testNZBGetConnection: async () => {
        const { downloads } = get();
        const creds = downloads.nzbget;
        if (!creds.serverUrl || !creds.username || !creds.password) return false;
        try {
          const svc = (await import("../api/nzbget")).default;
          svc.setCredentials(creds.serverUrl, creds.username, creds.password);
          await svc.getVersion();
          set({
            downloads: {
              ...downloads,
              nzbget: { ...downloads.nzbget, isConnected: true },
            },
          });
          return true;
        } catch (error) {
          set({
            downloads: {
              ...downloads,
              nzbget: { ...downloads.nzbget, isConnected: false },
            },
          });
          return false;
        }
      },
      
      testRadarrConnection: async () => {
        const { downloads } = get();
        const creds = downloads.radarr;
        if (!creds.serverUrl || !creds.apiKey) return false;
        try {
          const svc = (await import("../api/radarr")).default;
          svc.setCredentials(creds.serverUrl, creds.apiKey);
          const ok = await svc.testConnection();
          set({
            downloads: {
              ...downloads,
              radarr: { ...downloads.radarr, isConnected: ok },
            },
          });
          return ok;
        } catch (error) {
          set({
            downloads: {
              ...downloads,
              radarr: { ...downloads.radarr, isConnected: false },
            },
          });
          return false;
        }
      },
      
      testSonarrConnection: async () => {
        const { downloads } = get();
        const creds = downloads.sonarr;
        if (!creds.serverUrl || !creds.apiKey) return false;
        try {
          const svc = (await import("../api/sonarr")).default;
          svc.setCredentials(creds.serverUrl, creds.apiKey);
          const ok = await svc.testConnection();
          set({
            downloads: {
              ...downloads,
              sonarr: { ...downloads.sonarr, isConnected: ok },
            },
          });
          return ok;
        } catch (error) {
          set({
            downloads: {
              ...downloads,
              sonarr: { ...downloads.sonarr, isConnected: false },
            },
          });
          return false;
        }
      },
      
      // Reset functions
      resetPlexSettings: () => set({ plex: defaultPlexSettings }),
      resetIPTVSettings: () => set({ iptv: defaultIPTVSettings }),
      resetDownloadSettings: () => set({ downloads: defaultDownloadSettings }),
      resetAllSettings: () => set({ 
        plex: defaultPlexSettings,
        iptv: defaultIPTVSettings,
        downloads: defaultDownloadSettings,
        app: defaultAppSettings,
      }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSettingsStore;