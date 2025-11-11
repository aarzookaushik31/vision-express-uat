import React, { useState } from "react";
import styles from "../styles/sections/lens-catalogue.less";

function LensCatalogueTabs({ props, blocks }) {
  const {
    heading,
    subheading,
    banner_background,

    single_lens_tab_title,
    single_lens_tab_description,
    single_lens_tab_image,

    progressive_lens_tab_title,
    progressive_lens_tab_description,
    progressive_lens_tab_image,
  } = props;



  const getInitialTab = () => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("progressive")) return "progressive";
  }
  return "single";
};

const [activeTab, setActiveTab] = useState(getInitialTab());



  const visibleBlocks = blocks.filter(
    (b) => b.props?.tab_selector?.value === activeTab
  );


  const renderFilledSpans = (count) => {
  const total = 10; 
  return Array.from({ length: total }, (_, idx) => (
    <span
      key={idx}
      className={`${styles.visionBlock} ${idx < count ? styles.filled : ""}`}
    />
  ));
};


  return (
    <div className={styles.tabbedSection}>
      <div className={styles.banner}            
       style={{
              backgroundImage: `url(${banner_background?.value})`,
            }}>
        <h1 className={styles.heading}>{heading?.value}</h1>
        <p className={styles.subheading}>{subheading?.value}</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "single" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("single")}
          >
            {single_lens_tab_image?.value && (
              <img
                src={single_lens_tab_image.value}
                alt={single_lens_tab_title?.value}
              />
            )}
            <div>
              <h2 className={styles.tabTitle}>{single_lens_tab_title?.value}</h2>
              <p className={styles.tabDesc}>{single_lens_tab_description?.value}</p>
            </div>
          </button>

          <button
            className={`${styles.tab} ${
              activeTab === "progressive" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("progressive")}
          >
            {progressive_lens_tab_image?.value && (
              <img
                src={progressive_lens_tab_image.value}
                alt={progressive_lens_tab_title?.value}
              />
            )}
            <div>
              <h2  className={styles.tabTitle}>{progressive_lens_tab_title?.value}</h2>
              <p className={styles.tabDesc}>{progressive_lens_tab_description?.value}</p>
            </div>
          </button>
        </div>
      </div>

      <div className={styles.blocks}>
        {visibleBlocks.map((block, idx) => {
          const {
            image,
            logo,
            title,
            description,
            button_url,
            button_text,
             image_position,
             feature_image,
             near_filled,
             intermediate_filled,
             far_filled,
          } = block.props || {};

          return (
            <div  className={`${styles.block} ${
    image_position?.value === "right"
      ? styles.imageRight
      : styles.imageLeft
  }`} key={idx}>
              <div className={styles.blockImageWrapper}>
                {image?.value && <img src={image.value} alt={title?.value} />}
              </div>
              <div className={styles.blockContent}>
             <div  className={styles.blockContentHeader} >
<div>
   {logo?.value && (
                  <img
                    className={styles.blockLogo}
                    src={logo.value}
                    alt="logo"
                  />
                )}
                <h2>{title?.value}</h2>
  </div>

 {feature_image?.value && (
                  <img
                    className={styles.featureLogo}
                    src={feature_image.value}
                    alt="logo"
                  />
                )}

             </div>
               
                <p>{description?.value}</p>


           <div className={styles.visionRowContainer}>
                 {near_filled?.value && (
                 <div className={`${styles.nearFilledContainer} ${styles.visionRow}`}>
                    <span className={styles.visionRowText}>
                     Near
                    </span>
                     <div className={styles.rowBlocks}>
        {renderFilledSpans(near_filled.value)}
      </div>
                  </div>
                 )}
                  {intermediate_filled?.value && (
                   <div className={`${styles.intermediateFilledContainer} ${styles.visionRow}`}>
                    <span className={styles.visionRowText}>
                      Intermediate
                    </span>
                    <div className={styles.rowBlocks}>
        {renderFilledSpans(intermediate_filled.value)}
      </div>
                  </div>
                   )}
                   {far_filled?.value && (
                   <div className={`${styles.farFilledContainer} ${styles.visionRow}`}>
                     <span className={styles.visionRowText}>
                          Far
                    </span>
                    <div className={styles.rowBlocks}>
        {renderFilledSpans(far_filled.value)}
      </div>
                  </div>
                   )}
                   </div>


                {button_url?.value && (
                  <a href={button_url.value} className={styles.button}>
                    {button_text?.value}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const settings = {
  label: "Lens Catalogue Tabs",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Main Heading",
      default: "DISCOVER THE RIGHT LENSES FOR YOU",
    },
    {
      id: "subheading",
      type: "textarea",
      label: "Subheading",
      default: "Bringing you the global expertise of EssilorLuxottica...",
    },

        {
      id: "banner_background",
      type: "image_picker",
      label: "Banner Background",
    },
    {
      id: "single_lens_tab_title",
      type: "text",
      label: "Single Vision Tab Title",
      default: "Single Vision Lenses",
    },
    {
      id: "single_lens_tab_description",
      type: "textarea",
      label: "Single Vision Tab Description",
      default: "Clear vision for one distance.",
    },
    {
      id: "single_lens_tab_image",
      type: "image_picker",
      label: "Single Vision Tab Image",
    },

    {
      id: "progressive_lens_tab_title",
      type: "text",
      label: "Progressive Lenses Tab Title",
      default: "Progressive Lenses",
    },
    {
      id: "progressive_lens_tab_description",
      type: "textarea",
      label: "Progressive Lenses Tab Description",
      default: "Seamless vision at all distances.",
    },
    {
      id: "progressive_lens_tab_image",
      type: "image_picker",
      label: "Progressive Lenses Tab Image",
    },
  ],

  blocks: [
    {
      type: "list_item",
      name: "List Item",
      props: [
        {
          type: "select",
          id: "tab_selector",
          label: "Show In Tab",
          options: [
            { text: "Single Vision Lenses", value: "single" },
            { text: "Progressive Lenses", value: "progressive" },
          ],
          default: "single",
        },
        { type: "image_picker", id: "image", label: "Block Image" },
         {
          type: "select",
          id: "image_position",
          label: "Image Position",
          options: [
            { text: "Left", value: "left" },
            { text: "Right", value: "right" },
          ],
          default: "left",
        },
        { type: "image_picker", id: "logo", label: "Block Logo" },
        { type: "image_picker", id: "feature_image", label: "Feature Image" },
        { type: "text", id: "title", label: "Block Title" },
        { type: "textarea", id: "description", label: "Block Description" },
        {
          type: "text",
          id: "button_text",
          label: "Button Text",
          default: "Learn More",
        },
        { type: "url", id: "button_url", label: "Button Link" },
       {
  type: "select",
  id: "near_filled",
  label: "Near Blocks Filled",
  options: Array.from({ length: 11 }, (_, i) => ({ text: i.toString(), value: i.toString() })),
  default: "0",
},
{
  type: "select",
  id: "intermediate_filled",
  label: "Intermediate Blocks Filled",
  options: Array.from({ length: 11 }, (_, i) => ({ text: i.toString(), value: i.toString() })),
  default: "0",
},
{
  type: "select",
  id: "far_filled",
  label: "Far Blocks Filled",
  options: Array.from({ length: 11 }, (_, i) => ({ text: i.toString(), value: i.toString() })),
  default: "0",
}


      ],
    },
  ],
};

export default LensCatalogueTabs;
