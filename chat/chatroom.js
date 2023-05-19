// Get a reference to the Firebase Realtime Database
var database = firebase.database();

// Reference to the chat messages in the database
var chatRef = database.ref('chat');

// Listen for new messages and display them
chatRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    displayMessage(message.time, message.name, message.text);
});

// Display a message in the chat container
function displayMessage(time, name, text) {
    var chatContainer = document.getElementById('chat-container');
    var messageElement = document.createElement('div');
    messageElement.innerText = '[' + time + '] ' + '<' + name + '> ' + text;
    chatContainer.appendChild(messageElement);
}

// Handle form submission
var form = document.getElementById('message-form');
form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get user input
    var nameInput = document.getElementById('name-input');
    var messageInput = document.getElementById('message-input');
    var name = nameInput.value;
    var message = messageInput.value;

    // Save the message to the database
    var newMessageRef = chatRef.push();
    newMessageRef.set({
        time: getCurrentTime(),
        name: name,
        text: message
    });

    // Clear the message input
    messageInput.value = '';
});

// Get the current time in HH:MM format
