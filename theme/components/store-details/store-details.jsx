import React, { useState, useEffect } from "react";
import styles from "./store-details.less";
import placeholderImage from "../../assets/images/storeImagePlaceholder.png";
import CardplaceholderImage from "../../assets/images/placeholder/store-image-placeholder.png";
import PhoneIcon from "../../assets/images/phone.png";
import Purchase from "../../assets/images/purchase.png";
import Eye from "../../assets/images/eyeicon.png";
import Repair from "../../assets/images/repairIcon.png";
import Replacement from "../../assets/images/replacementIcon.png";
import ShareDesktopIcon from "../../assets/images/share-04.svg";
import ShareItem from "../../components/share-item/share-item";
import GoogleRating from "./store-ratings.jsx";
import phoneIcon from "../../assets/images/phoneicon.png";
import BookCalender from "../../assets/images/bookcalender.png";

const StoreDetails = ({ store, defaultPhone, nearbyStores = [] }) => {
  const [showSocialLinks, setShowSocialLinks] = useState(false);
 const [googleData, setGoogleData] = useState(null);

  if (!store) {
    return <div className={styles.error}>Store details not available.</div>;
  }

  const {
    store_name,
    store_image = [],
    store_address_line_1,
    store_address_line_2,
    store_city,
    store_state,
    store_pincode,
    store_latitude,
    store_longitude,
    store_longitutde,
    store_phone,
    store_timings,
  } = store;

  const latitude = store_latitude;
  const longitude = store_longitude || store_longitutde;

  // ---- Clean address ----
  const addressParts = [
    store_address_line_1,
    store_address_line_2,
    store_city,
    store_state,
    store_pincode,
  ];

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/\s+/g, " ")
      .trim();

  const cleanAddress = addressParts
    .map((part) => part?.trim().replace(/,+$/, ""))
    .filter(Boolean)
    .join(", ")
    .replace(/,+/g, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s{2,}/g, " ");

  const formattedAddress = toTitleCase(cleanAddress);

  const mapSrc = `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=15&output=embed`;

  // ---- Phone ----
  let contactNumber = "";
  if (store_phone && store_phone.trim() !== "") {
    contactNumber = store_phone;
  } else if (defaultPhone) {
    contactNumber = defaultPhone;
  }

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const description = `${store_name} - located at ${formattedAddress}. Visit us today for eye check-ups, eyewear, and more!`;

  const handleShare = async () => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: store_name,
          text: description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Sharing failed:", error);
      }
    } else {
      setShowSocialLinks(true);
    }
  };







