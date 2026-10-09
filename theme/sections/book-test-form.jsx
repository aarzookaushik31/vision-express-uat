import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/sections/book-test-form.less";
// Reuse the exact popup styles already used on the homepage
import popupStyles from "../styles/sections/location-access-popup.less";
import FormSubmitEye from "../assets/images/form-submit-eye-white.png";
import CloseIcon from "../assets/images/close.svg";
import { GET_CUSTOM_FORM, POST_CUSTOM_FORM } from "../queries/bookFormQuery";
import { sendSmsNotification } from "../helper/utils";

const BASE_URL = `${window.location.origin}`;

// Don't autofill if the nearest store is farther than this (in km)
const MAX_DISTANCE_KM = 500;

// Same keys the homepage popup writes, so both pages share the result
const COORDS_KEY = "user_geo_coords";
const HOME_PROMPT_KEY = "location_prompt_status"; // 'granted' | 'denied' | 'dismissed'
// Page-level key so this popup isn't re-shown after "Not now" in the same session
const FORM_PROMPT_KEY = "book_test_location_prompt";
const COORDS_MAX_AGE_MS = 30 * 60 * 1000; // reuse saved coords if newer than 30 min

const STATE_KEYS = ["state", "store-state"];
const CITY_KEYS = ["city", "store-city"];
const STORE_KEYS = ["store", "store-name", "choose-store"];
const DYNAMIC_KEYS = [...STATE_KEYS, ...CITY_KEYS, ...STORE_KEYS];

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

/* ---------- Geolocation helpers ---------- */

const toRad = (d) => (d * Math.PI) / 180;

// Haversine distance in km
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const findNearestStore = (stores, lat, lng) => {
  let nearest = null;
  stores.forEach((s) => {
    if (s.is_active === false || s.is_deleted) return;
    const sLat = parseFloat(s.store_latitude);
    const sLng = parseFloat(s.store_longitutde); // (sic) key spelled this way by the API
    if (Number.isNaN(sLat) || Number.isNaN(sLng)) return;
    const distanceKm = getDistanceKm(lat, lng, sLat, sLng);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { store: s, distanceKm };
    }
  });
  return nearest;
};

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

