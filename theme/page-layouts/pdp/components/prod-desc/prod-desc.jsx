import React, { useState, useEffect } from "react";
import FyAccordion from "../../../../components/core/fy-accordion/fy-accordion";
import styles from "./prod-desc.less";
import { useRichText } from "../../../../helper/hooks";
import { useGlobalTranslation } from "fdk-core/utils";

function ProdDesc({ product, config, customClass, returnConfig }) {
  const { t } = useGlobalTranslation("translation");

  const getInitialActiveTab = (product) => {
    if ((product?.description || "").length) return 0;
    return 1;
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab(product));

  const [productDescription, setProductDescription] = useState({
    details: product?.description || "",
    title: t("resource.product.product_description"),
  });

  useEffect(() => {
    setActiveTab(getInitialActiveTab(product));
    setProductDescription({
      details: product?.description || "",
      title: t("resource.product.product_description"),
    });
  }, [product]);

  const isProductDescAvailable = () =>
    productDescription?.details?.length > 0 &&
    !productDescription?.details.startsWith("<style");

  const clientMarkedContent = useRichText(productDescription.details);

  /* ===============================
     COMMON DATA
  ================================== */

  const attributes = product?.attributes || {};
  const firstSize = product?.sizes?.sizes?.[0];

  /* ===============================
     PRODUCT DETAILS DATA
  ================================== */

  const frameDimensions =
    attributes?.lens_width &&
    attributes?.bridge_width &&
    attributes?.["temple-length"]
      ? `${attributes.lens_width}-${attributes.bridge_width}-${attributes["temple-length"]}`
      : null;

  const lensPower =
    attributes?.lens_power &&
    attributes?.["lens-cyclinder"] &&
    attributes?.["lens-axis"]
      ? `${attributes.lens_power}-${attributes["lens-cyclinder"]}-${attributes["lens-axis"]}`
      : null;

  const lensPerBox = attributes?.["lens-per-box"]
    ? `${attributes["lens-per-box"]} pieces`
    : null;

  const genderValue = Array.isArray(attributes?.gender)
    ? attributes.gender.join(", ")
    : attributes?.gender;

  const productDetailsData = [
    { label: "Brand", value: product?.brand?.name },
    { label: "Collection", value: attributes?.collection },
    { label: "Article code", value: product?.uid },
    { label: "Item Code", value: attributes?.item_code },
    { label: "Size", value: attributes?.frame_size },
    { label: "Frame Shape", value: attributes?.["frame-shape"] },
    { label: "Frame Style", value: attributes?.style },
    { label: "Frame Dimensions", value: frameDimensions },
    { label: "Gender", value: genderValue },
    { label: "Frame Material", value: attributes?.frame_material },
    { label: "Frame Colour", value: attributes?.frame_colour },
    { label: "Lens Material", value: attributes?.["lens_material"] },
    { label: "Lens Colour", value: attributes?.["lens_colour"] },
    { label: "Lens Type", value: attributes?.["lens-type"] },
    { label: "Lens Spherical", value: lensPower },
    { label: "Lens Base Curve", value: attributes?.["lens-base-curve"] },
    {
      label: "Lens Breathing Capacity (Dk/t)",
      value: attributes?.["lens-breathing-capacity"],
    },
  {
  label: "Lens Water Content",
  value: attributes?.["lens-water-content"]
    ? String(attributes["lens-water-content"]).includes("%")
      ? attributes["lens-water-content"]
      : `${attributes["lens-water-content"]}%`
    : null,
},
    { label: "Lens Per Box", value: lensPerBox },
    { label: "Lens Usage", value: attributes?.["lens-usage"] },
  ].filter((item) => item.value);

  /* ===============================
     ADDITIONAL DETAILS DATA
  ================================== */

  const productWeight = firstSize?.weight?.shipping
    ? `${firstSize.weight.shipping} gm`
    : null;

  const netQuantityValue = product?.net_quantity?.value;
  const netQuantityUnit =
    product?.net_quantity?.unit === "nos"
      ? "N"
      : product?.net_quantity?.unit;

  const netQuantity =
    netQuantityValue && netQuantityUnit
      ? `${netQuantityValue} ${netQuantityUnit}`
      : null;

  const packageDimensions =
    firstSize?.dimension?.length &&
    firstSize?.dimension?.width &&
    firstSize?.dimension?.height
      ? `${firstSize.dimension.length} cm x ${firstSize.dimension.width} cm x ${firstSize.dimension.height} cm`
      : null;

  const newTraderType = attributes?.["new-trader-type"];

  const newTraderNameLabel = newTraderType
    ? `${newTraderType} Name`
    : "New Trader Name";

  const newTraderAddressLabel = newTraderType
    ? `${newTraderType} Address`
    : "New Trader Address";

  const newTraderAddress = [
    attributes?.["new-trader-address"],
    attributes?.["new-trader-pincode"]
      ? `Pincode: ${attributes["new-trader-pincode"]}`
      : null,
  ]
    .filter(Boolean)
    .join(" - ");




const returnTime = returnConfig?.time;
const returnUnitRaw = returnConfig?.unit;

const hasReturnTime =
  returnTime !== undefined && returnTime !== null && returnTime !== "";

const returnUnit = returnUnitRaw
  ? returnUnitRaw.replace(/\b\w/g, (ch) => ch.toUpperCase())
  : "";

const formattedReturnDuration = `${returnTime} ${returnUnit} ${t("resource.facets.return")}`
  .replace(/\s+/g, " ")
  .trim();

const returnPolicy =
  String(returnTime) === "0"
    ? "No returns are accepted on discounted or personalised products, except in the case of defective items. For international shipping-related concerns, please contact our customer care at 02269982727."
    : hasReturnTime
    ? `Easy ${formattedReturnDuration} available. Return policies may vary based on product type and ongoing promotions. For international shipping-related concerns, please contact our customer care at 02269982727.`
    : null;




  const additionalDetailsData = [
    { label: "Name of Commodity", value: attributes?.["name-of-commodity"] },
    { label: "Product Weight", value: productWeight },
    { label: "Package Content", value: attributes?.["package-content"] },
    { label: "Net Quantity", value: netQuantity },
    { label: "Country of Origin", value: attributes?.country_of_origin },
    {
      label: newTraderNameLabel,
      value: attributes?.["new-trader-name"],
    },
    {
      label: newTraderAddressLabel,
      value: newTraderAddress,
    },
    { label: "Marketer Name", value: attributes?.["marketer-name"] },
    { label: "Marketer Address", value: attributes?.["marketer-address"] },
    { label: "Customer Care", value: attributes?.customercarecoded },
    { label: "Package Dimensions", value: packageDimensions },
    { label: "Return Policy", value: returnPolicy },
  ].filter((item) => item.value);

  return (
    <div className={customClass}>
      <div
        className={`${styles.descContainerMobile} ${styles.customDescContainer}`}
      >



    {/* <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
  {JSON.stringify(product, null, 2)}
</pre> */}


        {isProductDescAvailable() && (
          <FyAccordion isOpen={config?.first_accordian_open?.value}>
            {[
              <div className={styles.accordiontitle}>
                {productDescription.title}
              </div>,
              <div
                className={styles.pdpDetail}
                dangerouslySetInnerHTML={{
                  __html: clientMarkedContent,
                }}
              />,
            ]}
          </FyAccordion>
        )}

        {productDetailsData.length > 0 && (
          <FyAccordion isOpen={false}>
            {[
              <div className={styles.accordiontitle}>Product Details</div>,
              <div className={styles.pdpDetail}>
                <table className={styles.detailTable}>
                  <tbody>
                    {productDetailsData.map((item, index) => (
                      <tr key={index}>
                        <td className={styles.prop}>{item.label}</td>
                        <td className={styles.val}>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>,
            ]}
          </FyAccordion>
        )}

        {additionalDetailsData.length > 0 && (
          <FyAccordion isOpen={false}>
            {[
              <div className={styles.accordiontitle}>Additional Details</div>,
              <div className={styles.pdpDetail}>
                <table className={styles.detailTable}>
                  <tbody>
                    {additionalDetailsData.map((item, index) => (
                      <tr key={index}>
                        <td className={styles.prop}>{item.label}</td>
                        <td className={styles.val}>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>,
            ]}
          </FyAccordion>
        )}
      </div>
    </div>
  );
}

export default ProdDesc;