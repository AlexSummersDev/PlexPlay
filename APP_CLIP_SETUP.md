# iOS App Clip Setup Guide

This guide explains how to set up and test iOS App Clips for your Expo React Native app.

## Overview

Your app now includes complete App Clip support with:
- ✅ App Clip configuration in `app.json`
- ✅ App Clip detection and routing
- ✅ Streamlined App Clip UI
- ✅ Deep linking and URL parameter handling
- ✅ App Clip to full app transition
- ✅ Multiple invocation methods (App Clip Codes, NFC, QR, etc.)

## Configuration Files

### 1. `app.json` - App Clip Configuration
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.vibecode.app",
      "appClip": {
        "bundleIdentifier": "com.vibecode.app.Clip",
        "name": "Vibecode Clip",
        "requestsLocationConfirmation": true,
        "parentApplicationIdentifiers": ["com.vibecode.app"],
        "associatedDomains": ["appclips:vibecode.app"],
        "entitlements": {
          "com.apple.developer.on-demand-install-capable": true,
          "com.apple.developer.parent-application-identifiers": ["com.vibecode.app"],
          "com.apple.developer.associated-domains": ["appclips:vibecode.app"]
        }
      }
    }
  }
}
```

### 2. App Clip Components
- `src/components/AppClipEntry.tsx` - Main App Clip UI
- `src/hooks/useAppClip.ts` - App Clip functionality hook
- `src/utils/appClipUtils.ts` - App Clip utilities
- `src/config/appClipConfig.ts` - App Clip configuration

## Building with EAS Build

App Clips require EAS Build (not Expo Go). Create an `eas.json` file:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

Build commands:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile development
```

## App Store Connect Setup

1. **Create App Clip Experience**:
   - Go to App Store Connect
   - Select your app
   - Go to "App Clips" section
   - Create new App Clip experience
   - Set URL: `https://vibecode.app/clip?action=quickAction`
   - Configure metadata and images

2. **Configure Associated Domains**:
   - Add `appclips:vibecode.app` to your app's associated domains
   - Verify domain ownership with Apple

## Testing App Clips

### Local Testing (Simulator)
```bash
# Test App Clip URL in simulator
xcrun simctl openurl booted "https://vibecode.app/clip?action=quickAction"
```

### Device Testing
1. **TestFlight**: Upload build to TestFlight and test on device
2. **Local Testing**: Use Xcode to install and test locally
3. **App Clip Code**: Generate and test App Clip Codes

### Testing URLs
- Quick Action: `https://vibecode.app/clip?action=quickAction`
- With Location: `https://vibecode.app/clip?action=quickAction&location=store1`
- With Context: `https://vibecode.app/clip?action=quickAction&context=promotion`

## App Clip Invocation Methods

### 1. App Clip Codes
- Visual codes that users can scan
- Support NFC tapping
- Generated through App Store Connect

### 2. QR Codes
- Standard QR codes pointing to App Clip URLs
- Can be generated and printed

### 3. NFC Tags
- Physical NFC tags programmed with App Clip URLs
- Instant launch by tapping

### 4. Smart App Banners
- Web banners that launch App Clips
- Add to your website

### 5. Messages & Links
- Share App Clip links in Messages
- Links in other apps

## Size Constraints

App Clips must be under 10MB:
- Optimize images and assets
- Remove unnecessary dependencies
- Use dynamic imports for non-essential features

## Best Practices

### 1. Streamlined Experience
- Focus on one primary task
- Minimize user input
- Use Apple Pay for payments
- Use Sign in with Apple for authentication

### 2. Quick Launch
- App Clips should launch in under 2 seconds
- Minimize initial loading
- Cache essential data

### 3. Transition to Full App
- Offer full app download at appropriate times
- Preserve user context and data
- Seamless handoff experience

## Troubleshooting

### App Clip Won't Load
1. Check bundle identifier format (`com.yourapp.app.Clip`)
2. Verify associated domains configuration
3. Ensure URL scheme is properly configured
4. Check App Store Connect App Clip experience setup

### Size Issues
1. Run `eas build --platform ios --profile production --clear-cache`
2. Optimize assets and remove unused dependencies
3. Use dynamic imports for optional features

### URL Handling Issues
1. Verify URL format matches App Clip experience
2. Check associated domains in both app.json and App Store Connect
3. Test URL parsing with different parameters

## Production Deployment

1. **Build Production Version**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

3. **Configure App Clip Experiences**:
   - Set up all App Clip experiences in App Store Connect
   - Configure metadata, images, and URLs
   - Test all invocation methods

4. **Monitor Performance**:
   - Track App Clip usage analytics
   - Monitor conversion to full app
   - Optimize based on user behavior

## Support

For issues with App Clip setup:
1. Check Expo documentation for App Clips
2. Review Apple's App Clip documentation
3. Test with different invocation methods
4. Verify all configuration files are correct

Your App Clip is now ready for testing and deployment!