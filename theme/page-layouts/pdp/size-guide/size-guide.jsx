import React, { useState, useEffect, useMemo, Suspense } from "react";
import PropTypes from "prop-types";
import styles from "./size-guide.less";
import FyImage from "../../../components/core/fy-image/fy-image";
import FyHTMLRenderer from "../../../components/core/fy-html-renderer/fy-html-renderer";
// import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);
function SizeGuide({ isOpen, productMeta, onCloseDialog }) {
  const { t } = useGlobalTranslation("translation");
  const [previewSelectedMetric, setPreviewSelectedMetric] = useState("cm");
  const [selectedMetric, setSelectedMetric] = useState("cm");
  const [activeTab, setActiveTab] = useState("measure");
  const [touched, setTouched] = useState(false);

  const values = {
    in: t("resource.product.inch"),
    cm: t("resource.product.cm"),
  };

  const headers = Object.entries(productMeta?.size_chart?.headers ?? {}).filter(
    ([key, val]) => !key?.includes("__") && val !== null
  );



  useEffect(() => {
    if (productMeta?.size_chart?.unit) {
      setPreviewSelectedMetric(productMeta?.size_chart.unit);
      setSelectedMetric(productMeta?.size_chart.unit);
    }
  }, [productMeta]);

  const changeSelectedMetric = (val) => {
    setPreviewSelectedMetric(val);

    if (selectedMetric === val) {
      setTouched(false);
    } else {
      setTouched(true);
    }
  };

  const isSizeChartAvailable = () => {
    const sizeChartHeader = productMeta?.size_chart?.headers || {};
    return Object.keys(sizeChartHeader).length > 0;
  };

  const convertMetrics = (val) => {
    if (previewSelectedMetric === "cm" && touched) {
      let finalVal = "";
      val = val.split("-");
      for (let i = 0; i < val.length; i += 1) {
        if (i !== 0 && i < val.length) {
          finalVal += "-";
        }
        if (!Number.isNaN(Number(val[i]))) {
          finalVal += (Number(val[i]) * 2.54).toFixed(1); // inches to cm
        } else {
          finalVal += val[i];
        }
      }
      return finalVal;
    }

    if (previewSelectedMetric === "in" && touched) {
      let finalVal = "";
      val = val.split("-");
      for (let i = 0; i < val.length; i += 1) {
        if (i !== 0 && i < val.length) {
          finalVal += "-";
        }
        if (!Number.isNaN(Number(val[i]))) {
          finalVal += (Number(val[i]) / 2.54).toFixed(1); // cm to inches
        } else {
          finalVal += val[i];
        }
      }
      return finalVal;
    }

    return val;
  };

  const displayStyle = useMemo(() => {
    let displayStyle = "none";
    if (activeTab === "measure") {
      displayStyle = productMeta.size_chart.image ? "block" : "flex";
    }
    return displayStyle;
  }, [activeTab]);

  return (
    <Suspense fallback={<div/>}>
    <Modal
      modalType="right-modal"
      isOpen={isOpen}
      title=""
      closeDialog={(e) => onCloseDialog(e)}
      headerClassName={styles.sidebarHeader}
      bodyClassName={styles.sizeContainer}
    >
      {/* Size Guide Dialog */}

        <h4 className={styles.sizeGuideTitle} style={{ marginBottom: "16px" }}>
              {productMeta?.size_chart?.title}
            </h4>

      {/* Tabs */}
      <div className={styles.sizeTabs}>


       {/* Measure Tab */}
        {productMeta?.size_chart && (
          <button
            type="button"
            className={`b2 ${styles.tab} ${styles.tabMeasure} ${
              activeTab === "measure" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("measure")}
          >
           Check Face Size
          </button>
        )}



        {/* Size Guide Tab */}
        {isSizeChartAvailable() && (
          <button
            type="button"
            className={`b2 ${styles.tab} ${styles.tabSizeGuide} ${
              activeTab === "size_guide" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("size_guide")}
          >
           Know Your Frame Size
          </button>
        )}

       
      </div>

      {/* Body */}
      <div className={styles.sidebarBody}>
        {/* Left Container */}
        <div
          className={`${styles.leftContainer} ${
            !productMeta?.size_chart?.image ? styles.cstLw : ""
          }`}
          style={{ display: activeTab === "size_guide" ? "block" : "none" }}
        >

             <h2 className={styles.sizeGuideHeading}>UNDERSTAND YOUR FRAME SIZE IF YOU HAVE existing GLASSES</h2>

          {/* Button Group */}
          {/* <div className={styles.btnGroup}>
          
            <div className={styles.btnContainer}>
              {isSizeChartAvailable() &&
                Object.entries(values)?.map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      changeSelectedMetric(key);
                    }}
                    className={`h5 ${styles.unitBtn} ${styles.fontBody} ${
                      previewSelectedMetric === key
                        ? styles.unitBtnSelected
                        : ""
                    }`}
                  >
                    {val}
                  </button>
                ))}
            </div>
          </div> */}
          {/* Size Description */}
          {productMeta?.size_chart && productMeta?.size_chart?.description && (
            <div className={styles.sizeDesc}>
              <FyHTMLRenderer
                htmlContent={productMeta?.size_chart?.description}
              />
            </div>
          )}

          <div className={styles.sizeInfo}>
          



<h2 className={styles.sizeInfoHeading}>lens width & frame size</h2>




{(() => {
  const allSizes = productMeta?.size_chart?.sizes || [];

  // Split into two logical sections — first 3 rows = Adults, next = Kids
  const adults = allSizes.slice(0, 3);
  const kids = allSizes.slice(3);

  return (
    <>
      <div className={styles.sectionTable}>
        <h3 className={styles.sectionHeading}>Adults</h3>
        <table className={styles.sizeTable}>
          <thead>
            <tr>
              {headers.map(
                ([key, val]) =>
                  val !== null && (
                    <th key={`adult_header_${key}`} className={`b2 ${styles.sizeHeader}`}>
                      {val?.value}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {adults.map((row, i) => (
              <tr key={`adult_row_${i}`} className={styles.sizeRow}>
                {Object.entries(row)
                  .filter(([key, val]) => !key?.includes("__") && val !== null)
                  .map(([key, val], j) => (
                    <td key={`adult_cell_${j}`} className={`captionNormal ${styles.sizeCell}`}>
                      {headers[j][1]?.convertable ? convertMetrics(val) : val}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.sectionTable}>
        <h3 className={styles.sectionHeading}>Kids</h3>
        <table className={styles.sizeTable}>
          <thead>
            <tr>
              {headers.map(
                ([key, val]) =>
                  val !== null && (
                    <th key={`kids_header_${key}`} className={`b2 ${styles.sizeHeader}`}>
                      {val?.value}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {kids.map((row, i) => (
              <tr key={`kids_row_${i}`} className={styles.sizeRow}>
                {Object.entries(row)
                  .filter(([key, val]) => !key?.includes("__") && val !== null)
                  .map(([key, val], j) => (
                    <td key={`kids_cell_${j}`} className={`captionNormal ${styles.sizeCell}`}>
                      {headers[j][1]?.convertable ? convertMetrics(val) : val}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
})()}












          </div>

          {!isSizeChartAvailable() && (
            <div className={styles.notAvailable}>
              <h3 className={styles.fontHeader}>
                {t("resource.common.not_available_contact_for_info")}
              </h3>
              <FDKLink to="/contact-us" target="_blank">
                <button
                  type="button"
                  className={`${styles.contactUs} btnPrimary ${styles.fontBody}`}
                >
                  {t("resource.common.contact_us_caps")}
                </button>
              </FDKLink>
            </div>
          )}
        </div>

        <div
          className={styles.rightContainer}
          style={{
            display: displayStyle,
          }}
        >
          {productMeta &&
            productMeta.size_chart &&
            productMeta.size_chart.image && (

              
              <div className={styles.sizeGuideImage}>

                 <h2 className={styles.sizeGuideHeading}>How to know your face size?</h2>
                     
                     <img  src={productMeta.size_chart.image}
                  alt={productMeta.size_chart.title} />


              </div>
            )}

          {/* Not Available */}
          {!productMeta ||
            !productMeta.size_chart ||
            (!productMeta.size_chart.image && (
              <div className={styles.notAvailable}>
                <h3 className={styles.fontHeader}>
                  {t("resource.common.not_available_contact_for_info")}
                </h3>
                <FDKLink to="/contact-us" target="_blank">
                  <button
                    type="button"
                    className={`${styles.contactUs} btnPrimary ${styles.fontBody}`}
                  >
                    {t("resource.common.contact_us_caps")}
                  </button>
                </FDKLink>
              </div>
            ))}
        </div>
      </div>
    </Modal>
    </Suspense>
  );
}

SizeGuide.propTypes = {
  isOpen: PropTypes.bool,
  productMeta: PropTypes.shape({
    sizeChart: PropTypes.shape({
      unit: PropTypes.string,
    }),
  }),
  onCloseDialog: PropTypes.func,
};

export default SizeGuide;
