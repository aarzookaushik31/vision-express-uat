import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/sections/locate-us.less";
// Reuse the exact popup styles already used on the homepage / book-test form
import popupStyles from "../styles/sections/location-access-popup.less";
import StoreList from "../components/store-list/store-list.jsx";
import Modal from "../components/core/modal/modal.jsx";
import StoreDetails from "../components/store-details/store-details.jsx";
import CloseIcon from "../assets/images/close.svg";
import { useFPI } from "fdk-core/utils";
import useHeader from "../components/header/useHeader";

// TODO: point these to your actual city icon files
import BangaloreIcon from "../assets/images/cities/bangalore.png";
import HyderabadIcon from "../assets/images/cities/hyderabad.png";
import PuneIcon from "../assets/images/cities/pune.png";
import ChennaiIcon from "../assets/images/cities/chennai.png";
import MumbaiIcon from "../assets/images/cities/mumbai.png";
import NagpurIcon from "../assets/images/cities/nagpur.png";
import DelhiNcrIcon from "../assets/images/cities/delhi.png";

const BASE_URL = `${window.location.origin}`;

// Same keys the homepage popup + book-test form use, so permission/coords are shared
const COORDS_KEY = "user_geo_coords";
const HOME_PROMPT_KEY = "location_prompt_status"; // 'granted' | 'denied' | 'dismissed'
// Page-level key so this popup isn't re-shown after "Not now" in the same session
const LOCATE_PROMPT_KEY = "locate_us_location_prompt";
const COORDS_MAX_AGE_MS = 30 * 60 * 1000; // reuse saved coords if newer than 30 min

const safeStorage = {
  get: (storage, key) => {
    try {
      return window[storage]?.getItem(key) ?? null;
    } catch (e) {
      return null;
    }
  },
  set: (storage, key, value) => {
    try {
      window[storage]?.setItem(key, value);
    } catch (e) {
      /* ignore (private mode etc.) */
    }
  },
};

const readStoredCoords = () => {
  try {
    const raw = safeStorage.get("localStorage", COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.latitude !== "number" ||
      typeof parsed?.longitude !== "number"
    )
      return null;
    if (Date.now() - (parsed.capturedAt || 0) > COORDS_MAX_AGE_MS) return null;
    return parsed;
  } catch (e) {
    return null;
  }
};

export const getLocateUsStoreAPI = async () => {
  try {
    const url = `${BASE_URL}/ext/store-locator/v1.0/getStores?perPage=500`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stores");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API error:", error);
    return null;
  }
};

