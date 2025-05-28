import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Inisialisasi koneksi socket untuk notifikasi real-time
 */
export function initSocket(): Socket {
  // Hapus socket yang ada jika sudah ada
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Buat koneksi socket baru
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  socket = io(baseUrl, {
    path: '/api/socket',
  });

  return socket;
}

/**
 * Dapatkan instance socket yang ada atau buat baru jika belum ada
 */
export function getSocket(): Socket {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

/**
 * Tutup koneksi socket
 */
export function closeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
} 