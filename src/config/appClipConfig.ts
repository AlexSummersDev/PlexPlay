/**
 * App Clip Configuration
 * Defines App Clip experiences, invocation methods, and metadata
 */

export interface AppClipExperience {
  id: string;
  title: string;
  subtitle: string;
  action: string;
  url: string;
  invocationMethods: AppClipInvocationMethod[];
  metadata: {
    category?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      radius?: number;
    };
    businessName?: string;
    heroImageURL?: string;
  };
}

export interface AppClipInvocationMethod {
  type: "appClipCode" | "nfc" | "qr" | "smartAppBanner" | "messages" | "maps";
  url: string;
  enabled: boolean;
  configuration?: {
    // App Clip Code specific
    foregroundColor?: string;
    backgroundColor?: string;
    
    // NFC specific
    nfcTagId?: string;
    
    // QR Code specific
    qrCodeData?: string;
    
    // Smart App Banner specific
    appId?: string;
    
    // Maps specific
    placeId?: string;
  };
}

/**
 * Default App Clip experiences configuration
 */
export const APP_CLIP_EXPERIENCES: AppClipExperience[] = [
  {
    id: "quick-action",
    title: "Vibecode Quick Action",
    subtitle: "Get started instantly",
    action: "quickAction",
    url: "https://vibecode.app/clip?action=quickAction",
    invocationMethods: [
      {
        type: "appClipCode",
        url: "https://vibecode.app/clip?action=quickAction",
        enabled: true,
        configuration: {
          foregroundColor: "#3B82F6",
          backgroundColor: "#FFFFFF"
        }
      },
      {
        type: "qr",
        url: "https://vibecode.app/clip?action=quickAction",
        enabled: true,
        configuration: {
          qrCodeData: "https://vibecode.app/clip?action=quickAction"
        }
      },
      {
        type: "nfc",
        url: "https://vibecode.app/clip?action=quickAction",
        enabled: true,
        configuration: {
          nfcTagId: "vibecode-quick-action"
        }
      },
      {
        type: "smartAppBanner",
        url: "https://vibecode.app/clip?action=quickAction",
        enabled: true,
        configuration: {
          appId: "123456789" // Replace with actual App Store ID
        }
      }
    ],
    metadata: {
      category: "productivity",
      businessName: "Vibecode",
      heroImageURL: "https://vibecode.app/images/app-clip-hero.png"
    }
  }
];

/**
 * App Clip configuration constants
 */
export const APP_CLIP_CONFIG = {
  // Maximum App Clip size (10MB)
  MAX_SIZE_MB: 10,
  
  // App Store URLs
  APP_STORE_URL: "https://apps.apple.com/app/vibecode/id123456789",
  
  // Associated domains
  ASSOCIATED_DOMAINS: ["vibecode.app"],
  
  // URL schemes
  URL_SCHEMES: ["vibecode"],
  
  // Bundle identifiers
  MAIN_APP_BUNDLE_ID: "com.vibecode.app",
  APP_CLIP_BUNDLE_ID: "com.vibecode.app.Clip",
  
  // Notification settings
  NOTIFICATION_TIMEOUT_HOURS: 8,
  
  // Location verification
  LOCATION_VERIFICATION_ENABLED: true,
  LOCATION_VERIFICATION_RADIUS_METERS: 100
};

/**
 * Gets App Clip experience by action
 */
export const getAppClipExperienceByAction = (action: string): AppClipExperience | undefined => {
  return APP_CLIP_EXPERIENCES.find(exp => exp.action === action);
};

/**
 * Gets App Clip experience by URL
 */
export const getAppClipExperienceByURL = (url: string): AppClipExperience | undefined => {
  return APP_CLIP_EXPERIENCES.find(exp => exp.url === url);
};

/**
 * Validates App Clip URL format
 */
export const isValidAppClipURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return APP_CLIP_CONFIG.ASSOCIATED_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

/**
 * Generates App Clip Code URL
 */
export const generateAppClipCodeURL = (experience: AppClipExperience): string => {
  const baseURL = "https://app.clip.apple.com/";
  const params = new URLSearchParams({
    p: experience.url,
    t: experience.title,
    st: experience.subtitle
  });
  
  return `${baseURL}?${params.toString()}`;
};