export const getLocateUsStoreAPISearch = async (searchQuery) => {
  try {
    const url = `${BASE_URL}/ext/store-locator/v1.0/getStores?perPage=500&search=${searchQuery}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to search stores");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Search API error:", error);
    return null;
  }
};

// Cities shown as chips on the page (with icons). All other cities are
// only available inside the popup.
// `aliases` = extra store_city values that should match this chip.
const featuredCities = [
  { name: "Bangaluru", icon: BangaloreIcon, aliases: ["bengaluru", "bengalore"] },
  { name: "Hyderabad", icon: HyderabadIcon },
  { name: "Pune", icon: PuneIcon },
  { name: "Chennai", icon: ChennaiIcon },
  { name: "Mumbai", icon: MumbaiIcon },
  { name: "Nagpur", icon: NagpurIcon },
  {
    name: "Delhi NCR",
    icon: DelhiNcrIcon,
    aliases: ["delhi", "new delhi", "gurgaon", "gurugram", "noida", "ghaziabad", "faridabad"],
  },
];

// Expand selected city names (lowercase) with their aliases
const expandCities = (selected) => {
  const out = [];
  selected.forEach((c) => {
    const lc = c.toLowerCase();
    out.push(lc);
    const f = featuredCities.find((fc) => fc.name.toLowerCase() === lc);
    if (f?.aliases) out.push(...f.aliases);
  });
  return out;
};

// Mobile "Load More": first 5 stores, then 10 more per click
const MOBILE_INITIAL_COUNT = 5;
const MOBILE_LOAD_STEP = 10;

// Alphabetical order by store name
const sortByName = (list = []) =>
  [...list].sort((a, b) =>
    (a.store_name || "").localeCompare(b.store_name || "", undefined, {
      sensitivity: "base",
    })
  );

export function Component({ props }) {
  const {
    backgroundImage,
    mobileBackgroundImage,
    heading,
    subheading,
    inputPlaceholder,
    buttonText,
    popupHeading,
    popupDescription,
    popupAllowText,
    popupDenyText,
    popupIcon,
  } = props || {};

  const fpi = useFPI();
  const { supportInfo, globalConfig } = useHeader(fpi);

  const map_api_key = globalConfig?.map_api_key;

  const phoneArray = supportInfo?.contact?.phone?.phone ?? [];
  const defaultPhoneObj =
    Array.isArray(phoneArray) && phoneArray.length > 0 ? phoneArray[0] : null;

  const defaultPhone = defaultPhoneObj
    ? `${defaultPhoneObj.code ? `+${defaultPhoneObj.code}-` : ""}${defaultPhoneObj.number}`
    : "";

  const isWindow = typeof window !== "undefined";
  const isMobile = isWindow && window.innerWidth <= 768;

  // Optional background image (gradient is the default look)
  const bgImage = isMobile
    ? mobileBackgroundImage?.value
    : backgroundImage?.value;

  const [storeId, setStoreId] = useState(null);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mobile-only pagination
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768
  );
  const [visibleCount, setVisibleCount] = useState(MOBILE_INITIAL_COUNT);

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Start again from 5 whenever the list changes (search, city filter, sort)
  useEffect(() => {
    setVisibleCount(MOBILE_INITIAL_COUNT);
  }, [filteredStores]);

  const displayedStores = isMobileView
    ? filteredStores.slice(0, visibleCount)
    : filteredStores;
  const hasMoreStores = isMobileView && filteredStores.length > visibleCount;

  // Location popup
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [popupStatus, setPopupStatus] = useState("idle"); // idle | requesting
  const geoTriedRef = useRef(false); // location check runs once

  // Get store ID from URL
  useEffect(() => {
    if (isWindow) {
      const params = new URLSearchParams(window.location.search);

      // Store Code (for single store view)
      const id = params.get("storeCode");
      if (id) setStoreId(id);

      // Handle pincode search
      const pincode = params.get("pincode");
      if (pincode) {
        setSearchQuery(pincode);
        handleSearch(pincode);
        return;
      }

      const cityName = params.get("cityName");
      if (cityName) {
        setSearchQuery(cityName);
        if (stores.length) {
          const filtered = stores.filter(
            (s) =>
              s.store_city &&
              s.store_city.toLowerCase() === cityName.toLowerCase()
          );
          if (filtered.length) {
            setFilteredStores(filtered);
            setSelectedCities([cityName]);
            setHasSearched(true);
          } else {
            handleSearch(cityName);
          }
        }
      }
    }
  }, [isWindow, stores]);

  // Fetch all stores
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await getLocateUsStoreAPI();
        if (res?.success && res?.data?.length) {
          const sorted = sortByName(res.data);
          setStores(sorted);

          if (!hasSearched) setFilteredStores(sorted);

          setError(null);
        } else {
          setStores([]);
          setFilteredStores([]);
          setError("No stores found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stores");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // Google Maps Initialization
  useEffect(() => {
    if (!filteredStores.length || !map_api_key) return;

    const initMap = () => {
      const mapElement = document.getElementById("storesMap");
      if (!mapElement) return;

      const validStores = filteredStores.filter((store) => {
        const lat = parseFloat(store.store_latitude);
        const lng =
          parseFloat(store.store_longitutde) ||
          parseFloat(store.store_longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      const map = new window.google.maps.Map(mapElement, {
        zoom: 5,
        center: {
          lat: validStores.length
            ? parseFloat(validStores[0].store_latitude)
            : 20.5937,
          lng: validStores.length
            ? parseFloat(
                validStores[0].store_longitutde ||
                  validStores[0].store_longitude
              )
            : 78.9629,
        },
      });

      validStores.forEach((store) => {
        const lat = parseFloat(store.store_latitude);
        const lng =
          parseFloat(store.store_longitutde) ||
          parseFloat(store.store_longitude);

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: store.store_name,
        });

        const infowindow = new window.google.maps.InfoWindow({
          content: `
            <div style="min-width:200px;">
              <strong>${store.store_name}</strong><br/>
              ${store.store_city || ""}, ${store.store_state || ""}<br/>
              <a href="?storeId=${store._id}" style="color:#1976d2;text-decoration:underline;">View Details</a>
            </div>
          `,
        });

        marker.addListener("click", () => infowindow.open(map, marker));
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${map_api_key}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [filteredStores, map_api_key]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearbyStores = (currentStore, limit = 2) => {
    if (!currentStore || !stores.length) return [];

    const currentLat = parseFloat(currentStore.store_latitude);
    const currentLng = parseFloat(
      currentStore.store_longitude || currentStore.store_longitutde
    );

    if (isNaN(currentLat) || isNaN(currentLng)) return [];

    const nearby = stores
      .filter((s) => s._id !== currentStore._id)
      .map((s) => {
        const lat = parseFloat(s.store_latitude);
        const lng = parseFloat(s.store_longitude || s.store_longitutde);
        const distance = getDistance(currentLat, currentLng, lat, lng);
        return { ...s, distance };
      })
      .filter((s) => s.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    if (!nearby.length) {
      const sameCityStores = stores
        .filter(
          (s) =>
            s.store_city?.toLowerCase() ===
              currentStore.store_city?.toLowerCase() &&
            s._id !== currentStore._id
        )
        .slice(0, limit);
      return sameCityStores;
    }

    return nearby;
  };

  /* ---------- Location: sort stores nearest-first ---------- */
  const applyNearestSort = (userLat, userLng) => {
    const sorted = stores
      .map((store) => {
        const lat = parseFloat(store.store_latitude);
        const lng =
          parseFloat(store.store_longitutde) ||
          parseFloat(store.store_longitude);
        return { ...store, distance: getDistance(userLat, userLng, lat, lng) };
      })
      .filter((s) => s.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance);

    if (!sorted.length) return;
    setFilteredStores(sorted);
    setError(null);
  };

  // Ask the browser for the position, save it (shared with other pages)
  // and sort stores by distance.
  const requestPositionAndApply = (onDone) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;

        safeStorage.set(
          "localStorage",
          COORDS_KEY,
          JSON.stringify({ latitude, longitude, capturedAt: Date.now() })
        );
        safeStorage.set("localStorage", HOME_PROMPT_KEY, "granted");

        applyNearestSort(latitude, longitude);

        window.dispatchEvent(
          new CustomEvent("user-location-updated", {
            detail: { latitude, longitude },
          })
        );
        onDone?.(true);
      },
      () => onDone?.(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  // Runs once when stores are loaded:
  //   granted  -> sort nearest-first silently (no popup)
  //   prompt   -> show the popup
  //   denied   -> do nothing
  useEffect(() => {
    if (!stores.length || geoTriedRef.current) return;
    geoTriedRef.current = true;

    // An explicit URL search/store always wins over location
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("storeCode") ||
      params.get("pincode") ||
      params.get("cityName")
    )
      return;
    if (!("geolocation" in navigator)) return;

    const decide = (permissionState) => {
      if (permissionState === "granted") {
        const stored = readStoredCoords();
        if (stored) applyNearestSort(stored.latitude, stored.longitude);
        else requestPositionAndApply();
        return;
      }

      if (permissionState === "prompt") {
        const alreadyDismissed =
          safeStorage.get("sessionStorage", LOCATE_PROMPT_KEY) === "dismissed";
        if (!alreadyDismissed) setShowLocationPopup(true);
      }
      // "denied" -> nothing to do
    };

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((res) => decide(res.state))
        .catch(() => decide("prompt"));
    } else {
      // Older browsers without the Permissions API
      const stored = readStoredCoords();
      if (stored) applyNearestSort(stored.latitude, stored.longitude);
      else if (safeStorage.get("localStorage", HOME_PROMPT_KEY) !== "denied")
        decide("prompt");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

  /* ---------- Popup handlers ---------- */
  const closeLocationPopup = (mark) => {
    setShowLocationPopup(false);
    setPopupStatus("idle");
    if (mark) safeStorage.set("sessionStorage", LOCATE_PROMPT_KEY, mark);
  };

  const handleAllowLocation = () => {
    setPopupStatus("requesting");
    requestPositionAndApply((granted) => {
      closeLocationPopup(granted ? "granted" : "denied");
    });
  };

  const handleDismissLocation = () => {
    closeLocationPopup("dismissed");
  };

  const handleSearch = async (query = searchQuery) => {
    setLoading(true);
    try {
      const res = await getLocateUsStoreAPISearch(query);
      if (res?.success && res?.data?.length) {
        setSelectedCities([]);
        setHasSearched(true);
        setFilteredStores(sortByName(res.data));
        setError(null);
      } else {
        setFilteredStores([]);
        setError(`No stores found for "${query}"`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to search stores");
    } finally {
      setLoading(false);
    }
  };

  const filterStoresByCities = (cityList) => {
    if (cityList.length === 0) return stores;
    const wanted = expandCities(cityList);
    return stores.filter((s) => wanted.includes(s.store_city?.toLowerCase()));
  };

  // Click on a city chip on the page (toggle)
  const handleCityFilter = (city) => {
    setSearchQuery("");
    setError(null);

    const updated = selectedCities.includes(city)
      ? selectedCities.filter((c) => c !== city)
      : [...selectedCities, city];

    setSelectedCities(updated);
    setFilteredStores(filterStoresByCities(updated));
    setShowCityModal(false);
  };

  // "Apply" in the popup
  const applyCityFilter = () => {
    setFilteredStores(filterStoresByCities(selectedCities));
    setShowCityModal(false);
  };

  // Toggle a city inside the popup (applied on "Apply")
  const selectCityFilter = (city) => {
    setSearchQuery("");
    setError(null);

    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handleClearFilter = () => {
    setSelectedCities([]);
    setFilteredStores(stores);
  };

  // All cities (popup only)
  const allCities = Array.from(
    new Set(stores.map((store) => store.store_city).filter(Boolean))
  );

  if (storeId) {
    const selectedStore = stores.find(
      (store) => String(store.store_code) === String(storeId)
    );
    if (selectedStore)
      return (
        <section className={styles.storeDetailsWrapper}>
          <StoreDetails
            defaultPhone={defaultPhone}
            map_api_key={map_api_key}
            nearbyStores={getNearbyStores(selectedStore, 6)}
            store={selectedStore}
          />
        </section>
      );
    return (
      <section className={styles.storeDetailsWrapper}>
        <p className={styles.loadingText}></p>
      </section>
    );
  }

  return (
    <section>
      <div
        className={`${styles.storeLocatorSection} ${
          bgImage ? styles.hasBgImage : ""
        }`}
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        <div className={styles.overlay}>
          <div className={styles.contentWrapper}>
            {/* ---------- Header: heading + search ---------- */}
            <div className={styles.headerRow}>
              <div className={styles.headingBlock}>
                {heading?.value && (
                  <h2 dangerouslySetInnerHTML={{ __html: heading.value }} />
                )}
                {subheading?.value && <p>{subheading.value}</p>}
              </div>

              <div className={styles.searchBlock}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch(searchQuery);
                    }}
                    placeholder={
                      inputPlaceholder?.value || "Search by city or pincode"
                    }
                    className={styles.pincodeInput}
                  />
                  <button
                    className={styles.locateButton}
                    onClick={() => handleSearch(searchQuery)}
                  >
                    {buttonText?.value || "Find Store"}
                  </button>
                </div>
              </div>
            </div>

            {/* ---------- City chips ---------- */}
            <div className={styles.cityFilterWrapper}>
              <div className={styles.chipBar}>
                <div className={styles.cityList}>
                  {/* Opens the all-cities popup */}
                  <button
                    type="button"
                    className={styles.walkinChip}
                    onClick={() => setShowCityModal(true)}
                  >
                    Walk-in , We’re in {allCities.length || 20}+ Cities
                  </button>

                  {featuredCities.map(({ name, icon }) => (
                    <button
                      key={name}
                      onClick={() => handleCityFilter(name)}
                      className={`${styles.cityButton} ${
                        selectedCities.includes(name) ? styles.activeCity : ""
                      }`}
                    >
                      {icon && <img src={icon} alt="" />}
                      {name}
                    </button>
                  ))}
                </div>

                {selectedCities.length > 0 && (
                  <div className={styles.chipControls}>
                    <button
                      onClick={handleClearFilter}
                      className={styles.clearFilterBtn}
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ---------- List + Map ---------- */}
            <div className={styles.storeListWrapper}>
              <div className={styles.storeListColumn}>
                <StoreList
                  stores={displayedStores}
                  loading={loading}
                  error={error}
                  defaultPhone={defaultPhone}
                />

                {hasMoreStores && (
                  <div className={styles.loadMoreWrapper}>
                    <button
                      type="button"
                      className={styles.loadMoreBtn}
                      onClick={() =>
                        setVisibleCount((prev) => prev + MOBILE_LOAD_STEP)
                      }
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.mapContainer} id="storesMap"></div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCityModal}
        closeDialog={() => setShowCityModal(false)}
        modalType=""
        className="cityListModal"
      >
        <div className={styles.cityModalLocateUs}>
          <p>Choose your city from the list below to see all nearby stores</p>

          <span
            className={styles.closeIcon}
            onClick={() => setShowCityModal(false)}
          >
            <CloseIcon />
          </span>

          <div className={styles.cityModalList}>
            {allCities
              .filter((city) => city.toLowerCase() !== "show all")
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((city) => (
                <button
                  key={city}
                  onClick={() => selectCityFilter(city)}
                  className={`${styles.cityModalButton} ${
                    selectedCities.includes(city) ? styles.activeCity : ""
                  }`}
                >
                  {city}
                </button>
              ))}
          </div>

          <div className={styles.applycityfilterContainer}>
            <button
              className={styles.applycityfilterbtn}
              onClick={applyCityFilter}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>

      {/* Location access popup (same look as the homepage / book-test popup) */}
      {showLocationPopup && (
        <div className={popupStyles.overlay} role="dialog" aria-modal="true">
          <div className={popupStyles.popup}>
            <button
              type="button"
              className={popupStyles.closeBtn}
              onClick={handleDismissLocation}
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {popupIcon?.value && (
              <div className={popupStyles.iconWrap}>
                <img width={200} height={40} src={popupIcon.value} alt="" />
              </div>
            )}

            <h3 className={popupStyles.heading}>
              {popupHeading?.value || "Enable your location"}
            </h3>
            <p className={popupStyles.description}>
              {popupDescription?.value ||
                "Allow location access and we'll show the stores nearest to you first."}
            </p>

            <div className={popupStyles.actions}>
              <button
                type="button"
                className={popupStyles.allowBtn}
                onClick={handleAllowLocation}
                disabled={popupStatus === "requesting"}
              >
                {popupStatus === "requesting"
                  ? "Requesting..."
                  : popupAllowText?.value || "Allow Location"}
              </button>
              <button
                type="button"
                className={popupStyles.denyBtn}
                onClick={handleDismissLocation}
              >
                {popupDenyText?.value || "Not now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export const settings = {
  label: "Store Locator",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Find A Store Near You",
    },
    {
      id: "subheading",
      type: "text",
      label: "Sub Heading",
      default: "",
    },
    {
      id: "inputPlaceholder",
      type: "text",
      label: "Search Placeholder",
      default: "Search by city or pincode",
    },
    {
      id: "buttonText",
      type: "text",
      label: "Locate Button Text",
      default: "Find Store",
    },
    {
      id: "popupHeading",
      type: "text",
      label: "Location Popup Heading",
      default: "Enable your location",
    },
    {
      id: "popupDescription",
      type: "textarea",
      label: "Location Popup Description",
      default:
        "Allow location access and we'll show the stores nearest to you first.",
    },
    {
      id: "popupAllowText",
      type: "text",
      label: "Location Popup Allow Button Text",
      default: "Allow Location",
    },
    {
      id: "popupDenyText",
      type: "text",
      label: "Location Popup Deny Button Text",
      default: "Not now",
    },
    {
      id: "popupIcon",
      type: "image_picker",
      label: "Location Popup Icon (optional)",
    },
    {
      id: "backgroundImage",
      type: "image_picker",
      label: "Desktop Background Image (optional)",
    },
    {
      id: "mobileBackgroundImage",
      type: "image_picker",
      label: "Mobile Background Image (optional)",
    },
  ],
};

export default Component;