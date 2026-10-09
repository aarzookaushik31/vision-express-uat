import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/sections/shop-by-lifestyle.less";

const AUTOPLAY_INTERVAL = 3000; 
const SLIDE_SPEED = 600; 

const MIN_SLIDES = 5;


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

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { heading, highlightedText, stage_background_image } = props || {};

  // Index inside the (possibly repeated) slides array
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hooks must stay above the early return below
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const tabListRef = useRef(null);
  const tabRefs = useRef([]);
  const inView = useInView(sectionRef);

  const total = blocks.length;

  // Keep the active tab centered in the scrollable tab row (mobile/tablet).
  // On desktop the list is vertical and not scrollable, so this does nothing.
  // We scroll the list itself (not scrollIntoView) so the page never jumps
  // vertically while autoplay runs.
  useEffect(() => {
    const list = tabListRef.current;
    const tab = tabRefs.current[total ? currentSlide % total : 0];
    if (!list || !tab) return;
    if (list.scrollWidth <= list.clientWidth) return;

    const listRect = list.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const left =
      list.scrollLeft +
      (tabRect.left - listRect.left) -
      (listRect.width - tabRect.width) / 2;

    list.scrollTo({ left, behavior: "smooth" });
  }, [currentSlide, total]);

  if (total === 0) {
    return null;
  }

  const slides =
    total === 1 || total >= MIN_SLIDES
      ? blocks
      : Array.from(
          { length: Math.ceil(MIN_SLIDES / total) * total },
          (_, i) => blocks[i % total]
        );

  // Real block index (what the tabs and progress bar care about)
  const activeIndex = currentSlide % total;

  const progressPercent =
    total > 1 ? (activeIndex / (total - 1)) * 100 : 100;

  const handlePrev = () => sliderRef.current?.slickPrev();
  const handleNext = () => sliderRef.current?.slickNext();
  const goTo = (index) => sliderRef.current?.slickGoTo(index);

  const sliderSettings = {
    // Each slide has a fixed width set in the stylesheet (it changes per
    // breakpoint), so slick can centre the active one and the neighbours
    // stay smaller / blurred.
    variableWidth: true,
    centerMode: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    speed: SLIDE_SPEED,
    cssEase: "ease",
    arrows: false,
    dots: false,
    swipeToSlide: true,
    autoplay: total > 1,
    autoplaySpeed: AUTOPLAY_INTERVAL,
    // Pausing is handled for the whole section below (hover)
    pauseOnHover: false,
    pauseOnFocus: false,
    // newIndex can briefly be -1 or >= length while looping, so normalise it
    beforeChange: (_, next) => {
      const len = slides.length;
      setCurrentSlide(((next % len) + len) % len);
    },
  };

  // One slide = the person cutout. Only the centered slide is clickable
  // (the stylesheet turns pointer events off for the neighbours).
  const renderSlide = (block, index) => {
    const bProps = block?.props || {};
    const personSrc = bProps?.person_image?.value;

    if (!personSrc) {
      return <div className={styles.slide} />;
    }

    const img = (
      <img
        src={personSrc}
        alt={bProps?.label?.value || "lifestyle"}
        className={styles.personImage}
        draggable={false}
      />
    );

    return (
      <div className={styles.slide}>
        {bProps?.link?.value ? (
          <FDKLink to={bProps.link.value} className={styles.stageLink}>
            {img}
          </FDKLink>
        ) : (
          img
        )}
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.lifestyleSection} ${inView ? styles.inView : ""}`}
      onMouseEnter={() => sliderRef.current?.slickPause()}
      onMouseLeave={() => total > 1 && sliderRef.current?.slickPlay()}
    >
      <div className={styles.wrapper}>
        <div className={styles.leftPanel}>
          <h2 className={styles.heading}>
            {heading?.value}{" "}
            {highlightedText?.value && (
              <span className={styles.highlight}>
                {highlightedText.value}
              </span>
            )}
          </h2>

          <div className={styles.tabList} ref={tabListRef}>
            {blocks.map((block, index) => {
              const bProps = block?.props || {};
              const isActive = index === activeIndex;
              return (
                <button
                  key={block?.id || index}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  className={`${styles.tabItem} ${
                    isActive ? styles.tabItemActive : ""
                  }`}
                  onClick={() => goTo(index)}
                >
                  {bProps?.icon?.value && (
                    <span className={styles.tabIcon}>
                      <img src={bProps.icon.value} alt="" />
                    </span>
                  )}
                  {bProps?.label?.value && (
                    <span className={styles.tabLabel}>
                      {bProps.label.value}
                    </span>
                  )}
                  <span className={styles.tabArrow}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          {total > 1 && (
            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handlePrev}
                aria-label="Previous"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                type="button"
                className={styles.navBtn}
                onClick={handleNext}
                aria-label="Next"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div
          className={styles.stage}
          style={{ cursor: total > 1 ? "grab" : "default" }}
        >
          {/* Static layer: never moves while the people slide over it */}
          <div className={styles.archWrapper}>
            {stage_background_image?.value ? (
              <img
                src={stage_background_image.value}
                alt=""
                className={styles.stageBackgroundImage}
                draggable={false}
              />
            ) : (
              <>
                <div className={styles.arch} />
                <div className={styles.pedestal} />
              </>
            )}
          </div>

          {/* Sliding layer */}
          <div className={styles.carousel}>
            {total > 1 ? (
              <Slider ref={sliderRef} {...sliderSettings}>
                {slides.map((block, index) => (
                  <div key={`${block?.id || "slide"}-${index}`}>
                    {renderSlide(block, index)}
                  </div>
                ))}
              </Slider>
            ) : (
              <div className={styles.singleSlide}>
                {renderSlide(blocks[0], 0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

Component.displayName = "ShopByLifestyleSection";

export default Component;

export const settings = {
  label: "Shop By Lifestyle Section",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Shop By",
    },
    {
      id: "highlightedText",
      type: "text",
      label: "Highlighted Heading Text",
      default: "Lifestyle",
    },
    {
      id: "stage_background_image",
      type: "image_picker",
      label: "Stage Background Image (arch + platform combined)",
    },
  ],
  blocks: [
    {
      type: "lifestyle_item",
      name: "Lifestyle Item",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Tab Icon",
        },
        {
          id: "label",
          type: "text",
          label: "Label",
          default: "Kids",
        },
        {
          id: "person_image",
          type: "image_picker",
          label: "Person Cutout Image (transparent background)",
        },
        {
          id: "link",
          type: "url",
          label: "Slide Link",
          info: "Where this slide should navigate to when clicked",
          default: "",
        },
      ],
    },
  ],
};

Component.settings = settings;