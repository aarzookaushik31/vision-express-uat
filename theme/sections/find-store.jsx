import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import pdpStoreInterior from "../assets/images/pdp-footer/store-interior.png";
import pdpStoreWatermark from "../assets/images/pdp-footer/logo-watermark.png";
import pdpStoreGlow from "../assets/images/pdp-footer/store-glow.svg";
import PdpLocationIcon from "../assets/images/pdp-footer/location.svg";
import styles from "../styles/sections/find-store.less";
import Location from "../assets/images/mage_location.png";
import placeholderDesktop from "../assets/images/placeholder/slideshow-desktop2.jpg";
import placeholderMobile from "../assets/images/placeholder/slideshow-mobile2.jpg";

// Tracks whether ONE element is on screen, so the entrance animation
// plays only when the section is actually visible.
function useInView(ref) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Older browsers: just show everything
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Element has entered the (slightly shrunk) viewport -> play
        if (entry.isIntersecting) {
          setInView(true);
          return;
        }

        const viewportBottom = entry.rootBounds
          ? entry.rootBounds.bottom
          : window.innerHeight;

        // Reset ONLY when the element is below the screen (user scrolled
        // up past it) so it replays on the next scroll down. If it left
        // through the top, keep it shown.
        if (entry.boundingClientRect.top > viewportBottom) {
          setInView(false);
        }
      },
      {
        threshold: 0.15, // at least 15% of the section must be visible
        rootMargin: "0px 0px -8% 0px", // and slightly inside the bottom edge
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const location = useLocation();
  const isPdpDesign = /^(?:\/[a-zA-Z-]+)?\/product\/[^/]+\/?$/i.test(location.pathname);
  const useFigmaPdpArtwork = isPdpDesign && props.use_figma_pdp_artwork?.value !== false;

  const {
    backgroundImage,
    mobileBackgroundImage,
    heading,
    subheading,
    inputPlaceholder,
    buttonText,
    enableBlackBackground,
  } = props || {};

  const [pincode, setPincode] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // The wrapper is observed (it never moves); the inner section animates
  const wrapperRef = useRef(null);
  const inView = useInView(wrapperRef);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isBlackBgEnabled =
    enableBlackBackground?.value === true ||
    enableBlackBackground?.value === "true";

  const bgImage = isMobile
    ? mobileBackgroundImage?.value || placeholderMobile
    : backgroundImage?.value || placeholderDesktop;

  // Original browser-only check retained: const isHome = window.location && window.location.pathname === "/";
  const isHome = location.pathname === "/";

  const handleFindStore = () => {
    if (pincode) {
      window.location.href = `/locate-us?pincode=${encodeURIComponent(pincode)}`;
    } else {
      window.location.href = `/locate-us`;
    }
  };

  const sectionStyle = isBlackBgEnabled
    ? { backgroundColor: "#000", backgroundImage: "none" }
    : { backgroundImage: bgImage ? `url(${bgImage})` : "none" };

  return (
    <div
      ref={wrapperRef}
      style={isPdpDesign ? {
        "--pdp-store-desktop": `url("${useFigmaPdpArtwork ? pdpStoreInterior : backgroundImage?.value || pdpStoreInterior}")`,
        "--pdp-store-mobile": `url("${useFigmaPdpArtwork ? pdpStoreInterior : mobileBackgroundImage?.value || backgroundImage?.value || pdpStoreInterior}")`,
        "--pdp-store-watermark": `url("${pdpStoreWatermark}")`,
        "--pdp-store-glow": `url("${pdpStoreGlow}")`,
      } : undefined}
      className={`${styles.findStoreWrapper} ${
        isBlackBgEnabled ? styles.blackBgFindStore : ""
      }  ${isHome ? styles.blackBgFindStore : ""} ${isPdpDesign ? styles.pdpFindStore : ""}`}
    >
      <section
        className={`${styles.findStoreSection} ${
          isHome ? styles.homepageFindStore : ""
        } ${inView ? styles.inView : ""}`}
        style={sectionStyle}
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
                {/* Original icon remains on other pages: <img src={Location} alt="Find" /> */}
                {isPdpDesign ? <span className={styles.pdpLocationIcon}><PdpLocationIcon /></span> : <img src={Location} alt="Find" />}{" "}
                {buttonText?.value || "Find Stores"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Component.displayName = "FindStoreComponent";

export default Component;

export const settings = {
  label: "Find Store Section",
  props: [
    { id: "use_figma_pdp_artwork", type: "checkbox", label: "Use Figma artwork on product pages", default: true },
    {
      id: "backgroundImage",
      type: "image_picker",
      label: "Background Image",
    },
    {
      id: "mobileBackgroundImage",
      type: "image_picker",
      label: "Mobile Background Image",
    },
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "We're Closer Than You Think",
    },
    {
      id: "subheading",
      type: "textarea",
      label: "Subheading",
      default: "Eye test or frame trial? Drop by your nearest Vision Express.",
    },
    {
      id: "inputPlaceholder",
      type: "text",
      label: "Input Placeholder",
      default: "Enter Pincode",
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Find Stores",
    },
    {
      id: "enableBlackBackground",
      type: "checkbox",
      label: "Use Black Background (instead of image)",
      default: false,
    },
  ],
  blocks: [],
};

Component.settings = settings;