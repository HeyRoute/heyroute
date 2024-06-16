let replyCounter = 0;
const apiKey = 'uhFFfoM3C49D0zFKheebvdPQYzQN4NO7'; // Your API key

// Function to create a chat session
const createChatSession = async () => {
    const response = await fetch('https://gateway-dev.on-demand.io/chat/v1/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify({
            "pluginIds": [],
            "externalUserId": "user-" + replyCounter // Unique user ID for each session
        })
    });

    const data = await response.json();
    console.log('Chat session created:', data); // Debugging line to check the session creation response
    return data.chatSession.id; // Extracting the session ID
}

// Function to answer a query using the session ID from createChatSession
const answerQuery = async (sessionId, query) => {
    const response = await fetch(`https://gateway-dev.on-demand.io/chat/v1/sessions/${sessionId}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify({
            "endpointId": "predefined-openai-gpt4turbo",
            "query": query,
            "pluginIds": ["plugin-1718454695", "plugin-1718453778", "plugin-1718454376", "plugin-1718453486", "plugin-1717458428", "plugin-1717459265", "plugin-1717455118"],
            "responseMode": "sync"
        })
    });

    const data = await response.json();
    console.log('Query response:', data); // Debugging line to check the response data
    return data; // Return the response data
}

// Function to handle sending a message
const sendMessage = async () => {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== '') {
        addMessage(userInput, 'user');
        document.getElementById('user-input').value = '';

        // Increment reply counter
        replyCounter++;

        // Display reply counter
        console.log(`Replies: ${replyCounter}`);

        try {
            // Create a new chat session and get the session ID
            const sessionId = await createChatSession();

            // Get the bot's response for the user input
            const response = await answerQuery(sessionId, userInput);
            console.log('Query response:', response); // Log the query response

            // Extract and format the bot's reply based on the actual API response structure
            if (response.chatMessage && response.chatMessage.answer) {
                const botReply = response.chatMessage.answer;
                addMessage(formatBotReply(botReply), 'bot');
            } else {
                addMessage('No valid response received from the bot', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('An error occurred. Please try again.', 'bot');
        }
    }
}

// Event listener for the send button
document.getElementById('send-button').addEventListener('click', sendMessage);

// Event listener for pressing Enter in the input field
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// Function to add a message to the chat
function addMessage(text, sender) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${sender}`;
    if (sender === 'bot') {
        messageContainer.innerHTML = text; // Support HTML content for bot messages
    } else {
        messageContainer.textContent = text;
    }
    document.getElementById('messages').appendChild(messageContainer);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

// Function to format the bot's reply with HTML
function formatBotReply(reply) {
    // Basic formatting to ensure readability
    return reply
        .replace(/- /g, '<br>- ')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(\r\n|\r|\n)/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>'); // To handle Markdown links
}
