'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return;
    }
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="mx-auto max-w-md">
      <PageTitle title="更改密碼" />
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">新密碼</legend>
              <input
                type="password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">確認新密碼</legend>
              <input
                type="password"
                className="input w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </fieldset>
            {error && <p className="text-error text-sm">{error}</p>}
            {success && <p className="text-success text-sm">密碼已更新</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? '更新中...' : '更新密碼'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
