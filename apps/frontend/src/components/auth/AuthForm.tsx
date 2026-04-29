import { type FormEvent, useState, useTransition } from "react";
import { ApiError, type User, api } from "../../lib/api";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
      {message ? (
        <Alert severity="warning" className="mb-6">
          {message}
        </Alert>
      ) : null}

      <Paper className="p-8">
        <Box className="grid gap-8" sx={{ gridTemplateColumns: { xs: "1fr", md: "0.8fr 1fr" } }}>
          <div>
            <Typography variant="h2" className="mb-2">
              {mode === "login" ? "Log in" : "Create account"}
            </Typography>
            <Typography>
              Passwords must be at least 8 characters. Tokens are stored locally for this MVP.
            </Typography>
          </div>
          <form onSubmit={handleAuth} className="grid gap-4">
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              slotProps={{ htmlInput: { minLength: 8 } }}
              required
            />
            <Button variant="contained" type="submit" disabled={isPending} className="w-full">
              {isPending ? "Working..." : mode === "login" ? "Log in" : "Register"}
            </Button>
          </form>
        </Box>
        <Button
          variant="text"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4"
        >
          {mode === "login" ? "Need an account?" : "Already have an account?"}
        </Button>
      </Paper>
    </>
  );
}
