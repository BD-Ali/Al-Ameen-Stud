import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n/LanguageContext';
import { colors } from '../styles/theme';

const LanguageSwitcher = ({ style }) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.option,
          styles.optionRight,
          language === 'ar' && styles.activeOption,
        ]}
        onPress={() => setLanguage('ar')}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, language === 'ar' && styles.activeText]}>
          {t('language.arabic')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          styles.optionLeft,
          language === 'he' && styles.activeOption,
        ]}
        onPress={() => setLanguage('he')}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, language === 'he' && styles.activeText]}>
          {t('language.hebrew')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  option: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  optionRight: {
    borderRightWidth: 1,
    borderRightColor: colors.primary.main,
  },
  optionLeft: {},
  activeOption: {
    backgroundColor: colors.primary.main,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  activeText: {
    color: '#fff',
  },
});

export default LanguageSwitcher;
