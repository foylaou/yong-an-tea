'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from '../../types/order';
import { addressFormSchema, type AddressFormData } from '../../lib/validations/address';
import TaiwanAddressSelector from '../TaiwanAddressSelector';

interface AddressManagerProps {
  initialAddresses: Address[];
}

const inputField =
  'border border-[#e8e8e8] focus-visible:outline-0 py-[10px] px-[20px] w-full h-[50px]';
const labelClass = 'block mb-[5px] text-sm font-medium';
const errorClass = 'text-red-500 text-xs mt-1';

function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
  });

  const openNewForm = () => {
    setEditingId(null);
    reset({
      label: '住家',
      recipient_name: '',
      phone: '',
      postal_code: '',
      city: '',
      district: '',
      address_line1: '',
      address_line2: '',
      is_default: false,
    });
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingId(addr.id);
    reset({
      label: addr.label,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      postal_code: addr.postal_code || '',
      city: addr.city,
      district: addr.district,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      is_default: addr.is_default,
    });
    setShowForm(true);
  };

  const onSubmit = async (data: AddressFormData) => {
    setSaving(true);
    try {
      const url = editingId ? `/api/addresses/${editingId}` : '/api/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Refetch addresses
        const listRes = await fetch('/api/addresses');
        const listData = await listRes.json();
        setAddresses(listData.addresses);
        setShowForm(false);
        setEditingId(null);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此地址嗎？')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-[25px]">
        <h2 className="text-[20px] font-medium">收件地址</h2>
        {!showForm && (
          <button
            onClick={openNewForm}
            className="bg-[#222] text-white px-5 py-2 text-sm hover:bg-black transition-colors"
          >
            新增地址
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-[#e8e8e8] rounded p-5 mb-6">
          <h3 className="text-[16px] font-medium mb-4">
            {editingId ? '編輯地址' : '新增地址'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>地址標籤 *</label>
                <input {...register('label')} className={inputField} placeholder="住家" />
                {(() => {
                  const city = watch('city');
                  const district = watch('district');
                  if (!city) return null;
                  const suggestions: string[] = [];
                  if (city) {
                    suggestions.push(`${city}的家`, `${city}公司`);
                  }
                  if (district) {
                    suggestions.push(`${district}的家`, `${district}公司`);
                  }
                  return (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setValue('label', s, { shouldValidate: true })}
                          className="px-2.5 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                {errors.label && <p className={errorClass}>{errors.label.message}</p>}
              </div>
              <div>
                <label className={labelClass}>收件人 *</label>
                <input {...register('recipient_name')} className={inputField} />
                {errors.recipient_name && (
                  <p className={errorClass}>{errors.recipient_name.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass}>電話 *</label>
              <input {...register('phone')} className={inputField} placeholder="0912345678" />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            <div className="flex flex-col gap-4 mb-4">
              <TaiwanAddressSelector
                postalCodeValue={watch('postal_code') ?? ''}
                cityValue={watch('city') ?? ''}
                districtValue={watch('district') ?? ''}
                addressLine1Value={watch('address_line1') ?? ''}
                onPostalCodeChange={(zip, city, district) => {
                  setValue('postal_code', zip);
                  if (city) {
                    setValue('city', city, { shouldValidate: true });
                    setValue('district', district, { shouldValidate: true });
                  }
                }}
                onCityChange={(city) => {
                  setValue('city', city, { shouldValidate: true });
                  setValue('district', '', { shouldValidate: false });
                  setValue('postal_code', '');
                  setValue('address_line1', '');
                }}
                onDistrictChange={(district, zipCode) => {
                  setValue('district', district, { shouldValidate: true });
                  setValue('postal_code', zipCode);
                }}
                onAddressLine1Change={(addr) => {
                  setValue('address_line1', addr, { shouldValidate: true });
                }}
                inputClassName={inputField}
                cityError={errors.city?.message}
                districtError={errors.district?.message}
                addressError={errors.address_line1?.message}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>地址補充</label>
              <input {...register('address_line2')} className={inputField} placeholder="請寫樓層或特殊需求，比如說管理室收" />
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" {...register('is_default')} className="w-4 h-4" />
              <span className="text-sm">設為預設地址</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#222] text-white px-6 py-2 text-sm hover:bg-black disabled:opacity-50"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="border border-[#222] px-6 py-2 text-sm hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <p className="text-center py-[40px] text-gray-400">尚無儲存的地址</p>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-[#e8e8e8] rounded p-4 flex justify-between items-start"
            >
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{addr.label}</span>
                  {addr.is_default && (
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                      預設
                    </span>
                  )}
                </div>
                <p>
                  {addr.recipient_name} / {addr.phone}
                </p>
                <p className="text-gray-500">
                  {addr.postal_code && `${addr.postal_code} `}
                  {addr.city}
                  {addr.district}
                  {addr.address_line1}
                  {addr.address_line2 && ` ${addr.address_line2}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(addr)}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  編輯
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deleting === addr.id}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressManager;
