(function () {
  const MIN = 100;
  const MAX = 199;
  const ROLLERS_COUNT = 7;
  const ITEM_HEIGHT_FALLBACK = 60;
  const SPIN_DURATION_MS = 10000; // 10 seconds

  const rollersContainer = document.getElementById("rollers");
  const spinButton = document.getElementById("spinButton");
  const spinSound = document.getElementById("spinSound");
  const userNumberInput = document.getElementById("userNumber");
  const submitButton = document.getElementById("submitButton");

  const STORAGE_KEY = "luckyDrawNumbers";
  const MATCHED_KEY = "luckyDrawMatched";

  function getStoredNumbers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== ROLLERS_COUNT) {
        return null;
      }
      const cleaned = parsed.map((n) => parseInt(n, 10));
      const valid = cleaned.every(
        (n) => Number.isInteger(n) && n >= MIN && n <= MAX
      );
      if (!valid) return null;
      return cleaned;
    } catch {
      return null;
    }
  }

  function getMatchedState() {
    try {
      const raw = localStorage.getItem(MATCHED_KEY);
      if (!raw) return new Array(ROLLERS_COUNT).fill(false);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== ROLLERS_COUNT) {
        return new Array(ROLLERS_COUNT).fill(false);
      }
      return parsed.map(Boolean);
    } catch {
      return new Array(ROLLERS_COUNT).fill(false);
    }
  }

  function saveMatchedState(state) {
    try {
      localStorage.setItem(MATCHED_KEY, JSON.stringify(state));
    } catch {
      // ignore save errors
    }
  }

  function createRoller(index) {
    const roller = document.createElement("div");
    roller.className = "roller";

    const label = document.createElement("div");
    label.className = "roller-label";
    label.textContent = "Draw " + (index + 1);

    const windowEl = document.createElement("div");
    windowEl.className = "window";

    const numbersCol = document.createElement("div");
    numbersCol.className = "numbers";

    for (let n = MIN; n <= MAX; n++) {
      const item = document.createElement("div");
      item.className = "number";
      item.textContent = n;
      numbersCol.appendChild(item);
    }

    const overlay = document.createElement("div");
    overlay.className = "result-overlay";

    windowEl.appendChild(numbersCol);
    windowEl.appendChild(overlay);
    roller.appendChild(label);
    roller.appendChild(windowEl);

    return { roller, numbersCol, overlayEl: overlay };
  }

  const rollers = [];
  for (let i = 0; i < ROLLERS_COUNT; i++) {
    const { roller, numbersCol, overlayEl } = createRoller(i);
    rollersContainer.appendChild(roller);
    rollers.push({ numbersCol, overlayEl, currentIndex: 0, locked: false, rootEl: roller });
  }

  let spinIntervalId = null;
  let spinTimeoutId = null;

  function startSound() {
    if (!spinSound) return;
    try {
      spinSound.currentTime = 0;
      spinSound.loop = true;
      spinSound.play().catch(() => {});
    } catch {
      // ignore
    }
  }

  function stopSound() {
    if (!spinSound) return;
    try {
      spinSound.pause();
      spinSound.currentTime = 0;
    } catch {
      // ignore
    }
  }

  function applyMatchedState() {
    const values = getStoredNumbers();
    const matched = getMatchedState();

    if (!values) return;

    rollers.forEach((roller, idx) => {
      const alreadyMatched = !!matched[idx];
      roller.locked = alreadyMatched;
      const overlay = roller.overlayEl;
      const value = values[idx];

      const itemElement = roller.numbersCol.querySelector(".number");
      const currentHeight =
        (itemElement && itemElement.offsetHeight) || ITEM_HEIGHT_FALLBACK;

      const targetIndex = alreadyMatched ? value - MIN : 0; // 0 => 100
      const offset = -targetIndex * currentHeight;
      roller.numbersCol.style.transform = "translateY(" + offset + "px)";

      if (alreadyMatched) {
        overlay.textContent = String(value);
        overlay.classList.add("hit");
        overlay.classList.remove("miss");
        if (roller.rootEl) {
          roller.rootEl.classList.add("locked");
        }
      } else {
        overlay.textContent = "";
        overlay.classList.remove("hit", "miss");
        if (roller.rootEl) {
          roller.rootEl.classList.remove("locked");
          roller.rootEl.classList.remove("miss");
        }
      }
    });
  }

  function spinAll() {
    if (!spinButton) return;

    const raw = userNumberInput ? userNumberInput.value.trim() : "";
    const userNumber = parseInt(raw, 10);
    if (!raw || !Number.isInteger(userNumber)) {
      alert("Please enter a valid number between 100 and 199 before spinning.");
      return;
    }
    if (userNumber < MIN || userNumber > MAX) {
      alert("Your number must be between 100 and 199.");
      return;
    }

    const values = getStoredNumbers();
    if (!values) {
      alert(
        'Please store 7 numbers between 100 and 199 in localStorage under key "luckyDrawNumbers".\n\nExample in console:\nlocalStorage.setItem("luckyDrawNumbers", JSON.stringify([101, 123, 145, 167, 178, 189, 199]));'
      );
      return;
    }

    let matchedState = getMatchedState();

    if (spinIntervalId) {
      clearInterval(spinIntervalId);
      spinIntervalId = null;
    }
    if (spinTimeoutId) {
      clearTimeout(spinTimeoutId);
      spinTimeoutId = null;
    }

    rollers.forEach((roller, idx) => {
      const alreadyMatched = !!matchedState[idx];
      roller.locked = alreadyMatched;
      const overlay = roller.overlayEl;
      if (!alreadyMatched) {
        overlay.textContent = "";
        overlay.classList.remove("miss", "hit");
        if (roller.rootEl) {
          roller.rootEl.classList.remove("miss");
        }
      } else {
        const value = values[idx];
        overlay.textContent = String(value);
        overlay.classList.add("hit");
        overlay.classList.remove("miss");
      }
      if (roller.rootEl) {
        roller.rootEl.classList.toggle("locked", alreadyMatched);
      }
    });

    spinButton.disabled = true;
    if (submitButton) {
      submitButton.disabled = true;
    }

    startSound();

    spinIntervalId = setInterval(() => {
      rollers.forEach((roller, idx) => {
        if (roller.locked) return;
        const itemElement = roller.numbersCol.querySelector(".number");
        const currentHeight =
          (itemElement && itemElement.offsetHeight) || ITEM_HEIGHT_FALLBACK;

        const randomIndex = Math.floor(Math.random() * (MAX - MIN + 1));
        const offset = -randomIndex * currentHeight;
        roller.numbersCol.style.transform = "translateY(" + offset + "px)";
      });
    }, 80);

    spinTimeoutId = setTimeout(() => {
      if (spinIntervalId) {
        clearInterval(spinIntervalId);
        spinIntervalId = null;
      }

      rollers.forEach((roller, idx) => {
        const value = values[idx];
        const targetIndex = value - MIN;

        const itemElement = roller.numbersCol.querySelector(".number");
        const currentHeight =
          (itemElement && itemElement.offsetHeight) || ITEM_HEIGHT_FALLBACK;

        if (!roller.locked) {
          const offset = -targetIndex * currentHeight;
          roller.numbersCol.style.transform = "translateY(" + offset + "px)";

          const isMatch = value === userNumber;
          const overlay = roller.overlayEl;
          overlay.textContent = isMatch ? String(value) : "X";
          overlay.classList.toggle("hit", isMatch);
          overlay.classList.toggle("miss", !isMatch);

          if (isMatch) {
            matchedState[idx] = true;
            roller.locked = true;
            if (roller.rootEl) {
              roller.rootEl.classList.add("locked");
              roller.rootEl.classList.remove("miss");
            }
          } else if (roller.rootEl) {
            roller.rootEl.classList.add("miss");
          }
        }
      });

      saveMatchedState(matchedState);

      stopSound();
      spinButton.disabled = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }, SPIN_DURATION_MS);
  }

  if (spinButton) {
    spinButton.addEventListener("click", spinAll);
  }

  if (submitButton) {
    submitButton.addEventListener("click", spinAll);
  }

  // Apply any previously matched state when page loads
  applyMatchedState();

  // Do not auto-spin on load; wait for user action
})();
