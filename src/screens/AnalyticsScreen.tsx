/**
 * Analytics Screen - Performance analytics and insights
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { meddefTheme } from "../config/theme";
import {
  MedDefCard,
  SectionHeader,
  MetricCard,
} from "../components/common/MedDefUI";

type AnalyticsTab = "overview" | "performance" | "robustness" | "attention";

export function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");

  const renderTabButton = (tab: AnalyticsTab, label: string, icon: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabIcon, activeTab === tab && styles.activeTabText]}>
        {icon}
      </Text>
      <Text
        style={[styles.tabLabel, activeTab === tab && styles.activeTabText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View>
      <SectionHeader title="System Performance Overview" />

      {/* Overall Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.metricCardWrapper}>
          <MetricCard
            label="Total Tests"
            value={247}
            unit="completed"
            color={meddefTheme.colors.primary}
          />
        </View>
        <View style={styles.metricCardWrapper}>
          <MetricCard
            label="Success Rate"
            value={94}
            unit="%"
            color={meddefTheme.colors.success}
          />
        </View>
        <View style={styles.metricCardWrapper}>
          <MetricCard
            label="Avg Confidence"
            value={89}
            unit="%"
            color={meddefTheme.colors.warning}
          />
        </View>
      </View>

      {/* Dataset Breakdown */}
      <SectionHeader title="Dataset Performance" />
      <MedDefCard>
        <View style={styles.datasetStats}>
          <View style={styles.datasetRow}>
            <Text style={styles.datasetName}>Retinal OCT</Text>
            <View style={styles.datasetMetrics}>
              <Text style={styles.metricText}>156 tests</Text>
              <Text style={styles.metricText}>92% accuracy</Text>
            </View>
          </View>
          <View style={styles.datasetRow}>
            <Text style={styles.datasetName}>Chest X-Ray</Text>
            <View style={styles.datasetMetrics}>
              <Text style={styles.metricText}>91 tests</Text>
              <Text style={styles.metricText}>96% accuracy</Text>
            </View>
          </View>
        </View>
      </MedDefCard>

      {/* Recent Trends */}
      <SectionHeader title="Recent Trends" />
      <MedDefCard>
        <Text style={styles.comingSoonText}>
          📈 Performance trends visualization coming soon
        </Text>
        <Text style={styles.featureList}>
          • Real-time performance monitoring{"\n"}• Historical trend analysis
          {"\n"}• Comparative model performance{"\n"}• Automated insights and
          recommendations
        </Text>
      </MedDefCard>
    </View>
  );

  const renderPerformance = () => (
    <View>
      <SectionHeader title="Model Performance Analysis" />

      <MedDefCard>
        <Text style={styles.sectionTitle}>Accuracy Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Clean Images:</Text>
          <Text style={styles.metricValue}>94.2%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Adversarial Images:</Text>
          <Text style={styles.metricValue}>87.6%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Overall Robustness:</Text>
          <Text style={styles.metricValue}>90.9%</Text>
        </View>
      </MedDefCard>

      <MedDefCard>
        <Text style={styles.sectionTitle}>Processing Performance</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Average Inference Time:</Text>
          <Text style={styles.metricValue}>187ms</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Throughput:</Text>
          <Text style={styles.metricValue}>5.3 images/sec</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Memory Usage:</Text>
          <Text style={styles.metricValue}>2.1 GB</Text>
        </View>
      </MedDefCard>
    </View>
  );

  const renderRobustness = () => (
    <View>
      <SectionHeader title="Adversarial Robustness Analysis" />

      <MedDefCard>
        <Text style={styles.sectionTitle}>Attack Detection</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>FGSM Detection Rate:</Text>
          <Text style={styles.metricValue}>91.2%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>PGD Detection Rate:</Text>
          <Text style={styles.metricValue}>88.7%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>C&W Detection Rate:</Text>
          <Text style={styles.metricValue}>85.3%</Text>
        </View>
      </MedDefCard>

      <MedDefCard>
        <Text style={styles.sectionTitle}>Defense Effectiveness</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Adversarial Training:</Text>
          <Text style={styles.metricValue}>+12.4% robustness</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>DAAM Attention:</Text>
          <Text style={styles.metricValue}>+8.7% detection</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Combined Defense:</Text>
          <Text style={styles.metricValue}>+19.1% overall</Text>
        </View>
      </MedDefCard>
    </View>
  );

  const renderAttention = () => (
    <View>
      <SectionHeader title="DAAM Attention Analysis" />

      <MedDefCard>
        <Text style={styles.comingSoonText}>
          🔍 Attention visualization coming soon
        </Text>
        <Text style={styles.featureList}>
          • Attention heatmap overlays{"\n"}• Focus region analysis{"\n"}• Clean
          vs adversarial attention comparison{"\n"}• Attention consistency
          metrics
        </Text>
      </MedDefCard>

      <MedDefCard>
        <Text style={styles.sectionTitle}>Attention Statistics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Avg Attention Entropy:</Text>
          <Text style={styles.metricValue}>3.42</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Focus Concentration:</Text>
          <Text style={styles.metricValue}>68.5%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Anomaly Detection:</Text>
          <Text style={styles.metricValue}>87.2%</Text>
        </View>
      </MedDefCard>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "performance":
        return renderPerformance();
      case "robustness":
        return renderRobustness();
      case "attention":
        return renderAttention();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
        >
          {renderTabButton("overview", "Overview", "📊")}
          {renderTabButton("performance", "Performance", "⚡")}
          {renderTabButton("robustness", "Robustness", "🛡️")}
          {renderTabButton("attention", "Attention", "👁️")}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>{renderContent()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },

  tabContainer: {
    backgroundColor: meddefTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  tabScroll: {
    paddingVertical: meddefTheme.spacing.sm,
  },

  tabButton: {
    paddingHorizontal: meddefTheme.spacing.md,
    paddingVertical: meddefTheme.spacing.sm,
    marginHorizontal: meddefTheme.spacing.xs,
    borderRadius: meddefTheme.borderRadius.sm,
    alignItems: "center",
    minWidth: 80,
  },

  activeTab: {
    backgroundColor: meddefTheme.colors.primary,
  },

  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },

  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: meddefTheme.colors.text.secondary,
  },

  activeTabText: {
    color: "#fff",
  },

  content: {
    flex: 1,
  },

  contentPadding: {
    padding: meddefTheme.spacing.md,
    paddingBottom: meddefTheme.spacing.xl, // Extra bottom padding for better scrolling
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.lg,
    flexWrap: "wrap", // Allow wrapping on smaller screens
    gap: 8, // Modern gap property for consistent spacing
  },

  metricCardWrapper: {
    flex: 1,
    marginHorizontal: 2, // Reduced margin
    minWidth: 95, // Slightly smaller minimum width
    maxWidth: 150, // Maximum width to prevent cards from getting too wide
  },

  datasetStats: {
    marginVertical: meddefTheme.spacing.sm,
  },

  datasetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  datasetName: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  datasetMetrics: {
    alignItems: "flex-end",
  },

  metricText: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.md,
  },

  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  metricLabel: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
  },

  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  comingSoonText: {
    fontSize: 16,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
    textAlign: "center",
    marginBottom: meddefTheme.spacing.md,
  },

  featureList: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 20,
    textAlign: "center",
  },
});
