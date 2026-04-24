import { useTranslation } from '../i18n/LanguageContext';

/**
 * Languages that use Right-to-Left script.
 * Add more ISO codes here as needed (e.g. 'fa', 'ur').
 */
const RTL_LANGUAGES = ['ar', 'he'];

/**
 * useRTL — Global hook for direction-aware layout.
 *
 * Returns a set of style primitives that flip automatically when the
 * active language is Arabic or Hebrew. Use these values to drive
 * flexDirection, textAlign, and writingDirection in any screen or
 * component — no more hard-coded 'row' or 'left'.
 *
 * @example
 *   const { isRTL, rowDirection, textAlign, writingDirection } = useRTL();
 *
 *   // Flip a row
 *   <View style={{ flexDirection: rowDirection }}>...</View>
 *
 *   // Align text
 *   <Text style={{ textAlign, writingDirection }}>...</Text>
 */
const useRTL = () => {
  const { language } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(language);

  return {
    /** true when the current language is Arabic or Hebrew */
    isRTL,

    /**
     * Drop this into flexDirection.
     * LTR → 'row'  |  RTL → 'row-reverse'
     */
    rowDirection: isRTL ? 'row-reverse' : 'row',

    /**
     * Follows the active script direction.
     * LTR (English) → 'left'  |  RTL (Arabic / Hebrew) → 'right'
     * writingDirection still ensures characters and colons
     * render correctly inside their RTL text runs.
     */
    textAlign: isRTL ? 'right' : 'left',

    /**
     * Drop this into writingDirection on a <Text>.
     * Pins punctuation (especially colons) to the correct side of
     * the word, preventing the Unicode bidi algorithm from misplacing them.
     * Also ensures emojis sit on the RIGHT of Arabic/Hebrew text runs
     * (they are neutral chars that follow the base direction).
     * LTR → 'ltr'  |  RTL → 'rtl'
     */
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
};

export default useRTL;
