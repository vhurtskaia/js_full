import {
  counter,
  counterFactory,
  myPow,
  myMax,
  myDouble,
  myTriple
} from "./scripts.js";

const counterResult = document.getElementById("counterResult");

document
  .getElementById("setCounter")
  .addEventListener("click", () => {
    const value = Number(
      document.getElementById("counterStart").value
    );

    counterResult.textContent = counter(value);
  });

document
  .getElementById("nextCounter")
  .addEventListener("click", () => {
    counterResult.textContent = counter();
  });

const factoryValue = document.getElementById("factoryValue");

function updateFactory() {
  factoryValue.textContent = counterFactory.value();
}

updateFactory();

document
  .getElementById("increment")
  .addEventListener("click", () => {
    counterFactory.increment();
    updateFactory();
  });

document
  .getElementById("decrement")
  .addEventListener("click", () => {
    counterFactory.decrement();
    updateFactory();
  });

document
  .getElementById("setFactory")
  .addEventListener("click", () => {
    const value = Number(
      document.getElementById("factoryInput").value
    );

    counterFactory.value(value);
    updateFactory();
  });

const myPrint = (a, b, result) => `${a}^${b}=${result}`;

document
  .getElementById("calculatePow")
  .addEventListener("click", () => {

    const a = Number(document.getElementById("powA").value);

    const b = Number(document.getElementById("powB").value);

    document.getElementById("powResult").textContent =
      myPow(a, b, myPrint);

  });

document
  .getElementById("findMax")
  .addEventListener("click", () => {

    const numbers =
      document
        .getElementById("arrayInput")
        .value
        .split(",")
        .map(item => Number(item.trim()));

    document.getElementById("maxResult").textContent =
      myMax(numbers);

  });

document
  .getElementById("doubleBtn")
  .addEventListener("click", () => {

    const value = Number(
      document.getElementById("mulInput").value
    );

    document.getElementById(
      "mulResult"
    ).textContent = `Double = ${myDouble(value)}`;

  });

document
  .getElementById("tripleBtn")
  .addEventListener("click", () => {

    const value = Number(
      document.getElementById("mulInput").value
    );

    document.getElementById(
      "mulResult"
    ).textContent = `Triple = ${myTriple(value)}`;

  });