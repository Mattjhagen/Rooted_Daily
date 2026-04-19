const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to make an app Google TV compatible.
 */
const withAndroidTV = (config) => {
  // 1. Modify AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const mainActivity = androidManifest.application[0].activity.find(
      (a) => a['intent-filter'] && a['intent-filter'].some(
        (filter) => filter.action.some((action) => action.$['android:name'] === 'android.intent.action.MAIN')
      )
    );

    // Add features
    if (!androidManifest['uses-feature']) {
      androidManifest['uses-feature'] = [];
    }
    
    const features = [
      { $: { 'android:name': 'android.software.leanback', 'android:required': 'false' } },
      { $: { 'android:name': 'android.hardware.touchscreen', 'android:required': 'false' } }
    ];

    features.forEach(feature => {
      if (!androidManifest['uses-feature'].some(f => f.$['android:name'] === feature.$['android:name'])) {
        androidManifest['uses-feature'].push(feature);
      }
    });

    // Add Banner to application
    androidManifest.application[0].$['android:banner'] = '@drawable/tv_banner';

    // Ensure orientation is not locked to portrait in the manifest
    if (mainActivity && mainActivity.$['android:screenOrientation']) {
      delete mainActivity.$['android:screenOrientation'];
    }

    return config;
  });

  return config;
};

module.exports = withAndroidTV;
