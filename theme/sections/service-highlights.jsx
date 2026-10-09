import React, { useEffect, useRef, useState } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/sections/service-highlights.less";

// Gap between each item's entrance (ms)
const STAGGER_MS = 100;

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

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    backgroundColor,
    backgroundImage,
    mobileBackgroundImage,
  } = props || {};

  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const bgColor = backgroundColor?.value || "#9E007E";
  const bgImage = isMobile
    ? mobileBackgroundImage?.value || backgroundImage?.value
    : backgroundImage?.value;

  const sectionStyle = {
    backgroundColor: bgColor,
    ...(bgImage && { backgroundImage: `url(${bgImage})` }),
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.highlightsSection} ${inView ? styles.inView : ""}`}
      style={sectionStyle}
    >
      <div className={styles.overlay} />
      <div className={styles.highlightsWrapper}>
        {blocks.map((block, index) => {
          const { icon, title, description, link } = block?.props || {};
          const hasLink = link?.value;

          // Each item starts 100ms after the previous one
          const itemStyle = { "--delay": `${index * STAGGER_MS}ms` };
          // The divider fades in together with the item that follows it
          const dividerStyle = {
            "--delay": `${(index + 1) * STAGGER_MS}ms`,
          };

          const content = (
            <>
              {icon?.value && (
                <div className={styles.iconCircle}>
                  <img src={icon.value} alt={title?.value || "icon"} />
                </div>
              )}
              {title?.value && (
                <h3 className={styles.itemTitle}>{title.value}</h3>
              )}
              {description?.value && (
                <p className={styles.itemDescription}>{description.value}</p>
              )}
            </>
          );

          return (
            <React.Fragment key={block?.id || index}>
              {hasLink ? (
                <FDKLink
                  to={link.value}
                  className={styles.highlightItem}
                  style={itemStyle}
                >
                  {content}
                </FDKLink>
              ) : (
                <div className={styles.highlightItem} style={itemStyle}>
                  {content}
                </div>
              )}
              {index < blocks.length - 1 && (
                <div className={styles.divider} style={dividerStyle} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

Component.displayName = "ServiceHighlightsSection";

export default Component;

export const settings = {
  label: "Service Highlights Section",
  props: [
    {
      id: "backgroundColor",
      type: "color",
      label: "Background Color",
      default: "#9E007E",
    },
    {
      id: "backgroundImage",
      type: "image_picker",
      label: "Background Image (optional)",
    },
    {
      id: "mobileBackgroundImage",
      type: "image_picker",
      label: "Mobile Background Image (optional)",
    },
  ],
  blocks: [
    {
      type: "highlight_item",
      name: "Highlight Item",
      props: [
        {
          id: "icon",
          type: "image_picker",
          label: "Icon",
        },
        {
          id: "title",
          type: "text",
          label: "Title",
          default: "Find A Store",
        },
        {
          id: "description",
          type: "textarea",
          label: "Description",
          default: "Find your nearest Vision Express store.",
        },
        {
          id: "link",
          type: "url",
          label: "Link (optional)",
        },
      ],
    },
  ],
  blocks_default: [
    {
      type: "highlight_item",
      name: "Find A Store",
      props: {
        title: { value: "Find A Store" },
        description: { value: "Find your nearest Vision Express store." },
      },
    },
    {
      type: "highlight_item",
      name: "Book An Eye Test",
      props: {
        title: { value: "Book An Eye Test" },
        description: {
          value: "Book an eye test with our certified optometrists.",
        },
      },
    },
    {
      type: "highlight_item",
      name: "Contact Us",
      props: {
        title: { value: "Contact Us" },
        description: {
          value: "Have a question? We'd love to hear from you.",
        },
      },
    },
    {
      type: "highlight_item",
      name: "Customer Support",
      props: {
        title: { value: "Customer Support" },
        description: { value: "Need help? Our team is here for you." },
      },
    },
  ],
};

Component.settings = settings;