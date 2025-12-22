import { AppRoutes } from './router';
import { AppShell } from './AppShell';

export default function App() {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}
