import React, { useEffect, useState } from "react";
import { FAQ_CATEGORIES, FAQS_BY_CATEGORY } from "../queries/faqQuery";
import { useGlobalTranslation } from "fdk-core/utils";
import EmptyState from "../components/empty-state/empty-state";
import EmptyFaqIcon from "../assets/images/no-faq.svg";
import ArrowDownIcon from "../assets/images/arrow-down.svg";
import styles from "../styles/faq.less";

function Faqs({ fpi }) {
  const { t } = useGlobalTranslation("translation");

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
    <div className={styles.faqWrapper}>
      <div className={styles.faqHeaderWrapper}>
        <h1>Frequently Asked Questions</h1>
        <p>Choose a topic to see relevant questions</p>

        <div className={styles.faqCategories}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`${styles.faqCategoryButton} ${
                activeCategory?.slug === cat.slug ? styles.activeFAQCategory : ""
              }`}
            >
              {cat.icon_url && (
                <img
                  src={cat.icon_url}
                  alt={cat.title}
                />
              )}
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

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
          faqs.map((faq) => (
            <div key={faq.slug} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFaq(faq.slug)}
              >
                <h2 className={styles.faqQuestionText}>{faq.question}</h2>
                <span
                  className={
                    openFaq === faq.slug ? styles.activeFAQ : undefined
                  }
                >
                  <ArrowDownIcon />
                </span>
              </button>
              {openFaq === faq.slug && (
                <div
    className={styles.faqAnswer}
    dangerouslySetInnerHTML={{ __html: faq.answer }}
  />
              )}
            </div>
          ))}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

export default Faqs;
