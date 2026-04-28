import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Props = {
  email: string | undefined;
  onLogout: () => void;
};

export default function Header({ email, onLogout }: Props) {
  return (
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
      <Button variant="outlined" onClick={onLogout}>
        Log out {email}
      </Button>
    </Box>
  );
}
