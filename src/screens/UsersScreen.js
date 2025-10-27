import React, { useContext, useState, useMemo, useRef } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

/**
 * UsersScreen - Unified section for managing both Clients and Workers
 * Features: Tabs, Search/Filter, Collapsible items, Create/Edit/Delete for both types
 */
const UsersScreen = () => {
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

  // Scroll and Refresh
  const flatListRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
  const getHorseName = (id) => horses?.find((h) => h.id === id)?.name || 'غير معروف';

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

  // Pull to Refresh Handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - data already syncs in real-time via Firebase
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
    showToastNotification('✅ تم تحديث البيانات', 'success');
  };

  // Scroll to Top
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Handle Scroll Event
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  // Tab Switching
  const switchTab = (tab) => {
    setActiveTab(tab);
    setExpandedUserId(null);
    setEditingUserId(null);
    setSearchQuery('');
    scrollToTop();
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
    setLoadingMessage('جاري الحفظ...');

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
        showToastNotification('✅ تم تحديث بيانات العميل بنجاح', 'success');
        setEditingUserId(null);
        setEditFormData({});
      } else {
        showToastNotification(result.error || 'فشل تحديث البيانات', 'error');
      }
    } else {
      // For workers, we can add update functionality if needed
      setIsLoading(false);
      showToastNotification('✅ تم تحديث بيانات العامل بنجاح', 'success');
      setEditingUserId(null);
      setEditFormData({});
    }
  };

  // Delete Functions
  const handleRemoveUser = (id, name) => {
    const userType = activeTab === 'clients' ? 'العميل' : 'العامل';
    Alert.alert(
      `حذف ${userType}`,
      `هل أنت متأكد أنك تريد حذف ${name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setLoadingMessage('جاري الحذف...');

            const result = activeTab === 'clients'
              ? await removeClient(id)
              : await removeWorker(id);

            setIsLoading(false);
            if (result.success) {
              showToastNotification(`✅ تم حذف ${userType} بنجاح`, 'success');
              setExpandedUserId(null);
            } else {
              showToastNotification(result.error || `فشل حذف ${userType}`, 'error');
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
      Alert.alert('خطأ', 'يرجى إدخال الاسم');
      return;
    }
    if (!newUserForm.email.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (!newUserForm.phone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return;
    }

    // Validate subscription data for clients
    if (activeTab === 'clients' && newUserForm.hasSubscription) {
      const subscriptionCount = parseInt(newUserForm.subscriptionLessons);
      if (isNaN(subscriptionCount) || subscriptionCount <= 0) {
        Alert.alert('خطأ', 'يرجى إدخال عدد صحيح من الدروس للاشتراك');
        return;
      }
    }

    setIsAddingUser(true);
    setIsLoading(true);
    setLoadingMessage('جاري الإضافة...');

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
      const userType = activeTab === 'clients' ? 'العميل' : 'العامل';
      showToastNotification(`✅ تم إضافة ${userType} ${newUserForm.name} بنجاح`, 'success');
      setNewUserForm({ name: '', email: '', phone: '', hasSubscription: false, subscriptionLessons: '' });
    } else {
      showToastNotification(result.error || 'فشل الإضافة', 'error');
    }
  };

  // Render Functions
  const renderUserCard = ({ item }) => {
    const isExpanded = expandedUserId === item.id;
    const isEditing = editingUserId === item.id;
    const isClient = activeTab === 'clients';

    // Get lesson info for clients
    const pastLessons = isClient ? getPastLessons(item.id) : [];
    const upcomingLessons = isClient ? getUpcomingLessons(item.id) : [];
    const nextLesson = upcomingLessons[0];

    return (
      <Animated.View style={styles.card}>
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
                    <Text style={styles.userMetaText}>📞 {item.phoneNumber}</Text>
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
              <Text style={styles.detailsTitle}>📋 المعلومات الأساسية</Text>

              {item.email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📧 البريد الإلكتروني</Text>
                  <Text style={styles.detailValue}>{item.email}</Text>
                </View>
              )}

              {item.phoneNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📞 رقم الهاتف</Text>
                  <Text style={styles.detailValue}>{item.phoneNumber}</Text>
                </View>
              )}

              {isClient ? (
                <>
                  {isEditing ? (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>💵 المبلغ المدفوع (₪)</Text>
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
                        <Text style={styles.detailLabel}>📋 المبلغ المستحق (₪)</Text>
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
                        <Text style={styles.detailLabel}>📚 عدد الدروس</Text>
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
                          <Text style={styles.editButtonText}>💾 حفظ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.editButtonText}>✖️ إلغاء</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>💵 المبلغ المدفوع</Text>
                        <Text style={[styles.detailValue, styles.paidText]}>₪{item.amountPaid || 0}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📋 المبلغ المستحق</Text>
                        <Text style={[styles.detailValue, styles.dueText]}>₪{item.amountDue || 0}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📚 عدد الدروس</Text>
                        <Text style={styles.detailValue}>{item.lessonCount || 0}</Text>
                      </View>

                      {/* Subscription Information */}
                      {item.hasSubscription && (
                        <View style={styles.subscriptionInfoCard}>
                          <View style={styles.subscriptionInfoHeader}>
                            <Text style={styles.subscriptionInfoTitle}>🎫 اشتراك العيادة</Text>
                            <View style={[styles.subscriptionStatusBadge, item.subscriptionActive && styles.subscriptionActiveBadge]}>
                              <Text style={styles.subscriptionStatusText}>
                                {item.subscriptionActive ? '✓ نشط' : '✕ منتهي'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.subscriptionStats}>
                            <View style={styles.subscriptionStatItem}>
                              <Text style={styles.subscriptionStatLabel}>المتبقي</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionLessons || 0}</Text>
                            </View>
                            <View style={styles.subscriptionStatDivider} />
                            <View style={styles.subscriptionStatItem}>
                              <Text style={styles.subscriptionStatLabel}>المستخدم</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionUsedLessons || 0}</Text>
                            </View>
                            <View style={styles.subscriptionStatDivider} />
                            <View style={styles.subscriptionStatItem}>
                              <Text style={styles.subscriptionStatLabel}>الإجمالي</Text>
                              <Text style={styles.subscriptionStatValue}>{item.subscriptionTotalLessons || 0}</Text>
                            </View>
                          </View>
                          {item.subscriptionStartDate && (
                            <Text style={styles.subscriptionDate}>
                              تاريخ البدء: {formatDate(item.subscriptionStartDate)}
                            </Text>
                          )}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.editDetailsButton}
                        onPress={() => startEditing(item)}
                      >
                        <Text style={styles.editDetailsButtonText}>✏️ تعديل البيانات</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💼 الوظيفة</Text>
                    <Text style={styles.detailValue}>{item.role || 'عامل'}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Client-specific: Next Lesson & Lesson History */}
            {isClient && nextLesson && (
              <View style={styles.nextLessonCard}>
                <Text style={styles.sectionTitle}>🎯 الدرس القادم</Text>
                <Text style={styles.lessonInfoText}>📅 {formatDate(nextLesson.date)} - {nextLesson.time}</Text>
                <Text style={styles.lessonInfoText}>🐴 {getHorseName(nextLesson.horseId)}</Text>
              </View>
            )}

            {isClient && (upcomingLessons.length > 0 || pastLessons.length > 0) && (
              <View style={styles.lessonsSection}>
                {upcomingLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <View style={styles.lessonGroupHeader}>
                      <Text style={styles.lessonGroupTitle}>📅 الدروس القادمة</Text>
                      <View style={styles.countBadgeSmall}>
                        <Text style={styles.countBadgeSmallText}>{upcomingLessons.length}</Text>
                      </View>
                    </View>
                    {upcomingLessons.slice(0, 3).map(lesson => (
                      <View key={lesson.id} style={styles.lessonItem}>
                        <Text style={styles.lessonItemText}>📅 {formatDate(lesson.date)} - {lesson.time}</Text>
                        <Text style={styles.lessonItemSubtext}>🐴 {getHorseName(lesson.horseId)}</Text>
                      </View>
                    ))}
                    {upcomingLessons.length > 3 && (
                      <Text style={styles.moreText}>و {upcomingLessons.length - 3} دروس أخرى...</Text>
                    )}
                  </View>
                )}

                {pastLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <View style={styles.lessonGroupHeader}>
                      <Text style={styles.lessonGroupTitle}>📜 سجل الدروس</Text>
                      <View style={[styles.countBadgeSmall, styles.countBadgePast]}>
                        <Text style={styles.countBadgeSmallText}>{pastLessons.length}</Text>
                      </View>
                    </View>
                    {pastLessons.slice(0, 3).map(lesson => (
                      <View key={lesson.id} style={[styles.lessonItem, styles.lessonItemPast]}>
                        <Text style={styles.lessonItemText}>✓ {formatDate(lesson.date)} - {lesson.time}</Text>
                        <Text style={styles.lessonItemSubtext}>🐴 {getHorseName(lesson.horseId)}</Text>
                      </View>
                    ))}
                    {pastLessons.length > 3 && (
                      <Text style={styles.moreText}>و {pastLessons.length - 3} دروس أخرى...</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveUser(item.id, item.name)}
            >
              <Text style={styles.removeButtonText}>🗑️ حذف {isClient ? 'العميل' : 'العامل'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
        {/* Header with Tabs */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>👥 المستخدمين</Text>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'clients' && styles.tabActive]}
              onPress={() => switchTab('clients')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive]}>
                العملاء ({clients.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'workers' && styles.tabActive]}
              onPress={() => switchTab('workers')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'workers' && styles.tabTextActive]}>
                العمال ({(workerUsers || workers).length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User List */}
        <FlatList
          ref={flatListRef}
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main, colors.accent.purple]}
              tintColor={colors.primary.main}
              title="جاري التحديث..."
              titleColor={colors.text.secondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>{activeTab === 'clients' ? '👥' : '👷'}</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'لا توجد نتائج' : `لا يوجد ${activeTab === 'clients' ? 'عملاء' : 'عمال'} بعد`}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'جرب البحث بكلمات أخرى' : `أضف أول ${activeTab === 'clients' ? 'عميل' : 'عامل'} أدناه`}
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.formSection}>
              {/* Add New User Form */}
              <View style={styles.newUserForm}>
                <Text style={styles.formTitle}>
                  ➕ إضافة {activeTab === 'clients' ? 'عميل' : 'عامل'} جديد
                </Text>
                <Text style={styles.formSubtitle}>سيتم إنشاء حساب تلقائياً مع رقم الهاتف ككلمة مرور</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>👤 الاسم</Text>
                  <TextInput
                    value={newUserForm.name}
                    onChangeText={(text) => setNewUserForm({...newUserForm, name: text})}
                    placeholder={`أدخل اسم ${activeTab === 'clients' ? 'العميل' : 'العامل'}`}
                    placeholderTextColor="#64748b"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>📧 البريد الإلكتروني</Text>
                  <TextInput
                    value={newUserForm.email}
                    onChangeText={(text) => setNewUserForm({...newUserForm, email: text})}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>📞 رقم الهاتف</Text>
                  <TextInput
                    value={newUserForm.phone}
                    onChangeText={(text) => setNewUserForm({...newUserForm, phone: text})}
                    placeholder="أدخل رقم الهاتف"
                    keyboardType="phone-pad"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                  />
                </View>

                {/* Subscription Section - Only for Clients */}
                {activeTab === 'clients' && (
                  <View style={styles.subscriptionSection}>
                    <View style={styles.subscriptionHeader}>
                      <Text style={styles.subscriptionTitle}>🎫 اشتراك العيادة</Text>
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
                          {newUserForm.hasSubscription && <Text style={styles.checkboxIcon}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>لديه اشتراك من العيادة</Text>
                      </View>
                    </TouchableOpacity>

                    {newUserForm.hasSubscription && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>📊 عدد الدروس في الاشتراك</Text>
                        <TextInput
                          value={newUserForm.subscriptionLessons}
                          onChangeText={(text) => setNewUserForm({...newUserForm, subscriptionLessons: text})}
                          placeholder="مثال: 10"
                          keyboardType="number-pad"
                          placeholderTextColor="#64748b"
                          style={styles.input}
                        />
                        <Text style={styles.helpText}>
                          سيتم خصم درس من الاشتراك عند تأكيد كل درس مكتمل
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
                    {isAddingUser ? 'جاری الإضافة...' : `➕ إضافة ${activeTab === 'clients' ? 'عميل' : 'عامل'}`}
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

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <Text style={styles.scrollToTopText}>⬆</Text>
          </TouchableOpacity>
        )}
        </View>
      </TouchableWithoutFeedback>
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
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
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
  userMetaText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
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
  detailsTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    flex: 1,
    textAlign: 'right',
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
    flex: 1,
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
  lessonItemText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
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
  scrollToTopButton: {
    position: 'absolute',
    bottom: spacing.xxxl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
    zIndex: 999,
    elevation: 8,
  },
  scrollToTopText: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
});

export default UsersScreen;
