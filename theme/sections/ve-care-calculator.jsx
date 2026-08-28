import React, { useState } from "react";
import styles from "../styles/sections/ve-care-calculator.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const {
    headingPrefix,
    headingHighlight,
    frameLabel,
    frameDescription,
    frameMin,
    frameMax,
    frameStep,
    frameDefault,
    lensLabel,
    lensDescription,
    lensMin,
    lensMax,
    lensStep,
    lensDefault,
    replacementCostLabel,
    veCareLabel,
    youSaveLabel,
    disclaimerText
  } = props || {};

  // Plan tabs come from blocks so editors can add/remove/reprice plans
  const plans =
    blocks.length > 0
      ? blocks.map((b) => ({
          label: b.props?.planLabel?.value || "Plan",
          price: Number(b.props?.planPrice?.value) || 0
        }))
      : [
          { label: "Single Vision ₹299", price: 299 },
          { label: "Progressive ₹499", price: 499 }
        ];

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const fMin = Number(frameMin?.value ?? 0);
  const fMax = Number(frameMax?.value ?? 10000);
  const fStep = Number(frameStep?.value ?? 100);
  const [frameValue, setFrameValue] = useState(
    Number(frameDefault?.value ?? 4000)
  );

  const lMin = Number(lensMin?.value ?? 0);
  const lMax = Number(lensMax?.value ?? 10000);
  const lStep = Number(lensStep?.value ?? 100);
  const [lensValue, setLensValue] = useState(
    Number(lensDefault?.value ?? 5000)
  );

  const [activeSlider, setActiveSlider] = useState(null); // 'frame' | 'lens' | null

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const replacementCost = frameValue + lensValue;
  const veCarePrice = plans[selectedPlanIndex]?.price || 0;
  const youSave = replacementCost - veCarePrice;

  const formatCurrency = (num) => `₹${num.toLocaleString("en-IN")}`;

  const frameStepAmount = (dir) =>
    setFrameValue((prev) => clamp(prev + dir * fStep, fMin, fMax));

  const lensStepAmount = (dir) =>
    setLensValue((prev) => clamp(prev + dir * lStep, lMin, lMax));

  return (
    <section className={styles.calculator}>
      <div className={styles.container}>
        {(headingPrefix?.value || headingHighlight?.value) && (
          <h2 className={styles.heading}>
            {headingPrefix?.value && <span>{headingPrefix.value} </span>}
            {headingHighlight?.value && (
              <span className={styles.headingHighlight}>
                {headingHighlight.value}
              </span>
            )}
          </h2>
        )}

        {/* Plan tabs */}
        <div className={styles.planTabs}>
          {plans.map((plan, index) => (
            <button
              type="button"
              key={index}
              className={`${styles.planTab} ${
                selectedPlanIndex === index ? styles.planTabActive : ""
              }`}
              onClick={() => setSelectedPlanIndex(index)}
              aria-pressed={selectedPlanIndex === index}
            >
              {plan.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className={styles.card}>
          {/* Frame row */}
          <SliderRow
            icon={<GlassesIcon />}
            label={frameLabel?.value || "Frame"}
            description={
              frameDescription?.value || "Adjust the cost of frame"
            }
            min={fMin}
            max={fMax}
            step={fStep}
            value={frameValue}
            onChange={(v) => setFrameValue(clamp(v, fMin, fMax))}
            onStep={frameStepAmount}
            isActive={activeSlider === "frame"}
            onFocus={() => setActiveSlider("frame")}
            onBlur={() => setActiveSlider(null)}
            formatCurrency={formatCurrency}
          />

          <div className={styles.divider} />

          {/* Lens row */}
          <SliderRow
            icon={<LensIcon />}
            label={lensLabel?.value || "Lens"}
            description={lensDescription?.value || "Adjust the cost of lens"}
            min={lMin}
            max={lMax}
            step={lStep}
            value={lensValue}
            onChange={(v) => setLensValue(clamp(v, lMin, lMax))}
            onStep={lensStepAmount}
            isActive={activeSlider === "lens"}
            onFocus={() => setActiveSlider("lens")}
            onBlur={() => setActiveSlider(null)}
            formatCurrency={formatCurrency}
          />

          {/* Result bar */}
          <div className={styles.resultBar}>
            <div className={styles.resultItem}>
              <p className={styles.resultLabel}>
                {replacementCostLabel?.value || "Replacement Cost"}
              </p>
              <p className={styles.resultValue}>
                {formatCurrency(replacementCost)}/-
              </p>
            </div>

            <span className={styles.resultOperator}>−</span>

            <div className={styles.resultItem}>
              <p className={styles.resultLabel}>{veCareLabel?.value || "VE Care"}</p>
              <p className={styles.resultValue}>
                {formatCurrency(veCarePrice)}/-
              </p>
            </div>

            <span className={styles.resultOperator}>=</span>

            <div className={styles.resultItem}>
              <p className={styles.resultLabel}>
                {youSaveLabel?.value || "You Save"}
              </p>
              <p className={styles.resultValueBold}>
                {formatCurrency(Math.max(youSave, 0))}/-
              </p>
            </div>
          </div>
        </div>

        {disclaimerText?.value && (
          <p className={styles.disclaimer}>
            <InfoIcon />
            <span>{disclaimerText.value}</span>
          </p>
        )}
      </div>
    </section>
  );
}

function SliderRow({
  icon,
  label,
  description,
  min,
  max,
  step,
  value,
  onChange,
  onStep,
  isActive,
  onFocus,
  onBlur,
  formatCurrency
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.row}>
      <div className={styles.rowInfo}>
        <div className={styles.rowIcon}>{icon}</div>
        <div>
          <p className={styles.rowLabel}>{label}</p>
          <p className={styles.rowDescription}>{description}</p>
        </div>
      </div>

      <div className={styles.sliderControl}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => onStep(-1)}
          aria-label={`Decrease ${label} cost`}
        >
          <MinusIcon />
        </button>

        <div className={styles.sliderTrackWrap}>
          <span
            className={`${styles.sliderTooltip} ${
              isActive ? styles.sliderTooltipActive : ""
            }`}
            style={{ left: `${percent}%` }}
          >
            {formatCurrency(value)}
          </span>
          <input
            type="range"
            className={styles.slider}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onFocus={onFocus}
            onBlur={onBlur}
            onMouseDown={onFocus}
            onMouseUp={onBlur}
            onTouchStart={onFocus}
            onTouchEnd={onBlur}
            style={{
              background: `linear-gradient(to right, #e42313 ${percent}%, #fff ${percent}%)`
            }}
            aria-label={`${label} cost`}
          />
        </div>

        <button
          type="button"
          className={styles.stepButton}
          onClick={() => onStep(1)}
          aria-label={`Increase ${label} cost`}
        >
          <PlusIcon />
        </button>
      </div>

      <div className={styles.valuePill}>{formatCurrency(value)}</div>
    </div>
  );
}

function GlassesIcon() {
  return (
  <svg width="66" height="41" viewBox="0 0 66 41" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3053 7.83573C13.1125 4.89995 14.1649 4.15523 14.5189 3.97381C14.9545 4.53529 15.4055 6.3809 15.4695 7.61827C15.4976 8.6754 16.3522 9.52357 17.4023 9.52357C18.4701 9.52357 19.3359 8.64641 19.3359 7.56446C19.3359 5.14719 18.2745 0.650125 15.2752 0.065005C12.4928 -0.478712 10.1576 2.50135 8.64373 4.78998C6.24388 8.41759 3.38229 14.4233 0.138358 22.6403C-0.0999903 23.2438 -0.0272871 23.928 0.332491 24.4662C0.69214 25.0046 1.29194 25.3269 1.93364 25.3256H4.01187C3.90513 26.0373 3.86711 26.706 3.86711 27.2863V28.7289C3.86711 31.8758 5.1621 36.0257 7.98231 38.3382C10.1972 40.1542 13.1904 41 17.4023 41C24.7396 41 30.0587 36.4272 30.9326 27.9986C31.1344 27.4755 30.9622 25.3272 33 25.3272C35.027 25.3272 34.8727 27.4939 35.0674 27.9986C35.9399 36.4148 41.2482 41 48.5976 41C52.8095 41 55.8029 40.1542 58.0176 38.3382C60.8239 36.0371 62.1328 31.9022 62.1328 28.7289V27.2863C62.1328 26.7061 62.0948 26.0373 61.9882 25.3272H64.0664C64.7081 25.3272 65.3079 25.0047 65.6676 24.4664C66.0273 23.9281 66.0999 23.2441 65.8617 22.6406C62.6178 14.4236 59.7562 8.41785 57.3563 4.79024C55.8424 2.50187 53.5073 -0.478451 50.7249 0.065266C47.7322 0.64908 46.6642 5.21693 46.6642 7.56472C46.6642 8.64667 47.5299 9.52383 48.5978 9.52383C49.6478 9.52383 50.5025 8.67567 50.5306 7.61853C50.5945 6.38116 51.0456 4.53555 51.4811 3.97407C51.8351 4.15562 52.8875 4.90021 54.6948 7.83599C56.5647 10.8735 58.7462 15.4316 61.1918 21.4091H60.5777C58.7776 18.5954 55.7463 17.4909 52.465 17.4909C49.0692 17.4909 44.9224 18.1901 41.6429 19.3158C39.1164 20.1831 37.2977 21.2096 36.1963 22.385C35.2792 21.7689 34.1806 21.4091 33.0001 21.4091C31.8196 21.4091 30.721 21.769 29.8039 22.385C28.7025 21.2096 26.8836 20.1831 24.3573 19.3158C21.0778 18.1901 16.931 17.4909 13.5352 17.4909C10.2516 17.4909 7.22112 18.5971 5.42249 21.4091H4.80838C7.25386 15.4313 9.43535 10.8733 11.3053 7.83573ZM15.4692 7.61161C15.4686 7.59019 15.4687 7.57439 15.4687 7.56459C15.4687 7.58027 15.4688 7.59594 15.4692 7.61161ZM50.5307 7.61161C50.5311 7.59594 50.5312 7.58027 50.5312 7.56459C50.5312 7.57439 50.5314 7.59019 50.5307 7.61161ZM43.3678 22.8664C46.1788 21.9674 49.6647 21.4089 52.4648 21.4089C56.3139 21.4089 58.2656 23.3863 58.2656 27.2863C58.2656 31.1944 57.3887 33.8133 55.5849 35.2923C54.0959 36.5131 51.8757 37.0818 48.5976 37.0818C42.29 37.0818 38.8118 32.9205 38.8008 25.3632C38.9139 25.0854 39.9438 23.9613 43.3678 22.8664ZM13.5351 21.4089C16.3353 21.4089 19.8212 21.9674 22.6321 22.8664C26.0562 23.9613 27.086 25.0854 27.1992 25.3632C27.1881 32.9205 23.7099 37.0818 17.4023 37.0818C14.1242 37.0818 11.904 36.5131 10.415 35.2923C8.61125 33.8132 7.7343 31.1944 7.7343 27.2863C7.7343 23.3863 9.68607 21.4089 13.5351 21.4089Z" fill="white"/>
</svg>

  );
}

function LensIcon() {
  return (
<svg width="70" height="63" viewBox="0 0 70 63" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.1271 13.1602C24.1271 13.1602 7.98028 14.9701 9.44447 28.2495C10.9087 41.529 16.8264 50.3345 36.532 50.0091C56.2173 49.7041 59.5524 34.8181 59.7558 30.1611C59.9388 25.5042 60.2235 17.6748 50.8893 14.482C41.4737 11.2893 24.1271 13.1602 24.1271 13.1602Z" stroke="white" stroke-width="3.5" stroke-miterlimit="10"/>
<path d="M28.3418 24.6534L19.4126 32.1955" stroke="white" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
<path d="M22.0175 36.7272L37.5422 21.7782" stroke="white" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
<path d="M35.613 28.9149L24.4853 38.926" stroke="white" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
</svg>

  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 6H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1" />
      <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="6" cy="3.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

Component.displayName = "VeCareCalculator";
export default Component;

export const settings = {
  label: "Ve-Care Cost Calculator",
  props: [
    {
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "What Could One"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "Accident Cost?"
    },
    { id: "frameLabel", type: "text", label: "Frame Row Label", default: "Frame" },
    {
      id: "frameDescription",
      type: "text",
      label: "Frame Row Description",
      default: "Adjust the cost of frame"
    },
    { id: "frameMin", type: "number", label: "Frame Min", default: 0 },
    { id: "frameMax", type: "number", label: "Frame Max", default: 10000 },
    { id: "frameStep", type: "number", label: "Frame Step", default: 100 },
    { id: "frameDefault", type: "number", label: "Frame Default Value", default: 4000 },
    { id: "lensLabel", type: "text", label: "Lens Row Label", default: "Lens" },
    {
      id: "lensDescription",
      type: "text",
      label: "Lens Row Description",
      default: "Adjust the cost of lens"
    },
    { id: "lensMin", type: "number", label: "Lens Min", default: 0 },
    { id: "lensMax", type: "number", label: "Lens Max", default: 10000 },
    { id: "lensStep", type: "number", label: "Lens Step", default: 100 },
    { id: "lensDefault", type: "number", label: "Lens Default Value", default: 5000 },
    {
      id: "replacementCostLabel",
      type: "text",
      label: "Replacement Cost Label",
      default: "Replacement Cost"
    },
    { id: "veCareLabel", type: "text", label: "VE Care Label", default: "VE Care" },
    { id: "youSaveLabel", type: "text", label: "You Save Label", default: "You Save" },
    {
      id: "disclaimerText",
      type: "text",
      label: "Disclaimer Text",
      default: "Prices are indicative. Final replacement cost may vary."
    }
  ],
  blocks: [
    {
      type: "plan_tab",
      name: "Plan Tab",
      props: [
        {
          id: "planLabel",
          type: "text",
          label: "Plan Label",
          default: "Single Vision ₹299"
        },
        {
          id: "planPrice",
          type: "text",
          label: "Plan Price (numeric, used in calculation)",
          default: 299
        }
      ]
    }
  ],
  blockLimit: 4
};

Component.settings = settings;