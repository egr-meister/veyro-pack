# Veyro Pack ProGuard / R8 rules.
# Standard Android R8 / Proguard only. No risky third-party obfuscation tools.
#
# Expo / React Native ship sensible defaults; the rules below are conservative
# keeps that avoid stripping classes the runtime looks up reflectively.

# --- React Native core ---
-keep,allowobfuscation class com.facebook.react.** { *; }
-keep,allowobfuscation class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# --- Hermes ---
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Expo modules ---
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# --- AsyncStorage (the only data dependency) ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# Keep annotations and generic signatures used for reflection.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep native methods.
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enum helper methods.
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
