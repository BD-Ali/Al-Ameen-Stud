import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';

/**
 * ClientHomeScreen displays a client's upcoming and past lessons along with
 * their current payment status. The client is automatically identified from
 * their authenticated account.
 */
const ClientHomeScreen = () => {
  const { clients, lessons, horses, workers } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);

  // Find client by matching user ID
  const selectedClient = clients.find((c) => c.id === user?.uid);
  const clientLessons = lessons.filter((l) => l.clientId === user?.uid);

  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  // Format date to numerical format (DD-MM-YYYY)
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          onPress: async () => {
            await logOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <CompactHeader
        userName={selectedClient?.name}
        userRole="client"
        onLogout={logOut}
        loading={!selectedClient}
      />

      {selectedClient ? (
        <FlatList
          data={clientLessons}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Announcements Feed */}
              <AnnouncementsFeed userRole="client" />

              {/* Payment Status Card */}
              <View style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentEmoji}>💰</Text>
                  <Text style={styles.paymentTitle}>حالة الدفع</Text>
                </View>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>المدفوع</Text>
                    <Text style={styles.paymentAmountPaid}>₪{selectedClient.amountPaid || 0}</Text>
                  </View>
                  <View style={styles.paymentDivider} />
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>المستحق</Text>
                    <Text style={styles.paymentAmountDue}>₪{selectedClient.amountDue || 0}</Text>
                  </View>
                </View>
              </View>

              {/* Lessons Section */}
              <View style={styles.lessonsHeader}>
                <Text style={styles.sectionTitle}>🗓️ دروسك</Text>
                <View style={styles.lessonsBadge}>
                  <Text style={styles.lessonsBadgeText}>{clientLessons.length}</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonDate}>📅 {formatDate(item.date)}</Text>
                <Text style={styles.lessonTime}>⏰ {item.time}</Text>
              </View>
              <View style={styles.lessonDetails}>
                <View style={styles.lessonDetail}>
                  <Text style={styles.lessonDetailIcon}>🐴</Text>
                  <Text style={styles.lessonDetailText}>{getHorseName(item.horseId)}</Text>
                </View>
                <View style={styles.lessonDetail}>
                  <Text style={styles.lessonDetailIcon}>👨‍🏫</Text>
                  <Text style={styles.lessonDetailText}>{getWorkerName(item.instructorId)}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>لا توجد دروس مجدولة بعد</Text>
              <Text style={styles.emptySubtext}>اتصل بنا لحجز درسك الأول!</Text>
            </View>
          }
          contentContainerStyle={styles.content}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🔄</Text>
          <Text style={styles.loadingText}>جاري تحميل معلوماتك...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.base,
  },
  paymentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  paymentTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: typography.weight.semibold,
  },
  paymentAmountPaid: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.status.success,
  },
  paymentAmountDue: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.status.warning,
  },
  paymentDivider: {
    width: 1.5,
    height: 36,
    backgroundColor: colors.border.light,
  },
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  lessonsBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  lessonsBadgeText: {
    color: '#fff',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  lessonCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    ...shadows.sm,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  lessonDate: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  lessonTime: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  lessonDetails: {
    gap: spacing.xs,
  },
  lessonDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lessonDetailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  lessonDetailText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
  },
});

export default ClientHomeScreen;
