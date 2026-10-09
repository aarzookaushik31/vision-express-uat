import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/sections/book-test-form.less";
// Reuse the exact popup styles already used on the homepage / store form
import popupStyles from "../styles/sections/location-access-popup.less";
import FormSubmitEye from "../assets/images/form-submit-eye-white.png";
import CloseIcon from "../assets/images/close.svg";
import { GET_CUSTOM_FORM, POST_CUSTOM_FORM } from "../queries/bookFormQuery";
import { sendSmsNotification } from "../helper/utils";

/* ---------- Constants ---------- */

// Same keys the homepage popup / store form write, so the result is shared
const COORDS_KEY = "user_geo_coords";
const HOME_PROMPT_KEY = "location_prompt_status"; // 'granted' | 'denied' | 'dismissed'
// Page-level keys so popups aren't re-shown after being closed in the same session
const FORM_PROMPT_KEY = "book_test_home_location_prompt";
const NA_PROMPT_KEY = "book_test_home_unavailable_shown";
const COORDS_MAX_AGE_MS = 30 * 60 * 1000; // reuse saved coords if newer than 30 min

// Possible keys of the city field in the form definition
const CITY_KEYS = ["city", "store-city"];

// The city field is found by key, or by its label being "City"
const isCityInput = (input) =>
  !!input &&
  (CITY_KEYS.includes(input.key) ||
    String(input.display || "").trim().toLowerCase() === "city");

/* ---------- City matching helpers ---------- */

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ") // "Delhi-NCR" -> "delhi ncr"
    .replace(
      /\b(district|city|division|municipal corporation|urban|rural)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

// One group per city in your dropdown. Add every name a geocoder may return
// for that city (including your own spelling, e.g. "banglore").
const CITY_GROUPS = [
  ["bangalore", "banglore", "bengaluru", "bengaluru south", "bengaluru north"],
  [
    "hyderabad",
    "secunderabad",
    "ranga reddy",
    "rangareddy",
    "medchal malkajgiri",
  ],
  ["chennai", "madras"],
  [
    "mumbai",
    "mumbai suburban",
    "mumbai city",
    "bombay",
    "navi mumbai",
    "thane",
  ],
  ["pune", "poona", "pimpri chinchwad"],
  ["nagpur"],
  [
    "delhi ncr",
    "delhi",
    "new delhi",
    "gurugram",
    "gurgaon",
    "noida",
    "greater noida",
    "gautam buddha nagar",
    "ghaziabad",
    "faridabad",
  ],
];

const groupIndex = {}; // normalized name -> group number
CITY_GROUPS.forEach((names, i) =>
  names.forEach((n) => {
    groupIndex[normalize(n)] = i;
  })
);
const aliasesLongestFirst = Object.keys(groupIndex).sort(
  (a, b) => b.length - a.length
);

// loose = also accept names that merely contain an alias ("South West Delhi")
const groupOf = (name, loose = false) => {
  const n = normalize(name);
  if (!n) return -1;
  if (n in groupIndex) return groupIndex[n];
  if (!loose) return -1;
  const padded = ` ${n} `;
  const hit = aliasesLongestFirst.find((a) => padded.includes(` ${a} `));
  return hit ? groupIndex[hit] : -1;
};

// Returns the matching dropdown option ({ key, display }) or null
const matchCityOption = (candidates, options) => {
  const opts = (options || []).map((o) => {
    const label = o.display || o.key;
    return { opt: o, norm: normalize(label), group: groupOf(label, true) };
  });

  // exact names first, then "contains" matches
  for (const loose of [false, true]) {
    for (const c of candidates) {
      const g = groupOf(c, loose);
      const n = normalize(c);
      const hit = opts.find(
        (o) => (g !== -1 && o.group === g) || (o.norm && o.norm === n)
      );
      if (hit) return hit.opt;
    }
  }
  return null;
};

// Lat/lng -> list of possible city names (best guess first).
// Returns null if geocoding failed (so we never show "not available" by mistake).
const reverseGeocodeCandidates = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (!res.ok) throw new Error("bigdatacloud failed");
    const d = await res.json();
    const admin = [...(d?.localityInfo?.administrative || [])]
      .sort((a, b) => (b.adminLevel || 0) - (a.adminLevel || 0))
      .map((a) => a.name);
    const list = [d.city, d.locality, ...admin].filter(Boolean);
    if (!list.length) throw new Error("empty result");
    return list;
  } catch (e) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      if (!res.ok) throw new Error("osm failed");
      const a = (await res.json())?.address || {};
      const list = [a.city, a.town, a.state_district, a.county, a.suburb].filter(
        Boolean
      );
      return list.length ? list : null;
    } catch (err) {
      return null;
    }
  }
};

