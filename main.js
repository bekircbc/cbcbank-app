/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnChangePin = document.querySelector(".form__btn--changepin");
const btnClose = document.querySelector(".form__btn--close");

// const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferiban = document.querySelector(".form__input--iban");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
const inputNewpin = document.querySelector(".form__input--newpin");
const inputSalary = document.querySelector(".form__input--salary");
const inputUserChange = document.querySelector(".form__input--userchange");
const inputPinChange = document.querySelector(".form__input--pinchange");
const inputNewPin = document.querySelector(".form__input--newpin");
const inputConfirmPin = document.querySelector(".form__input--confirmpin");

const kreditRequest = document.querySelector(".kredit--request");
const moneyTransfer = document.querySelector(".money--transfer");
const changePin = document.querySelector(".change--pin");
////////////////////////////////////////////////////
///////////////////////////////////////////////////
//JSON SERVER

// const id = new URLSearchParams(window.location.search).get("id");
// const pin = new URLSearchParams(window.location.search).get("pin");
let accounts, uri, isLogin;

const renderAccounts = async () => {
  uri = "https://cbcbank.bscebeci.de/accounts";
  const res = await fetch(uri);

  accounts = await res.json();
  console.log(accounts);
};

window.addEventListener("DOMContentLoaded", () => renderAccounts());

const patchData = async (url = ``, data = {}) => {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

// const createUsernames = function (accs) {
//   accs.forEach(function (acc) {
//     acc.username = acc.owner
//       .toLowerCase()
//       .split(" ")
//       .map((name) => name[0])
//       .join("");
//   });
// };
// createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
      // Logout functions
      localStorage.setItem("currentUser", JSON.stringify({}));
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

const setLogin = function (accounInfo) {
  let userObject = {
    _id: accounInfo.id,
    isLogin: true,
  };
  console.log("userObject", userObject);
  // Info als string zu Browser schicken
  localStorage.setItem("currentUser", JSON.stringify(userObject));

  // um die Information als normales Objekt aus localStorage zuholen
  let userInfo = JSON.parse(localStorage.getItem("currentUser"));
};

const verifyUser = function (user) {
  accounts.find((acc) => {
    if (acc.id === user.id) {
      return true;
    }
  });
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer, isLoggedIn;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener("click", async (e) => {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find((acc) => acc.id === inputLoginUsername.value);
  console.log(currentAccount);

  if (
    currentAccount.id === inputLoginUsername.value &&
    currentAccount.pin === +inputLoginPin.value
  ) {
    // Display UI and message
    // isLoggedIn = true;
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // entweder mit coockie oder localStorage
    // cookies sind sicherer als localStorage

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
    // setUser
    setLogin(currentAccount);
  }
});

btnTransfer.addEventListener("click", async (e) => {
  e.preventDefault();
  // Verifiy den Nutzer zuerst bevor wir etwas anders machen
  let userInfo = JSON.parse(localStorage.getItem("currentUser"));
  let isVerified = verifyUser(userInfo);
  if (isVerified === false) return; // wennn er nicht existiert dann darf er nicht weiter

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find((acc) => {
    if (
      acc.owner === inputTransferTo.value &&
      acc.iban === inputTransferiban.value
    )
      return acc;
  });
  inputTransferAmount.value =
    inputTransferTo.value =
    inputTransferiban.value =
      "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.owner !== currentAccount.owner
  ) {
    // Doing the transfer
    ////////////////////////////////////////

    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());

    const dataCurrent = {
      movements: currentAccount.movements,
      movementsDates: currentAccount.movementsDates,
    };

    console.log(dataCurrent);

    const dataReceiver = {
      movements: receiverAcc.movements,
      movementsDates: receiverAcc.movementsDates,
    };
    console.log(dataCurrent);

    patchData(
      `http://localhost:3000/accounts/${currentAccount.id}`,
      dataCurrent
    );
    patchData(`http://localhost:3000/accounts/${receiverAcc.id}`, dataReceiver);

    // currentAccount.movements.push(-amount);
    // receiverAcc.movements.push(amount);
    moneyTransfer.innerHTML = `${amount} ${
      currentAccount.currency === "EUR" ? "€" : "$"
    } has tranferred to ${receiverAcc.owner}`;

    // Add transfer date
    // currentAccount.movementsDates.push(new Date().toISOString());
    // receiverAcc.movementsDates.push(new Date().toISOString());
    //////////////////////////////////////////////////////////////
    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    moneyTransfer.innerHTML = `${amount} can not transfer`;
  }
});

