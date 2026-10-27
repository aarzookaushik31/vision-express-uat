import React, { useState, useEffect, useMemo, Suspense } from "react";
import PropTypes from "prop-types";
import styles from "./size-guide.less";
import faceMeasurement from "../../../assets/images/size-guide/face-measurement.png";
import faceSizes from "../../../assets/images/size-guide/face-sizes.png";
import frameMeasurements from "../../../assets/images/size-guide/frame-measurements.png";
// import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal"),
);
function SizeGuide({ isOpen, productMeta, onCloseDialog }) {
  const { t } = useGlobalTranslation("translation");
  const [audience, setAudience] = useState("adult");
  useEffect(() => {
    if (!isOpen) setAudience("adult");
  }, [isOpen]);
  const [previewSelectedMetric, setPreviewSelectedMetric] = useState("cm");
  const [selectedMetric, setSelectedMetric] = useState("cm");
  const [activeTab, setActiveTab] = useState("measure");
  const [touched, setTouched] = useState(false);
  const values = {
    in: t("resource.product.inch"),
    cm: t("resource.product.cm"),
  };
  const headers = Object.entries(productMeta?.size_chart?.headers ?? {}).filter(
    ([key, val]) => !key?.includes("__") && val !== null,
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
  const sizeChart = productMeta?.size_chart;
  const title = sizeChart?.title;
  const hasSizeChart = isSizeChartAvailable();
  const allSizes = sizeChart?.sizes || [];
  const notAvailable = (
    <div className={styles.notAvailable}>
      <h3 className={styles.fontHeader}>
        {t("resource.common.not_available_contact_for_info")}
      </h3>
      <FDKLink to="/contact-us" target="_blank">
        <button type="button" className={`btnPrimary ${styles.contactUs}`}>
          {t("resource.common.contact_us_caps")}
        </button>
      </FDKLink>
    </div>
  );
  return (
    <Suspense fallback={<div />}>
      <Modal
        modalType="right-modal"
        isOpen={isOpen}
        title=""
        closeDialog={(e) => onCloseDialog(e)}
        containerClassName={styles.sizeGuideModal}
        customClassName={styles.sizeGuideOverlay}
        headerClassName={styles.sidebarHeader}
        bodyClassName={styles.sizeContainer}
      >
        <>
          <h4 className={styles.sizeGuideTitle}>{title}</h4>
          <div className={styles.sizeTabs}>
            {sizeChart && (
              <button
                type="button"
                className={`${styles.tab} ${activeTab === "measure" ? styles.active : ""}`}
                aria-pressed={activeTab === "measure"}
                onClick={() => setActiveTab("measure")}
              >
                Check Face Size
              </button>
            )}
            {hasSizeChart && (
              <button
                type="button"
                className={`${styles.tab} ${activeTab === "size_guide" ? styles.active : ""}`}
                aria-pressed={activeTab === "size_guide"}
                onClick={() => setActiveTab("size_guide")}
              >
                Know Your Frame Size
              </button>
            )}
          </div>
          <div className={styles.sidebarBody}>
            <div
              className={styles.leftContainer}
              style={{
                display: activeTab === "size_guide" ? "block" : "none",
              }}
            >
              <div className={styles.frameGuide}>
                <h2 className={styles.sizeGuideHeading}>
                  {"Understand your frame size if you have "}
                  <em>existing glasses.</em>
                </h2>
                <div className={styles.sizeDesc}>
                  <p>
                    Look inside the temple of your existing frame. There will be
                    a series of numbers printed like 53-15-135.
                  </p>
                  <p>
                    These measurements are the Lens Width - Nose bridge width -
                    Temple Length respectively.
                  </p>
                </div>
                <img
                  className={styles.frameGuideImage}
                  src={frameMeasurements}
                  alt="The numbers inside the temple show the lens width, bridge width and temple length."
                />
              </div>
              {hasSizeChart ? (
                <div className={styles.sizeInfo}>
                  <div className={styles.tableToolbar}>
                    <h2 className={styles.sizeInfoHeading}>
                      Lens width &amp; frame size
                    </h2>
                    <div
                      className={styles.audienceTabs}
                      aria-label="Frame size age group"
                    >
                      {[
                        ["adult", "Adult"],
                        ["kids", "Kids"],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          className={`${styles.tab} ${audience === key ? styles.active : ""}`}
                          aria-pressed={audience === key}
                          onClick={() => setAudience(key)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    ["adult", "Adults", allSizes.slice(0, 3)],
                    ["kids", "Kids", allSizes.slice(3)],
                  ].map(([key, label, rows]) => (
                    <div
                      key={key}
                      className={styles.sectionTable}
                      hidden={audience !== key}
                    >
                      <table
                        className={styles.sizeTable}
                        aria-label={`${label} frame sizes`}
                      >
                        <thead>
                          <tr>
                            {headers.map(([headerKey, value]) => (
                              <th
                                key={headerKey}
                                scope="col"
                                className={styles.sizeHeader}
                              >
                                {value?.value}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr
                              key={`${key}_${rowIndex}`}
                              className={styles.sizeRow}
                            >
                              {Object.entries(row)
                                .filter(
                                  ([cellKey, value]) =>
                                    !cellKey?.includes("__") && value !== null,
                                )
                                .map(([cellKey, value], columnIndex) => (
                                  <td key={cellKey} className={styles.sizeCell}>
                                    {headers[columnIndex]?.[1]?.convertable
                                      ? convertMetrics(value)
                                      : value}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                notAvailable
              )}
            </div>
            <div
              className={styles.rightContainer}
              style={{
                display: displayStyle,
              }}
            >
              {sizeChart?.image ? (
                <div className={styles.faceGuide}>
                  <div className={styles.faceGuideTop}>
                    <div className={styles.faceIntro}>
                      <p className={styles.eyebrow}>A quick guide</p>
                      <h2 className={styles.faceHeading}>
                        {"How to know your "}
                        <em>face size.</em>
                      </h2>
                      <p className={styles.faceSubtitle}>
                        Follow these simple steps to find your perfect lens.
                      </p>
                    </div>
                    <div className={styles.faceStep}>
                      <p className={styles.stepText}>
                        <strong>STEP 1:</strong> Pull out your debit/credit/pan
                        card
                      </p>
                      <div
                        className={`${styles.stepPhoto} ${styles.stepPhotoFirst}`}
                      >
                        <img
                          src={faceMeasurement}
                          alt="Use a debit, credit or PAN card to measure your face."
                        />
                      </div>
                    </div>
                    <div className={styles.faceStep}>
                      <p className={styles.stepText}>
                        <strong>STEP 2:</strong> Place the card on the bridge of
                        your nose and under your eyebrow pan card
                      </p>
                      <div
                        className={`${styles.stepPhoto} ${styles.stepPhotoSecond}`}
                      >
                        <img
                          src={faceMeasurement}
                          alt="Position the card on the bridge of your nose, under your eyebrow."
                        />
                      </div>
                    </div>
                  </div>
                  <p className={`${styles.stepText} ${styles.faceStepThree}`}>
                    <strong>STEP 3:</strong> Now check where the outer end of
                    the card reaches
                  </p>
                  <div className={styles.faceResults}>
                    {["Small", "Medium", "Large"].map((size) => (
                      <div key={size} className={styles.faceResult}>
                        <div className={styles.faceResultMedia}>
                          <div className={styles.faceSizeCrop}>
                            <img
                              src={faceSizes}
                              alt={`${size} face size with the card held under the eyebrow.`}
                            />
                          </div>
                          <span className={styles.faceSizeLabel}>{size}</span>
                        </div>
                        <p className={styles.faceResultCaption}>
                          If the card extends beyond the corner of your eye.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                notAvailable
              )}
            </div>
          </div>
        </>
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
