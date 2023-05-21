var database = firebase.database();
var chatRef = database.ref('chat');

// Track the message count in localStorage
const messageCountKey = 'messageCount';
const rateLimitThreshold = 3; // Maximum number of messages allowed per time frame (e.g., 10 messages per hour)
const timeFrame = 1000 * 5; // Time frame in milliseconds (e.g., 1 hour)

chatRef.limitToLast(100).on('child_added', function(snapshot) {
  var message = snapshot.val();
  displayMessage(message.time, message.name, message.text);

  // Remove older messages if the message count exceeds the maximum limit
  var chatContainer = document.getElementById('chat-container');
  if (chatContainer.children.length > 100) {
    chatContainer.removeChild(chatContainer.firstChild);
  }

  // Scroll to the bottom of the chat container
  chatContainer.scrollTop = chatContainer.scrollHeight;
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

  // Check if the message contains any banned words
  if (containsBannedWords(message)) {
    alert('Message contains banned words.');
    return;
  }

  // If the storedUsername is not available or disabled, use the entered username
  if (!storedUsername || nameInput.disabled) {
    localStorage.setItem('username', name);
    nameInput.disabled = true; // Lock the username field after setting the new username
  }

  // Rate Limit Check
  if (isRateLimited()) {
    alert('Rate limit exceeded. Please wait before sending more messages.');
    return;
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

function getRandomColor(name) {
  var colors = ['#ff0000', '#ffff00', '#ffa500', '#00ff00', '#0000ff', '#800080', '#ff00ff'];
  var index = hashCode(name) % colors.length;
  return colors[index];
}

function hashCode(str) {
  if (!str) {
    return 0;
  }

  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash); // Use Math.abs to ensure a positive hash value
}

function containsBannedWords(message) {
  // Assuming you have the bannedWords array defined in banned-words.js
  for (var i = 0; i < bannedWords.length; i++) {
    if (message.toLowerCase().includes(bannedWords[i].toLowerCase())) {
      return true;
    }
  }
  return false;
}

// Rate Limit Check
function isRateLimited() {
  const currentTime = Date.now();

  // Retrieve the user's message count from localStorage
  const messageCountData = JSON.parse(localStorage.getItem(messageCountKey)) || { count: 0, lastUpdateTime: currentTime };

  // Calculate the elapsed time since the last message update
  const elapsedTime = currentTime - messageCountData.lastUpdateTime;

  if (elapsedTime >= timeFrame) {
    // Reset the message count if the time frame has elapsed
    messageCountData.count = 1;
  } else {
    // Increment the message count if within the time frame
    messageCountData.count += 1;

    // Check if the user has exceeded the rate limit
    if (messageCountData.count > rateLimitThreshold) {
      return true;
    }
  }

  // Update the message count and last update time in localStorage
  messageCountData.lastUpdateTime = currentTime;
  localStorage.setItem(messageCountKey, JSON.stringify(messageCountData));

  return false;
}

// Periodically check and delete invalid messages
function checkMessagesValidity() {
  var chatRef = database.ref('chat');

  chatRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var message = childSnapshot.val();
      var messageKey = childSnapshot.key;

      var isInvalid = false;

      // Check if the message contains banned words
      if (containsBannedWords(message.text)) {
        isInvalid = true;
      }

      // Check if the message exceeds the character limit
      if (message.text.length > MAX_MESSAGE_LENGTH) {
        isInvalid = true;
      }

      if (isInvalid) {
        // Delete the invalid message from the database
        chatRef.child(messageKey).remove();
      }
    });
  });
}

// Perform the initial check when the user opens the website
checkMessagesValidity();

// Set up the timer to periodically check every 5 minutes
setInterval(checkMessagesValidity, 5 * 60 * 1000); // 5 minutes
