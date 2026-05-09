import { useState, useEffect } from "react";
import { authApi } from "../api";

/**
 * Gère les demandes de reset mot de passe côté admin.
 * N'est activé que si isAdmin === true.
 */
export function useResetRequests(isAdmin) {
  const [resetRequests,  setResetRequests]  = useState([]);
  const [approveModal,   setApproveModal]   = useState(null);
  const [newPassword,    setNewPassword]    = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    authApi.getResetRequests().then(setResetRequests).catch(() => {});
  }, [isAdmin]);

  const pendingResets = resetRequests.filter(r => r.status === "pending");

  const openApproveModal = (request) => {
    setApproveModal(request);
    setNewPassword("");
  };

  const handleApprove = async () => {
    if (!newPassword || newPassword.length < 6) return;
    setApproveLoading(true);
    try {
      await authApi.approveReset(approveModal.id, newPassword);
      setResetRequests(prev =>
        prev.map(r => r.id === approveModal.id ? { ...r, status: "approved" } : r)
      );
      setApproveModal(null);
      setNewPassword("");
    } catch (e) {
      console.error("handleApprove:", e);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      await authApi.rejectReset(id);
      setResetRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: "rejected" } : r)
      );
    } catch (e) {
      console.error("handleReject:", e);
    }
  };

  return {
    pendingResets,
    approveModal,
    newPassword,
    approveLoading,
    setNewPassword,
    openApproveModal,
    closeApproveModal: () => setApproveModal(null),
    handleApprove,
    handleReject,
  };
}