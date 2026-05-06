import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  I18nManager
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import RTLText from '../components/RTLText';
import useRTL from '../hooks/useRTL';
import AppIcon from '../components/AppIcon';
import ScreenBackground from '../components/ScreenBackground';
import { useTranslation } from '../i18n/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import useTabBottomPadding from '../hooks/useTabBottomPadding';

/**
 * UsersScreen - Unified section for managing both Clients and Workers
 * Features: Tabs, Search/Filter, Collapsible items, Create/Edit/Delete for both types
 */
const UsersScreen = () => {
  const bottomPadding = useTabBottomPadding();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { rowDirection, textAlign, writingDirection } = useRTL();
  const {
    clients,
    workers,
    updateClient,
    removeClient,
    removeWorker,
    createUserAccount,
    lessons,
    horses,
    workerUsers,
    addPaymentRecord
  } = useContext(DataContext);

  // Tab Management
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' or 'workers'

  // Expansion Management
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Edit States
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // New User Form States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    hasSubscription: false,
    subscriptionLessons: '',
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Toast/Feedback
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Get current data based on active tab
  const currentData = useMemo(() => {
    const data = activeTab === 'clients' ? clients : (workerUsers || workers);

    // Apply search filter
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phoneNumber?.toLowerCase().includes(query)
    );
  }, [activeTab, clients, workers, workerUsers, searchQuery]);

  // Helper Functions
  const getHorseName = (id) => horses?.find((h) => h.id === id)?.name || t('common.unknown');

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateStr;
    }
  };

  const getPastLessons = (clientId) => {
    const today = new Date();
    return lessons
      ?.filter(lesson => lesson.clientId === clientId)
      .filter(lesson => {
        const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
        return lessonDateTime < today;
      })
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      }) || [];
  };

  const getUpcomingLessons = (clientId) => {
    const now = new Date();
    return lessons
      ?.filter(lesson => lesson.clientId === clientId)
      .filter(lesson => {
        const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
        return lessonDateTime >= now;
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      }) || [];
  };

  const showToastNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowToast(false);
    });
  };

  // Phone Call Handler
  const handlePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert(t('common.error'), t('users.cannotCallOnDevice'));
        }
      })
      .catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert(t('common.error'), t('users.phoneDialFailed'));
      });
  };

  // Tab Switching
  const switchTab = (tab) => {
    setActiveTab(tab);
    setExpandedUserId(null);
    setEditingUserId(null);
    setSearchQuery('');
  };

  // Expansion Toggle
  const toggleExpand = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setEditingUserId(null);
    } else {
      setExpandedUserId(userId);
      setEditingUserId(null);
    }
  };

  // Edit Functions
  const startEditing = (user) => {
    setEditingUserId(user.id);
    if (activeTab === 'clients') {
      setEditFormData({
        quickPayment: '',
        phoneNumber: user.phoneNumber || '',
        amountPaid: String(user.amountPaid || 0),
        amountDue: String(user.amountDue || 0),
        amountDueEdited: false,
        lessonCount: String(user.lessonCount || 0),
        hasSubscription: user.hasSubscription || false,
        subscriptionActive: user.subscriptionActive || false,
        subscriptionLessons: String(user.subscriptionLessons || 0),
        subscriptionUsedLessons: String(user.subscriptionUsedLessons || 0),
        subscriptionStartDate: user.subscriptionStartDate || '',
      });
    } else {
      setEditFormData({
        role: user.role || '',
      });
    }
  };

  const handleQuickPayment = (text) => {
    const quickAmount = parseFloat(text) || 0;
    const basePaid = parseFloat(editFormData._basePaid ?? editFormData.amountPaid) || 0;
    const newTotal = basePaid + quickAmount;
    const updates = {
      ...editFormData,
      quickPayment: text,
      amountPaid: String(newTotal),
      _basePaid: String(basePaid),
    };
    if (!editFormData.amountDueEdited) {
      updates.amountDue = String(newTotal);
    }
    setEditFormData(updates);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const saveUserDetails = async (userId) => {
    setIsLoading(true);
    setLoadingMessage(t('users.saving'));

    if (activeTab === 'clients') {
      const currentClient = clients.find(c => c.id === userId);
      const previousPaid = currentClient?.amountPaid || 0;
      const paidNum = editFormData.amountPaid ? parseFloat(editFormData.amountPaid) : 0;
      let dueNum = editFormData.amountDue ? parseFloat(editFormData.amountDue) : 0;
      const lessonCountNum = editFormData.lessonCount ? parseInt(editFormData.lessonCount) : 0;
      // Ensure amount due is never less than amount paid
      if (dueNum < paidNum) dueNum = paidNum;
      const paymentDiff = paidNum - previousPaid;

      const remainingNum = parseInt(editFormData.subscriptionLessons) || 0;
      const usedNum = parseInt(editFormData.subscriptionUsedLessons) || 0;

      const subUpdates = editFormData.hasSubscription ? {
        hasSubscription: true,
        subscriptionActive: editFormData.subscriptionActive || false,
        subscriptionLessons: remainingNum,
        subscriptionUsedLessons: usedNum,
        subscriptionTotalLessons: remainingNum + usedNum,
        subscriptionStartDate: editFormData.subscriptionStartDate || new Date().toISOString().split('T')[0],
      } : {
        hasSubscription: false,
        subscriptionActive: false,
        subscriptionLessons: 0,
        subscriptionUsedLessons: 0,
        subscriptionTotalLessons: 0,
      };

      const result = await updateClient(userId, {
        phoneNumber: editFormData.phoneNumber || '',
        amountPaid: paidNum,
        amountDue: dueNum,
        lessonCount: lessonCountNum,
        ...subUpdates,
      });

      // Save payment receipt if amount paid increased
      if (result.success && paymentDiff > 0) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
        await addPaymentRecord(userId, {
          amount: paymentDiff,
          totalAfter: paidNum,
          amountDue: dueNum,
          date: dateStr,
          time: timeStr,
          clientName: currentClient?.name || '',
        });
      }

      setIsLoading(false);
      if (result.success) {
        showToastNotification(t('users.clientUpdated'), 'success');
        setEditingUserId(null);
        setEditFormData({});
      } else {
        showToastNotification(result.error || t('users.updateFailed'), 'error');
      }
    } else {
      // For workers, we can add update functionality if needed
      setIsLoading(false);
      showToastNotification(t('users.workerUpdated'), 'success');
      setEditingUserId(null);
      setEditFormData({});
    }
  };

  // Delete Functions
  const handleRemoveUser = (id, name) => {
    Alert.alert(
      activeTab === 'clients' ? t('users.deleteClient') : t('users.deleteWorker'),
      t('users.confirmDeleteUser', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setLoadingMessage(t('users.deleting'));

            const result = activeTab === 'clients'
              ? await removeClient(id)
              : await removeWorker(id);

            setIsLoading(false);
            if (result.success) {
              showToastNotification(activeTab === 'clients' ? t('users.clientDeleted') : t('users.workerDeleted'), 'success');
              setExpandedUserId(null);
            } else {
              showToastNotification(result.error || t('users.deleteFailed'), 'error');
            }
          }
        }
      ]
    );
  };

  // Add New User
  const handleAddNewUser = async () => {
    // Validation
    if (!newUserForm.name.trim()) {
      Alert.alert(t('common.error'), t('users.enterNameRequired'));
      return;
    }
    if (!newUserForm.email.trim()) {
      Alert.alert(t('common.error'), t('users.enterEmailRequired'));
      return;
    }
    if (!newUserForm.phone.trim()) {
      Alert.alert(t('common.error'), t('users.enterPhoneRequired'));
      return;
    }

    // Validate subscription data for clients
    if (activeTab === 'clients' && newUserForm.hasSubscription) {
      const subscriptionCount = parseInt(newUserForm.subscriptionLessons);
      if (isNaN(subscriptionCount) || subscriptionCount <= 0) {
        Alert.alert(t('common.error'), t('users.invalidSubscriptionCount'));
        return;
      }
    }

    setIsAddingUser(true);
    setIsLoading(true);
    setLoadingMessage(t('users.adding'));

    const result = await createUserAccount(
      newUserForm.name.trim(),
      newUserForm.email.trim(),
      newUserForm.phone.trim(),
      activeTab === 'clients' ? 'client' : 'worker',
      // Pass subscription data if client
      activeTab === 'clients' && newUserForm.hasSubscription ? {
        hasSubscription: true,
        subscriptionLessons: parseInt(newUserForm.subscriptionLessons),
        subscriptionTotalLessons: parseInt(newUserForm.subscriptionLessons),
        subscriptionUsedLessons: 0,
        subscriptionActive: true,
        subscriptionStartDate: new Date().toISOString().split('T')[0]
      } : null
    );

    setIsAddingUser(false);
    setIsLoading(false);

    if (result.success) {
      showToastNotification(activeTab === 'clients' ? t('users.clientAdded', { name: newUserForm.name }) : t('users.workerAdded', { name: newUserForm.name }), 'success');
      setNewUserForm({ name: '', email: '', phone: '', hasSubscription: false, subscriptionLessons: '' });
    } else {
      showToastNotification(result.error || t('users.addFailed'), 'error');
    }
  };

  // Render Functions
  const renderUserCard = ({ item, index }) => {
    const isExpanded = expandedUserId === item.id;
    const isEditing = editingUserId === item.id;
    const isClient = activeTab === 'clients';

    // Get lesson info for clients
    const pastLessons = isClient ? getPastLessons(item.id) : [];
    const upcomingLessons = isClient ? getUpcomingLessons(item.id) : [];
    const nextLesson = upcomingLessons[0];

    return (
      <AnimatedCard index={index} delay={80} style={styles.card}>
        {/* Compact Header - Always Visible */}
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          <View style={[styles.cardHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.userHeaderLeft, { flexDirection: rowDirection }]}>
              <View style={styles.userHeaderInfo}>
                <RTLText style={styles.userName}>{item.name}</RTLText>
                <View style={[styles.userMetaRow, { flexDirection: rowDirection }]}>
                  {item.phoneNumber && (
                    <TouchableOpacity
                      style={[styles.phoneRow, { flexDirection: rowDirection }]}
                      onPress={() => handlePhoneCall(item.phoneNumber)}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="call-outline" size={12} color={colors.primary.main} />
                      <Text style={[styles.userMetaText, styles.phoneLink, { writingDirection, textAlign }]}>{item.phoneNumber}</Text>
                    </TouchableOpacity>
                  )}
                  {isClient && item.amountDue > 0 && (
                    <View style={styles.dueBadge}>
                      <Text style={[styles.dueBadgeText, { writingDirection, textAlign }]}>₪{item.amountDue}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <AppIcon name={isExpanded ? 'chevron-down-outline' : (I18nManager.isRTL ? 'chevron-back-outline' : 'chevron-forward-outline')} size={14} color={colors.text.tertiary} />
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Details Card */}
            <View style={styles.detailsCard}>
              <View style={[styles.detailsTitleRow, { flexDirection: rowDirection }]}>
                <AppIcon name="clipboard-outline" size={16} color={colors.primary.main} />
                <RTLText style={styles.detailsTitle}>{t('users.basicInfo')}</RTLText>
              </View>

              {item.email && (
                <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                  <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                    <AppIcon name="mail-outline" size={14} />
                    <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.email')}</Text>
                  </View>
                  <Text style={[styles.detailValue, { writingDirection, textAlign }]}>{item.email}</Text>
                </View>
              )}

              {item.phoneNumber && (
                <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                  <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                    <AppIcon name="call-outline" size={14} />
                    <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.phoneNumber')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePhoneCall(item.phoneNumber)}>
                    <Text style={[styles.detailValue, styles.phoneLink, { writingDirection, textAlign }]}>{item.phoneNumber}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isClient ? (
                <>
                  {isEditing ? (
                    <>
                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="call-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.phoneNumber')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.phoneNumber}
                          onChangeText={(text) => setEditFormData({ ...editFormData, phoneNumber: text })}
                          keyboardType="phone-pad"
                          style={[styles.editInput, { textAlign }]}
                          placeholder={t('users.enterPhone')}
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>

                      <View style={styles.quickPaymentSection}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="add-circle-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.addPayment')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.quickPayment}
                          onChangeText={handleQuickPayment}
                          keyboardType="numeric"
                          style={[styles.editInput, styles.quickPaymentInput, { textAlign }]}
                          placeholder={t('users.addPaymentPlaceholder')}
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>

                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="cash-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.amountPaidCurrency')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.amountPaid}
                          onChangeText={(text) => setEditFormData({...editFormData, amountPaid: text, quickPayment: '', _basePaid: undefined})}
                          keyboardType="numeric"
                          style={[styles.editInput, { textAlign }]}
                          placeholder="0"
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>

                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="document-text-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.amountDueCurrency')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.amountDue}
                          onChangeText={(text) => setEditFormData({...editFormData, amountDue: text, amountDueEdited: true})}
                          keyboardType="numeric"
                          style={[styles.editInput, { textAlign }]}
                          placeholder="0"
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>

                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="book-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.lessonCount')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.lessonCount}
                          onChangeText={(text) => setEditFormData({...editFormData, lessonCount: text})}
                          keyboardType="numeric"
                          style={[styles.editInput, { textAlign }]}
                          placeholder="0"
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>

                      {/* Subscription edit section */}
                      <View style={styles.editSubscriptionSection}>
                        <TouchableOpacity
                          style={styles.subscriptionToggle}
                          onPress={() => setEditFormData({ ...editFormData, hasSubscription: !editFormData.hasSubscription })}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.checkboxContainer, { flexDirection: rowDirection }]}>
                            <View style={[styles.checkbox, editFormData.hasSubscription && styles.checkboxChecked]}>
                              {editFormData.hasSubscription && (
                                <AppIcon name="checkmark-outline" size={14} />
                              )}
                            </View>
                            <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                              <AppIcon name="ticket-outline" size={14} />
                              <Text style={[styles.checkboxLabel, { writingDirection, textAlign }]}>{t('users.hasSubscription')}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {editFormData.hasSubscription && (
                          <>
                            <TouchableOpacity
                              style={[styles.subscriptionToggle, { marginTop: spacing.xs }]}
                              onPress={() => setEditFormData({ ...editFormData, subscriptionActive: !editFormData.subscriptionActive })}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.checkboxContainer, { flexDirection: rowDirection }]}>
                                <View style={[styles.checkbox, editFormData.subscriptionActive && styles.checkboxChecked]}>
                                  {editFormData.subscriptionActive && (
                                    <AppIcon name="checkmark-outline" size={14} />
                                  )}
                                </View>
                                <Text style={[styles.checkboxLabel, { writingDirection, textAlign }]}>{t('clientHome.active')}</Text>
                              </View>
                            </TouchableOpacity>

                            <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                              <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                                <AppIcon name="layers-outline" size={13} />
                                <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.remaining')}</Text>
                              </View>
                              <TextInput
                                value={editFormData.subscriptionLessons}
                                onChangeText={(text) => setEditFormData({ ...editFormData, subscriptionLessons: text })}
                                keyboardType="numeric"
                                style={[styles.editInput, { textAlign }]}
                                placeholder="0"
                                placeholderTextColor={colors.text.muted}
                              />
                            </View>

                            <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                              <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                                <AppIcon name="checkmark-done-outline" size={13} />
                                <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.used')}</Text>
                              </View>
                              <TextInput
                                value={editFormData.subscriptionUsedLessons}
                                onChangeText={(text) => setEditFormData({ ...editFormData, subscriptionUsedLessons: text })}
                                keyboardType="numeric"
                                style={[styles.editInput, { textAlign }]}
                                placeholder="0"
                                placeholderTextColor={colors.text.muted}
                              />
                            </View>

                            <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                              <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                                <AppIcon name="list-outline" size={13} />
                                <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.total')}</Text>
                              </View>
                              <Text style={[styles.detailValue, { writingDirection, textAlign }]}>
                                {(parseInt(editFormData.subscriptionLessons) || 0) + (parseInt(editFormData.subscriptionUsedLessons) || 0)}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>

                      <View style={[styles.editButtonsRow, { flexDirection: rowDirection }]}>
                        <TouchableOpacity
                          style={[styles.editButton, styles.saveButton]}
                          onPress={() => saveUserDetails(item.id)}
                        >
                          <AppIcon name="save-outline" size={14} />
                          <Text style={[styles.editButtonText, { writingDirection, textAlign }]}>{t('common.save')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={cancelEditing}
                        >
                          <AppIcon name="close-outline" size={14} />
                          <Text style={[styles.editButtonText, { writingDirection, textAlign }]}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="cash-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.amountPaid')}</Text>
                        </View>
                        <Text style={[styles.detailValue, styles.paidText, { writingDirection, textAlign }]}>₪{item.amountPaid || 0}</Text>
                      </View>

                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="document-text-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.amountDue')}</Text>
                        </View>
                        <Text style={[styles.detailValue, styles.dueText, { writingDirection, textAlign }]}>₪{item.amountDue || 0}</Text>
                      </View>

                      <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="book-outline" size={14} />
                          <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.lessonCount')}</Text>
                        </View>
                        <Text style={[styles.detailValue, { writingDirection, textAlign }]}>{item.lessonCount || 0}</Text>
                      </View>

                      {/* Subscription Information */}
                      {item.hasSubscription && (
                        <View style={styles.subscriptionInfoCard}>
                          <View style={[styles.subscriptionInfoHeader, { flexDirection: rowDirection }]}>
                            <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                              <AppIcon name="ticket-outline" size={14} />
                              <Text style={[styles.subscriptionInfoTitle, { writingDirection, textAlign }]}>{t('users.subscription')}</Text>
                            </View>
                            <View style={[styles.subscriptionStatusBadge, item.subscriptionActive && styles.subscriptionActiveBadge]}>
                              <Text style={[styles.subscriptionStatusText, { writingDirection, textAlign }]}>
                                {item.subscriptionActive ? t('clientHome.active') : t('clientHome.expired')}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.subscriptionStats, { flexDirection: rowDirection }]}>
                            <View style={styles.subscriptionStatItem}>
                              <Text style={[styles.subscriptionStatLabel, { writingDirection, textAlign }]}>{t('users.remaining')}</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionLessons || 0}</Text>
                            </View>
                            <View style={styles.subscriptionStatDivider} />
                            <View style={styles.subscriptionStatItem}>
                              <Text style={[styles.subscriptionStatLabel, { writingDirection, textAlign }]}>{t('users.used')}</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionUsedLessons || 0}</Text>
                            </View>
                            <View style={styles.subscriptionStatDivider} />
                            <View style={styles.subscriptionStatItem}>
                              <Text style={[styles.subscriptionStatLabel, { writingDirection, textAlign }]}>{t('users.total')}</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionTotalLessons || 0}</Text>
                            </View>
                          </View>
                          {item.subscriptionStartDate && (
                            <Text style={[styles.subscriptionDate, { writingDirection, textAlign }]}>
                              {t('users.startDate', { date: formatDate(item.subscriptionStartDate) })}
                            </Text>
                          )}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.editDetailsButton}
                        onPress={() => startEditing(item)}
                      >
                        <AppIcon name="create-outline" size={14} />
                        <Text style={[styles.editDetailsButtonText, { writingDirection, textAlign }]}>{t('users.editDetails')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <>  
                  <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
                    <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                      <AppIcon name="briefcase-outline" size={14} />
                      <Text style={[styles.detailLabel, { writingDirection, textAlign }]}>{t('users.job')}</Text>
                    </View>
                    <Text style={[styles.detailValue, { writingDirection, textAlign }]}>{item.role || t('roles.worker')}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Client-specific: Next Lesson & Lesson History */}
            {isClient && nextLesson && (
              <View style={styles.nextLessonCard}>
                <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                  <AppIcon name="locate-outline" size={16} />
                  <Text style={[styles.sectionTitle, { writingDirection, textAlign }]}>{t('users.nextLesson')}</Text>
                </View>
                <View style={[styles.lessonInfoRow, { flexDirection: rowDirection }]}>
                  <AppIcon name="calendar-outline" size={14} />
                  <Text style={[styles.lessonInfoText, { writingDirection, textAlign }]}>{formatDate(nextLesson.date)} - {nextLesson.time}</Text>
                </View>
                <View style={[styles.lessonInfoRow, { flexDirection: rowDirection }]}>
                  <AppIcon name="paw-outline" size={16} />
                  <Text style={[styles.lessonInfoText, { writingDirection, textAlign }]}>{getHorseName(nextLesson.horseId)}</Text>
                </View>
              </View>
            )}

            {isClient && (upcomingLessons.length > 0 || pastLessons.length > 0) && (
              <View style={styles.lessonsSection}>
                {upcomingLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <View style={[styles.lessonGroupHeader, { flexDirection: rowDirection }]}>
                      <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                        <AppIcon name="calendar-outline" size={14} />
                        <Text style={[styles.lessonGroupTitle, { writingDirection, textAlign }]}>{t('users.upcomingLessons')}</Text>
                      </View>
                      <View style={styles.countBadgeSmall}>
                        <Text style={styles.countBadgeSmallText}>{upcomingLessons.length}</Text>
                      </View>
                    </View>
                    {upcomingLessons.slice(0, 3).map(lesson => (
                      <View key={lesson.id} style={styles.lessonItem}>
                        <View style={[styles.lessonItemRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="calendar-outline" size={12} />
                          <Text style={[styles.lessonItemText, { writingDirection, textAlign }]}>{formatDate(lesson.date)} - {lesson.time}</Text>
                        </View>
                        <View style={[styles.lessonItemRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="paw-outline" size={14} />
                          <Text style={[styles.lessonItemSubtext, { writingDirection, textAlign }]}>{getHorseName(lesson.horseId)}</Text>
                        </View>
                      </View>
                    ))}
                    {upcomingLessons.length > 3 && (
                      <Text style={[styles.moreText, { writingDirection, textAlign }]}>{t('users.moreOtherLessons', { count: upcomingLessons.length - 3 })}</Text>
                    )}
                  </View>
                )}

                {pastLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <View style={[styles.lessonGroupHeader, { flexDirection: rowDirection }]}>
                      <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                        <AppIcon name="document-outline" size={14} />
                        <Text style={[styles.lessonGroupTitle, { writingDirection, textAlign }]}>{t('users.lessonHistory')}</Text>
                      </View>
                      <View style={[styles.countBadgeSmall, styles.countBadgePast]}>
                        <Text style={styles.countBadgeSmallText}>{pastLessons.length}</Text>
                      </View>
                    </View>
                    {pastLessons.slice(0, 3).map(lesson => (
                      <View key={lesson.id} style={[styles.lessonItem, styles.lessonItemPast]}>
                        <View style={[styles.lessonItemRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="checkmark-circle-outline" size={12} />
                          <Text style={[styles.lessonItemText, { writingDirection, textAlign }]}>{formatDate(lesson.date)} - {lesson.time}</Text>
                        </View>
                        <View style={[styles.lessonItemRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="paw-outline" size={14} />
                          <Text style={[styles.lessonItemSubtext, { writingDirection, textAlign }]}>{getHorseName(lesson.horseId)}</Text>
                        </View>
                      </View>
                    ))}
                    {pastLessons.length > 3 && (
                      <Text style={[styles.moreText, { writingDirection, textAlign }]}>{t('users.moreOtherLessons', { count: pastLessons.length - 3 })}</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* History Button */}
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('UserHistory', {
                userId: item.id,
                userName: item.name,
                userType: activeTab === 'clients' ? 'client' : 'worker',
              })}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 6 }}>
                <AppIcon name="journal-outline" size={14} />
                <Text style={[styles.historyButtonText, { writingDirection, textAlign }]}>{t('users.viewHistory')}</Text>
              </View>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.id, item.name)}
            >
              <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 6 }}>
                <AppIcon name="trash-outline" size={14} />
                <Text style={[styles.removeButtonText, { writingDirection, textAlign }]}>{isClient ? t('users.deleteClient') : t('users.deleteWorker')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </AnimatedCard>
    );
  };

  return (
    <ScreenBackground noSafeArea>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header with Tabs */}
      <View style={styles.header}>
        <View style={[styles.titleRow, { flexDirection: rowDirection }]}>
          <AppIcon name="people-outline" size={24} />
          <RTLText style={styles.pageTitle}>{t('users.title')}</RTLText>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'clients' && styles.tabActive]}
            onPress={() => switchTab('clients')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive, { writingDirection, textAlign }]}>
              {t('users.clientsTab')} ({clients.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workers' && styles.tabActive]}
            onPress={() => switchTab('workers')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'workers' && styles.tabTextActive, { writingDirection, textAlign }]}>
              {t('users.workersTab')} ({(workerUsers || workers).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <AppIcon name="search-outline" size={16} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { textAlign }]}
            placeholder={t('users.searchPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AppIcon name="close-outline" size={14} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled={true}
        ListEmptyComponent={
            <View style={styles.emptyState}>
              <AppIcon name={activeTab === 'clients' ? 'people-outline' : 'construct-outline'} size={64} />
              <RTLText style={styles.emptyText}>
                {searchQuery ? t('users.noResults') : (activeTab === 'clients' ? t('users.noClientsYet') : t('users.noWorkersYet'))}
              </RTLText>
              <RTLText style={styles.emptySubtext}>
                {searchQuery ? t('users.tryOtherSearch') : (activeTab === 'clients' ? t('users.addFirstClient') : t('users.addFirstWorker'))}
              </RTLText>
            </View>
          }
          ListFooterComponent={
            <View style={styles.formSection}>
              {/* Add New User Form */}
              <View style={styles.newUserForm}>
                <View style={[styles.formTitleRow, { flexDirection: rowDirection }]}>
                  <AppIcon name="add-circle-outline" size={20} />
                  <RTLText style={styles.formTitle}>
                    {activeTab === 'clients' ? t('users.addNewClient') : t('users.addNewWorker')}
                  </RTLText>
                </View>
                <Text style={[styles.formSubtitle, { writingDirection, textAlign }]}>{t('users.autoAccountNote')}</Text>

                <View style={styles.inputGroup}>
                  <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                    <AppIcon name="person-outline" size={14} />
                    <Text style={[styles.label, { writingDirection, textAlign }]}>{t('users.nameLabel')}</Text>
                  </View>
                  <TextInput
                    value={newUserForm.name}
                    onChangeText={(text) => setNewUserForm({...newUserForm, name: text})}
                    placeholder={activeTab === 'clients' ? t('users.enterClientName') : t('users.enterWorkerName')}
                    placeholderTextColor={colors.text.muted}
                    style={[styles.input, { textAlign }]}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                    <AppIcon name="mail-outline" size={14} />
                    <Text style={[styles.label, { writingDirection, textAlign }]}>{t('users.email')}</Text>
                  </View>
                  <TextInput
                    value={newUserForm.email}
                    onChangeText={(text) => setNewUserForm({...newUserForm, email: text})}
                    placeholder={t('users.enterEmail')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.text.muted}
                    style={[styles.input, { textAlign }]}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                    <AppIcon name="call-outline" size={14} />
                    <Text style={[styles.label, { writingDirection, textAlign }]}>{t('users.phoneNumber')}</Text>
                  </View>
                  <TextInput
                    value={newUserForm.phone}
                    onChangeText={(text) => setNewUserForm({...newUserForm, phone: text})}
                    placeholder={t('users.enterPhone')}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.text.muted}
                    style={[styles.input, { textAlign }]}
                    returnKeyType="done"
                  />
                </View>

                {/* Subscription Section - Only for Clients */}
                {activeTab === 'clients' && (
                  <View style={styles.subscriptionSection}>
                    <View style={styles.subscriptionHeader}>
                      <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                        <AppIcon name="ticket-outline" size={16} />
                        <Text style={[styles.subscriptionTitle, { writingDirection, textAlign }]}>{t('users.subscription')}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.subscriptionToggle}
                      onPress={() => setNewUserForm({
                        ...newUserForm,
                        hasSubscription: !newUserForm.hasSubscription,
                        subscriptionLessons: !newUserForm.hasSubscription ? newUserForm.subscriptionLessons : ''
                      })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkboxContainer, { flexDirection: rowDirection }]}>
                        <View style={[styles.checkbox, newUserForm.hasSubscription && styles.checkboxChecked]}>
                          {newUserForm.hasSubscription && (
                            <AppIcon name="checkmark-outline" size={14} />
                          )}
                        </View>
                        <Text style={[styles.checkboxLabel, { writingDirection, textAlign }]}>{t('users.hasSubscription')}</Text>
                      </View>
                    </TouchableOpacity>

                    {newUserForm.hasSubscription && (
                      <View style={styles.inputGroup}>
                        <View style={[styles.labelRow, { flexDirection: rowDirection }]}>
                          <AppIcon name="bar-chart-outline" size={14} />
                          <Text style={[styles.label, { writingDirection, textAlign }]}>{t('users.subscriptionLessonsCount')}</Text>
                        </View>
                        <TextInput
                          value={newUserForm.subscriptionLessons}
                          onChangeText={(text) => setNewUserForm({...newUserForm, subscriptionLessons: text})}
                          placeholder={t('users.subscriptionLessonsPlaceholder')}
                          keyboardType="number-pad"
                          placeholderTextColor={colors.text.muted}
                          style={[styles.input, { textAlign }]}
                          returnKeyType="done"
                        />
                        <Text style={[styles.helpText, { writingDirection, textAlign }]}>
                          {t('users.subscriptionDeductNote')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.addButton, activeTab === 'workers' && styles.addButtonWorker]}
                  onPress={handleAddNewUser}
                  disabled={isAddingUser}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: spacing.sm }}>
                    <AppIcon name="add-outline" size={14} />
                    <Text style={[styles.addButtonText, { writingDirection, textAlign }]}>
                      {isAddingUser ? t('users.adding') : (activeTab === 'clients' ? t('users.addClient') : t('users.addWorker'))}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          }
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.accent.purple} />
              <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
          </View>
        )}

        {/* Toast Notification */}
        {showToast && (
          <Animated.View
            style={[
              styles.toast,
              toastType === 'success' && styles.toastSuccess,
              toastType === 'error' && styles.toastError,
              { opacity: fadeAnim }
            ]}
          >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    ...shadows.lg,
  },
  pageTitle: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary.main,
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.light,
  },
  searchIcon: {
    fontSize: 18,
    marginEnd: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.text.primary,
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: Platform.OS === 'android' ? 100 : spacing.xl,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStartWidth: 4,
    borderStartColor: colors.status.info,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  userHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userMetaText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  phoneLink: {
    color: colors.primary.main,
    textDecorationLine: 'underline',
  },
  dueBadge: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  dueBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  expandIcon: {
    fontSize: typography.size.lg,
    color: colors.text.tertiary,
    fontWeight: typography.weight.bold,
  },
  expandedSection: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailsCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailsTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  detailValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    marginStart: spacing.md,
  },
  paidText: {
    color: colors.status.success,
    fontSize: typography.size.base,
  },
  dueText: {
    color: colors.status.warning,
    fontSize: typography.size.base,
  },
  editInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.text.primary,
    minWidth: 100,
    textAlign: 'right',
  },
  quickPaymentSection: {
    backgroundColor: colors.status.success + '10',
    borderWidth: 1.5,
    borderColor: colors.status.success + '40',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  quickPaymentInput: {
    marginTop: spacing.sm,
    borderColor: colors.status.success + '60',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.status.success,
  },
  cancelButton: {
    backgroundColor: colors.status.error,
  },
  editButtonText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  editDetailsButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  editDetailsButtonText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  nextLessonCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  lessonInfoText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  lessonInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lessonsSection: {
    marginBottom: spacing.md,
  },
  lessonGroup: {
    marginBottom: spacing.md,
  },
  lessonGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  lessonGroupTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text.secondary,
  },
  countBadgeSmall: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgePast: {
    backgroundColor: colors.text.muted,
  },
  countBadgeSmallText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  lessonItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
  },
  lessonItemPast: {
    borderStartColor: colors.text.muted,
    opacity: 0.8,
  },
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  lessonItemText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  lessonItemSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  moreText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  historyButton: {
    backgroundColor: colors.accent.purple,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  historyButtonText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  removeButton: {
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  removeButtonText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  formSection: {
    marginTop: spacing.lg,
  },
  newUserForm: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    ...shadows.md,
  },
  formTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  formSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.base,
    color: colors.text.primary,
    minHeight: 48,
  },
  addButton: {
    backgroundColor: colors.status.info,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  addButtonWorker: {
    backgroundColor: colors.accent.pink,
  },
  addButtonText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.xxxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.xl,
    minWidth: 200,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    zIndex: 1001,
    borderStartWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  toastSuccess: {
    borderStartColor: colors.status.success,
  },
  toastError: {
    borderStartColor: colors.status.error,
  },
  toastText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  // Subscription styles
  subscriptionSection: {
    marginTop: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editSubscriptionSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(155, 89, 182, 0.06)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.25)',
  },
  subscriptionHeader: {
    marginBottom: spacing.sm,
  },
  subscriptionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionToggle: {
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    marginEnd: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  checkboxIcon: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  checkboxLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  helpText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  subscriptionInfoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent.teal,
  },
  subscriptionInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subscriptionInfoTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.status.error,
  },
  subscriptionActiveBadge: {
    backgroundColor: colors.status.success,
  },
  subscriptionStatusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  subscriptionStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  subscriptionStatLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  subscriptionStatValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  subscriptionDate: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UsersScreen;
