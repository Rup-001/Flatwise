
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import type { Invitation } from '@/context/AppContext';

export const useInvitations = () => {
  const { 
    invitations, 
    fetchInvitations, 
    sendInvitation, 
    updateInvitation, 
    deleteInvitation 
  } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load invitations on mount
  useEffect(() => {
    fetchInvitations().catch(error => {
      console.error("Error fetching invitations:", error);
    });
  }, [fetchInvitations]);

  // Send a new invitation
  const handleSendInvitation = useCallback(async (data: Partial<Invitation>) => {
    setIsSubmitting(true);
    try {
      await sendInvitation(data);
      return true;
    } catch (error) {
      console.error("Error sending invitation:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [sendInvitation]);

  // Resend an invitation
  const handleResendInvitation = useCallback(async (invitationId: string) => {
    setIsSubmitting(true);
    try {
      await updateInvitation(invitationId, { status: "pending" });
      return true;
    } catch (error) {
      console.error("Error resending invitation:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [updateInvitation]);

  // Cancel an invitation
  const handleCancelInvitation = useCallback(async (invitationId: string) => {
    setIsSubmitting(true);
    try {
      await deleteInvitation(invitationId);
      return true;
    } catch (error) {
      console.error("Error canceling invitation:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteInvitation]);

  return {
    invitations: invitations.items,
    isLoading: invitations.loading,
    error: invitations.error,
    isSubmitting,
    sendInvitation: handleSendInvitation,
    resendInvitation: handleResendInvitation,
    cancelInvitation: handleCancelInvitation,
  };
};

export default useInvitations;
