'use client';
import AdminTableTemplate from '@/components/AdminTableTemplate';
import type { Expense } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUI } from '@/lib/ui-context';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppActionFeedback } from '@/lib/useAppActionFeedback';
import React from 'react';

export default function ExpensePage() {
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
      title: 'Hapus Pengeluaran',
      message: 'Yakin ingin menghapus data pengeluaran ini? Data yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        const res = await fetch(`/api/expense?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          showActionToast('Pengeluaran berhasil dihapus', 'success');
          setRefreshKey(k => k + 1);
        } else {
          showActionToast('Gagal menghapus pengeluaran', 'error');
        }
      },
    });
  };

  return (
    <AdminTableTemplate<Expense>
      title="Daftar Pengeluaran (Expense)"
      fetchUrl="/api/expense"
      addUrl="/admin/keuangan/expense/tambah"
      deleteUrl="/api/expense"
      defaultColumns={["no", "date", "description", "amount", "category", "created_at", "updated_at", "aksi"]}
      columns={[
        { key: "no", label: "No", render: (_row: Expense, i: number) => i + 1 },
        { key: "date", label: "Tanggal", render: (row: Expense) => row.date ? new Date(row.date).toLocaleDateString() : "-" },
        { key: "description", label: "Deskripsi" },
        { key: "amount", label: "Jumlah", render: (row: Expense) => Number(row.amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) },
        { key: "category", label: "Kategori" },
        { key: "created_at", label: "Dibuat", render: (row: Expense) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Diubah", render: (row: Expense) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        { key: "aksi", label: "Aksi" },
      ]}
      searchPlaceholder="Cari pengeluaran..."
      refreshKey={refreshKey}
      renderRowActions={(row: Expense) => [
        <Link href={`/admin/keuangan/expense/edit/${row.id}`} className="flex items-center gap-2 text-primary" key="edit">
          <Pencil className="w-4 h-4" /> <span className="text-base-content">Edit</span>
        </Link>,
        <button className="flex items-center gap-2 text-error" key="hapus" onClick={() => handleDelete(row.id)}>
          <Trash2 className="w-4 h-4" /> <span className="text-base-content">Hapus</span>
        </button>
      ]}
    />
  );
} 