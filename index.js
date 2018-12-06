const rightPanel = document.querySelector(".right-panel");
const scrollArrow = document.querySelector(".scroll-arrow");

function handleScroll(event) {
  console.log(
    rightPanel.scrollTop,
    rightPanel.clientHeight,
    rightPanel.scrollHeight,
    scrollArrow.style.bottom
  );
  scrollArrow.style.bottom = (0 - rightPanel.scrollTop).toString() + "px";
  if (
    rightPanel.scrollTop + rightPanel.clientHeight >=
    rightPanel.scrollHeight - 20
  ) {
    console.log("bottom");
    scrollArrow.classList.add("hidden");
  } else {
    scrollArrow.classList.remove("hidden");
  }
}
