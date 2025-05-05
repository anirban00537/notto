# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native ProGuard Rules
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep your custom components
-keep class com.notto.app.** { *; }

# Hermes
-keep class com.facebook.hermes.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# ReactNative Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Keep Javascript engine
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }

# Keep ReactNative Modules
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# Keep native libraries
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
}

# Keep source file names and line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# Expo
-keep class expo.modules.** { *; }

# Add any project specific keep options here:
