import { createOptimizedPicture } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement("ul");
  [...block.children].forEach((row) => {
    const li = document.createElement("li");
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    // classify columns, removing empty placeholder divs
    [...li.children].forEach((div) => {
      // consider a div empty if it has no element children and only whitespace text
      const hasElementChildren = div.children.length > 0;
      const text = div.textContent || "";
      const hasVisibleText = text.trim() !== "";
      if (!hasElementChildren && !hasVisibleText) {
        div.remove();
        return;
      }
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
      // If taking an existing anchor, ensure its text content is preserved
      if (sourceAnchor) {
        // prefer existing textContent only if present
        if (!a.textContent || a.textContent.trim() === "") {
          a.textContent = label || "Learn more";
        }
        if (
          href &&
          (!a.getAttribute("href") || a.getAttribute("href") === "#")
        ) {
          a.href = href;
        }
      } else {
        a.href = href || "#";
        a.textContent = label || "Learn more";
      }
      a.classList.add("button", "card__btn");
      return a;
    };
    let ctaEl = null;

    if (!ctaEl && bodyCol) {
      const firstLink = bodyCol.querySelector("a[href]");
      if (firstLink) ctaEl = buildCta({ sourceAnchor: firstLink });
    }
    if (ctaEl && bodyCol) {
      if (maybeCtaCol && ctaEl.parentElement !== maybeCtaCol) {
        // try to find anchor or text in maybeCtaCol
        const srcAnchor = maybeCtaCol.querySelector("a[href]");
        const srcElement = srcAnchor || maybeCtaCol.firstElementChild;
        // if srcAnchor exists but ctaEl lacks href, copy it
        if (
          srcAnchor &&
          (!ctaEl.getAttribute("href") || ctaEl.getAttribute("href") === "#")
        ) {
          ctaEl.href = srcAnchor.href;
        }
        // if maybeCtaCol contains text nodes or elements with a label, ensure it's used
        const srcLabel =
          (srcElement &&
            srcElement.textContent &&
            srcElement.textContent.trim()) ||
          (maybeCtaCol.textContent && maybeCtaCol.textContent.trim());
        if (
          srcLabel &&
          (!ctaEl.textContent || ctaEl.textContent.trim() === "")
        ) {
          ctaEl.textContent = srcLabel;
        }
        // move instrumentation from the original element into the final anchor
        if (srcElement) moveInstrumentation(srcElement, ctaEl);
        // then remove the maybeCtaCol entirely
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
