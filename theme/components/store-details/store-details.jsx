import React, { useState, useEffect } from "react";
import styles from "./store-details.less";
import placeholderImage from "../../assets/images/placeholder/Store-detail-placeholder-image.png";
import CardplaceholderImage from "../../assets/images/placeholder/Store-detail-placeholder-image.png";
import PhoneIcon from "../../assets/images/store-phone.svg";
import Purchase from "../../assets/images/store-purchase.svg";
import Eye from "../../assets/images/store-eye-test.svg";
// Original repair asset: import Repair from "../../assets/images/repairIcon.png";
import Repair from "../../assets/images/store-details/repair.webp";
import Replacement from "../../assets/images/replacementIcon.png";
import ShareDesktopIcon from "../../assets/images/share-04.svg";
import ShareItem from "../../components/share-item/share-item";
import GoogleRating from "./store-ratings.jsx";
import AddressIcon from "../../assets/images/store-location.svg";
import ClockIcon from "../../assets/images/store-clock.svg";
import BookCalender from "../../assets/images/bookcalender.png";
import Slider from "react-slick";
import NearbyPrevious from "../../assets/images/store-details/nearby-previous.svg";
import NearbyNext from "../../assets/images/store-details/nearby-next.svg";
import DirectionsArrow from "../../assets/images/store-details/directions.svg";
import ReviewPreviewAvatar from "../../assets/images/store-details/review-preview-avatar.webp";

// Original props: const StoreDetails = ({ store, map_api_key, defaultPhone, nearbyStores = [] }) => {
const StoreDetails = ({ store, map_api_key, defaultPhone, nearbyStores = [], reviewPreview = false }) => {
  const [showSocialLinks, setShowSocialLinks] = useState(false);
 const [googleData, setGoogleData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  if (!store) {
    return <div className={styles.error}>Store details not available.</div>;
  }



  const getTagNumber = (store) => {
  const raw = store.store_tag ?? store.tags ?? store.tag;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const match = list
    .map((t) => String(t).trim())
    .find((t) => /^\+?\d[\d\s-]{8,}$/.test(t));
  return match || "";
};


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
    phone_number,
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
      // --- Phone Logic (number comes from Store Tag) ---
let contactNumber = getTagNumber(store);

if (!contactNumber && defaultPhone) {
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
    setReviewsLoading(true);
    const previewTimeout = setTimeout(() => setReviewsLoading(false), 10000);
    const fetchRatingsOnce = async () => {
      const debug = (stage, data = {}) => console.info("[StoreReviews] " + stage, data);
      debug("fetch started", {
        keyPresent: Boolean(map_api_key),
        storeName: store_name,
        addressPresent: Boolean(formattedAddress),
        origin: window.location.origin,
        mapsAvailable: Boolean(window.google?.maps),
        placesAvailable: Boolean(window.google?.maps?.places),
        existingMapScripts: document.querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]').length,
      });
      if (!map_api_key) {
        debug("waiting for configured Maps key");
        setReviewsLoading(false);
        return;
      }
      try {
        const maps = await new Promise((resolve, reject) => {
          if (window.google?.maps?.places) {
            debug("reusing existing Places library");
            return resolve(window.google.maps);
          }
          debug("loading Google Maps script");
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${map_api_key}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            debug("script load event", { mapsAvailable: Boolean(window.google?.maps), placesAvailable: Boolean(window.google?.maps?.places) });
            return window.google?.maps?.places ? resolve(window.google.maps) : reject("Google Maps not available");
          };
          script.onerror = () => {
            console.error("[StoreReviews] Google Maps script failed to load");
            reject("Failed to load Google Maps");
          };
          document.body.appendChild(script);
        });

        const service = new maps.places.PlacesService(document.createElement("div"));
        const request = {
          query: `Vision Express ${formattedAddress}`,
          fields: ["place_id", "name", "formatted_address"],
        };

        debug("store lookup requested", { query: request.query });
        service.findPlaceFromQuery(request, (results, status) => {
          debug("store lookup completed", { status, resultCount: results?.length || 0 });
          if (status !== maps.places.PlacesServiceStatus.OK || !results?.length) console.warn("[StoreReviews] Store lookup failed or returned no matches", { status });
          if (status !== maps.places.PlacesServiceStatus.OK || !results?.length) setReviewsLoading(false);
          if (status === maps.places.PlacesServiceStatus.OK && results.length) {
            const place = results[0];
            const detailsRequest = {
              placeId: place.place_id,
              // Original fields: ["name", "rating", "user_ratings_total", "reviews", "photos"],
              fields: ["name", "rating", "user_ratings_total", "reviews", "photos", "url"],
            };

          debug("place details requested", { placeId: place.place_id });
          service.getDetails(detailsRequest, (details, status2) => {
            setReviewsLoading(false);
            debug("place details completed", { status: status2, detailsPresent: Boolean(details), rating: details?.rating, totalReviews: details?.user_ratings_total, returnedReviewCount: details?.reviews?.length || 0 });
            if (status2 !== maps.places.PlacesServiceStatus.OK || !details) console.warn("[StoreReviews] Place details failed", { status: status2 });
  if (status2 === maps.places.PlacesServiceStatus.OK && details) {

    let googlePhoto = null;

    if (details.photos && details.photos.length > 0) {
      googlePhoto = details.photos[0].getUrl({
        maxWidth: 800,
        maxHeight: 600,
      });
    }

    debug("saving Google review data", { reviewCount: details.reviews?.length || 0 });
    setGoogleData({
      ratingData: {
        name: details.name,
        rating: details.rating || 0,
        total: details.user_ratings_total || 0,
      },
      reviews: details.reviews || [],
      photo: googlePhoto,
      url: details.url,
    });
  }
});
          }
        });
      } catch (e) {
        setReviewsLoading(false);
        console.error("Error preloading Google data:", e);
      }
    };

    fetchRatingsOnce();
    return () => clearTimeout(previewTimeout);
    // Original dependency: }, [formattedAddress]);
  }, [formattedAddress, map_api_key]);


