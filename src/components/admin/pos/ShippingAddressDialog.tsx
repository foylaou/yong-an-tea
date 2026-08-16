'use client';

import { useEffect, useRef, useState } from 'react';
import TaiwanAddressSelector from '@/components/TaiwanAddressSelector';

export interface ShippingRecipientData {
    recipient_name: string;
    recipient_phone: string;
    postal_code: string;
    city: string;
    district: string;
    address_line1: string;
    address_line2: string;
}

interface MemberAddress {
    id: string;
    label: string;
    recipient_name: string;
    phone: string;
    postal_code: string | null;
    city: string;
    district: string;
    address_line1: string;
    address_line2: string | null;
    is_default: boolean;
}

interface ShippingAddressDialogProps {
    initial: ShippingRecipientData;
    // Present only when a picked customer is linked to a website account —
    // lets "帶入會員資料" pull their saved addresses via
    // GET /api/admin/customers/[id]/addresses. Omit (walk-in / no customer
    // picked) to hide that button entirely, since there's nothing to fetch.
    customerId?: string;
    onConfirm: (data: ShippingRecipientData) => void;
    onClose: () => void;
}

/**
 * 黑貓 (T-cat) 的出貨單需要收件人姓名/電話/地址（RecipientName/
 * RecipientTel/RecipientMobile/RecipientAddress — 見 tcat.ts），但 POS
 * 之前只收「收件地址」，姓名/電話是直接借用選好的客戶資料——客戶幫別人
 * 代寄、或根本沒選客戶（現場散客）時就沒有可用的收件人資訊。改成跳出這個
 * dialog，跟出貨單真正需要的欄位一一對應，並可以從會員已儲存的地址中選。
 */
export function ShippingAddressDialog({
    initial,
    customerId,
    onConfirm,
    onClose,
}: ShippingAddressDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [form, setForm] = useState<ShippingRecipientData>(initial);
    const [error, setError] = useState<string | null>(null);

    const [memberAddresses, setMemberAddresses] = useState<
        MemberAddress[] | null
    >(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressPicker, setShowAddressPicker] = useState(false);

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function set<K extends keyof ShippingRecipientData>(key: K, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleImportMember() {
        setShowAddressPicker(true);
        if (memberAddresses !== null || !customerId) return; // already fetched once
        setLoadingAddresses(true);
        try {
            const res = await fetch(
                `/api/admin/customers/${customerId}/addresses`
            );
            const data = await res.json();
            setMemberAddresses(res.ok ? (data.addresses ?? []) : []);
        } catch {
            setMemberAddresses([]);
        } finally {
            setLoadingAddresses(false);
        }
    }

    function selectMemberAddress(addr: MemberAddress) {
        setForm({
            recipient_name: addr.recipient_name,
            recipient_phone: addr.phone,
            postal_code: addr.postal_code ?? '',
            city: addr.city,
            district: addr.district,
            address_line1: addr.address_line1,
            address_line2: addr.address_line2 ?? '',
        });
        setShowAddressPicker(false);
        setError(null);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (
            !form.recipient_name.trim() ||
            !form.recipient_phone.trim() ||
            !form.city.trim() ||
            !form.district.trim() ||
            !form.address_line1.trim()
        ) {
            setError('收件人姓名、電話、縣市、鄉鎮區、詳細地址皆為必填');
            return;
        }
        onConfirm(form);
    }

    return (
        <dialog ref={dialogRef} onClose={onClose} className="modal">
            <div className="modal-box max-w-md">
                <h3 className="text-lg font-semibold">寄到府 — 收件資訊</h3>
                <p className="text-base-content/60 -mt-1 text-sm">
                    黑貓宅急便出貨需要完整的收件人姓名、電話與地址
                </p>

                {customerId && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={handleImportMember}
                            className="btn btn-outline btn-sm"
                        >
                            <span className="iconify lucide--user-round-check size-4" />
                            帶入會員資料
                        </button>

                        {showAddressPicker && (
                            <div className="border-base-300 bg-base-200/50 mt-2 space-y-1 rounded-md border p-2">
                                {loadingAddresses && (
                                    <p className="text-base-content/50 py-2 text-center text-xs">
                                        載入中...
                                    </p>
                                )}
                                {!loadingAddresses &&
                                    memberAddresses?.length === 0 && (
                                        <p className="text-base-content/50 py-2 text-center text-xs">
                                            此會員沒有儲存地址
                                        </p>
                                    )}
                                {!loadingAddresses &&
                                    memberAddresses?.map((addr) => (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() =>
                                                selectMemberAddress(addr)
                                            }
                                            className="hover:bg-base-100 w-full rounded-md p-2 text-left text-xs"
                                        >
                                            <div className="flex items-center gap-1.5 font-medium">
                                                {addr.label || '未命名地址'}
                                                {addr.is_default && (
                                                    <span className="badge badge-primary badge-xs">
                                                        預設
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-base-content/60">
                                                {addr.recipient_name}{' '}
                                                {addr.phone}
                                            </div>
                                            <div className="text-base-content/60">
                                                {addr.city}
                                                {addr.district}
                                                {addr.address_line1}
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                收件人姓名 *
                            </legend>
                            <input
                                type="text"
                                value={form.recipient_name}
                                onChange={(e) =>
                                    set('recipient_name', e.target.value)
                                }
                                className="input input-sm w-full"
                                autoFocus
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                收件人電話 *
                            </legend>
                            <input
                                type="text"
                                value={form.recipient_phone}
                                onChange={(e) =>
                                    set('recipient_phone', e.target.value)
                                }
                                className="input input-sm w-full"
                            />
                        </fieldset>
                    </div>

                    {/* 縣市/鄉鎮區/郵遞區號連動 + 路名建議 — 跟前台結帳同一套輔助工具
                        （src/components/TaiwanAddressSelector.tsx），行政區資料庫共用，
                        店員不用自己記郵遞區號或手動對county/district */}
                    <TaiwanAddressSelector
                        postalCodeValue={form.postal_code}
                        cityValue={form.city}
                        districtValue={form.district}
                        addressLine1Value={form.address_line1}
                        onPostalCodeChange={(zip, city, district) =>
                            setForm((prev) => ({
                                ...prev,
                                postal_code: zip,
                                ...(city && { city, district }),
                            }))
                        }
                        onCityChange={(city) =>
                            setForm((prev) => ({
                                ...prev,
                                city,
                                district: '',
                                postal_code: '',
                            }))
                        }
                        onDistrictChange={(district, zipCode) =>
                            setForm((prev) => ({
                                ...prev,
                                district,
                                postal_code: zipCode,
                            }))
                        }
                        onAddressLine1Change={(address) =>
                            set('address_line1', address)
                        }
                        selectClassName="select select-sm w-full"
                        inputClassName="input input-sm w-full"
                    />

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            地址備註（選填）
                        </legend>
                        <input
                            type="text"
                            value={form.address_line2}
                            onChange={(e) =>
                                set('address_line2', e.target.value)
                            }
                            placeholder="樓層、門牌備註等"
                            className="input input-sm w-full"
                        />
                    </fieldset>

                    {error && <p className="text-error text-xs">{error}</p>}

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                        >
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary">
                            確認
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>
                    close
                </button>
            </form>
        </dialog>
    );
}
