import React, { useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import styles from "../styles/sections/lens-type-find.less";

export function Component({ props = {}, blocks = [] }) {
  const { heading, paragraph, buttonText, buttonLink } = props;

  // Safe default: pick the first tabId if it exists
  const [activeTab, setActiveTab] = useState(
    blocks[0]?.props?.tabId?.value || ""
  );

  const activeBlock = blocks.find(
    (block) => block?.props?.tabId?.value === activeTab
  );

  useEffect(() => {
    const tabIds = blocks
      .map((block) => block?.props?.tabId?.value)
      .filter(Boolean);

    if (tabIds.length === 0) return; // nothing to rotate

    let index = tabIds.indexOf(activeTab);
    if (index === -1) index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % tabIds.length;
      setActiveTab(tabIds[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab, blocks]);

  return (
    <section className={styles.highlightedTabsSection}>
      <div className={styles.container}>
        <div className={styles.sectionContentMobile}>
          {heading?.value && <h2>{heading.value}</h2>}
          {paragraph?.value && <p>{paragraph.value}</p>}
        </div>

        <div className={styles.leftBox}>
          {activeBlock?.props?.backgroundImage?.value && (
            <FyImage
              src={activeBlock.props.backgroundImage.value}
              className={styles.bgImage}
              alt="Tab Background"
            />
          )}
          <div className={styles.overlayContent}>
            {activeBlock?.props?.title?.value && (
              <h3>{activeBlock.props.title.value}</h3>
            )}
            <div className={styles.textWithButton}>
              {activeBlock?.props?.description?.value && (
                <p>{activeBlock.props.description.value}</p>
              )}
              {activeBlock?.props?.buttonText?.value && (
                <FDKLink
                  className={styles.overlayButton}
                  href={activeBlock?.props?.buttonLink?.value || "#"}
                >
                  {activeBlock.props.buttonText.value}
                </FDKLink>
              )}
            </div>
          </div>
        </div>

        <div className={styles.rightContent}>
          <div className={styles.sectionContent}>
            {heading?.value && <h2>{heading.value}</h2>}
            {paragraph?.value && <p>{paragraph.value}</p>}
          </div>

          <div className={styles.tabButtons}>
            {blocks.map((block, index) => {
              const bProps = block?.props || {};
              const isActive = activeTab === bProps.tabId?.value;

              return (
                <button
                  key={block?.uid || index}
                  onClick={() => setActiveTab(bProps.tabId?.value)}
                  className={`${styles.tabButton} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  {bProps.tabIcon?.value && (
                    <div className={styles.tabImageWrapper}>
                      <FyImage
                        src={bProps.tabIcon.value}
                        alt={bProps.tabLabel?.value || "Tab"}
                        className={styles.tabImage}
                      />
                    </div>
                  )}
                  {bProps.tabLabel?.value && (
                    <span className={styles.tabLabel}>
                      {bProps.tabLabel.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {buttonText?.value && (
            <FDKLink
              className={styles.sectionButton}
              href={buttonLink?.value || "#"}
            >
              {buttonText.value}
            </FDKLink>
          )}
        </div>
      </div>
    </section>
  );
}

export const settings = {
  label: "Highlighted Content Tabs",
  props: [
    {
      type: "text",
      id: "heading",
      label: "Main Heading",
      default: "Discover More",
    },
    {
      type: "textarea",
      id: "paragraph",
      label: "Paragraph",
      default: "Explore our exclusive collection tailored for you.",
    },
    {
      type: "text",
      id: "buttonText",
      label: "Button Text",
      default: "Shop Now",
    },
    {
      type: "url",
      id: "buttonLink",
      label: "Button Link",
    },
  ],
  blocks: [
    {
      type: "list_item",
      name: "Tab Item",
      props: [
        {
          type: "text",
          id: "tabId",
          label: "Unique Tab ID",
          default: "tab1",
        },
        {
          type: "text",
          id: "tabLabel",
          label: "Tab Label Text",
          default: "Tab Name",
        },
        {
          type: "image_picker",
          id: "tabIcon",
          label: "Tab Icon (circular)",
        },
        {
          type: "image_picker",
          id: "backgroundImage",
          label: "Background Image (Left Box)",
        },
        {
          type: "text",
          id: "title",
          label: "Overlay Title",
          default: "Title Text",
        },
        {
          type: "textarea",
          id: "description",
          label: "Overlay Description",
        },
        {
          type: "text",
          id: "buttonText",
          label: "Button Text",
          default: "Shop Now",
        },
        {
          type: "url",
          id: "buttonLink",
          label: "Button Link",
        },
      ],
    },
  ],
};

Component.settings = settings;
export default Component;
