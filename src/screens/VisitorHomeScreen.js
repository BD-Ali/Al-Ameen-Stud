import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';

/**
 * VisitorHomeScreen is the public‑facing section of the app.  It shows a
 * friendly welcome message and lists the horses currently boarded at the
 * stable along with their breeds.  No sensitive information such as owner,
 * feeding schedule or value is shown.
 */
const VisitorHomeScreen = ({ navigation }) => {
  const { horses } = useContext(DataContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.heading}>مرحباً بك في مربط الأمين!</Text>
        <Text style={styles.paragraph}>
          نحن فخورون برعاية مجموعة متنوعة من الخيول الرائعة. لا تتردد في الاطلاع والتعرف عليها.
        </Text>
      </View>

      {/* Announcements Feed */}
      <AnnouncementsFeed userRole="visitor" />

      <Text style={styles.subheading}>🏇 خيولنا</Text>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.horseName}>{item.name}</Text>
            <View style={styles.breedRow}>
              <Text style={styles.breedLabel}>السلالة:</Text>
              <Text style={styles.breedValue}>{item.breed}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐴</Text>
            <Text style={styles.emptyText}>لا توجد خيول لعرضها بعد</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>→ العودة لتسجيل الدخول</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.base,
    backgroundColor: colors.background.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.base,
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  heading: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    color: colors.text.primary,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: typography.size.base,
    marginBottom: spacing.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
    lineHeight: 22,
  },
  subheading: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.base,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  horseName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  breedRow: {
    flexDirection: 'row',
  },
  breedLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginRight: spacing.sm,
  },
  breedValue: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
  },
  backButton: {
    backgroundColor: colors.primary.main,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
    ...shadows.md,
  },
  backButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
});

export default VisitorHomeScreen;