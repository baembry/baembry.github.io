var appointmentData = {
  dayOfJob: "",
  photographer: "",
  startTime: "",
  endTime: "",
  description: "",
  summary: "",
  location: "",
  emailTo: ""
};

const config = {
  baseUrl: "https://picture-it-sold.prod.with-datafire.io",
  //days of the week starts with Sunday === 0;
  photographers: {
    carol: {
      name: "Carol Embry",
      appointmentTimes: ["09:15:00", "10:45:00", "13:15:00"],
      canDoTwilights: true,
      daysUnavailable: [], //0 is Sunday, 1 is Monday, etc.
      products: [],
      calendarId: "pictureitsoldwaco@gmail.com",
      email: "pictureitsoldwaco@gmail.com",
      events: [],
      next: "jana"
    },
    mark: {
      name: "Mark Embry",
      appointmentTimes: ["09:15:00", "10:45:00", "13:15:00", "15:45:00"],
      canDoTwilights: false,
      daysUnavailable: [1, 2, 3, 4, 5],
      products: [],
      calendarId: "npsrv5a3nhr1fpn1d2fthukrks@group.calendar.google.com",
      email: "pictureitsoldwaco@gmail.com",
      events: [],
      next: false
    },
    jana: {
      name: "Jana Lumley",
      appointmentTimes: ["09:00:00", "10:30:00", "13:00:00"],
      canDoTwilights: true,
      daysUnavailable: [],
      products: [0],
      calendarId: "vlbpi6bf4mbo09b9plje30au6o@group.calendar.google.com",
      email: "pictureitsoldwaco@gmail.com",
      events: [],
      next: false
    }
  }
};

let tomorrow = new Date();
//show cal for tomorrow, since you can't make an appointment for today
tomorrow.setDate(tomorrow.getDate() + 1);
let monthToShow = tomorrow.getMonth();
let yearToShow = tomorrow.getFullYear();
let twilightInMs;
init();

//page set up====================================

async function init() {
  let loader = document.querySelector(".loader");
  show(loader);
  await getEvents();
  hide(loader);
}

async function getEvents() {
  console.log("getting events...");
  const params = {
    method: "GET"
  };
  const photographers = Object.keys(config.photographers);
  try {
    for (let photographer of photographers) {
      let res = await fetch(
        "http://picture-it-sold.prod.with-datafire.io/events/" + photographer,
        params
      );
      let appointmentData = await res.json();
      console.log("appointment data for " + photographer, appointmentData);
      config.photographers[photographer].events = appointmentData.items;
    }
  } catch (error) {
    console.log(error);
  }
  console.log("done getting events.");
}

function populatePhotographerSelect() {
  //called in handleDateSelect
  let photographerSelector = document.querySelector("#photographer-selector");

  //clear photographer selector
  photographerSelector.innerHTML = "";

  //add blank option to force choice
  let option = document.createElement("option");
  let text = document.createTextNode("");
  option.appendChild(text);
  option.setAttribute("value", null);
  option.setAttribute("selected", true);
  photographerSelector.appendChild(option);

  //if product === drone, set option to mark
  if (appointmentData.description === "drone") {
    let option = document.createElement("option");
    let text = document.createTextNode("Mark Embry");
    option.appendChild(text);
    option.setAttribute("value", "mark");
    photographerSelector.appendChild(option);
  } else {
    //add option "any" for any available photographer
    option = document.createElement("option");
    text = document.createTextNode("Any Available");
    option.appendChild(text);
    option.setAttribute("value", "any");
    photographerSelector.appendChild(option);

    //add photographer to options if available on selected day
    const photographers = Object.keys(config.photographers);
    const dayOfWeek = new Date(appointmentData.dayOfJob).getDay();

    photographers.forEach(photographer => {
      let photographerObj = config.photographers[photographer];
      if (
        !photographerObj.daysUnavailable.includes(dayOfWeek) &&
        photographer !== "mark"
      ) {
        option = document.createElement("option");
        text = document.createTextNode(photographerObj.name);
        option.appendChild(text);
        option.setAttribute("value", photographer);
        photographerSelector.appendChild(option);
      }
    });
  }
}

function appendOption(selector, text, value) {
  const option = document.createElement("option");
  const text = document.createTextNode(text);
  option.appendChild(text);
  option.setAttribute("value", value);
  selector.appendChild(option);
}

//========================HANDLERS====================

