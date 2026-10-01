import { useEffect, useMemo, useState } from "react";
import {
  getFloors,
  getLeftUnits,
  getRightUnits,
  getWayfindingSteps,
  getFacilityAmenities,
} from "../data/facilityMapRepository";
import rentalService from "../api/rentalService";

// Application layer: encapsulates FacilityMap page state and data wiring.
export function useFacilityMap() {
  const floors = getFloors();
  const leftUnits = getLeftUnits();
  const rightUnits = getRightUnits();
  const amenities = getFacilityAmenities();

  const [rentals, setRentals] = useState([]);
  const [activeFloor, setActiveFloor] = useState("floor1");
  const [layers, setLayers] = useState({ route: true, cctv: true, carts: true });

  useEffect(() => {
    let active = true;
    rentalService
      .getMyRentals()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setRentals(list);
      })
      .catch((err) => {
        console.warn("Lỗi tải danh sách kho:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeRentals = useMemo(
    () => rentals.filter((r) => (r.status || "").toLowerCase() !== "ended"),
    [rentals]
  );
  const primaryRental = activeRentals[0] || null;
  const userUnitCode = primaryRental?.unitCode || "A-101";
  const facilityName = primaryRental?.facilityName || "Thu Duc Self Storage";
  const facilityAddress = primaryRental?.facilityAddress
    ? `${primaryRental.facilityAddress}, ${primaryRental.facilityCity || "TP. Hồ Chí Minh"}`
    : "01 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh";

  const steps = useMemo(() => getWayfindingSteps(userUnitCode), [userUnitCode]);

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  return {
    floors,
    leftUnits,
    rightUnits,
    steps,
    amenities,
    activeFloor,
    setActiveFloor,
    layers,
    toggleLayer,
    primaryRental,
    userUnitCode,
    facilityName,
    facilityAddress,
  };
}
