'use client';

export function TopbarNotificationButton() {
  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm" aria-label="通知">
        <span className="iconify lucide--bell size-4.5" />
      </div>
      <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box mt-1 w-72 shadow-lg">
        <div className="border-base-200 border-b px-4 py-3">
          <p className="text-sm font-medium">通知</p>
        </div>
        <div className="text-base-content/50 px-4 py-8 text-center text-sm">尚無通知</div>
      </div>
    </div>
  );
}