function handleSelectProduct(event) {
  //reset calendar
  const selectedDate = document.querySelector(".date.selected");
  if (selectedDate) {
    selectedDate.classList.remove("selected");
  }

  //reset photographer selector
  const photographerSelector = document.querySelector("#photographer-selector");
  photographerSelector.innerHTML = "";

  //reset time selector
  const timeSelector = document.querySelector("#time-selector");
  timeSelector.innerHTML = "";

  //remove selected class from all product divs
  let products = document.getElementsByClassName("product");
  for (let i = 0; i < products.length; i++) {
    products[i].classList.remove("product-selected");
  }
  //get outer div, if outer div is not target
  let outerDiv;
  if (event.target.className !== "product") {
    outerDiv = event.target.closest(".product");
  } else {
    outerDiv = event.target;
  }

  //find radio button
  const radio = outerDiv.querySelector("input");
  radio.checked = true;

  //add product description to appointmentData
  appointmentData.description = radio.value;
  console.log(appointmentData);

  //add selected class to outerdiv
  outerDiv.classList.add("product-selected");

  //make dates available based on selection
  makeDatesAvailable();
  scrollToStep("2");
}

function makeDatesAvailable() {
  //add click listener to weekday squares later than today
  let dates = document.getElementsByClassName("date");
  if (!appointmentData.description) {
    return null;
  }
  //make dates available for days past today
  for (let i = 0; i < dates.length; i++) {
    let date = new Date(dates[i].id);
    if (dates[i].id && date.getTime() > new Date().getTime()) {
      dates[i].onclick = handleDateSelect;
      dates[i].classList.add("availableDay");
    }
    //make cal dates unavailable if product === drone and mark is unavailable
    if (appointmentData.description === "drone" && markIsUnavailableOn(date)) {
      dates[i].onclick = null;
      dates[i].classList.remove("availableDay");
    }
  }
}

function markIsUnavailableOn(date) {
  const dayOfWeek = date.getDay();
  const daysUnavailable = config.photographers.mark.daysUnavailable;
  if (daysUnavailable.includes(dayOfWeek)) {
    return true;
  } else {
    return false;
  }
}

function handleMonthIncrement(event) {
  //stop form from submitting
  event.preventDefault();
  appointmentData.dayOfJob = "";
  monthToShow++;

  if (monthToShow === 12) {
    monthToShow = 0;
    yearToShow++;
  }
  console.log("month ", monthToShow, " year ", yearToShow);
  makeCalendar(monthToShow, yearToShow);
  makeDatesAvailable();
}

function handleMonthDecrement() {
  //stop form from submitting
  event.preventDefault();
  appointmentData.dayOfJob = "";
  monthToShow--;
  if (monthToShow < 0) {
    monthToShow = 11;
    yearToShow--;
  }
  makeCalendar(monthToShow, yearToShow);
  makeDatesAvailable();
}

function handleDateSelect(event) {
  //remove highlight from previous choice
  if (appointmentData.dayOfJob) {
    let previousSelection = document.getElementById(appointmentData.dayOfJob);
    previousSelection.classList.remove("selected");
  }

  //set appointment data
  appointmentData.dayOfJob = event.currentTarget.id;

  //add style to selected date;
  event.currentTarget.classList.add("selected");
  console.log(appointmentData);
  populatePhotographerSelect();
  scrollToStep("3");
}

async function handlePhotographerSelect(e) {
  console.log("handling photographer select");
  appointmentData[e.currentTarget.name] = e.currentTarget.value;
  console.log(appointmentData);
  await getTwilightTime();
  populateTimeSelector();
  scrollToStep("4");
}

function handleTimeSelect(event) {
  //this isn't used elsewhere, but nice to have I guess
  appointmentData.startTime = event.currentTarget.value;
  console.log("from handleTimeSelect ", appointmentData);
  if (appointmentData.description === "drone") {
    //disable add-ons
    const addOns = document.querySelectorAll(".add-on-input");
    for (let addOn of addOns) {
      addOn.setAttribute("disabled", true);
    }
    const addOnDiv = document.querySelector(".add-ons");
    addOnDiv.classList.add("disabled");
    scrollToStep("6");
  } else {
    scrollToStep("5");
  }
}

