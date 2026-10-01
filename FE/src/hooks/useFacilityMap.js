import { useState } from "react";
import {
  getFloors,
  getLeftUnits,
  getRightUnits,
  getWayfindingSteps,
  getFacilityAmenities,
} from "../data/facilityMapRepository";

// Application layer: encapsulates FacilityMap page state and data wiring.
export function useFacilityMap() {
  const floors = getFloors();
  const leftUnits = getLeftUnits();
  const rightUnits = getRightUnits();
  const steps = getWayfindingSteps();
  const amenities = getFacilityAmenities();

  const [activeFloor, setActiveFloor] = useState("floor2");
  const [layers, setLayers] = useState({ route: true, cctv: true, carts: true });

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
  };
}
