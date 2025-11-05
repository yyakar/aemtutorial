import { createOptimizedPicture } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement("ul");
  [...block.children].forEach((row) => {
    const li = document.createElement("li");
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector("picture")) {
        div.className = "cards-card-image";
      } else {
        div.className = "cards-card-body";
      }
    });

    const bodies = li.querySelectorAll(".cards-card-body");
    const bodyCol = bodies[0] || null;
    const maybeCtaCol = bodies[1] || null;

    const buildCta = ({ href, label, sourceAnchor }) => {
      const a = sourceAnchor || document.createElement("a");
      if (!sourceAnchor) {
        a.href = href || "#";
        a.textContent = label || "Learn more";
      }
      a.classList.add("button", "card__btn");
      return a;
    };
    let ctaEl = null;
    if (maybeCtaCol) {
      const anchor = maybeCtaCol.querySelector("a[href]");
      if (anchor) {
        ctaEl = buildCta({ sourceAnchor: anchor });
      } else {
        const raw = (maybeCtaCol.textContent || "").trim();
        if (raw.includes("|")) {
          const [label, href] = raw.split("|").map((s) => s.trim());
          if (label && href) ctaEl = buildCta({ href, label });
        }
      }
    }

    if (ctaEl && bodyCol) {
      if (maybeCtaCol && ctaEl.parentElement !== maybeCtaCol) {
        const src =
          maybeCtaCol.querySelector("a[href]") || maybeCtaCol.firstElementChild;
        if (src) moveInstrumentation(src, ctaEl);
        maybeCtaCol.remove();
      }
      if (ctaEl.parentElement !== bodyCol) bodyCol.append(ctaEl);
    }

    ul.append(li);
  });
  ul.querySelectorAll("picture > img").forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { width: "750" },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector("img"));
    img.closest("picture").replaceWith(optimizedPic);
  });
  block.textContent = "";
  block.append(ul);
}
