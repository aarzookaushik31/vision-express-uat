import React from "react";

function CustomHTMLSection({ props = {} }) {
  const getVal = (prop, fallback = "") =>
    prop && typeof prop === "object" && "value" in prop
      ? prop.value
      : prop || fallback;

  const customHTML = getVal(props.custom_html);
  const customId = getVal(props.custom_id);

  return (
    <section id={customId || ""}>
      {customHTML && (
        <div dangerouslySetInnerHTML={{ __html: customHTML }} />
      )}
    </section>
  );
}



export const settings = {
  label: "Custom HTML",
  props: [
    {
      id: "custom_id",
      type: "text",
      label: "Custom ID (for DY / tracking)",
    },
    {
      id: "custom_html",
      type: "textarea",
      default: "<div></div>",
      label: "Custom HTML",
    },
  ],
};

export default CustomHTMLSection;