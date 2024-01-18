"use strict";

const resultElement = document.querySelector(".result");
const inputStart = document.querySelector("#start-date");
const inputEnd = document.querySelector("#end-date");
const btnCalculation = document.querySelector(".calc-btn");
const btnClearingTable = document.getElementById("clear-btn");
const tableElement = document.querySelector(".table");
const tableRowCounter = document.querySelector(".row-counter");
const tableBody = document.querySelector("tbody");
const formatAdd = document.getElementById("format-add");
const formatShow = document.getElementById("format-show");
const formatSelect = document.querySelector("#format-select");

document.addEventListener("DOMContentLoaded", renderTableRows);
btnCalculation.addEventListener("click", getData);
btnClearingTable.addEventListener("click", clearTable);
inputStart.addEventListener("input", setStartAndEndDate);
inputEnd.addEventListener("input", setStartAndEndDate);
formatAdd.addEventListener("change", handleSelectAdd);
formatAdd.addEventListener("mouseout", (event) => {
  event.target.style.backgroundColor = "";
});

function handleSelectAdd(event) {
  //console.log(event.target.value);
  const startDate = new Date(inputStart.value);
  const endDate = new Date(inputEnd.value);

  if (inputStart.disabled === true) {
    inputEnd.disabled = true;
  } else if (!startDate || isNaN(startDate.getTime())) {
    const todayDate = new Date();
    inputStart.value = todayDate.toISOString().slice(0, 10);
    setEndDateFromStartDate(todayDate, event.target.value);
    inputEnd.disabled = false;
  } else if (!endDate || isNaN(endDate.getTime())) {
    setEndDateFromStartDate(startDate, event.target.value);
  } else {
    setEndDateFromStartDate(endDate, event.target.value);
  }
}

function setEndDateFromStartDate(startDate, addValue) {
  const endDate = new Date(
    startDate.getTime() + addValue * 1000 * 60 * 60 * 24
  );

  inputEnd.value = endDate.toISOString().slice(0, 10);
  setStartAndEndDate();
}

function setStartAndEndDate() {
  resultElement.innerHTML = "";
  const startDatePlusOneDay = new Date(inputStart.value);
  const endDateMinusOneDay = new Date(inputEnd.value);

  startDatePlusOneDay.setDate(startDatePlusOneDay.getDate() + 1);
  endDateMinusOneDay.setDate(endDateMinusOneDay.getDate() - 1);

  if (!inputEnd.value) {
    resultElement.innerHTML = "Select End Date";
    inputEnd.removeAttribute("disabled");

    inputEnd.min = startDatePlusOneDay.toISOString().split("T")[0];
    inputStart.max = endDateMinusOneDay.toISOString().split("T")[0];
  } else if (inputEnd.value) {
    inputStart.max = endDateMinusOneDay.toISOString().split("T")[0];
    inputEnd.min = startDatePlusOneDay.toISOString().split("T")[0];
  }
}

function calculateDifference(startDate, endDate, show) {
  const isWeekdays = formatSelect.value === "Weekdays";
  const isWeekends = formatSelect.value === "Weekends";

  let timeDifference = endDate.getTime() - startDate.getTime();
  let weekdaysCount = 0;
  let weekendsCount = 0;

  if (isWeekdays || isWeekends) {
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const dayOfWeek = currentDate.getDay();

      if (isWeekdays && dayOfWeek >= 1 && dayOfWeek <= 5) {
        weekdaysCount++;
      } else if (isWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        weekendsCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1); //to provide iteration of loop
    }
  }

  if (isWeekdays) {
    timeDifference = weekdaysCount * 24 * 60 * 60 * 1000;
  } else if (isWeekends) {
    timeDifference = weekendsCount * 24 * 60 * 60 * 1000;
  }

  if (show === "Days" || show === "Show") {
    return {
      unit: "day",
      difference: (timeDifference / (1000 * 60 * 60 * 24)).toFixed(0),
    };
  } else if (show === "Hours") {
    return {
      unit: "hour",
      difference: (timeDifference / (1000 * 60 * 60)).toFixed(0),
    };
  } else if (show === "Minutes") {
    return {
      unit: "minute",
      difference: (timeDifference / (1000 * 60)).toFixed(0),
    };
  } else {
    return {
      unit: "second",
      difference: (timeDifference / 1000).toFixed(0),
    };
  }
}

