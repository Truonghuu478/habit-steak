import { useEffect, useState } from "react";
import { ApiError, type PublicHabit, api } from "../../lib/api";
import { formatVietnamDate } from "../../lib/format";
import WeekGrid from "../streak/WeekGrid";
import { WeekGridSkeleton } from "../ui/Skeletons";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

type Props = {
  shareId: string;
};

export default function PublicHabitPage({ shareId }: Props) {
  const [habit, setHabit] = useState<PublicHabit | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setMessage("");

    api.publicHabit(shareId)
      .then((result) => {
        if (!cancelled) {
          setHabit(result.habit);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setHabit(null);
          setMessage(error instanceof ApiError ? error.message : "Could not load shared habit");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  return (
    <Container maxWidth="lg" className="py-12">
      <Box className="flex items-start justify-between gap-8 mb-8 max-md:flex-col">
        <div>
          <Typography variant="overline" component="p" className="mb-3">
            Shared Habit
          </Typography>
          <Typography variant="h1" component="h1" className="max-w-[720px] mb-4 max-sm:hidden">
            Read-only streak snapshot for one habit.
          </Typography>
          <Typography variant="body2" className="max-w-[620px] max-sm:hidden">
            This public page exposes only the habit name, current streak, and the last seven days.
          </Typography>
        </div>
        <Button variant="outlined" href="/">
          Open app
        </Button>
      </Box>

      {message ? (
        <Alert severity="warning" className="mb-6">
          {message}
        </Alert>
      ) : null}

      <Paper className="p-6">
        <Box className="grid gap-5">
          {isLoading ? (
            <>
              <div className="grid gap-1">
                <Skeleton variant="text" width={220} height={36} />
                <Skeleton variant="text" width={140} height={20} />
                <Skeleton variant="text" width={200} height={18} />
              </div>
              <WeekGridSkeleton />
            </>
          ) : habit ? (
            <>
              <div className="grid gap-1">
                <Typography variant="h2">{habit.name}</Typography>
                <Typography>{habit.currentStreak} day current streak</Typography>
                <Typography>Tracking since {formatVietnamDate(habit.createdAt)}</Typography>
              </div>
              <WeekGrid days={habit.lastSevenDays} />
            </>
          ) : (
            <Typography className="text-center py-4">
              This share link is unavailable.
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
