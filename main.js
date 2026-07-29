function Node(value) {
  this.value = Array.from(value);
  this.children = [];
  this.level = 0;
  this.parent = null;
  this.solution = false;
}

let decisionThree = null;
let pcSolutions = [];

let board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

let turn = 0; // 0 = user, 1 = pc
let gameOver = false;

function renderBoard() {
  const html = board.map((row) => {
    const cells = row.map((cell) => {
      return `<button class="cell">${cell}</button>`;
    });
    return `<div class="row">${cells.join("")}</div>`;
  });

  document.querySelector("#board").innerHTML = html.join("");
  
  // Re-vinculamos los eventos cada vez que el tablero se renderiza
  if (!gameOver && turn === 0) {
    playerPlays();
  }
}

function startGame() {
  gameOver = false;
  pcSolutions = [];
  decisionThree = null; // Resetear árbol anterior
  
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  
  turn = Math.random() <= 0.5 ? 0 : 1;
  renderBoard();
  renderPlayer();

  if (turn === 1) {
    PCPlaysV2();
  }
}

function showMessage(message) {
  const messageElement = document.querySelector("#player");
  messageElement.textContent = message;
  gameOver = true;
}

function renderPlayer() {
  if (!gameOver) {
    document.querySelector("#player").textContent = `${turn === 0 ? "Player turn" : "PC turn"}`;
  }
}

function PCPlaysV2() {
  if (gameOver) return;

  console.log("PC Plays...V2 ");
  pcSolutions = []; // Limpiar soluciones anteriores

  const copy = JSON.parse(JSON.stringify(board));
  const root = new Node(copy);
  processNode(root, true, 0);

  console.log("final", root);

  if (pcSolutions.length > 0) {
    let min = 100;
    for (let i = 0; i < pcSolutions.length; i++) {
      if (pcSolutions[i].level < min) {
        min = pcSolutions[i].level;
      }
    }
    
    // Filtrar solo las soluciones más rápidas (menor nivel)
    let bestSolutions = pcSolutions.filter((sol) => sol.level === min);
    const moveIndex = Math.floor(Math.random() * bestSolutions.length);
    
    const move = getRoot(bestSolutions[moveIndex]);
    
    decisionThree = move;
    board = JSON.parse(JSON.stringify(move.value));
    
    turn = 0;
    renderBoard();
    renderPlayer();
    
    const won = checkIfWinner();

    if (won === "none") {
      if (checkIfDraw()) {
        showMessage("¡La partida terminó en empate!");
        return;
      }
    }
  } else {
    // Si no hay soluciones de victoria, la PC hace un movimiento aleatorio disponible
    makeRandomMove();
  }
}

function makeRandomMove() {
  let availableMoves = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === "") {
        availableMoves.push({ i, j });
      }
    }
  }

  if (availableMoves.length > 0) {
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    board[randomMove.i][randomMove.j] = "X";
    turn = 0;
    renderBoard();
    renderPlayer();
    
    const won = checkIfWinner();
    if (won === "none" && checkIfDraw()) {
      showMessage("¡La partida terminó en empate!");
    }
  } else {
    showMessage("¡La partida terminó en empate!");
  }
}

function processNode(root, nturn, level) {
  if (checkIfPCWinner(root.value) || checkIfPlayerWinner(root.value) || checkIfArrDraw(root.value)) {
    return;
  }

  for (let i = 0; i < root.value.length; i++) {
    for (let j = 0; j < root.value[i].length; j++) {
      if (root.value[i][j] === "") {
        root.children.push(createChild(root, i, j, nturn, level));
      }
    }
  }

  for (let i = 0; i < root.children.length; i++) {
    if (checkIfPCWinner(root.children[i].value)) {
      pcSolutions.push(root.children[i]);
    }
  }

  for (let i = 0; i < root.children.length; i++) {
    const item = root.children[i];
    processNode(item, !nturn, level + 1);
  }
}

function createChild(node, i, j, nturn, level) {
  const copy = JSON.parse(JSON.stringify(node.value));

  if (!nturn) {
    copy[i][j] = "O";
  } else {
    copy[i][j] = "X";
  }
  const newNode = new Node(copy);
  newNode.turn = nturn;
  newNode.level = level + 1;
  newNode.parent = node;
  return newNode;
}

function playerPlays() {
  console.log("player plays");

  document.querySelectorAll(".cell").forEach((buttonCell, i) => {
    const row = Math.floor(i / 3);
    const column = i % 3;

    const newButton = buttonCell.cloneNode(true);
    buttonCell.parentNode.replaceChild(newButton, buttonCell);

    if (board[row][column] === "") {
      newButton.addEventListener("click", () => {
        if (gameOver) return;
        if (board[row][column] !== "") return;

        board[row][column] = "O";
        turn = 1;
        renderBoard();
        renderPlayer();

        const won = checkIfWinner();

        if (won === "none") {
          if (checkIfDraw()) {
            showMessage("¡La partida terminó en empate!");
            return;
          }
          PCPlaysV2();
        }
      });
    }
  });
}

function checkIfWinner() {
  if (checkIfPCWinner(board)) {
    showMessage("🏆 La PC ha ganado");
    return "pcwon";
  }
  if (checkIfPlayerWinner(board)) {
    showMessage("🏆 El jugador ha ganado");
    return "playerwon";
  }
  return "none";
}

function checkIfDraw() {
  return checkIfArrDraw(board);
}

function checkIfArrDraw(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j] === "") {
        return false;
      }
    }
  }
  return true;
}

function checkIfPCWinner(arr) {
  const PCWon = [
    arr[0][0] === "X" && arr[1][1] === "X" && arr[2][2] === "X",
    arr[2][0] === "X" && arr[1][1] === "X" && arr[0][2] === "X",
    arr[0][0] === "X" && arr[1][0] === "X" && arr[2][0] === "X",
    arr[0][1] === "X" && arr[1][1] === "X" && arr[2][1] === "X",
    arr[0][2] === "X" && arr[1][2] === "X" && arr[2][2] === "X",
    arr[0][0] === "X" && arr[0][1] === "X" && arr[0][2] === "X",
    arr[1][0] === "X" && arr[1][1] === "X" && arr[1][2] === "X",
    arr[2][0] === "X" && arr[2][1] === "X" && arr[2][2] === "X",
  ];
  return PCWon.includes(true);
}

function checkIfPlayerWinner(arr) {
  const playerWon = [
    arr[0][0] === "O" && arr[1][1] === "O" && arr[2][2] === "O",
    arr[2][0] === "O" && arr[1][1] === "O" && arr[0][2] === "O",
    arr[0][0] === "O" && arr[1][0] === "O" && arr[2][0] === "O",
    arr[0][1] === "O" && arr[1][1] === "O" && arr[2][1] === "O",
    arr[0][2] === "O" && arr[1][2] === "O" && arr[2][2] === "O",
    arr[0][0] === "O" && arr[0][1] === "O" && arr[0][2] === "O",
    arr[1][0] === "O" && arr[1][1] === "O" && arr[1][2] === "O",
    arr[2][0] === "O" && arr[2][1] === "O" && arr[2][2] === "O",
  ];
  return playerWon.includes(true);
}

function getRoot(node) {
  let n = node;
  while (n.parent && n.parent.parent !== null) {
    n = n.parent;
  }
  return n;
}

// FUNCIONALIDAD DEL BOTÓN REINICIAR:
// Vinculamos el botón HTML con la función startGame
document.querySelector("#reset-btn").addEventListener("click", () => {
  startGame();
});

// Inicializar el primer juego al cargar la página
startGame();