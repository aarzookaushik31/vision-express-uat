import React, { useEffect, useState } from "react";
import { FAQ_CATEGORIES, FAQS_BY_CATEGORY } from "../queries/faqQuery";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import EmptyState from "../components/empty-state/empty-state";
import EmptyFaqIcon from "../assets/images/no-faq.svg";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";
import styles from "../styles/faq.less";

function Faqs({ fpi }) {
  const { t } = useGlobalTranslation("translation");

  // Page + theme data (same approach as the About page)
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  const seoData = page?.seo || {};
  const mergedSeo = {
    ...seoData,
    title: sanitizeHTMLTag(seoData?.title || "FAQs"),
    description: sanitizeHTMLTag(seoData?.description || ""),
  };

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fpi.executeGQL(FAQ_CATEGORIES);
        const cats =
          res?.data?.applicationContent?.faq_categories?.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          handleCategoryClick(cats[0]);
        }
      } catch (err) {
        setError(`Error fetching FAQ categories: ${err?.message || err}`);
      }
    };
    fetchCategories();
  }, [fpi]);

  const handleCategoryClick = async (category) => {
    setActiveCategory(category);
    setLoading(true);
    setFaqs([]);
    setOpenFaq(null);

    try {
      const res = await fpi.executeGQL(FAQS_BY_CATEGORY, {
        slug: category.slug,
      });
      const items = res?.data?.faqsByCategory?.faqs || [];
      setFaqs(items);
      if (items.length > 0) {
        setOpenFaq(items[0].slug);
      }
    } catch (err) {
      setError(`Error fetching FAQs: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (slug) => {
    setOpenFaq(openFaq === slug ? null : slug);
  };

  return (
    <>
      {getHelmet({ seo: mergedSeo })}

      <div className={styles.faqWrapper}>
        <div className={styles.faqHeaderWrapper}>
          <h1>Frequently Asked Questions</h1>

          {/* Pill tabs (text only, no icons) */}
          <div className={styles.faqCategories} role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory?.slug === cat.slug}
                onClick={() => handleCategoryClick(cat)}
                className={`${styles.faqCategoryButton} ${
                  activeCategory?.slug === cat.slug
                    ? styles.activeFAQCategory
                    : ""
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* White card holding all questions */}
        <div className={styles.faqList}>
          {loading && <p className={styles.loadingfaqtext}>Loading FAQs...</p>}

          {!loading && faqs.length === 0 && (
            <EmptyState
              title={t("resource.faq.no_frequently_asked_questions_found")}
              Icon={<EmptyFaqIcon />}
              showButton={false}
            />
          )}

          {!loading &&
            faqs.map((faq, index) => {
              const isOpen = openFaq === faq.slug;
              return (
                <div
                  key={faq.slug}
                  className={`${styles.faqItem} ${
                    isOpen ? styles.activeFaqItem : ""
                  }`}
                >
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(faq.slug)}
                    aria-expanded={isOpen}
                  >
                    <h2 className={styles.faqQuestionText}>
                      {index + 1}. {faq.question}
                    </h2>
                    <span
                      className={`${styles.faqArrow} ${
                        isOpen ? styles.activeFAQ : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="11"
                        viewBox="0 0 20 11"
                        fill="none"
                      >
                        <path
                          d="M0.75 0.75L9.67781 9.67781L18.6056 0.750001"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          stroke="currentColor"
                        />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      className={styles.faqAnswer}
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  )}
                </div>
              );
            })}
        </div>

        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      {/* Theme-editor sections rendered below the FAQ block */}
      {sections.length > 0 && (
        <SectionRenderer
          sections={sections}
          fpi={fpi}
          globalConfig={globalConfig}
        />
      )}
    </>
  );
}

// Tells the platform which page's sections to load (must match the page slug)
export const sections = JSON.stringify([
  {
    attributes: {
      page: "faq",
    },
  },
]);

export default Faqs;