import React from "react";
import styles from "../styles/sections/ve-care-section.less";
import placeholderImage from "../assets/images/placeholder/slideshow-desktop2.jpg";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};

  const {
    eyebrowText,
    heading,
    highlightText,
    description,
    logoImage,
    productImage,
    backgroundColor
  } = props || {};

  return (
    <section
      className={styles.veCareSection}
      style={{
        backgroundColor: backgroundColor?.value || "#f8f5f7"
      }}
    >
      <div className={styles.container}>
        {/* Left Content */}
        <div className={styles.content}>
          {eyebrowText?.value && (
            <p className={styles.eyebrow}>{eyebrowText.value}</p>
          )}
          
{heading?.value && (
  <h2 className={styles.heading}>
    <span
      dangerouslySetInnerHTML={{ __html: heading.value }}
    />

    {(highlightText?.value || logoImage?.value) && (
      <span className={styles.inlineHighlight}>
        {logoImage?.value ? (
          <img src={logoImage.value} alt="Brand Logo" />
        ) : (
          highlightText.value
        )}
      </span>
    )}
  </h2>
)}

          {description?.value && (
            <p className={styles.description}>{description.value}</p>
          )}
        </div>

        {/* Right Image */}
        <div className={styles.imageWrapper}>
          <img
            src={productImage?.value || placeholderImage}
            alt="Product"
          />
        </div>
      </div>
    </section>
  );
}

Component.displayName = "VeCareSection";
export default Component;








export const settings = {
  label: "Ve-Care Protection Section",
  props: [
    {
      id: "eyebrowText",
      type: "text",
      label: "Top Small Text",
      default: "SCRATCHES, CRACKS, DAMAGE?"
    },
    {
      id: "heading",
      type: "textarea",
      label: "Heading",
      default: "YOU'RE PROTECTED WITH"
    },
    {
      id: "highlightText",
      type: "text",
      label: "Highlighted Brand Text",
      default: "Ve-Care Protect"
    },
    {
      id: "logoImage",
      type: "image_picker",
      label: "Brand Logo (optional - overrides text)"
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default:
        "From accidental drops to daily wear & tear - Ve-Care keeps your eyewear protected for 3 years."
    },
    {
      id: "productImage",
      type: "image_picker",
      label: "Right Side Product Image"
    },
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#f8f5f7"
    }
  ],
  blocks: []
};

Component.settings = settings;