export function Component({ props = {} }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState({});
  const [allStores, setAllStores] = useState([]);
  const [isAutoSelected, setIsAutoSelected] = useState(false);

  // Location popup
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [popupStatus, setPopupStatus] = useState("idle"); // idle | requesting

  const storeCodeRef = useRef(null);
  const autoRef = useRef(null); // { state, city, store } that was auto-selected
  const urlAppliedRef = useRef(false); // storeCode from URL applied once
  const geoTriedRef = useRef(false); // location check runs once
  const userTouchedRef = useRef(false); // user changed state/city/store manually

  const {
    image,
    imageTitle,
    popupHeading,
    popupDescription,
    popupAllowText,
    popupDenyText,
    popupIcon,
  } = props;
  const slug = "book-an-eye-test-store";

  // const slug = "book-an-eye-test";
 
  // True once the form definition (inputs) has been loaded
  const formReady = !!content?.inputs;

  /* ---------- Fetch form definition ---------- */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const payload = { slug };
        const res = await fpi.executeGQL(GET_CUSTOM_FORM, payload);
        if (res?.data?.support) {
          const form = res.data.support.custom_form || {};
          setContent(form);

          const initData = {};
          const initErr = {};
          (form.inputs || []).forEach((i) => {
            initData[i.key] = i.type === "checkbox" ? false : "";
            initErr[i.key] = "";
          });
          setFormData(initData);
          setFormError(initErr);
        } else setError("Fields not found");
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [slug]);

  /* ---------- Fetch stores ---------- */
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const result = await getLocateUsStoreAPI();
        const stores = result?.data?.items || result?.data || [];

        if (stores.length) {
          setAllStores(stores);
        } else console.warn("⚠️ No stores returned from API");
      } catch (err) {
        console.error("❌ Error fetching stores:", err);
      }
    };
    fetchStores();
  }, []);

  /* ---------- Read ?storeCode= from URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("storeCode");
    if (code) storeCodeRef.current = code.trim();
  }, []);

  /* ---------- Build dropdown options (state -> city -> store) ---------- */
  useEffect(() => {
    if (!allStores.length || !formReady) return;

    const states = [
      ...new Set(allStores.map((s) => s.store_state).filter(Boolean)),
    ];

    const cities = formData.state
      ? [
          ...new Set(
            allStores
              .filter((s) => s.store_state === formData.state)
              .map((s) => s.store_city)
              .filter(Boolean)
          ),
        ]
      : [];

    const storeNames = formData.city
      ? [
          ...new Set(
            allStores
              .filter(
                (s) =>
                  s.store_state === formData.state &&
                  s.store_city === formData.city
              )
              .map((s) => s.store_name)
              .filter(Boolean)
          ),
        ]
      : [];

    const toEnum = (arr) => arr.map((v) => ({ key: v, display: v }));

    setContent((prev) => {
      if (!prev?.inputs) return prev;
      const updatedInputs = prev.inputs.map((input) => {
        if (STATE_KEYS.includes(input.key)) {
          return { ...input, enum: toEnum(states) };
        }
        if (CITY_KEYS.includes(input.key)) {
          return { ...input, enum: toEnum(cities) };
        }
        if (STORE_KEYS.includes(input.key)) {
          return { ...input, enum: toEnum(storeNames) };
        }
        return input;
      });
      return { ...prev, inputs: updatedInputs };
    });
  }, [allStores, formReady, formData.state, formData.city]);

  /* ---------- Reset dependent fields (skipped for auto-selected values) ---------- */
  useEffect(() => {
    if (!allStores.length) return;

    setFormData((prev) => {
      const a = autoRef.current;
      if (a && prev.state === a.state) return prev; // keep auto-selected city/store
      return { ...prev, city: "", store: "" };
    });
  }, [formData.state, allStores]);

  useEffect(() => {
    if (!allStores.length) return;

    setFormData((prev) => {
      const a = autoRef.current;
      if (a && prev.city === a.city) return prev; // keep auto-selected store
      return { ...prev, store: "" };
    });
  }, [formData.city, allStores]);

  /* ---------- Select a store (fills state, city and store) ---------- */
  const applyStoreSelection = (store) => {
    autoRef.current = {
      state: store.store_state || "",
      city: store.store_city || "",
      store: store.store_name || "",
    };

    setFormData((prev) => ({
      ...prev,
      state: store.store_state || "",
      city: store.store_city || "",
      store: store.store_name || "",
      "store-name": store.store_name || "",
      "choose-store": store.store_name || "",
    }));

    setFormError((prev) => ({
      ...prev,
      state: "",
      city: "",
      store: "",
      "store-name": "",
      "choose-store": "",
    }));

    setIsAutoSelected(true);
  };

  /* ---------- Priority 1: store from URL (?storeCode=) ---------- */
  useEffect(() => {
    if (!allStores.length || !formReady || urlAppliedRef.current) return;

    const code = storeCodeRef.current;
    if (!code) return;

    const match = allStores.find(
      (s) => s.store_code?.toLowerCase() === String(code).toLowerCase()
    );

    urlAppliedRef.current = true;

    if (!match) return console.warn("❌ No store found for code:", code);
    applyStoreSelection(match);
  }, [allStores, formReady]);

  /* ---------- Priority 2: nearest store via location ---------- */

  // Pick the nearest store for the given coordinates and select it.
  // If nothing is close enough, dropdowns are left exactly as they were.
  const applyNearestFromCoords = (lat, lng) => {
    if (userTouchedRef.current) return; // never overwrite the user's own choice
    const nearest = findNearestStore(allStores, lat, lng);
    if (!nearest || nearest.distanceKm > MAX_DISTANCE_KM) return;
    applyStoreSelection(nearest.store);
  };

  // Ask the browser for the position, save it (shared with the homepage popup)
  // and select the nearest store.
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

        applyNearestFromCoords(latitude, longitude);

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

  // Runs once when stores + form are ready:
  //   granted  -> autofill nearest store silently
  //   prompt   -> show the popup
  //   denied   -> do nothing (dropdowns behave as before)
  useEffect(() => {
    if (!allStores.length || !formReady || geoTriedRef.current) return;
    geoTriedRef.current = true;

    // A storeCode in the URL always wins over location
    if (storeCodeRef.current) return;
    if (!("geolocation" in navigator)) return;

    const decide = (permissionState) => {
      if (permissionState === "granted") {
        const stored = readStoredCoords();
        if (stored) {
          applyNearestFromCoords(stored.latitude, stored.longitude);
        } else {
          requestPositionAndApply();
        }
        return;
      }

      if (permissionState === "prompt") {
        const alreadyDismissed =
          safeStorage.get("sessionStorage", FORM_PROMPT_KEY) === "dismissed";
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
      if (stored) applyNearestFromCoords(stored.latitude, stored.longitude);
      else if (safeStorage.get("localStorage", HOME_PROMPT_KEY) !== "denied")
        decide("prompt");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStores, formReady]);

  /* ---------- Popup handlers ---------- */
  const closeLocationPopup = (mark) => {
    setShowLocationPopup(false);
    setPopupStatus("idle");
    if (mark) safeStorage.set("sessionStorage", FORM_PROMPT_KEY, mark);
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

  /* ---------- Validation ---------- */
  const validateForm = () => {
    let valid = true;
    const errors = {};

    Object.keys(formData).forEach((key) => {
      const rawValue = formData[key];
      const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

      const field = content?.inputs?.find((i) => i.key === key);

      if (field?.required && (!value || value === "")) {
        errors[key] = "This field is required";
        valid = false;
        return;
      }

      if (key === "contact-number") {
        if (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value)) {
          errors[key] = "Enter a valid 10 digit mobile number";
          valid = false;
        }
      }

      if (key === "full-name") {
        if (value && !/^[A-Za-z\s]+$/.test(value)) {
          errors[key] = "Only letters and spaces allowed";
          valid = false;
        }
      }

      if (key === "email") {
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          errors[key] = "Enter a valid email address";
          valid = false;
        }
      }
    });

    setFormError(errors);
    return { valid, errors };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = type === "checkbox" ? checked : value;

    if (name === "contact-number") {
      newValue = value.replace(/\D/g, "").slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      setFormError((prev) => ({
        ...prev,
        [name]: "",
      }));

      return;
    }

    // User is changing location manually -> drop the auto-selection
    if (DYNAMIC_KEYS.includes(name)) {
      userTouchedRef.current = true;
    }
    if (STATE_KEYS.includes(name) || CITY_KEYS.includes(name)) {
      autoRef.current = null;
      setIsAutoSelected(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (formError[name]) {
      validateField(name, newValue);
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, city: "", store: "" }));
    }

    if (name === "city") {
      setFormData((prev) => ({ ...prev, store: "" }));
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors } = validateForm();

    if (!valid) {
      const firstErrorKey = Object.keys(errors)[0];

      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }

      return;
    }

    const responsePayload = (content?.inputs || []).map((input) => {
      const value = formData[input.key];

      if (DYNAMIC_KEYS.includes(input.key)) {
        return { key: input.key, value: value || "" };
      }

      if (input.type === "dropdown") {
        const match = input.enum?.find(
          (opt) => opt.display === value || opt.key === value
        );
        return { key: input.key, value: match?.key || value || "" };
      }

      if (input.type === "checkbox") {
        return {
          key: input.key,
          value: value ? input.enum?.[0]?.key || "yes" : "",
        };
      }

      return { key: input.key, value };
    });

    const requestBody = {
      slug,
      customFormSubmissionPayloadInput: { response: responsePayload },
    };

    try {
      await fpi.executeGQL(POST_CUSTOM_FORM, requestBody);

      sendSmsNotification(
        formData["contact-number"],
        formData["date"],
        formData["time"]
      );

      const selectedStore =
        allStores.find(
          (s) =>
            s.store_name === formData.store ||
            s.store_name === formData["store-name"] ||
            s.store_name === formData["choose-store"]
        ) || null;

      console.log(selectedStore);

      const storeEmail = selectedStore?.email_address || "";
      console.log(storeEmail);

      setShowSuccessMessage(true);

      // Reset form after success
      autoRef.current = null;
      userTouchedRef.current = false;
      setIsAutoSelected(false);

      const resetData = {};
      Object.keys(formData).forEach(
        (key) => (resetData[key] = key === "privacy_policy" ? false : "")
      );
      setFormData(resetData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const closeDialog = () => {
    setShowSuccessMessage(false);
  };

  const validateField = (name, value) => {
    let error = "";

    const field = content?.inputs?.find((i) => i.key === name);
    const strValue = typeof value === "string" ? value.trim() : value;

    if (field?.required && (!strValue || strValue === "")) {
      error = "This field is required";
    } else if (name === "contact-number") {
      if (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value)) {
        error = "Enter a valid 10 digit mobile number";
      }
    } else if (name === "full-name") {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Only letters and spaces allowed";
      }
    } else if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        error = "Enter a valid email address";
      }
    }

    setFormError((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value.trim());
  };

  if (loading) return <div></div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div className={styles.booktest_container}>
      <div className={styles.hero}>
        {/* Left: image, fades into the purple background */}
        {image?.value && (
          <div className={styles.image_section}>
            <img src={image.value} alt="Book Test" />
          </div>
        )}

        {/* Right: form panel */}
        <div className={styles.form_section}>
          <div className={styles.panelHeader}>
            <h2 className={styles.formTitle}>
              {imageTitle?.value || "Book An Eye Test"}
            </h2>

            <div className={styles.bookTestTabs}>
              <span className={styles.activeTab}>In Store</span>
              <a
                href="/sections/book-an-eye-test-home"
                className={styles.tabLink}
              >
                Home
              </a>
            </div>
          </div>

          {showSuccessMessage ? (
            <div className={styles.success_wrapper}>
              <span className={styles.closeSuccessButton} onClick={closeDialog}>
                <CloseIcon className={styles.closeIcon} />
              </span>

              <img src={FormSubmitEye} alt="" />

              <h3 className={styles.success_message}>
                You're All Set for Your Eye Test!
              </h3>
              <p>
                Thank you for booking your in-store eye test with Vision
                Express. <br />
                <br />
                Our certified optometrists will be ready for you at your
                scheduled time. Expect a confirmation message with all details
                shortly.
              </p>

              <a href="/products">Explore Products</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {(content?.inputs || []).map((input) => {
                const isDynamicSelect = DYNAMIC_KEYS.includes(input.key);

                return (
                  <div
                    className={`${styles.fgroup} ${
                      input.type === "checkbox" ? styles.fgroupFull : ""
                    }`}
                    key={input.key}
                  >
                    {input.type !== "checkbox" && <label>{input.display}</label>}

                    {/* 📍 Date input */}
                    {input.key === "date" ? (
                      <input
                        type="date"
                        name={input.key}
                        value={formData[input.key]}
                        onChange={handleChange}
                        onBlur={(e) =>
                          validateField(e.target.name, e.target.value)
                        }
                        placeholder="Choose Date"
                        min={(() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split("T")[0];
                        })()}
                        required={input.required}
                      />
                    ) : /* 📍 Dynamic Select (state, city, store) */
                    input.type === "dropdown" || isDynamicSelect ? (
                      <select
                        name={input.key}
                        value={formData[input.key]}
                        onChange={handleChange}
                        required={input.required}
                        onBlur={(e) =>
                          validateField(e.target.name, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          {input.placeholder || `Choose Your ${input.display}`}
                        </option>
                        {input.enum?.map((opt, idx) => (
                          <option
                            key={opt.key || idx}
                            value={opt.display || opt.key}
                          >
                            {opt.display || opt.key}
                          </option>
                        ))}
                      </select>
                    ) : /* 📍 Text or Email or Number */
                    input.type === "text" ||
                      input.type === "email" ||
                      input.type === "number" ? (
                      <input
                        type={
                          input.key === "contact-number" ? "tel" : input.type
                        }
                        inputMode={
                          input.key === "contact-number" ? "numeric" : undefined
                        }
                        name={input.key}
                        value={formData[input.key]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={input.placeholder}
                        required={input.required}
                      />
                    ) : /* 📍 Checkbox */
                    input.type === "checkbox" ? (
                      <label className={styles.checkbox_label}>
                        <input
                          type="checkbox"
                          name={input.key}
                          checked={formData[input.key] || false}
                          onChange={handleChange}
                          onBlur={(e) =>
                            validateField(e.target.name, e.target.value)
                          }
                          required={input.required}
                        />
                        {input.display}
                      </label>
                    ) : null}

                    {/* Error */}
                    {formError[input.key] && (
                      <span className={styles.error_message}>
                        {formError[input.key]}
                      </span>
                    )}
                  </div>
                );
              })}

              <div className={styles.sgroup}>
                <input
                  className={styles.submit_btn}
                  type="submit"
                  value="Submit"
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Location access popup (same look as the homepage popup) */}
      {showLocationPopup && (
        <div
          className={popupStyles.overlay}
          role="dialog"
          aria-modal="true"
        >
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
                "Allow location access and we'll pick the store nearest to you for your eye test."}
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
    </div>
  );
}

export const settings = {
  label: "Book Test Form",
  props: [
    { type: "image_picker", id: "image", label: "Left Side Image" },
    {
      type: "text",
      id: "imageTitle",
      label: "Form Title",
      default: "Book An Eye Test",
    },
    {
      type: "text",
      id: "popupHeading",
      label: "Location Popup Heading",
      default: "Enable your location",
    },
    {
      type: "textarea",
      id: "popupDescription",
      label: "Location Popup Description",
      default:
        "Allow location access and we'll pick the store nearest to you for your eye test.",
    },
    {
      type: "text",
      id: "popupAllowText",
      label: "Location Popup Allow Button Text",
      default: "Allow Location",
    },
    {
      type: "text",
      id: "popupDenyText",
      label: "Location Popup Deny Button Text",
      default: "Not now",
    },
    {
      type: "image_picker",
      id: "popupIcon",
      label: "Location Popup Icon (optional)",
    },
  ],
};

Component.settings = settings;
export default Component;