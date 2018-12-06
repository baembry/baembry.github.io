export default function flash(message) {
  let messageDiv = document.querySelector("#flash-message div");
  let text = document.createTextNode(message);
  messageDiv.appendChild(text);
  let flashDiv = document.querySelector("#flash-message");
  show(flashDiv);
  setTimeout(() => {
    hide(flashDiv);
  }, 4000);
}

function show() {
  for (let argument of arguments) {
    argument.classList.remove("hidden");
  }
}

function hide() {
  for (let argument of arguments) {
    argument.classList.add("hidden");
  }
}
