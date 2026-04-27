type Props = {
  email: string | undefined;
  onLogout: () => void;
};

export default function Header({ email, onLogout }: Props) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Habit Streak</p>
        <h1>Build boring consistency into visible momentum.</h1>
        <p className="lede">
          Create habits, mark one completion per day, and track the last seven days without editable history.
        </p>
      </div>
      <button className="ghost" onClick={onLogout}>
        Log out {email}
      </button>
    </section>
  );
}
