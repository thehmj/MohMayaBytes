(function () {
  const MIN = 1;
  const MAX = 99;
  const ITEM_HEIGHT_FALLBACK = 60;
  const SPIN_DURATION_MS = 4000;

  const rollerRoot = document.getElementById("singleRoller");
  const playButton = document.getElementById("playButton");
  const guessInput = document.getElementById("guessNumber");
  const messageEl = document.getElementById("singleMessage");
  const confettiEl = document.getElementById("confetti");
  const spinSound = document.getElementById("singleSpinSound");
  const submitButton = document.getElementById("guessSubmitButton");

  if (!rollerRoot) return;

  const windowEl = rollerRoot.querySelector(".window");
  let numbersCol = rollerRoot.querySelector(".numbers");

  if (!numbersCol) {
    numbersCol = document.createElement("div");
    numbersCol.className = "numbers";
    if (windowEl) windowEl.appendChild(numbersCol);
  }

  for (let n = MIN; n <= MAX; n++) {
    const item = document.createElement("div");
    item.className = "number";
    item.textContent = n;
    numbersCol.appendChild(item);
  }

  let spinIntervalId = null;
  let spinTimeoutId = null;

  function setMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove("message-error", "message-success");
    if (type === "error") {
      messageEl.classList.add("message-error");
    } else if (type === "success") {
      messageEl.classList.add("message-success");
    }
  }

  function triggerConfetti() {
    if (!confettiEl) return;
    confettiEl.classList.remove("hidden");
    confettiEl.classList.add("active");
    setTimeout(() => {
      confettiEl.classList.remove("active");
      confettiEl.classList.add("hidden");
    }, 1200);
  }

  function startSound() {
    if (!spinSound) return;
    try {
      spinSound.currentTime = 0;
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

  function play() {
    const raw = guessInput ? guessInput.value.trim() : "";
    const guess = parseInt(raw, 10);
    if (!raw || !Number.isInteger(guess)) {
      setMessage("Please enter a valid number between 1 and 99.", "error");
      return;
    }
    if (guess < MIN || guess > MAX) {
      setMessage("Your number must be between 1 and 99.", "error");
      return;
    }

    setMessage("", null);

    if (spinIntervalId) {
      clearInterval(spinIntervalId);
      spinIntervalId = null;
    }
    if (spinTimeoutId) {
      clearTimeout(spinTimeoutId);
      spinTimeoutId = null;
    }

    if (playButton) playButton.disabled = true;
    if (submitButton) submitButton.disabled = true;

    startSound();

    spinIntervalId = setInterval(() => {
      const itemElement = numbersCol.querySelector(".number");
      const currentHeight =
        (itemElement && itemElement.offsetHeight) || ITEM_HEIGHT_FALLBACK;

      const randomIndex = Math.floor(Math.random() * (MAX - MIN + 1));
      const offset = -randomIndex * currentHeight;
      numbersCol.style.transform = "translateY(" + offset + "px)";
    }, 70);

    spinTimeoutId = setTimeout(() => {
      if (spinIntervalId) {
        clearInterval(spinIntervalId);
        spinIntervalId = null;
      }

      const result = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
      const itemElement = numbersCol.querySelector(".number");
      const currentHeight =
        (itemElement && itemElement.offsetHeight) || ITEM_HEIGHT_FALLBACK;
      const targetIndex = result - MIN;
      const offset = -targetIndex * currentHeight;
      numbersCol.style.transform = "translateY(" + offset + "px)";

      if (result === guess) {
        setMessage("Congratulations! You guessed " + result + " correctly!", "success");
        triggerConfetti();
      } else {
        setMessage(
          "Try again! The roller stopped at " + result + ".",
          "error"
        );
      }

      stopSound();

      if (playButton) playButton.disabled = false;
      if (submitButton) submitButton.disabled = false;
    }, SPIN_DURATION_MS);
  }

  if (playButton) {
    playButton.addEventListener("click", play);
  }

  if (submitButton) {
    submitButton.addEventListener("click", play);
  }
})();
