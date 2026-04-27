import { type FormEvent, useState, useTransition } from "react";
import { ApiError, type User, api } from "../../lib/api";

type Props = {
  onAuthenticated: (user: User, token: string) => void;
};

export default function AuthForm({ onAuthenticated }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const action = mode === "login" ? api.login : api.register;
        const result = await action(email, password);
        onAuthenticated(result.user, result.token);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Authentication failed");
      }
    });
  };

  return (
    <>
      {message ? <div className="notice">{message}</div> : null}

      <section className="panel auth-panel">
        <div>
          <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
          <p>Passwords must be at least 8 characters. Tokens are stored locally for this MVP.</p>
        </div>
        <form onSubmit={handleAuth}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>
          <button disabled={isPending}>
            {isPending ? "Working..." : mode === "login" ? "Log in" : "Register"}
          </button>
        </form>
        <button className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account?" : "Already have an account?"}
        </button>
      </section>
    </>
  );
}
