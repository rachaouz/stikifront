import { exportApi } from "../api/export";

export function useExport() {
  const handleExport = async (fmt) => {
    try {
      await exportApi[fmt]();
    } catch (e) {
      console.error(`Export ${fmt} error:`, e);
      alert(`Erreur export ${fmt.toUpperCase()} : ${e.message}`);
    }
  };

  return { handleExport };
}