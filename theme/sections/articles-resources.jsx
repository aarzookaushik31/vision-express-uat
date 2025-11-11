import React, { useEffect, useState } from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import { useFPI } from "fdk-core/utils";
import styles from "../styles/sections/articles-resources.less";
import Slider from "react-slick";

export function BlogPreview({ props }) {
  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({ fpi, props });
  const blogItems = blogs?.items?.slice(0, 3) || [];

  // track mobile view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    cssEase: "linear",
  };

  return (
    <div className={styles.blogListingcards}>
      {props?.title?.value && (
        <h2 className={styles.blogTitle}>{props.title.value}</h2>
      )}
      {props?.description?.value && (
        <p className={styles.blogPara}>{props.description.value}</p>
      )}

      {isLoading || isBlogPageLoading ? (
        <p>Loading blogs...</p>
      ) : blogItems.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <>
          {/* Desktop Grid */}
          {!isMobile && (
            <div className={styles.blogGrid}>
              {blogItems.map((blog) => (
                <a
                  href={`/blog/${blog.slug}`}
                  key={blog.id}
                  className={styles.blogCard}
                >
                  <div className={styles.blogInfoContainer}>
                    {blog?.tags?.length > 0 && (
                      <div className={styles.blogTags}>
                        {blog.tags.map((tag, idx) => (
                          <span key={idx} className={styles.blogTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h2 className={styles.blogCardTitle}>{blog.title}</h2>
                  <div className={styles.blogImage}>
                    <img
                      src={
                        blog?.feature_image?.secure_url || props?.fallback_image
                      }
                      alt={blog.title}
                    />
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Mobile Slider */}
          {isMobile && (
            <div className={styles.blogSlider}>
              <Slider {...sliderSettings}>
                {blogItems.map((blog) => (
                  <div key={blog.id}>
                    <a href={`/blog/${blog.slug}`} className={styles.blogCard}>
                      <div className={styles.blogInfoContainer}>
                        {blog?.tags?.length > 0 && (
                          <div className={styles.blogTags}>
                            {blog.tags.map((tag, idx) => (
                              <span key={idx} className={styles.blogTag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <h2 className={styles.blogCardTitle}>{blog.title}</h2>
                      <div className={styles.blogImage}>
                        <img
                          src={
                            blog?.feature_image?.secure_url ||
                            props?.fallback_image
                          }
                          alt={blog.title}
                        />
                      </div>
                    </a>
                  </div>
                ))}
              </Slider>
            </div>
          )}

          <div className={styles.viewAllWrapper}>
            <a href="/blog" className={styles.viewAllBtn}>
              View All
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Articles and Resources",
  props: [
    {
      id: "title",
      type: "text",
      value: "Latest Blogs",
      label: "Section Heading",
    },
    {
      id: "description",
      type: "text",
      value: "Our exclusive and trending collections offer unique content",
      label: "t:resource.common.description",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "Fallback Image",
      default: "",
    },
  ],
};

BlogPreview.serverFetch = async ({ fpi }) => {
  try {
    const payload = { pageSize: 3, pageNo: 1 };
    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default BlogPreview;
