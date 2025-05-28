// Global type declarations
declare global {
  interface Window {
    reloadNotifications?: () => Promise<void>;
  }
}

export {}; 