/* ---------- Storage helpers ---------- */

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

/* ---------- Component ---------- */

export function Component({ props = {} }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState({});

  // Location popups
  const [showAskPopup, setShowAskPopup] = useState(false); // "Enable your location"
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false); // "We haven't reached you"
  const [popupStatus, setPopupStatus] = useState("idle"); // idle | requesting

  const geoTriedRef = useRef(false); // location check runs once
  const userTouchedRef = useRef(false); // user changed the city manually

  const {
    image,
    imageTitle,
    imageText,
    popupHeading,
    popupDescription,
    popupAllowText,
    popupDenyText,
    popupIcon,
    naHeading,
    naDescription,
    naButtonText,
  } = props;
  const slug = "book-an-eye-test-home";

  // True once the form definition (inputs) has been loaded
  const formReady = !!content?.inputs;

  /* ---------- Fetch form definition ---------- */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const payload = { slug };
        const res = await fpi.executeGQL(GET_CUSTOM_FORM, payload);
        if (res?.data?.support) {
          setContent(res?.data?.support?.custom_form || {});

          const initialData = {};
          const initialError = {};
          (res.data.support.custom_form?.inputs || []).forEach((input) => {
            initialData[input.key] = input.type === "checkbox" ? false : "";
            initialError[input.key] = "";
          });
          setFormData(initialData);
          setFormError(initialError);
        } else {
          setError("Fields not found in response");
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchPageData();
  }, [slug]);

  /* ---------- Location: match city with the City dropdown ---------- */

  // Resolve coords -> city name -> select it if it exists in the dropdown,
  // otherwise show the "not available" popup.
  const applyCoords = async (lat, lng) => {
    if (userTouchedRef.current) return; // never overwrite the user's own choice

    const cityInput = (content?.inputs || []).find(isCityInput);
    if (!cityInput?.enum?.length) return;

    const candidates = await reverseGeocodeCandidates(lat, lng);
    if (!candidates) return; // couldn't resolve -> do nothing

    if (userTouchedRef.current) return; // user picked something while we waited

    const match = matchCityOption(candidates, cityInput.enum);

    if (match) {
      setFormData((prev) => ({ ...prev, [cityInput.key]: match.key }));
      setFormError((prev) => ({ ...prev, [cityInput.key]: "" }));
    } else if (safeStorage.get("sessionStorage", NA_PROMPT_KEY) !== "1") {
      safeStorage.set("sessionStorage", NA_PROMPT_KEY, "1");
      setShowUnavailablePopup(true);
    }
  };

  // Ask the browser for the position, save it (shared with other pages)
  // and try to match the city.
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

        applyCoords(latitude, longitude);

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

  // Runs once when the form is ready:
  //   granted  -> match city silently
  //   prompt   -> show the "Allow location" popup
  //   denied   -> do nothing (user picks the city manually)
  useEffect(() => {
    if (!formReady || geoTriedRef.current) return;
    geoTriedRef.current = true;

    if (!("geolocation" in navigator)) return;

    const decide = (permissionState) => {
      if (permissionState === "granted") {
        const stored = readStoredCoords();
        if (stored) applyCoords(stored.latitude, stored.longitude);
        else requestPositionAndApply();
        return;
      }

      if (permissionState === "prompt") {
        const alreadyDismissed =
          safeStorage.get("sessionStorage", FORM_PROMPT_KEY) === "dismissed";
        if (!alreadyDismissed) setShowAskPopup(true);
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
      if (stored) applyCoords(stored.latitude, stored.longitude);
      else if (safeStorage.get("localStorage", HOME_PROMPT_KEY) !== "denied")
        decide("prompt");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formReady]);

  /* ---------- Popup handlers ---------- */
  const closeAskPopup = (mark) => {
    setShowAskPopup(false);
    setPopupStatus("idle");
    if (mark) safeStorage.set("sessionStorage", FORM_PROMPT_KEY, mark);
  };

  const handleAllowLocation = () => {
    setPopupStatus("requesting");
    requestPositionAndApply((granted) => {
      closeAskPopup(granted ? "granted" : "denied");
    });
  };

  const handleDismissAsk = () => closeAskPopup("dismissed");

  // Only closes the popup so the user can still choose a city manually.
  // To send them away instead, use: window.history.back();
  const handleUnavailableBack = () => setShowUnavailablePopup(false);

  /* ---------- Validation ---------- */
  const validateForm = () => {
    let valid = true;
    const errors = {};

    Object.keys(formData).forEach((key) => {
      const rawValue = formData[key];
      const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

      const fieldConfig = content?.inputs?.find((i) => i.key === key);

      if (fieldConfig?.required && (!value || value === "")) {
        errors[key] = "This field is required";
        valid = false;
        return;
      }

      if (key === "full-name" && !/^[A-Za-z\s]+$/.test(value)) {
        errors[key] = "Only letters and spaces allowed";
        valid = false;
      } else if (
        key === "contact-number" &&
        (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value))
      ) {
        errors[key] = "Enter a valid 10 digit mobile number";
        valid = false;
      } else if (key === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
        errors[key] = "Enter a valid email address";
        valid = false;
      } else if (key === "date") {
        const selected = new Date(value);
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (selected < tomorrow) {
          errors[key] = "Date must be from tomorrow onwards";
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

    // User is changing the city manually -> don't overwrite it with location
    if (isCityInput(content?.inputs?.find((i) => i.key === name))) {
      userTouchedRef.current = true;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    validateField(name, newValue);
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors } = validateForm();

    if (!valid) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
        const el = firstErrorKey
          ? document.querySelector(`[name="${firstErrorKey}"]`)
          : null;
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);

      return;
    }

    const responsePayload = (content?.inputs || []).map((input) => {
      const value = formData[input.key];

      if (input.type === "checkbox") {
        return { key: input.key, value: value ? input.enum[0].key : "" };
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
      setShowSuccessMessage(true);

      userTouchedRef.current = false;

      const resetData = {};
      Object.keys(formData).forEach(
        (key) => (resetData[key] = key === "checkbox" ? false : "")
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

    const fieldConfig = content?.inputs?.find((i) => i.key === name);
    const strValue = typeof value === "string" ? value.trim() : value;

    if (fieldConfig?.required && (!strValue || strValue === "")) {
      error = "This field is required";
    } else if (name === "full-name") {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Only letters and spaces allowed";
      }
    } else if (name === "contact-number") {
      if (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value)) {
        error = "Enter a valid 10 digit mobile number";
      }
    } else if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        error = "Enter a valid email address";
      }
    } else if (name === "date") {
      const selected = new Date(value);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (selected < tomorrow) {
        error = "Date must be from tomorrow onwards";
      }
    }

    setFormError((prev) => ({
      ...prev,
      [name]: error,
    }));
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
              <a href="/sections/book-an-eye-test" className={styles.tabLink}>
                In Store
              </a>
              <span className={styles.activeTab}>Home</span>
            </div>
          </div>

          {showSuccessMessage ? (
            <div className={styles.success_wrapper}>
              <span className={styles.closeSuccessButton} onClick={closeDialog}>
                <CloseIcon className={styles.closeIcon} />
              </span>

              <img src={FormSubmitEye} alt="" />

              <h3 className={styles.success_message}>
                Home Eye Test Appointment Confirmed
              </h3>
              <p>
                Your booking has been received successfully. <br />
                <br />
                A Vision Express representative will contact you soon to
                confirm your time slot and address. Our certified optometrists
                will ensure a safe and thorough eye test, right at your home.
              </p>

              <a href="/products">Explore Products</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {(content?.inputs || []).map((input) => (
                <div
                  className={`${styles.fgroup} ${
                    input.type === "checkbox" ? styles.fgroupFull : ""
                  }`}
                  key={input.key}
                >
                  {input.type !== "checkbox" && <label>{input.display}</label>}

                  {input.key === "date" ? (
                    <input
                      type="date"
                      name={input.key}
                      value={formData[input.key]}
                      onChange={handleChange}
                      onBlur={(e) => validateField(input.key, e.target.value)}
                      min={(() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return tomorrow.toISOString().split("T")[0];
                      })()}
                      placeholder="Choose Date"
                      required={input.required}
                    />
                  ) : input.type === "text" || input.type === "email" ? (
                    <input
                      type={input.key === "contact-number" ? "tel" : input.type}
                      inputMode={
                        input.key === "contact-number" ? "numeric" : undefined
                      }
                      name={input.key}
                      value={formData[input.key]}
                      onChange={handleChange}
                      onBlur={(e) => validateField(input.key, e.target.value)}
                      placeholder={input.placeholder}
                      required={input.required}
                    />
                  ) : input.type === "number" ? (
                    <input
                      type={input.type}
                      name={input.key}
                      value={formData[input.key]}
                      onChange={handleChange}
                      placeholder={input.placeholder}
                      onBlur={(e) => validateField(input.key, e.target.value)}
                      required={input.required}
                    />
                  ) : input.type === "dropdown" ? (
                    <select
                      name={input.key}
                      value={formData[input.key]}
                      onChange={handleChange}
                      onBlur={(e) => validateField(input.key, e.target.value)}
                      required={input.required}
                    >
                      <option value="" disabled>
                        {input.placeholder || `Choose Your ${input.display}`}
                      </option>
                      {input.enum?.map((opt, idx) => (
                        <option key={opt.key || idx} value={opt.key}>
                          {opt.display || opt.key}
                        </option>
                      ))}
                    </select>
                  ) : input.type === "checkbox" ? (
                    <label className={styles.checkbox_label}>
                      <input
                        type="checkbox"
                        name={input.key}
                        checked={formData[input.key] || false}
                        onChange={handleChange}
                        onBlur={(e) => validateField(input.key, e.target.checked)}
                        required={input.required}
                      />
                      {input.display}
                    </label>
                  ) : null}

                  {formError[input.key] && (
                    <span className={styles.error_message}>
                      {formError[input.key]}
                    </span>
                  )}
                </div>
              ))}

              {imageText?.value && !showSuccessMessage && (
                <p
                  className={styles.formSubtitle}
                  dangerouslySetInnerHTML={{ __html: imageText.value }}
                />
              )}

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

      {/* Popup 1: ask for location permission */}
      {showAskPopup && (
        <div className={popupStyles.overlay} role="dialog" aria-modal="true">
          <div className={popupStyles.popup}>
            <button
              type="button"
              className={popupStyles.closeBtn}
              onClick={handleDismissAsk}
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
                "Allow location access and we'll select your city for your home eye test."}
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
                onClick={handleDismissAsk}
              >
                {popupDenyText?.value || "Not now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup 2: city not serviceable */}
      {showUnavailablePopup && (
        <div className={popupStyles.overlay} role="dialog" aria-modal="true">
          <div className={popupStyles.popup}>
            <div className={styles.iconWrap}>
              {popupIcon?.value ? (
                <img width={200} height={40} src={popupIcon.value} alt="" />
              ) : (
           <svg width="105" height="105" viewBox="0 0 105 105" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="52.5" cy="52.5" r="52.5" fill="#9E007E" fill-opacity="0.05"/>
<g clip-path="url(#clip0_7877_37)">
<path d="M52.5 22C41.7815 22 32.8418 30.6341 32.8418 41.6582C32.8418 45.8522 34.1021 49.592 36.5207 53.0964L50.9956 75.6831C51.6978 76.7811 53.3036 76.7789 54.0044 75.6831L68.542 53.0196C70.9087 49.674 72.1582 45.7456 72.1582 41.6582C72.1582 30.8187 63.3395 22 52.5 22ZM52.5 50.5937C47.5732 50.5937 43.5645 46.585 43.5645 41.6582C43.5645 36.7314 47.5732 32.7227 52.5 32.7227C57.4268 32.7227 61.4355 36.7314 61.4355 41.6582C61.4355 46.585 57.4268 50.5937 52.5 50.5937Z" fill="#9E007E"/>
<path d="M66.4709 63.0672L57.4721 77.1361C55.1428 80.7678 49.8442 80.7559 47.5261 77.1396L38.5127 63.0709C30.5822 64.9045 25.6934 68.2634 25.6934 72.2774C25.6934 79.2425 39.5051 83 52.5 83C65.4949 83 79.3066 79.2425 79.3066 72.2774C79.3066 68.2605 74.411 64.8998 66.4709 63.0672Z" fill="#9E007E"/>
</g>
<defs>
<clipPath id="clip0_7877_37">
<rect width="61" height="61" fill="white" transform="translate(22 22)"/>
</clipPath>
</defs>
</svg>

              )}
            </div>

            <h3 className={styles.popupheading}>
              {naHeading?.value || "We Haven’t Reached Your Location Yet."}
            </h3>
            <p className={styles.popupdescription}>
              {naDescription?.value ||
                "We’re currently not available in this area. We’ll notify you when we’re near you."}
            </p>

            <div className={popupStyles.actions}>
              <button
                type="button"
                className={styles.allowBtn}
                onClick={handleUnavailableBack}
              >
                {naButtonText?.value || "BACK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const settings = {
  label: "Book Test Home Form",
  props: [
    { type: "image_picker", id: "image", label: "Left Side Image" },
    {
      type: "text",
      id: "imageTitle",
      label: "Form Title",
      default: "Book An Eye Test",
    },
    { type: "text", id: "imageText", label: "Text under Title (optional)" },
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
        "Allow location access and we'll select your city for your home eye test.",
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
      label: "Popup Icon (optional)",
    },
    {
      type: "text",
      id: "naHeading",
      label: "Not Available Popup Heading",
      default: "We Haven’t Reached Your Location Yet.",
    },
    {
      type: "textarea",
      id: "naDescription",
      label: "Not Available Popup Description",
      default:
        "We’re currently not available in this area. We’ll notify you when we’re near you.",
    },
    {
      type: "text",
      id: "naButtonText",
      label: "Not Available Popup Button Text",
      default: "BACK",
    },
  ],
};

Component.settings = settings;
export default Component;