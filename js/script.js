var gameField = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
]

var playerOneScore = 0;
var playerTwoScore = 0;

document.getElementById('current-turn').innerHTML = "Player One";

var counter = 1;

var currentRollResult = 0;

// function to find best turn
function StartAlgorithm() {
    let next_turn;
    let start = currentRollResult;
    let available = availableTurns(start).slice();
    let bestTurn = 45;

    for (let i = 0; i < available.length; i++) {
        gameField[available[i].first-1] = 0;
        gameField[available[i].second-1] = 0;
        let temp_field = gameField.slice();
        for (let j = 3; j <= 12; j++) {
            let turn = expectimax(j, temp_field, 4);
            if (turn < bestTurn) {
                bestTurn = turn;
                next_turn = [available[i].first, available[i].second];
            }
        }

        console.log(bestTurn);
        gameField[available[i].first-1] = available[i].first;
        gameField[available[i].second-1] = available[i].second;
    }
    return next_turn;
}

// check for free space
const availableTurns = (start) => {
    let temp_array = gameField.slice();
    let array = [];
    for (let i = 0; i < temp_array.length; i++) {
        if (temp_array[i] !== 0) {
            if (start / 2 !== temp_array[i]) {
                if (start - temp_array[i] < 10) {
                    if (start - temp_array[i] === temp_array[start - temp_array[i] - 1]) {
                        array.push({first: temp_array[i], second: temp_array[start - temp_array[i] - 1]});
                        temp_array[i] = 0;
                        temp_array[start - temp_array[i] - 1] = 0;
                    }
                }
            } 
        }
        
    }
    return array;
}

// main function
function expectimax(start, field, depth) {
    let available = availableTurns(start).slice();
    if (available.length === 0 || depth === 0) {
        let score = 0;
        for (let i = 0; i < field.length; i++) {
            score += field[i];
        }
        return score;
    }
    let bestTurn = 45;
        for (let i = 0; i < available.length; i++) {
            field[available[i].first] = 0;
            field[available[i].second] = 0;
            for (let j = 3; j <= 12; j++) {
                let turn = expectimax(j, field, depth-1);
                if (turn < bestTurn) {
                    bestTurn = turn;
                }
            }
            field[available[i].first] = available[i].first;
            field[available[i].second] = available[i].second;
        }
        return bestTurn;
}

const startNextTurn = async () => {
    gameField = [1,2,3,4,5,6,7,8,9];
    document.getElementById('current-turn').innerHTML = "Player Two";
    document.querySelector('.roll-result-number').innerHTML = 0;
    counter++;
    for (let i = 1; i <= 9; i++) {
        document.getElementById(i).disabled = true;
        document.getElementById(i).checked = false;
    }
    
    let iter = true;
    while(iter) {
        document.querySelector('.roll-button').click();
        let endgame_result = checkForEndGame();

        if (endgame_result === false) {
            let next_turn = StartAlgorithm();
            document.getElementById(next_turn[0]).click();
            gameField[next_turn[0]-1] = 0;
            gameField[next_turn[1]-1] = 0;
            console.log('Taking a break...');
            await sleep(3000);
            console.log('Three second later');
        } else {
            iter = !iter;
        }
    }
}



//Additional//
const fillPage = () => {
    for (let i = 0; i < gameField.length; i++) {
        document.querySelector('.field').innerHTML += `
        <div class="field-item">
            <div class="field-item__number">
                <span>`+ gameField[i] +`</span>
            </div>
            <div class="field-item__button">
                <input type="checkbox" class="number-checkbox" id="`+ gameField[i] +`">
            </div>
        </div>
        `
        document.getElementById(gameField[i]).disabled = true;
    }
}

fillPage();


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function rollClick() {
    document.querySelector('.roll-animation').classList.add('active');
    setTimeout(()=> {
        document.querySelector('.roll-animation').classList.remove('active');
    }, 1000);
   
}

window.onclick = event => {
    if (event.target.classList.contains('roll-button')) {
        let numbers = rollTheDice();
        if (checkForAccess()) {
            currentRollResult = (numbers[0] + numbers[1]);
        } else {
            currentRollResult = numbers[0];
        }
        console.log(currentRollResult);
        
        rollClick();

        document.querySelector('.roll-result-number').innerHTML= (currentRollResult);
        witchCanBeChecked(currentRollResult);
        let endgame = checkForEndGame();
        if(endgame !== false) {
            alert('last roll = '+currentRollResult +'; endgame score = ' + endgame);
            if (counter === 1) {
                playerOneScore = endgame;
            } else {
                playerTwoScore = endgame;
                showEndResult();
                location.reload();
            }
            startNextTurn();
        }
    }

    if (event.target.classList.contains('number-checkbox')) {
        if (document.getElementById(event.target.id).checked) {
            let next = (currentRollResult - event.target.id);
            document.getElementById(event.target.id).checked = true;
            document.getElementById(next).checked = true;
            gameField[Number(event.target.id)-1] = 0;
            gameField[next-1] = 0;
            disableAll();
        }
    }
}



const showEndResult = () => {
    if (playerOneScore < playerTwoScore) {
        alert('Player One Wins!' + ' score is: Player1 = ' + playerOneScore + '; Player2 = ' + playerTwoScore);
    } else if (playerOneScore === playerTwoScore) {
        alert('Draw!'+' score is: Player1 = ' + playerOneScore + '; Player2 = ' + playerTwoScore);
    } else if (playerOneScore > playerTwoScore) {
        alert('Player Two Wins! '+ ' score is: Player1 = ' + playerOneScore + '; Player2 = ' + playerTwoScore);
    }
}

const checkForEndGame = () => {
    let score = 0;
    for (let i = 1; i <= 9; i++) {
        let currentSquare = document.getElementById(i);
        if (currentSquare.disabled === false){
            return false;
        }
        if (currentSquare.checked === false){
            score += Number(currentSquare.id);
        }
    }
    return score;
}

const checkForAccess = () => {
    for (let i = 6; i < gameField.length; i++) {
        if(gameField[i] !== 0) {
            return true;
        }
    }
    return false;
}

const witchCanBeChecked = (number) => {
    let alreadyChecked = [];

    let len = (number > 10) ? 10: number;
   
    for (let i = 1; i < len; i++) {
        if (number / 2 !== i) {
            if (document.getElementById(i).checked !== true) {
                document.getElementById(i).disabled = false;
            } else {
                alreadyChecked.push(i);
            }
        }
    }
    for (let i = 0; i < alreadyChecked.length; i++) {
        let num = alreadyChecked[i];
        try {
            document.getElementById(number - num).disabled = true;
        } catch (error) {
            
        }
        
    }
    if (number > 10) {
        for (let i = 1; i <= number - 10; i++) {
            document.getElementById(i).disabled = true;
        }
    }
}

const disableAll = () => {
    for (let i = 1; i <= 9; i++) {
        document.getElementById(i).disabled = true;
    }
}
disableAll();

const rollTheDice = () => {
    let first = getRandomInt(1,7);
    let second = getRandomInt(1,7);
    return [first, second];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}