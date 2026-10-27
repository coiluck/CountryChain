const modal = document.getElementById("helpModal");
const modalCover = document.getElementById("modal-cover");
const closeButton = document.getElementById("close-button");
const helpButton = document.getElementById("help-button");

// モーダルを表示
function showModal() {
  modal.classList.remove("fade-out");
  modal.classList.add("fade-in");
  modal.style.display = "block";
}

// モーダルを非表示
function hideModal() {
  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");
  setTimeout(function() { 
    modal.style.display = "none"; 
  }, 500);
}

// イベントリスナーの追加
helpButton.addEventListener('click', showModal);
closeButton.addEventListener('click', hideModal);
modalCover.addEventListener('click', hideModal);