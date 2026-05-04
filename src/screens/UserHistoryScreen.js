import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenBackground from '../components/ScreenBackground';
import AppIcon from '../components/AppIcon';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import RTLText from '../components/RTLText';
import useRTL from '../hooks/useRTL';
import { useFadeIn } from '../utils/animations';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * UserHistoryScreen – full activity timeline for a single user.
 *
 * Route params:
 *   userId   – Firestore document id
 *   userName – display name
 *   userType – 'client' | 'worker'
 */
const UserHistoryScreen = ({ route }) => {
  const { userId, userName, userType } = route.params || {};
  const { lessons, missions, schedules, weeklySchedules, horses, clients, workerUsers, paymentHistory } = useContext(DataContext);
  const { t } = useTranslation();
  const { rowDirection, textAlign, writingDirection } = useRTL();
  const fadeStyle = useFadeIn(0);

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState('all'); // all | lessons | missions | schedules
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const toggleDate = (date) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // ── helpers ──────────────────────────────────────────────────────────
  const getHorseName = (id) => horses?.find(h => h.id === id)?.name || '';
  const getClientName = (id) => clients?.find(c => c.id === id)?.name || '';
  const getWorkerName = (id) => workerUsers?.find(w => w.id === id)?.name || '';

  const fmtDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
    } catch { return d; }
  };

  // Compute exact calendar date for a schedule task given weekStart and day key
  const getScheduleDate = (weekStart, dayKey) => {
    if (!weekStart) return weekStart;
    const dayMapping = { saturday: 0, sunday: 1, monday: 2, tuesday: 3, wednesday: 4, thursday: 5, friday: 6 };
    const offset = dayMapping[dayKey] ?? 0;
    const [y, m, d] = weekStart.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + offset);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // Status colours & icons
  const lessonStatusMeta = (status, confirmed) => {
    if (confirmed || status === 'completed') return { icon: 'checkmark-circle-outline', color: colors.status.success, label: t('userHistory.completed') };
    if (status === 'cancelled') return { icon: 'close-circle-outline', color: colors.status.error, label: t('userHistory.cancelled') };
    return { icon: 'time-outline', color: colors.status.info, label: t('userHistory.scheduled') };
  };

  // ── build unified timeline ──────────────────────────────────────────
  const timeline = useMemo(() => {
    const items = [];

    // --- Lessons ---
    const userLessons = userType === 'client'
      ? lessons.filter(l => l.clientId === userId)
      : lessons.filter(l => l.instructorId === userId);

    userLessons.forEach(l => {
      items.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        date: l.date,
        time: l.time,
        status: l.status,
        confirmed: l.confirmed,
        isClinicLesson: l.isClinicLesson || false,
        horseName: getHorseName(l.horseId),
        partnerName: userType === 'client' ? getWorkerName(l.instructorId) : getClientName(l.clientId),
        partnerRole: userType === 'client' ? t('userHistory.instructor') : t('userHistory.client'),
        raw: l,
      });
    });

    // --- Missions (workers) ---
    if (userType === 'worker') {
      const userMissions = missions.filter(m => m.workerId === userId);
      userMissions.forEach(m => {
        // Skip auto-generated lesson missions to avoid duplicates
        if (m.type === 'lesson') return;

        items.push({
          id: `mission-${m.id}`,
          type: 'mission',
          date: m.dueDate,
          time: m.time || '',
          title: m.title,
          description: m.description,
          completed: m.completed,
          priority: m.priority,
          raw: m,
        });
      });

      // --- Weekly schedule tasks (workers) ---
      const userWeekly = weeklySchedules.filter(s => s.workerId === userId && s.type !== 'lesson');
      userWeekly.forEach(s => {
        items.push({
          id: `weekly-${s.id}`,
          type: 'schedule',
          date: getScheduleDate(s.weekStart, s.day),
          time: s.timeSlot || '',
          day: s.day,
          description: s.description,
          raw: s,
        });
      });
    }

    // --- Payments (clients) ---
    if (userType === 'client') {
      const userPayments = (paymentHistory || []).filter(p => p.clientId === userId);
      userPayments.forEach(p => {
        items.push({
          id: `payment-${p.id}`,
          type: 'payment',
          date: p.date || '',
          time: p.time || '',
          amount: p.amount,
          totalAfter: p.totalAfter,
          amountDue: p.amountDue,
          raw: p,
        });
      });
    }

    // Sort by date descending, then time descending
    items.sort((a, b) => {
      const dc = (b.date || '').localeCompare(a.date || '');
      if (dc !== 0) return dc;
      return (b.time || '').localeCompare(a.time || '');
    });

    return items;
  }, [userId, userType, lessons, missions, weeklySchedules, horses, clients, workerUsers, paymentHistory]);

  // ── filter ──────────────────────────────────────────────────────────
  const filteredTimeline = useMemo(() => {
    if (activeFilter === 'all') return timeline;
    return timeline.filter(i => i.type === activeFilter);
  }, [timeline, activeFilter]);

  // ── worker: date-grouped flat list with consecutive schedule merging ─
  const workerFlatList = useMemo(() => {
    if (userType !== 'worker') return [];

    const addHour = (t) => {
      if (!t) return t;
      const [h, m] = t.split(':').map(Number);
      return `${String(h + 1).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
    };

    // Group by date
    const byDate = {};
    filteredTimeline.forEach(item => {
      const d = item.date || '';
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(item);
    });

    const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    const flat = [];

    sortedDates.forEach(date => {
      const dayItems = byDate[date];
      const schedItems = dayItems.filter(i => i.type === 'schedule');
      const otherItems = dayItems.filter(i => i.type !== 'schedule');

      // Merge consecutive same-description schedule slots
      const mergedSchedules = [];
      if (schedItems.length > 0) {
        const sorted = [...schedItems].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        let i = 0;
        while (i < sorted.length) {
          const cur = sorted[i];
          let endTime = addHour(cur.time);
          let j = i + 1;
          while (
            j < sorted.length &&
            sorted[j].description === cur.description &&
            sorted[j].time === endTime
          ) {
            endTime = addHour(sorted[j].time);
            j++;
          }
          mergedSchedules.push({
            ...cur,
            id: j > i + 1 ? `merged-sched-${date}-${i}` : cur.id,
            timeRange: j > i + 1 ? `${cur.time} - ${endTime}` : null,
          });
          i = j;
        }
      }

      const allItems = [...otherItems, ...mergedSchedules].sort((a, b) =>
        (a.time || '').localeCompare(b.time || '')
      );

      flat.push({ _listType: 'header', id: `header-${date}`, date, count: allItems.length });
      if (expandedDates.has(date)) {
        allItems.forEach(item => flat.push({ ...item, _listType: 'item' }));
      }
    });

    return flat;
  }, [userType, filteredTimeline, expandedDates]);

  // ── stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const lessonItems = timeline.filter(i => i.type === 'lesson');
    const completedLessons = lessonItems.filter(i => i.confirmed || i.status === 'completed').length;
    const cancelledLessons = lessonItems.filter(i => i.status === 'cancelled').length;
    const scheduledLessons = lessonItems.filter(i => i.status === 'scheduled' && !i.confirmed).length;
    const missionItems = timeline.filter(i => i.type === 'mission');
    const completedMissions = missionItems.filter(i => i.completed).length;
    const scheduleItems = timeline.filter(i => i.type === 'schedule');
    const paymentItems = timeline.filter(i => i.type === 'payment');
    const totalPaymentAmount = paymentItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    return {
      totalLessons: lessonItems.length,
      completedLessons,
      cancelledLessons,
      scheduledLessons,
      totalMissions: missionItems.length,
      completedMissions,
      totalSchedules: scheduleItems.length,
      totalPayments: paymentItems.length,
      totalPaymentAmount,
      totalItems: timeline.length,
    };
  }, [timeline]);

  // ── filter chips ────────────────────────────────────────────────────
  const filters = useMemo(() => {
    const base = [
      { key: 'all', label: t('userHistory.all'), count: stats.totalItems, icon: 'list-outline' },
      { key: 'lesson', label: t('userHistory.lessons'), count: stats.totalLessons, icon: 'book-outline' },
    ];
    if (userType === 'worker') {
      base.push({ key: 'mission', label: t('userHistory.missions'), count: stats.totalMissions, icon: 'checkbox-outline' });
      base.push({ key: 'schedule', label: t('userHistory.schedules'), count: stats.totalSchedules, icon: 'calendar-outline' });
    }
    if (userType === 'client') {
      base.push({ key: 'payment', label: t('userHistory.payments'), count: stats.totalPayments, icon: 'cash-outline' });
    }
    return base;
  }, [userType, stats]);

  // ── PDF export ──────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const lessonItems = timeline.filter(i => i.type === 'lesson');
      const paymentItems = timeline.filter(i => i.type === 'payment');
      const missionItems = timeline.filter(i => i.type === 'mission');

      const lessonRows = lessonItems.length > 0
        ? lessonItems.map(l => `<tr><td>${fmtDate(l.date)}</td><td>${l.time || '-'}</td><td>${l.horseName || '-'}</td><td>${l.partnerName || '-'}</td><td>${l.confirmed || l.status === 'completed' ? 'Completed' : (l.status === 'cancelled' ? 'Cancelled' : l.status || '-')}</td></tr>`).join('')
        : '<tr><td colspan="5" style="text-align:center;color:#999">No records</td></tr>';

      const paymentRows = paymentItems.length > 0
        ? paymentItems.map(p => `<tr><td>${fmtDate(p.date)}</td><td>&#8362;${p.amount || 0}</td><td>&#8362;${p.totalAfter ?? '-'}</td></tr>`).join('')
        : '<tr><td colspan="3" style="text-align:center;color:#999">No records</td></tr>';

      const missionRows = missionItems.length > 0
        ? missionItems.map(m => `<tr><td>${fmtDate(m.date)}</td><td>${m.title || '-'}</td><td>${m.completed ? 'Done' : 'Pending'}</td></tr>`).join('')
        : '';

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>User History</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1a2e}h1{font-size:22px;margin-bottom:4px}h2{font-size:16px;margin:20px 0 8px;border-bottom:2px solid #2563EB;padding-bottom:4px;color:#2563EB}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{background:#2563EB;color:white;padding:8px;text-align:left;font-size:13px}td{padding:7px 8px;font-size:12px;border-bottom:1px solid #eee}tr:nth-child(even) td{background:#f7f9fc}</style></head><body><h1>${userName || 'User'}</h1><p style="color:#666;font-size:13px">${userType === 'client' ? 'Client' : 'Worker'}</p><h2>Lessons (${lessonItems.length})</h2><table><thead><tr><th>Date</th><th>Time</th><th>Horse</th><th>${userType === 'client' ? 'Instructor' : 'Client'}</th><th>Status</th></tr></thead><tbody>${lessonRows}</tbody></table>${userType === 'client' ? `<h2>Payments (${paymentItems.length})</h2><table><thead><tr><th>Date</th><th>Amount</th><th>Total Paid</th></tr></thead><tbody>${paymentRows}</tbody></table>` : (missionItems.length > 0 ? `<h2>Missions (${missionItems.length})</h2><table><thead><tr><th>Date</th><th>Title</th><th>Status</th></tr></thead><tbody>${missionRows}</tbody></table>` : '')}</body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `${userName || 'User'} History` });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // ── day key helper ─────────────────────────────────────────────────
  const translateDay = (dayKey) => {
    const map = {
      saturday: t('userHistory.saturday'),
      sunday: t('userHistory.sunday'),
      monday: t('userHistory.monday'),
      tuesday: t('userHistory.tuesday'),
      wednesday: t('userHistory.wednesday'),
      thursday: t('userHistory.thursday'),
      friday: t('userHistory.friday'),
    };
    return map[dayKey] || dayKey;
  };

  // ── date section header ─────────────────────────────────────────────
  const renderDateHeader = (item) => {
    const isOpen = expandedDates.has(item.date);
    let label = fmtDate(item.date);
    try {
      const dt = new Date(item.date);
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      label = `${translateDay(dayKeys[dt.getDay()])}, ${fmtDate(item.date)}`;
    } catch {}
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => toggleDate(item.date)}
        activeOpacity={0.7}
        style={[styles.dateSectionHeader, isOpen && styles.dateSectionHeaderOpen, { flexDirection: rowDirection }]}
      >
        <AppIcon name="today-outline" size={14} color={colors.accent.teal} />
        <Text style={[styles.dateSectionText, { writingDirection, textAlign, flex: 1 }]}>{label}</Text>
        <View style={styles.dateSectionBadge}>
          <Text style={styles.dateSectionBadgeText}>{item.count}</Text>
        </View>
        <AppIcon
          name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={12}
          color={colors.text.tertiary}
        />
      </TouchableOpacity>
    );
  };

  // ── render a single timeline card ──────────────────────────────────
  const renderItem = ({ item, index }) => {
    if (item._listType === 'header') return renderDateHeader(item);
    if (item.type === 'lesson') return renderLessonCard(item, index);
    if (item.type === 'mission') return renderMissionCard(item, index);
    if (item.type === 'schedule') return renderScheduleCard(item, index);
    if (item.type === 'payment') return renderPaymentCard(item, index);
    return null;
  };

  const renderLessonCard = (item, index) => {
    const meta = lessonStatusMeta(item.status, item.confirmed);
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: meta.color }]}>
        {/* Type badge */}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent.purple }]}>
            <AppIcon name="book-outline" size={10} color={colors.text.primary} />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.lesson')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.color }]}>
            <AppIcon name={meta.icon} size={10} color={colors.text.primary} />
            <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}>{meta.label}</Text>
          </View>
          {item.isClinicLesson && (
            <View style={[styles.statusBadge, { backgroundColor: '#9B59B6' }]}>
              <AppIcon name="ticket-outline" size={10} color={colors.text.primary} />
              <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}>{t('lessons.clinicBadge')}</Text>
            </View>
          )}
        </View>

        {/* Date + time */}
        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <AppIcon name="calendar-outline" size={14} color={colors.accent.teal} />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>
            {userType === 'worker' ? item.time : `${fmtDate(item.date)}  •  ${item.time}`}
          </Text>
        </View>

        {/* Horse */}
        {item.horseName ? (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <AppIcon name="paw-outline" size={16} color={colors.status.warning} />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{item.horseName}</Text>
          </View>
        ) : null}

        {/* Partner (instructor or client) */}
        {item.partnerName ? (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <AppIcon name="person-outline" size={13} color={colors.primary.light} />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{item.partnerRole} <Text style={{ fontWeight: typography.weight.bold, color: colors.text.primary }}>{item.partnerName}</Text></Text>
          </View>
        ) : null}
      </AnimatedCard>
    );
  };

  const renderMissionCard = (item, index) => {
    const done = item.completed;
    const priorityColor = item.priority === 'high' ? colors.status.error : item.priority === 'medium' ? colors.status.warning : colors.status.info;
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: done ? colors.status.success : priorityColor }]}>
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent.amber }]}>
            <AppIcon name="checkbox-outline" size={10} color={colors.text.primary} />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.mission')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: done ? colors.status.success : colors.text.muted }]}>
            <AppIcon name={done ? 'checkmark-circle-outline' : 'hourglass-outline'} size={10} color={colors.text.primary} />
            <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}>{done ? t('userHistory.completed') : t('userHistory.pending')}</Text>
          </View>
        </View>

        <RTLText style={styles.missionTitle}>{item.title}</RTLText>
        {item.description ? <RTLText style={styles.missionDesc}>{item.description}</RTLText> : null}

        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <AppIcon name="calendar-outline" size={14} color={colors.accent.teal} />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>
            {userType === 'worker' ? (item.time || '') : `${fmtDate(item.date)}${item.time ? `  •  ${item.time}` : ''}`}
          </Text>
        </View>
      </AnimatedCard>
    );
  };

  const renderPaymentCard = (item, index) => {
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: colors.status.success }]}>
        {/* Type badge */}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.status.success }]}>
            <AppIcon name="cash-outline" size={10} color={colors.text.primary} />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.payment')}</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <AppIcon name="cash-outline" size={14} color={colors.status.success} />
          <Text style={[styles.cardRowText, { fontWeight: 'bold', fontSize: typography.size.lg, color: colors.status.success }]}>
            {item.amount} ₪
          </Text>
        </View>

        {/* Total after payment */}
        {item.totalAfter != null && (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <AppIcon name="wallet-outline" size={14} color={colors.primary.light} />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{t('userHistory.totalAfterPayment')} <Text style={{ fontWeight: typography.weight.bold }}>{item.totalAfter} ₪</Text></Text>
          </View>
        )}

        {/* Amount due */}
        {item.amountDue != null && (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <AppIcon name="document-text-outline" size={14} color={colors.status.warning} />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{t('userHistory.amountDue')} <Text style={{ fontWeight: typography.weight.bold }}>{item.amountDue} ₪</Text></Text>
          </View>
        )}

        {/* Date + time */}
        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <AppIcon name="calendar-outline" size={14} color={colors.accent.teal} />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{fmtDate(item.date)}{item.time ? `  •  ${item.time}` : ''}</Text>
        </View>
      </AnimatedCard>
    );
  };

  const renderScheduleCard = (item, index) => {
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: colors.accent.teal }]}>
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent.teal }]}>
            <AppIcon name="calendar-outline" size={10} color={colors.text.primary} />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.scheduleTask')}</Text>
          </View>
        </View>

        {item.description ? <RTLText style={styles.missionTitle}>{item.description}</RTLText> : null}

        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <AppIcon name="time-outline" size={14} color={colors.accent.teal} />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{item.timeRange || item.time}</Text>
        </View>
      </AnimatedCard>
    );
  };

  // ── main render ─────────────────────────────────────────────────────
  return (
    <ScreenBackground edges={['bottom']}>
      {/* User header */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, userType === 'client' ? styles.avatarClient : styles.avatarWorker]}>
            <Text style={[styles.avatarText, { writingDirection, textAlign }]}>{userName?.charAt(0) || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <RTLText style={styles.userName}>{userName}</RTLText>
            <RTLText style={styles.userRole}>
              {userType === 'client' ? t('userHistory.clientRole') : t('userHistory.workerRole')}
            </RTLText>
          </View>
          <View style={styles.statCard}>
            <AppIcon name="book-outline" size={16} color={colors.accent.purple} />
            <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.totalLessons}</Text>
            <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.lessons')}</Text>
          </View>
          {userType === 'worker' ? (
            <View style={styles.statCard}>
              <AppIcon name="checkbox-outline" size={16} color={colors.accent.amber} />
              <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.totalMissions}</Text>
              <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.missions')}</Text>
            </View>
          ) : (
            <View style={styles.statCard}>
              <AppIcon name="cash-outline" size={16} color={colors.status.success} />
              <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.totalPayments}</Text>
              <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.payments')}</Text>
            </View>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <AppIcon name={f.icon} size={12} color={activeFilter === f.key ? colors.text.primary : colors.text.tertiary} />
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive, { writingDirection, textAlign }]}>
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export button */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportPDF}
          disabled={isExporting}
          activeOpacity={0.7}
        >
          {isExporting
            ? <ActivityIndicator size="small" color={colors.text.primary} />
            : <AppIcon name="share-outline" size={16} color={colors.text.primary} />}
          <Text style={styles.exportButtonText}>{isExporting ? t('common.loading') : t('common.export')}</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline list */}
      <FlatList
        data={userType === 'worker' ? workerFlatList : filteredTimeline}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AppIcon name="journal-outline" size={56} color={colors.text.muted} />
            <RTLText style={styles.emptyText}>{t('userHistory.noHistory')}</RTLText>
            <RTLText style={styles.emptySubtext}>{t('userHistory.noHistoryDesc')}</RTLText>
          </View>
        }
      />
    </ScreenBackground>
  );
};

// ── styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: spacing.base,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClient: {
    backgroundColor: colors.status.info,
  },
  avatarWorker: {
    backgroundColor: colors.accent.pink,
  },
  avatarText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  userName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  userRole: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  filterChipTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },

  // Timeline list
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  timelineCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderStartWidth: 4,
    ...shadows.md,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  weekIdText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardRowText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  missionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  missionDesc: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },

  // Date section header (worker grouped view)
  dateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  dateSectionHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: colors.accent.teal,
    borderBottomWidth: 2,
  },
  dateSectionText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  dateSectionBadge: {
    backgroundColor: colors.accent.teal,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  dateSectionBadgeText: {
    color: colors.text.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
  },
  exportButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});

export default UserHistoryScreen;
