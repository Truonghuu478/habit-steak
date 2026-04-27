import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

export function HabitCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box className="flex items-start justify-between gap-4 mb-5">
          <div>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="45%" height={18} />
          </div>
          <Box className="flex gap-2">
            <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "9999px" }} />
            <Skeleton variant="rounded" width={70} height={36} sx={{ borderRadius: "9999px" }} />
          </Box>
        </Box>

        <Box className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={68} sx={{ borderRadius: "1rem" }} />
          ))}
        </Box>

        <Box className="flex items-start justify-between gap-4 mt-5">
          <div className="flex-1">
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={200} height={18} />
          </div>
          <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "9999px" }} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function WeekGridSkeleton() {
  return (
    <Box className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={68} sx={{ borderRadius: "1rem" }} />
      ))}
    </Box>
  );
}

export default HabitCardSkeleton;
