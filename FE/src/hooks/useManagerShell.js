import { useManagementShell } from "./useManagementShell";

/**
 * Backward compatibility wrapper for useManagerShell.
 * Now routes through the unified useManagementShell hook.
 */
export function useManagerShell() {
  return useManagementShell();
}

export default useManagerShell;