function updateTable(startDate, endDate, result, unit) {
  const tableBody = document.querySelector("tbody");
  const newRow = document.createElement("tr");
  tableElement.style.display = "block";

  if (resultElement.textContent === "Clear Result List") {
    return;
  }

  if (tableBody.querySelectorAll("tr").length >= 10) {
    resultElement.innerHTML = "Clear Result List";
    inputStart.disabled = "true";
    inputEnd.disabled = "true";
    inputStart.value = "dd/mm/yyyy";
    inputEnd.value = "dd/mm/yyyy";
  }

  const startDateCell = document.createElement("td");
  const endDateCell = document.createElement("td");
  const resultCell = document.createElement("td");

  tableBody.appendChild(newRow);
  newRow.appendChild(startDateCell);
  newRow.appendChild(endDateCell);
  newRow.appendChild(resultCell);

  tableRowCounter.textContent = tableBody.querySelectorAll("tr").length;

  startDateCell.innerHTML = startDate.toLocaleDateString("en-GB");
  endDateCell.innerHTML = endDate.toLocaleDateString("en-GB");

  if (result <= 1) {
    resultCell.innerHTML = `${result} ${unit}`;
    resultElement.innerHTML = `${result} ${unit}`;
  } else {
    resultCell.innerHTML = `${result} ${unit}s`;
    resultElement.innerHTML = `${result} ${unit}s`;
  }

  if (tableBody.querySelectorAll("tr").length >= 10) {
    if (result <= 1) {
      resultElement.innerHTML = `${result} ${unit} <br/> <br/> Clear Result List`;
    } else {
      resultElement.innerHTML = `${result} ${unit}s <br/> <br/> Clear Result List`;
    }
  }
  storeTableInLocalStorage({ startDate, endDate, result, unit });
}

function getData(event) {
  event.preventDefault();

  const startDate = new Date(document.getElementById("start-date").value);
  const endDate = new Date(document.getElementById("end-date").value);
  console.log(startDate);

  const { unit, difference } = calculateDifference(
    startDate,
    endDate,
    formatShow.value
  );

  if (tableBody.querySelectorAll("tr").length === 10) {
    resultElement.innerHTML = "Clear Result List";
    inputStart.disabled = "true";
    inputEnd.disabled = "true";
    inputStart.value = "dd/mm/yyyy";
    inputEnd.value = "dd/mm/yyyy";
    return;
  }

  if (resultElement.textContent === "Clear Result List") {
    resultElement.innerHTML = "Clear Result List";
  } else if (!inputStart.value) {
    resultElement.innerHTML = "Select Start Date";
  } else if (!endDate || isNaN(endDate.getTime())) {
    resultElement.innerHTML = "Select End Date";
  } else {
    resultElement.innerHTML = `${difference} ${unit}`;
    updateTable(startDate, endDate, difference, unit);
  }
  formatShow.value = "Show";
  formatAdd.value = "Add";
  formatSelect.value = "Select";
}

function clearTable() {
  inputStart.max = null; // to pull inputStart.max from previous calculation
  localStorage.removeItem("row");
  renderTableRows();

  tableBody.innerHTML = "";
  tableElement.style.display = "none";

  inputStart.disabled = false;
  inputEnd.disabled = true;
  formatAdd.disabled = false;
  inputStart.value = "dd/mm/yyyy";
  inputEnd.value = "dd/mm/yyyy";
  resultElement.innerHTML = "Select Start Date";
  formatShow.value = "Show";
  formatAdd.value = "Add";
  formatSelect.value = "Select";
}

function storeTableInLocalStorage(tableValue) {
  let tableRow = [];

  if (localStorage.getItem("row")) {
    tableRow = JSON.parse(localStorage.getItem("row"));
  }
  tableRow.push(tableValue);
  localStorage.setItem("row", JSON.stringify(tableRow));
}

function renderTableRows() {
  tableBody.innerHTML = "";

  if (localStorage.getItem("row")) {
    resultElement.innerHTML = "";
    const rows = JSON.parse(localStorage.getItem("row"));
    rows.forEach((row) => {
      const newRow = document.createElement("tr");
      tableElement.style.display = "block";

      const startDateCell = document.createElement("td");
      const endDateCell = document.createElement("td");
      const resultCell = document.createElement("td");

      tableBody.appendChild(newRow);
      newRow.appendChild(startDateCell);
      newRow.appendChild(endDateCell);
      newRow.appendChild(resultCell);

      tableRowCounter.textContent = tableBody.querySelectorAll("tr").length;

      startDateCell.innerHTML = new Date(row.startDate).toLocaleDateString(
        "en-GB"
      );
      endDateCell.innerHTML = new Date(row.endDate).toLocaleDateString("en-GB");

      if (row.result <= 1) {
        resultCell.innerHTML = `${row.result} ${row.unit}`;
        resultElement.innerHTML = `${row.result} ${row.unit}`;
      } else {
        resultCell.innerHTML = `${row.result} ${row.unit}s`;
        resultElement.innerHTML = `${row.result} ${row.unit}s`;
      }
    });
    resultElement.innerHTML = "";
  }

  if (tableBody.querySelectorAll("tr").length === 10 && !inputStart.value) {
    resultElement.innerHTML = "Clear Result List";
    inputStart.disabled = "true";
    return;
  }

  if (!inputStart.value && !inputEnd.value) {
    resultElement.innerHTML = "Select Start Date";
    return;
  }

  inputStart.disabled = false;
  inputEnd.disabled = false;
  inputStart.value = "";
  inputEnd.value = "";
  resultElement.innerHTML = "";
}