btnLoan.addEventListener("click", async (e) => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  const salary = Math.floor(inputSalary.value);

  if (
    amount > 0 &&
    salary * 10 >= amount &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1) &&
    currentAccount.interestRate >= 1.4
  ) {
    setTimeout(function () {
      // Add movement
      kreditRequest.innerHTML = "Kredit Request -- Accepted";
      //////////////////////////////////////////////////////
      // currentAccount.movements.push(amount);

      // Add loan date
      // currentAccount.movementsDates.push(new Date().toISOString());
      /////////////////////////////////////////////////////////////////////
      // Update UI
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      const dataCurrent = {
        movements: currentAccount.movements,
        movementsDates: currentAccount.movementsDates,
      };

      patchData(
        `http://localhost:3000/accounts/${currentAccount.id}`,
        dataCurrent
      );

      // window.location.replace(
      //   `http://localhost:3000/accounts/${currentAccount.id}`
      // );

      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  } else {
    setTimeout(function () {
      kreditRequest.innerHTML = "Kredit Request -- Rejected";
    }, 2500);
  }

  inputLoanAmount.value = inputSalary.value = "";
  kreditRequest.innerHTML = "Kredit Request";
});

btnChangePin.addEventListener("click", async (e) => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.id &&
    +inputClosePin.value === currentAccount.pin
  ) {
    currentAccount.pin = inputNewpin.value;

    setTimeout(function () {
      // Add movement
      changePin.innerHTML = "PIN Changed";

      const dataCurrent = {
        pin: currentAccount.pin,
      };
      console.log(dataCurrent);

      patchData(
        `http://localhost:3000/accounts/${currentAccount.id}`,
        dataCurrent
      );

      // window.location.replace(
      //   `http://localhost:3000/accounts/${currentAccount.id}`
      // );
      //////////////////////////////////////////
      // currentAccount.pin = inputNewpin.value;
      // const dataPinCurrent = inputNewpin.value;

      // const dataCurrent = {
      //   id: currentAccount.id,
      //   owner: currentAccount.owner,
      //   iban: currentAccount.iban,
      //   movements: currentAccount.movements,
      //   interestRate: currentAccount.interestRate,
      //   pin: `${dataPinCurrent}`,
      //   movementsDates: currentAccount.movementsDates,
      //   currency: currentAccount.currency,
      //   locale: currentAccount.locale,
      // };

      // putData(
      //   `http://localhost:3000/accounts/${currentAccount.id}`,
      //   dataCurrent
      // );
      /////////////////////////////////////////////
      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  } else {
    setTimeout(function () {
      changePin.innerHTML = "Only Acount Owner can change PIN";
    }, 2500);
  }

  inputUserChange.value = inputPinChange.value = inputNewPin.value = "";
});

btnClose.addEventListener("click", async (e) => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.id &&
    +inputClosePin.value === currentAccount.pin &&
    +inputConfirmPin.value === currentAccount.pin
  ) {
    await fetch(`http://localhost:3000/accounts/${currentAccount.id}`, {
      method: "DELETE",
    });

    // window.location.replace("/");
    // const index = accounts.findIndex((acc) => acc.id === currentAccount.id);
    // console.log(index);
    // // .indexOf(23)

    // // Delete account
    // accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = inputConfirmPin.value = "";
});

/////TODO JSON SERVER

// const id = new URLSearchParams(window.location.search).get("id");
// console.log(id);
// const renderPosts = async (term) => {
//   console.log(term);
//   let uri = "http://localhost:3000/accounts";

//   const res = await fetch(uri);
//   const accounts = await res.json();
//   console.log(accounts);
// };

// deleteBtn.addEventListener("click", async () => {
//   const res = await fetch("http://localhost:3000/posts/" + id, {
//     method: "DELETE",
//   });
//   window.location.replace("/");
// });

// window.addEventListener("DOMContentLoaded", () => renderPosts());

// let sorted = false;
// btnSort.addEventListener("click", function (e) {
//   e.preventDefault();
//   displayMovements(currentAccount.movements, !sorted);
//   sorted = !sorted;
// });

// "start": "run-p api appstart",
// "api": "json-server --watch ./src/data/db.json --port 5000",
// "appstart": "react-scripts start",
