(function () {
  const MIN = 100;
  const MAX = 199;
  const REQUIRED_COUNT = 7;
  const STORAGE_KEY = "luckyDrawNumbers";

  const saveButton = document.getElementById("saveButton");
  const messageEl = document.getElementById("message");

  const inputs = [];
  for (let i = 1; i <= REQUIRED_COUNT; i++) {
    const input = document.getElementById("num" + i);
    if (input) {
      inputs.push(input);
    }
  }

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove("message-error", "message-success");
    if (type === "error") {
      messageEl.classList.add("message-error");
    } else if (type === "success") {
      messageEl.classList.add("message-success");
    }
  }

  function loadExisting() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== REQUIRED_COUNT) return;
      parsed.forEach((val, idx) => {
        if (inputs[idx]) {
          inputs[idx].value = val;
        }
      });
    } catch {
      // ignore parsing errors
    }
  }

  function handleSave() {
    const values = [];
    for (let i = 0; i < REQUIRED_COUNT; i++) {
      const val = inputs[i] ? inputs[i].value.trim() : "";
      const num = parseInt(val, 10);
      if (!val || !Number.isInteger(num)) {
        showMessage("All 7 fields must be filled with valid numbers.", "error");
        return;
      }
      if (num < MIN || num > MAX) {
        showMessage("Numbers must be between 100 and 199.", "error");
        return;
      }
      values.push(num);
    }

    const uniqueSet = new Set(values);
    if (uniqueSet.size !== values.length) {
      showMessage("All 7 numbers must be unique.", "error");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      showMessage("Lucky numbers saved successfully!", "success");
    } catch {
      showMessage("Unable to save to localStorage. Check browser settings.", "error");
    }
  }

  if (saveButton) {
    saveButton.addEventListener("click", handleSave);
  }

  loadExisting();
})();

