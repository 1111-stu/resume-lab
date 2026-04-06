declare global {
  interface Window {
    __RESUMELAB_RUNTIME_CONFIG__?: {
      VITE_API_BASE_URL?: string;
    };

    showDirectoryPicker(
      options?: FilePickerOptions
    ): Promise<FileSystemDirectoryHandle>;
  }
}

interface FilePickerOptions {
  multiple?: boolean;
  mode?: "read" | "readwrite";
}

export {};
