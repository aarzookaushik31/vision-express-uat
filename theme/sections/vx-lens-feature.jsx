import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/sections/vx-lens-feature.less";


const BADGE_INTERVAL = 5000;
const BADGE_STAGGER = Math.round(BADGE_INTERVAL / 3);

const CloseX = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export function Component({ props = {}, blocks = [] }) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const {
    logo,
    heading,
    title,
    description,
    learnMoreText,
    compareButtonText,
    heroImage,

    // "Learn More" popup
    featuresModalLogo,

    // "Compare Vision" popup
    compareTitle,
    compareDescription,
    standardLensImage,
    standardLensLabel,
    brandLensImage,
    brandLensLogo,
  } = props;

  // Feature list — one block per feature card. Powers BOTH the "Learn More"
  // popup grid and the 3 floating badges over the hero image.
  // Each block: { props: { icon: {value}, label: {value} } }
  const featureBlocks = (blocks?.length ? blocks : []).filter(
    (b) => b?.props?.label?.value
  );

  // Badges are split into 3 fixed "columns" by position in the list:
  //   slot 0 -> features 1, 4, 7, 10 ...
  //   slot 1 -> features 2, 5, 8, 11 ...
  //   slot 2 -> features 3, 6, 9, 12 ...
  // Each slot runs its OWN cycle of BADGE_INTERVAL, offset from the next by
  // BADGE_STAGGER, so the three badges never change at the same instant.
  // The badge container stays static; only its icon and label change.
  const badgeColumns = [0, 1, 2].map((colIdx) =>
    featureBlocks.filter((_, idx) => idx % 3 === colIdx)
  );

  const [ticks, setTicks] = useState([0, 0, 0]);
  const timersRef = useRef([]);

  useEffect(() => {
    // Clear any previously scheduled timers before (re)starting.
    timersRef.current.forEach((t) => {
      if (t?.startTimeout) clearTimeout(t.startTimeout);
      if (t?.interval) clearInterval(t.interval);
    });
    timersRef.current = [];

    badgeColumns.forEach((column, i) => {
      if (column.length <= 1) return; // nothing to rotate to for this slot

      const timers = {};

      // Stagger this slot's cycle start.
      timers.startTimeout = setTimeout(() => {
        timers.interval = setInterval(() => {
          setTicks((prev) => {
            const next = [...prev];
            next[i] += 1;
            return next;
          });
        }, BADGE_INTERVAL);
      }, i * BADGE_STAGGER);

      timersRef.current[i] = timers;
    });

    return () => {
      timersRef.current.forEach((t) => {
        if (t?.startTimeout) clearTimeout(t.startTimeout);
        if (t?.interval) clearInterval(t.interval);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureBlocks.length]);

  // Fixed positions for the 3 badge slots (top-right / middle-left / bottom-right)
  const badgePositionClasses = [styles.badgeOne, styles.badgeTwo, styles.badgeThree];

  const openFeatures = () => setShowFeatures(true);
  const closeFeatures = () => setShowFeatures(false);

  const openCompare = () => setShowCompare(true);
  const closeCompare = () => setShowCompare(false);

  return (
    <div className={styles.lumino_container}>
      <div className={styles.hero}>
        {/* Left: copy + CTAs */}
        <div className={styles.content}>
          {logo?.value ? (
            <img className={styles.logo} src={logo.value} alt={heading?.value || "Logo"} />
          ) : (
            <h4 className={styles.logoText}>{heading?.value || "VX Lumino"}</h4>
          )}

          <h1 className={styles.title}>
            {title?.value || "Vision At Every Distance."}
          </h1>

          <p className={styles.description}>
            {description?.value ||
              "Affordable progressive varifocal lenses engineered with continuous optical zones and integrated scratch-resistant coating."}
          </p>

          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={openFeatures}
            >
              {learnMoreText?.value || "Learn More"}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">
  <path d="M10.135 12.8455C10.1368 12.8437 10.1386 12.8418 10.1404 12.84L15.7414 7.2464C15.7856 7.20196 15.8248 7.15285 15.8585 7.09996L15.9464 6.9389L15.983 6.82908L15.983 6.74853C16.0057 6.62512 16.0057 6.49858 15.983 6.37513L15.983 6.30193L15.983 6.21407L15.9171 6.08959C15.8794 6.02023 15.8326 5.95619 15.778 5.89922L10.1404 0.283629C9.76735 -0.0924112 9.16006 -0.0948478 8.78402 0.278207C8.78221 0.279992 8.78042 0.28181 8.7786 0.283629C8.41694 0.66269 8.41694 1.25903 8.7786 1.63812L12.1172 4.98405C12.2588 5.1284 12.2565 5.36019 12.1121 5.50173C12.0449 5.56759 11.955 5.60507 11.861 5.60637L0.959208 5.60637C0.429484 5.60633 4.33509e-05 6.03571 8.99547e-06 6.56543C-2.536e-05 7.09516 0.429346 7.52456 0.959071 7.52463L0.959208 7.52463L11.861 7.52463C12.0631 7.52748 12.2247 7.69366 12.2219 7.8958C12.2205 7.98984 12.1831 8.07979 12.1172 8.14695L8.7786 11.4783C8.41227 11.8583 8.41227 12.46 8.7786 12.8401C9.15166 13.2161 9.75894 13.2185 10.135 12.8455Z" fill="white"/>
</svg>
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={openCompare}
            >
              {compareButtonText?.value || "Compare Vision"}
            </button>
          </div>
        </div>

        {/* Right: image + floating badges */}
        <div className={styles.imageSection}>
          {heroImage?.value && (
            <img src={heroImage.value} alt={heading?.value || "VX Lumino"} />
          )}

          {badgeColumns.map((column, i) => {
            if (!column.length) return null;
            const block = column[ticks[i] % column.length];
            return (
              <button
                type="button"
                className={`${styles.badge} ${badgePositionClasses[i]}`}
                onClick={openFeatures}
                aria-label="View all features"
                // Stable key per slot: the badge never remounts or
                // animates; only the icon and label inside it change.
                key={`badge-slot-${i}`}
              >
                <span className={styles.badgeIcon}>
                  {block?.props?.icon?.value && (
                    <img src={block.props.icon.value} alt="" />
                  )}
                </span>
                <span>{block?.props?.label?.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- Learn More: features grid popup ---------------- */}
      {showFeatures && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={closeFeatures}
        >
          <div
            className={styles.featuresModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={closeFeatures}
              aria-label="Close"
            >
              <CloseX className={styles.closeIcon} />
            </button>

            {featuresModalLogo?.value ? (
              <img
                className={styles.modalLogo}
                src={featuresModalLogo.value}
                alt={heading?.value || "VX Lumino"}
              />
            ) : (
              <h3 className={styles.modalLogoText}>
                {heading?.value || "VX Lumino"}
              </h3>
            )}

            <div className={styles.featureGrid}>
              {featureBlocks.map((block, idx) => (
                <div className={styles.featureCard} key={idx}>
                  <span className={styles.featureIconWrap}>
                    {block?.props?.icon?.value && (
                      <img src={block.props.icon.value} alt="" />
                    )}
                  </span>
                  <p>{block?.props?.label?.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Compare Vision popup ---------------- */}
      {showCompare && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={closeCompare}
        >
          <div
            className={styles.compareModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={closeCompare}
              aria-label="Close"
            >
              <CloseX className={styles.closeIcon} />
            </button>

            <h3 className={styles.compareTitle}>
              {compareTitle?.value || "Compare Vision"}
            </h3>
            <p className={styles.compareDescription}>
              {compareDescription?.value ||
                "For those who seek best vision at every distance, these lenses are tailored for optimal visual performance"}
            </p>

            <div className={styles.comparePanels}>
              <div className={styles.comparePanel}>
                {standardLensImage?.value && (
                  <img src={standardLensImage.value} alt="Standard PAL" />
                )}
                <div className={styles.panelLabel}>
                  {standardLensLabel?.value || "Standard PAL"}
                </div>
              </div>

              <div className={styles.comparePanel}>
                {brandLensImage?.value && (
                  <img src={brandLensImage.value} alt={heading?.value || "VX Lumino"} />
                )}
                <div className={styles.panelLabel}>
                  {brandLensLogo?.value ? (
                    <img
                      className={styles.panelLabelLogo}
                      src={brandLensLogo.value}
                      alt={heading?.value || "VX Lumino"}
                    />
                  ) : (
                    heading?.value || "VX Lumino"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const settings = {
  label: "VX Lens Feature",
  props: [
    { type: "image_picker", id: "logo", label: "Brand Logo (optional, overrides heading text)" },
    { type: "text", id: "heading", label: "Brand Name", default: "VX Lumino" },
    { type: "text", id: "title", label: "Title", default: "Vision At Every Distance." },
    {
      type: "textarea",
      id: "description",
      label: "Description",
      default:
        "Affordable progressive varifocal lenses engineered with continuous optical zones and integrated scratch-resistant coating.",
    },
    { type: "text", id: "learnMoreText", label: "Learn More Button Text", default: "Learn More" },
    { type: "text", id: "compareButtonText", label: "Compare Button Text", default: "Compare Vision" },
    { type: "image_picker", id: "heroImage", label: "Hero Image (right side)" },

    { type: "image_picker", id: "featuresModalLogo", label: "Features Popup Logo (optional)" },

    { type: "text", id: "compareTitle", label: "Compare Popup Title", default: "Compare Vision" },
    {
      type: "textarea",
      id: "compareDescription",
      label: "Compare Popup Description",
      default:
        "For those who seek best vision at every distance, these lenses are tailored for optimal visual performance",
    },
    { type: "image_picker", id: "standardLensImage", label: "Standard Lens Comparison Image" },
    { type: "text", id: "standardLensLabel", label: "Standard Lens Label", default: "Standard PAL" },
    { type: "image_picker", id: "brandLensImage", label: "VX Lumino Comparison Image" },
    { type: "image_picker", id: "brandLensLogo", label: "VX Lumino Small Logo (label under image, optional)" },
  ],
  blocks: [
    {
      type: "feature",
      name: "Feature",
      props: [
        {
          type: "image_picker",
          id: "icon",
          label: "Icon (upload with its pink circle background baked in — shown as-is, no extra styling applied)",
        },
        { type: "text", id: "label", label: "Label", default: "Feature Name" },
      ],
    },
  ],
  blocks_limit: 30,
};

Component.settings = settings;
export default Component;