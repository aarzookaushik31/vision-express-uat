import React from "react";
import styles from "../styles/sections/text-and-image-with-grid.less";

export function Component({ props, blocks }) {
  const heading = props?.heading;
  const description = props?.description;
  const buttonText = props?.buttonText;
  const buttonLink = props?.buttonLink;

  return (
    <section className={styles.imageGridSection}>
      <div className={styles.container}>
        {/* Left side */}
        <div className={styles.leftContent}>
          {heading?.value && <h2>{heading.value}</h2>}
          {description?.value && <p>{description.value}</p>}
          {buttonText?.value && (
            <a href={buttonLink?.value || "#"} className={styles.desktopOnly}>
              <button className={styles.ctaButton}>{buttonText.value}</button>
            </a>
          )}
        </div>

        {/* Right side - grid of images */}
        <div className={styles.rightGrid}>
          {(blocks || []).map((block, index) => {
            const bProps = block?.props || {};
             const imageDesktop = bProps.image?.value;
            const imageMobile = bProps.imageMobile?.value || bProps.image?.value;
            const title = bProps.title?.value || "Untitled";
            const text = bProps.text?.value || "";
            const link = bProps.link?.value || "#";

            return (
              <div key={index} className={styles.imageCard}>

          
            

    <a href={link}>
      <div className={styles.imageWrapper}>
                  {imageMobile && (
                    <img className={styles.mobileOnly} src={imageMobile} alt={title}/>
                  )}
                  {imageDesktop && (
                    <img className={styles.desktopOnly} src={imageDesktop} alt={title} />
                  )}
        <div className={styles.overlay}>
          <h3>{title}</h3>
          {text && <p>{text}</p>}
        </div>
      </div>
    </a>
 
              </div>
            );
          })}
        </div>



          {buttonText?.value && (
                  <a
                    href={buttonLink?.value || "#"}
                    className={styles.mobileOnly}
                  >
                    <button className={styles.ctaButton}>{buttonText.value}</button>
                  </a>
                )}


      </div>
    </section>
  );
}

Component.displayName = "ImageGridSection";

export const settings = {
  label: "Image Grid Section",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "Book Your Eye Test Today",
    },
    {
      type: "textarea",
      id: "description",
      label: "Description",
      default:
        "Get expert consultation from certified professionals. Choose a store near you and schedule your appointment conveniently online.",
    },
    {
      type: "text",
      id: "buttonText",
      label: "Button Text",
      default: "Book Now",
    },
    {
      type: "url",
      id: "buttonLink",
      label: "Button Link",
      default: "#",
    },
  ],
  blocks: [
    {
      type: "list_item",
      name: "Image Card",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Image",
        },
          {
          type: "image_picker",
          id: "imageMobile",
          label: "Mobile Image",
        },
        {
          type: "text",
          id: "title",
          label: "Image Title",
          default: "Modern Equipment",
        },
        {
          type: "textarea",
          id: "text",
          label: "Image Text",
          default: "Experience precise and comfortable testing.",
        },
        {
          type: "url",
          id: "link",
          label: "Card Link",
          default: "#",
        },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;
