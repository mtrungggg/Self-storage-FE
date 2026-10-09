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

export function getAccessControlLogs(unitCode) {
  if (!unitCode) return [];
  return [
    {
      icon: "lock_open",
      title: `Unit ${unitCode} Unlocked`,
      time: "14:45 today",
      note: "Door keypad PIN",
      dot: "#2dd4a0",
    },
    {
      icon: "dialpad",
      title: `Unit ${unitCode} Unlocked`,
      time: "18 Oct, 10:12",
      note: "Guest PIN • Express Delivery",
      dot: "#8996a9",
    },
    {
      icon: "key",
      title: `Unit ${unitCode} Unlocked`,
      time: "10 Oct, 09:30",
      note: "Door keypad PIN",
      dot: "#8996a9",
    },
  ];
}
