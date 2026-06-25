const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFoldableSupport(config) {
  return withAndroidManifest(config, async config => {
    const androidManifest = config.modResults.manifest;
    const application = androidManifest.application[0];
    
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Add support for size changes (Foldables & Cover Screens)
    const existingIndex = application['meta-data'].findIndex(
      (item) => item.$['android:name'] === 'android.supports_size_changes'
    );

    if (existingIndex === -1) {
      application['meta-data'].push({
        $: {
          'android:name': 'android.supports_size_changes',
          'android:value': 'true',
        },
      });
    }

    return config;
  });
};
