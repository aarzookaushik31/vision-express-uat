import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import styles from "../styles/sections/hero-icon-text-list.less";

// true only on screens <= 768px (false on server / first render)
function useIsMobile(query = "(max-width: 768px)") {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener
      ? mql.addEventListener("change", update)
      : mql.addListener(update);
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener("change", update)
        : mql.removeListener(update);
    };
  }, [query]);

  return isMobile;
}

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { backgroundImage } = props || {};

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const SHOW_AT = 0.2;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= SHOW_AT) {
          setInView(true);
          return;
        }

        if (!entry.isIntersecting) {
          const viewportBottom = entry.rootBounds
            ? entry.rootBounds.bottom
            : window.innerHeight;

          if (entry.boundingClientRect.top > viewportBottom) {
            setInView(false);
          }
        }
      },
      {
        threshold: [0, SHOW_AT],
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [blocks.length]);

  if (blocks.length === 0) {
    return null;
  }

  const sectionStyle = backgroundImage?.value
    ? { backgroundImage: `url(${backgroundImage.value})` }
    : {};

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    cssEase: "linear",
  };

  const renderItem = (block, index) => {
    const bProps = block?.props || {};
    const { icon, label } = bProps;

    return (
      // --i drives the stagger delay in the stylesheet
      <div className={styles.trustItem} style={{ "--i": index }}>
        {icon?.value && (
          <div className={styles.iconCircle}>
            <img src={icon.value} alt={label?.value || "icon"} />
          </div>
        )}
        {label?.value && <p className={styles.itemLabel}>{label.value}</p>}
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.trustSection} ${inView ? styles.inView : ""}`}
    >
      <div className={styles.trustCard} style={sectionStyle}>
        {isMobile ? (
          <div className={styles.trustSlider}>
            <Slider {...sliderSettings}>
              {blocks.map((block, index) => (
                <div key={block?.id || index} className={styles.trustSlide}>
                  {renderItem(block, index)}
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className={styles.trustGrid}>
            {blocks.map((block, index) => (
              <React.Fragment key={block?.id || index}>
                {renderItem(block, index)}
                {index < blocks.length - 1 && (
                  <div className={styles.divider} style={{ "--i": index }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

Component.displayName = "TrustBadgesSection";

export default Component;


export const settings = {
  label: "Trust Badges Section",
  props: [
    {
      id: "backgroundImage",
      type: "image_picker",
      label: "Background Image (optional, desktop card)",
    },
  ],
  blocks: [
    {
      type: "trust_item",
      name: "Trust Item",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Icon",
        },
        {
          id: "label",
          type: "text",
          label: "Label",
          default: "Global Eye Test",
        },
      ],
    },
  ],
  blocks_default: [
    {
      type: "trust_item",
      name: "Global Eye Test",
      props: { label: { value: "Global Eye Test" } },
    },
    {
      type: "trust_item",
      name: "Certified Optometrists",
      props: { label: { value: "Certified Optometrists" } },
    },
    {
      type: "trust_item",
      name: "200+ Stores",
      props: { label: { value: "200+ Stores" } },
    },
    {
      type: "trust_item",
      name: "10 Lakh+ Customers",
      props: { label: { value: "10 Lakh+ Customers" } },
    },
    {
      type: "trust_item",
      name: "Genuine Products",
      props: { label: { value: "Genuine Products" } },
    },
    {
      type: "trust_item",
      name: "Loyalty Program",
      props: { label: { value: "Loyalty Program" } },
    },
  ],
};

Component.settings = settings;