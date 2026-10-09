import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import styles from "../styles/sections/shop-by-category-slider.less";

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

// With only a couple of slides, the left/right neighbours would run out
// of clones. Repeating the slides to at least this many keeps the infinite
// loop smooth (the text below still maps back to the real blocks).
const MIN_SLIDES = 5;

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { heading, highlightedText } = props || {};

  // Index inside the (possibly repeated) slides array
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hooks must stay above the early return below
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const inView = useInView(sectionRef);

  if (blocks.length === 0) {
    return null;
  }

  const total = blocks.length;

  const slides =
    total === 1 || total >= MIN_SLIDES
      ? blocks
      : Array.from(
          { length: Math.ceil(MIN_SLIDES / total) * total },
          (_, i) => blocks[i % total]
        );

  // Text under the slider always follows the centered slide
  const activeBlock = blocks[currentSlide % total]?.props || {};

  const handlePrev = () => sliderRef.current?.slickPrev();
  const handleNext = () => sliderRef.current?.slickNext();

  const sliderSettings = {
    // Each slide has a fixed width set in the stylesheet (it changes per
    // breakpoint), so slick can centre the active one and the side cards
    // can stay smaller than the centre card.
    variableWidth: true,
    centerMode: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    infinite: true,
    speed: 500,
    cssEase: "ease",
    arrows: false,
    dots: false,
    swipeToSlide: true,
    // newIndex can briefly be -1 or >= length while looping, so normalise it
    beforeChange: (_, next) => {
      const len = slides.length;
      setCurrentSlide(((next % len) + len) % len);
    },
  };

  // Renders a slide's image, wrapped in a link when the slide has one
  const renderCard = (block, imgAlt) => {
    const bProps = block?.props || {};
    const image = bProps?.image?.value && (
      <img src={bProps.image.value} alt={bProps?.category?.value || imgAlt} />
    );

    if (bProps?.link?.value) {
      return (
        <a
          href={bProps.link.value}
          className={`${styles.card} ${styles.cardLink}`}
          aria-label={bProps?.category?.value || imgAlt}
        >
          {image}
        </a>
      );
    }

    return <div className={styles.card}>{image}</div>;
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.findFitSection} ${inView ? styles.inView : ""}`}
    >
      <h2 className={styles.heading}>
        {heading?.value}{" "}
        {highlightedText?.value && (
          <span className={styles.highlight}>{highlightedText.value}</span>
        )}
      </h2>

      <div className={styles.carousel}>
        {total > 1 ? (
          <Slider ref={sliderRef} {...sliderSettings}>
            {slides.map((block, index) => (
              <div key={`${block?.id || "slide"}-${index}`}>
                <div className={styles.slide}>{renderCard(block, "slide")}</div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className={styles.singleSlide}>
            {renderCard(blocks[0], "active")}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        {total > 1 && (
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className={styles.controlsText}>
          {activeBlock?.link?.value ? (
            <a href={activeBlock.link.value} className={styles.controlsTextLink}>
              {activeBlock?.category?.value && (
                <h3 className={styles.category}>{activeBlock.category.value}</h3>
              )}
              {activeBlock?.tagline?.value && (
                <p className={styles.tagline}>{activeBlock.tagline.value}</p>
              )}
            </a>
          ) : (
            <>
              {activeBlock?.category?.value && (
                <h3 className={styles.category}>{activeBlock.category.value}</h3>
              )}
              {activeBlock?.tagline?.value && (
                <p className={styles.tagline}>{activeBlock.tagline.value}</p>
              )}
            </>
          )}
        </div>

        {total > 1 && (
          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNext}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}

Component.displayName = "CategorySlider";

export default Component;

export const settings = {
  label: "Shop by Category Slider",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Find Your",
    },
    {
      id: "highlightedText",
      type: "text",
      label: "Highlighted Heading Text",
      default: "Perfect Fit",
    },
  ],
  blocks: [
    {
      type: "fit_slide",
      name: "Fit Slide",
      props: [
        {
          id: "image",
          type: "image_picker",
          label: "Image",
        },
        {
          id: "category",
          type: "text",
          label: "Category Label",
          default: "For Her",
        },
        {
          id: "tagline",
          type: "text",
          label: "Tagline",
          default: "Modern. Light. Iconic.",
        },
        {
          id: "link",
          type: "url",
          label: "Link",
          default: "",
        },
      ],
    },
  ],
};

Component.settings = settings;