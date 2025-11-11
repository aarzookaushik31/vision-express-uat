import React from "react";
import Slider from "react-slick";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/sections/top-brands.less";

export function Component({ props = {}, blocks = [] }) {
  if (!Array.isArray(blocks)) blocks = [];

  const brandBlocks = blocks.filter((block) => block?.type === "brand_block");
  const featuredSlides = blocks.filter(
    (block) => block?.type === "featured_slides"
  );

  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className={styles["top-brands-section"]}>
      <div className={styles["top-brands-section-content"]}>
        <div className={styles["heading-row"]}>
          {props.heading?.value && <h2>{props.heading.value}</h2>}
          {props.subheading?.value && <p>{props.subheading.value}</p>}
        </div>

        <div className={styles["brand-section-content"]}>
          <div className={styles["brands-grid"]}>
            {brandBlocks.map((block, index) => {
              const bProps = block?.props || {};
              return (
                <div
                  className={styles["brand-block"]}
                  key={block?.uid || index}
                >
                  {bProps.brand_image?.value && bProps.button_link?.value && (
                    <FDKLink to={bProps.button_link.value}>
                      <FyImage
                        src={bProps.brand_image.value}
                        alt={bProps.brand_image?.alt || `Brand ${index + 1}`}
                      />
                    </FDKLink>
                  )}
                </div>
              );
            })}

            {props.viewall_button_link?.value && (
              <div className={styles["brand-block"]} key="view-all">
                <FDKLink
                  to={props.viewall_button_link.value}
                  className={styles["view-all-link"]}
                >
                  View All <span className={styles["arrow"]}>→</span>
                </FDKLink>
              </div>
            )}
          </div>

          {featuredSlides.length > 0 && (
            <div className={styles["brand-featured-slider"]}>
              <Slider {...sliderSettings}>
                {featuredSlides.map((slide, index) => {
                  const sProps = slide?.props || {};
                  return (
                    <div
                      className={styles["featured-slide"]}
                      key={slide?.uid || index}
                    >
                      {sProps.image?.value && (
                        <FyImage
                          src={sProps.image.value}
                          alt={sProps.image?.alt || `Slide ${index + 1}`}
                        />
                      )}
                      {sProps.brand_logo?.value && (
                        <div
                          className={
                            styles["brand-featured-section-brand-image"]
                          }
                        >
                          <FyImage
                            src={sProps.brand_logo.value}
                            alt={sProps.brand_logo?.alt || "Brand Logo"}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </Slider>

              {props.section_button_link?.value &&
                props.section_button_label?.value && (
                  <FDKLink
                    to={props.section_button_link.value}
                    className={styles["brand-button"]}
                  >
                    {props.section_button_label.value}
                  </FDKLink>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const settings = {
  label: "Top International Brands",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Section Heading",
      default: "Top International Brands",
    },
    {
      type: "text",
      id: "subheading",
      label: "Section Subheading",
      default: "Explore premium global brands curated just for you.",
    },
    {
      type: "url",
      id: "viewall_button_link",
      label: "View All Button Link",
    },
    {
      type: "url",
      id: "section_button_link",
      label: "Slider Button Link",
    },
    {
      type: "text",
      id: "section_button_label",
      label: "Slider Button Label",
      default: "Shop Now",
    },
  ],
  blocks: [
    {
      type: "brand_block",
      name: "Brand Block",
      props: [
        {
          type: "image_picker",
          id: "brand_image",
          label: "Brand Image",
        },
        {
          type: "url",
          id: "button_link",
          label: "Button Link",
        },
      ],
    },
    {
      type: "featured_slides",
      name: "Featured Slide",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Slide Image",
        },
        {
          type: "image_picker",
          id: "brand_logo",
          label: "Brand Logo Image",
        },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;
