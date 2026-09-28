import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFacilities,
  getSizeGuideTabs,
  getHomeHighlights,
  getHomeTrustBadges,
} from "../data/homeRepository";

// Application layer: encapsulates Home (storage search) page state and data wiring.
export function useHome() {
  const navigate = useNavigate();
  const [activeSizeTab, setActiveSizeTab] = useState("studio");

  const facilities = getFacilities();
  const sizeGuideTabs = getSizeGuideTabs();
  const highlights = getHomeHighlights();
  const trustBadges = getHomeTrustBadges();

  const goToStorageDetail = () => navigate("/storage-detail");

  return {
    activeSizeTab,
    setActiveSizeTab,
    facilities,
    sizeGuideTabs,
    highlights,
    trustBadges,
    goToStorageDetail,
  };
}
