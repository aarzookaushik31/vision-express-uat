import React, { useState } from "react";
import styles from "../styles/sections/find-store.less";
import Location from "../assets/images/mage_location.png";
import placeholderDesktop from "../assets/images/placeholder/slideshow-desktop2.jpg";
import placeholderMobile from "../assets/images/placeholder/slideshow-mobile2.jpg";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};

  const {
    backgroundImage,
    mobileBackgroundImage,
    heading,
    subheading,
    inputPlaceholder,
    buttonText
  } = props || {};

  const [pincode, setPincode] = useState("");

  const isWindow = typeof window !== "undefined";
  const isMobile = isWindow && window.innerWidth <= 768;

  const bgImage = isMobile
    ? (mobileBackgroundImage?.value || placeholderMobile)
    : (backgroundImage?.value || placeholderDesktop);

  const isHome = isWindow && window.location && window.location.pathname === "/";

  const handleFindStore = () => {
if (pincode) {
    window.location.href = `/locate-us?pincode=${encodeURIComponent(pincode)}`;
  } else {
    window.location.href = `/locate-us`;
  }
  };

  return (
    <section
      className={`${styles.findStoreSection} ${isHome ? styles.homepageFindStore : ""}`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none"
      }}
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
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder={inputPlaceholder?.value || "Enter Pincode"}
              className={styles.pincodeInput}
            />
            <button className={styles.findButton} onClick={handleFindStore}>
              <img src={Location} alt="Find" />{" "}
              {buttonText?.value || "Find Stores"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

Component.displayName = "FindStoreComponent";

export default Component;

export const settings = {
  label: "Find Store Section",
  props: [
    {
      id: "backgroundImage",
      type: "image_picker",
      label: "Background Image"
    },
    {
      id: "mobileBackgroundImage",
      type: "image_picker",
      label: "Mobile Background Image"
    },
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "We're Closer Than You Think"
    },
    {
      id: "subheading",
      type: "textarea",
      label: "Subheading",
      default: "Eye test or frame trial? Drop by your nearest Vision Express."
    },
    {
      id: "inputPlaceholder",
      type: "text",
      label: "Input Placeholder",
      default: "Enter Pincode"
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Find Stores"
    }
  ],
  blocks: []
};

Component.settings = settings;
