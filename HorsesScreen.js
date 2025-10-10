import React, { useContext, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DataContext } from './DataContext';

const HorsesScreen = () => {
  const { horses, addHorse, removeHorse } = useContext(DataContext);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [owner, setOwner] = useState('');
  const [feedSchedule, setFeedSchedule] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [expandedHorseId, setExpandedHorseId] = useState(null);

  const handleAddHorse = () => {
    if (!name) return;
    const numericValue = value ? parseFloat(value) : 0;
    addHorse({ name, breed, owner, feedSchedule, value: numericValue, notes });
    setName('');
    setBreed('');
    setOwner('');
    setFeedSchedule('');
    setValue('');
    setNotes('');
  };

  const handleRemoveHorse = (id) => {
    Alert.alert(
      "حذف الحصان",
      "هل أنت متأكد أنك تريد حذف هذا الحصان؟",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "موافق",
          onPress: () => removeHorse(id)
        }
      ]
    );
  };

  const toggleExpand = (id) => {
    setExpandedHorseId(expandedHorseId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>🐴 الخيول</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{horses.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedHorseId === item.id;
          return (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={styles.cardHeader}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.horseName}>{item.name}</Text>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '◀'}</Text>
                </View>
                <Text style={styles.horseValue}>₪{item.value}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>🏇 السلالة:</Text>
                    <Text style={styles.cardValue}>{item.breed || 'غير محدد'}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>👤 المالك:</Text>
                    <Text style={styles.cardValue}>{item.owner || 'غير محدد'}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>🥕 التغذية:</Text>
                    <Text style={styles.cardValue}>{item.feedSchedule || 'غير محدد'}</Text>
                  </View>
                  {item.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>📝 ملاحظات:</Text>
                      <Text style={styles.notesValue}>{item.notes}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveHorse(item.id)}>
                    <Text style={styles.removeButtonText}>حذف الحصان</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>➕ إضافة حصان جديد</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🐴 اسم الحصان</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="أدخل اسم الحصان"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🏇 السلالة</Text>
              <TextInput
                value={breed}
                onChangeText={setBreed}
                style={styles.input}
                placeholder="عربي، كوارتر، إلخ."
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 المالك</Text>
              <TextInput
                value={owner}
                onChangeText={setOwner}
                style={styles.input}
                placeholder="اسم المالك"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🥕 جدول التغذية</Text>
              <TextInput
                value={feedSchedule}
                onChangeText={setFeedSchedule}
                style={styles.input}
                placeholder="مثال: 08:00 تبن؛ 18:00 حبوب"
                placeholderTextColor="#64748b"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>💰 القيمة (₪)</Text>
              <TextInput
                value={value}
                onChangeText={setValue}
                style={styles.input}
                placeholder="قيمة الحصان"
                keyboardType="numeric"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📝 ملاحظات</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, styles.notesInput]}
                placeholder="أي ملاحظات إضافية عن الحصان..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddHorse}>
              <Text style={styles.addButtonText}>إضافة حصان</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐴</Text>
            <Text style={styles.emptyText}>لا توجد خيول بعد</Text>
            <Text style={styles.emptySubtext}>أضف أول حصان أدناه</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  horseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 12,
  },
  horseValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94a3b8',
    width: 100,
    fontWeight: '600',
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  notesSection: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderRightWidth: 3,
    borderRightColor: '#3b82f6',
  },
  notesLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  notesValue: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
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
});

export default HorsesScreen;