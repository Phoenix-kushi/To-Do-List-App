document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todocontainer = document.querySelector('.todoapp');
    const progressBar = document.getElementById('progress');
    const progressNumbers = document.getElementById('numbers');

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todocontainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    };

    const updateProgress = (checkCompletion = true) => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.task-checkbox:checked').length;

        progressBar.style.width = totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%';
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

        if (checkCompletion && totalTasks > 0 && completedTasks === totalTasks) {
            Confetti();
        }
    };

    const saveTasksToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('.task-text').textContent,
            completed: li.querySelector('.task-checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }; // <-- THIS closing brace was missing. Without it, addTask below

    const addTask = (text, completed = false, checkCompletion = true) => {
        const taskText = text || taskInput.value.trim();
        if (!taskText) {
            return;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}/>
            <span class="task-text">${taskText}</span>
            <div class="task-buttons">
                <button class="edit-button" type="button"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-button" type="button"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        const editButton = li.querySelector('.edit-button');

        if (completed) {
            li.classList.add('completed');
            editButton.disabled = true;
            editButton.style.opacity = '0.5';
            editButton.style.pointerEvents = 'none';
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editButton.disabled = isChecked;
            editButton.style.opacity = isChecked ? '0.5' : '1';
            editButton.style.pointerEvents = isChecked ? 'none' : 'auto';
            updateProgress();
            saveTasksToLocalStorage();
        });

        editButton.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector('.task-text').textContent;
                li.remove();
                toggleEmptyState();
                updateProgress(false);
                saveTasksToLocalStorage();
            }
        });

        li.querySelector('.delete-button').addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTasksToLocalStorage();
        });

        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
        updateProgress(checkCompletion);
        saveTasksToLocalStorage();
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({ text, completed }) => {
            addTask(text, completed, false);
        });
        toggleEmptyState();
        updateProgress(false);
    }; // <-- THIS closing brace was also missing before

    addTaskButton.addEventListener('click', (e) => {
        e.preventDefault(); // stop the submit button from reloading the page
        addTask();
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    loadTasksFromLocalStorage();
});


// Tracks every setInterval/setTimeout the celebration effect starts,
// so a new celebration can cleanly stop any celebration still running from before.
let activeIntervals = [];
let activeTimeouts = [];

const cleanupActiveEffects = () => {
    activeIntervals.forEach(clearInterval);
    activeTimeouts.forEach(clearTimeout);
    activeIntervals = [];
    activeTimeouts = [];
};

const Confetti = () => {
    cleanupActiveEffects(); // stop any effect still running from a previous trigger

    const animationEnd = Date.now() + 6e3; // 6e3 === 6000ms === 6 seconds from now

    // Fires a small burst of confetti every 50ms, falling from a random point
    // along the top edge of the screen, until 6 seconds have passed.
    const confettiInterval = setInterval(function () {
        if (Date.now() >= animationEnd) return clearInterval(confettiInterval);
        confetti({
            particleCount: 8,
            angle: 90,
            spread: 70,
            origin: {
                x: Math.random(), // random horizontal position each burst (0 = left edge, 1 = right edge)
                y: 0               // 0 = top edge of the screen
            },
            gravity: 1.2,
            ticks: 100,
            colors: [
                "#FFD700",
                "#FF69B4",
                "#00CED1",
                "#FF4500"
            ]
        });
    }, 50);
    activeIntervals.push(confettiInterval);

    // 2 seconds in, fire the first ribbon burst, then repeat every 2 seconds
    // until the same 6-second window ends.
    const ribbonStartTimeout = setTimeout(function () {
        ribbons({
            colors: [
                "#FF4500",
                "#FFD700",
                "#FF69B4",
                "#00CED1"
            ]
        });
        const ribbonsInterval = setInterval(function () {
            if (Date.now() >= animationEnd) return clearInterval(ribbonsInterval);
            ribbons({
                colors: [
                    "#FF4500",
                    "#FFD700",
                    "#FF69B4",
                    "#00CED1"
                ]
            });
        }, 2e3);
        activeIntervals.push(ribbonsInterval);
    }, 2e3);
    activeTimeouts.push(ribbonStartTimeout);
};