import { useState } from "react";
import {
  getSecurityBanner,
  getOverviewHeader,
  getHeaderActions,
  getKpis,
  getPermissionMatrixRoles,
  getPermissionMatrixModules,
  getOtpTtlOptions,
  getGuestPinPolicyDefaults,
  getIntrusionPolicyDefaults,
} from "../data/securityCenterRepository";

// Application layer: encapsulates Security Center (RBAC & IoT policy) page state and data wiring.
export function useSecurityCenter() {
  const securityBanner = getSecurityBanner();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const kpis = getKpis();
  const permissionRoles = getPermissionMatrixRoles();
  const permissionModules = getPermissionMatrixModules();
  const otpTtlOptions = getOtpTtlOptions();
  const guestPinDefaults = getGuestPinPolicyDefaults();
  const intrusionDefaults = getIntrusionPolicyDefaults();

  const [guestPinPolicy, setGuestPinPolicy] = useState(guestPinDefaults);
  const [intrusionPolicy, setIntrusionPolicy] = useState(intrusionDefaults);

  const updateGuestPinPolicy = (key, value) => setGuestPinPolicy((prev) => ({ ...prev, [key]: value }));
  const updateIntrusionPolicy = (key, value) => setIntrusionPolicy((prev) => ({ ...prev, [key]: value }));

  return {
    securityBanner,
    header,
    headerActions,
    kpis,
    permissionRoles,
    permissionModules,
    otpTtlOptions,
    guestPinPolicy,
    updateGuestPinPolicy,
    intrusionPolicy,
    updateIntrusionPolicy,
  };
}
