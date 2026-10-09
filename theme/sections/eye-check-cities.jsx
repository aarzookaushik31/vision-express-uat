import React, { useEffect, useRef, useState } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/eye-check-cities.less";

// Tracks whether ONE element is on screen, so the entrance animation
// plays only when the section is actually visible.
function useInView(ref) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Older browsers: just show everything
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Element has entered the (slightly shrunk) viewport -> play
        if (entry.isIntersecting) {
          setInView(true);
          return;
        }

        const viewportBottom = entry.rootBounds
          ? entry.rootBounds.bottom
          : window.innerHeight;

        // Reset ONLY when the element is below the screen (user scrolled
        // up past it) so it replays on the next scroll down. If it left
        // through the top, keep it shown.
        if (entry.boundingClientRect.top > viewportBottom) {
          setInView(false);
        }
      },
      {
        threshold: 0.15, // at least 15% of the section must be visible
        rootMargin: "0px 0px -8% 0px", // and slightly inside the bottom edge
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

export function Component({ props = {}, blocks = [] }) {
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const backgroundImageUrl = isMobile
    ? props.background_image_mobile?.value || props.background_image?.value
    : props.background_image?.value;

  const cityBlocks = blocks || [];

  // One city pill. The clone copy is only shown on mobile (for the seamless
  // marquee loop) and is hidden from screen readers / keyboard focus.
  const renderCity = (block, index, isClone = false) => {
    const bProps = block?.props || {};
    return (
      <a
        href={`/locate-us?cityName=${encodeURIComponent(
          bProps.city_name?.value || ""
        )}`}
        className={`${styles["city-item"]} ${
          isClone ? styles["city-item-clone"] : ""
        }`}
        key={`${isClone ? "clone" : "city"}-${index}`}
        aria-hidden={isClone || undefined}
        tabIndex={isClone ? -1 : undefined}
      >
        {bProps.city_icon?.value && (
          <FyImage
            src={bProps.city_icon.value}
            alt={bProps.city_name?.value || "City"}
            className={styles["city-icon"]}
          />
        )}
        {bProps.city_name?.value && (
          <span className={styles["city-name"]}>{bProps.city_name.value}</span>
        )}
      </a>
    );
  };

  // The title as part of the mobile marquee (hidden on desktop, where the
  // original fixed title is used instead)
  const renderMarqueeTitle = (isClone = false) => (
    <div
      className={styles["marquee-title"]}
      key={isClone ? "title-clone" : "title"}
      aria-hidden={isClone || undefined}
    >
      <span className={styles["marquee-title-text"]}>
        {props.city_list_text.value}
      </span>
    </div>
  );

  return (
    <div
      ref={sectionRef}
      className={`${styles["city-highlight-section"]} ${
        inView ? styles["inView"] : ""
      }`}
    >
      <div
        className={styles["city-highlight-section-container"]}
        style={{
          backgroundImage: backgroundImageUrl
            ? `url(${backgroundImageUrl})`
            : "none",
        }}
      >
        <div className={styles["content-wrapper-outer"]}>
          <div className={styles["content-wrapper"]}>
            {props.logo?.value && (
              <img
                src={props.logo.value}
                alt={props.heading?.value || "Logo"}
                width={140}
                height={25}
                className={styles["brand-logo"]}
              />
            )}
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
                  {props.primary_button_icon?.value && (
                    <img
                      src={props.primary_button_icon.value}
                      alt=""
                      className={styles["btn-icon"]}
                    />
                  )}
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
      </div>

      <div className={styles["city-highlight-bottom-row-outer"]}>
        <div className={styles["city-highlight-bottom-row"]}>
          {/* Fixed title (desktop only, hidden on mobile) */}
          {props.city_list_text?.value && (
            <div className={styles["city-item-title"]}>
              <span className={styles["city-list-title"]}>
                {props.city_list_text.value}
              </span>
            </div>
          )}

          <div className={styles["cities-list"]}>
            <div
              className={styles["cities-track"]}
              style={{
                // ~3s per city, so the speed feels the same whatever the count
                "--marquee-duration": `${Math.max(cityBlocks.length * 3, 10)}s`,
              }}
            >
              {/* Set 1 */}
              {props.city_list_text?.value && renderMarqueeTitle()}
              {cityBlocks.map((block, index) => renderCity(block, index))}

              {/* Set 2 (clone, for the seamless loop) */}
              {props.city_list_text?.value && renderMarqueeTitle(true)}
              {cityBlocks.map((block, index) =>
                renderCity(block, index, true)
              )}
            </div>
          </div>
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
      type: "image_picker",
      id: "logo",
      label: "Logo (shown above heading)",
    },
    {
      type: "text",
      id: "heading",
      label: "Heading",
      default: "Clear Vision Looks Good on You",
    },
    {
      type: "text",
      id: "subheading",
      label: "Subheading",
      default: "",
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
      default: "Find Stores",
    },
    {
      type: "url",
      id: "primary_button_link",
      label: "Primary Button Link",
    },
    {
      type: "image_picker",
      id: "primary_button_icon",
      label: "Find Stores Button Icon",
    },
    {
      type: "text",
      id: "secondary_button_label",
      label: "Secondary Button Label",
      default: "Book A Home Test",
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
      default: "Walk-in, We're in 20+ Cities",
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