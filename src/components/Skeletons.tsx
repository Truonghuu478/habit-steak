import React from "react";
import Skeleton from "react-loading-skeleton";

export function HabitCardSkeleton() {
  return (
    <article className="habit-card">
      <div className="habit-header">
        <div>
          <Skeleton width="60%" height={28} />
          <div className="h-2" />
          <Skeleton width="45%" height={14} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={90} height={36} />
          <Skeleton width={70} height={36} />
        </div>
      </div>

      <div className="week">
        {Array.from({ length: 7 }).map((_, i) => (
          <div className="day" key={i}>
            <Skeleton height={60} />
          </div>
        ))}
      </div>

      <div className="share-row">
        <div className="flex-1">
          <Skeleton width={120} height={18} />
          <div className="h-2" />
          <Skeleton width={200} height={20} />
        </div>
        <Skeleton width={90} height={36} />
      </div>
    </article>
  );
}

export function WeekGridSkeleton() {
  return (
    <div className="week">
      {Array.from({ length: 7 }).map((_, i) => (
        <div className="day" key={i}>
          <Skeleton height={60} />
        </div>
      ))}
    </div>
  );
}

export default HabitCardSkeleton;
