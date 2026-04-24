import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useRTL from '../hooks/useRTL';

/**
 * RTLRow — The single reusable component for every [icon][label:][value] row.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Visual layout by language direction
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  LTR (English)
 *    [🐴] [Breed:]                         [Arabian]
 *
 *  RTL (Arabic / Hebrew)
 *    [عربي]                         [:النوع] [🐴]
 *
 * The colon stays attached to the label word on the correct side in both
 * directions because the <Text> uses writingDirection, which overrides the
 * Unicode bidi algorithm — the colon can no longer "jump" to the wrong side.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Props
 * ─────────────────────────────────────────────────────────────────────────────
 * @param {ReactNode}        icon        Icon element (FontAwesome5, MaterialCommunityIcons …)
 * @param {string}           label       Label text — do NOT include the colon, RTLRow handles it
 * @param {string|ReactNode} [value]     Value to show on the opposite side.
 *                                       Omit to render a label-only row (section headers, etc.)
 * @param {boolean}          [showColon=true]  Set false to suppress the colon (date/time helper rows)
 * @param {object}           [labelStyle]      Extra style for the label <Text>
 * @param {object}           [valueStyle]      Extra style for the value <Text>
 * @param {object}           [style]           Extra style for the outer container <View>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage examples
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * // Full data row
 * <RTLRow
 *   icon={<MaterialCommunityIcons name="horse" size={16} color="#E67E22" />}
 *   label={t('horses.breed')}
 *   value={item.breed}
 *   labelStyle={styles.cardLabel}
 *   valueStyle={styles.cardValue}
 *   style={styles.cardRow}
 * />
 *
 * // Section header (no value)
 * <RTLRow
 *   icon={<FontAwesome5 name="bell" size={16} color="#F39C12" solid />}
 *   label={t('horses.reminders')}
 *   showColon={false}
 *   labelStyle={styles.sectionTitle}
 * />
 *
 * // Icon + text without a label (e.g. date display row)
 * <RTLRow
 *   icon={<FontAwesome5 name="calendar-alt" size={12} color="#5DADE2" solid />}
 *   label=""
 *   value={reminder.date}
 *   showColon={false}
 *   valueStyle={styles.reminderDate}
 *   style={styles.reminderDateRow}
 * />
 */
const RTLRow = ({
  icon,
  label,
  value,
  showColon = true,
  labelStyle,
  valueStyle,
  style,
}) => {
  const { rowDirection, textAlign, writingDirection } = useRTL();

  // Build the label string with colon. In RTL the colon is appended the
  // same way as LTR — writingDirection in the Text style causes the
  // Unicode bidi algorithm to render it on the visually correct side
  // automatically (left side for RTL, right side for LTR).
  const labelText = showColon && label ? `${label}:` : label;

  return (
    <View
      // The outer container flips direction; this moves the value to the
      // visually "far" side and the label group to the "near" side.
      style={[styles.container, { flexDirection: rowDirection }, style]}
    >
      {/* ── Label group: [icon][label:] ──────────────────────────────────── */}
      {/* In RTL (row-reverse) this group renders on the RIGHT of the screen  */}
      {/* and internally its children also reverse: [:label][icon]            */}
      {(icon != null || label) && (
        <View style={[styles.labelGroup, { flexDirection: rowDirection }]}>
          {icon}
          {labelText !== '' && labelText != null && (
            <Text style={[styles.labelText, labelStyle, { writingDirection, textAlign }]}>
              {labelText}
            </Text>
          )}
        </View>
      )}

      {/* ── Value ─────────────────────────────────────────────────────────── */}
      {/* In RTL (row-reverse) this renders on the LEFT of the screen         */}
      {value != null && (
        typeof value === 'string' || typeof value === 'number' ? (
          <Text
            style={[styles.valueText, valueStyle, { writingDirection, textAlign }]}
          >
            {String(value)}
          </Text>
        ) : (
          value
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelGroup: {
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  labelText: {
    // Caller provides font/color via labelStyle
  },
  valueText: {
    flex: 1,
    // Caller provides font/color via valueStyle
  },
});

export default RTLRow;
