const vietnamTimeZone = "Asia/Ho_Chi_Minh";

export const formatVietnamWeekday = (dateKey: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: vietnamTimeZone
  }).format(new Date(`${dateKey}T12:00:00Z`));

export const formatVietnamDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: vietnamTimeZone
  }).format(new Date(value));

export const getPublicShareId = (pathname: string) => {
  const match = pathname.match(/^\/public\/habits\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const getShareLink = (shareId: string) =>
  `${window.location.origin}/public/habits/${shareId}`;
