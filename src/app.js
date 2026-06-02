const STORAGE_KEY = "modern-todo-app.tasks";

const elements = {
  form: document.getElementById("todo-form"),
  input: document.getElementById("todo-input"),
  list: document.getElementById("todo-list"),
  count: document.getElementById("todo-count"),
  clearButton: document.getElementById("clear-completed"),
};

const taskState = {
  tasks: [],
};

const createTask = (text) => ({
  id: crypto.randomUUID(),
  text: text.trim(),
  completed: false,
  editing: false,
});

const saveTasks = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(taskState.tasks));
};

const loadTasks = () => {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  taskState.tasks = saved ? JSON.parse(saved) : [];
};

const getTaskCountText = (count) => `${count} item${count === 1 ? "" : "s"}`;

const findTaskIndex = (taskId) =>
  taskState.tasks.findIndex((task) => task.id === taskId);

const removeTask = (taskId) => {
  taskState.tasks = taskState.tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
};

const toggleCompletion = (taskId) => {
  const index = findTaskIndex(taskId);
  if (index < 0) return;

  taskState.tasks[index].completed = !taskState.tasks[index].completed;
  saveTasks();
  renderTasks();
};

const enableEditing = (taskId) => {
  taskState.tasks = taskState.tasks.map((task) => ({
    ...task,
    editing: task.id === taskId,
  }));
  renderTasks();
};

const updateTaskText = (taskId, newText) => {
  const index = findTaskIndex(taskId);
  if (index < 0) return;

  const trimmedText = newText.trim();
  if (!trimmedText) {
    removeTask(taskId);
    return;
  }

  taskState.tasks[index].text = trimmedText;
  taskState.tasks[index].editing = false;
  saveTasks();
  renderTasks();
};

const clearCompletedTasks = () => {
  taskState.tasks = taskState.tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
};

const createTaskItem = (task) => {
  const listItem = document.createElement("li");
  listItem.className = "todo-item";
  listItem.dataset.taskId = task.id;

  const taskText = task.editing
    ? document.createElement("input")
    : document.createElement("p");
  taskText.className = task.editing ? "" : "todo-title";

  if (task.editing) {
    taskText.type = "text";
    taskText.value = task.text;
    taskText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        updateTaskText(task.id, event.target.value);
      }
      if (event.key === "Escape") {
        renderTasks();
      }
    });
    taskText.addEventListener("blur", () => {
      updateTaskText(task.id, taskText.value);
    });
    taskText.autofocus = true;
  } else {
    taskText.textContent = task.text;
  }

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const doneButton = document.createElement("button");
  doneButton.type = "button";
  doneButton.className = "action-button";
  doneButton.innerHTML = task.completed ? "✔" : "○";
  doneButton.setAttribute(
    "aria-label",
    task.completed ? "Mark task incomplete" : "Mark task complete",
  );
  doneButton.dataset.active = String(task.completed);
  doneButton.addEventListener("click", () => toggleCompletion(task.id));

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "action-button";
  editButton.textContent = "✎";
  editButton.setAttribute("aria-label", "Edit task");
  editButton.addEventListener("click", () => enableEditing(task.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "action-button";
  deleteButton.textContent = "✕";
  deleteButton.setAttribute("aria-label", "Delete task");
  deleteButton.addEventListener("click", () => removeTask(task.id));

  actions.append(doneButton, editButton, deleteButton);
  listItem.append(taskText, actions);

  if (task.completed && !task.editing) {
    taskText.style.textDecoration = "line-through";
    taskText.style.opacity = "0.75";
  }

  return listItem;
};

const renderTasks = () => {
  elements.list.innerHTML = "";

  taskState.tasks.forEach((task) => {
    elements.list.appendChild(createTaskItem(task));
  });

  elements.count.textContent = getTaskCountText(taskState.tasks.length);
};

const addTask = (text) => {
  if (!text.trim()) return;

  taskState.tasks = [
    createTask(text),
    ...taskState.tasks.map((task) => ({ ...task, editing: false })),
  ];
  saveTasks();
  renderTasks();
};

const attachListeners = () => {
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(elements.input.value);
    elements.input.value = "";
    elements.input.focus();
  });

  elements.clearButton.addEventListener("click", clearCompletedTasks);
};

const initializeApp = () => {
  loadTasks();
  renderTasks();
  attachListeners();
};

initializeApp();
