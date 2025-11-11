import React, { useEffect, useState } from "react";
import styles from "../styles/sections/book-test-form.less";
import FormSubmitEye from "../assets/images/form-submit-eye-white.png";
import CloseIcon from "../assets/images/close.svg";
import { GET_CUSTOM_FORM, POST_CUSTOM_FORM } from "../queries/bookFormQuery";

export function Component({ props = {} }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { image, imageTitle, imageText } = props;
  const slug = "book-an-eye-test-home";

  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState({});

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const payload = { slug };
        const res = await fpi.executeGQL(GET_CUSTOM_FORM, payload);
        if (res?.data?.support) {
          setContent(res?.data?.support?.custom_form);

          const initialData = {};
          const initialError = {};
          res.data.support.custom_form.inputs.forEach((input) => {
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


  const validateForm = () => {
    let valid = true;
    const errors = { ...formError };
    const now = new Date();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];

     if (key === "full-name" && !/^[A-Za-z\s]+$/.test(value)) {
  errors[key] = "Only letters and spaces allowed";
  valid = false;
} else if (key === "contact-number" && (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value))) {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

   const responsePayload = content.inputs.map((input) => {
    const value = formData[input.key];

    if (input.type === "checkbox") {
      return { key: input.key, value: value ? input.enum[0].key : "" };
    }

    return { key: input.key, value };
  });


const requestBody = { 
  slug, 
  customFormSubmissionPayloadInput: { response: responsePayload }
};

    try {
      await fpi.executeGQL(POST_CUSTOM_FORM, requestBody);
      setShowSuccessMessage(true);
     

      const resetData = {};
     Object.keys(formData).forEach((key) => (resetData[key] = key === "checkbox" ? false : ""));
    setFormData(resetData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };


    const closeDialog = () => {
    setShowSuccessMessage(false)
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.booktest_container}>

    <div className={styles.breadcrumbs}><a href="/">Home /</a> Book an Eye Test</div>


    
        <div className={styles.bookTestTabs}>           
                <div><a href="/sections/book-an-eye-test">Book An Eye Test - IN STORE</a></div>
                <div className={styles.activeTab}>HOME EYE TEST APPOINTMENT</div>
          </div>
    


      <div className={styles.booktest_content}>
        {image?.value && (
          <div className={styles.image_section}>
            <img src={image.value} alt="Book Test" />

            <div className={styles.textOverImage}>
          {imageTitle?.value &&  <h2>{imageTitle.value}</h2>}
          {imageText?.value && 
                <p
                  dangerouslySetInnerHTML={{ __html: imageText.value }}
                />}
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
       Home Eye Test Appointment Confirmed
      </h2>
      <p>
        Your booking has been received successfully. <br/><br/>
A Vision Express representative will contact you soon to confirm your time slot and address. Our certified optometrists will ensure a safe and thorough eye test, right at your home.
      </p>

<a href="/products">Explore Products</a>

    </div>
  ) : (
          <form onSubmit={handleSubmit}>
            {content.inputs.map((input) => (
              <div className={styles.fgroup} key={input.key}>
                {input.type !== "checkbox" && <label>{input.display}</label>}

                {   input.key === "date" ? (
  <input
    type="date"
    name={input.key}
    value={formData[input.key]}
    onChange={handleChange}
    min={new Date().toISOString().split("T")[0]} 
    placeholder="YYYY-MM-DD"
    required={input.required}
  />
) :  input.type === "text" || input.type === "email" ? (
                  <input
                    type={input.key === "contact-number" ? "tel" : input.type}
                    name={input.key}
                    value={formData[input.key]}
                    onChange={handleChange}
                    placeholder={input.placeholder}
                    required={input.required}
                  />
                ) :  input.type === "number" ? (
                  <input
                    type={input.type}
                    name={input.key}
                    value={formData[input.key]}
                    onChange={handleChange}
                    placeholder={input.placeholder}
                    required={input.required}
                  />
                ) : input.type === "dropdown" ? (
                <select
  name={input.key}
  value={formData[input.key]}
  onChange={handleChange}
  required={input.required}
>
  <option value="">Select {input.display}</option>
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
                      required={input.required}
                    />
                    {input.display}
                  </label>
                ) : null}

                {formError[input.key] && (
                  <span className={styles.error_message}>{formError[input.key]}</span>
                )}
              </div>
            ))}

            <div className={styles.sgroup}>
              <input className={styles.submit_btn} type="submit" value="Submit" />
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export const settings = {
  label: "Book Test Home Form",
  props: [
    { type: "image_picker", id: "image", label: "Right Side Image" },
    { type: "text", id: "imageTitle", label: "Title on Image", default: "HOME EYE TEST APPOINTMENT" },
    { type: "text", id: "imageText", label: "Text on Image" },
  ],
};

Component.settings = settings;
export default Component;
