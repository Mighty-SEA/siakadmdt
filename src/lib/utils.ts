/**
 * Fungsi untuk menormalisasi URL avatar agar selalu dimulai dengan slash (/) jika URL relatif
 * @param avatar URL avatar yang akan dinormalisasi
 * @returns URL avatar yang sudah dinormalisasi
 */
export function normalizeAvatarUrl(avatar: string | null | undefined): string {
  if (!avatar) return '';
  
  // Jika sudah absolute URL (http:// atau https://)
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // Jika sudah diawali dengan slash
  if (avatar.startsWith('/')) {
    return avatar;
  }
  
  // Jika relatif tanpa slash di awal
  return `/${avatar}`;
} 