export default function decorate(block) {
  let align =
    block.dataset.textAlign ||
    block.getAttribute("data-text-align") ||
    block.querySelector("[data-text-align]")?.getAttribute("data-text-align") ||
    block.querySelector('[data-aue-prop="textAlign"]')?.textContent?.trim();

  align = /^(left|center|right)$/.test(align) ? align : "left";
  block.classList.add(align);
}
