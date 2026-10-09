import React, { useEffect, useRef, useState } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/sections/category-list.less";

// Rewrites/injects the Fynd CDN `resize-w:<width>` segment in an image URL.
function getResizedUrl(url, width) {
  if (!url) return url;

  if (/resize-w:\d+/.test(url)) {
    return url.replace(/resize-w:\d+/, `resize-w:${width}`);
  }

  if (/\/original\//.test(url)) {
    return url.replace(/\/original\//, `/resize-w:${width}/`);
  }

  return url;
}

function buildSrcSet(url, widths) {
  return widths.map((w) => `${getResizedUrl(url, w)} ${w}w`).join(", ");
}

// Tracks whether ONE element is on screen. Used per card (and for the
// heading) so each animates only when it is actually visible.
function useInView(ref, deps = []) {
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
        threshold: 0.15, // at least 15% of the element must be visible
        rootMargin: "0px 0px -8% 0px", // and slightly inside the bottom edge
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return inView;
}

function CategoryHeading({ heading, highlightedText }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <h2
      ref={ref}
      className={`${styles.heading} ${inView ? styles.inView : ""}`}
    >
      {heading?.value}{" "}
      {highlightedText?.value && (
        <span className={styles.highlight}>{highlightedText.value}</span>
      )}
    </h2>
  );
}

function CategoryCard({ block, price_label }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  const bProps = block?.props || {};
  const { image, title, price, link, wide } = bProps;
  const isWide = wide?.value === true || wide?.value === "true";

  // Widths tuned around actual displayed sizes (adjust if your
  // grid renders cards at different breakpoints).
  const widths = isWide ? [480, 640, 960, 1280] : [240, 320, 480, 640];
  const displayWidth = isWide ? 640 : 320;

  return (
    <div
      ref={ref}
      className={`${styles.categoryCard} ${
        isWide ? styles.categoryCardWide : ""
      } ${inView ? styles.inView : ""}`}
    >
      <div className={styles.imageWrap}>
        {image?.value && (
          <img
            src={getResizedUrl(image.value, displayWidth)}
            srcSet={buildSrcSet(image.value, widths)}
            sizes={
              isWide
                ? "(min-width: 768px) 640px, 480px"
                : "(min-width: 768px) 320px, 240px"
            }
            alt={title?.value || "Category"}
            loading="lazy"
            fetchPriority="low"
            width={displayWidth}
            height={320}
            className={styles.categoryImage}
          />
        )}
      </div>

      <FDKLink to={link?.value || "#"} className={styles.cardBodyLink}>
        <div className={styles.cardBody}>
          {title?.value && (
            <h3 className={styles.categoryTitle}>{title.value}</h3>
          )}
          {price?.value && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>
                {price_label?.value || "Starting at"}
              </span>
              <span className={styles.priceDivider} />
              <span className={styles.priceValue}>{price.value}</span>
            </div>
          )}
        </div>
      </FDKLink>
    </div>
  );
}

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { heading, highlightedText, price_label } = props || {};

  if (blocks.length === 0) {
    return null;
  }

  return (
    <section className={styles.categorySection}>
      <CategoryHeading heading={heading} highlightedText={highlightedText} />

      <div className={styles.categoryGrid}>
        {blocks.map((block, index) => (
          <CategoryCard
            key={block?.id || index}
            block={block}
            price_label={price_label}
          />
        ))}
      </div>
    </section>
  );
}

Component.displayName = "CategoryListSection";

export default Component;

export const settings = {
  label: "Category List Section",
  props: [
    { id: "heading", type: "text", label: "Heading", default: "Shop By" },
    {
      id: "highlightedText",
      type: "text",
      label: "Highlighted Heading Text",
      default: "Category",
    },
    {
      id: "price_label",
      type: "text",
      label: "Price Label",
      default: "Starting at",
    },
  ],
  blocks: [
    {
      type: "category_item",
      name: "Category Item",
      props: [
        { id: "image", type: "image_picker", label: "Image" },
        {
          id: "title",
          type: "text",
          label: "Category Name",
          default: "Eyeglasses",
        },
        { id: "price", type: "text", label: "Price", default: "₹499/-" },
        { id: "link", type: "url", label: "Category Link" },
        {
          id: "wide",
          type: "checkbox",
          label: "Wide Image (overlaps into next card)",
          default: false,
        },
      ],
    },
  ],
  blocks_default: [
    {
      type: "category_item",
      name: "Eyeglasses",
      props: {
        title: { value: "Eyeglasses" },
        price: { value: "₹499/-" },
        wide: { value: true },
      },
    },
    {
      type: "category_item",
      name: "Sunglasses",
      props: { title: { value: "Sunglasses" }, price: { value: "₹1,499/-" } },
    },
    {
      type: "category_item",
      name: "Computer Glasses",
      props: {
        title: { value: "Computer Glasses" },
        price: { value: "₹1,999/-" },
      },
    },
    {
      type: "category_item",
      name: "Contact Lenses",
      props: {
        title: { value: "Contact Lenses" },
        price: { value: "₹1,099/-" },
      },
    },
    {
      type: "category_item",
      name: "Powered Glasses",
      props: {
        title: { value: "Powered Glasses" },
        price: { value: "₹1,499/-" },
        wide: { value: true },
      },
    },
    {
      type: "category_item",
      name: "Reading Glasses",
      props: { title: { value: "Reading Glasses" }, price: { value: "₹599/-" } },
    },
  ],
};

Component.settings = settings;