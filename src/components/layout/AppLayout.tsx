import type { User } from "../../lib/api";
import Header from "./Header";
import Body from "./Body";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

type Props = {
  token: string | null;
  user: User | null;
  onAuthenticated: (user: User, token: string) => void;
  onLogout: () => void;
};

export default function AppLayout({ token, user, onAuthenticated, onLogout }: Props) {
  const authenticated = Boolean(token && user);

  return (
    <Container component="main" maxWidth="lg" className="py-12">
      {authenticated ? (
        <Header email={user?.email} onLogout={onLogout} />
      ) : (
        <Box className="flex items-start justify-between gap-8 mb-8 max-md:flex-col">
          <div>
            <Typography variant="overline" component="p" className="mb-3">
              Habit Streak
            </Typography>
            <Typography variant="h1" component="h1" className="max-w-[720px] mb-4 max-sm:hidden">
              Build boring consistency into visible momentum.
            </Typography>
            <Typography variant="body2" className="max-w-[620px] max-sm:hidden">
              Create habits, mark one completion per day, and track the last seven days without editable history.
            </Typography>
          </div>
        </Box>
      )}
      <Body token={token} user={user} onAuthenticated={onAuthenticated} />
    </Container>
  );
}
