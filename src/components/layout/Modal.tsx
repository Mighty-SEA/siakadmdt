"use client";
import { useEffect, useRef } from 'react';

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  disableClickOutside?: boolean;
}

export default function Modal({
  id,
  title,
  children,
  isOpen = false,
  onClose,
  size = 'md',
  showCloseButton = true,
  disableClickOutside = false
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  // Ukuran modal sesuai parameter size
  const sizeClass = {
    'xs': 'max-w-xs',
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl'
  }[size];
  
  // Effect untuk membuka/menutup modal
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (isOpen) {
      dialog.showModal();
      document.body.classList.add('overflow-hidden');
    } else {
      dialog.close();
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  
  // Handler untuk klik di luar modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (disableClickOutside) return;
    
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    const dialogDimensions = dialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      if (onClose) onClose();
    }
  };
  
  return (
    <dialog
      id={id}
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      onClick={handleBackdropClick}
    >
      <div className={`modal-box ${sizeClass} bg-base-100 shadow-lg border border-base-300`}>
        <div className="flex justify-between items-center border-b border-base-300 pb-3 mb-4">
          <h3 className="font-bold text-lg text-base-content">{title}</h3>
          {showCloseButton && (
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
              aria-label="Tutup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="py-2">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

// Button untuk membuka modal
interface ModalTriggerProps {
  modalId: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ModalTrigger({ modalId, children, onClick, className = "btn" }: ModalTriggerProps) {
  const handleClick = () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
    if (onClick) onClick();
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}

// Komponen tombol untuk footer modal
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div className={`mt-6 pt-4 flex justify-end gap-2 border-t border-base-300 ${className}`}>
      {children}
    </div>
  );
}

// Contoh penggunaan:
//
// import Modal, { ModalTrigger, ModalFooter } from '@/components/layout/Modal';
// import { useState } from 'react';
//
// function ExamplePage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//
//   return (
//     <div>
//       <ModalTrigger 
//         modalId="my-modal" 
//         onClick={() => setIsModalOpen(true)}
//         className="btn btn-primary"
//       >
//         Buka Modal
//       </ModalTrigger>
//
//       <Modal
//         id="my-modal"
//         title="Judul Modal"
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         size="md"
//       >
//         <p>Konten modal disini...</p>
//         
//         <ModalFooter>
//           <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
//           <button className="btn btn-primary">Simpan</button>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// } 