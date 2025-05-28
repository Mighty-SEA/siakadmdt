'use client';
import AdminTableTemplate from '@/components/AdminTableTemplate';
import type { Income } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUI } from '@/lib/ui-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppActionFeedback } from '@/lib/useAppActionFeedback';
import React from 'react';

export default function IncomePage() {
  const { showConfirmModal } = useUI();
  const { showActionToast } = useAppActionFeedback();
  const router = useRouter();
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
      title: 'Hapus Pemasukan',
      message: 'Yakin ingin menghapus data pemasukan ini? Data yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        const res = await fetch(`/api/income?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          showActionToast('Pemasukan berhasil dihapus', 'success');
          setRefreshKey(k => k + 1);
        } else {
          showActionToast('Gagal menghapus pemasukan', 'error');
        }
      },
    });
  };

  return (
    <AdminTableTemplate
      title="Daftar Pemasukan (Income)"
      fetchUrl="/api/income"
      addUrl="/admin/keuangan/income/tambah"
      editUrl={id => `/admin/keuangan/income/edit/${id}`}
      deleteUrl="/api/income"
      defaultColumns={["no", "date", "description", "amount", "category", "created_at", "updated_at", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: Income, i: number) => i + 1 },
        { key: "date", label: "Tanggal", render: (row: Income) => row.date ? new Date(row.date).toLocaleDateString() : "-" },
        { key: "description", label: "Deskripsi" },
        { key: "amount", label: "Jumlah", render: (row: Income) => row.amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) },
        { key: "category", label: "Kategori" },
        { key: "created_at", label: "Dibuat", render: (row: Income) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diubah", render: (row: Income) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
          key: "aksi", label: "Aksi", render: (row: Income) => (
            <div className="flex gap-2">
              <Link href={`/admin/keuangan/income/edit/${row.id}`} className="btn btn-xs btn-warning"><Pencil className="w-4 h-4" /></Link>
              <button className="btn btn-xs btn-error" onClick={() => handleDelete(row.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        },
      ]}
      searchPlaceholder="Cari pemasukan..."
      refreshKey={refreshKey}
    />
  );
} 