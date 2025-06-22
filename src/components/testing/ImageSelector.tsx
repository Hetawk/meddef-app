/**
 * Image Selector Component
 *
 * Allows users to select images from demo samples, camera, or gallery
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { DatasetType } from "../../types/meddef";
import { meddefTheme } from "../../config/theme";
import { MedDefCard } from "../common/MedDefUI";

interface ImageSelectorProps {
  dataset: DatasetType;
  onImageSelect: (imageUri: string) => void;
  selectedImage?: string | null;
}

// Real demo images from the assets directory
const DEMO_IMAGES = {
  roct: [
    {
      uri: require("../../../assets/test_images/roct/clean/sample_0_orig.png"),
      label: "ROCT Sample 1 (Clean)",
    },
    {
      uri: require("../../../assets/test_images/roct/clean/sample_1_orig.png"),
      label: "ROCT Sample 2 (Clean)",
    },
    {
      uri: require("../../../assets/test_images/roct/clean/sample_2_orig.png"),
      label: "ROCT Sample 3 (Clean)",
    },
    {
      uri: require("../../../assets/test_images/roct/attacks/sample_0_adv.png"),
      label: "ROCT Sample 1 (Adversarial)",
    },
    {
      uri: require("../../../assets/test_images/roct/attacks/sample_1_adv.png"),
      label: "ROCT Sample 2 (Adversarial)",
    },
    {
      uri: require("../../../assets/test_images/roct/attacks/sample_2_adv.png"),
      label: "ROCT Sample 3 (Adversarial)",
    },
  ],
  chest_xray: [
    {
      uri: require("../../../assets/test_images/chest_xray/clean/sample_0_orig.png"),
      label: "Chest X-Ray Sample 1 (Clean)",
    },
    {
      uri: require("../../../assets/test_images/chest_xray/clean/sample_2_orig.png"),
      label: "Chest X-Ray Sample 2 (Clean)",
    },
    {
      uri: require("../../../assets/test_images/chest_xray/clean/sample_3_orig.png"),
      label: "Chest X-Ray Sample 3 (Clean)",
    },
    {
      uri: require("../../../assets/test_images/chest_xray/attacks/sample_0_adv.png"),
      label: "Chest X-Ray Sample 1 (Adversarial)",
    },
    {
      uri: require("../../../assets/test_images/chest_xray/attacks/sample_2_adv.png"),
      label: "Chest X-Ray Sample 2 (Adversarial)",
    },
    {
      uri: require("../../../assets/test_images/chest_xray/attacks/sample_3_adv.png"),
      label: "Chest X-Ray Sample 3 (Adversarial)",
    },
  ],
};

export function ImageSelector({
  dataset,
  onImageSelect,
  selectedImage,
}: ImageSelectorProps) {
  const demoImages = DEMO_IMAGES[dataset];

  const handleImageSelect = (
    imageItem: { uri: any; label: string },
    index: number
  ) => {
    onImageSelect(`${dataset}_demo_${index}`); // Pass a unique identifier
  };

  const handleCameraCapture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take photos. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        onImageSelect(imageUri);
        Alert.alert("Success", "Photo captured! You can now run the test.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }
  };

  const handleGalleryPick = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Photo library permission is needed to select images. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        onImageSelect(imageUri);
        Alert.alert("Success", "Image selected! You can now run the test.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  return (
    <MedDefCard>
      <Text style={styles.title}>Select Test Image</Text>
      <Text style={styles.subtitle}>
        Choose an image for {dataset.toUpperCase()} testing
      </Text>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCameraCapture}
        >
          <Text style={styles.actionButtonText}>📷 Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleGalleryPick}
        >
          <Text style={styles.actionButtonText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dividerText}>— Or select demo image —</Text>

      {/* Demo Images Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageScroll}
      >
        {demoImages.map((imageItem, index) => {
          const imageId = `${dataset}_demo_${index}`;
          return (
            <TouchableOpacity
              key={imageId}
              style={[
                styles.imageContainer,
                selectedImage === imageId && styles.selectedImage,
              ]}
              onPress={() => handleImageSelect(imageItem, index)}
            >
              <Image
                source={imageItem.uri}
                style={styles.demoImage}
                resizeMode="cover"
              />
              <Text style={styles.imageLabel}>{imageItem.label}</Text>

              {selectedImage === imageId && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </MedDefCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  subtitle: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.md,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: meddefTheme.spacing.md,
  },

  actionButton: {
    backgroundColor: meddefTheme.colors.primary,
    paddingVertical: meddefTheme.spacing.sm,
    paddingHorizontal: meddefTheme.spacing.lg,
    borderRadius: meddefTheme.borderRadius.md,
    minWidth: 100,
  },

  actionButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },

  dividerText: {
    fontSize: 12,
    color: meddefTheme.colors.text.muted,
    textAlign: "center",
    marginVertical: meddefTheme.spacing.md,
    fontStyle: "italic",
  },

  imageScroll: {
    marginTop: meddefTheme.spacing.sm,
  },

  imageContainer: {
    marginRight: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.md,
    overflow: "hidden",
    position: "relative",
    width: 120,
  },

  selectedImage: {
    borderColor: meddefTheme.colors.success,
    borderWidth: 3,
  },

  demoImage: {
    width: 120,
    height: 120,
    borderRadius: meddefTheme.borderRadius.sm,
  },

  imageLabel: {
    fontSize: 10,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    fontWeight: "500",
    marginTop: meddefTheme.spacing.xs,
    paddingHorizontal: 4,
  },

  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: meddefTheme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: meddefTheme.borderRadius.sm,
  },

  imagePlaceholderText: {
    fontSize: 10,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    fontWeight: "500",
  },

  selectedIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    backgroundColor: meddefTheme.colors.success,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  selectedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
