import * as Application from "expo-application";
import * as Linking from "expo-linking";

/**
 * Detects if the app is running as an App Clip
 * App Clips have specific bundle identifier patterns and limited capabilities
 */
export const isAppClip = (): boolean => {
  try {
    // Check if running in App Clip context
    // App Clips have bundle identifiers ending with ".Clip"
    const bundleId = Application.applicationId;
    return bundleId?.endsWith(".Clip") || false;
  } catch (error) {
    console.error("Error detecting App Clip:", error);
    return false;
  }
};

/**
 * Gets the App Clip invocation URL and parameters
 */
export const getAppClipURL = async (): Promise<string | null> => {
  try {
    return await Linking.getInitialURL();
  } catch (error) {
    console.error("Error getting App Clip URL:", error);
    return null;
  }
};

/**
 * Parses App Clip URL parameters
 */
export const parseAppClipParams = (url: string | null): Record<string, string> => {
  if (!url) return {};
  
  try {
    const parsed = Linking.parse(url);
    const params: Record<string, string> = {};
    
    if (parsed.queryParams) {
      Object.entries(parsed.queryParams).forEach(([key, value]) => {
        if (typeof value === "string") {
          params[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          params[key] = value[0];
        }
      });
    }
    
    return params;
  } catch (error) {
    console.error("Error parsing App Clip URL:", error);
    return {};
  }
};

/**
 * Opens the full app or App Store
 */
export const openFullApp = async (fallbackAppStoreURL?: string): Promise<void> => {
  try {
    // Try to open the full app using the main app scheme
    const mainAppScheme = "vibecode://";
    const canOpenMainApp = await Linking.canOpenURL(mainAppScheme);
    
    if (canOpenMainApp) {
      await Linking.openURL(mainAppScheme);
    } else if (fallbackAppStoreURL) {
      await Linking.openURL(fallbackAppStoreURL);
    } else {
      // Default App Store URL (replace with actual App Store URL)
      await Linking.openURL("https://apps.apple.com/app/vibecode/id123456789");
    }
  } catch (error) {
    console.error("Error opening full app:", error);
    throw error;
  }
};

/**
 * Validates App Clip size constraints
 * App Clips must be under 10MB
 */
export const validateAppClipSize = (): boolean => {
  // This is a placeholder - actual size validation would need native implementation
  // For now, we assume the app meets size requirements
  return true;
};

/**
 * Gets App Clip experience metadata
 */
export const getAppClipExperience = (url: string | null): {
  action?: string;
  location?: string;
  context?: string;
} => {
  const params = parseAppClipParams(url);
  
  return {
    action: params.action,
    location: params.location,
    context: params.context,
  };
};