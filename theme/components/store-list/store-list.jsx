import React from "react";
import styles from "./store-list.less";
import placeholderImage from "../../assets/images/placeholder/store-image-placeholder.png";
import phoneIcon from "../../assets/images/phoneicon.png";
import BookCalender from "../../assets/images/bookcalender.png";


const StoreList = ({ stores = [], loading = false, error = null, defaultPhone }) => {


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

          // --- Phone Logic ---
          let contactNumber = "";
          if (typeof store.phone_number === "object" && store.phone_number !== null) {
            contactNumber = `${store.phone_number.code ? `+${store.phone_number.code}-` : ""}${store.phone_number.number}`;
          } else if (typeof store.phone_number === "string" && store.phone_number.trim() !== "") {
            contactNumber = store.phone_number;
          } else if (defaultPhone) {
            contactNumber = defaultPhone;
          }

          return (
            <li key={store._id || idx} className={styles.storeCard}>
              <div className={styles.imageWrapper}>
                <img
                  src={imageUrl}
                  alt={store.store_name}
                  className={styles.storeImage}
                />
              </div>

              <div className={styles.storeContent}>
                <h3 className={styles.storeName}>{store.store_name}</h3>

                <p className={styles.ratingtext}>
          
              

               4+      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="rgba(238, 171, 67, 1)"
        width="18"
        height="18"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.175a1 1 0 00.95.69h4.392c.969 0 1.371 1.24.588 1.81l-3.56 2.584a1 1 0 00-.364 1.118l1.357 4.175c.3.921-.755 1.688-1.54 1.118l-3.56-2.584a1 1 0 00-1.176 0l-3.56 2.584c-.784.57-1.838-.197-1.539-1.118l1.357-4.175a1 1 0 00-.364-1.118L2.662 9.602c-.783-.57-.38-1.81.588-1.81h4.392a1 1 0 00.95-.69l1.357-4.175z" />
      </svg>  Ratings
                </p>

                {/* Cleaned address display */}
                <p className={styles.storeAddress}>{formattedAddress}</p>

                <div className={styles.phonebookContainer}>
                  {contactNumber && (
                    <p>
                      <img src={phoneIcon} alt="Phone Icon" />
                      <a href={`tel:${contactNumber}`}>{contactNumber}</a>
                    </p>
                  )}

                  <p>
                    <img src={BookCalender} alt="Book Appointment" />
                    <a href={`/sections/book-an-eye-test?storeCode=${store.store_code}`} >Book Appointment</a>
                  </p>
                </div>

                <div className={styles.buttonGroup}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              "Vision Express, " + formattedAddress
             )}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.directionBtn}
                  >
                    Get Direction
                  </a>
                  <a
                    href={`/locate-us?storeCode=${store.store_code}`}
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
  );
};

export default StoreList;
