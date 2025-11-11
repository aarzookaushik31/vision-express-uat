import React, { useEffect, useState } from "react";
import styles from "../styles/sections/locate-us.less";
import Location from "../assets/images/mage_location.png";
import LocationIcon from "../assets/images/locationIconPink.png";
import placeholderDesktop from "../assets/images/placeholder/slideshow-desktop2.jpg";
import placeholderMobile from "../assets/images/placeholder/slideshow-mobile2.jpg";
import StoreList from "../components/store-list/store-list.jsx";
import Modal from "../components/core/modal/modal.jsx";
import StoreDetails from "../components/store-details/store-details.jsx";
import CloseIcon from "../assets/images/close.svg";
import { useFPI } from "fdk-core/utils";
import useHeader from "../components/header/useHeader";

const BASE_URL = `${window.location.origin}`;

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

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const {
    backgroundImage,
    mobileBackgroundImage,
    heading,
    subheading,
    inputPlaceholder,
    buttonText,
    currentLocationText,
  } = props || {};




  const fpi = useFPI();
  const { supportInfo } = useHeader(fpi);

  const phoneArray = supportInfo?.contact?.phone?.phone ?? [];
  const defaultPhoneObj =
    Array.isArray(phoneArray) && phoneArray.length > 0 ? phoneArray[0] : null;

  const defaultPhone = defaultPhoneObj
    ? `${defaultPhoneObj.code ? `+${defaultPhoneObj.code}-` : ""}${defaultPhoneObj.number}`
    : "";


  const isWindow = typeof window !== "undefined";
  const isMobile = isWindow && window.innerWidth <= 768;

  const bgImage = isMobile
    ? mobileBackgroundImage?.value || placeholderMobile
    : backgroundImage?.value || placeholderDesktop;

  const [storeId, setStoreId] = useState(null);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
const [selectedCities, setSelectedCities] = useState([]);
   const [showCityModal, setShowCityModal] = useState(false);
   const [hasSearched, setHasSearched] = useState(false);


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
          setStores(res.data);

          console.log(res.data)
          if (!hasSearched) setFilteredStores(res.data);

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
    if (!filteredStores.length) return;

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
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=apikey";
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [filteredStores]);



  


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
  const currentLng =
    parseFloat(currentStore.store_longitude || currentStore.store_longitutde);

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




const handleUseMyLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const storesWithDistance = stores.map((store) => {
        const lat = parseFloat(store.store_latitude);
        const lng =
          parseFloat(store.store_longitutde) ||
          parseFloat(store.store_longitude);
        const distance = getDistance(userLat, userLng, lat, lng);
        return { ...store, distance };
      });

      const sortedStores = storesWithDistance
        .filter((s) => s.distance !== Infinity)
        .sort((a, b) => a.distance - b.distance);

      setFilteredStores(sortedStores);
      setError(null);
      setLoading(false);
    },
    (error) => {
      console.error("Location access denied:", error);
      alert("Unable to fetch location. Please allow location access.");
      setLoading(false);
    }
  );
};




