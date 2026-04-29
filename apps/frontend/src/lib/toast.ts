import { toast as sonnerToast } from "sonner";

const recent = new Set<string>();
const DEDUPE_MS = 3000;

function deduped(fn: (m: string) => void, message: string) {
  if (!message) return;
  if (recent.has(message)) return;
  recent.add(message);
  fn(message);
  setTimeout(() => recent.delete(message), DEDUPE_MS);
}

export function showSuccess(message: string) {
  deduped((m) => sonnerToast.success(m), message);
}

export function showError(message: string) {
  deduped((m) => sonnerToast.error(m), message);
}

export function showInfo(message: string) {
  deduped((m) => sonnerToast(m), message);
}

export default { showSuccess, showError, showInfo };
