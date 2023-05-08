// When the user clicks anywhere outside of the modal, close it
const modal = document.querySelector(".modal");
const modalContent = document.querySelector("#modal-content");
const content = document.querySelector("#content");
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    content.classList.remove("modal-open");
    game.start();
  }
}

// Initialize index of grid items
const gridItems = document.querySelectorAll(".grid-item");
let index = 0;
for (item of [...gridItems]) {
  item.dataset.index = index++;
  item.addEventListener("click", (event) => {
    game.playRound(parseInt(event.target.dataset.index));
  })
}

// Create the gameboard module
const gameBoard = (() => {
  "use strict";

  let state = [];
  function initialize() {
    state = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }

  function setState(index, marker) {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    state[rowIndex][colIndex] = marker;
  }

  function getState(index) {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    return state[rowIndex][colIndex];
  }

  function isCellEmpty(index) {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    return state[rowIndex][colIndex] === "";
  }

  function isFull() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (state[i][j] === "") {
          return false;
        }
      }
    }
    return true;
  }

  function getStatus() {
    let marker = "";
    let winner;
    let winningPlayer;

    // check rows
    for (let i = 0; i < 3; i++) {
      winner = true;
      winningPlayer = state[i][0];
      if (winningPlayer === "") {
        winner = false;
        continue;
      }
      for (let j = 1; j < 3; j++) {
        if (winningPlayer !== state[i][j]) {
          winner = false;
          continue;
        }
      }
      if (winner === true) {
        return { status: "end", winner: winningPlayer };
      } 
    }

    // check columns
    for (let j = 0; j < 3; j++) {
      winner = true;
      winningPlayer = state[0][j];
      if (winningPlayer === "") {
        winner = false;
        continue;
      }
      for (let i = 1; i < 3; i++) {
        if (winningPlayer !== state[i][j]) {
          winner = false;
          continue;
        }
      }
      if (winner === true) {
        return { status: "end", winner: winningPlayer };
      } 
    }

    // check diagonals
    winningPlayer = state[0][0];
    winner = true;
    for (let i = 0; i < 3; i++) {
      
      if (winningPlayer === "") {
        winner = false;
        continue;
      }
      // Forward Diagonal
      if (winningPlayer !== state[i][i]) {
        winner = false;
      }
    }  
    if (winner === true) {
      return { status: "end", winner: winningPlayer };
    }     
      
    winningPlayer = state[0][2];
    winner = true;
    for (let i = 0; i < 3; i++) {

      if (winningPlayer === "") {
        winner = false;
        continue;
      }
      // Backward Diagonal
      if (winningPlayer !== state[i][2 - i]) {
        winner = false;
      }
    }
    if (winner === true) {
      return { status: "end", winner: winningPlayer };
    } 

    if (isFull()) {
      return { status: "end", winner: "tie" };
    } 

    return { status: "started", winner: "" };
  }

  return {
    setState,
    getState,
    getStatus,
    isCellEmpty,
    initialize
  };
})();


// Mark the gameboard
function markBoard(index, marker) {
  gridItems.forEach( (item) => {
    if (parseInt(item.dataset.index) === index) {
      item.textContent = marker;
      return;
    }
  });
}

function resetBoardMarkers() {
  gridItems.forEach( (item) => {
    item.textContent = "";
  });
  modalContent.textContent = "";
}

// Create player factory
const player = (name, marker) => {
  return {
    name,
    marker
  };
};

function getNameFromMarker(marker, players) {
  for (const player of players) {
    if (player.marker === marker) return player.name;
  }
  return "Not found";
}

const player1 = player("Player1", "X");
const player2 = player("Player2", "O");


const game = (() => {
  
  let players = [];
  let currentPlayer;

  function start() {
    players = [];
    resetBoardMarkers()
    gameBoard.initialize();
    game.addPlayer(player1);
    game.addPlayer(player2);
    currentPlayer = players[0];
  }

  function addPlayer(player) {
    players.push(player);
  }

  function nextPlayer() {
    if (currentPlayer === undefined) {
      currentPlayer = players[0];
    } else {
      currentPlayer === players[0] ? currentPlayer = players[1] : currentPlayer = players[0];
    }
  }

  function playRound(index) {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    const currentState = gameBoard.getState(index);
    const marker = currentPlayer.marker;
    if (currentState !== "") {
      return;
    }
    gameBoard.setState(index, marker);
    markBoard(index, marker);
    // Check if there is a winner of if the game ended
    const status = gameBoard.getStatus();
    if (status.status === "end") {
      // show modal
      modalContent.textContent = getEndText(status, players);
      modal.style.display = "flex";
      content.classList.add("modal-open");
    }

    nextPlayer();
  }

  return { 
    start,
    addPlayer,
    nextPlayer,
    getCurrentPlayer: () => currentPlayer,
    playRound
  }
}
)();

function getEndText(status, players) {
  if (status.winner === "tie") {
    return "It's a tie!"
  } else {
    const winnerName = getNameFromMarker(status.winner, players);
    return `The winner is ${winnerName}`;
  }
}

game.start();
