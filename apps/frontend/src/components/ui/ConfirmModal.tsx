import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  loading = false
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle className="font-extrabold">{title}</DialogTitle>
      {description ? (
        <DialogContent>
          <DialogContentText className="text-ink">{description}</DialogContentText>
        </DialogContent>
      ) : null}
      <DialogActions className="px-6 pb-5">
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onConfirm()}
          disabled={loading}
        >
          {loading ? "Working..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