useEffect(() => {
  console.info("[StoreReviews] runtime key availability", { keyPresent: Boolean(map_api_key) });
}, [map_api_key]);

useEffect(() => {
  console.info("[StoreReviews] render data", { dataAvailable: Boolean(googleData), reviewCount: googleData?.reviews?.length || 0 });
}, [googleData]);

let weekdayTiming = "";
let weekendTiming = "";

if (Array.isArray(store_timings)) {
  const weekday = store_timings.find((d) => d.weekday === "monday");
  const weekend = store_timings.find((d) => d.weekday === "sunday");

  if (weekday?.slots?.length) {
    const slot = weekday.slots[0];
    weekdayTiming = `${slot.opening.hour}:${
      slot.opening.minute.toString().padStart(2, "0")
    } - ${slot.closing.hour}:${slot.closing.minute
      .toString()
      .padStart(2, "0")}`;
  }

  if (weekend?.slots?.length) {
    const slot = weekend.slots[0];
    weekendTiming = `${slot.opening.hour}:${
      slot.opening.minute.toString().padStart(2, "0")
    } - ${slot.closing.hour}:${slot.closing.minute
      .toString()
      .padStart(2, "0")}`;
  }
}

  // A sample is available for local design previews or an explicit ?reviewPreview=1 URL.
  // It never overwrites the live Google data or appears as a real customer review.
  const allowReviewPreview = reviewPreview || (typeof window !== "undefined" && (
    ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("reviewPreview") === "1"
  ));
  const previewReviewData = {
    isPreview: true,
    ratingData: { name: store_name, rating: 4.5, total: 1 },
    reviews: [{
      author_name: "Design preview",
      profile_photo_url: ReviewPreviewAvatar,
      rating: 4.5,
      text: "Sample review for design testing only. This card previews how customer feedback will appear when live reviews are available.",
    }],
  };
  const displayedReviewData = !reviewsLoading && !googleData?.reviews?.length && allowReviewPreview
    ? previewReviewData
    : googleData;
  const badgeData = googleData || displayedReviewData;
  const NearbyArrow = ({ className, style, onClick, previous = false }) => (
    <button type="button" className={`${className} ${styles.nearbyArrow}`} style={style} onClick={onClick} aria-label={previous ? "Previous nearby stores" : "Next nearby stores"}>
      {previous ? <NearbyPrevious viewBox="0 0 40 40" aria-hidden="true" /> : <NearbyNext viewBox="0 0 40 40" aria-hidden="true" />}
    </button>
  );
  const nearbySettings = {
    slidesToShow: Math.min(2, nearbyStores.length),
    slidesToScroll: 1,
    speed: 400,
    infinite: nearbyStores.length > 2,
    arrows: true,
    dots: false,
    prevArrow: <NearbyArrow previous />,
    nextArrow: <NearbyArrow />,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, arrows: false, dots: nearbyStores.length > 1, infinite: nearbyStores.length > 1 } }],
  };






  return (
    <section className={styles.storeDetailsSection}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <p>
          <a href="/">Home</a> / <a href="/locate-us">Stores</a> /{" "}
          <span>{store_city}</span> / <strong>{store_name}</strong>
        </p>
      </div>

      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={styles.imageCarousel}>
          <img src={store_image[0] || googleData?.photo || placeholderImage} alt={store_name} />
        </div>

        <div className={styles.infoBlock}>
          <h1 className={styles.storeName}>{store_name}</h1>

        {/* Original badge condition: googleData && <GoogleRating preFetchedData={googleData} fetchReviews={false} /> */}
        {badgeData && (
  <GoogleRating preFetchedData={badgeData} fetchReviews={false} />
)}

          <p className={styles.address}><span className={styles.iconCircle} aria-hidden="true"><AddressIcon /></span>{formattedAddress}</p>

          {(weekdayTiming || weekendTiming) && (
            <p className={styles.timings}><span className={styles.iconCircle} aria-hidden="true"><ClockIcon /></span>
              <span>
                {weekdayTiming && <>MON - FRI: {weekdayTiming}</>}
                {weekdayTiming && weekendTiming && " | "}
                {weekendTiming && <>SAT - SUN: {weekendTiming}</>}
              </span>
            </p>
          )}

          {contactNumber && (
            <div className={styles.phoneRow}>
              <span className={styles.iconCircle} aria-hidden="true"><PhoneIcon /></span>
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
                  <Purchase aria-hidden="true" />
                </div>
                <p>Purchase</p>
              </div>

              <div className={styles.serviceCard}>
                <div className={styles.iconCircle}>
                  <Eye aria-hidden="true" />
                </div>
                {/* Original label: <p>Eye</p> */}
                <p>Eye Test</p>
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

           
           
          {/* Original timings position retained; the same data is displayed above the phone row.
          {(weekdayTiming || weekendTiming) && (
  <p className={styles.timings}><span className={styles.iconCircle} aria-hidden="true"><ClockIcon /></span>
    {weekdayTiming && <>MON - FRI: {weekdayTiming}</>}
    {weekdayTiming && weekendTiming && " | "}
    {weekendTiming && <>SAT - SUN: {weekendTiming}</>}
  </p>
)}
          */}



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
          {/* Original reviews condition: googleData && <GoogleRating preFetchedData={googleData} fetchReviews={true} /> */}
          {displayedReviewData && (
  <GoogleRating preFetchedData={displayedReviewData} fetchReviews={true} />
)}
        </div>
      </div>

      {/* Nearby Stores Section */}
      {nearbyStores.length > 0 && (
        <div className={styles.nearbyStoresSection}>
          <h3>More Stores Near You</h3>
          {/* Original list: <ul className={styles.nearbyStoreList}> */}
          <div className={styles.nearbyStoreList}>
          <Slider {...nearbySettings}>
            {/* Original two-card presentation: nearbyStores.slice(0, 2).map((s, idx) => { */}
            {nearbyStores.map((s, idx) => {
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

const getTagNumber = (store) => {
  const raw = store.store_tag ?? store.tags ?? store.tag;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const match = list
    .map((t) => String(t).trim())
    .find((t) => /^\+?\d[\d\s-]{8,}$/.test(t));
  return match || "";
};


         let contactNumber = getTagNumber(store);

// Fallback if a store has no number in its tag
if (!contactNumber && defaultPhone) {
  contactNumber = defaultPhone;
}

              return (
                // Original card element: <li key={s._id || idx} className={styles.nearbyStoreCard}>
                <article key={s._id || idx} className={styles.nearbyStoreCard}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={imageUrl}
                      alt={s.store_name}
                      className={styles.storeImage}
                    />
                  </div>

                  <div className={styles.storeContent}>
                    {/* Original name: <h4 className={styles.storeName}>{s.store_name}</h4> */}
                    <h4 className={styles.storeName}><a href={`/locate-us?storeCode=${s.store_code}`}>{s.store_name}</a></h4>
                    {/* Original address markup: <p className={styles.storeAddress}><span className={styles.iconCircle} aria-hidden="true"><AddressIcon /></span>{formattedAddr}</p> */}
                    <p className={styles.storeAddress}><span className={styles.iconCircle} aria-hidden="true"><AddressIcon /></span><span className={styles.storeAddressText} title={formattedAddr}>{formattedAddr}</span></p>

                    <div className={styles.phonebookContainer}>
                      {contactNumber && (
                        <p>
                          <span className={styles.iconCircle} aria-hidden="true"><PhoneIcon /></span>
                          <a href={`tel:${contactNumber}`}>{contactNumber}</a>
                        </p>
                      )}

                      {/* Original booking link retained here; its active position is the card action below.
                      <p>
                        <img src={BookCalender} alt="Book Appointment" />
                        <a href={`/sections/book-an-eye-test?storeCode=${s.store_code}`}>Book Appointment</a>
                      </p>
                      */}
                    </div>

                    <div className={styles.buttonGroup}>
                      {/* Original direction and details controls retained:
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
                      */}
                      <a href={`/sections/book-an-eye-test?storeCode=${s.store_code}`} className={styles.directionBtn}>Book Appointment</a>
                      <a href={mapLink} target="_blank" rel="noreferrer" className={styles.detailsBtn} aria-label={`Get directions to ${s.store_name}`}>
                        <DirectionsArrow viewBox="0 0 32 32" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
                // Original closing card element: </li>
              );
            })}
          </Slider>
          </div>
          {/* Original closing list element: </ul> */}
        </div>
      )}
    </section>
  );
};

export default StoreDetails;
