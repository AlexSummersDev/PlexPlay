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
}

interface DownloadSettings {
  nzbget: {
    serverUrl: string;
    apiKey: string;
    isConnected: boolean;
  };
  radarr: {
    serverUrl: string;
    apiKey: string;
    isConnected: boolean;
    qualityProfile: string;
    rootFolder: string;
  };
  sonarr: {
    serverUrl: string;
    apiKey: string;
    isConnected: boolean;
    qualityProfile: string;
    rootFolder: string;
  };
}

interface AppSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  autoPlay: boolean;
  videoQuality: "auto" | "720p" | "1080p" | "4k";
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
};

const defaultDownloadSettings: DownloadSettings = {
  nzbget: {
    serverUrl: "",
    apiKey: "",
    isConnected: false,
  },
  radarr: {
    serverUrl: "",
    apiKey: "",
    isConnected: false,
    qualityProfile: "",
    rootFolder: "",
  },
  sonarr: {
    serverUrl: "",
    apiKey: "",
    isConnected: false,
    qualityProfile: "",
    rootFolder: "",
  },
};

const defaultAppSettings: AppSettings = {
  theme: "dark",
  notifications: true,
  autoPlay: false,
  videoQuality: "auto",
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
          // Mock connection test - in real implementation, this would make an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const isConnected = Math.random() > 0.3; // 70% success rate for demo
          
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          const isConnected = Math.random() > 0.3;
          
          set({ 
            iptv: { ...iptv, isConnected } 
          });
          
          return isConnected;
        } catch (error) {
          set({ 
            iptv: { ...iptv, isConnected: false } 
          });
          return false;
        }
      },
      
      testNZBGetConnection: async () => {
        const { downloads } = get();
        if (!downloads.nzbget.serverUrl || !downloads.nzbget.apiKey) return false;
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const isConnected = Math.random() > 0.3;
          
          set({ 
            downloads: { 
              ...downloads, 
              nzbget: { ...downloads.nzbget, isConnected } 
            } 
          });
          
          return isConnected;
        } catch (error) {
          set({ 
            downloads: { 
              ...downloads, 
              nzbget: { ...downloads.nzbget, isConnected: false } 
            } 
          });
          return false;
        }
      },
      
      testRadarrConnection: async () => {
        const { downloads } = get();
        if (!downloads.radarr.serverUrl || !downloads.radarr.apiKey) return false;
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const isConnected = Math.random() > 0.3;
          
          set({ 
            downloads: { 
              ...downloads, 
              radarr: { ...downloads.radarr, isConnected } 
            } 
          });
          
          return isConnected;
        } catch (error) {
          set({ 
            downloads: { 
              ...downloads, 
              radarr: { ...downloads.radarr, isConnected: false } 
            } 
          });
          return false;
        }
      },
      
      testSonarrConnection: async () => {
        const { downloads } = get();
        if (!downloads.sonarr.serverUrl || !downloads.sonarr.apiKey) return false;
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const isConnected = Math.random() > 0.3;
          
          set({ 
            downloads: { 
              ...downloads, 
              sonarr: { ...downloads.sonarr, isConnected } 
            } 
          });
          
          return isConnected;
        } catch (error) {
          set({ 
            downloads: { 
              ...downloads, 
              sonarr: { ...downloads.sonarr, isConnected: false } 
            } 
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