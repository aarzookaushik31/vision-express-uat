import React, { useState, useEffect, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./size-guide.less";
import FyImage from "../../../../components/core/fy-image/fy-image";
import FyHTMLRenderer from "../../../../components/core/fy-html-renderer/fy-html-renderer";
import { useGlobalTranslation } from "fdk-core/utils";
const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);

function SizeGuide({ isOpen, productMeta = {}, onCloseDialog }) {
  const { t } = useGlobalTranslation("translation");
  const [previewSelectedMetric, setPreviewSelectedMetric] = useState("cm");
  const [activeTab, setActiveTab] = useState("measure");

  const values = {
    in: t("resource.common.inch"),
    cm: t("resource.common.cm"),
  };

  const sizeChart = productMeta?.size_chart ?? {};
  const headers = Object.entries(sizeChart?.headers ?? {}).filter(
    ([key, val]) => !key?.includes("__") && val !== null
  );

  useEffect(() => {
    if (sizeChart?.unit) {
      setPreviewSelectedMetric(sizeChart.unit);
    }
  }, [sizeChart]);

  const changeSelectedMetric = (val) => {
    setPreviewSelectedMetric(val);
  };

  const isSizeChartAvailable = () => {
    const headersObj = sizeChart?.headers ?? {};
    return Object.keys(headersObj).length > 0;
  };

  const convertMetrics = (val) => {
    if (!val || typeof val !== "string") return val;

    const finalVal = val
      .split("-")
      .map((v) => {
        if (!Number.isNaN(Number(v))) {
          return previewSelectedMetric === "cm"
            ? (Number(v) * 2.54).toFixed(1)
            : (Number(v) / 2.54).toFixed(1);
        }
        return v;
      })
      .join("-");

    return finalVal;
  };

  const displayStyle = useMemo(() => {
    if (activeTab !== "measure") return "none";
    return sizeChart?.image ? "block" : "flex";
  }, [activeTab, sizeChart]);

  return (
    <>
      {isOpen && (
        <Modal
          modalType="right-modal"
          isOpen={isOpen}
          title=""
          closeDialog={onCloseDialog}
          headerClassName={styles.sidebarHeader}
          bodyClassName={styles.sizeContainer}
        >
          <h4 className={styles.sizeGuideTitle} style={{ marginBottom: "16px" }}>
            {sizeChart?.title ?? t("resource.common.size_guide")}
          </h4>

          <div>
            {/* Tabs */}
            <div className={styles.sizeTabs}>
              {sizeChart && (
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
                  !sizeChart?.image ? styles.cstLw : ""
                }`}
                style={{ display: activeTab === "size_guide" ? "block" : "none" }}
              >
                {/* Button Group */}
                {/* <div className={styles.btnGroup}>
                  <h4 className="h4 fontHeader" style={{ marginBottom: "16px" }}>
                    {sizeChart?.title ?? t("resource.common.size_guide")}
                  </h4>
                  <div className={styles.btnContainer}>
                    {isSizeChartAvailable() &&
                      Object.entries(values).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => changeSelectedMetric(key)}
                          className={`${styles.h5} ${styles.unitBtn} ${styles.fontBody} ${
                            previewSelectedMetric === key ? styles.unitBtnSelected : ""
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                  </div>
                </div> */}

                 <h2 className={styles.sizeGuideHeading}>UNDERSTAND YOUR FRAME SIZE IF YOU HAVE existing GLASSES</h2>

                {/* Size Description */}
                {sizeChart?.description && (
                  <div className={styles.sizeDesc}>
                    <FyHTMLRenderer htmlContent={sizeChart.description} />
                  </div>
                )}

                {/* Size Table */}
                {isSizeChartAvailable() && (
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
                )}

                {/* Not Available */}
                {!isSizeChartAvailable() && (
                  <div className={styles.notAvailable}>
                    <h3 className={styles.fontHeader}>
                      {t("resource.common.not_available_contact_for_info")}
                    </h3>
                    <FDKLink link="/contact-us" target="_blank">
                      <button
                        type="button"
                        className={`${styles.contactUs} ${styles.btnPrimary} ${styles.fontBody}`}
                      >
                        {t("resource.common.contact_us_caps")}
                      </button>
                    </FDKLink>
                  </div>
                )}
              </div>

              {/* Right Container */}
              <div className={styles.rightContainer} style={{ display: displayStyle }}>
                {sizeChart?.image ? (
                  <div className={styles.sizeGuideImage}>

                      <h2 className={styles.sizeGuideHeading}>How to know your face size?</h2>


                   
                      <img  src={productMeta.size_chart.image}
                  alt={productMeta.size_chart.title} />


                  </div>
                ) : (
                  <div className={styles.notAvailable}>
                    <h3 className={styles.fontHeader}>
                      {t("resource.common.not_available_contact_for_info")}
                    </h3>
                    <FDKLink link="/contact-us" target="_blank">
                      <button
                        type="button"
                        className={`${styles.contactUs} ${styles.btnPrimary} ${styles.fontBody}`}
                      >
                        {t("resource.common.contact_us_caps")}
                      </button>
                    </FDKLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default SizeGuide;
