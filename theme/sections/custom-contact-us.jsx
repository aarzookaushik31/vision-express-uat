import React, { useEffect, useState } from "react";
import useHeader from "../components/header/useHeader";
import { GET_CUSTOM_FORM, POST_CUSTOM_FORM } from "../queries/bookFormQuery";
import { useSnackbar } from "../helper/hooks";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import styles from "../styles/sections/custom-contact-us.less";
import ContactEmailIcon from "../assets/images/contact-email-icon.png";
import ContactPhoneIcon from "../assets/images/contact-phone-icon.png";
import ContactAddressIcon from "../assets/images/contact-address-icon.png";
import FormSubmitEye from "../assets/images/form-submit-eye-white.png";
import CloseIcon from "../assets/images/close.svg";

// Must match the slug of the form created in Fynd Platform -> Forms
const FORM_SLUG = "contact-us";

// The input keys in the Fynd form can be named differently from our state keys.
// Each state field below is matched to a Fynd input by any of these keys.
const FIELD_ALIASES = {
  name: ["name", "full-name", "full_name", "fullname"],
  phone: ["phone", "contact-number", "contact_number", "mobile"],
  email: ["email", "email-address", "email_address"],
  comment: ["comment", "message", "comments"],
};

// Finds which of our state fields (name/phone/email/comment) a Fynd input key maps to
const getFieldForInputKey = (inputKey = "") => {
  const k = String(inputKey).toLowerCase();
  return (
    Object.keys(FIELD_ALIASES).find((field) =>
      FIELD_ALIASES[field].includes(k)
    ) || null
  );
};

