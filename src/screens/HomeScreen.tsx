/**
 * Home Screen - Main dashboard for MedDef App
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { meddefTheme } from "../config/theme";
import {
  MedDefCard,
  SectionHeader,
  MetricCard,
  MedicalBadge,
} from "../components/common/MedDefUI";

export function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Welcome Section */}
        <MedDefCard style={styles.welcomeCard}>
          <View style={styles.headerSection}>
            <Image
              source={require("../../assets/ci2p_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.titleSection}>
              <Text style={styles.welcomeTitle}>MedDef Testing Platform</Text>
              <Text style={styles.institution}>CI2P Laboratory</Text>
              <Text style={styles.university}>
                School of Information Science and Engineering{"\n"}
                University of Jinan
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeDescription}>
            Advanced medical defense model testing platform with adversarial
            robustness evaluation and Defense-Aware Attention Mechanism (DAAM)
            visualization.
          </Text>
        </MedDefCard>

        {/* Quick Stats */}
        <SectionHeader title="System Overview" />
        <View style={styles.statsGrid}>
          <MetricCard
            label="Datasets"
            value={2}
            unit="available"
            color={meddefTheme.colors.primary}
          />
          <MetricCard
            label="Models"
            value={5}
            unit="loaded"
            color={meddefTheme.colors.success}
          />
          <MetricCard
            label="Tests Run"
            value={0}
            unit="today"
            color={meddefTheme.colors.warning}
          />
        </View>

        {/* Featured Datasets */}
        <SectionHeader title="Available Datasets" />
        <MedDefCard style={styles.datasetCard}>
          <View style={styles.datasetHeader}>
            <Text style={styles.datasetTitle}>Retinal OCT</Text>
            <MedicalBadge status="clean" size="small" />
          </View>
          <Text style={styles.datasetDescription}>
            Optical Coherence Tomography images for retinal disease detection
            with 4 classes including CNV, DME, Drusen, and Normal cases.
          </Text>
          <Text style={styles.datasetClasses}>
            Classes: CNV | DME | Drusen | Normal
          </Text>
        </MedDefCard>

        <MedDefCard style={styles.datasetCard}>
          <View style={styles.datasetHeader}>
            <Text style={styles.datasetTitle}>Chest X-Ray</Text>
            <MedicalBadge status="clean" size="small" />
          </View>
          <Text style={styles.datasetDescription}>
            Chest radiographs for pneumonia detection with binary classification
            between Normal and Pneumonia cases.
          </Text>
          <Text style={styles.datasetClasses}>Classes: Normal | Pneumonia</Text>
        </MedDefCard>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🧪</Text>
            <Text style={styles.actionLabel}>Start Testing</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>View Results</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔧</Text>
            <Text style={styles.actionLabel}>Model Config</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionLabel}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Research Info */}
        <SectionHeader title="Research Foundation" />
        <MedDefCard>
          <Text style={styles.researchTitle}>
            Defense-Aware Attention Mechanism
          </Text>
          <Text style={styles.researchDescription}>
            This platform implements state-of-the-art adversarial defense
            mechanisms specifically designed for medical imaging applications,
            featuring:
          </Text>
          <Text style={styles.featureList}>
            • Defense-Aware Attention Mechanism (DAAM){"\n"}• Multi-scale
            feature enhancement{"\n"}• Real-time adversarial attack detection
            {"\n"}• Attention visualization for interpretability
          </Text>
        </MedDefCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },

  content: {
    padding: meddefTheme.spacing.md,
  },

  welcomeCard: {
    marginBottom: meddefTheme.spacing.lg,
    alignItems: "center",
  },

  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
    width: "100%",
  },

  logo: {
    width: 80,
    height: 80,
    marginRight: meddefTheme.spacing.md,
  },

  titleSection: {
    flex: 1,
    alignItems: "flex-start",
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: 4,
  },

  institution: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.primary,
    marginBottom: 4,
  },

  university: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 16,
    textAlign: "left",
  },

  welcomeDescription: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: meddefTheme.spacing.sm,
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.lg,
  },

  datasetCard: {
    marginBottom: meddefTheme.spacing.md,
  },

  datasetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.sm,
  },

  datasetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  datasetDescription: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.sm,
    lineHeight: 18,
  },

  datasetClasses: {
    fontSize: 12,
    color: meddefTheme.colors.text.muted,
    fontWeight: "500",
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.lg,
  },

  actionButton: {
    width: "48%",
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    alignItems: "center",
    marginBottom: meddefTheme.spacing.sm,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
  },

  actionIcon: {
    fontSize: 24,
    marginBottom: meddefTheme.spacing.sm,
  },

  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
    textAlign: "center",
  },

  researchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  researchDescription: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 18,
    marginBottom: meddefTheme.spacing.sm,
  },

  featureList: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 20,
  },
});
