import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DataContext } from './DataContext';
import { AuthContext } from './AuthContext';

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً،</Text>
          <Text style={styles.userName}>{selectedClient?.name || 'عميل'} 👋</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {selectedClient ? (
        <FlatList
          data={clientLessons}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
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
                <Text style={styles.lessonDate}>📅 {item.date}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  paymentAmountPaid: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  paymentAmountDue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  paymentDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#334155',
  },
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  lessonsBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lessonsBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  lessonCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lessonDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  lessonTime: {
    fontSize: 14,
    color: '#94a3b8',
  },
  lessonDetails: {
    marginBottom: 12,
  },
  lessonDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonDetailIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  lessonDetailText: {
    fontSize: 15,
    color: '#e2e8f0',
  },
  lessonFooter: {
    display: 'none',
  },
  lessonPrice: {
    display: 'none',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});

export default ClientHomeScreen;
