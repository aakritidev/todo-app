const STORAGE_KEY = "modern-todo-app.tasks";
const THEME_KEY = "modern-todo-app.theme";
const DEFAULT_THEME = "dark";

const elements = {
  form: document.getElementById("todo-form"),
  input: document.getElementById("todo-input"),
  list: document.getElementById("todo-list"),
  count: document.getElementById("todo-count"),
  clearButton: document.getElementById("clear-completed"),
  themeToggle: document.getElementById("theme-toggle"),
};

const taskState = {
  tasks: [],
  theme: DEFAULT_THEME,
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

const saveTheme = () => {
  window.localStorage.setItem(THEME_KEY, taskState.theme);
};

const loadTasks = () => {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  taskState.tasks = saved ? JSON.parse(saved) : [];
};

const loadTheme = () => {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  taskState.theme = savedTheme === "light" ? "light" : DEFAULT_THEME;
};

const applyTheme = (theme) => {
  taskState.theme = theme;
  document.body.dataset.theme = theme;
  elements.themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="ri-sun-line"></i>'
      : '<i class="ri-contrast-2-line"></i>';
  elements.themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
  );
};

const toggleTheme = () => {
  const nextTheme = taskState.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme();
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
  elements.themeToggle.addEventListener("click", toggleTheme);
};

const initializeApp = () => {
  loadTasks();
  loadTheme();
  applyTheme(taskState.theme);
  renderTasks();
  attachListeners();
};

initializeApp();
