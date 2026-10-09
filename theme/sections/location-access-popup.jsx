import React, { useState, useEffect, useCallback } from "react";
import styles from "../styles/sections/location-access-popup.less";

const STORAGE_KEY = "location_prompt_status"; // 'granted' | 'denied' | 'dismissed'

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const {
    heading,
    description,
    allow_button_text,
    deny_button_text,
    show_delay_seconds,
    icon,
  } = props || {};

  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported

  useEffect(() => {
    // Don't re-ask if the user already answered before, and don't show
    // at all if geolocation isn't supported in this browser.
    if (typeof window === "undefined" || !window.localStorage) return;
    if (!("geolocation" in navigator)) return;

    const previousStatus = window.localStorage.getItem(STORAGE_KEY);
    if (previousStatus) return;

    const delayMs = (Number(show_delay_seconds?.value) || 3) * 1000;
    const timer = setTimeout(() => setIsVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [show_delay_seconds]);

  const closePopup = useCallback((markStatus) => {
    setIsVisible(false);
    if (markStatus && window?.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, markStatus);
    }
  }, []);

  const handleAllow = () => {
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Persist for the rest of the site to read (header pincode/store
        // locator, delivery estimates, etc). Swap this for whatever your
        // theme's existing location/address mechanism expects.
        window.localStorage.setItem(
          "user_geo_coords",
          JSON.stringify({ latitude, longitude, capturedAt: Date.now() })
        );

        setStatus("granted");
        closePopup("granted");

        // Optional: dispatch a custom event so other components
        // (header, store locator) can react without a page reload.
        window.dispatchEvent(
          new CustomEvent("user-location-updated", {
            detail: { latitude, longitude },
          })
        );
      },
      (error) => {
        setStatus("denied");
        closePopup("denied");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  const handleDismiss = () => {
    closePopup("dismissed");
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.popup}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {icon?.value && (
          <div className={styles.iconWrap}>
            <img width={200} height={40} src={icon.value} alt="" />
          </div>
        )}

        <h3 className={styles.heading}>
          {heading?.value || "Enable your location"}
        </h3>
        <p className={styles.description}>
          {description?.value ||
            "Allow location access to see store availability, delivery estimates, and offers near you."}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.allowBtn}
            onClick={handleAllow}
            disabled={status === "requesting"}
          >
            {status === "requesting"
              ? "Requesting..."
              : allow_button_text?.value || "Allow Location"}
          </button>
          <button type="button" className={styles.denyBtn} onClick={handleDismiss}>
            {deny_button_text?.value || "Not now"}
          </button>
        </div>
      </div>
    </div>
  );
}

Component.displayName = "LocationAccessPopup";

export default Component;

export const settings = {
  label: "Location Access Popup",
  props: [
    { id: "heading", type: "text", label: "Heading", default: "Enable your location" },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default: "Allow location access to see store availability, delivery estimates, and offers near you.",
    },
    { id: "allow_button_text", type: "text", label: "Allow Button Text", default: "Allow Location" },
    { id: "deny_button_text", type: "text", label: "Deny Button Text", default: "Not now" },
    { id: "show_delay_seconds", type: "number", label: "Show Delay (seconds)", default: 3 },
    { id: "icon", type: "image_picker", label: "Icon (optional)" },
  ],
  blocks: [],
};

Component.settings = settings;