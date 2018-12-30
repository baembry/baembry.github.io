const backdrop = document.getElementById("backdrop");

const infoButtons = document.getElementsByClassName("info-button");
let infoDivs = document.getElementsByClassName("info");

let tourThumbnails = document.getElementsByClassName("tour-container");

let tours = document.getElementsByClassName("tour");

let currentTour;
let currentTourPhotos = [];
let currentIndex;

const leftButtons = document.querySelectorAll(".slideshow-button.left");

const rightButtons = document.querySelectorAll(".slideshow-button.right");
//===================DO STUFF=====================
//add onclick to each info button
for (let button of infoButtons) {
  const infoId = button.id.replace("-button", "");
  const infoDiv = document.getElementById(infoId);
  button.onclick = () => show(infoDiv, backdrop);
}

//add onclick to each tourthumbnail
for (let tourThumbnail of tourThumbnails) {
  tourThumbnail.onclick = () => {
    const tourId = tourThumbnail.id.replace("-button", "");
    tour = document.getElementById(tourId);
    initialize(tour);
  };
}

function initialize(tour) {
  currentIndex = 0;
  currentTour = tour;
  currentTourPhotos = currentTour.getElementsByClassName("tour-photo");
  show(currentTour, currentTourPhotos[currentIndex], backdrop);
}

backdrop.onclick = () => {
  hide(backdrop, ...infoDivs, ...tours, ...currentTourPhotos);
};

for (let button of leftButtons) {
  button.onclick = () => {
    slide("left");
  };
}

for (let button of rightButtons) {
  button.onclick = () => {
    slide("right");
  };
}
slideshow("header-image");

// ===================Main Slideshow=================
function slideshow(className) {
  const images = document.getElementsByClassName(className);
  var current = Math.floor(Math.random() * images.length);
  images[current].style.opacity = "1";
  var previous;
  function move() {
    previous = current;
    current++;
    if (current === images.length) {
      current = 0;
    }
    images[previous].style.opacity = "0";
    images[current].style.opacity = "1";

    setTimeout(move, 5000);
  }
  setTimeout(move, 5000);
}

// ======================Show/Hide/Flash=============

function flash(message) {
  let flashDiv = document.querySelector("#flash-message");
  let text = document.createTextNode(message);
  flashDiv.appendChild(text);
  show(flashDiv);
  setTimeout(() => {
    hide(flashDiv);
  }, 3500);
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

//===================Tour Slideshow Logic============

function slide(direction) {
  let previousIndex = currentIndex;
  if (direction === "right") {
    currentIndex++;
  }
  if (direction === "left") {
    currentIndex--;
  }
  if (currentIndex < 0) {
    currentIndex = currentTourPhotos.length - 1;
  }
  if (currentIndex === currentTourPhotos.length) {
    currentIndex = 0;
  }
  console.log("hiding ", previousIndex, currentTourPhotos[previousIndex]);
  console.log("showing ", currentTourPhotos[currentIndex]);
  hide(currentTourPhotos[previousIndex]);
  show(currentTourPhotos[currentIndex]);
}

// ================SUBMIT CONTACT FORM=============

async function submitContactForm(event) {
  event.preventDefault();
  const loader = document.querySelector(".loader");
  show(loader);

  const form = document.querySelector("form");
  const formData = new FormData(form);
  let reqBody = {
    emailTo: "",
    emailFrom: "",
    subject: "",
    message: ""
  };
  reqBody.emailTo = "pictureitsoldwaco@gmail.com";

  //make reqBody
  for (let pair of formData.entries()) {
    reqBody[pair[0]] = pair[1];
  }
  reqBody.subject = `New message from ${reqBody.emailFrom}`;
  try {
    let response = await fetch(
      "https://picture-it-sold.prod.with-datafire.io/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(reqBody)
      }
    );
    //let user know what happened
    if (response.status < 400) {
      flash("Thank you for your message. We will respond as soon as possible.");
    } else {
      flash(
        "Something went wrong. Please email Carol directly at pictureitsoldwaco@gmail.com."
      );
    }
    hide(loader);
    form.reset();
  } catch (error) {
    console.log(error);
  }
}

//===================scroll to element===============

function goTo(element) {
  let destination = document.querySelector(element);
  let yCoordinate = destination.offsetTop;
  if (window.innerWidth >= 450) {
    yCoordinate -= 70;
  }
  window.scrollTo({
    top: yCoordinate,
    behavior: "smooth"
  });
}