function scrollToStep(n) {
  let step = document.getElementById("step" + n);
  step.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validatePassword(event) {
  if (event.currentTarget.value === "temp") {
    let submitButton = document.getElementById("submit");
    submitButton.classList.remove("disabled");
    submitButton.removeAttribute("disabled");
  }
}

//====================DOM MANIPULATION/CALENDAR==========
//appointment times will be set by the user, so they should be set to UTC, time zone Z. To set the right time, need to subtract the time zone offset, which is either -5 or -6, depending on daylight savings.

//this is used to determine daylight savings time
function getNthDayOfMonth(n, targetDay, month, year) {
  //get 1st of Month
  let dayOfMonth = new Date(year + "/" + month + "/" + "01 02:00:00 GMT-5"); //this leaves a 1 hour gap on sunday morning before DST ends

  let nthDayCounter = 0;
  if (dayOfMonth.getDay() === targetDay) {
    nthDayCounter++;
  }
  while (nthDayCounter < n) {
    dayOfMonth.setDate(dayOfMonth.getDate() + 1);
    if (dayOfMonth.getDay() === targetDay) {
      nthDayCounter++;
    }
  }
  return dayOfMonth;
}

function getWacoOffset(date) {
  //if date is greater than the second Sunday of March of the year of the date, and less than the first Sunday of November, offset = -5, otherwise -6
  console.log("the date selected is ", date);
  //get second sunday of March
  const daylightSavingsStart = getNthDayOfMonth(2, 0, 3, date.getFullYear());
  //get first Sunday of November
  const daylightSavingsEnd = getNthDayOfMonth(1, 0, 11, date.getFullYear());
  if (
    date.getTime() > daylightSavingsStart.getTime() &&
    date.getTime() < daylightSavingsEnd.getTime()
  ) {
    return "GMT-5";
  } else {
    return "GMT-6";
  }
}

function makeCalendar(monthIndex = monthToShow, year = yearToShow) {
  let calGrid = document.querySelector(".dates");
  calGrid.innerHTML = "";
  let square;
  let day = new Date();

  let date = 1;
  let dateText;

  day.setFullYear(year, monthIndex, date);

  //add squares (6X7) to cal grid
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      square = document.createElement("div");
      square.setAttribute("class", "date");

      //add numbers to squares
      if (j === day.getDay() && day.getMonth() === monthIndex) {
        dateText = document.createTextNode(day.getDate());
        square.appendChild(dateText);
        square.setAttribute("id", day.toDateString());
        date++;
        day.setDate(date);
      }
      calGrid.appendChild(square);
    }
  }

  //set month title
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  let monthElement = document.getElementsByClassName("month")[0];
  monthElement.innerHTML = "";
  let monthText = document.createTextNode(months[monthIndex] + " " + year);
  monthElement.appendChild(monthText);
}

//===================================================
async function getAvailableTimes(photographer) {
  console.log("the photographer is ", photographer);
  if (photographer === false) {
    flash("No photographers are available that day. Please pick another day.");
    return null;
  }
  const dayOfJob = new Date(appointmentData.dayOfJob).getTime();
  const nextDay = dayOfJob + 1000 * 60 * 60 * 24;
  const timezoneOffsetWaco = getWacoOffset(new Date(dayOfJob));

  let photographerObj;

  if (photographer === "any") {
    photographerObj = config.photographers.carol;
  } else {
    photographerObj = config.photographers[photographer];
  }
  console.log("the photographer object is ", photographerObj);

  appointmentData.calendarId = photographerObj.calendarId;
  appointmentData.emailTo = photographerObj.email;

  const events = photographerObj.events;

  //get event times in ms, for comparison
  let eventTimes = events.map(event => {
    return {
      start: new Date(event.start.dateTime).getTime(),
      end: new Date(event.end.dateTime).getTime()
    };
  });

  //filter event times for selected day
  eventTimes = eventTimes.filter(
    time => time.start > dayOfJob && time.start < nextDay
  );
  console.log("event times for " + photographer, eventTimes);

  let availableTimes;
  if (appointmentData.description === "twilights") {
    availableTimes = ["Twilight"];
  } else {
    availableTimes = [...photographerObj.appointmentTimes];
  }

  //map to an object: {localTimeString: "", timeInMs: ""}
  availableTimes = availableTimes.map(time => {
    let timeInMs;
    if (time === "Twilight") {
      timeInMs = twilightInMs;
    } else {
      timeInMs = new Date(
        appointmentData.dayOfJob + " " + time + " " + timezoneOffsetWaco
      ).getTime();
    }
    return { localTimeString: time, timeInMs };
  });

  //filter out times that overlap existing events
  availableTimes = availableTimes.filter(time => {
    for (let i = 0; i < eventTimes.length; i++) {
      //return false if appt time overlaps any event
      if (
        time.timeInMs >= eventTimes[i].start &&
        time.timeInMs <= eventTimes[i].end
      ) {
        return false;
      }
    }
    //otherwise return true
    return true;
  });

  if (availableTimes.length > 0) {
    return availableTimes;
  }
  if (appointmentData.photographer !== "any") {
    flash(
      config.photographers[appointmentData.photographer].name +
        " is not available that day. Please pick another day or another photographer."
    );
    return null;
  }
  if (photographerObj.next) {
    return getAvailableTimes(photographerObj.next);
  } else {
    flash("No photographers are available that day. Please pick another day.");
    return null;
  }
}

