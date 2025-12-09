import { useTheme } from '../api/ThemeContext.jsx';
import { lightTheme, darkTheme } from '../theme';

export const useCurrentTheme = () => {
  const { isDarkMode } = useTheme();
  return isDarkMode ? darkTheme : lightTheme;
};
