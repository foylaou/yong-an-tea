'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface TopbarProfileMenuProps {
  userName: string;
}

export function TopbarProfileMenu({ userName }: TopbarProfileMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost max-sm:btn-square gap-2 px-1.5">
        <div className="avatar avatar-placeholder">
          <div className="bg-primary text-primary-content mask mask-squircle w-8">
            <span className="text-sm">{userName.slice(0, 1).toUpperCase()}</span>
          </div>
        </div>
        <div className="text-start max-sm:hidden">
          <p className="text-sm/none">{userName}</p>
        </div>
      </div>
      <ul
        role="menu"
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box shadow-base-content/10 mt-2 w-48 p-1 shadow-lg"
      >
        <li>
          <Link href="/admin/settings">
            <span className="iconify lucide--settings size-4" />
            <span>設定</span>
          </Link>
        </li>
        <li>
          <Link href="/admin/change-password">
            <span className="iconify lucide--key-round size-4" />
            <span>更改密碼</span>
          </Link>
        </li>
        <li>
          <Link href="/admin/appearance">
            <span className="iconify lucide--palette size-4" />
            <span>外觀設定</span>
          </Link>
        </li>
        <li>
          <button type="button" onClick={handleSignOut} className="text-error hover:bg-error/10">
            <span className="iconify lucide--log-out size-4" />
            <span>登出</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
