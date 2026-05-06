import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { spacing } from '../styles/theme';

/**
 * Returns a paddingBottom value equal to the current tab bar height
 * (which already includes the device's bottom safe area inset) plus a
 * small buffer, so that no content in a FlatList/ScrollView is hidden
 * behind the floating tab bar on any Android or iOS device.
 */
const useTabBottomPadding = () => useBottomTabBarHeight() + spacing.sm;

export default useTabBottomPadding;
