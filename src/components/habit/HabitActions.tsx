import type { Habit } from "../../lib/api";
import { getShareLink } from "../../lib/format";
import { showSuccess, showError } from "../../lib/toast";

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
    <>
      {/* Action buttons */}
      <div>
        <button onClick={() => onMarkDone(habit.id)} disabled={isPending}>
          Mark done
        </button>
        <button className="ghost" onClick={() => onEdit(habit.id, habit.name)}>
          Edit
        </button>
        <button className="ghost danger" onClick={() => onDelete(habit.id)}>
          Delete
        </button>
      </div>

      {/* Share row */}
      <div className="share-row">
        <div>
          <strong>Public share</strong>
          <p>{habit.isPublic ? "Read-only link is live." : "Disabled until you enable sharing."}</p>
        </div>
        <button
          className="ghost"
          onClick={() => onShareToggle(habit.id, !habit.isPublic)}
          disabled={isPending}
        >
          {habit.isPublic ? "Disable share" : "Enable share"}
        </button>
      </div>

      {/* Share link */}
      {habit.isPublic && habit.shareId ? (
        <>
          <a
            className="share-link"
            href={getShareLink(habit.shareId)}
            target="_blank"
            rel="noreferrer"
          >
            {getShareLink(habit.shareId)}
          </a>
          <div className="mt-2">
            <button
              className="ghost"
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
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}
