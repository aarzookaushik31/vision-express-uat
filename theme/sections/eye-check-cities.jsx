import React, { useEffect, useState } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/eye-check-cities.less";

export function Component({ props = {}, blocks = [] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const backgroundImageUrl = isMobile
    ? props.background_image_mobile?.value || props.background_image?.value
    : props.background_image?.value;

  return (
    <div className={styles["city-highlight-section"]}>
      <div
        className={styles["city-highlight-section-container"]}
        style={{
          backgroundImage: backgroundImageUrl
            ? `url(${backgroundImageUrl})`
            : "none",
        }}
      >
        <div className={styles["content-wrapper"]}>
          {props.heading?.value && (
            <h2 className={styles["heading"]}>{props.heading.value}</h2>
          )}
          {props.subheading?.value && (
            <p className={styles["subheading"]}>{props.subheading.value}</p>
          )}

          <div className={styles["button-group"]}>
            {props.primary_button_label?.value && (
              <FDKLink
                to={props.primary_button_link?.value || "#"}
                className={styles["btn-primary"]}
              >
                {props.primary_button_label.value}
              </FDKLink>
            )}
            {props.secondary_button_label?.value && (
              <FDKLink
                to={props.secondary_button_link?.value || "#"}
                className={styles["btn-secondary"]}
              >
                {props.secondary_button_label.value}
              </FDKLink>
            )}
          </div>
        </div>
      </div>

      <div className={styles["city-highlight-bottom-row"]}>
        {props.city_list_text?.value && (
          <div className={styles["city-item-title"]}>
            <span className={styles["city-list-title"]}>
              {props.city_list_text.value}
            </span>
          </div>
        )}

        <div className={styles["cities-list"]}>
          {(blocks || []).map((block, index) => {
            const bProps = block?.props || {};
            return (
              <a  href={`/locate-us?cityName=${encodeURIComponent(bProps.city_name?.value || "")}`} className={styles["city-item"]} key={index}>
                {bProps.city_icon?.value && (
                  <FyImage
                    src={bProps.city_icon.value}
                    alt={bProps.city_name?.value || "City"}
                    className={styles["city-icon"]}
                  />
                )}
                {bProps.city_name?.value && (
                  <span className={styles["city-name"]}>
                    {bProps.city_name.value}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Component.displayName = "CityHighlightSection";

export const settings = {
  label: "City Highlight Section",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "Discover Your City",
    },
    {
      type: "text",
      id: "subheading",
      label: "Subheading",
      default: "Find services available in your area",
    },
    {
      type: "image_picker",
      id: "background_image",
      label: "Background Image",
    },
    {
      type: "image_picker",
      id: "background_image_mobile",
      label: "Mobile Background Image",
    },
    {
      type: "text",
      id: "primary_button_label",
      label: "Primary Button Label",
      default: "Explore Now",
    },
    {
      type: "url",
      id: "primary_button_link",
      label: "Primary Button Link",
    },
    {
      type: "text",
      id: "secondary_button_label",
      label: "Secondary Button Label",
      default: "View All Cities",
    },
    {
      type: "url",
      id: "secondary_button_link",
      label: "Secondary Button Link",
    },
    {
      type: "text",
      id: "city_list_text",
      label: "City List Heading",
      default: "Walk In. We're in 30+ Cities :",
    },
  ],
  blocks: [
    {
      type: "block",
      name: "City Block",
      props: [
        {
          type: "text",
          id: "city_name",
          label: "City Name",
        },
        {
          type: "image_picker",
          id: "city_icon",
          label: "City Icon Image",
        },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;
