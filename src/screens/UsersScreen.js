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
  Linking
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';
import { useNavigation } from '@react-navigation/native';

/**
 * UsersScreen - Unified section for managing both Clients and Workers
 * Features: Tabs, Search/Filter, Collapsible items, Create/Edit/Delete for both types
 */
const UsersScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    clients,
    workers,
    updateClient,
    removeClient,
    removeWorker,
    createUserAccount,
    lessons,
    horses,
    workerUsers
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
        amountPaid: String(user.amountPaid || 0),
        amountDue: String(user.amountDue || 0),
        lessonCount: String(user.lessonCount || 0),
      });
    } else {
      setEditFormData({
        role: user.role || '',
      });
    }
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const saveUserDetails = async (userId) => {
    setIsLoading(true);
    setLoadingMessage(t('users.saving'));

    if (activeTab === 'clients') {
      const paidNum = editFormData.amountPaid ? parseFloat(editFormData.amountPaid) : 0;
      const dueNum = editFormData.amountDue ? parseFloat(editFormData.amountDue) : 0;
      const lessonCountNum = editFormData.lessonCount ? parseInt(editFormData.lessonCount) : 0;

      const result = await updateClient(userId, {
        amountPaid: paidNum,
        amountDue: dueNum,
        lessonCount: lessonCountNum
      });

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
          <View style={styles.cardHeader}>
            <View style={styles.userHeaderLeft}>
              <View style={[styles.avatarCircle, isClient && styles.avatarClient]}>
                <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
              </View>
              <View style={styles.userHeaderInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={styles.userMetaRow}>
                  {item.phoneNumber && (
                    <TouchableOpacity
                      style={styles.phoneRow}
                      onPress={() => handlePhoneCall(item.phoneNumber)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name="phone-alt" size={12} color={colors.primary.main} solid />
                      <Text style={[styles.userMetaText, styles.phoneLink]}>{item.phoneNumber}</Text>
                    </TouchableOpacity>
                  )}
                  {isClient && item.amountDue > 0 && (
                    <View style={styles.dueBadge}>
                      <Text style={styles.dueBadgeText}>₪{item.amountDue}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '◀'}</Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsTitleRow}>
                <FontAwesome5 name="clipboard-list" size={16} color={colors.primary.main} solid />
                <Text style={styles.detailsTitle}>{t('users.basicInfo')}</Text>
              </View>

              {item.email && (
                <View style={styles.detailRow}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="envelope" size={14} color="#3B82F6" solid />
                    <Text style={styles.detailLabel}>{t('users.email')}</Text>
                  </View>
                  <Text style={styles.detailValue}>{item.email}</Text>
                </View>
              )}

              {item.phoneNumber && (
                <View style={styles.detailRow}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="phone-alt" size={14} color="#27AE60" solid />
                    <Text style={styles.detailLabel}>{t('users.phoneNumber')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePhoneCall(item.phoneNumber)}>
                    <Text style={[styles.detailValue, styles.phoneLink]}>{item.phoneNumber}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isClient ? (
                <>
                  {isEditing ? (
                    <>
                      <View style={styles.detailRow}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="money-bill-wave" size={14} color="#27AE60" solid />
                          <Text style={styles.detailLabel}>{t('users.amountPaidCurrency')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.amountPaid}
                          onChangeText={(text) => setEditFormData({...editFormData, amountPaid: text})}
                          keyboardType="numeric"
                          style={styles.editInput}
                          placeholder="0"
                          placeholderTextColor="#64748b"
                        />
                      </View>

                      <View style={styles.detailRow}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="file-invoice-dollar" size={14} color="#F39C12" solid />
                          <Text style={styles.detailLabel}>{t('users.amountDueCurrency')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.amountDue}
                          onChangeText={(text) => setEditFormData({...editFormData, amountDue: text})}
                          keyboardType="numeric"
                          style={styles.editInput}
                          placeholder="0"
                          placeholderTextColor="#64748b"
                        />
                      </View>

                      <View style={styles.detailRow}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="book-open" size={14} color="#9B59B6" solid />
                          <Text style={styles.detailLabel}>{t('users.lessonCount')}</Text>
                        </View>
                        <TextInput
                          value={editFormData.lessonCount}
                          onChangeText={(text) => setEditFormData({...editFormData, lessonCount: text})}
                          keyboardType="numeric"
                          style={styles.editInput}
                          placeholder="0"
                          placeholderTextColor="#64748b"
                        />
                      </View>

                      <View style={styles.editButtonsRow}>
                        <TouchableOpacity
                          style={[styles.editButton, styles.saveButton]}
                          onPress={() => saveUserDetails(item.id)}
                        >
                          <FontAwesome5 name="save" size={14} color="#fff" solid />
                          <Text style={styles.editButtonText}>{t('common.save')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={cancelEditing}
                        >
                          <FontAwesome5 name="times" size={14} color="#fff" solid />
                          <Text style={styles.editButtonText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.detailRow}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="money-bill-wave" size={14} color="#27AE60" solid />
                          <Text style={styles.detailLabel}>{t('users.amountPaid')}</Text>
                        </View>
                        <Text style={[styles.detailValue, styles.paidText]}>₪{item.amountPaid || 0}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="file-invoice-dollar" size={14} color="#F39C12" solid />
                          <Text style={styles.detailLabel}>{t('users.amountDue')}</Text>
                        </View>
                        <Text style={[styles.detailValue, styles.dueText]}>₪{item.amountDue || 0}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="book-open" size={14} color="#9B59B6" solid />
                          <Text style={styles.detailLabel}>{t('users.lessonCount')}</Text>
                        </View>
                        <Text style={styles.detailValue}>{item.lessonCount || 0}</Text>
                      </View>

                      {/* Subscription Information */}
                      {item.hasSubscription && (
                        <View style={styles.subscriptionInfoCard}>
                          <View style={styles.subscriptionInfoHeader}>
                            <View style={styles.labelRow}>
                              <FontAwesome5 name="ticket-alt" size={14} color="#9B59B6" solid />
                              <Text style={styles.subscriptionInfoTitle}>{t('users.subscription')}</Text>
                            </View>
                            <View style={[styles.subscriptionStatusBadge, item.subscriptionActive && styles.subscriptionActiveBadge]}>
                              <Text style={styles.subscriptionStatusText}>
                                {item.subscriptionActive ? t('clientHome.active') : t('clientHome.expired')}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.subscriptionStats}>
                            <View style={styles.subscriptionStatItem}>
                              <Text style={styles.subscriptionStatLabel}>{t('users.remaining')}</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionLessons || 0}</Text>
                            </View>
                            <View style={styles.subscriptionStatDivider} />
                            <View style={styles.subscriptionStatItem}>
                              <Text style={styles.subscriptionStatLabel}>{t('users.used')}</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionUsedLessons || 0}</Text>
                            </View>
                            <View style={styles.subscriptionStatDivider} />
                            <View style={styles.subscriptionStatItem}>
                              <Text style={styles.subscriptionStatLabel}>{t('users.total')}</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionTotalLessons || 0}</Text>
                            </View>
                          </View>
                          {item.subscriptionStartDate && (
                            <Text style={styles.subscriptionDate}>
                              {t('users.startDate', { date: formatDate(item.subscriptionStartDate) })}
                            </Text>
                          )}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.editDetailsButton}
                        onPress={() => startEditing(item)}
                      >
                        <FontAwesome5 name="edit" size={14} color="#fff" solid />
                        <Text style={styles.editDetailsButtonText}>{t('users.editDetails')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="briefcase" size={14} color="#3B82F6" solid />
                      <Text style={styles.detailLabel}>{t('users.job')}</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.role || t('roles.worker')}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Client-specific: Next Lesson & Lesson History */}
            {isClient && nextLesson && (
              <View style={styles.nextLessonCard}>
                <View style={styles.labelRow}>
                  <FontAwesome5 name="bullseye" size={16} color="#E74C3C" solid />
                  <Text style={styles.sectionTitle}>{t('users.nextLesson')}</Text>
                </View>
                <View style={styles.lessonInfoRow}>
                  <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                  <Text style={styles.lessonInfoText}>{formatDate(nextLesson.date)} - {nextLesson.time}</Text>
                </View>
                <View style={styles.lessonInfoRow}>
                  <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
                  <Text style={styles.lessonInfoText}>{getHorseName(nextLesson.horseId)}</Text>
                </View>
              </View>
            )}

            {isClient && (upcomingLessons.length > 0 || pastLessons.length > 0) && (
              <View style={styles.lessonsSection}>
                {upcomingLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <View style={styles.lessonGroupHeader}>
                      <View style={styles.labelRow}>
                        <FontAwesome5 name="calendar-check" size={14} color="#3B82F6" solid />
                        <Text style={styles.lessonGroupTitle}>{t('users.upcomingLessons')}</Text>
                      </View>
                      <View style={styles.countBadgeSmall}>
                        <Text style={styles.countBadgeSmallText}>{upcomingLessons.length}</Text>
                      </View>
                    </View>
                    {upcomingLessons.slice(0, 3).map(lesson => (
                      <View key={lesson.id} style={styles.lessonItem}>
                        <View style={styles.lessonItemRow}>
                          <FontAwesome5 name="calendar-alt" size={12} color="#5DADE2" solid />
                          <Text style={styles.lessonItemText}>{formatDate(lesson.date)} - {lesson.time}</Text>
                        </View>
                        <View style={styles.lessonItemRow}>
                          <MaterialCommunityIcons name="horse-variant" size={14} color="#F39C12" />
                          <Text style={styles.lessonItemSubtext}>{getHorseName(lesson.horseId)}</Text>
                        </View>
                      </View>
                    ))}
                    {upcomingLessons.length > 3 && (
                      <Text style={styles.moreText}>{t('users.moreOtherLessons', { count: upcomingLessons.length - 3 })}</Text>
                    )}
                  </View>
                )}

                {pastLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <View style={styles.lessonGroupHeader}>
                      <View style={styles.labelRow}>
                        <FontAwesome5 name="scroll" size={14} color="#7C3AED" solid />
                        <Text style={styles.lessonGroupTitle}>{t('users.lessonHistory')}</Text>
                      </View>
                      <View style={[styles.countBadgeSmall, styles.countBadgePast]}>
                        <Text style={styles.countBadgeSmallText}>{pastLessons.length}</Text>
                      </View>
                    </View>
                    {pastLessons.slice(0, 3).map(lesson => (
                      <View key={lesson.id} style={[styles.lessonItem, styles.lessonItemPast]}>
                        <View style={styles.lessonItemRow}>
                          <FontAwesome5 name="check-circle" size={12} color="#27AE60" solid />
                          <Text style={styles.lessonItemText}>{formatDate(lesson.date)} - {lesson.time}</Text>
                        </View>
                        <View style={styles.lessonItemRow}>
                          <MaterialCommunityIcons name="horse-variant" size={14} color="#F39C12" />
                          <Text style={styles.lessonItemSubtext}>{getHorseName(lesson.horseId)}</Text>
                        </View>
                      </View>
                    ))}
                    {pastLessons.length > 3 && (
                      <Text style={styles.moreText}>{t('users.moreOtherLessons', { count: pastLessons.length - 3 })}</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FontAwesome5 name="history" size={14} color="#fff" solid />
                <Text style={styles.historyButtonText}>{t('users.viewHistory')}</Text>
              </View>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.id, item.name)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FontAwesome5 name="trash-alt" size={14} color="#E74C3C" solid />
                <Text style={styles.removeButtonText}>{isClient ? t('users.deleteClient') : t('users.deleteWorker')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </AnimatedCard>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header with Tabs */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FontAwesome5 name="users" size={24} color="#3B82F6" solid />
          <Text style={styles.pageTitle}>{t('users.title')}</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'clients' && styles.tabActive]}
            onPress={() => switchTab('clients')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive]}>
              {t('users.clientsTab')} ({clients.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workers' && styles.tabActive]}
            onPress={() => switchTab('workers')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'workers' && styles.tabTextActive]}>
              {t('users.workersTab')} ({(workerUsers || workers).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color={colors.text.secondary} solid style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('users.searchPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <FontAwesome5 name="times" size={14} color={colors.text.secondary} solid />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled={true}
        ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 
                name={activeTab === 'clients' ? 'users' : 'hard-hat'} 
                size={64} 
                color="#95A5A6" 
                solid 
              />
              <Text style={styles.emptyText}>
                {searchQuery ? t('users.noResults') : (activeTab === 'clients' ? t('users.noClientsYet') : t('users.noWorkersYet'))}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? t('users.tryOtherSearch') : (activeTab === 'clients' ? t('users.addFirstClient') : t('users.addFirstWorker'))}
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.formSection}>
              {/* Add New User Form */}
              <View style={styles.newUserForm}>
                <View style={styles.formTitleRow}>
                  <FontAwesome5 name="plus-circle" size={20} color="#27AE60" solid />
                  <Text style={styles.formTitle}>
                    {activeTab === 'clients' ? t('users.addNewClient') : t('users.addNewWorker')}
                  </Text>
                </View>
                <Text style={styles.formSubtitle}>{t('users.autoAccountNote')}</Text>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="user" size={14} color="#1ABC9C" solid />
                    <Text style={styles.label}>{t('users.nameLabel')}</Text>
                  </View>
                  <TextInput
                    value={newUserForm.name}
                    onChangeText={(text) => setNewUserForm({...newUserForm, name: text})}
                    placeholder={activeTab === 'clients' ? t('users.enterClientName') : t('users.enterWorkerName')}
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="envelope" size={14} color="#3B82F6" solid />
                    <Text style={styles.label}>{t('users.email')}</Text>
                  </View>
                  <TextInput
                    value={newUserForm.email}
                    onChangeText={(text) => setNewUserForm({...newUserForm, email: text})}
                    placeholder={t('users.enterEmail')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="phone-alt" size={14} color="#27AE60" solid />
                    <Text style={styles.label}>{t('users.phoneNumber')}</Text>
                  </View>
                  <TextInput
                    value={newUserForm.phone}
                    onChangeText={(text) => setNewUserForm({...newUserForm, phone: text})}
                    placeholder={t('users.enterPhone')}
                    keyboardType="phone-pad"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    returnKeyType="done"
                  />
                </View>

                {/* Subscription Section - Only for Clients */}
                {activeTab === 'clients' && (
                  <View style={styles.subscriptionSection}>
                    <View style={styles.subscriptionHeader}>
                      <View style={styles.labelRow}>
                        <FontAwesome5 name="ticket-alt" size={16} color="#9B59B6" solid />
                        <Text style={styles.subscriptionTitle}>{t('users.subscription')}</Text>
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
                      <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, newUserForm.hasSubscription && styles.checkboxChecked]}>
                          {newUserForm.hasSubscription && (
                            <FontAwesome5 name="check" size={14} color="#27AE60" solid />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>{t('users.hasSubscription')}</Text>
                      </View>
                    </TouchableOpacity>

                    {newUserForm.hasSubscription && (
                      <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                          <FontAwesome5 name="chart-bar" size={14} color="#E67E22" solid />
                          <Text style={styles.label}>{t('users.subscriptionLessonsCount')}</Text>
                        </View>
                        <TextInput
                          value={newUserForm.subscriptionLessons}
                          onChangeText={(text) => setNewUserForm({...newUserForm, subscriptionLessons: text})}
                          placeholder={t('users.subscriptionLessonsPlaceholder')}
                          keyboardType="number-pad"
                          placeholderTextColor="#64748b"
                          style={styles.input}
                          returnKeyType="done"
                        />
                        <Text style={styles.helpText}>
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
                  <Text style={styles.addButtonText}>
                    {isAddingUser ? t('users.adding') : `➕ ${activeTab === 'clients' ? t('users.addClient') : t('users.addWorker')}`}
                  </Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
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
    marginRight: spacing.sm,
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
    color: colors.text.muted,
  },
  contentContainer: {
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.info,
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
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarClient: {
    backgroundColor: colors.status.info,
  },
  avatarText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
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
    marginLeft: spacing.md,
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  lessonItemPast: {
    borderLeftColor: colors.text.muted,
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
    color: colors.text.muted,
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
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
    backgroundColor: colors.background.secondary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    zIndex: 1001,
    borderLeftWidth: 4,
  },
  toastSuccess: {
    borderLeftColor: colors.status.success,
  },
  toastError: {
    borderLeftColor: colors.status.error,
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
    marginRight: spacing.sm,
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
    color: colors.text.muted,
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
    color: colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UsersScreen;
