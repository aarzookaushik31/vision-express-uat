import React from "react";
import styles from "./product-highlight.less";
import Common from "../../../../assets/images/highlights/Highlights.png";

import ValueDriven from "../../../../assets/images/highlights/value-driven.png";
import Premium from "../../../../assets/images/highlights/premium.png";
import Flexible from "../../../../assets/images/highlights/Flexible.png";
import RustProof from "../../../../assets/images/highlights/Rust-proof.png";
import HeatResistant from "../../../../assets/images/highlights/Heat-resistant.png";
import FeatherLight from "../../../../assets/images/highlights/Feather-light.png";
import ShapeRetaining from "../../../../assets/images/highlights/Shape Retention.png";
import Compatibility from "../../../../assets/images/highlights/Compatibility.png";
import EffectivenessInRemovingOilsSmudgesAndDust from "../../../../assets/images/highlights/Effectiveness in removing oils, smudges and dust.png";
import EaseOfCleaning from "../../../../assets/images/highlights/Ease of Cleaning.png";
import LongerWearingHour from "../../../../assets/images/highlights/Longer Wearing Hour.png";
import ReduceEyeStrain from "../../../../assets/images/highlights/Reduce Eye Strain.png";
import UvProtection from "../../../../assets/images/highlights/UV Protection.png";
import MaximumHygiene from "../../../../assets/images/highlights/Maximum Hygiene.png";
import BestComfort from "../../../../assets/images/highlights/Best Comfort.png";
import LowMaintenance from "../../../../assets/images/highlights/Low-maintenance.png";
import Adjustable from "../../../../assets/images/highlights/Adjustable.png";
import UltraLight from "../../../../assets/images/highlights/Ultra-light.png";
import Comfortable from "../../../../assets/images/highlights/Comfortable.png";
import SkinFriendly from "../../../../assets/images/highlights/Skin-friendly.png";
import Ultralightweight from "../../../../assets/images/highlights/Ultra-light.png";
import UltraDurable from "../../../../assets/images/highlights/Ultra-durable.png";
import DailyWear from "../../../../assets/images/highlights/Daily-wear.png";
import ComfortAndEyeFriendly from "../../../../assets/images/highlights/Comfort & Eye-friendly.png";
import EasyHandeling from "../../../../assets/images/highlights/Easy handeling.png";
import SoftAndFlexible from "../../../../assets/images/highlights/Soft & Flexible.png";
import StableFit from "../../../../assets/images/highlights/Stable Fit.png";
import Durable from "../../../../assets/images/highlights/Durable.png";
import ImpactResistant from "../../../../assets/images/highlights/Impact-resistant.png";
import SuperFlexible from "../../../../assets/images/highlights/Super-flexible.png";
import Hypoallergenic from "../../../../assets/images/highlights/Hypoallergenic.png";
import Reliable from "../../../../assets/images/highlights/Reliable.png";
import CleaningEfficacy from "../../../../assets/images/highlights/cleaning Efficacy.png";
import SafeForCoatings from "../../../../assets/images/highlights/Safe for Coatings.png";
import LeakProofDesign from "../../../../assets/images/highlights/Leak-proof Design.png";
import HighPower from "../../../../assets/images/highlights/High Power.png";

function PdpHighlights({ highlights }) {
  if (!highlights || highlights.length === 0) return null;

const iconMap = {
  "value-driven": ValueDriven,
  "premium": Premium,
  "flexible": Flexible,
  "rust-proof": RustProof,
  "heat-resistant": HeatResistant,
  "feather-light": FeatherLight,
  "shape-retaining": ShapeRetaining,
  "compatibility": Compatibility,
  "effectiveness in removing oils, smudges and dust": EffectivenessInRemovingOilsSmudgesAndDust,
  "ease of cleaning": EaseOfCleaning,
  "longer wearing hour": LongerWearingHour,
  "reduce eye strain": ReduceEyeStrain,
  "uv protection": UvProtection,
  "maximum hygiene": MaximumHygiene,
  "best comfort": BestComfort,
  "low-maintenance": LowMaintenance,
  "adjustable": Adjustable,
  "ultra-light": UltraLight,
  "comfortable": Comfortable,
  "skin-friendly": SkinFriendly,
  "ultralightweight": Ultralightweight,
  "ultra-durable": UltraDurable,
  "daily-wear": DailyWear,
  "comfort & eye-friendly": ComfortAndEyeFriendly,
  "easy handeling": EasyHandeling,
  "soft & flexible": SoftAndFlexible,
  "stable fit": StableFit,
  "lightweight": Ultralightweight,
  "durable": Durable,
  "impact-resistant": ImpactResistant,
  "super-flexible": SuperFlexible,
  "hypoallergenic": Hypoallergenic,
  "reliable": Reliable,
  "cleaning efficacy": CleaningEfficacy,
  "safe for coatings": SafeForCoatings,
  "leak-proof design": LeakProofDesign,
  "high power": HighPower,
};

  return (
    <div className={styles.highlightsContainer}>
      {highlights.map((item, index) =>
        item.split("~").map((p, i) => {
          const text = p.trim();

          const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");
         const normalizedText = normalize(text);

const matchedKey = Object.keys(iconMap).find(
  (key) => normalize(key) === normalizedText
);

          const icon = matchedKey ? iconMap[matchedKey] : Common;

          return (
            <div className={styles.highlightItem} key={`${index}-${i}`}>
              <span className={styles.icon}>
                <img src={icon} className={styles.iconImg} alt={text} />
              </span>

              <span className={styles.text}>{text}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PdpHighlights;
