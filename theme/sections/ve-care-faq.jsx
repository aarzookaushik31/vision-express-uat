import React, { useState } from "react";
import styles from "../styles/sections/ve-care-faq.less";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { headingPrefix, headingHighlight } = props || {};

  const categories = blocks.filter((b) => b.type === "faq_category");
  const faqItems = blocks.filter((b) => b.type === "faq_item");

  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.props?.categoryKey?.value || ""
  );
  const [openIndex, setOpenIndex] = useState(0);

  const visibleItems = faqItems.filter(
    (item) => item.props?.category?.value === activeCategory
  );

  const handleCategoryClick = (key) => {
    setActiveCategory(key);
    setOpenIndex(0); // reset to first question open when switching tabs
  };

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className={styles.faqSection}>
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

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className={styles.tabs}>
            {categories.map((cat, index) => {
              const key = cat.props?.categoryKey?.value || String(index);
              const label = cat.props?.label?.value || "Category";
              const icon = cat.props?.icon?.value || "shield";
              const isActive = activeCategory === key;

              return (
                <button
                  type="button"
                  key={cat.id || index}
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  onClick={() => handleCategoryClick(key)}
                  aria-pressed={isActive}
                >
                  <span className={styles.tabIcon}>
                    <CategoryIcon type={icon} />
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Accordion */}
        {visibleItems.length > 0 && (
          <div className={styles.accordionCard}>
            {visibleItems.map((item, index) => {
              const question = item.props?.question?.value || "";
              const answer = item.props?.answer?.value || "";
              const isOpen = openIndex === index;

              return (
                <div
                  className={`${styles.accordionItem} ${
                    isOpen ? styles.accordionItemOpen : ""
                  }`}
                  key={item.id || index}
                >
                  <button
                    type="button"
                    className={styles.accordionTrigger}
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.accordionQuestion}>
                      {index + 1}. {question}
                    </span>
                    <span className={styles.chevron}>
                      <ChevronIcon />
                    </span>
                  </button>

                  <div
                    className={styles.accordionPanel}
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr"
                    }}
                  >
                    <div className={styles.accordionPanelInner}>
                      <p className={styles.accordionAnswer}>{answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryIcon({ type }) {
  switch (type) {
    case "claims":
      return (
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.0627 4.85906L10.3753 0.17168C10.2659 0.0622266 10.1166 0 9.96094 0H1.75781C0.788555 0 0 0.788555 0 1.75781V18.2422C0 19.2114 0.788555 20 1.75781 20H13.4766C14.4458 20 15.2344 19.2114 15.2344 18.2422V5.27344C15.2344 5.11367 15.1673 4.96363 15.0627 4.85906ZM10.5469 2.00051L13.2339 4.6875H11.1328C10.8097 4.6875 10.5469 4.42465 10.5469 4.10156V2.00051ZM13.4766 18.8281H1.75781C1.43473 18.8281 1.17188 18.5653 1.17188 18.2422V1.75781C1.17188 1.43473 1.43473 1.17188 1.75781 1.17188H9.375V4.10156C9.375 5.07082 10.1636 5.85938 11.1328 5.85938H14.0625V18.2422C14.0625 18.5653 13.7996 18.8281 13.4766 18.8281Z" fill="white" fill-opacity="0.8"/>
<path d="M11.1328 8.28125H4.10156C3.77797 8.28125 3.51562 8.54359 3.51562 8.86719C3.51562 9.19078 3.77797 9.45312 4.10156 9.45312H11.1328C11.4564 9.45312 11.7188 9.19078 11.7188 8.86719C11.7188 8.54359 11.4564 8.28125 11.1328 8.28125Z" fill="white" fill-opacity="0.8"/>
<path d="M11.1328 10.625H4.10156C3.77797 10.625 3.51562 10.8873 3.51562 11.2109C3.51562 11.5345 3.77797 11.7969 4.10156 11.7969H11.1328C11.4564 11.7969 11.7188 11.5345 11.7188 11.2109C11.7188 10.8873 11.4564 10.625 11.1328 10.625Z" fill="white" fill-opacity="0.8"/>
<path d="M11.1328 12.9688H4.10156C3.77797 12.9688 3.51562 13.2311 3.51562 13.5547C3.51562 13.8783 3.77797 14.1406 4.10156 14.1406H11.1328C11.4564 14.1406 11.7188 13.8783 11.7188 13.5547C11.7188 13.2311 11.4564 12.9688 11.1328 12.9688Z" fill="white" fill-opacity="0.8"/>
<path d="M8.78906 15.3125H4.10156C3.77797 15.3125 3.51562 15.5748 3.51562 15.8984C3.51562 16.222 3.77797 16.4844 4.10156 16.4844H8.78906C9.11266 16.4844 9.375 16.222 9.375 15.8984C9.375 15.5748 9.11266 15.3125 8.78906 15.3125Z" fill="white" fill-opacity="0.8"/>
</svg>

      );
    case "eligibility":
      return (
      <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.21744 9.6338C9.54095 9.6338 10.6869 9.15911 11.6234 8.22256C12.5597 7.28616 13.0345 6.14041 13.0345 4.81675C13.0345 3.49355 12.5598 2.34765 11.6233 1.41094C10.6867 0.474686 9.5408 0 8.21744 0C6.89378 0 5.74804 0.474686 4.81163 1.41109C3.87523 2.34749 3.40039 3.49339 3.40039 4.81675C3.40039 6.14041 3.87523 7.28631 4.81163 8.22271C5.74834 9.15896 6.89424 9.6338 8.21744 9.6338ZM5.64047 2.23977C6.35898 1.52126 7.20185 1.17199 8.21744 1.17199C9.23289 1.17199 10.0759 1.52126 10.7946 2.23977C11.5131 2.95844 11.8625 3.80146 11.8625 4.81675C11.8625 5.83234 11.5131 6.67521 10.7946 7.39388C10.0759 8.11255 9.23289 8.46181 8.21744 8.46181C7.20215 8.46181 6.35928 8.11239 5.64047 7.39388C4.9218 6.67536 4.57238 5.83234 4.57238 4.81675C4.57238 3.80146 4.9218 2.95844 5.64047 2.23977Z" fill="white" fill-opacity="0.8"/>
<path d="M16.6452 15.3792C16.6181 14.9895 16.5635 14.5644 16.4831 14.1155C16.4019 13.6632 16.2974 13.2357 16.1723 12.8449C16.0429 12.441 15.8673 12.0422 15.6499 11.66C15.4245 11.2633 15.1596 10.9178 14.8624 10.6335C14.5516 10.3362 14.171 10.0971 13.731 9.92266C13.2924 9.74917 12.8065 9.66129 12.2866 9.66129C12.0825 9.66129 11.885 9.74505 11.5037 9.99331C11.269 10.1463 10.9945 10.3233 10.6882 10.5191C10.4262 10.686 10.0713 10.8424 9.63289 10.984C9.20519 11.1224 8.77094 11.1926 8.34218 11.1926C7.91373 11.1926 7.47948 11.1224 7.05148 10.984C6.61357 10.8426 6.25851 10.6862 5.99698 10.5193C5.69349 10.3253 5.41884 10.1483 5.18066 9.99315C4.79966 9.7449 4.60222 9.66113 4.39806 9.66113C3.87806 9.66113 3.39223 9.74917 2.95386 9.92281C2.51411 10.0969 2.13342 10.336 1.8223 10.6337C1.52507 10.9181 1.26019 11.2634 1.03497 11.66C0.817846 12.0422 0.64207 12.4409 0.51268 12.8451C0.387714 13.2359 0.283195 13.6632 0.20202 14.1155C0.121456 14.5638 0.0669841 14.989 0.0399768 15.3796C0.0134273 15.7616 0 16.159 0 16.5606C0 17.6046 0.331869 18.4498 0.986298 19.0731C1.63264 19.6881 2.48772 20 3.52788 20H13.1577C14.1976 20 15.0526 19.6881 15.6991 19.0731C16.3537 18.4502 16.6856 17.6048 16.6856 16.5605C16.6854 16.1575 16.6719 15.76 16.6452 15.3792ZM14.8911 18.224C14.464 18.6304 13.897 18.828 13.1576 18.828H3.52788C2.78831 18.828 2.22131 18.6304 1.79438 18.2241C1.37554 17.8254 1.17199 17.2811 1.17199 16.5606C1.17199 16.1859 1.18435 15.8159 1.20907 15.4607C1.23318 15.1122 1.28246 14.7293 1.35555 14.3226C1.42772 13.9208 1.51958 13.5438 1.62883 13.2024C1.73365 12.8751 1.87662 12.5511 2.05392 12.2389C2.22314 11.9413 2.41783 11.6861 2.63267 11.4804C2.83362 11.288 3.08691 11.1305 3.38536 11.0124C3.66139 10.9032 3.97159 10.8433 4.30834 10.8343C4.34939 10.8562 4.42247 10.8978 4.54088 10.975C4.78181 11.132 5.05951 11.3112 5.36651 11.5072C5.71256 11.7279 6.15841 11.9271 6.69108 12.0991C7.23565 12.2752 7.79105 12.3646 8.34234 12.3646C8.89362 12.3646 9.44918 12.2752 9.99344 12.0993C10.5266 11.927 10.9723 11.7279 11.3188 11.5069C11.6329 11.3061 11.9029 11.1322 12.1438 10.975C12.2622 10.898 12.3353 10.8562 12.3763 10.8343C12.7132 10.8433 13.0234 10.9032 13.2996 11.0124C13.5979 11.1305 13.8512 11.2881 14.0522 11.4804C14.267 11.6859 14.4617 11.9412 14.6309 12.239C14.8084 12.5511 14.9515 12.8753 15.0562 13.2023C15.1656 13.5441 15.2576 13.921 15.3296 14.3224C15.4025 14.7299 15.452 15.1129 15.4761 15.4608V15.4611C15.5009 15.815 15.5134 16.1848 15.5136 16.5606C15.5134 17.2813 15.3099 17.8254 14.8911 18.224Z" fill="white" fill-opacity="0.8"/>
</svg>

      );
    case "policy":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0C4.47301 0 0 4.4725 0 10C0 15.5269 4.4725 20 10 20C15.527 20 20 15.5275 20 10C20 4.47309 15.5275 0 10 0ZM10 18.6046C5.25539 18.6046 1.39535 14.7446 1.39535 10C1.39535 5.25535 5.25539 1.39535 10 1.39535C14.7446 1.39535 18.6046 5.25535 18.6046 10C18.6046 14.7446 14.7446 18.6046 10 18.6046Z" fill="white" fill-opacity="0.8"/>
<path d="M10.0009 8.33545C9.40852 8.33545 8.9873 8.58561 8.9873 8.95416V13.9692C8.9873 14.2852 9.40852 14.601 10.0009 14.601C10.5669 14.601 11.0275 14.2852 11.0275 13.9692V8.95408C11.0275 8.58557 10.5669 8.33545 10.0009 8.33545Z" fill="white" fill-opacity="0.8"/>
<path d="M9.99926 5.24268C9.39375 5.24268 8.91992 5.67705 8.91992 6.17725C8.91992 6.67748 9.39379 7.12502 9.99926 7.12502C10.5916 7.12502 11.0655 6.67748 11.0655 6.17725C11.0655 5.67705 10.5916 5.24268 9.99926 5.24268Z" fill="white" fill-opacity="0.8"/>
</svg>

      );
    case "shield":
    default:
      return (
  <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.7839 5.14964C16.7736 4.60966 16.7638 4.09956 16.7638 3.60607C16.7638 3.21945 16.4505 2.90602 16.0638 2.90602C13.0699 2.90602 10.7904 2.04561 8.89039 0.19822C8.61858 -0.0661198 8.18604 -0.0660265 7.91433 0.19822C6.01448 2.04561 3.7354 2.90602 0.741697 2.90602C0.355082 2.90602 0.0416461 3.21945 0.0416461 3.60607C0.0416461 4.09965 0.0319387 4.60994 0.0215779 5.15001C-0.0743758 10.1751 -0.205798 17.0571 8.17307 19.9614C8.24737 19.9872 8.32484 20.0001 8.40231 20.0001C8.47978 20.0001 8.55735 19.9872 8.63156 19.9614C17.0111 17.057 16.8798 10.1748 16.7839 5.14964ZM8.40241 18.5571C1.21643 15.9467 1.32507 10.2282 1.42149 5.1767C1.42728 4.87354 1.43288 4.5797 1.4368 4.29165C4.24074 4.1733 6.48296 3.32362 8.40241 1.65153C10.322 3.32362 12.5646 4.17339 15.3688 4.29165C15.3727 4.57961 15.3783 4.87326 15.3841 5.17624C15.4804 10.2279 15.5889 15.9466 8.40241 18.5571Z" fill="white"/>
<path d="M10.813 7.56828L7.4342 10.9469L5.99237 9.50509C5.71898 9.23179 5.27571 9.23179 5.00241 9.50509C4.72901 9.77858 4.72901 10.2218 5.00241 10.4951L6.93922 12.432C7.07587 12.5686 7.25508 12.6369 7.4342 12.6369C7.61332 12.6369 7.79253 12.5686 7.92918 12.432L11.8029 8.55834C12.0764 8.28495 12.0764 7.84167 11.803 7.56837C11.5297 7.29498 11.0864 7.29489 10.813 7.56828Z" fill="white"/>
</svg>

      );
  }
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Component.displayName = "VeCareFaq";
export default Component;

export const settings = {
  label: "Ve-Care FAQ",
  props: [
    {
      id: "headingPrefix",
      type: "text",
      label: "Heading (normal text)",
      default: "Frequently Asked"
    },
    {
      id: "headingHighlight",
      type: "text",
      label: "Heading (highlighted text)",
      default: "Questions"
    }
  ],
  blocks: [
    {
      type: "faq_category",
      name: "FAQ Category Tab",
      props: [
        {
          id: "categoryKey",
          type: "text",
          label: "Category Key (must match FAQ items' category field exactly)",
          default: "coverage"
        },
        {
          id: "label",
          type: "text",
          label: "Tab Label",
          default: "Coverage"
        },
       {
  id: "icon",
  type: "select",
  label: "Icon",
  options: [
    {
      value: "shield",
      label: "Shield (Coverage)"
    },
    {
      value: "claims",
      label: "Document (Claims)"
    },
    {
      value: "eligibility",
      label: "Person (Eligibility)"
    },
    {
      value: "policy",
      label: "Info (Policy & Others)"
    }
  ],
  default: "shield"
}
      ]
    },
    {
      type: "faq_item",
      name: "FAQ Item",
      props: [
        {
          id: "category",
          type: "text",
          label: "Category Key (must match a tab's Category Key exactly)",
          default: "coverage"
        },
        {
          id: "question",
          type: "text",
          label: "Question",
          default: "Is accidental damage covered?"
        },
        {
          id: "answer",
          type: "text",
          label: "Answer",
          default:
            "Yes. VeCare Protect covers accidental damage to eligible prescription spectacles, prescription sunglasses, frames, and lenses purchased from Vision Express stores in India. Loss or theft is not covered."
        }
      ]
    }
  ],
  blockLimit: 40
};

Component.settings = settings;