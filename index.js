document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------------
  // TAB SWITCHING
  // ----------------------------------------------------------
  const tabcalculator = document.getElementById("tab-calculator");
  const tabConverter = document.getElementById("tab-converter");

  const calculatorSection = document.getElementById("calculator");
  const converterSection = document.getElementById("converter");

  function activateTab(tab) {
    const showCalculator = tab === "calculator";

    // Toggle "active" class on tab buttons
    tabcalculator.classList.toggle("active", showCalculator);
    tabConverter.classList.toggle("active", !showCalculator);

    // Toggle aria-selected for accessibility
    tabcalculator.setAttribute("aria-selected", String(showCalculator));
    tabConverter.setAttribute("aria-selected", String(!showCalculator));

    // Toggle "hidden" class on sections
    calculatorSection.classList.toggle("hidden", !showCalculator);
    converterSection.classList.toggle("hidden", showCalculator);
  }

  tabcalculator.addEventListener("click", () => activateTab("calculator"));
  tabConverter.addEventListener("click", () => activateTab("converter"));

  // ----------------------------------------------------------
  // ERROR HELPERS
  // ----------------------------------------------------------

  /**
   * Show a top-level error banner inside a section.
   * @param {'calculator' | 'converter'} section
   * @param {string} message
   */
  function showError(section, message) {
    const box = document.getElementById(`${section}-error`);
    const text = document.getElementById(`${section}-error-text`);
    if (!box || !text) return;
    text.textContent = message;
    box.classList.remove("hidden");
  }

  /**
   * @param {'calculator' | 'converter'} section
   */
  function clearError(section) {
    const box = document.getElementById(`${section}-error`);
    if (!box) return;
    box.classList.add("hidden");
  }

  /**
   * Apply/remove the visual error state on a single input,
   * and optionally show a small inline message below it.
   * @param {HTMLElement} inputEl
   * @param {HTMLElement|null} inlineErrorEl
   * @param {string|null} message - pass null/empty to clear the error state
   */
  function setInputError(inputEl, inlineErrorEl, message) {
    if (!inputEl) return;

    if (message) {
      inputEl.classList.add("input-error");
      inputEl.setAttribute("aria-invalid", "true");
      if (inlineErrorEl) {
        inlineErrorEl.textContent = message;
        inlineErrorEl.classList.remove("hidden");
      }
    } else {
      inputEl.classList.remove("input-error");
      inputEl.removeAttribute("aria-invalid");
      if (inlineErrorEl) {
        inlineErrorEl.textContent = "";
        inlineErrorEl.classList.add("hidden");
      }
    }
  }

  //------------------------------------------------------
  // Constants
  //------------------------------------------------------

  const preDefineValues = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
  ];

  // ----------------------------------------------------------
  // calcULATOR — DOM references
  // ----------------------------------------------------------
  const calc = {
    base: document.getElementById("calc-base"),
    number1: document.getElementById("calc-number1"),
    number2: document.getElementById("calc-number2"),
    number1Error: document.getElementById("calc-number1-error"),
    number2Error: document.getElementById("calc-number2-error"),
    operator: document.getElementById("calc-operator"),
    calculateBtn: document.getElementById("calc-calculate"),
    resetBtn: document.getElementById("calc-reset"),
    result: document.getElementById("calc-result"),
    resultBaseLabel: document.getElementById("calc-result-base-label"),
    resultDecimal: document.getElementById("calc-result-decimal"),
    resultBinary: document.getElementById("calc-result-binary"),
    digitGrouping: document.getElementById("calc-digit-grouping"),
    steps: document.getElementById("calc-steps"),
    baseIndicators: document.querySelectorAll("#calculator .number .small"),
  };

  // Keep the small base indicators next to each input in sync with the
  calc.base.addEventListener("change", () => {
    calc.baseIndicators.forEach((el) => {
      el.textContent = calc.base.value;
    });
    // Clear stale errors when the base changes
    clearError("calculator");
    setInputError(calc.number1, calc.number1Error, null);
    setInputError(calc.number2, calc.number2Error, null);
  });

  // Reset button: clear inputs, results and any error states.
  calc.resetBtn.addEventListener("click", () => {
    calc.number1.value = "";
    calc.number2.value = "";
    calc.base.value = "10";
    calc.baseIndicators.forEach((el) => {
      el.textContent = "10";
    });
    calc.operator.value = "+";
    calc.result.textContent = "—";
    calc.resultBaseLabel.textContent = "(base 10)";
    calc.resultDecimal.textContent = "—";
    calc.resultBinary.textContent = "—";
    calc.steps.value = "";
    clearError("calculator");
    setInputError(calc.number1, calc.number1Error, null);
    setInputError(calc.number2, calc.number2Error, null);
  });
  function checkBase2(number) {
    for (let bit of number) {
      if (bit !== "0" && bit !== "1") return false;
    }
    return true;
  }
  function checkBase8(number) {
    for (let num of number) {
      if (!"01234567".includes(num)) return false;
    }
    return true;
  }
  function checkBase10(number) {
    for (let num of number) {
      if (!"0123456789".includes(num)) return false;
    }
    return true;
  }
  function checkBase16(number) {
    for (let num of number) {
      if (!preDefineValues.includes(num)) return false;
    }
    return true;
  }

  function convertIntoDecimal(number, base) {
    if (base === 10) return Number(number);
    let decimalValue = 0;
    let n = number.length;
    for (let place = 0; place < n; place++) {
      decimalValue +=
        preDefineValues.indexOf(number[place]) * Math.pow(base, n - place - 1);
    }
    return decimalValue;
  }

  function convertFromDecimal(decimalNumber, base) {
    if (base == 10) return decimalNumber;
    if (decimalNumber === 0) return "0";
    let sign = "";
    if (decimalNumber < 0) {
      sign = "-";
      decimalNumber = -decimalNumber;
    }
    let newBaseValue = "";
    while (decimalNumber > 0) {
      newBaseValue = preDefineValues[decimalNumber % base] + newBaseValue;
      decimalNumber = Math.floor(decimalNumber / base);
    }
    return sign + newBaseValue;
  }

  calc.calculateBtn.addEventListener("click", () => {
    clearError("calculator");
    setInputError(calc.number1, calc.number1Error, null);
    setInputError(calc.number2, calc.number2Error, null);

    if (!calc.number1.value.trim() || !calc.number2.value.trim()) {
      showError("calculator", "Please Enter Both Number");
      return;
    }
    const number1Val = calc.number1.value.trim();
    const number2Val = calc.number2.value.trim();
    let check = true;
    switch (calc.base.value) {
      case "2":
        if (!checkBase2(number1Val)) {
          setInputError(
            calc.number1,
            calc.number1Error,
            "Not a valid binary digit",
          );
          check = false;
        }
        if (!checkBase2(number2Val)) {
          setInputError(
            calc.number2,
            calc.number2Error,
            "Not a valid binary digit",
          );
          check = false;
        }
        break;
      case "8":
        if (!checkBase8(number1Val)) {
          setInputError(
            calc.number1,
            calc.number1Error,
            "Only digits 0-7 allowed",
          );
          check = false;
        }
        if (!checkBase8(number2Val)) {
          setInputError(
            calc.number2,
            calc.number2Error,
            "Only digits 0-7 allowed",
          );
          check = false;
        }
        break;
      case "10":
        if (!checkBase10(number1Val)) {
          setInputError(
            calc.number1,
            calc.number1Error,
            "Only digits 0-9 allowed",
          );
          check = false;
        }
        if (!checkBase10(number2Val)) {
          setInputError(
            calc.number2,
            calc.number2Error,
            "Only digits 0-9 allowed",
          );
          check = false;
        }
        break;
      case "16":
        if (!checkBase16(number1Val)) {
          setInputError(
            calc.number1,
            calc.number1Error,
            "Not a valid hexadecimal digit",
          );
          check = false;
        }
        if (!checkBase16(number2Val)) {
          setInputError(
            calc.number2,
            calc.number2Error,
            "Not a valid hexadecimal digit",
          );
          check = false;
        }
        break;
      default:
        break;
    }

    if (!check) return;

    const number1DecimalValue = convertIntoDecimal(number1Val, calc.base.value);
    const number2DecimalValue = convertIntoDecimal(number2Val, calc.base.value);

    let totalDecimalValue;
    switch (calc.operator.value) {
      case "+":
        totalDecimalValue = number1DecimalValue + number2DecimalValue;
        break;
      case "-":
        totalDecimalValue = number1DecimalValue - number2DecimalValue;
        break;
      case "*":
        totalDecimalValue = number1DecimalValue * number2DecimalValue;
        break;
      case "/":
        if (number2DecimalValue === 0) {
          showError("calculator", "Cannot divide by zero");
          return;
        }
        totalDecimalValue = Math.floor(
          number1DecimalValue / number2DecimalValue,
        );
        break;
      case "&":
        totalDecimalValue = number1DecimalValue & number2DecimalValue;
        break;
      case "|":
        totalDecimalValue = number1DecimalValue | number2DecimalValue;
        break;
      case "^":
        totalDecimalValue = number1DecimalValue ^ number2DecimalValue;
        break;
      default:
        totalDecimalValue = number1DecimalValue + number2DecimalValue;
    }

    const binaryValue = convertFromDecimal(totalDecimalValue, 2);
    const resultValue = convertFromDecimal(
      totalDecimalValue,
      Number(calc.base.value),
    );
    calc.result.textContent = resultValue;
    calc.resultBaseLabel.textContent = `(base ${calc.base.value})`;
    calc.resultDecimal.textContent = totalDecimalValue;
    calc.resultBinary.textContent = binaryValue;
    if (calc.base.value !== "10")
      calc.steps.value = `Step 1: Convert first number to decimal
      ${number1Val} (base ${calc.base.value}) = ${number1DecimalValue} (base 10)

      Step 2: Convert second number to decimal
      ${number2Val} (base ${calc.base.value}) = ${number2DecimalValue} (base 10)

      Step 3: Calculate in decimal
      ${number1DecimalValue} + ${number2DecimalValue} = ${totalDecimalValue}

      Step 4: Convert result back to base ${calc.base.value}
      ${totalDecimalValue} (base 10) = ${resultValue} (base ${calc.base.value})`;
    else {
      calc.steps.value = `Step1: Add both numbers
        ${number1DecimalValue} (base 10) + ${number2DecimalValue} (base 10) = ${totalDecimalValue} (base 10)`;
    }
  });

  // ----------------------------------------------------------
  // CONVERTER — DOM references
  // ----------------------------------------------------------
  const conv = {
    input: document.getElementById("conv-input"),
    inputError: document.getElementById("conv-input-error"),
    fromBase: document.getElementById("conv-from-base"),
    toBase: document.getElementById("conv-to-base"),
    convertBtn: document.getElementById("conv-convert"),
    resetBtn: document.getElementById("conv-reset"),
    swapBtn: document.getElementById("conv-swap"),
    result: document.getElementById("conv-result"),
    copyBtn: document.getElementById("conv-copy"),
  };

  // Swap "from" and "to" bases.
  conv.swapBtn.addEventListener("click", () => {
    const temp = conv.fromBase.value;
    conv.fromBase.value = conv.toBase.value;
    conv.toBase.value = temp;
    clearError("converter");
    setInputError(conv.input, conv.inputError, null);
  });

  // Reset button: clear input, result and any error states.
  conv.resetBtn.addEventListener("click", () => {
    conv.input.value = "";
    conv.fromBase.value = "10";
    conv.toBase.value = "16";
    conv.result.textContent = "—";
    clearError("converter");
    setInputError(conv.input, conv.inputError, null);
  });

  // Copy result to clipboard.
  conv.copyBtn.addEventListener("click", () => {
    const value = conv.result.textContent.trim();
    if (!value || value === "—") return;

    navigator.clipboard.writeText(value).then(() => {
      const original = conv.copyBtn.innerHTML;
      conv.copyBtn.textContent = "Copied!";
      setTimeout(() => {
        conv.copyBtn.innerHTML = original;
      }, 1200);
    });
  });

  conv.convertBtn.addEventListener("click", () => {
    clearError("converter");
    setInputError(conv.input, conv.inputError, null);

    if (!conv.input.value.trim()) {
      showError("converter", "Please enter a number to convert");
      return;
    }
    const number = conv.input.value.trim();
    const fromBase = conv.fromBase.value;
    const toBase = conv.toBase.value;

    switch (fromBase) {
      case "2":
        if (!checkBase2(number)) {
          setInputError(conv.input, conv.inputError, "Only digits 0-1 allowed");
          return;
        }
        break;
      case "8":
        if (!checkBase8(number)) {
          setInputError(conv.input, conv.inputError, "Only digits 0-7 allowed");
          return;
        }
        break;
      case "10":
        if (!checkBase10(number)) {
          setInputError(conv.input, conv.inputError, "Only digits 0-9 allowed");
          return;
        }
        break;
      case "16":
        if (!checkBase16(number)) {
          setInputError(conv.input, conv.inputError, "Not a valid hexadecimal");
          return;
        }
        break;
      default:
        return;
    }

    const decimalValue = convertIntoDecimal(number, Number(fromBase));
    const resultValue = convertFromDecimal(decimalValue, Number(toBase));
    conv.result.textContent = resultValue;
  });
});
conv.convertBtn.addEventListener("click", () => {
  clearError("converter");
  setInputError(conv.input, conv.inputError, null);

  if (!conv.input.value().trim()) {
    showError("converter", "Please enter a number to convert");
    return;
  }
  let number = conv.input.value.trim();
  let fromBase = conv.fromBase.value;
  let toBase = conv.toBase.value;
  switch (fromBase) {
    case "2":
      if (!checkBase2(number)) {
        showError(conv.input, conv.inputError, "Only Digits 0-1 allowed");
        return;
      }
      break;
    case "8":
      if (!checkBase8(number)) {
        showError(conv.input, conv.inputError, "Only Digits 0-7 allowed");
        return;
      }
      break;
    case "10":
      if (!checkBase10(number)) {
        showError(conv.input, conv.inputError, "Only Digits 0-9 allowed");
        return;
      }
      break;
    case "16":
      if (!checkBase16(number)) {
        showError(conv.input, conv.inputError, "Not a Valid hexadecimal");
        return;
      }
      break;
    default:
      return;
  }
  let decimalValue = convertIntoDecimal(number, Number(fromBase));

  let resultValue = convertFromDecimal(decimalValue, Number(toBase));

  conv.result.textContent = resultValue;
});
