import React from "react";
import styles from "../styles/sections/lens-hero-banner.less";

function HeroSection({ props = {} }) {
  
    const {background_image, logo, heading,feature_image, text_alignment,  near_filled,
             intermediate_filled,
             far_filled } = props;


    const renderFilledSpans = (count) => {
    const total = 10; 
    return Array.from({ length: total }, (_, idx) => (
      <span
        key={idx}
        className={`${styles.visionBlock} ${idx < count ? styles.filled : ""}`}
      />
    ));
  };


  return (
    <section
      className={styles.heroSection}
      style={{
        backgroundImage: background_image?.value ? `url(${background_image.value})` : "none",
      }}
    >
      <div className={`${styles.heroContent} ${styles[text_alignment.value]}`}>

        <div className={styles.heroContentInner}>
        {logo?.value ? <img src={logo.value} alt="Logo" className={styles.logo} /> : null}

        {heading?.value ? <h1 className={styles.heading}>{heading.value}</h1> : null}

        {feature_image?.value ? (
          <img src={feature_image.value} alt="Feature" className={styles.featureImage} />
        ) : null}


         <div className={styles.visionRowContainer}>
                         {near_filled?.value > 0 && (
                         <div className={`${styles.nearFilledContainer} ${styles.visionRow}`}>
                            <span className={styles.visionRowText}>
                             Near
                            </span>
                             <div className={styles.rowBlocks}>
                {renderFilledSpans(near_filled.value)}
              </div>
                          </div>
                         )}
                          {intermediate_filled?.value > 0 && (
                           <div className={`${styles.intermediateFilledContainer} ${styles.visionRow}`}>
                            <span className={styles.visionRowText}>
                              Intermediate
                            </span>
                            <div className={styles.rowBlocks}>
                {renderFilledSpans(intermediate_filled.value)}
              </div>
                          </div>
                           )}
                           {far_filled?.value > 0 && (
                           <div className={`${styles.farFilledContainer} ${styles.visionRow}`}>
                             <span className={styles.visionRowText}>
                                  Far
                            </span>
                            <div className={styles.rowBlocks}>
                {renderFilledSpans(far_filled.value)}
              </div>
                          </div>
                           )}
                           </div>
        
        </div>
      </div>
    </section>
  );
}

export const settings = {
  label: "Lens Hero Banner",
  props: [
    { id: "background_image", type: "image_picker", default: "", label: "Background Image" },
    { id: "logo", type: "image_picker", default: "", label: "Logo Image" },
    { id: "heading", type: "text", default: "Your Heading", label: "Heading" },
    { id: "feature_image", type: "image_picker", default: "", label: "Feature Image" },
    {
      id: "text_alignment",
      type: "select",
      options: [
        { value: "left", text: "Left" },
        { value: "center", text: "Center" },
        { value: "right", text: "Right" },
      ],
      default: "left",
      label: "Text Alignment",
    },
    {
  type: "select",
  id: "near_filled",
  label: "Near Blocks Filled",
  options: Array.from({ length: 11 }, (_, i) => ({ text: i.toString(), value: i.toString() })),
  default: "0",
},
{
  type: "select",
  id: "intermediate_filled",
  label: "Intermediate Blocks Filled",
  options: Array.from({ length: 11 }, (_, i) => ({ text: i.toString(), value: i.toString() })),
  default: "0",
},
{
  type: "select",
  id: "far_filled",
  label: "Far Blocks Filled",
  options: Array.from({ length: 11 }, (_, i) => ({ text: i.toString(), value: i.toString() })),
  default: "0",
}
  ],
};

export default HeroSection;
