document.addEventListener("DOMContentLoaded", function() {

    // Elements from the HTML
    const playerDiceContainer = document.getElementById("player-dice");
    const aiDiceContainer = document.getElementById("ai-dice");
    const makeBetButton = document.getElementById("make-bet");
    const callBluffButton = document.getElementById("call-bluff");
    const betQuantityInput = document.getElementById("bet-quantity");
    const betValueInput = document.getElementById("bet-value");
    const currentBetDisplay = document.getElementById("current-bet");
    const gameStatusDisplay = document.getElementById("game-status");
    const betHistoryContainer = document.getElementById("bet-history")
    const rollDiceButton = document.getElementById("roll-dice");;


    console.log("betQuantityInput:", betQuantityInput); // Check if the element is correctly obtained
    console.log("betValueInput:", betValueInput);

    // Game state variables
    let playerDice = [];
    let aiDice = [];
    let currentPlayerBet = { quantity: 0, value: 0 };
    let playerTurn = true; // true if it's the player's turn, false for AI's turn

    // Initialize game
    function initGame() {
        aiDiceContainer.style.display = "none";
        updateDiceDisplay(playerDiceContainer, playerDice);
        // AI dice are not displayed to the player
        currentPlayerBet = { quantity: 0, value: 0 };
        playerTurn = true; // or determine randomly who starts
        updateGameStatus("Game started. Your turn.");
    }

    function initRoll(){
        aiDiceContainer.style.display = "none";
        playerDice = rollDice(playerDice.length); // Roll dice based on the current number of player's dice
        aiDice = rollDice(aiDice.length); // Roll dice based on the current number of AI's dice
        currentPlayerBet = { quantity: 0, value: 0 }; // Reset the current bet
        updateDiceDisplay(playerDiceContainer, playerDice);
        updateGameStatus(playerTurn ? "Your turn. Make a bet." : "AI's turn."); // Update the turn status
    }

    // Roll dice
    function rollDice(numberOfDice) {
        hideAIDice() 
        let rolls = [];
        for (let i = 0; i < numberOfDice; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        return rolls;
    }

    rollDiceButton.addEventListener("click", function() {
        clearBetHistory()
        if (playerDice.length === 0 || aiDice.length === 0) {
            // Implement game restart logic
            if (confirm("Game over. Do you want to restart?")) {
                // Reset dice for both player and AI
                playerDice = rollDice(5);
                aiDice = rollDice(5);
    
                // Reset current bet
                currentPlayerBet = { quantity: 0, value: 0 };
    
                // Reset UI elements
                updateDiceDisplay(playerDiceContainer, playerDice);
                updateDiceDisplay(aiDiceContainer, aiDice);
                updateCurrentBet();
                updateGameStatus("Game restarted. Your turn.");
    
                // Set player's turn to true for new game
                playerTurn = true;
            }
        } else {
            document.getElementById('bet-history').innerHTML = ''; // Clear bet history
            initRoll(); // Start a new round
        }
    });

    function clearInputFields() {
        document.getElementById('bet-quantity').value = '';
        document.getElementById('bet-value').value = '';
    }
    
    // Assuming this is your function to handle the bet submission
    function updateBetHistory(bettor, quantity, value) {
        const betHistoryDiv = document.getElementById('bet-history');
        const newBetEntry = document.createElement('p'); // Create a new paragraph for each bet
        newBetEntry.textContent = `${bettor} bet: ${quantity} of ${value}`; // Set text content based on the bet
        betHistoryDiv.appendChild(newBetEntry); // Append the new entry to the bet history
    }

    function clearBetHistory() {
        document.getElementById('bet-history').innerHTML = '';
    }

    // Update dice display
    function updateDiceDisplay(container, diceArray) {
        container.innerHTML = ''; // Clear current dice
        diceArray.forEach(die => {
            const dieElement = document.createElement("div");
            dieElement.className = "die";
            dieElement.textContent = die;
            container.appendChild(dieElement);
        });
    }

    // Update game status message
    function updateGameStatus(message) {
        gameStatusDisplay.textContent = message;
    }

    // Player makes a bet
    makeBetButton.addEventListener("click", function() {
        // Directly retrieve and parse the input values
        const quantity = parseInt(betQuantityInput.value, 10);
        const value = parseInt(betValueInput.value, 10);

        console.log("Quantity:", quantity, "Value:", value);

            // Check for NaN
        if (!isNaN(quantity) && !isNaN(value)) {
            updateBetHistory('Player', quantity, value);
        // Check if it's the first bet (initial bet)
        if (currentPlayerBet.quantity === 0 && currentPlayerBet.value === 0) {
            // For the first bet, any non-zero quantity and value is valid
            if (quantity > 0 && value > 0) {
                currentPlayerBet = { quantity, value };
                updateCurrentBet();
                playerTurn = false;
                aiTurn();
            } else {
                alert("Invalid initial bet. Both quantity and value must be greater than zero.");
            }
        } else {
            // For subsequent bets, check if the bet is an increase in quantity or value
            if ((quantity > currentPlayerBet.quantity) || (value === currentPlayerBet.value)) 
                // (quantity === currentPlayerBet.quantity && value > currentPlayerBet.value) || 
                // (quantity > currentPlayerBet.quantity && value === currentPlayerBet.value)) 
            {
                currentPlayerBet = { quantity, value };
                updateBetHistory('Player', quantity, value);
                updateCurrentBet();
                playerTurn = false;
                aiTurn();
            } else {
                alert("Invalid bet. You must increase the quantity or the dice value.");
            }
        }
        clearInputFields();
    }});

    // Update current bet display
    function updateCurrentBet() {
        currentBetDisplay.textContent = `Current Bet: ${currentPlayerBet.quantity} of ${currentPlayerBet.value}`;
    }

    // Player calls bluff
    callBluffButton.addEventListener("click", function() {
        if (playerTurn) {
            // Check if the AI's bet was a bluff
            checkBluff();
        } else {
            alert("You can't call bluff on your own bet!");
        }
    });

    function showAIDice() {
        document.getElementById('ai-dice').style.display = 'flex';
    }

    function hideAIDice() {
        document.getElementById('ai-dice').style.display = 'none';
    }

    function updateBetHistory(bettor, quantity, value) {
        const betHistoryDiv = document.getElementById('bet-history');
        const newBetEntry = document.createElement('p');
        newBetEntry.textContent = `${bettor} bet: ${quantity} of ${value}`;
        betHistoryDiv.appendChild(newBetEntry);
    }

    // Check if the last bet was a bluff
    function checkBluff() {

        //check AI dice
        console.log(aiDice);
        showAIDice()

        let totalMatchingDice = playerDice.filter(die => die === currentPlayerBet.value).length;
        totalMatchingDice += aiDice.filter(die => die === currentPlayerBet.value).length;
    
        // Reveal AI's dice whenever a bluff is called
        updateDiceDisplay(aiDiceContainer, aiDice);
    
        if (totalMatchingDice < currentPlayerBet.quantity) {
            // Bluff was called correctly
            updateGameStatus("Bluff called correctly. AI loses a die.");
            aiDice.pop(); // AI loses a die
        } else {
            // Bluff call was incorrect
            updateGameStatus("Bluff call incorrect. You lose a die.");
            playerDice.pop(); // Player loses a die
        }
    
        // Update player's dice display and check for game end
        updateDiceDisplay(playerDiceContainer, playerDice);
    
    if (playerDice.length === 0 || aiDice.length === 0) {
        endGame();
    } else {
        // Remove the setTimeout here, as the rollDiceButton click will handle the new round
        updateGameStatus(playerTurn ? "Your turn. Roll the dice." : "AI's turn. Roll the dice.");
    }
    }

    // AI's turn logic
    function aiTurn() {
        updateGameStatus("AI is thinking...");
        
        // Set a delay before executing AI's move
        setTimeout(() => {
            // Simple AI Logic: Randomly decide to increase the bet or call a bluff
            let bluffProbability = 0.2; // Start with a 20% chance of calling bluff
    
            // Increase bluff probability based on how high the current bet is
            if (currentPlayerBet.quantity > 3) {
                bluffProbability += 0.2;
            }
    
            if (Math.random() < bluffProbability) {
                // AI calls bluff
                updateGameStatus("AI is calling bluff.");
                checkBluff();
            } else {
                // AI makes a higher bet
                const newQuantity = currentPlayerBet.quantity + Math.floor(Math.random() * 2) + 1; // Increase by 1 or 2
                const newValue = currentPlayerBet.value; // Keep the value same or you can change this logic
                currentPlayerBet = { quantity: newQuantity, value: newValue };
                updateCurrentBet();
                updateGameStatus(`AI bet: ${newQuantity} of ${newValue}`);
                playerTurn = true; // Give turn back to the player
            }
        }, 2000); // Delay in milliseconds (2000 ms = 2 seconds)
    }

    function endGame() {
        if (playerDice.length === 0) {
            updateGameStatus("Game Over. You lost.");
        } else if (aiDice.length === 0) {
            updateGameStatus("Congratulations! You won.");
        }
        // Disable buttons or offer a restart option
    }
    initGame(); // Start the game
});