"use client";
import AdminTableTemplate from '@/components/AdminTableTemplate';
import type { SppPayment } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUI } from '@/lib/ui-context';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppActionFeedback } from '@/lib/useAppActionFeedback';
import React from 'react';

export default function SppPage() {
  const { showConfirmModal } = useUI();
  const { showActionToast } = useAppActionFeedback();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // Notifikasi dari query param
  useEffect(() => {
    if (!searchParams) return;
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    if (status && message) {
      showActionToast(decodeURIComponent(message), status as 'success' | 'error');
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, showActionToast]);

  const handleDelete = (id: number) => {
    showConfirmModal({
      title: 'Hapus Pembayaran SPP',
      message: 'Yakin ingin menghapus data pembayaran SPP ini? Data yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        const res = await fetch(`/api/spp?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          showActionToast('Pembayaran SPP berhasil dihapus', 'success');
          setRefreshKey(k => k + 1);
        } else {
          showActionToast('Gagal menghapus pembayaran SPP', 'error');
        }
      },
    });
  };

  return (
    <AdminTableTemplate<SppPayment>
      title="Daftar Pembayaran SPP"
      fetchUrl="/api/spp"
      addUrl="/admin/keuangan/spp/tambah"
      deleteUrl="/api/spp"
      defaultColumns={["no", "student", "nis", "month", "year", "paid_at", "amount", "infaq", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: SppPayment, i: number) => i + 1 },
        { key: "student", label: "Nama Siswa", render: (row: SppPayment) => row.student?.name || '-' },
        { key: "nis", label: "NIS", render: (row: SppPayment) => row.student?.nis || '-' },
        { key: "month", label: "Bulan", render: (row: SppPayment) => row.month },
        { key: "year", label: "Tahun", render: (row: SppPayment) => row.year },
        { key: "paid_at", label: "Tanggal Bayar", render: (row: SppPayment) => row.paid_at ? new Date(row.paid_at).toLocaleDateString() : '-' },
        { key: "amount", label: "Nominal", render: (row: SppPayment) => Number(row.amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) },
        { key: "infaq", label: "Infaq", render: (row: SppPayment) => row.infaq ? Number(row.infaq).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : '-' },
        {
          key: "aksi", label: "Aksi", render: (row: SppPayment) => (
            <div className="flex gap-2">
              <Link href={`/admin/keuangan/spp/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error" onClick={() => handleDelete(row.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari pembayaran SPP..."
      refreshKey={refreshKey}
    />
  );
} 