"use strict";

const tableBtn = document.querySelector(".table-btn");
const button = document.querySelector(".input-btn");
const errorElement = document.querySelector(".error");

tableBtn.addEventListener("click", sortList);
button.addEventListener("click", showHolidays);

showYears();
showCountries();

let isSortedChronologically = true;

function showYears() {
  const yearSelect = document.getElementById("year");
  const minYear = 2001;
  const maxYear = 2049;

  for (let year = minYear; year <= maxYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.text = year;
    yearSelect.appendChild(option);
    yearSelect.value = new Date().getFullYear();
  }
  yearSelect.firstElementChild.setAttribute("disabled", "true");
}

function showCountries() {
  fetch("https://date.nager.at/api/v3/AvailableCountries")
    .then((response) => {
      if (response.ok === false) {
        throw new Error(error);
      }
      return response.json();
    })
    .then((data) => {
      //console.log(data);
      let select = document.getElementById("country");
      select.innerHTML = "";

      let defaultOption = document.createElement("option");
      //defaultOption.value = "";
      defaultOption.text = "country";
      select.add(defaultOption);

      data.forEach(function (country) {
        let option = document.createElement("option");
        option.setAttribute("class", "option-country");
        option.setAttribute("value", country.countryCode);
        option.text = country.name;
        select.add(option);
        select.firstElementChild.value = "country";
      });
    })
    .catch((error) => {
      console.error(error);
      errorElement.style.display = "block";
      errorElement.innerHTML = "Error occurred";
    });
}

function showHolidays(event) {
  event.preventDefault();
  const resultElement = document.querySelector(".result");
  const selectYear = document.getElementById("year");
  const selectCountry = document.getElementById("country");
  const tableBody = document.querySelector("tbody");
  const defaultCountry = selectCountry.firstElementChild;

  tableBody.innerHTML = "";
  defaultCountry.setAttribute("disabled", "true");

  if (selectCountry.value === "country") {
    errorElement.style.display = "block";
    errorElement.style.textAlign = "center";
    errorElement.textContent = "Select country";
  } else {
    fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${selectYear.value}/${selectCountry.value}`
    )
      .then((response) => {
        console.log(response);
        if (response.ok === false) {
          throw new Error("error");
        }
        return response.json();
      })
      .then((data) => {
        const holidays = data;
        resultElement.style.display = "none";

        if (!holidays || holidays.length === 0) {
          errorElement.style.display = "block";
          errorElement.textContent = "Not available";
          selectYear.value = new Date().getFullYear();
          selectCountry.value = "country";
          selectYear.disabled = true;
          return;
        }
        if (holidays.length > 0) {
          holidays.forEach((holiday) => {
            errorElement.style.display = "none"; // to remove error message in case previous request had result "error"
            const newRow = document.createElement("tr");
            const dateCell = document.createElement("td");
            const isoDate = new Date(holiday.date);
            const holidayCell = document.createElement("td");

            resultElement.style.display = "block";
            dateCell.textContent = isoDate.toLocaleDateString("en-GB");
            holidayCell.textContent = holiday.name;

            newRow.appendChild(dateCell);
            newRow.appendChild(holidayCell);
            tableBody.appendChild(newRow);
          });
        }
      })
      .catch((error) => {
        errorElement.style.display = "block";

        errorElement.textContent = "Error occurred";
        console.log(error);
      });
  }
}

const countrySelect = document.getElementById("country");
const yearSelect = document.getElementById("year");
yearSelect.setAttribute("disabled", "");

countrySelect.addEventListener("change", function () {
  yearSelect.disabled = countrySelect.value === "";
});

function sortList(event) {
  event.preventDefault();
  isSortedChronologically = !isSortedChronologically;
  const tableBody = document.querySelector("tbody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const dateA = parseDate(a.cells[0].textContent);
    console.log(dateA);
    const dateB = parseDate(b.cells[0].textContent);
    return isSortedChronologically ? dateA - dateB : dateB - dateA;
  });

  tableBody.innerHTML = "";
  rows.forEach((row) => tableBody.appendChild(row));
}

function parseDate(dateString) {
  const parts = dateString.split("/");
  console.log(parts);
  const year = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[0], 10);

  return new Date(year, month, day);
}