async function getTwilightTime() {
  //called when photographer is selected
  //twilightInMs is a global variable
  console.log("getting twilight time...");
  const sunsetResponse = await fetch(
    "https://api.sunrise-sunset.org/json?lat=31.5493&lng=-97.1467&date=" +
      appointmentData.dayOfJob +
      "&formatted=0"
  );
  const sunsetData = await sunsetResponse.json();
  //twilight is 30 minutes before sunset
  twilightInMs = new Date(sunsetData.results.sunset).getTime() - 1000 * 60 * 30;
  console.log("twilight is ", twilightInMs);
}

async function populateTimeSelector() {
  console.log("getting available times for photographer");
  let availableTimes = await getAvailableTimes(appointmentData.photographer);
  console.log("available times from populate fn ", availableTimes);
  if (!availableTimes) {
    scrollToStep("3");
    return;
  }

  const timeSelector = document.getElementById("time-selector");

  //remove existing children of timeSelector
  timeSelector.innerHTML = "";

  //make blank option to force a choice
  let blankOption = document.createElement("option");
  timeSelector.append(blankOption);

  //populate time selector
  for (const time of availableTimes) {
    let option = document.createElement("option");
    //set value of option to date object
    option.setAttribute("value", time.timeInMs);

    //set id on twilight for interaction with product selector
    if (time.localTimeString === "Twilight") {
      option.setAttribute("id", "twilight");
    }
    const optionText = document.createTextNode(time.localTimeString);
    option.appendChild(optionText);
    timeSelector.appendChild(option);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const loader = document.querySelector(".loader");
  show(loader);

  let data = {
    calendarId: "",
    email: "",
    summary: "",
    location: "",
    startTime: "",
    endTime: "",
    description: "",
    addOns: "",
    emailTo: ""
  };

  let startTimeInMs = parseInt(appointmentData.startTime);
  //populate data object
  data.calendarId = appointmentData.calendarId;
  data.email = document.querySelector("#email").value;
  data.summary = document.querySelector('input[name="product"]:checked').value;
  data.location = document.querySelector("#address").value;
  data.startTime = new Date(startTimeInMs).toISOString();
  data.endTime = new Date(startTimeInMs + 1000 * 60 * 60 * 2).toISOString();
  data.emailTo = appointmentData.emailTo;

  //make description
  const form = document.querySelector("form");
  const formData = new FormData(form);

  for (let pair of formData.entries()) {
    data.description += `<h3>${pair[0]}</h3><p>${pair[1]}</p>`;
  }
  console.log("data to send ", data);

  try {
    let calendarResponse = await fetch(config.baseUrl + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(data)
    });
    let emailResponse = await sendEmail(data);

    hide(loader);
    if (calendarResponse < 400 || emailResponse < 400) {
      flash(
        "Sorry. Something went wrong with creating your event. Please call Carol directly to make your appointment."
      );
    } else {
      flash(
        "Thank you for making an appointment. We will email you a confirmation as soon as possible."
      );
    }
    setTimeout(() => {
      form.reset();
      window.location.assign("http://127.0.0.1:5500/assets/checklist.pdf");
    }, 4000);
  } catch (error) {
    flash(error.message);
  }
}

//=======================HTTP===================
async function sendEmail(data) {
  let email = {};
  email.subject = `New appointment from ${data.email}`;
  email.emailFrom = data.email;
  email.emailTo = data.emailTo;
  email.message = data.description;

  let response = await fetch(config.baseUrl + "/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(email)
  });
  return response;
}

//========================FLASH=================

function flash(message, callback = () => null) {
  let flashDiv = document.querySelector("#flash-message");
  let text = document.createTextNode(message);
  flashDiv.appendChild(text);
  show(flashDiv);
  setTimeout(() => {
    flashDiv.textContent = "";
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

//function calls==========================
makeCalendar(monthToShow, yearToShow);
