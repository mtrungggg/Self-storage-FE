// Data layer: content source for the AccessControl (PIN & smart lock) page.
export function getWallets() {
  return [
    { icon: "account_balance_wallet", title: "Apple Wallet", status: "Pass added", active: true },
    { icon: "wallet", title: "Google Wallet", status: "Not linked", active: false },
    { icon: "credit_card", title: "NFC Keycard", status: "Ready", active: true },
  ];
}

export function getGuestPins(unitCode) {
  if (!unitCode) return [];
  return [
    {
      id: "express",
      name: "Express Delivery",
      tag: "Single use",
      status: "active",
      schedule: `14:00 – 17:00, today • Unit ${unitCode}`,
      code: "481903#",
      action: "Revoke",
    },
    {
      id: "family",
      name: "Authorized Member",
      tag: "Recurring",
      status: "active",
      schedule: "Sat & Sun (08:00 – 20:00)",
      code: "773201#",
      action: "Edit",
    },
    {
      id: "tech",
      name: "Maintenance Technician",
      tag: "Expired",
      status: "expired",
      schedule: "Used at 11:20",
      code: "119042#",
      action: "Reissue",
    },
  ];
}
