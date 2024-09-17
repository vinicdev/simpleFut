let timerInterval;
let seconds = 0;
let isTimerRunning = false;
let goals = { team1: {}, team2: {} };

document.getElementById("start-game").addEventListener("click", () => {
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("scoreboard-screen").style.display = "block";
  loadTeamData();
  saveData();
});

function loadTeamData() {
  document.getElementById("team1-name").innerText =
    document.getElementById("team1").value;
  document.getElementById("team2-name").innerText =
    document.getElementById("team2").value;
}

document.getElementById("start-timer").addEventListener("click", () => {
  if (!isTimerRunning) {
    startTimer();
  }
});

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById("timer-display").innerText = formatTime(seconds);
    saveTime();
  }, 1000);
  isTimerRunning = true;
  saveData();
}

document.getElementById("stop-timer").addEventListener("click", () => {
  clearInterval(timerInterval);
  isTimerRunning = false;
  saveData();
});

document.getElementById("reset-timer").addEventListener("click", () => {
  document.getElementById("reset-confirm-modal").style.display = "flex";
});

document.getElementById("confirm-reset").addEventListener("click", () => {
  clearInterval(timerInterval);
  seconds = 0;
  document.getElementById("timer-display").innerText = formatTime(seconds);
  isTimerRunning = false;
  saveData();
  document.getElementById("reset-confirm-modal").style.display = "none";
});

document.getElementById("cancel-reset").addEventListener("click", () => {
  document.getElementById("reset-confirm-modal").style.display = "none";
});

function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const remainingSeconds = sec % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function saveTime() {
  const savedData = JSON.parse(localStorage.getItem("gameData")) || {};
  savedData.seconds = seconds;
  savedData.isTimerRunning = isTimerRunning;
  localStorage.setItem("gameData", JSON.stringify(savedData));
}

