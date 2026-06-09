import React from "react";
import styles from "../styles/sections/custom-content.less";

function ContentSection({ props = {} }) {
  const getVal = (prop, fallback = "") =>
    prop && typeof prop === "object" && "value" in prop ? prop.value : prop || fallback;

  const heading = getVal(props.heading);
  const subheading = getVal(props.subheading);
  const content = getVal(props.content);

  const headingColor = getVal(props.heading_color, "#000000");
  const subheadingColor = getVal(props.subheading_color, "#333333");
  const contentColor = getVal(props.content_color, "#555555");

  const headingSize = getVal(props.heading_size, "28px");
  const subheadingSize = getVal(props.subheading_size, "20px");
  const contentSize = getVal(props.content_size, "16px");

  const backgroundColor = getVal(props.background_color, "#ffffff");
  const borderRadius = getVal(props.border_radius, "0px");
  const borderColor = getVal(props.border_color, "transparent");
  const maxWidth = getVal(props.max_width, "1200px");
  const padding = getVal(props.padding, "40px");
  const margin = getVal(props.margin, "20px auto");
  const textAlignment = getVal(props.text_alignment, "left");

  const headingSizeMobile = getVal(props.heading_size_mobile, headingSize);
  const subheadingSizeMobile = getVal(props.subheading_size_mobile, subheadingSize);
  const contentSizeMobile = getVal(props.content_size_mobile, contentSize);
  const paddingMobile = getVal(props.padding_mobile, padding);
  const marginMobile = getVal(props.margin_mobile, margin);

  const buttonText = getVal(props.button_text);
const buttonLink = getVal(props.button_link, "#");

const buttonTextColor = getVal(props.button_text_color, "#ffffff");
const buttonBgColor = getVal(props.button_bg_color, "#000000");
const buttonBorderRadius = getVal(props.button_border_radius, "4px");
const buttonPadding = getVal(props.button_padding, "12px 24px");
const buttonMargin = getVal(props.button_margin, "20px 0 0 0");

  return (
    <section
      className={styles.sectionWrapper}
      style={{
        "--heading-size": headingSize,
        "--subheading-size": subheadingSize,
        "--content-size": contentSize,
        "--heading-size-mobile": headingSizeMobile,
        "--subheading-size-mobile": subheadingSizeMobile,
        "--content-size-mobile": contentSizeMobile,
        "--padding-desktop": padding,
        "--margin-desktop": margin,
        "--padding-mobile": paddingMobile,
        "--margin-mobile": marginMobile,
        backgroundColor,
        borderRadius,
        border: `1px solid ${borderColor}`,
        maxWidth,
        textAlign: textAlignment,
      }}
    >
      {heading ? (
        <h2 className={styles.heading} style={{ color: headingColor }}>
          {heading}
        </h2>
      ) : null}

      {subheading ? (
        <h3 className={styles.subheading} style={{ color: subheadingColor }}>
          {subheading}
        </h3>
      ) : null}

      {content ? (
        <div
          className={styles.content}
          style={{ color: contentColor }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}

      {buttonText ? (
  <a
    href={buttonLink}
    className={styles.button}
    style={{
      display: "inline-block",
      color: buttonTextColor,
      backgroundColor: buttonBgColor,
      borderRadius: buttonBorderRadius,
      padding: buttonPadding,
      margin: buttonMargin,
      textDecoration: "none",
    }}
  >
    {buttonText}
  </a>
) : null}
    </section>
  );
}

export const settings = {
  label: "Custom Text Section",
  props: [
    { id: "heading", type: "text", default: "Your Heading", label: "Heading" },
    { id: "heading_color", type: "color", default: "#000000", label: "Heading Color" },
    { id: "heading_size", type: "text", default: "28px", label: "Heading Font Size (Desktop)" },
    { id: "heading_size_mobile", type: "text", default: "22px", label: "Heading Font Size (Mobile)" },

    { id: "subheading", type: "text", default: "Your Subheading", label: "Subheading" },
    { id: "subheading_color", type: "color", default: "#333333", label: "Subheading Color" },
    { id: "subheading_size", type: "text", default: "20px", label: "Subheading Font Size (Desktop)" },
    { id: "subheading_size_mobile", type: "text", default: "18px", label: "Subheading Font Size (Mobile)" },

    { id: "content", type: "textarea", default: "<p>Your content goes here...</p>", label: "Content" },
    { id: "content_color", type: "color", default: "#555555", label: "Content Color" },
    { id: "content_size", type: "text", default: "16px", label: "Content Font Size (Desktop)" },
    { id: "content_size_mobile", type: "text", default: "14px", label: "Content Font Size (Mobile)" },

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

    { id: "background_color", type: "color", default: "#ffffff", label: "Background Color" },
    { id: "border_radius", type: "text", default: "0px", label: "Border Radius" },
    { id: "border_color", type: "color", default: "transparent", label: "Border Color" },
    { id: "max_width", type: "text", default: "1200px", label: "Max Width of Section" },
    { id: "padding", type: "text", default: "40px", label: "Padding (Desktop)" },
    { id: "padding_mobile", type: "text", default: "20px", label: "Padding (Mobile)" },
    { id: "margin", type: "text", default: "20px auto", label: "Margin (Desktop)" },
    { id: "margin_mobile", type: "text", default: "10px auto", label: "Margin (Mobile)" },
    {
  id: "button_text",
  type: "text",
  default: "",
  label: "Button Text",
},
{
  id: "button_link",
  type: "url",
  label: "Button Link",
},
{
  id: "button_text_color",
  type: "color",
  default: "#ffffff",
  label: "Button Text Color",
},
{
  id: "button_bg_color",
  type: "color",
  default: "#000000",
  label: "Button Background Color",
},
{
  id: "button_border_radius",
  type: "text",
  default: "4px",
  label: "Button Border Radius",
},
{
  id: "button_padding",
  type: "text",
  default: "12px 24px",
  label: "Button Padding",
},
{
  id: "button_margin",
  type: "text",
  default: "20px 0 0 0",
  label: "Button Margin",
}
  ],
};

export default ContentSection;