const handleSearch = async (query = searchQuery) => {
  console.log("search start")
  setLoading(true);
  try {
    const res = await getLocateUsStoreAPISearch(query);
    if (res?.success && res?.data?.length) {
      setSelectedCities([]);
      setHasSearched(true);
      setFilteredStores(res.data);
      setError(null);
      
console.log("search query",query);
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


const handleCityFilter = (city) => {
   setSearchQuery("");
  setError(null);

  setSelectedCities((prev) => {
    if (prev.includes(city)) {
      const updated = prev.filter((c) => c !== city);
      if (updated.length === 0) {
        setFilteredStores(stores);
      } else {
        const selectedStores = stores.filter((s) =>
          updated
            .map((c) => c.toLowerCase())
            .includes(s.store_city?.toLowerCase())
        );
        setFilteredStores(selectedStores);
      }
      return updated;
    } else {
      const updated = [...prev, city];
      const selectedStores = stores.filter((s) =>
        updated
          .map((c) => c.toLowerCase())
          .includes(s.store_city?.toLowerCase())
      );
      setFilteredStores(selectedStores);
      return updated;
    }
  });

  setShowCityModal(false);
};


const handleClearFilter = () => {
  setSelectedCities([]);
  setFilteredStores(stores);
};


const allCities = Array.from(
  new Set(stores.map((store) => store.store_city).filter(Boolean))
);

const cities = [
  ...selectedCities.filter((city) => allCities.includes(city)),
  ...allCities.filter((city) => !selectedCities.includes(city)),
];



  if (storeId) {
    const selectedStore = stores.find(
      (store) => String(store.store_code) === String(storeId)
    );
    if (selectedStore)
      return (
        <section className={styles.storeDetailsWrapper}>
          <StoreDetails defaultPhone={defaultPhone}   nearbyStores={getNearbyStores(selectedStore, 2)} store={selectedStore} />
        </section>
      );
    return (
      <section className={styles.storeDetailsWrapper}>
        <p className={styles.loadingText}>Loading store details...</p>
      </section>
    );
  }

  return (
    <section>
      <div
        className={styles.storeLocatorSection}
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : "none" }}
      >
        <div className={styles.overlay}>
          <div className={styles.contentWrapper}>
            {heading?.value && (
              <h2 dangerouslySetInnerHTML={{ __html: heading.value }} />
            )}
            {subheading?.value && <p>{subheading.value}</p>}

            <div className={styles.inputGroup}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={inputPlaceholder?.value || "Enter Pincode / City"}
                className={styles.pincodeInput}
              />
              <button className={styles.locateButton}  onClick={() => handleSearch(searchQuery)}>
                <img src={Location} alt="locate" />{" "}
                {buttonText?.value || "Locate Stores"}
              </button>
            </div>

            <button
              className={styles.currentLocationButton}
              onClick={handleUseMyLocation}
              disabled={loading}
            >
              {loading
                ? "Detecting..."
                : currentLocationText?.value || "Or Use My Current Location"}{" "}
              <img src={LocationIcon} alt="location" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.cityFilterWrapper}>

        <div className={styles.cityFilterHeader}>
          <p>Choose your city from the list below to see all nearby stores</p>
         
          <div className={styles.filterButtonsGroup}>

             {selectedCities.length > 0 && (
  <button onClick={handleClearFilter} className={styles.clearFilterBtn}>
    Clear Filter
  </button>
)}


      <button className={styles.showcitiesBtn} onClick={() => setShowCityModal(!showCityModal)}>
        {showCityModal ? "Hide Cities" : "Show All Cities"}
      </button>
    </div>


        </div>

       <div className={styles.cityList}>
  {cities.map((city) => (
    <button
      key={city}
      onClick={() => handleCityFilter(city)}
      className={`${styles.cityButton} ${
        selectedCities.includes(city) ? styles.activeCity : ""
      }`}
    >
      {city}
    </button>
  ))}
</div>

      </div>

      <div className={styles.storeListWrapper}>
        <StoreList stores={filteredStores} loading={loading} error={error} defaultPhone={defaultPhone} />
        <div className={styles.mapContainer} id="storesMap"></div>
      </div>





<Modal
  isOpen={showCityModal}
  closeDialog={() => setShowCityModal(false)}
  modalType=""
  className="cityListModal"
>
  <div className={styles.cityModalLocateUs}>
    <p>Choose your city from the list below to see all nearby stores</p>

  <span className={styles.closeIcon} onClick={() => setShowCityModal(false)}>
              <CloseIcon  />
            </span>

  <div className={styles.cityModalList}>
  

    {cities
      .filter((city) => city.toLowerCase() !== "show all") 
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((city) => (
        <button
          key={city}
          onClick={() => handleCityFilter(city)}
         className={`${styles.cityModalButton} ${
  selectedCities.includes(city) ? styles.activeCity : ""
}`}

        >
          {city}
        </button>
      ))}
  </div>
  </div>
</Modal>






    </section>
  );
}

Component.displayName = "StoreLocatorComponent";
export default Component;
