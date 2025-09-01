import { useState, useEffect } from "react";
import * as Linking from "expo-linking";
import { isAppClip, getAppClipURL, parseAppClipParams, getAppClipExperience } from "../utils/appClipUtils";
import { getAppClipExperienceByAction, APP_CLIP_CONFIG, type AppClipExperience } from "../config/appClipConfig";

export interface UseAppClipReturn {
  isClip: boolean;
  isLoading: boolean;
  clipURL: string | null;
  clipParams: Record<string, string>;
  experience: AppClipExperience | undefined;
  openFullApp: () => Promise<void>;
  handleDeepLink: (url: string) => void;
}

/**
 * Hook for managing App Clip functionality
 */
export const useAppClip = (): UseAppClipReturn => {
  const [isClip, setIsClip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clipURL, setClipURL] = useState<string | null>(null);
  const [clipParams, setClipParams] = useState<Record<string, string>>({});
  const [experience, setExperience] = useState<AppClipExperience | undefined>();

  useEffect(() => {
    const initializeAppClip = async () => {
      try {
        // Check if running as App Clip
        const clipStatus = isAppClip();
        setIsClip(clipStatus);

        if (clipStatus) {
          // Get initial URL and parameters
          const url = await getAppClipURL();
          setClipURL(url);

          if (url) {
            const params = parseAppClipParams(url);
            setClipParams(params);

            // Get experience configuration
            const clipExperience = getAppClipExperience(url);
            if (clipExperience.action) {
              const exp = getAppClipExperienceByAction(clipExperience.action);
              setExperience(exp);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing App Clip:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAppClip();

    // Listen for URL changes (deep links)
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const params = parseAppClipParams(url);
      setClipParams(params);
      setClipURL(url);

      // Update experience based on new URL
      const clipExperience = getAppClipExperience(url);
      if (clipExperience.action) {
        const exp = getAppClipExperienceByAction(clipExperience.action);
        setExperience(exp);
      }
    } catch (error) {
      console.error("Error handling deep link:", error);
    }
  };

  const openFullApp = async (): Promise<void> => {
    try {
      // Try to open the full app using the main app scheme
      const mainAppScheme = `${APP_CLIP_CONFIG.URL_SCHEMES[0]}://`;
      const canOpenMainApp = await Linking.canOpenURL(mainAppScheme);

      if (canOpenMainApp) {
        // Pass current context to full app
        const contextParams = new URLSearchParams(clipParams);
        await Linking.openURL(`${mainAppScheme}?${contextParams.toString()}`);
      } else {
        // Open App Store if full app is not installed
        await Linking.openURL(APP_CLIP_CONFIG.APP_STORE_URL);
      }
    } catch (error) {
      console.error("Error opening full app:", error);
      throw error;
    }
  };

  return {
    isClip,
    isLoading,
    clipURL,
    clipParams,
    experience,
    openFullApp,
    handleDeepLink,
  };
};