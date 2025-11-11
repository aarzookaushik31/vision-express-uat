import React, {useState} from "react";
import useHeader from "../components/header/useHeader";
import { CREATE_TICKET } from "../queries/supportQuery";
import { useSnackbar } from "../helper/hooks";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import { getConfigFromProps } from "../helper/utils";
import { useLocation } from "react-router-dom";
import styles from "../styles/sections/custom-contact-us.less";
import ContactEmailIcon from "../assets/images/contact-email-icon.png";
import ContactPhoneIcon from "../assets/images/contact-phone-icon.png";
import ContactAddressIcon from "../assets/images/contact-address-icon.png";
import FormSubmitEye from "../assets/images/form-submit-eye-white.png"
import CloseIcon from "../assets/images/close.svg";

function Component({ props = {} }) {
  const fpi = useFPI();
  const { globalConfig, supportInfo, appInfo, contactInfo } = useHeader(fpi);
  const { t } = useGlobalTranslation("translation");
  const pageConfig = getConfigFromProps(props);
  const { showSnackbar } = useSnackbar();
  const location = useLocation();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);



  const { email, phone } = supportInfo?.contact ?? {};
  const { active: emailActive = false, email: emailArray = [] } = email ?? {};
  const { active: phoneActive = false, phone: phoneArray = [] } = phone ?? {};

  const storeAddress = contactInfo?.address;
  const storeDescription = contactInfo?.description || appInfo?.description;

   const getShopLogo = () =>
    appInfo?.logo?.secure_url;

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

  const handleSubmitForm = (data) => {
    try {
      let finalText = "";
      if (data?.name)
        finalText += `<b>${t("resource.common.name")}: </b>${data?.name}<br>`;
      if (data?.phone)
        finalText += `<b>${t("resource.common.phone")}: </b>${data?.phone}<br>`;
      if (data?.email)
        finalText += `<b>${t("resource.common.email")}: </b>${data?.email}<br>`;
      if (data?.comment)
        finalText += `<b>${t("resource.common.message")}: </b>${data?.comment}<br>`;

      finalText = `<div>${finalText}</div>`;
      const wordArray = Utf8.parse(finalText);
      finalText = Base64.stringify(wordArray);

      const values = {
        addTicketPayloadInput: {
          _custom_json: {
            comms_details: {
              name: data?.name,
              email: data?.email,
              phone: data?.phone,
            },
          },
          category: "contact-us",
          content: {
            attachments: [],
            description: finalText,
            title: t("resource.header.contact_request"),
          },
          priority: "low",
        },
      };

    fpi
  .executeGQL(CREATE_TICKET, values)
  .then(() => {
    setShowSuccessMessage(true);
  })
  .catch(() => {
    showSnackbar(t("resource.common.error_message"), "error");
  });

    } catch (error) {
      console.error("Error submitting form:", error);
      showSnackbar(
        t("resource.common.error_occurred_submitting_form"),
        "error"
      );
    }
  };

  
    const closeDialog = () => {
    setShowSuccessMessage(false)
  };

  return (
    <div className={styles.contactPageContainer}>
      <div className={styles.contactInfo}>
        <h1>Get In <br/> Touch With Us</h1>

        {storeDescription && (   
          <p className={styles.storeDescription}>{storeDescription}</p>  
        )}

        {emailActive && emailArray?.length > 0 && (
          <div className={styles.contactEmails}>
            {emailArray.map((item, idx) => (
              <a href={`mailto:${item?.value}`} className={styles.iconItemContainer} key={`email-${idx}`}>
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
              <a href={`tel:${item?.number}`} className={styles.iconItemContainer} key={`phone-${idx}`} >
                <img alt="phone icon" src={ContactPhoneIcon} />
                <div>
                  <h2>{item?.key}</h2>
                  <p > {`${item?.code ? `+${item.code}-` : ""}${item?.number}`}</p>
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




      <div className={`${styles.contactFormContainer} ${
          showSuccessMessage ? styles.successBackground : ""
        }`}>


{showSuccessMessage ? (
  <div className={styles.successWrapper}>

  <span className={styles.closeSuccessButton} onClick={closeDialog}>
                              <CloseIcon className={styles.closeIcon} />
                            </span>

     <img src={FormSubmitEye} />
         
               <h2 className={styles.success_message}>
                Thanks for Getting in Touch!
               </h2>
               <p>We've received your message and one of our team members will connect with you soon.
  <br/><br/>
     We appreciate your patience and look forward to assisting you.</p>
         
        
  </div>
) : (
        <div>

        <img  className={styles.logo} src={getShopLogo()} />

      <form
        className={styles.contactForm}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleSubmitForm(Object.fromEntries(formData.entries()));
        }}
      >
        <div className={styles.inputFlexGroup}>
          <div>
            <label htmlFor="name">Full Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your Full Name"
          defaultValue={prefillData.values.name}
          required
          className={styles.formInput}
        />
        </div>
        <div>
          <label htmlFor="phone">Contact Number</label>
        <input
          type="tel"
          name="phone"
          placeholder="+91 XXXXX XXXXX"
          defaultValue={prefillData.values.phone}
          required
          className={styles.formInput}
        />
        </div>
        </div>
        <div>
          <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your Email address"
          defaultValue={prefillData.values.email}
          required
          className={styles.formInput}
        />
        </div>
        <div>
          <label htmlFor="comment">Message</label>
        <textarea
          name="comment"
          placeholder="Leave a message"
          rows={5}
          className={styles.formTextarea}
        />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit
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
