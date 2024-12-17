document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector(".search");
  const noTasks = document.querySelector(".noTasks");
  const addTaskButton = document.querySelector(".addTask");
  const tasksContainer = document.querySelector(".tasksContainer");
  const tasksFunctionalContainer = document.querySelector(".tasksFunctional");
  const deleteAllButton = document.querySelector(".deleteTask");
  const buttonsContainer = document.querySelector(".buttonsContainer");

  let isMessageDisplayed = false;

  // Функция для обновления отображения сообщения об отсутствии задач
  const updateNoTasksMessage = () => {
    const tasks = tasksContainer.querySelectorAll("li");
    noTasks.style.display = tasks.length === 0 ? "block" : "none";
  };

  // Функция для сохранения задач в localStorage
  const saveTasksToLocal = () => {
    const tasks = [];
    tasksContainer.querySelectorAll("li").forEach((task) => {
      const taskSpan = task.querySelector("span");
      const isCompleted = task.classList.contains("completed");
      const isSkipped = task.classList.contains("skipped");
      tasks.push({
        text: taskSpan.textContent,
        completed: isCompleted,
        skipped: isSkipped,
      });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // search.setAttribute('maxlength', '40')
  const checkScreenSize = () => {
    if (window.innerWidth < 800) {
      search.setAttribute("maxlength", "25");
    } else {
      search.setAttribute("maxlength", '50');
    }
  };

  // Initial check when the page loads
  checkScreenSize();

  // Check on window resize
  window.addEventListener("resize", checkScreenSize);

  // Функция для добавления задачи
  const addTasks = () => {
    const taskText = search.value.trim();
    if (taskText) {
      addTaskElement(taskText);
      saveTasksToLocal();
      updateNoTasksMessage();
      search.value = ""; // Очистка поля поиска
    } else {
      alert("Write Something!");
    }
  };

  // Функция для удаления всех задач
  const deleteAllTasks = (message, duration) => {
    const tasks = tasksContainer.querySelectorAll("li");
    if (tasks.length === 0) {
      // Если задач нет, не показываем сообщение, если оно уже отображается
      if (!isMessageDisplayed) {
        isMessageDisplayed = true;
        const falseMessageElm = document.createElement("span");
        falseMessageElm.textContent = "There are no tasks to delete";
        buttonsContainer.appendChild(falseMessageElm);

        setTimeout(() => {
          buttonsContainer.removeChild(falseMessageElm);
          isMessageDisplayed = false;
        }, 1000);
      }
      return;
    }

    tasks.forEach((task) => task.remove());
    localStorage.removeItem("tasks");
    updateNoTasksMessage();

    if (!isMessageDisplayed) {
      isMessageDisplayed = true;
      const messageElm = document.createElement("span");
      messageElm.textContent = message;
      buttonsContainer.appendChild(messageElm);

      setTimeout(() => {
        buttonsContainer.removeChild(messageElm);
        isMessageDisplayed = false;
      }, duration);
    }
  };

  // Функция для создания и добавления элемента задачи в список
  const addTaskElement = (text, completed = false, skipped = false) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";

    const taskSpan = document.createElement("span");
    taskSpan.textContent = text;
    taskSpan.style.flex = "1";

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("task-actions");
    actionsDiv.style.display = "flex";
    actionsDiv.style.gap = "5px";

    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "❌";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.classList.add("icon", "delete-icon");
    deleteIcon.addEventListener("click", () => {
      li.remove();
      updateNoTasksMessage(); // Обновляем сообщение об отсутствии задач после удаления
      saveTasksToLocal();
    });

    const editIcon = document.createElement("span");
    editIcon.textContent = "✏️";
    editIcon.style.cursor = "pointer";
    editIcon.classList.add("icon", "edit-icon");
    editIcon.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = taskSpan.textContent;
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          taskSpan.textContent = input.value;
          li.replaceChild(taskSpan, input);
          saveTasksToLocal();
        }
      });
      input.addEventListener("blur", () => {
        taskSpan.textContent = input.value;
        li.replaceChild(taskSpan, input);
        saveTasksToLocal();
      });
      li.replaceChild(input, taskSpan);
      input.focus();
    });

    const completeIcon = document.createElement("span");
    completeIcon.textContent = completed ? "🔄" : "✔️";
    completeIcon.style.cursor = "pointer";
    completeIcon.classList.add("icon", "complete-icon");
    completeIcon.addEventListener("click", () => {
      toggleCompleted(li);
    });

    const skipIcon = document.createElement("span");
    skipIcon.textContent = skipped ? "➕" : "➖";
    skipIcon.style.cursor = "pointer";
    skipIcon.classList.add("icon", "skip-icon");
    skipIcon.addEventListener("click", () => {
      toggleSkipped(li);
    });

    actionsDiv.appendChild(completeIcon);
    actionsDiv.appendChild(skipIcon);
    actionsDiv.appendChild(editIcon);
    actionsDiv.appendChild(deleteIcon);

    li.appendChild(taskSpan);
    li.appendChild(actionsDiv);

    if (completed) {
      li.classList.add("completed");
      updateTaskAppearance(li); // Обновляем внешний вид задачи
    } else if (skipped) {
      li.classList.add("skipped");
      updateTaskAppearance(li); // Обновляем внешний вид задачи
    }

    tasksContainer.appendChild(li);
  };

  // Функция для изменения состояния выполнения задачи
  const toggleCompleted = (taskItem) => {
    taskItem.classList.toggle("completed");
    taskItem.classList.remove("skipped"); // Убираем статус skipped при установке completed
    updateTaskAppearance(taskItem); // Обновляем внешний вид задачи
    saveTasksToLocal();
    updateNoTasksMessage(); // Обновляем сообщение об отсутствии задач после изменения состояния
  };

  // Функция для изменения состояния пропуска задачи
  const toggleSkipped = (taskItem) => {
    taskItem.classList.toggle("skipped");
    taskItem.classList.remove("completed"); // Убираем статус completed при установке skipped
    updateTaskAppearance(taskItem); // Обновляем внешний вид задачи
    saveTasksToLocal();
    updateNoTasksMessage(); // Обновляем сообщение об отсутствии задач после изменения состояния
  };

  // Функция для обновления внешнего вида задачи
  const updateTaskAppearance = (taskElement) => {
    const completeIcon = taskElement.querySelector(".complete-icon");
    const skipIcon = taskElement.querySelector(".skip-icon");
    if (taskElement.classList.contains("completed")) {
      completeIcon.textContent = "🔄";
      taskElement.style.background = "rgba(32, 199, 80, 0.833)";
      taskElement.style.color = "white";
      skipIcon.textContent = "➖";
    } else if (taskElement.classList.contains("skipped")) {
      skipIcon.textContent = "➕";
      taskElement.style.background = "rgba(199, 199, 32, 0.833)";
      taskElement.style.color = "white";
      completeIcon.textContent = "✔️";
    } else {
      completeIcon.textContent = "✔️";
      skipIcon.textContent = "➖";
      taskElement.style.background = "initial";
      taskElement.style.color = "initial";
    }
  };

  // Инициализация
  const loadTasksFromLocal = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      addTaskElement(task.text, task.completed, task.skipped);
    });
    updateNoTasksMessage();
    tasksContainer.querySelectorAll("li").forEach((task) => {
      updateTaskAppearance(task); // Обновляем стили для всех задач
    });
  };

  // Добавляем задачу при нажатии Enter
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTasks();
  });

  // Обработчик для кнопки добавления задачи
  addTaskButton.addEventListener("click", addTasks);

  // Обработчик для кнопки удаления всех задач
  deleteAllButton.addEventListener("click", () => {
    deleteAllTasks("All tasks have been deleted", 1000);
  });

  // Загружаем задачи при загрузке страницы
  loadTasksFromLocal();
});