function Component({ props = {} }) {
  const fpi = useFPI();
  const { supportInfo, appInfo, contactInfo } = useHeader(fpi);
  const { t } = useGlobalTranslation("translation");
  const { showSnackbar } = useSnackbar();
  const location = useLocation();

  // Left-side image chosen from the editor
  const { image } = props;

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formInputs, setFormInputs] = useState([]); // input definitions from Fynd form

  const { email, phone } = supportInfo?.contact ?? {};
  const { active: emailActive = false, email: emailArray = [] } = email ?? {};
  const { active: phoneActive = false, phone: phoneArray = [] } = phone ?? {};

  const storeAddress = contactInfo?.address;
  const storeDescription = contactInfo?.description || appInfo?.description;

  const getPrefillData = (search) => {
    const params = new URLSearchParams(search);
    const sanitize = (val) =>
      decodeURIComponent(val || "")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/^"|"$/g, "")
        .trim();

    return {
      values: {
        name: sanitize(params.get("name")),
        phone: sanitize(params.get("phone")),
        email: sanitize(params.get("email")),
      },
    };
  };

  const prefillData = getPrefillData(location.search);

  const [formData, setFormData] = useState({
    name: prefillData.values.name || "",
    phone: prefillData.values.phone || "",
    email: prefillData.values.email || "",
    comment: "",
  });

  /* ---------- Load the form definition so we use the exact input keys ---------- */
  useEffect(() => {
    let cancelled = false;

    const fetchForm = async () => {
      try {
        const res = await fpi.executeGQL(GET_CUSTOM_FORM, { slug: FORM_SLUG });
        const inputs = res?.data?.support?.custom_form?.inputs || [];
        if (!cancelled) setFormInputs(inputs);
      } catch (err) {
        // Not fatal: submit falls back to default keys
        console.error("Could not load contact form definition:", err);
      }
    };

    fetchForm();
    return () => {
      cancelled = true;
    };
  }, [fpi]);

  /* ---------- Validation ---------- */
  const validateField = (name, value) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;

    if (!value || value.trim() === "") {
      return "This field is required";
    }

    if (name === "name" && !nameRegex.test(value)) {
      return "Please enter a valid name (letters only)";
    }

    if (name === "phone") {
      if (!phoneRegex.test(value) || /^(\d)\1{9}$/.test(value)) {
        return "Please enter a valid 10 digit mobile number";
      }
    }

    if (name === "email" && !emailRegex.test(value)) {
      return "Please enter a valid email address";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /* ---------- Build the payload the Fynd form API expects ---------- */
  const buildResponsePayload = () => {
    // Preferred: one entry per input defined in the Fynd form, using its exact key
    if (formInputs.length) {
      return formInputs.map((input) => {
        const field = getFieldForInputKey(input.key);
        return { key: input.key, value: field ? formData[field] : "" };
      });
    }

    // Fallback if the form definition could not be loaded
    return [
      { key: "name", value: formData.name },
      { key: "phone", value: formData.phone },
      { key: "email", value: formData.email },
      { key: "comment", value: formData.comment },
    ];
  };

  /* ---------- Submit ---------- */
  const handleSubmitForm = async () => {
    if (submitting) return;

    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      if (field === "comment") return;

      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fpi.executeGQL(POST_CUSTOM_FORM, {
        slug: FORM_SLUG,
        customFormSubmissionPayloadInput: {
          response: buildResponsePayload(),
        },
      });

      // executeGQL can resolve with GraphQL errors instead of throwing
      if (res?.errors?.length) {
        throw new Error(res.errors[0]?.message || "Form submission failed");
      }

      setShowSuccessMessage(true);
      setFormData({ name: "", phone: "", email: "", comment: "" });
    } catch (error) {
      console.error("Contact form submission error:", error);
      showSnackbar(
        t("resource.common.error_occurred_submitting_form"),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeDialog = () => {
    setShowSuccessMessage(false);
  };

  return (
    <div className={styles.contactPageContainer}>
      {/* LEFT: photo + contact details card */}
      <div className={styles.contactInfo}>
        {image?.value && (
          <img
            className={styles.heroImage}
            src={image.value}
            alt="Customer support"
          />
        )}

        <div className={styles.infoCard}>
          {emailActive && emailArray?.length > 0 && (
            <div className={styles.contactEmails}>
              {emailArray.map((item, idx) => (
                <a
                  href={`mailto:${item?.value}`}
                  className={styles.iconItemContainer}
                  key={`email-${idx}`}
                >
                  <img alt="email icon" src={ContactEmailIcon} />
                  <div>
                    <h2>{item?.key}</h2>
                    <p>{item?.value}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {phoneActive && phoneArray?.length > 0 && (
            <div className={styles.contactPhones}>
              {phoneArray.map((item, idx) => (
                <a
                  href={`tel:${item?.number}`}
                  className={styles.iconItemContainer}
                  key={`phone-${idx}`}
                >
                  <img alt="phone icon" src={ContactPhoneIcon} />
                  <div>
                    <h2>{item?.key}</h2>
                    <p>
                      {`${item?.code ? `+${item.code}-` : ""}${item?.number}`}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {storeAddress && (
            <div className={styles.iconItemContainer}>
              <img alt="Address icon" src={ContactAddressIcon} />
              <div>
                <h2>Reliance Vision Express Private Limited</h2>
                <p className={styles.storeAddress}>
                  {storeAddress?.address_line?.join(", ")},
                  {storeAddress?.city}, {storeAddress?.pincode},
                  {storeAddress?.country}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: heading, description, form */}
      <div
        className={`${styles.contactFormContainer} ${
          showSuccessMessage ? styles.successBackground : ""
        }`}
      >
        {showSuccessMessage ? (
          <div className={styles.successWrapper}>
            <span className={styles.closeSuccessButton} onClick={closeDialog}>
              <CloseIcon className={styles.closeIcon} />
            </span>

            <img src={FormSubmitEye} alt="" />

            <h2 className={styles.success_message}>
              Thanks for Getting in Touch!
            </h2>
            <p>
              We've received your message and one of our team members will
              connect with you soon.
              <br />
              <br />
              We appreciate your patience and look forward to assisting you.
            </p>
          </div>
        ) : (
          <div className={styles.formInner}>
            <h1 className={styles.formTitle}>Get In Touch With Us</h1>

            {storeDescription && (
              <p className={styles.storeDescription}>{storeDescription}</p>
            )}

            <form
              className={styles.contactForm}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitForm();
              }}
            >
              <div className={styles.inputFlexGroup}>
                <div className={styles.inputfieldcontainer}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={styles.formInput}
                  />
                  {errors.name && (
                    <p className={styles.errorText}>{errors.name}</p>
                  )}
                </div>
                <div className={styles.inputfieldcontainer}>
                  <label htmlFor="phone">Contact Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="XXXXX XXXXX"
                    value={formData.phone}
                    required
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setFormData((prev) => ({ ...prev, phone: value }));
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    onBlur={handleBlur}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className={styles.formInput}
                  />
                  {errors.phone && (
                    <p className={styles.errorText}>{errors.phone}</p>
                  )}
                </div>
              </div>
              <div className={styles.inputfieldcontainer}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your Email address"
                  value={formData.email}
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.formInput}
                />
                {errors.email && (
                  <p className={styles.errorText}>{errors.email}</p>
                )}
              </div>
              <div className={styles.inputfieldcontainer}>
                <label htmlFor="comment">Message</label>
                <textarea
                  id="comment"
                  name="comment"
                  placeholder="Leave a message"
                  rows={5}
                  value={formData.comment}
                  onChange={handleChange}
                  className={styles.formTextarea}
                />
              </div>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export const settings = {
  label: "Custom Contact Us",
  props: [
    { type: "image_picker", id: "image", label: "Left Side Image" },
    {
      type: "checkbox",
      id: "show_address",
      default: true,
      label: "t:resource.sections.contact_us.address",
    },
    {
      type: "checkbox",
      id: "show_phone",
      default: true,
      label: "t:resource.sections.contact_us.phone",
    },
    {
      type: "checkbox",
      id: "show_email",
      default: true,
      label: "t:resource.sections.contact_us.email",
    },
  ],
};

export default Component;