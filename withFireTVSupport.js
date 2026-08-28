const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFireTVSupport(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // 1. Add uses-feature for leanback (TV) and touchscreen false
    if (!androidManifest['uses-feature']) {
      androidManifest['uses-feature'] = [];
    }

    // Touchscreen is not required on TV
    const hasTouchscreen = androidManifest['uses-feature'].find(
      (item) => item.$['android:name'] === 'android.hardware.touchscreen'
    );
    if (!hasTouchscreen) {
      androidManifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.touchscreen',
          'android:required': 'false',
        },
      });
    }

    // Leanback (TV UI)
    const hasLeanback = androidManifest['uses-feature'].find(
      (item) => item.$['android:name'] === 'android.software.leanback'
    );
    if (!hasLeanback) {
      androidManifest['uses-feature'].push({
        $: {
          'android:name': 'android.software.leanback',
          'android:required': 'false', // false so it can still install on mobile
        },
      });
    }

    // 2. Add LEANBACK_LAUNCHER intent to main activity
    const application = androidManifest.application[0];
    const mainActivity = application.activity?.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      const intentFilters = mainActivity['intent-filter'];
      if (intentFilters) {
        // Find if LEANBACK_LAUNCHER is already present
        let hasLeanbackLauncher = false;
        for (const filter of intentFilters) {
          if (filter.category) {
            hasLeanbackLauncher = filter.category.some(
              (cat) => cat.$['android:name'] === 'android.intent.category.LEANBACK_LAUNCHER'
            );
            if (hasLeanbackLauncher) break;
          }
        }

        // Add the intent filter so Fire TV lists the app on the home screen
        if (!hasLeanbackLauncher) {
          intentFilters.push({
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [{ $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } }],
          });
        }
      }
    }

    // 3. Set the TV banner image on the application
    // Using the default icon as a placeholder. You can replace this with a proper 320x180 TV banner later.
    application.$['android:banner'] = '@mipmap/ic_launcher';

    return config;
  });
};
