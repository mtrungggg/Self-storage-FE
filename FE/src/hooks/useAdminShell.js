import { useManagementShell } from "./useManagementShell";

/**
 * Backward compatibility wrapper for useAdminShell.
 * Now routes through the unified useManagementShell hook.
 */
export function useAdminShell() {
  return useManagementShell();
}

export default useAdminShell;
