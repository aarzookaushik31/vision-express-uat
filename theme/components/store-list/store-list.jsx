import React from "react";
import styles from "./store-list.less";
import placeholderImage from "../../assets/images/placeholder/Store-list-placeholder-image.png";
import phoneIcon from "../../assets/images/phoneicon.png";

const toTitleCase = (str) =>
  str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();

const StoreList = ({
  stores = [],
  loading = false,
  error = null,
  defaultPhone,
}) => {
  if (loading) return <p className={styles.message}>Loading stores...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!stores.length) return <p className={styles.message}>No stores found.</p>;

  return (
    <div className={styles.storeListContainer}>
      <h2 className={styles.storeCount}>Showing {stores.length} Stores</h2>

      <ul className={styles.storeList}>
        {stores.map((store, idx) => {
          const imageUrl =
            (store.store_image && store.store_image[0]) || placeholderImage;

          // --- Clean Address Logic ---
          const addressParts = [
            store.store_address_line_1,
            store.store_address_line_2,
            store.store_city,
            store.store_state,
            store.store_pincode,
          ];

          const cleanAddress = addressParts
            .map((part) => part?.trim().replace(/,+$/, ""))
            .filter(Boolean)
            .join(", ")
            .replace(/,+/g, ",")
            .replace(/\s*,\s*/g, ", ")
            .replace(/\s{2,}/g, " ");

          const formattedAddress = toTitleCase(cleanAddress);

          // --- Phone Logic ---
          let contactNumber = "";
          if (
            typeof store.phone_number === "object" &&
            store.phone_number !== null
          ) {
            contactNumber = `${
              store.phone_number.code ? `+${store.phone_number.code}-` : ""
            }${store.phone_number.number}`;
          } else if (
            typeof store.phone_number === "string" &&
            store.phone_number.trim() !== ""
          ) {
            contactNumber = store.phone_number;
          } else if (typeof store.phone_number === "number") {
            contactNumber = String(store.phone_number);
          } else if (defaultPhone) {
            contactNumber = defaultPhone;
          }

          const directionUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            "Vision Express, " + formattedAddress
          )}`;

          return (
            <li key={store._id || idx} className={styles.storeCard}>
              <div className={styles.imageWrapper}>
                <img
                  src={imageUrl}
                  alt={store.store_name}
                  className={styles.storeImage}
                />
                <span className={styles.ratingBadge}>4+ Ratings</span>
              </div>

              <div className={styles.storeContent}>
                <h3 className={styles.storeName}>{store.store_name}</h3>

                {/* Address (opens directions) */}
                <a
                  href={directionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.storeAddress}
                  title="Get Direction"
                >
                  <span className={styles.pinIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
  <path d="M7.19995 0C4.66969 0 2.55933 2.03822 2.55933 4.64063C2.55933 5.63068 2.85683 6.51353 3.4278 7.3408L6.84482 12.6727C7.01059 12.9319 7.38965 12.9314 7.55509 12.6727L10.9869 7.32265C11.5456 6.53288 11.8406 5.60551 11.8406 4.64063C11.8406 2.08178 9.75879 0 7.19995 0ZM7.19995 6.75C6.0369 6.75 5.09058 5.80368 5.09058 4.64063C5.09058 3.47757 6.0369 2.53125 7.19995 2.53125C8.363 2.53125 9.30933 3.47757 9.30933 4.64063C9.30933 5.80368 8.363 6.75 7.19995 6.75Z" fill="#9E007E"/>
</svg>
                  </span>
                  <span className={styles.addressText}>{formattedAddress}</span>
                </a>

                {contactNumber && (
                  <p className={styles.phoneRow}>
                    <span className={styles.pinIcon}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
  <g clip-path="url(#clip0_7951_4198)">
    <path d="M9.1976 6.56385C8.58536 6.56385 7.98422 6.4681 7.41456 6.27984C7.13542 6.18464 6.79227 6.27198 6.6219 6.44695L5.4975 7.29576C4.19352 6.59969 3.39029 5.79672 2.70372 4.50253L3.52755 3.40742C3.74159 3.19367 3.81836 2.88143 3.72638 2.58846C3.53732 2.01581 3.44128 1.41495 3.44128 0.802448C3.4413 0.359974 3.08133 0 2.63888 0H0.802422C0.359974 0 0 0.359974 0 0.802422C0 5.87404 4.12599 10 9.1976 10C9.64005 10 10 9.64003 10 9.19758V7.36625C10 6.92383 9.64003 6.56385 9.1976 6.56385Z" fill="#9E007E"/>
  </g>
  <defs>
    <clipPath id="clip0_7951_4198">
      <rect width="10" height="10" fill="white"/>
    </clipPath>
  </defs>
</svg>
                    </span>
                    <a href={`tel:${contactNumber}`}>{contactNumber}</a>
                  </p>
                )}

                <div className={styles.actionRow}>
                  <a
                    href={`/sections/book-an-eye-test?storeCode=${store.store_code}`}
                    className={styles.bookBtn}
                  >
                    Book Appointment
                  </a>
                  <a
                    href={`/locate-us?storeCode=${store.store_code}`}
                    className={styles.detailsBtn}
                    aria-label="Store Details"
                    title="Store Details"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StoreList;