const form = document.querySelector("#expenseForm");
const submitButton = document.querySelector("#submitButton");
const resetButton = document.querySelector("#resetButton");
const successMessage = document.querySelector("#successMessage");
const formStatus = document.querySelector("#formStatus");

const fields = {
  title: form.elements.title,
  amount: form.elements.amount,
  category: form.elements.category,
  date: form.elements.date,
  description: form.elements.description,
  confirm: form.elements.confirm
};

const errorElements = {
  title: document.querySelector("#titleError"),
  amount: document.querySelector("#amountError"),
  category: document.querySelector("#categoryError"),
  date: document.querySelector("#dateError"),
  description: document.querySelector("#descriptionError"),
  confirm: document.querySelector("#confirmError")
};

function setError(fieldName, message) {
  const input = fields[fieldName];
  const error = errorElements[fieldName];

  error.textContent = message;

  if (message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
  } else {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  }
}

function clearErrors() {
  Object.keys(errorElements).forEach((fieldName) => {
    setError(fieldName, "");
  });
}

function validateField(fieldName) {
  const input = fields[fieldName];
  const value = typeof input.value === "string"
    ? input.value.trim()
    : input.value;

  if (fieldName === "title") {
    if (!value) return "Expense title is required.";
    if (value.length < 3) return "Expense title must be at least 3 characters.";
    if (value.length > 80) return "Expense title must not exceed 80 characters.";
  }

  if (fieldName === "amount") {
    if (!value) return "Amount is required.";

    const amount = Number(value);

    if (!Number.isFinite(amount)) return "Enter a valid amount.";
    if (amount < 1 || amount > 1000000) {
      return "Amount must be between ₹1 and ₹10,00,000.";
    }
  }

  if (fieldName === "category") {
    if (!value) return "Please select a category.";
  }

  if (fieldName === "date") {
    if (!value) return "Expense date is required.";

    // Cross-field/business rule: expense date cannot be in the future.
    const today = new Date().toISOString().split("T")[0];

    if (value > today) {
      return "Expense date cannot be in the future.";
    }
  }

  if (fieldName === "description") {
    if (value.length > 200) {
      return "Description must not exceed 200 characters.";
    }
  }

  if (fieldName === "confirm") {
    if (!input.checked) {
      return "Please confirm that the details are correct.";
    }
  }

  return "";
}

function validateForm() {
  let isValid = true;
  let firstInvalidField = null;

  Object.keys(fields).forEach((fieldName) => {
    const message = validateField(fieldName);
    setError(fieldName, message);

    if (message && !firstInvalidField) {
      firstInvalidField = fields[fieldName];
    }

    if (message) {
      isValid = false;
    }
  });

  return { isValid, firstInvalidField };
}

function updateSubmitState() {
  const result = validateForm();
  submitButton.disabled = !result.isValid;
  return result;
}

// Controlled validation flow:
// input/change -> validate -> show errors -> update submit state.
Object.keys(fields).forEach((fieldName) => {
  const input = fields[fieldName];
  const eventName = input.type === "checkbox" || input.tagName === "SELECT"
    ? "change"
    : "input";

  input.addEventListener(eventName, () => {
    successMessage.hidden = true;
    formStatus.textContent = "";
    updateSubmitState();
  });

  input.addEventListener("blur", () => {
    const message = validateField(fieldName);
    setError(fieldName, message);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const result = validateForm();

  if (!result.isValid) {
    formStatus.textContent = "Please correct the errors before submitting.";

    if (result.firstInvalidField) {
      result.firstInvalidField.focus();
    }

    return;
  }

  const data = new FormData(form);
  const expense = {
    title: data.get("title").trim(),
    amount: Number(data.get("amount")),
    category: data.get("category"),
    date: data.get("date"),
    description: data.get("description").trim()
  };

  console.log("Validated expense:", expense);

  successMessage.textContent =
    `Expense "${expense.title}" of ₹${expense.amount.toFixed(2)} was saved successfully.`;
  successMessage.hidden = false;
  formStatus.textContent = "Expense saved successfully.";

  // In a real application, send `expense` to an API here.
  form.reset();
  clearErrors();
  submitButton.disabled = true;
});

resetButton.addEventListener("click", () => {
  // Reset happens after the click event, so clear UI state explicitly.
  window.setTimeout(() => {
    clearErrors();
    successMessage.hidden = true;
    formStatus.textContent = "Form reset.";
    submitButton.disabled = true;
  }, 0);
});
