/**
 * Model Loading Progress Component
 *
 * Shows progress bar and status during model loading
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { meddefTheme } from "../../config/theme";
import { MedDefCard } from "./MedDefUI";

interface ModelLoadingProgressProps {
  progress: number; // 0-100
  message: string;
  modelName?: string;
}

export function ModelLoadingProgress({
  progress,
  message,
  modelName,
}: ModelLoadingProgressProps) {
  return (
    <MedDefCard style={styles.container}>
      <Text style={styles.title}>Loading Model</Text>
      {modelName && <Text style={styles.modelName}>{modelName}</Text>}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, progress))}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.stepsContainer}>
        <View style={[styles.step, progress >= 20 && styles.stepActive]}>
          <Text style={styles.stepText}>📥</Text>
        </View>
        <View style={[styles.step, progress >= 50 && styles.stepActive]}>
          <Text style={styles.stepText}>🧠</Text>
        </View>
        <View style={[styles.step, progress >= 85 && styles.stepActive]}>
          <Text style={styles.stepText}>⚙️</Text>
        </View>
        <View style={[styles.step, progress >= 100 && styles.stepActive]}>
          <Text style={styles.stepText}>✅</Text>
        </View>
      </View>
    </MedDefCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: meddefTheme.spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "500",
    color: meddefTheme.colors.primary,
    marginBottom: meddefTheme.spacing.lg,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: meddefTheme.spacing.lg,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: meddefTheme.colors.border,
    borderRadius: 4,
    marginRight: meddefTheme.spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: meddefTheme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    minWidth: 45,
    textAlign: "right",
  },
  message: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    marginBottom: meddefTheme.spacing.lg,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: meddefTheme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: {
    backgroundColor: meddefTheme.colors.primary,
  },
  stepText: {
    fontSize: 16,
  },
});

export default ModelLoadingProgress;
