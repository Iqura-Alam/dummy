const socket = io('http://localhost:3000');

const roomId = 'room123'; // This should be dynamically assigned based on buyer & seller
let sender = 'buyer'; // Or 'seller', based on logged-in user role

socket.emit('joinRoom', { roomId });

const chatDiv = document.getElementById('chat');
const msgInput = document.getElementById('msgInput');

socket.on('chatMessage', ({ sender: msgSender, message }) => {
  const el = document.createElement('div');
  el.textContent = `${msgSender}: ${message}`;
  chatDiv.appendChild(el);
  chatDiv.scrollTop = chatDiv.scrollHeight;
});

function sendMessage() {
  const message = msgInput.value.trim();
  if (!message) return;

  socket.emit('chatMessage', { roomId, sender, message });
  msgInput.value = '';
}
