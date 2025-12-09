import { useTheme } from '../api/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

export const useCurrentTheme = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode ? darkTheme : lightTheme;
};
