import React from "react";
import styles from "../styles/sections/ve-care-contact.less";
import CardBg from "../assets/images/ve-care-contact-bg.png";

export function Component(input = {}) {
  const props = (input && (input.props ?? input)) || {};
  const blocks = (input && input.blocks) || [];

  const { heading, subheading, description } = props || {};

  return (
    <section className={styles.contactSection}>
      <div className={styles.container}>
        <div
          className={styles.card}
          style={{
            backgroundImage: `url(${CardBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className={styles.cardOverlay} />

          <div className={styles.textCol}>
            {heading?.value && (
              <h2 className={styles.heading}>{heading.value}</h2>
            )}
            {subheading?.value && (
              <p className={styles.subheading}>{subheading.value}</p>
            )}
            {description?.value && (
              <p className={styles.description}>{description.value}</p>
            )}
          </div>

          {blocks.length > 0 && (
            <div className={styles.actionsCol}>
              {blocks.map((block, index) => {
                const { title, actionDescription, link } = block.props || {};

                const CardTag = link?.value ? "a" : "div";
                const cardProps = link?.value ? { href: link.value } : {};

                return (
                  <CardTag
                    className={styles.actionCard}
                    key={block.id || index}
                    {...cardProps}
                  >
                    <span className={styles.actionIcon}>
                      <ActionIcon title={title?.value} />
                    </span>
                    <span className={styles.actionText}>
                      {title?.value && (
                        <span className={styles.actionTitle}>
                          {title.value}
                        </span>
                      )}
                      {actionDescription?.value && (
                        <span className={styles.actionDescription}>
                          {actionDescription.value}
                        </span>
                      )}
                    </span>
                  </CardTag>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Picks an icon by matching keywords in the card title, since the Fynd
// editor isn't rendering the choice-field dropdown reliably.
function ActionIcon({ title }) {
  const normalized = (title || "").toLowerCase();

  if (normalized.includes("contact") || normalized.includes("call")) {
    return (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.86393 22.6009C10.2174 26.6096 14.2543 29.7659 18.8619 31.9992C20.6161 32.8305 22.9621 33.8168 25.5759 33.9859C25.7379 33.993 25.8929 34 26.055 34C27.8092 34 29.2183 33.3941 30.3666 32.1471C30.3737 32.1401 30.3878 32.126 30.3948 32.1119C30.8034 31.6187 31.2684 31.1749 31.7545 30.7029C32.0856 30.3858 32.4238 30.0547 32.7479 29.7165C34.2485 28.1525 34.2485 26.1658 32.7338 24.6511L28.4996 20.4169C27.781 19.6701 26.9215 19.2756 26.0198 19.2756C25.118 19.2756 24.2514 19.6701 23.5117 20.4099L20.9895 22.932C20.757 22.7982 20.5175 22.6784 20.292 22.5657C20.0102 22.4248 19.7495 22.2909 19.5171 22.143C17.2203 20.6846 15.135 18.7824 13.1412 16.3378C12.1337 15.0626 11.4574 13.9917 10.9854 12.8997C11.6476 12.3009 12.2676 11.6739 12.8664 11.0609C13.0778 10.8425 13.2962 10.6241 13.5146 10.4057C14.2754 9.64484 14.6841 8.76419 14.6841 7.86946C14.6841 6.97472 14.2825 6.09407 13.5146 5.3332L11.4151 3.23373C11.1685 2.98715 10.936 2.74762 10.6965 2.50104C10.2315 2.02196 9.7454 1.5288 9.26633 1.08496C8.54068 0.373394 7.68821 0 6.78643 0C5.89169 0 5.03218 0.373394 4.27835 1.092L1.64345 3.7269C0.685312 4.68504 0.142833 5.84749 0.0301105 7.19312C-0.103748 8.87692 0.20624 10.6664 1.00939 12.8293C2.24229 16.1757 4.10222 19.2826 6.86393 22.6009ZM1.74913 7.34107C1.83367 6.40406 2.19298 5.62205 2.86931 4.94571L5.49012 2.32491C5.89874 1.93038 6.34963 1.72607 6.78643 1.72607C7.21619 1.72607 7.65299 1.93038 8.05456 2.339C8.52659 2.7758 8.97043 3.23373 9.44951 3.71985C9.68904 3.96643 9.93562 4.21301 10.1822 4.46664L12.2817 6.5661C12.7185 7.0029 12.9439 7.44675 12.9439 7.88355C12.9439 8.32035 12.7185 8.76419 12.2817 9.201C12.0633 9.4194 11.8449 9.64484 11.6265 9.86324C10.9713 10.5255 10.3583 11.1525 9.682 11.7513C9.66791 11.7654 9.66086 11.7725 9.64677 11.7866C9.06202 12.3713 9.15361 12.9279 9.29451 13.3506C9.30156 13.3717 9.3086 13.3858 9.31565 13.407C9.85813 14.7103 10.612 15.9503 11.7885 17.4298C13.9021 20.0365 16.1283 22.0584 18.58 23.6154C18.883 23.8127 19.2071 23.9677 19.51 24.1227C19.7918 24.2636 20.0525 24.3974 20.285 24.5454C20.3132 24.5595 20.3343 24.5736 20.3625 24.5877C20.595 24.7074 20.8204 24.7638 21.0459 24.7638C21.6095 24.7638 21.9758 24.4045 22.0956 24.2847L24.7305 21.6498C25.1391 21.2412 25.583 21.0228 26.0198 21.0228C26.5552 21.0228 26.992 21.3539 27.2667 21.6498L31.515 25.891C32.3604 26.7364 32.3534 27.6523 31.4938 28.547C31.198 28.8641 30.888 29.167 30.5568 29.484C30.0637 29.9631 29.5494 30.4563 29.0844 31.0128C28.2742 31.8864 27.309 32.2951 26.062 32.2951C25.9423 32.2951 25.8154 32.288 25.6957 32.281C23.3849 32.133 21.2361 31.2312 19.6227 30.4633C15.2406 28.3427 11.394 25.3344 8.20251 21.516C5.57466 18.3527 3.80632 15.4078 2.63682 12.2516C1.91117 10.3141 1.63641 8.75715 1.74913 7.34107Z" fill="white"/>
</svg>
    );
  }

  // Default: location pin (covers "store", "location", or any unmatched title)
  return (
<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.3439 25.1071C29.3876 18.7619 28.8793 19.5535 28.9958 19.3881C30.468 17.3116 31.2461 14.8676 31.2461 12.3203C31.2461 5.56492 25.7642 0 19 0C12.2578 0 6.75391 5.55394 6.75391 12.3203C6.75391 14.866 7.54834 17.3739 9.06879 19.4784L12.6559 25.1072C8.82068 25.6965 2.30078 27.4529 2.30078 31.3203C2.30078 32.7301 3.22095 34.7392 7.6046 36.3048C10.6655 37.3979 14.7125 38 19 38C27.0175 38 35.6992 35.7384 35.6992 31.3203C35.6992 27.4523 29.187 25.6977 25.3439 25.1071ZM10.9286 18.2537C10.9164 18.2346 10.9036 18.2159 10.8903 18.1975C9.62506 16.4569 8.98047 14.3941 8.98047 12.3203C8.98047 6.75257 13.4637 2.22656 19 2.22656C24.5248 2.22656 29.0195 6.75457 29.0195 12.3203C29.0195 14.3974 28.3871 16.3902 27.1903 18.085C27.0831 18.2264 27.6426 17.3572 19 30.9187L10.9286 18.2537ZM19 35.7734C10.2426 35.7734 4.52734 33.1993 4.52734 31.3203C4.52734 30.0574 7.46403 27.9808 13.9715 27.1714L18.0611 33.5886C18.2655 33.9094 18.6196 34.1035 18.9999 34.1035C19.3803 34.1035 19.7344 33.9093 19.9387 33.5886L24.0282 27.1714C30.5359 27.9808 33.4727 30.0574 33.4727 31.3203C33.4727 33.1833 27.8088 35.7734 19 35.7734Z" fill="white"/>
<path d="M19 6.75391C15.9307 6.75391 13.4336 9.251 13.4336 12.3203C13.4336 15.3896 15.9307 17.8867 19 17.8867C22.0693 17.8867 24.5664 15.3896 24.5664 12.3203C24.5664 9.251 22.0693 6.75391 19 6.75391ZM19 15.6602C17.1584 15.6602 15.6602 14.1619 15.6602 12.3203C15.6602 10.4787 17.1584 8.98047 19 8.98047C20.8416 8.98047 22.3398 10.4787 22.3398 12.3203C22.3398 14.1619 20.8416 15.6602 19 15.6602Z" fill="white"/>
</svg>

  );
}

Component.displayName = "VeCareContact";
export default Component;

export const settings = {
  label: "Ve-Care Contact CTA",
  props: [
    {
      id: "heading",
      type: "text",
      label: "Heading",
      default: "Still Have A Question?"
    },
    {
      id: "subheading",
      type: "text",
      label: "Subheading",
      default: "We're Here To Help"
    },
    {
      id: "description",
      type: "text",
      label: "Description",
      default: "Visit Your Nearest Vision Express Store."
    }
  ],
  blocks: [
    {
      type: "contact_action",
      name: "Action Card",
      props: [
        {
          id: "title",
          type: "text",
          label: "Title",
          default: "Find A Store"
        },
        {
          id: "actionDescription",
          type: "text",
          label: "Description",
          default: "Locate your nearest Vision Express store."
        },
        {
          id: "link",
          type: "url",
          label: "Link URL"
        }
      ]
    }
  ],
  blockLimit: 4
};

Component.settings = settings;