import type { User } from "../../lib/api";
import Header from "./Header";
import Body from "./Body";

type Props = {
  token: string | null;
  user: User | null;
  onAuthenticated: (user: User, token: string) => void;
  onLogout: () => void;
};

export default function AppLayout({ token, user, onAuthenticated, onLogout }: Props) {
  const authenticated = Boolean(token && user);

  return (
    <main className="shell">
      {authenticated ? (
        <Header email={user?.email} onLogout={onLogout} />
      ) : (
        <section className="hero">
          <div>
            <p className="eyebrow">Habit Streak</p>
            <h1>Build boring consistency into visible momentum.</h1>
            <p className="lede">
              Create habits, mark one completion per day, and track the last seven days without editable history.
            </p>
          </div>
        </section>
      )}
      <Body token={token} user={user} onAuthenticated={onAuthenticated} />
    </main>
  );
}
