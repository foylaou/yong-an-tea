'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  full_name: z.string().min(1, '姓名為必填'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    full_name: string;
    email: string;
  };
}

const inputField =
  'border border-[#e8e8e8] focus-visible:outline-0 py-[10px] px-[20px] w-full h-[50px]';

function ProfileForm({ initialData }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: initialData.full_name || '' },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage('已儲存');
      } else {
        const result = await res.json();
        setMessage(result.error || '儲存失敗');
      }
    } catch {
      setMessage('網路錯誤');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-[20px] font-medium mb-[25px]">個人資料</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[500px]">
        <div className="mb-[20px]">
          <label className="block mb-[5px] text-sm font-medium">電子郵件</label>
          <input
            className={`${inputField} bg-gray-100 cursor-not-allowed`}
            type="email"
            value={initialData.email}
            disabled
          />
          <p className="text-xs text-gray-400 mt-1">信箱無法修改</p>
        </div>

        <div className="mb-[20px]">
          <label htmlFor="full_name" className="block mb-[5px] text-sm font-medium">
            姓名
          </label>
          <input
            {...register('full_name')}
            className={inputField}
            id="full_name"
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#222] text-white px-8 h-[42px] transition-all hover:bg-black disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
          {message && (
            <span className={`text-sm ${message === '已儲存' ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;
