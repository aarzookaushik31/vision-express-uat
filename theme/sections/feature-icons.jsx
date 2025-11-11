import React from "react";
import placeholderDesktop1 from "../assets/images/placeholder/slideshow-desktop1.jpg";
import placeholderDesktop2 from "../assets/images/placeholder/slideshow-desktop2.jpg";
import styles from "../styles/sections/feature-icons.less";

const placeholderImages = [placeholderDesktop1, placeholderDesktop2];

function getImage(block, index) {
  return block?.props?.image?.value || placeholderImages[index % placeholderImages.length];
}

export function Component(input = {}) {
  const section = input.section || input;
  const props = input.props || section.props || section.settings || {};
  const preset = input.preset || section.preset || {};
  const rawBlocks = input.blocks || section.blocks || props.blocks || [];
  const blocksData =
    Array.isArray(rawBlocks) && rawBlocks.length > 0 ? rawBlocks : preset.blocks || [];

  const backgroundColor =
    props.backgroundColor?.value ??
    preset?.props?.backgroundColor ??
    "rgba(248,247,245,1)";

  const requestedColumns =
    Number(props.columns?.value) ?? preset?.props?.columns ?? 5;
  const columns = Math.min(12, Math.max(1, Math.round(requestedColumns)));

  return (
<section
  className={styles.featuresWrapper}
  style={{
    background: backgroundColor,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    "--columns": columns, 
  }}
>
  {blocksData?.map((block, index) => (
    <div key={index} className={styles.featureItem}>
      <div className={styles.featureIcon}>
        <img
          src={getImage(block, index)}
          alt={`feature-${index}`}
          style={{ width: "80px", height: "60px", objectFit: "contain" }}
        />
      </div>
      {block?.props?.heading?.value && (
        <div className={styles.featureText}>{block.props.heading.value}</div>
      )}
    </div>
  ))}
</section>

  );
}

export default Component;



export const settings = {
  label: "Lens Features",
  props: [
    {
      type: "color",
      id: "backgroundColor",
      label: "Section background color",
      default: "rgba(248,247,245,1)",
    },
    {
      type: "range",
      id: "columns",
      label: "Columns per row",
      default: 5,
      min: 4,
      max: 6,
      step: 1,
    },


  ],
  blocks: [
    {
      name: "Lens Feature",
      type: "gallery",
      props: [
        { type: "image_picker", id: "image", label: "Icon Image", default: "" },
        { type: "text", id: "heading", label: "Heading Text", default: "Lens Feature" },
      ],
    },
  ],
  preset: {
    props: {
      backgroundColor: "rgba(248,247,245,1)",
      columns: 5,
    },
    blocks: [
      { name: "Lens Feature", props: { image: { value: "" }, heading: { value: "Lens Feature 1" } } },
      { name: "Lens Feature", props: { image: { value: "" }, heading: { value: "Lens Feature 2" } } },
      { name: "Lens Feature", props: { image: { value: "" }, heading: { value: "Lens Feature 3" } } },
      { name: "Lens Feature", props: { image: { value: "" }, heading: { value: "Lens Feature 4" } } },
      { name: "Lens Feature", props: { image: { value: "" }, heading: { value: "Lens Feature 5" } } },
    ],
  },
};