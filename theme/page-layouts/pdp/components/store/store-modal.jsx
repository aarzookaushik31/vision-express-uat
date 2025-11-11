import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import StoreItem from "./store-item";
import styles from "./store-modal.less";
import { useGlobalTranslation } from "fdk-core/utils";
import Loader from "../../../../components/loader/loader";
import CloseIcon from "../../../../assets/images/close.svg";
import LocationIcon from "../../../../assets/images/locationIconPink.png";
import ArrowDownIcon from "../../../../assets/images/arrow-down.svg";

function StoreModal({
  isOpen,
  buybox,
  allStoresInfo,
  onCloseDialog,
  addItemForCheckout,
  getProductSellers,
  isSellerLoading,
}) {
  const { t } = useGlobalTranslation("translation");

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isViewMore, setIsViewMore] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [useLocationMode, setUseLocationMode] = useState(false); // persistent flag
  const pageSize = 4;

  // 🧠 When modal opens, automatically fetch based on last mode
  useEffect(() => {
    if (isOpen) {
      if (useLocationMode) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            getProductSellers("nearby", latitude, longitude);
          },
          (error) => {
            console.error("Geolocation error:", error);
            getProductSellers(); // fallback
          }
        );
      } else {
        getProductSellers();
      }
    }
  }, [isOpen]);

  // ✅ Extract unique city list
  const cityList = [
    "All Cities",
    ...Array.from(
      new Set((allStoresInfo?.items || []).map((store) => store.city || ""))
    ).filter(Boolean),
  ];

  // ✅ Filter stores by city
  const filteredItems =
    selectedCity === "All Cities"
      ? allStoresInfo?.items || []
      : (allStoresInfo?.items || []).filter(
          (store) => store.city === selectedCity
        );

  const getListingItems = isViewMore
    ? filteredItems.slice(0, pageSize)
    : filteredItems;

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getProductSellers("nearby", latitude, longitude);
        setUseLocationMode(true); // ✅ remember mode
        setSelectedCity("All Cities");
        setShowSortDropdown(false);
        setIsViewMore(true);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to fetch your location. Please allow location access.");
      }
    );
  };

  const handleShowAllStores = () => {
    getProductSellers();
    setUseLocationMode(false);
    setSelectedCity("All Cities");
    setShowSortDropdown(false);
    setIsViewMore(true);
  };

  const storeSelected = (event, item, isBuyNow) => {
    addItemForCheckout(event, isBuyNow, item);
  };

  const onViewMore = () => setIsViewMore(false);

  const closeDialog = () => {
    onCloseDialog();
    setShowSortDropdown(false);
  };

  const isSellerListing = buybox?.is_seller_buybox_enabled;
  const isDataLoading = !Object.keys(allStoresInfo || {}).length;

  return (
    <div>
      {isOpen && (
        <div className={`${styles.sidebarContainer} ${styles.fontBody}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={`${styles.sellerLabel} ${styles.fontHeader}`}>
              {isSellerListing
                ? t("resource.common.seller")
                : "Available In-Store Near You"}
            </h3>
            <span onClick={closeDialog}>
              <CloseIcon className={styles.closeIcon} />
            </span>
          </div>

          <div className={styles.sidebarBody}>
            {isDataLoading ? (
              <Loader />
            ) : (
              <>
                {/* City dropdown */}
                <div className={`${styles.sortWrapper} ${styles.closeSortDropdown}`}>
                  <button
                    type="button"
                    className={`${styles.sortButton} ${styles.flexAlignCenter} ${styles.justifyBetween} ${styles.fontBody}`}
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <p className={`b1 ${styles.selectedOption}`} title={selectedCity}>
                      {selectedCity}
                    </p>
                    <ArrowDownIcon
                      className={`${styles.dropdownArrow} ${
                        showSortDropdown ? styles.rotateArrow : ""
                      }`}
                    />
                  </button>
                  <ul
                    className={styles.sortDropdown}
                    style={{ display: showSortDropdown ? "block" : "none" }}
                  >
                    {cityList.map((city, index) => (
                      <li
                        key={index}
                        className={`b1 ${city === selectedCity ? styles.selectedOption : ""}`}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowSortDropdown(false);
                        }}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Location button */}
                <button
                  type="button"
                  className={`${styles.useLocationBtn} ${
                    useLocationMode ? styles.activeBtn : ""
                  }`}
                  onClick={
                    useLocationMode ? handleShowAllStores : handleUseMyLocation
                  }
                >
                  <img src={LocationIcon} alt="location" />
                  {useLocationMode
                    ? "Show all stores"
                    : "Use my current location"}
                </button>

                {/* Store count */}
                <h5 className={styles.storeCounts}>
                  {`${filteredItems.length} ${
                    isSellerListing ? "sellers" : "stores"
                  } available${
                    selectedCity !== "All Cities" ? ` in ${selectedCity}` : ""
                  }`}
                </h5>

                {isSellerLoading ? (
                  <Loader />
                ) : (
                  <>
                    <div className={styles.data}>
                      {getListingItems.map((item, index) => (
                        <StoreItem
                          key={index}
                          storeitem={item}
                          buybox={buybox}
                          onSelectStoreItem={(event, item, isBuyNow) =>
                            storeSelected(event, item, isBuyNow)
                          }
                        />
                      ))}
                    </div>

                    {isViewMore && filteredItems.length > pageSize && (
                      <div
                        className={`${styles.viewMoreWrapper} ${styles.flexCenter}`}
                      >
                        <button
                          type="button"
                          onClick={onViewMore}
                          className={styles.viewMoreBtn}
                        >
                          {t("resource.facets.view_more")}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className={`${styles.overlay} ${styles.show}`}
          onClick={closeDialog}
        />
      )}
    </div>
  );
}

StoreModal.propTypes = {
  isOpen: PropTypes.bool,
  onCloseDialog: PropTypes.func,
};

export default StoreModal;
