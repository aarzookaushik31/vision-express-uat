import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/sections/book-test-form.less";
import FormSubmitEye from "../assets/images/form-submit-eye-white.png"
import CloseIcon from "../assets/images/close.svg";
import { GET_CUSTOM_FORM, POST_CUSTOM_FORM } from "../queries/bookFormQuery";

const BASE_URL = `${window.location.origin}`;

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

export function Component({ props = {} }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState({});
  const [allStores, setAllStores] = useState([]);
  const [isAutoSelected, setIsAutoSelected] = useState(false);


  const storeCodeRef = useRef(null);

  const { image, imageTitle } = props;
  const slug = "book-an-eye-test";

  // ✅ Fetch form structure
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const payload = { slug };
        const res = await fpi.executeGQL(GET_CUSTOM_FORM, payload);
        if (res?.data?.support) {
          const form = res.data.support.custom_form;
          setContent(form);

          const initData = {};
          const initErr = {};
          form.inputs.forEach((i) => {
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

  // ✅ Fetch stores via API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const result = await getLocateUsStoreAPI();
        const stores = result?.data?.items || result?.data || [];

        if (stores.length) {
          console.log("✅ Stores fetched:", stores);
          setAllStores(stores);

          // Extract unique states
          const states = [
            ...new Set(stores.map((s) => s.store_state).filter(Boolean)),
          ];

          // Update state dropdown
          setContent((prev) => {
            if (!prev?.inputs) return prev;
            const updatedInputs = prev.inputs.map((input) =>
              input.key === "state" || input.key === "store-state"
                ? {
                    ...input,
                    enum: states.map((s) => ({ key: s, display: s })),
                  }
                : input
            );
            return { ...prev, inputs: updatedInputs };
          });
        } else console.warn("⚠️ No stores returned from API");
      } catch (err) {
        console.error("❌ Error fetching stores:", err);
      }
    };
    fetchStores();
  }, []);

  // ✅ Update city dropdown when state changes
  useEffect(() => {
    if (!allStores.length) return;

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

    setContent((prev) => {
      if (!prev.inputs) return prev;
      const updatedInputs = prev.inputs.map((input) =>
        input.key === "city"
          ? { ...input, enum: cities.map((c) => ({ key: c, display: c })) }
          : input
      );
      return { ...prev, inputs: updatedInputs };
    });

    setFormData((prev) => ({ ...prev, city: "", store: "" }));
  }, [formData.state, allStores]);

  // ✅ Update store dropdown when city changes
  useEffect(() => {
    if (!allStores.length) return;

    const storeNames = formData.city
      ? [
          ...new Set(
            allStores
              .filter((s) => s.store_city === formData.city)
              .map((s) => s.store_name)
              .filter(Boolean)
          ),
        ]
      : [];

    setContent((prev) => {
      if (!prev.inputs) return prev;
      const updatedInputs = prev.inputs.map((input) =>
        input.key === "store" ||
        input.key === "store-name" ||
        input.key === "choose-store"
          ? { ...input, enum: storeNames.map((n) => ({ key: n, display: n })) }
          : input
      );
      return { ...prev, inputs: updatedInputs };
    });

    setFormData((prev) => ({ ...prev, store: "" }));
  }, [formData.city, allStores]);



// ✅ STEP 1: Auto-select store based on storeCode from URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("storeCode");
  if (code) storeCodeRef.current = code.trim();
}, []);

// ✅ STEP 2: When all stores load, initialize states + maybe preselect store state
useEffect(() => {
  if (!allStores.length) return;

  const states = [...new Set(allStores.map(s => s.store_state).filter(Boolean))];

  setContent(prev => {
    if (!prev?.inputs) return prev;
    const updatedInputs = prev.inputs.map(input =>
      input.key === "state" || input.key === "store-state"
        ? { ...input, enum: states.map(s => ({ key: s, display: s })) }
        : input
    );
    return { ...prev, inputs: updatedInputs };
  });

  const code = storeCodeRef.current;
  if (!code) return;

  const selectedStore = allStores.find(
    s => s.store_code?.toLowerCase() === code.toLowerCase()
  );
  if (!selectedStore) return console.warn("❌ No store found for code:", code);

  storeCodeRef.current = selectedStore; // hold full store object
  setFormData(prev => ({ ...prev, state: selectedStore.store_state || "" }));
}, [allStores]);




