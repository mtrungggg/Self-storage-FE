import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLocations,
  getStorageTypes,
  getSizeFilters,
  getRentalTerms,
  getFacilities,
  getAvailableUnits,
  getSizeGuideTabs,
  getHomeHighlights,
  getHomeTrustBadges,
} from "../data/homeRepository";

// Application layer: encapsulates Home (storage search & reservation) page state and data wiring.
export function useHome() {
  const navigate = useNavigate();

  // Search Criteria (Step i)
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("month");
  const [searchKeyword, setSearchKeyword] = useState("");

  // UI state (Step ii)
  const [activeTab, setActiveTab] = useState("units"); // 'units' (ô kho trống) or 'facilities' (điểm kho)
  const [sortBy, setSortBy] = useState("recommended");
  const [activeSizeTab, setActiveSizeTab] = useState("studio");

  // Raw data sources
  const locations = useMemo(() => getLocations(), []);
  const storageTypes = useMemo(() => getStorageTypes(), []);
  const sizeFilters = useMemo(() => getSizeFilters(), []);
  const rentalTerms = useMemo(() => getRentalTerms(), []);
  const facilities = useMemo(() => getFacilities(), []);
  const allUnits = useMemo(() => getAvailableUnits(), []);
  const sizeGuideTabs = useMemo(() => getSizeGuideTabs(), []);
  const highlights = useMemo(() => getHomeHighlights(), []);
  const trustBadges = useMemo(() => getHomeTrustBadges(), []);

  // Filter and sort available units
  const filteredUnits = useMemo(() => {
    return allUnits
      .filter((unit) => {
        // Location filter
        if (selectedLocation !== "all" && unit.facilityId !== selectedLocation) {
          return false;
        }

        // Type filter
        if (selectedType !== "all" && unit.type !== selectedType) {
          return false;
        }

        // Size filter
        if (selectedSize !== "all" && unit.sizeCategory !== selectedSize) {
          return false;
        }

        // Keyword filter
        if (searchKeyword.trim()) {
          const query = searchKeyword.toLowerCase();
          const matchCode = unit.unitCode.toLowerCase().includes(query);
          const matchFac = unit.facilityName.toLowerCase().includes(query);
          const matchAddr = unit.address.toLowerCase().includes(query);
          const matchType = unit.typeName.toLowerCase().includes(query);
          if (!matchCode && !matchFac && !matchAddr && !matchType) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.rentPrice - b.rentPrice;
        if (sortBy === "price-desc") return b.rentPrice - a.rentPrice;
        if (sortBy === "size") return b.areaM2 - a.areaM2;
        // Default: recommended (medium sizes / top discount first)
        return a.rentPrice - b.rentPrice;
      });
  }, [allUnits, selectedLocation, selectedType, selectedSize, searchKeyword, sortBy]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (selectedLocation !== "all" && f.locationId !== selectedLocation) {
        return false;
      }
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        return f.name.toLowerCase().includes(query) || f.address.toLowerCase().includes(query);
      }
      return true;
    });
  }, [facilities, selectedLocation, searchKeyword]);

  // Navigate to storage reservation detail with chosen unit
  const handleSelectUnit = (unit) => {
    navigate("/storage-detail", { state: { unit } });
  };

  const goToStorageDetail = () => {
    // If user clicked general reserve, pick the first available unit or default
    const fallbackUnit = filteredUnits[0] || allUnits[0];
    navigate("/storage-detail", { state: { unit: fallbackUnit } });
  };

  const resetFilters = () => {
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSize("all");
    setSelectedTerm("month");
    setSearchKeyword("");
    setSortBy("recommended");
  };

  return {
    // Filter controls
    selectedLocation,
    setSelectedLocation,
    selectedType,
    setSelectedType,
    selectedSize,
    setSelectedSize,
    selectedTerm,
    setSelectedTerm,
    searchKeyword,
    setSearchKeyword,
    resetFilters,

    // UI state
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    activeSizeTab,
    setActiveSizeTab,

    // Collections
    locations,
    storageTypes,
    sizeFilters,
    rentalTerms,
    filteredUnits,
    filteredFacilities,
    sizeGuideTabs,
    highlights,
    trustBadges,

    // Navigation
    handleSelectUnit,
    goToStorageDetail,
  };
}
