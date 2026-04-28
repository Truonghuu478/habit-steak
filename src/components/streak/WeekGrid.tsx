import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { formatVietnamWeekday } from "../../lib/format";

type Props = {
  days: { dateKey: string; completed?: boolean }[];
  onUnmark?: (dateKey: string) => void;
};

export default function WeekGrid({ days, onUnmark }: Props) {
  return (
    <Box className="grid grid-cols-7 gap-1">
      {days.map((day) => (
        <Paper
          key={day.dateKey}
          variant="outlined"
          className="grid place-items-center min-h-[4.3rem] relative"
          sx={{
            borderRadius: "1rem",
            borderWidth: 2,
            borderColor: "primary.light",
            bgcolor: day.completed ? "secondary.main" : "background.paper",
            color: day.completed ? "secondary.contrastText" : "text.primary"
          }}
        >
          <Typography variant="caption" className="font-extrabold text-[0.72rem]">
            {formatVietnamWeekday(day.dateKey)}
          </Typography>
          <Typography className="text-[1.1rem] font-bold">
            {day.dateKey.slice(8)}
          </Typography>
          {day.completed && onUnmark ? (
            <IconButton
              size="small"
              onClick={() => onUnmark(day.dateKey)}
              title="Unmark"
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                color: "inherit",
                fontSize: "0.65rem",
                width: 20,
                height: 20
              }}
            >
              ✕
            </IconButton>
          ) : null}
        </Paper>
      ))}
    </Box>
  );
}