useEffect(() => {
    const fetchRatingsOnce = async () => {
      try {
        const maps = await new Promise((resolve, reject) => {
          if (window.google?.maps?.places) return resolve(window.google.maps);
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDOoSC7Ny7q7JBAAHmIBE0UTkPCZqaop9E&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () =>
            window.google?.maps?.places
              ? resolve(window.google.maps)
              : reject("Google Maps not available");
          script.onerror = () => reject("Failed to load Google Maps");
          document.body.appendChild(script);
        });

        const service = new maps.places.PlacesService(document.createElement("div"));
        const request = {
          query: `Vision Express ${formattedAddress}`,
          fields: ["place_id", "name", "formatted_address"],
        };

        service.findPlaceFromQuery(request, (results, status) => {
          if (status === maps.places.PlacesServiceStatus.OK && results.length) {
            const place = results[0];
            const detailsRequest = {
              placeId: place.place_id,
              fields: ["name", "rating", "user_ratings_total", "reviews"],
            };

            service.getDetails(detailsRequest, (details, status2) => {
              if (status2 === maps.places.PlacesServiceStatus.OK && details) {
                setGoogleData({
                  ratingData: {
                    name: details.name,
                    rating: details.rating || 0,
                    total: details.user_ratings_total || 0,
                  },
                  reviews: details.reviews || [],
                });
              }
            });
          }
        });
      } catch (e) {
        console.error("Error preloading Google data:", e);
      }
    };

    fetchRatingsOnce();
  }, [formattedAddress]);









  return (
    <section className={styles.storeDetailsSection}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <p>
          <a href="/">Home</a> / <a href="/stores">Stores</a> /{" "}
          <span>{store_city}</span> / <strong>{store_name}</strong>
        </p>
      </div>

      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={styles.imageCarousel}>
          <img src={store_image[0] || placeholderImage} alt={store_name} />
        </div>

        <div className={styles.infoBlock}>
          <h1 className={styles.storeName}>{store_name}</h1>

        {googleData && (
  <GoogleRating preFetchedData={googleData} fetchReviews={false} />
)}

          <p className={styles.address}>{formattedAddress}</p>

          {contactNumber && (
            <div className={styles.phoneRow}>
              <img src={PhoneIcon} alt="phone" />
              <a href={`tel:${contactNumber}`}>{contactNumber}</a>
            </div>
          )}

          <div className={styles.actionButtons}>
            <a
             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              "Vision Express, " + formattedAddress
             )}`}

              target="_blank"
              rel="noreferrer"
              className={styles.primaryBtn}
            >
              Get Directions
            </a>
            <a  href={`/sections/book-an-eye-test?storeCode=${store.store_code}`} className={styles.outlineBtn}>
              Book Appointment
            </a>

            <div className={styles.shareContainer}>
              <span
                className={styles.shareIcon}
                onClick={() => setShowSocialLinks(true)}
              >
                <ShareDesktopIcon />
              </span>
              {showSocialLinks && (
                <ShareItem
                  setShowSocialLinks={setShowSocialLinks}
                  handleShare={() => handleShare()}
                  description={description}
                />
              )}
            </div>
          </div>

          {/* Services */}
          <div className={styles.servicesOffered}>
            <h3>Services Offered</h3>
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <div className={styles.iconCircle}>
                  <img src={Purchase} alt="Purchase" />
                </div>
                <p>Purchase</p>
              </div>

              <div className={styles.serviceCard}>
                <div className={styles.iconCircle}>
                  <img src={Eye} alt="Eye" />
                </div>
                <p>Eye</p>
              </div>

              <div className={styles.serviceCard}>
                <div className={styles.iconCircle}>
                  <img src={Repair} alt="Repair" />
                </div>
                <p>Repair</p>
              </div>

              <div className={styles.serviceCard}>
                <div className={styles.iconCircle}>
                  <img src={Replacement} alt="Replacement" />
                </div>
                <p>Replacement</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className={styles.locationSection}>
            <h3>Location</h3>

            {store_timings && (store_timings.weekdays || store_timings.weekends) && (
              <p className={styles.timings}>
                {store_timings?.weekdays && <>MON - FRI: {store_timings.weekdays}</>}
                {store_timings?.weekdays && store_timings?.weekends && " | "}
                {store_timings?.weekends && <>SAT - SUN: {store_timings.weekends}</>}
              </p>
            )}
            {latitude && longitude && (
              <iframe
                src={mapSrc}
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            )}
          </div>

          {/* Reviews Section */}
          {googleData && (
  <GoogleRating preFetchedData={googleData} fetchReviews={true} />
)}
        </div>
      </div>

      {/* Nearby Stores Section */}
      {nearbyStores.length > 0 && (
        <div className={styles.nearbyStoresSection}>
          <h3>More Stores Near You</h3>
          <ul className={styles.nearbyStoreList}>
            {nearbyStores.slice(0, 2).map((s, idx) => {
              const imageUrl = (s.store_image && s.store_image[0]) || CardplaceholderImage;
     

              const addressParts = [
                s.store_address_line_1,
                s.store_address_line_2,
                s.store_city,
                s.store_state,
                s.store_pincode,
              ];

              const cleanAddr = addressParts
                .map((p) => p?.trim().replace(/,+$/, ""))
                .filter(Boolean)
                .join(", ")
                .replace(/,+/g, ",")
                .replace(/\s*,\s*/g, ", ")
                .replace(/\s{2,}/g, " ");

              const formattedAddr = toTitleCase(cleanAddr);

                      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Vision Express, " + formattedAddr
)}`;


              let contactNumber = "";
              if (typeof s.phone_number === "object" && s.phone_number !== null) {
                contactNumber = `${s.phone_number.code ? `+${s.phone_number.code}-` : ""}${s.phone_number.number}`;
              } else if (typeof s.phone_number === "string" && s.phone_number.trim() !== "") {
                contactNumber = s.phone_number;
              } else if (defaultPhone) {
                contactNumber = defaultPhone;
              }

              return (
                <li key={s._id || idx} className={styles.nearbyStoreCard}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={imageUrl}
                      alt={s.store_name}
                      className={styles.storeImage}
                    />
                  </div>

                  <div className={styles.storeContent}>
                    <h4 className={styles.storeName}>{s.store_name}</h4>
                    <p className={styles.storeAddress}>{formattedAddr}</p>

                    <div className={styles.phonebookContainer}>
                      {contactNumber && (
                        <p>
                          <img src={phoneIcon} alt="Phone Icon" />
                          <a href={`tel:${contactNumber}`}>{contactNumber}</a>
                        </p>
                      )}

                      <p>
                        <img src={BookCalender} alt="Book Appointment" />
                        <a href={`/sections/book-an-eye-test?storeCode=${s.store_code}`}>Book Appointment</a>
                      </p>
                    </div>

                    <div className={styles.buttonGroup}>
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.directionBtn}
                      >
                        Get Direction
                      </a>
                      <a
                        href={`/locate-us?storeCode=${s.store_code}`}
                        className={styles.detailsBtn}
                      >
                        Store Details
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};

export default StoreDetails;
