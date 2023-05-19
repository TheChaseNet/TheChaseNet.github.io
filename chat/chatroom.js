var database = firebase.database();
var chatRef = database.ref('chat');

chatRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
  displayMessage(message.time, message.name, message.text);
});

function displayMessage(time, name, text) {
  var chatContainer = document.getElementById('chat-container');
  var messageElement = document.createElement('div');

  // Formatting the timestamp
  var timeElement = document.createElement('span');
  timeElement.innerText = '[' + time + '] ';
  timeElement.style.fontWeight = 'bold';
  timeElement.style.color = '#999';
  messageElement.appendChild(timeElement);

  // Formatting the username
  var nameElement = document.createElement('span');
  nameElement.innerText = '<' + name + '> ';
  nameElement.style.fontWeight = 'bold';
  nameElement.style.fontStyle = 'italic';
  nameElement.style.color = getRandomColor(name); // Random color based on the username
  messageElement.appendChild(nameElement);

  // Formatting the message text
  var textElement = document.createElement('span');
  textElement.innerText = text;
  textElement.style.fontStyle = 'italic';
  textElement.style.color = getRandomColor(name); // Random color based on the username
  messageElement.appendChild(textElement);

  chatContainer.appendChild(messageElement);
}

var MAX_MESSAGE_LENGTH = 100;
var MAX_USERNAME_LENGTH = 12;

var storedUsername = localStorage.getItem('username');
var nameInput = document.getElementById('name-input');

if (storedUsername) {
  nameInput.value = storedUsername;
  nameInput.disabled = true;
}

var form = document.getElementById('message-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();
  var messageInput = document.getElementById('message-input');
  var message = messageInput.value.trim();
  var name = nameInput.value.trim();

  // Check if the message exceeds the character limit
  if (message.length > MAX_MESSAGE_LENGTH) {
    alert('Message exceeds the character limit of ' + MAX_MESSAGE_LENGTH + ' characters.');
    return;
  }

  // Check if the username exceeds the character limit
  if (name.length > MAX_USERNAME_LENGTH) {
    alert('Username exceeds the character limit of ' + MAX_USERNAME_LENGTH + ' characters.');
    return;
  }

  // If the storedUsername is not available or disabled, use the entered username
  if (!storedUsername || nameInput.disabled) {
    localStorage.setItem('username', name);
    nameInput.disabled = true; // Lock the username field after setting the new username
  }

  var newMessageRef = chatRef.push();
  newMessageRef.set({
    time: getCurrentTime(),
    name: storedUsername || name,
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

// Function to generate a random color based on the username
function getRandomColor(username) {
  var colors = ['#FF5733', '#C70039', '#900C3F', '#581845', '#FFC300', '#DAF7A6', '#FF5733', '#C70039', '#900C3F', '#581845', '#FFC300', '#DAF7A6'];
  var usernameHash = 0;
  for (var i = 0; i < username.length; i++) {
    usernameHash += username.charCodeAt(i);
  }
  var colorIndex = usernameHash % colors.length;
  return colors[colorIndex];
}
