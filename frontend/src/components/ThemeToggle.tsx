import { useScaleStore } from '@/stores/scaleStore';

export default function ThemeToggle() {
  const { theme, setTheme } = useScaleStore();

  const cycle = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
  };

  const icon = theme === 'dark' ? '\u263E' : theme === 'light' ? '\u2600' : '\u25D0';
  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Theme: ${label}. Click to cycle.`}
      title={`Theme: ${label}`}
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
}