useEffect(() => {
  if (!allStores.length || !content?.inputs) return;

  const params = new URLSearchParams(window.location.search);
  const storeCode = params.get("storeCode");

  const states = [...new Set(allStores.map(s => s.store_state).filter(Boolean))];
  const selectedState = formData.state;

  const cities = selectedState
    ? [...new Set(allStores.filter(s => s.store_state === selectedState).map(s => s.store_city).filter(Boolean))]
    : [];


  const selectedCity = formData.city;
  const storeOptions = selectedCity
    ? allStores
        .filter(s => s.store_state === selectedState && s.store_city === selectedCity)
        .map(s => ({ key: s.store_name, display: s.store_name }))
    : [];

  if (storeCode) {
    const match = allStores.find(
      s => s.store_code?.toLowerCase() === storeCode.toLowerCase()
    );
  if (match) {
  setFormData(prev => ({
    ...prev,
    state: match.store_state || "",
    city: match.store_city || "",
    ["store"]: match.store_name || "",
    ["store-name"]: match.store_name || "",
    ["choose-store"]: match.store_name || "",
  }));
  setIsAutoSelected(true); 
}

  }

  setContent(prev => {
    if (!prev?.inputs) return prev;
    const updatedInputs = prev.inputs.map(input => {
      if (input.key === "state" || input.key === "store-state") {
        return { ...input, enum: states.map(s => ({ key: s, display: s })) };
      } else if (input.key === "city" || input.key === "store-city") {
        return { ...input, enum: cities.map(c => ({ key: c, display: c })) };
      } else if (input.key === "store" || input.key === "store-name") {
        return { ...input, enum: storeOptions };
      }
      return input;
    });
    return { ...prev, inputs: updatedInputs };
  });
}, [allStores, formData.state, formData.city]);




  // ✅ Form validation
  const validateForm = () => {
    let valid = true;
    const errors = { ...formError };
    const now = new Date();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
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
      } else if (key === "date" && new Date(value) < now) {
        errors[key] = "Date cannot be in the past";
        valid = false;
      }
    });

    setFormError(errors);
    return valid;
  };

// ✅ Handle change
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData((prev) => {
    const updated = {
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "state") {
      updated.city = "";
      updated.store = "";
      setIsAutoSelected(false);
    }
    if (name === "city") {
      updated.store = "";
      setIsAutoSelected(false);
    }

    return updated;
  });
};

// ✅ Handle submit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

const responsePayload = content.inputs.map((input) => {
  const value = formData[input.key];

  if (["state", "city", "store", "store-name", "choose-store"].includes(input.key)) {
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







 const selectedStore =
    allStores.find(
      (s) =>
        s.store_name === formData.store ||
        s.store_name === formData["store-name"] ||
        s.store_name === formData["choose-store"]
    ) || null;

console.log(selectedStore)

  const storeEmail = selectedStore?.email_address || "";
  console.log(storeEmail)
  





    setShowSuccessMessage(true);


    // Reset form after success
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
    setShowSuccessMessage(false)
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div className={styles.booktest_container}>
      <div className={styles.breadcrumbs}>
        <a href="/">Home /</a> Book an Eye Test
      </div>

      <div className={styles.bookTestTabs}>
        <div className={styles.activeTab}>Book An Eye Test - IN STORE</div>
        <div>
          <a href="/sections/book-an-eye-test-home">
            HOME EYE TEST APPOINTMENT
          </a>
        </div>
      </div>

      <div className={styles.booktest_content}>
        {image?.value && (
          <div className={styles.image_section}>
            <img src={image.value} alt="Book Test" />
            <div className={styles.textOverImage}>
              {imageTitle?.value && <h2>{imageTitle.value}</h2>}
            </div>
          </div>
        )}

        <div className={`${styles.form_section} ${
    showSuccessMessage ? styles.successBackground : ""
  }`}>
          {showSuccessMessage ? (
          <div className={styles.success_wrapper}>

                  <span className={styles.closeSuccessButton} onClick={closeDialog}>
                              <CloseIcon className={styles.closeIcon} />
                            </span>

            <img src={FormSubmitEye} />
      
            <h2 className={styles.success_message}>
              You're All Set for Your Eye Test!
            </h2>
            <p>Thank you for booking your in-store eye test with Vision Express. <br/><br/>
      Our certified optometrists will be ready for you at your scheduled time. Expect a confirmation message with all details shortly.</p>
      
      <a href="/products">Explore Products</a>
      
          </div>
        ) : (

         <form onSubmit={handleSubmit}>
  {content.inputs.map((input) => {
    const isDynamicSelect = ["state", "city", "store", "store-name", "choose-store"].includes(input.key);

    return (
      <div className={styles.fgroup} key={input.key}>
        {input.type !== "checkbox" && <label>{input.display}</label>}

        {/* 📍 Date input */}
        {input.key === "date" ? (
          <input
            type="date"
            name={input.key}
            value={formData[input.key]}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            required={input.required}
          />
        ) : 
        /* 📍 Dynamic Select (state, city, store) */
       (input.type === "dropdown" || isDynamicSelect) ? (
  <select
    name={input.key}
    value={formData[input.key]}
    onChange={handleChange}
    required={input.required}
  >
    <option value="">Select {input.display}</option>
    {input.enum?.map((opt, idx) => (
      <option key={opt.key || idx} value={opt.display || opt.key}>
        {opt.display || opt.key}
      </option>
    ))}
  </select>
) :
        /* 📍 Text or Email or Number */
        input.type === "text" || input.type === "email" || input.type === "number" ? (
          <input
            type={input.key === "contact-number" ? "tel" : input.type}
            name={input.key}
            value={formData[input.key]}
            onChange={handleChange}
            placeholder={input.placeholder}
            required={input.required}
          />
        ) : 
        /* 📍 Checkbox */
        input.type === "checkbox" ? (
          <label className={styles.checkbox_label}>
            <input
              type="checkbox"
              name={input.key}
              checked={formData[input.key] || false}
              onChange={handleChange}
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
    </div>
  );
}

export const settings = {
  label: "Book Test Form",
  props: [
    { type: "image_picker", id: "image", label: "Right Side Image" },
    {
      type: "text",
      id: "imageTitle",
      label: "Title on Image",
      default: "Book an Eye Test",
    },
  ],
};

Component.settings = settings;
export default Component;
