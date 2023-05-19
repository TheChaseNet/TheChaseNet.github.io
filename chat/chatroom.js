var database = firebase.database();
var chatRef = database.ref('chat');

chatRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    displayMessage(message.time, message.name, message.text);
});

function displayMessage(time, name, text) {
    var chatContainer = document.getElementById('chat-container');
    var messageElement = document.createElement('div');
    messageElement.innerText = '[' + time + '] ' + '<' + name + '> ' + text;
    chatContainer.appendChild(messageElement);
}

var storedUsername = localStorage.getItem('username');

if (storedUsername) {
    var nameInput = document.getElementById('name-input');
    nameInput.value = storedUsername;
    nameInput.disabled = true;
} else {
    var form = document.getElementById('message-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        var nameInput = document.getElementById('name-input');
        var name = nameInput.value;
        localStorage.setItem('username', name);
        nameInput.disabled = true;
        form.submit();
    });
}

var form = document.getElementById('message-form');
form.addEventListener('submit', function(event) {
    event.preventDefault();
    var messageInput = document.getElementById('message-input');
    var message = messageInput.value;
    var newMessageRef = chatRef.push();
    newMessageRef.set({
        time: getCurrentTime(),
        name: storedUsername || 'Anonymous',
        text: message
    });
    messageInput.value = '';
});

function getCurrentTime() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    hours = (hours < 10 ? '0' : '') + hours;
    minutes = (minutes < 10 ? '0' : '') + minutes;
    return hours + ':' + minutes;
}