function addGoal(team) {
  const teamPlayers =
    team === "team1"
      ? document.getElementById("players1").value.split("\n")
      : document.getElementById("players2").value.split("\n");
  const selectPlayer = document.createElement("select");
  selectPlayer.id = "player-select";
  selectPlayer.innerHTML = teamPlayers
    .map((player) => `<option value="${player}">${player}</option>`)
    .join("");
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `<p>Selecione quem fez o gol para o ${
    team === "team1"
      ? document.getElementById("team1").value
      : document.getElementById("team2").value
  }:</p>`;
  modalContent.appendChild(selectPlayer);
  const confirmButton = document.createElement("button");
  confirmButton.innerText = "Confirmar";
  confirmButton.onclick = () => {
    const selectedPlayer = document.getElementById("player-select").value;
    if (!goals[team][selectedPlayer]) {
      goals[team][selectedPlayer] = 0;
    }
    goals[team][selectedPlayer]++;
    updateScoreboard();
    saveData();
    document.body.removeChild(modal);
  };
  modalContent.appendChild(confirmButton);
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.style.display = "flex";
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function updateScoreboard() {
  const team1Score = Object.values(goals.team1).reduce(
    (total, numGoals) => total + numGoals,
    0
  );
  const team2Score = Object.values(goals.team2).reduce(
    (total, numGoals) => total + numGoals,
    0
  );
  document.getElementById("team1-score").innerText = team1Score;
  document.getElementById("team2-score").innerText = team2Score;
}

document.getElementById("end-game").addEventListener("click", () => {
  document.getElementById("confirm-modal").style.display = "flex";
});

document.getElementById("confirm-end").addEventListener("click", () => {
  document.getElementById("confirm-modal").style.display = "none";
  saveData();
  generatePDF();
  resetGame();
});

document.getElementById("cancel-end").addEventListener("click", () => {
  document.getElementById("confirm-modal").style.display = "none";
});

function resetGame() {
  clearInterval(timerInterval);
  seconds = 0;
  isTimerRunning = false;
  goals = { team1: {}, team2: {} };
  document.getElementById("timer-display").innerText = "00:00";
  document.getElementById("team1-score").innerText = "0";
  document.getElementById("team2-score").innerText = "0";
  document.getElementById("team1").value = "";
  document.getElementById("players1").value = "";
  document.getElementById("team2").value = "";
  document.getElementById("players2").value = "";
  localStorage.removeItem("gameData");
  document.getElementById("setup-screen").style.display = "block";
  document.getElementById("scoreboard-screen").style.display = "none";
}

document.getElementById("edit-teams").addEventListener("click", () => {
  document.getElementById("edit-modal").style.display = "flex";
  document.getElementById("edit-players1").value =
    document.getElementById("players1").value;
  document.getElementById("edit-players2").value =
    document.getElementById("players2").value;
});

document.getElementById("save-edits").addEventListener("click", () => {
  document.getElementById("players1").value =
    document.getElementById("edit-players1").value;
  document.getElementById("players2").value =
    document.getElementById("edit-players2").value;
  saveData();
  document.getElementById("edit-modal").style.display = "none";
});

document.getElementById("close-edit-modal").addEventListener("click", () => {
  document.getElementById("edit-modal").style.display = "none";
});

function saveData() {
  const gameData = {
    date: new Date().toLocaleString(),
    seconds,
    isTimerRunning,
    team1: {
      name: document.getElementById("team1").value,
      players: document.getElementById("players1").value.split("\n"),
      goals: goals.team1,
    },
    team2: {
      name: document.getElementById("team2").value,
      players: document.getElementById("players2").value.split("\n"),
      goals: goals.team2,
    },
  };
  localStorage.setItem("gameData", JSON.stringify(gameData));
}

function loadSavedData() {
  const savedData = localStorage.getItem("gameData");
  if (savedData) {
    const gameData = JSON.parse(savedData);
    document.getElementById("team1").value = gameData.team1.name;
    document.getElementById("players1").value =
      gameData.team1.players.join("\n");
    document.getElementById("team2").value = gameData.team2.name;
    document.getElementById("players2").value =
      gameData.team2.players.join("\n");
    goals.team1 = gameData.team1.goals;
    goals.team2 = gameData.team2.goals;
    updateScoreboard();
    seconds = gameData.seconds || 0;
    document.getElementById("timer-display").innerText = formatTime(seconds);
    if (gameData.isTimerRunning) {
      startTimer();
    }
    if (
      seconds > 0 ||
      Object.keys(goals.team1).length ||
      Object.keys(goals.team2).length
    ) {
      document.getElementById("setup-screen").style.display = "none";
      document.getElementById("scoreboard-screen").style.display = "block";
      loadTeamData();
    }
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function generatePDF() {
  const gameData = JSON.parse(localStorage.getItem("gameData"));
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Data do Jogo: ${formatDate(gameData.date)}`, 10, 10);
  doc.text(`${gameData.team1.name} vs ${gameData.team2.name}`, 10, 20);
  doc.text(
    `Placar: ${Object.values(gameData.team1.goals).reduce(
      (a, b) => a + b,
      0
    )} - ${Object.values(gameData.team2.goals).reduce((a, b) => a + b, 0)}`,
    10,
    30
  );
  doc.text(`Gols do time ${gameData.team1.name}:`, 10, 40);
  let yPosition = 50;
  for (const [player, numGoals] of Object.entries(gameData.team1.goals)) {
    doc.text(`${player}: ${numGoals} gol(s)`, 10, yPosition);
    yPosition += 10;
  }
  doc.text(`Gols do time ${gameData.team2.name}:`, 10, yPosition + 10);
  yPosition += 20;
  for (const [player, numGoals] of Object.entries(gameData.team2.goals)) {
    doc.text(`${player}: ${numGoals} gol(s)`, 10, yPosition);
    yPosition += 10;
  }
  doc.save("Relatorio_Jogo.pdf");
}

document.getElementById("team1").addEventListener("input", saveData);
document.getElementById("players1").addEventListener("input", saveData);
document.getElementById("team2").addEventListener("input", saveData);
document.getElementById("players2").addEventListener("input", saveData);

window.onload = loadSavedData;
