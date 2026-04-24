import React from 'react';
import { Text } from 'react-native';
import useRTL from '../hooks/useRTL';

/**
 * RTLText — Drop-in replacement for <Text> in blocks of translatable content.
 *
 * Automatically:
 *   • right-aligns text for Arabic / Hebrew
 *   • sets writingDirection so the Unicode bidi engine renders emojis and
 *     punctuation on the correct side of the text
 *   • left-aligns and uses LTR direction for English
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Emoji behaviour
 * ─────────────────────────────────────────────────────────────────────────────
 *  LTR  →  🏇 Race day notes...   (emoji at the start = LEFT)
 *  RTL  →  ...ملاحظات يوم السباق 🏇  (emoji at the start = RIGHT)
 *
 * Emojis are neutral characters in Unicode. writingDirection: 'rtl' pushes
 * them to the right (the logical start of the RTL run), which is exactly
 * what you want.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage
 * ─────────────────────────────────────────────────────────────────────────────
 *   // Simple replacement — no extra props needed
 *   <RTLText style={styles.notesValue}>{item.notes}</RTLText>
 *
 *   // Works with any <Text> prop
 *   <RTLText style={styles.emptyText} numberOfLines={2}>
 *     {t('horses.noHorsesYet')}
 *   </RTLText>
 *
 * Note: caller styles that hard-code textAlign will override this component's
 * direction. Remove hard-coded textAlign: 'center' / 'left' / 'right' from
 * those styles if you want RTLText to control alignment.
 */
const RTLText = ({ style, children, ...props }) => {
  const { textAlign, writingDirection } = useRTL();

  return (
    <Text
      style={[{ writingDirection, textAlign }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default RTLText;
