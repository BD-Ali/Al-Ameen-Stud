import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Linking, Animated } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import AnimatedCard from '../components/AnimatedCard';
import { useFadeIn, useScaleIn, usePulse } from '../utils/animations';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * VisitorHomeScreen is the public‑facing section of the app.  It shows a
 * friendly welcome message and lists the horses currently boarded at the
 * stable along with their breeds.  No sensitive information such as owner,
 * feeding schedule or value is shown.
 */
const VisitorHomeScreen = () => {
  const { horses } = useContext(DataContext);

  // Animations
  const fadeAnim = useFadeIn(700);
  const scaleAnim = useScaleIn(600, 100);
  const pulseAnim = usePulse();

  const handleContactUs = () => {
    Alert.alert(
      'تواصل معنا',
      'اختر طريقة التواصل مع الإدارة:',
      [
        {
          text: 'إرسال بريد إلكتروني',
          onPress: () => {
            Linking.openURL('mailto:badarne3li@gmail.com').catch(() => {
              Alert.alert('خطأ', 'لا يمكن فتح تطبيق البريد الإلكتروني');
            });
          }
        },
        {
          text: 'اتصال هاتفي',
          onPress: () => {
            Linking.openURL('tel:0503653429').catch(() => {
              Alert.alert('خطأ', 'لا يمكن إجراء المكالمة');
            });
          }
        },
        {
          text: 'إلغاء',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoReflection} />
          </View>
          <Text style={styles.heading}>مرحباً بك في مَرْبَط الأَمِين!</Text>
          <Text style={styles.paragraph}>
            نحن فخورون برعاية مجموعة متنوعة من الخيول الرائعة. لا تتردد في الاطلاع والتعرف عليها.
          </Text>
        </Animated.View>

        {/* Announcements Feed */}
        <AnnouncementsFeed userRole="visitor" />

        <View style={styles.subheadingRow}>
          <MaterialCommunityIcons name="horse-variant" size={24} color="#F39C12" />
          <Text style={styles.subheading}>خيولنا</Text>
        </View>

        {/* Render horses directly instead of using FlatList */}
        {horses.length > 0 ? (
          horses.map((item, index) => (
            <AnimatedCard key={item.id} index={index} delay={100} style={styles.card}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.horseImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.horseInfo}>
                <View style={styles.horseNameRow}>
                  <MaterialCommunityIcons name="horse-variant" size={20} color="#F39C12" />
                  <Text style={styles.horseName}>{item.name}</Text>
                </View>
                <View style={styles.breedRow}>
                  <MaterialCommunityIcons name="horse" size={14} color="#E67E22" />
                  <Text style={styles.breedLabel}>السلالة:</Text>
                  <Text style={styles.breedValue}>{item.breed}</Text>
                </View>
              </View>
            </AnimatedCard>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="horse-variant" size={64} color="#F39C12" />
            <Text style={styles.emptyText}>لا توجد خيول لعرضها بعد</Text>
          </View>
        )}
      </ScrollView>

      {/* Contact Us Floating Button */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleContactUs}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <FontAwesome5 name="phone" size={20} color="#fff" solid />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xl, // Extra padding at bottom
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
    ...shadows.md,
    position: 'relative',
  },
  logoReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 40,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  heading: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: '#2C3E50',
    textAlign: 'center',
    letterSpacing: 1.5,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  paragraph: {
    fontSize: typography.size.base,
    marginBottom: spacing.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
    lineHeight: 22,
  },
  subheadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.base,
    marginBottom: spacing.md,
  },
  subheading: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    overflow: 'hidden',
  },
  horseImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background.tertiary,
  },
  horseInfo: {
    padding: spacing.md,
  },
  horseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  horseName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  contactButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 5,
  },
  contactButtonIcon: {
    fontSize: 24,
  },
});

export default VisitorHomeScreen;