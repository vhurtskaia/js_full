const counter = (() => {
  let count = -1;

  return function (n) {
    if (typeof n === "number") {
      count = n;
      return count;
    }

    count++;
    return count;
  };
})();

const counterFactory = (() => {
  let value = 0;

  return {
    value(n) {
      if (typeof n === "number") {
        value = n;
      }

      return value;
    },

    increment() {
      value++;
    },

    decrement() {
      value--;
    }
  };
})();

function myPrint(a, b, result) {
  return `${a}^${b}=${result}`;
}

function myPow(a, b, callback) {
  function power(base, exponent) {
    if (exponent === 0) {
      return 1;
    }

    if (exponent < 0) {
      return 1 / power(base, -exponent);
    }

    return base * power(base, exponent - 1);
  }

  return callback(a, b, power(a, b));
}

function myMax(arr) {
  return Math.max.apply(null, arr);
}

function myMul(a, b) {
  return a * b;
}

const myDouble = myMul.bind(null, 2);

const myTriple = myMul.bind(null, 3);

export {
  counter,
  counterFactory,
  myPow,
  myMax,
  myMul,
  myDouble,
  myTriple
};