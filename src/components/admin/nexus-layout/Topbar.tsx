import { TopbarProfileMenu } from './TopbarProfileMenu';

export function Topbar({ userName }: { userName: string }) {
  return (
    <div role="navigation" aria-label="Navbar" className="flex items-center justify-between px-3" id="layout-topbar">
      <div className="inline-flex items-center gap-3">
        <label
          className="btn btn-square btn-ghost btn-sm group-has-[[id=layout-sidebar-hover-trigger]:checked]/html:hidden"
          aria-label="開關側邊欄"
          htmlFor="layout-sidebar-toggle-trigger"
        >
          <span className="iconify lucide--menu size-5" />
        </label>
        <label
          className="btn btn-square btn-ghost btn-sm hidden group-has-[[id=layout-sidebar-hover-trigger]:checked]/html:flex"
          aria-label="開關側邊欄"
          htmlFor="layout-sidebar-hover-trigger"
        >
          <span className="iconify lucide--menu size-5" />
        </label>
      </div>
      <div className="inline-flex items-center gap-0.5">
        <TopbarProfileMenu userName={userName} />
      </div>
    </div>
  );
}
