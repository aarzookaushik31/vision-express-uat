import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "../styles/sections/solo-image.less";

export function Component({ props={} }) {
  const {image, imageMobile, background_color, padding, margin} = props;


  const sectionStyle = {
    padding: padding?.value  || "",
    margin: margin?.value  || "",
    backgroundColor : background_color?.value || "rgba(248, 247, 245, 1)"
  };

  const finalMobileImage = imageMobile?.value || image?.value;

  return (
    <section className={styles.comparisonSection} style={sectionStyle}>
      <div className={styles.imageWrapper}>

        {image?.value && (
          <div className={styles.desktopImg}>
            <FyImage
              src={image.value}
              alt="comparison-image-desktop"
              isFixedAspectRatio={false}
            />
          </div>
        )}

        {finalMobileImage && (
          <div className={styles.mobileImg}>
            <FyImage
              src={finalMobileImage}
              alt="comparison-image-mobile"
              isFixedAspectRatio={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export const settings = {
  label: "Image Section",
  props: [
    {
      type: "image_picker",
      id: "image",
      label: "Desktop Image",
    },
    {
      type: "image_picker",
      id: "imageMobile",
      label: "Mobile Image",
    },
     {
  type: "color",
  id: "background_color",
  label: "Background Color",
  default: "rgba(248, 247, 245, 1)"
},
    {
      type: "text",
      id: "padding",
      label: "Section Padding (CSS syntax)",
      default: "0",
    },
    {
      type: "text",
      id: "margin",
      label: "Section Margin (CSS syntax)",
      default: "0",
    },
  ],
  preset: {
    props: {
      image: "",
      imageMobile: "",
      padding: "0",
      margin: "0",
    },
  },
};

export default Component;
