import { useState } from "react";
import type { User } from "./lib/api";
import { getPublicShareId } from "./lib/format";
import { loadToken, loadUser, persistSession, clearSession } from "./lib/session";
import PublicHabitPage from "./components/public/PublicHabitPage";
import AppLayout from "./components/layout/AppLayout";

function App() {
  const publicShareId = getPublicShareId(window.location.pathname);

  if (publicShareId) {
    return <PublicHabitPage shareId={publicShareId} />;
  }

  const [token, setToken] = useState(() => loadToken());
  const [user, setUser] = useState<User | null>(() => loadUser());

  const handleAuthenticated = (nextUser: User, nextToken: string) => {
    persistSession(nextUser, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AppLayout
      token={token}
      user={user}
      onAuthenticated={handleAuthenticated}
      onLogout={handleLogout}
    />
  );
}

export default App;
