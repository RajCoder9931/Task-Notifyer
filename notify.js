const pendingEl = document.getElementById("pendingTasks");
const completedEl = document.getElementById("completedTasks");
const subtasksEl = document.getElementById("subtasks");

let allTasks = JSON.parse(localStorage.getItem("dailyTasks")) || [];

function addSubtask() {
  const subtaskDiv = document.createElement("div");
  subtaskDiv.innerHTML = `
    <input type="text" placeholder="Subtask description">
    <input type="time">
  `;
  subtasksEl.appendChild(subtaskDiv);
}

function addTask() {
  const taskName = document.getElementById("mainTask").value;
  const taskDate = document.getElementById("taskDate").value;
  if (!taskName || !taskDate) return alert("Please fill all fields!");

  const subtasks = [];
  subtasksEl.querySelectorAll("div").forEach(div => {
    const [descInput, timeInput] = div.querySelectorAll("input");
    if (descInput.value && timeInput.value) {
      subtasks.push({ description: descInput.value, time: timeInput.value, notified: false });
    }
  });

  const task = {
    id: Date.now(),
    name: taskName,
    date: taskDate,
    completed: false,
    subtasks
  };

  allTasks.push(task);
  localStorage.setItem("dailyTasks", JSON.stringify(allTasks));
  renderTasks();
  document.getElementById("mainTask").value = "";
  subtasksEl.innerHTML = "";
}

function renderTasks() {
  pendingEl.innerHTML = "";
  completedEl.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  allTasks.forEach(task => {
    if (task.date !== today) return;

    const taskItem = document.createElement("div");
    taskItem.className = "task-item" + (task.completed ? " completed" : "");
    taskItem.innerHTML = `<strong>${task.name}</strong>
      ${task.subtasks.map(s => `<div class="subtask">🕒 ${s.time} - ${s.description}</div>`).join("")}
      <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>`;

    if (!task.completed) {
      pendingEl.appendChild(taskItem);
    } else {
      completedEl.appendChild(taskItem);
    }
  });
}

function deleteTask(id) {
  allTasks = allTasks.filter(t => t.id !== id);
  localStorage.setItem("dailyTasks", JSON.stringify(allTasks));
  renderTasks();
}

function checkReminders() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ":" +
                      now.getMinutes().toString().padStart(2, '0');
  const todayDate = now.toISOString().split("T")[0];

  allTasks.forEach(task => {
    if (task.date !== todayDate || task.completed) return;

    let allNotified = true;
    task.subtasks.forEach(sub => {
      if (!sub.notified && sub.time === currentTime) {
        showNotification(`${task.name} - ${sub.description}`);
        sub.notified = true;
      }
      if (!sub.notified) allNotified = false;
    });

    if (allNotified && !task.completed) {
      task.completed = true;
      localStorage.setItem("dailyTasks", JSON.stringify(allTasks));
      renderTasks();
    }
  });
}

function showNotification(text) {
  if (Notification.permission === "granted") {
    new Notification(" Task Reminder", {
      body: text,
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827279.png"
    });
  } else {
    alert("Reminder: " + text);
  }
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  document.getElementById("clock").textContent = `🕒 ${time} | 📆 ${date}`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

// INIT
window.onload = () => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  renderTasks();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(checkReminders, 1000);
};


//fire base 
const firebaseConfig = {
  apiKey: "AIzaSyB-DSSNNaidjLRiuQkoT5tdHwxdy3xST5s",
  authDomain: "smart-task-reminder-9cd63.firebaseapp.com",
  projectId: "smart-task-reminder-9cd63",
  storageBucket: "smart-task-reminder-9cd63.firebasestorage.app",
  messagingSenderId: "983671164257",
  appId: "1:983671164257:web:d4ff7c96061a3cd4794920"
};
// fir base config 

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.getToken({ vapidKey: 'Q2UD4w6URmRV1DKriINtMLeEAqtbD4hDmAqI39PkrMU' }).then((currentToken) => {
  if (currentToken) {
    console.log('Token:', currentToken);
    //  token to server or use to trigger notification
  } else {
    console.warn('No registration token available');
  }
}).catch((err) => {
  console.error('An error occurred while retrieving token. ', err);
});


//firebase code 2
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function(err) {
      console.log('Service Worker registration failed:', err);
    });
}
