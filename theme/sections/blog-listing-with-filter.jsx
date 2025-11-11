import React, { useState, useEffect } from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import { useFPI } from "fdk-core/utils";
import styles from "../styles/sections/blog-listing-with-filter.less";
import Clock from "../assets/images/clockblack.png";
import Calender from "../assets/images/Calendarblack.png";

export function Component({ props }) {
  const fpi = useFPI();

  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState(["All"]);
  const [activeTag, setActiveTag] = useState("All");
  const [pageInfo, setPageInfo] = useState({ current: 1, has_next: false, size: 6 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blogs with optional filterQuery and page number
  const fetchBlogs = async (tag = "All", pageNo = 1, append = false) => {
    setIsLoading(true);
    try {
      const filterQuery = tag !== "All" ? { tags: tag } : {};
      const payload = {
        pageNo,
        pageSize: 6,
        ...filterQuery,
      };

      const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
        skipStoreUpdate: true,
      });

      const blogsData = response?.data?.applicationContent?.blogs || { items: [], page: {} };

      // Append or replace blogs depending on page number
      setBlogs((prev) => (append ? [...prev, ...blogsData.items] : blogsData.items));
      setPageInfo(blogsData.page || { current: 1, has_next: false, size: 6 });
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(activeTag, 1); 
  }, [activeTag]);

 useEffect(() => {
  if (blogs.length) {
    if (tags.length === 1) {
      const allTags = ["All"];
      blogs.forEach((blog) => {
        if (Array.isArray(blog.tags)) {
          blog.tags.forEach((t) => {
            if (!allTags.includes(t)) allTags.push(t);
          });
        }
      });
      setTags(allTags);
    }
  }
}, [blogs]);



  const handleTabClick = (tag) => {
    setActiveTag(tag);
    setPageInfo({ current: 1, has_next: false, size: 6 }); // reset pagination
  };

  const handleLoadMore = () => {
    if (!pageInfo.has_next) return;
    fetchBlogs(activeTag, pageInfo.current + 1, true);
  };

  const getEstimatedReadingTime = (blog) => {
    try {
      if (blog.reading_time) return blog.reading_time;

      const htmlContent = blog?.content?.[0]?.value || "";
      const text = htmlContent.replace(/<[^>]+>/g, " ");
      const words = text.trim().split(/\s+/).length;
      return Math.max(1, Math.ceil(words / 200));
    } catch {
      return 1;
    }
  };

  return (
    <div className={styles.blogListing}>
      {props?.title?.value && (
        <h2 className={styles.blogTitle}>{props.title.value}</h2>
      )}

      {/* Tabs */}
      <div className={styles.blogTabs}>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`${styles.blogTab} ${activeTag === tag ? styles.activeTab : ""}`}
            onClick={() => handleTabClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <>
          <div className={styles.blogGrid}>
            {blogs.map((blog) => (
              <a
                href={`/blog/${blog.slug}`}
                key={blog.id}
                className={styles.blogCard}
              >
                <h2 className={styles.blogCardTitle}>{blog.title}</h2>

                <div className={styles.blogImage}>
                  <img
                    src={
                      blog?.feature_image?.secure_url || props?.fallback_image.value
                    }
                    alt={blog.title}
                  />
                </div>

                <div className={styles.blogInfoContainer}>
                  <div className={styles.blogMeta}>
                    <span>
                      <img src={Calender} alt="calender" />
                      {new Date(blog.publish_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span>
                      <img src={Clock} alt="clock" />{" "}
                      {getEstimatedReadingTime(blog)} min read
                    </span>
                  </div>

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
              </a>
            ))}
          </div>

          {/* View More Button */}
          {pageInfo.has_next && (
            <div className={styles.loadMoreWrapper}>
              <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                View More Posts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Custom Blog Listing with Tabs & Pagination",
  props: [
    {
      id: "title",
      type: "text",
      value: "Blogs",
      label: "t:resource.common.heading",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "t:resource.sections.blog.fallback_image",
      default: "",
    },
  ],
};

Component.serverFetch = async ({ fpi, router }) => {
  try {
    const payload = { pageNo: 1, pageSize: 6, ...router?.filterQuery };
    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });
    return response?.data?.applicationContent?.blogs || { items: [] };
  } catch (error) {
    console.log("serverFetch error:", error);
  }
};

export default Component;
