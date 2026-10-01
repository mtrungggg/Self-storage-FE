import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSizeFilters,
  getRentalTerms,
  getSizeGuideTabs,
  getHomeHighlights,
} from "../data/homeRepository";
import facilityService from "../api/facilityService";
import storageUnitService from "../api/storageUnitService";

const CLIMATE_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80";
const STANDARD_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80";

function sizeCategoryOf(areaM2) {
  if (areaM2 == null) return "all";
  if (areaM2 < 5) return "small";
  if (areaM2 < 10) return "medium";
  if (areaM2 < 20) return "large";
  return "vehicle";
}

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

  // Backend-sourced data
  const [facilities, setFacilities] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [rawUnits, setRawUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      facilityService.getFacilities(),
      facilityService.getUnitTypes(),
      storageUnitService.getAvailableUnits(),
    ])
      .then(([facilitiesRes, unitTypesRes, unitsRes]) => {
        if (!active) return;
        setFacilities(facilitiesRes);
        setUnitTypes(unitTypesRes);
        setRawUnits(unitsRes);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Không thể tải dữ liệu điểm kho. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Static UI reference data (not backend-driven)
  const sizeFilters = useMemo(() => getSizeFilters(), []);
  const rentalTerms = useMemo(() => getRentalTerms(), []);
  const sizeGuideTabs = useMemo(() => getSizeGuideTabs(), []);
  const highlights = useMemo(() => getHomeHighlights(), []);

  const facilityById = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);
  const unitTypeById = useMemo(() => new Map(unitTypes.map((t) => [t.id, t])), [unitTypes]);

  const locations = useMemo(
    () => [
      { id: "all", label: "All Locations" },
      ...facilities.map((f) => ({ id: String(f.id), label: `${f.name} • ${f.city}` })),
    ],
    [facilities]
  );

  const storageTypes = useMemo(() => {
    const list = [{ id: "all", label: "All Unit Types", icon: "warehouse" }];
    const seen = new Set();
    unitTypes.forEach((t) => {
      let label = t.name || "";
      if (label.toLowerCase().startsWith("extra large")) label = "Extra Large";
      else if (label.toLowerCase().includes("máy lạnh") || label.toLowerCase().includes("climate")) label = "Medium Climate";
      else if (label.toLowerCase().startsWith("large")) label = "Large";
      else if (label.toLowerCase().startsWith("medium")) label = "Medium";
      else if (label.toLowerCase().startsWith("mini")) label = "Mini";
      else if (label.toLowerCase().startsWith("small")) label = "Small";

      list.push({
        id: String(t.id),
        label,
        icon: t.climateControlled ? "device_thermostat" : "warehouse",
      });
    });
    return list;
  }, [unitTypes]);

  // Adapt raw storage units (backend shape) into the shape the UI cards expect
  const allUnits = useMemo(() => {
    return rawUnits.map((u) => {
      const facility = facilityById.get(u.facilityId);
      const unitType = unitTypeById.get(u.unitTypeId);
      return {
        id: u.id,
        unitCode: u.unitCode,
        facilityId: u.facilityId,
        facilityName: facility?.name || "",
        address: facility?.address || "",
        floor: [u.floorLabel && `Tầng ${u.floorLabel}`, u.zoneLabel && `Khu ${u.zoneLabel}`]
          .filter(Boolean)
          .join(" • "),
        unitTypeId: u.unitTypeId,
        typeName: (() => {
          let name = unitType?.name || "";
          if (name.toLowerCase().includes("extra large")) return "Extra Large";
          if (name.toLowerCase().includes("máy lạnh") || name.toLowerCase().includes("climate")) return "Medium Climate";
          if (name.toLowerCase().startsWith("large")) return "Large";
          if (name.toLowerCase().startsWith("medium")) return "Medium";
          if (name.toLowerCase().startsWith("small")) return "Small";
          if (name.toLowerCase().startsWith("mini")) return "Mini";
          return name.replace(/\s*16\s*m[2²]/gi, "").trim();
        })(),
        climateControlled: Boolean(unitType?.climateControlled),
        type: unitType?.climateControlled ? "climate" : "standard",
        sizeCategory: sizeCategoryOf(unitType?.areaM2),
        dimension: unitType ? `${unitType.widthM}m x ${unitType.lengthM}m` : "",
        sizeLabel: unitType ? `${unitType.widthM}m x ${unitType.lengthM}m` : "",
        areaM2: unitType?.areaM2 ?? null,
        height: unitType ? `${unitType.heightM}m` : "",
        volume: unitType ? `${unitType.volumeM3} m³` : "",
        fitNote: unitType?.description || "",
        rentPrice: u.monthlyRate,
        depositPrice: null,
        image: unitType?.climateControlled ? CLIMATE_IMAGE : STANDARD_IMAGE,
      };
    });
  }, [rawUnits, facilityById, unitTypeById]);

  const facilitiesWithFromPrice = useMemo(() => {
    return facilities.map((f) => {
      const unitsAtFacility = allUnits.filter((u) => u.facilityId === f.id);
      const minPrice = unitsAtFacility.reduce(
        (min, u) => (min == null || u.rentPrice < min ? u.rentPrice : min),
        null
      );
      return {
        id: f.id,
        locationId: String(f.id),
        name: f.name,
        address: f.address,
        badge: f.code,
        note: f.availableUnitCount > 0 ? `Còn ${f.availableUnitCount} ô kho trống` : "Hiện đã hết chỗ",
        noteTone: f.availableUnitCount > 0 ? "text-[#0e7b4c]" : "text-[#b45309]",
        availableCount: f.availableUnitCount,
        fromValue: minPrice,
        perks: [`Giờ mở cửa ${(f.openingTime || "").slice(0, 5)} - ${(f.closingTime || "").slice(0, 5)}`],
        image: STANDARD_IMAGE,
      };
    });
  }, [facilities, allUnits]);

  // Filter and sort available units
  const filteredUnits = useMemo(() => {
    return allUnits
      .filter((unit) => {
        // Location filter
        if (selectedLocation !== "all" && String(unit.facilityId) !== selectedLocation) {
          return false;
        }

        // Type filter
        if (selectedType !== "all") {
          if (selectedType === "climate") {
            if (!unit.climateControlled) return false;
          } else if (selectedType === "driveup") {
            return false; // not offered by backend yet
          } else if (String(unit.unitTypeId) !== selectedType) {
            return false;
          }
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
        if (sortBy === "size") return (b.areaM2 ?? 0) - (a.areaM2 ?? 0);
        // Default: recommended (medium sizes / top discount first)
        return a.rentPrice - b.rentPrice;
      });
  }, [allUnits, selectedLocation, selectedType, selectedSize, searchKeyword, sortBy]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilitiesWithFromPrice.filter((f) => {
      if (selectedLocation !== "all" && f.locationId !== selectedLocation) {
        return false;
      }
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        return f.name.toLowerCase().includes(query) || f.address.toLowerCase().includes(query);
      }
      return true;
    });
  }, [facilitiesWithFromPrice, selectedLocation, searchKeyword]);

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

    // Data loading state
    loading,
    error,

    // Navigation
    handleSelectUnit,
    goToStorageDetail,
  };
}
