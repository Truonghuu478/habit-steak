import type { Habit } from "../../lib/api";
import { getShareLink } from "../../lib/format";
import { showSuccess, showError } from "../../lib/toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type Props = {
  habit: Habit;
  isPending: boolean;
  onMarkDone: (habitId: string) => void;
  onEdit: (habitId: string, currentName: string) => void;
  onDelete: (habitId: string) => void;
  onShareToggle: (habitId: string, isPublic: boolean) => void;
};

export default function HabitActions({
  habit,
  isPending,
  onMarkDone,
  onEdit,
  onDelete,
  onShareToggle
}: Props) {
  return (
    <Box className="flex flex-col items-end gap-3 shrink-0">
      {/* Action buttons */}
      <Box className="flex flex-wrap gap-2 justify-end">
        <Button variant="contained" onClick={() => onMarkDone(habit.id)} disabled={isPending}>
          Mark done
        </Button>
        <Button variant="outlined" onClick={() => onEdit(habit.id, habit.name)}>
          Edit
        </Button>
        <Button variant="outlined" color="error" onClick={() => onDelete(habit.id)}>
          Delete
        </Button>
      </Box>

      {/* Share row */}
      <Box className="flex items-start justify-between gap-4 w-full mt-2">
        <div>
          <Typography className="font-extrabold mb-1">Public share</Typography>
          <Typography variant="body2" className="text-sm">
            {habit.isPublic ? "Read-only link is live." : "Disabled until you enable sharing."}
          </Typography>
        </div>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onShareToggle(habit.id, !habit.isPublic)}
          disabled={isPending}
        >
          {habit.isPublic ? "Disable share" : "Enable share"}
        </Button>
      </Box>

      {/* Share link */}
      {habit.isPublic && habit.shareId ? (
        <Box className="w-full">
          <Paper
            variant="outlined"
            component="a"
            href={getShareLink(habit.shareId)}
            target="_blank"
            rel="noreferrer"
            className="block py-3 px-4 no-underline break-all font-extrabold"
            sx={{
              borderRadius: "1rem",
              borderWidth: 2,
              borderColor: "primary.light",
              boxShadow: "none",
              bgcolor: "background.paper"
            }}
          >
            {getShareLink(habit.shareId)}
          </Paper>
          <Button
            variant="outlined"
            size="small"
            className="mt-2"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(getShareLink(habit.shareId!));
                showSuccess("Share link copied");
              } catch {
                showError("Could not copy link");
              }
            }}
          >
            Copy
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
