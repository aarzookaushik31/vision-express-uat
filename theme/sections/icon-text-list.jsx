import React from "react";
import Slider from "react-slick";
import { useLocation } from "react-router-dom";
import StoreBenefitIcon from "../assets/images/pdp-footer/store-benefit.svg";
import ReviewBenefitIcon from "../assets/images/pdp-footer/review-benefit.svg";
import WarrantyBenefitIcon from "../assets/images/pdp-footer/warranty-benefit.svg";
import ExaminationBenefitIcon from "../assets/images/pdp-footer/examination-benefit.svg";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/icon-text-list.less";

export function Component({ blocks, props: sectionProps = {} }) {
  const location = useLocation();
  const isPdpDesign = /^(?:\/[a-zA-Z-]+)?\/product\/[^/]+\/?$/i.test(location.pathname);
  const isHome =
    typeof window !== "undefined" && window.location.pathname === "/";

  const items = (blocks || []).map((block, index) => {
          const props = block?.props || {};
          const BenefitIcon = isPdpDesign && sectionProps.use_figma_icons?.value !== false
            ? [StoreBenefitIcon, ReviewBenefitIcon, WarrantyBenefitIcon, ExaminationBenefitIcon][index]
            : null;

          return (
            <div key={index} className={styles.iconItem}>
              {/* Original configured-icon condition: props.image?.value && (...) */}
              {(props.image?.value || BenefitIcon) && (
                <div className={styles.listIcon} style={{ "--benefit-icon": `url("${props.image.value}")` }}>
                  {BenefitIcon ? <BenefitIcon aria-hidden="true" /> : (
                    <FyImage
                      src={props.image.value}
                      alt={props.title?.value || "Icon"}
                    />
                  )}
                </div>
              )}

              <div>
                {props.title?.value && (
                  <h3
                    className={styles.title}
                    dangerouslySetInnerHTML={{ __html: props.title.value }}
                  />
                )}

                {props.description?.value && (
                  <p
                    className={styles.text}
                    dangerouslySetInnerHTML={{ __html: props.description.value }}
                  />
                )}
              </div>
            </div>
          );
        });

  // Figma mobile uses stores, eye examination and reviews; retain every configured card in the desktop markup.
  // const mobileItems = isPdpDesign ? [items[0], items[3], items[1]].filter(Boolean) : items;
  // Show the same four PDP benefits on mobile in their desktop order.
  const mobileItems = isPdpDesign ? items.slice(0, 4) : items;

  return (
    <section
      className={`${styles.iconListSection} ${
        isHome ? styles.iconListSectionHome : styles.iconListSectioncontainer
      } ${isPdpDesign ? styles.pdpBenefits : ""}`}
    >
      <div className={styles.grid}>
        {items}
      </div>
      {!isHome && (
        <div className={styles.mobileBenefitsSlider}>
          <Slider
            slidesToShow={1}
            slidesToScroll={1}
            centerMode={true}
            // Previous calc padding is unsupported by react-slick slide-width calculations.
            // centerPadding="calc((100% - 308px) / 2)"
            centerPadding="40px"
            // Previous count: infinite={(blocks || []).length > 1}
            infinite={mobileItems.length > 1}
            // Previous count: dots={(blocks || []).length > 1}
            dots={mobileItems.length > 1}
            arrows={false}
            speed={400}
            cssEase="ease-in-out"
            swipeToSlide={true}
            accessibility={true}
            responsive={[{ breakpoint: 340, settings: { centerPadding: "12px" } }]}
          >
            {/* All configured items retained above; mobile shows the Figma subset. */}
            {/* Mobile now includes all four PDP benefits in desktop order. */}
            {mobileItems}
          </Slider>
        </div>
      )}
    </section>
  );
}

Component.displayName = "IconTextList";
export default Component; 

export const settings = {
  label: "Icon List Section",
  props: [{ type: "checkbox", id: "use_figma_icons", label: "Use Figma benefit icons on product pages", default: true }],
  blocks: [
    {
      type: "list_item",
      name: "Icon Item",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "Icon Image (50x50)",
        },
        {
          type: "text",
          id: "title",
          label: "Heading",
          default: "100+",
        },
        {
          type: "text",
          id: "description",
          label: "Text",
          default: "Stores in India & 550+ Global Stores ",
        },
      ],
    },
  ],
};

Component.settings = settings;
