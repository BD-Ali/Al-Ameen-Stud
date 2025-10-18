import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { DataContext } from '../context/DataContext';

/**
 * Optimized Clear Schedule Component with Progress Indicator
 * Shows real-time progress while clearing 600+ documents
 */
export const OptimizedClearSchedule = ({ date, onComplete }) => {
  const { clearScheduleForDate } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [result, setResult] = useState(null);

  const handleClearSchedule = async () => {
    setLoading(true);
    setProgress({ completed: 0, total: 0, percentage: 0 });
    setResult(null);

    const result = await clearScheduleForDate(date, (progressData) => {
      setProgress(progressData);
    });

    setResult(result);
    setLoading(false);

    if (result.success && onComplete) {
      setTimeout(() => onComplete(result), 1500); // Show success for 1.5s
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleClearSchedule}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>مسح الجدول</Text>
        )}
      </TouchableOpacity>

      {/* Progress Modal */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>جاري مسح الجدول...</Text>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
            </View>

            <Text style={styles.progressText}>
              {progress.percentage}% مكتمل
            </Text>
            <Text style={styles.progressSubtext}>
              ({progress.completed} من {progress.total} دفعة)
            </Text>

            <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      {result && (
        <Modal visible={!!result} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.resultCard, result.success ? styles.successCard : styles.errorCard]}>
              <Text style={styles.resultTitle}>
                {result.success ? '✓ تم المسح بنجاح' : '✗ فشل المسح'}
              </Text>

              {result.success && (
                <>
                  <Text style={styles.resultStat}>
                    تم حذف {result.totalDeleted} مستند
                  </Text>
                  <Text style={styles.resultStat}>
                    الوقت: {(result.duration / 1000).toFixed(2)} ثانية
                  </Text>
                  <Text style={styles.resultStat}>
                    السرعة: {result.docsPerSecond} مستند/ثانية
                  </Text>
                </>
              )}

              {result.error && (
                <Text style={styles.errorText}>{result.error}</Text>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  button: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  successCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  errorCard: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultStat: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
  },
});

