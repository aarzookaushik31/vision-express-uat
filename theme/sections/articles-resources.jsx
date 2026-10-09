import React, { useEffect, useRef, useState } from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import { useFPI } from "fdk-core/utils";
import styles from "../styles/sections/articles-resources.less";
import Slider from "react-slick";
import blogPlaceholder from "../assets/images/placeholder.png";

// Tracks whether ONE element is on screen, so the entrance animation
// plays only when the section is actually visible.
function useInView(ref) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Older browsers: just show everything
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Element has entered the (slightly shrunk) viewport -> play
        if (entry.isIntersecting) {
          setInView(true);
          return;
        }

        const viewportBottom = entry.rootBounds
          ? entry.rootBounds.bottom
          : window.innerHeight;

        // Reset ONLY when the element is below the screen (user scrolled
        // up past it) so it replays on the next scroll down. If it left
        // through the top, keep it shown.
        if (entry.boundingClientRect.top > viewportBottom) {
          setInView(false);
        }
      },
      {
        threshold: 0.15, // at least 15% of the section must be visible
        rootMargin: "0px 0px -8% 0px", // and slightly inside the bottom edge
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

export function BlogPreview({ props }) {
  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({ fpi, props });
  const blogItems = blogs?.items?.slice(0, 8) || [];

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const getImageSrc = (blog) =>
    blog?.feature_image?.secure_url || props?.fallback_image?.value || blogPlaceholder;

  const handleImgError = (e) => {
    if (e.target.src !== blogPlaceholder) {
      e.target.src = blogPlaceholder;
    }
  };

  return (
    <div
      ref={sectionRef}
      className={`${styles.blogListingcards} ${inView ? styles.inView : ""}`}
    >
      {props?.title?.value && (
        <h2 className={styles.blogTitle}>
          {props.title.value}
          {props.highlightedText?.value && (
            <span className={styles.highlight}>{props.highlightedText.value}</span>
          )}
        </h2>
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
          <div className={styles.blogSlider}>
            <Slider {...sliderSettings}>
              {blogItems.map((blog) => (
                <div key={blog.id} className={styles.blogSlide}>
                  <a href={`/blog/${blog.slug}`} className={styles.blogCard}>
                    <div className={styles.blogImage}>
                      <img
                        src={getImageSrc(blog)}
                        onError={handleImgError}
                        alt={blog.title}
                      />

                      {blog?.tags?.length > 0 && (
                        <div className={styles.blogTags}>
                          {blog.tags.map((tag, idx) => (
                            <span key={idx} className={styles.blogTag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.blogOverlay}>
                        <h2 className={styles.blogCardTitle}>{blog.title}</h2>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </Slider>
          </div>

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
      id: "highlightedText",
      type: "text",
      label: "Highlighted Heading Text",
      default: "Perfect Fit",
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
    const payload = { pageSize: 4, pageNo: 1 };
    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default BlogPreview;