const modal = document.getElementById("helpModal");
const modalCover = document.getElementById("modal-cover");
const closeButton = document.getElementById("close-button");
const closeX = document.getElementById("modal-x");
const helpButton = document.getElementById("help-button");

function showModal() {
  const rect = helpButton.getBoundingClientRect();
  // 円の中心の移動はアニメーションさせない（初回は右上から動いてしまう）
  modalCover.style.transition = "none";
  modal.style.setProperty("--ox", `${rect.left + rect.width / 2}px`);
  modal.style.setProperty("--oy", `${rect.top + rect.height / 2}px`);
  modalCover.getBoundingClientRect();
  modalCover.style.transition = "";
  modal.classList.add("is-open");
}

// アニメーション後の非表示は CSS 側で行う
function hideModal() {
  modal.classList.remove("is-open");
}

helpButton.addEventListener('click', showModal);
closeButton.addEventListener('click', hideModal);
closeX.addEventListener('click', hideModal);
modalCover.addEventListener('click', hideModal);
