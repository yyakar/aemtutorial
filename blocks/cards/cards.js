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
      const normalizedHref = href ? String(href).trim() : "";
      const normalizedLabel = label ? String(label).trim() : "";

      let srcAnchor = sourceAnchor;
      if (srcAnchor) {
        const sourceHref = srcAnchor.getAttribute("href") || "";
        const sourceText = (srcAnchor.textContent || "").trim();
        if (!sourceHref.trim() && !sourceText) {
          srcAnchor = null;
        }
      }

      if (!normalizedHref && !normalizedLabel && !srcAnchor) return null;

      const a = srcAnchor || document.createElement("a");
      if (normalizedHref) a.href = normalizedHref;
      if (normalizedLabel) a.textContent = normalizedLabel;
      a.classList.add("button", "card__btn");
      return a;
    };
    let ctaEl = null;

    if (bodyCol) {
      // try to find an anchor in bodyCol or a label text node
      const firstLink = bodyCol.querySelector("a[href]");
      const labelFromBody = firstLink
        ? (firstLink.textContent || "").trim()
        : null;

      // maybeCtaCol can contain the url and/or the label
      const maybeAnchor = maybeCtaCol
        ? maybeCtaCol.querySelector("a[href]")
        : null;
      const maybeText = maybeCtaCol ? maybeCtaCol.textContent.trim() : null;

      // prefer href from an explicit anchor in maybeCtaCol, fallback to firstLink href
      let href = null;
      if (maybeAnchor && maybeAnchor.href) {
        href = maybeAnchor.href;
      } else if (firstLink && firstLink.href) {
        href = firstLink.href;
      }

      const label = maybeText || labelFromBody || null;

      ctaEl = buildCta({ href, label, sourceAnchor: firstLink });
      if (ctaEl && maybeCtaCol && maybeCtaCol !== ctaEl.parentElement) {
        // copy any missing href/label from maybeCtaCol's anchor or text
        const srcAnchor = maybeAnchor || maybeCtaCol.firstElementChild;
        if (srcAnchor) moveInstrumentation(srcAnchor, ctaEl);

        if (
          !ctaEl.getAttribute("href") &&
          srcAnchor &&
          srcAnchor.getAttribute("href")
        ) {
          ctaEl.href = srcAnchor.getAttribute("href");
        }
        if (
          (!ctaEl.textContent || ctaEl.textContent.trim() === "") &&
          srcAnchor &&
          srcAnchor.textContent
        ) {
          ctaEl.textContent = srcAnchor.textContent.trim();
        }
        maybeCtaCol.remove();
      }

      if (ctaEl && ctaEl.parentElement !== bodyCol) bodyCol.append(ctaEl);
    }
    if (ctaEl && bodyCol) {
      if (maybeCtaCol && ctaEl.parentElement !== maybeCtaCol) {
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
