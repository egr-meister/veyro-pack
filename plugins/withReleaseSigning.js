// Expo config plugin: add a release signing config to the generated
// android/app/build.gradle during `expo prebuild`.
//
// The keystore path and passwords are NEVER committed. They are passed at
// build time as Gradle project properties (see .github/workflows/android-build.yml):
//   -PVEYRO_UPLOAD_STORE_FILE
//   -PVEYRO_UPLOAD_STORE_PASSWORD
//   -PVEYRO_UPLOAD_KEY_ALIAS
//   -PVEYRO_UPLOAD_KEY_PASSWORD
//
// When those properties are absent (e.g. a local debug build) the app falls
// back to the standard debug signing config, so prebuild + run still works.

const { withAppBuildGradle } = require('@expo/config-plugins');

const MARKER = 'VEYRO_UPLOAD_STORE_FILE';

const RELEASE_SIGNING_BLOCK = `
        release {
            if (project.hasProperty('${MARKER}')) {
                storeFile file(${MARKER})
                storePassword VEYRO_UPLOAD_STORE_PASSWORD
                keyAlias VEYRO_UPLOAD_KEY_ALIAS
                keyPassword VEYRO_UPLOAD_KEY_PASSWORD
                storeType "PKCS12"
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      return cfg;
    }

    let gradle = cfg.modResults.contents;

    // Idempotent: skip if we already injected our block.
    if (gradle.includes(MARKER)) {
      return cfg;
    }

    // 1) Add a `release` entry inside the existing `signingConfigs { ... }`.
    gradle = gradle.replace(
      /signingConfigs\s*\{/,
      (match) => `${match}${RELEASE_SIGNING_BLOCK}`
    );

    // 2) Point the release build type at the release signing config when the
    //    keystore property is supplied; otherwise keep the debug fallback.
    //    We only touch the first `signingConfig signingConfigs.debug` that
    //    appears inside the `release { ... }` build type.
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1signingConfig project.hasProperty('${MARKER}') ? signingConfigs.release : signingConfigs.debug`
    );

    cfg.modResults.contents = gradle;
    return cfg;
  });
};
