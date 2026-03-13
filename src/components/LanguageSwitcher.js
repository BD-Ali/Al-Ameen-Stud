import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n/LanguageContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const LanguageSwitcher = ({ style }) => {
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'ar', label: t('language.arabic') },
    { code: 'he', label: t('language.hebrew') },
    { code: 'en', label: t('language.english') },
  ];

  return (
    <View style={[styles.container, style]}>
      {languages.map((lang, index) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.option,
            index < languages.length - 1 && styles.optionBorder,
            language === lang.code && styles.activeOption,
          ]}
          onPress={() => setLanguage(lang.code)}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, language === lang.code && styles.activeText]}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBorder: {
    borderEndWidth: 1,
    borderEndColor: colors.primary.main,
  },
  activeOption: {
    backgroundColor: colors.primary.main,
  },
  optionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary.main,
  },
  activeText: {
    color: '#fff',
  },
});

export default LanguageSwitcher;
