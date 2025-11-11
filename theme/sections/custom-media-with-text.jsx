import React from "react";
import styles from "../styles/sections/custom-image-text.less";

function ImageTextSection({ props = {} }) {
  const hasImage = !!(props.image?.value || props.image);

  const getVal = (prop, fallback = "") =>
    prop && typeof prop === "object" && "value" in prop ? prop.value : prop || fallback;

  const imageSrc = getVal(props.image);
  const buttonLink = getVal(props.button_link);
  const heading = getVal(props.heading);
  const content = getVal(props.content);
  const imagePosition = getVal(props.image_position, "left");
  const textAlignment = getVal(props.text_alignment, "left");
  const backgroundColor = getVal(props.background_color, "#ffffff");
  const borderRadius = getVal(props.border_radius, "0px");
  const borderColor = getVal(props.border_color, "transparent");
  const maxWidth = getVal(props.max_width, "1200px");
  const padding = getVal(props.padding, "40px");
  const margin = getVal(props.margin, "20px auto");
  const bottomContent = getVal(props.bottom_content);
  const bottomBgColor = getVal(props.bottom_background_color, "transparent");
  const buttonText = getVal(props.button_text);


  return (
    <section
      className={styles.sectionWrapper}
      style={{
        backgroundColor,
        borderRadius,
        border: `1px solid ${borderColor}`,
        maxWidth,
        padding,
        margin,
      }}
    >
      <div
        className={`${styles.container} ${
          hasImage && imagePosition === "right" ? styles.reverse : ""
        } ${!hasImage ? styles.fullWidth : ""}`}
      >
        {hasImage && (
          <div className={styles.imageWrapper}>
            <img src={imageSrc} alt={heading || "section image"} />
          </div>
        )}

        <div className={styles.textWrapper} style={{ textAlign: textAlignment }}>
          {heading ? <h2 className={styles.heading}>{heading}</h2> : null}

          {content ? (
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : null}

          {buttonText && buttonLink ? (
            <a href={buttonLink} className={styles.button}>
              {buttonText}
            </a>
          ) : null}
        </div>
      </div>

        {bottomContent ? (
        <div
          className={styles.bottomContent}
          style={{
            backgroundColor: bottomBgColor,
          }}
          dangerouslySetInnerHTML={{ __html: bottomContent }}
        />
      ) : null}

    </section>
  );
}

export const settings = {
  label: "Image + Text Section",
  props: [
    {
      id: "image",
      type: "image_picker",
      label: "Section Image",
    },
    {
      id: "image_position",
      type: "select",
      options: [
        { value: "left", text: "Left" },
        { value: "right", text: "Right" },
      ],
      default: "left",
      label: "Image Position",
    },
    {
      id: "heading",
      type: "text",
      default: "Your Heading",
      label: "Heading",
    },
    {
      id: "content",
      type: "textarea",
      default: "<p>Your content goes here...</p>",
      label: "Text Content",
    },
    {
      id: "button_text",
      type: "text",
      label: "Button Text",
    },
    {
      id: "button_link",
      type: "url",
      label: "Button Link",
    },
    {
      id: "text_alignment",
      type: "select",
      options: [
        { value: "left", text: "Left" },
        { value: "center", text: "Center" },
        { value: "right", text: "Right" },
      ],
      default: "left",
      label: "Text Alignment",
    },
    {
      id: "background_color",
      type: "color",
      default: "#ffffff",
      label: "Background Color",
    },
    {
      id: "border_radius",
      type: "text",
      default: "0px",
      label: "Border Radius",
    },
    {
      id: "border_color",
      type: "color",
      default: "transparent",
      label: "Border Color",
    },
    {
      id: "max_width",
      type: "text",
      default: "1300px",
      label: "Max Width of Section",
    },
    {
      id: "padding",
      type: "text",
      default: "40px",
      label: "Padding",
    },
    {
      id: "margin",
      type: "text",
      default: "20px auto",
      label: "Margin",
    },
    { id: "bottom_content", type: "textarea", label: "Bottom Content", }, { id: "bottom_background_color", type: "color", label: "Bottom Content Background Color", },
  ],
};

export default ImageTextSection;
