(() => {
  const SELECT_ID = "categorySelect";
  const BAR_ID = "mobileCategoryBar";

  function isMobile() {
    return window.matchMedia("(max-width: 560px)").matches;
  }

  function buildBar() {
    if (!isMobile()) return;

    const select = document.getElementById(SELECT_ID);
    const sectionHead = document.querySelector(".section-head");
    if (!select || !sectionHead) return;

    let bar = document.getElementById(BAR_ID);
    if (!bar) {
      bar = document.createElement("div");
      bar.id = BAR_ID;
      bar.className = "mobile-category-bar";
      sectionHead.parentNode.insertBefore(bar, sectionHead.nextSibling);
    }

    const options = [...select.options];
    const categories = options
      .filter(option => option.value !== "all")
      .map(option => ({ value: option.value, label: option.textContent.trim() }))
      .filter((item, index, list) => list.findIndex(x => x.value === item.value) === index);

    const visible = categories.slice(0, 5);
    const hasMore = categories.length > 5;
    bar.innerHTML = "";

    const addChip = (value, label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mobile-category-chip";
      button.dataset.value = value;
      button.textContent = label;
      button.addEventListener("click", () => {
        if (value === "__more__") {
          select.focus();
          select.click();
          return;
        }
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncActive();
      });
      bar.appendChild(button);
    };

    addChip("all", "All");
    visible.forEach(item => addChip(item.value, item.label));
    if (hasMore) addChip("__more__", "More⌄");

    syncActive();
  }

  function syncActive() {
    const select = document.getElementById(SELECT_ID);
    const bar = document.getElementById(BAR_ID);
    if (!select || !bar) return;

    bar.querySelectorAll(".mobile-category-chip").forEach(button => {
      button.classList.toggle("active", button.dataset.value === select.value);
    });
  }

  function start() {
    buildBar();

    const select = document.getElementById(SELECT_ID);
    if (select) {
      select.addEventListener("change", syncActive);
      const observer = new MutationObserver(buildBar);
      observer.observe(select, { childList: true });
    }

    const media = window.matchMedia("(max-width: 560px)");
    const onChange = () => {
      if (media.matches) buildBar();
      else document.getElementById(BAR_ID)?.remove();
    };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else media.addListener(onChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
