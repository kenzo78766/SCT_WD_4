// TaskFlow Application JavaScript
class TaskFlowApp {
  constructor() {
    // Application data
    this.tasks = [];
    this.lists = [];
    this.currentFilter = 'all';
    this.currentList = null;
    this.currentSort = 'created';
    this.searchQuery = '';
    this.editingTask = null;
    this.editingList = null;

    // DOM elements
    this.initializeElements();
    
    // Initialize application
    this.init();
  }

  initializeElements() {
    // Header elements
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.themeToggle = document.getElementById('theme-toggle');
    this.searchInput = document.getElementById('search-input');
    
    // Sidebar elements
    this.sidebar = document.getElementById('sidebar');
    this.quickAddInput = document.getElementById('quick-add-input');
    this.quickAddBtn = document.getElementById('quick-add-btn');
    this.filterList = document.getElementById('filter-list');
    this.listNav = document.getElementById('list-nav');
    this.addListBtn = document.getElementById('add-list-btn');
    
    // Priority filters
    this.priorityHigh = document.getElementById('priority-high');
    this.priorityMedium = document.getElementById('priority-medium');
    this.priorityLow = document.getElementById('priority-low');
    
    // Main content elements
    this.contentTitle = document.getElementById('content-title');
    this.taskCount = document.getElementById('task-count');
    this.sortBtn = document.getElementById('sort-btn');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.taskContainer = document.getElementById('task-container');
    this.taskPlaceholder = document.getElementById('task-placeholder');
    this.taskList = document.getElementById('task-list');
    
    // Task modal elements
    this.taskModal = document.getElementById('task-modal');
    this.modalBackdrop = document.getElementById('modal-backdrop');
    this.modalClose = document.getElementById('modal-close');
    this.modalTitle = document.getElementById('modal-title');
    this.taskForm = document.getElementById('task-form');
    this.taskTitle = document.getElementById('task-title');
    this.taskDescription = document.getElementById('task-description');
    this.taskDueDate = document.getElementById('task-due-date');
    this.taskDueTime = document.getElementById('task-due-time');
    this.taskPriority = document.getElementById('task-priority');
    this.taskListSelect = document.getElementById('task-list-select');
    this.cancelTaskBtn = document.getElementById('cancel-task-btn');
    this.saveTaskBtn = document.getElementById('save-task-btn');
    
    // List modal elements
    this.listModal = document.getElementById('list-modal');
    this.listModalClose = document.getElementById('list-modal-close');
    this.listForm = document.getElementById('list-form');
    this.listName = document.getElementById('list-name');
    this.iconPicker = document.getElementById('icon-picker');
    this.cancelListBtn = document.getElementById('cancel-list-btn');
    this.saveListBtn = document.getElementById('save-list-btn');
    
    // Notification container
    this.notificationContainer = document.getElementById('notification-container');
  }

  init() {
    console.log('Initializing TaskFlow app...');
    
    // Load data from localStorage
    this.loadData();
    
    // Initialize default lists if none exist
    if (this.lists.length === 0) {
      this.initializeDefaultLists();
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load theme
    this.loadTheme();
    
    // Initial render
    this.renderAll();
    
    console.log('TaskFlow app initialized successfully');
  }

  initializeDefaultLists() {
    const defaultLists = [
      {id: 'personal', name: 'Personal', icon: '👤'},
      {id: 'work', name: 'Work', icon: '💼'},
      {id: 'shopping', name: 'Shopping', icon: '🛒'},
      {id: 'health', name: 'Health', icon: '🏥'}
    ];

    this.lists = defaultLists.map(list => ({
      ...list,
      createdAt: new Date(),
      taskCount: 0
    }));

    this.saveData();
  }

  setupEventListeners() {
    // Sidebar toggle
    this.sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
    
    // Theme toggle
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    
    // Search
    this.searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    // Quick add
    this.quickAddInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleQuickAdd();
    });
    this.quickAddBtn?.addEventListener('click', () => this.handleQuickAdd());
    
    // Filter clicks
    this.filterList?.addEventListener('click', (e) => {
      const filterItem = e.target.closest('.filter-item');
      if (filterItem) {
        this.setFilter(filterItem.dataset.filter);
      }
    });
    
    // List navigation
    this.listNav?.addEventListener('click', (e) => {
      const listItem = e.target.closest('.list-item');
      if (listItem && !e.target.closest('.list-actions')) {
        this.setCurrentList(listItem.dataset.listId);
      }
    });
    
    // Add list
    this.addListBtn?.addEventListener('click', () => this.openListModal());
    
    // Priority filters
    [this.priorityHigh, this.priorityMedium, this.priorityLow].forEach(checkbox => {
      checkbox?.addEventListener('change', () => this.renderTasks());
    });
    
    // Main actions
    this.addTaskBtn?.addEventListener('click', () => this.openTaskModal());
    this.sortBtn?.addEventListener('click', () => this.cycleSortOrder());
    
    // Task modal
    this.taskModal?.addEventListener('click', (e) => {
      if (e.target === this.taskModal || e.target === this.modalBackdrop) {
        this.closeTaskModal();
      }
    });
    this.modalClose?.addEventListener('click', () => this.closeTaskModal());
    this.cancelTaskBtn?.addEventListener('click', () => this.closeTaskModal());
    this.taskForm?.addEventListener('submit', (e) => this.handleTaskSubmit(e));
    
    // List modal
    this.listModal?.addEventListener('click', (e) => {
      if (e.target === this.listModal) {
        this.closeListModal();
      }
    });
    this.listModalClose?.addEventListener('click', () => this.closeListModal());
    this.cancelListBtn?.addEventListener('click', () => this.closeListModal());
    this.listForm?.addEventListener('submit', (e) => this.handleListSubmit(e));
    
    // Icon picker
    this.iconPicker?.addEventListener('click', (e) => {
      const iconOption = e.target.closest('.icon-option');
      if (iconOption) {
        this.selectIcon(iconOption);
      }
    });
    
    // Task list interactions - Fixed event delegation
    this.taskList?.addEventListener('click', (e) => this.handleTaskListClick(e));
    this.taskList?.addEventListener('change', (e) => this.handleTaskListChange(e));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    
    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && 
          this.sidebar?.classList.contains('open') &&
          !this.sidebar.contains(e.target) &&
          !this.sidebarToggle?.contains(e.target)) {
        this.closeSidebar();
      }
    });
  }

  // Data Management
  loadData() {
    try {
      const tasksData = localStorage.getItem('taskflow-tasks');
      const listsData = localStorage.getItem('taskflow-lists');
      
      if (tasksData) {
        this.tasks = JSON.parse(tasksData).map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          completedAt: task.completedAt ? new Date(task.completedAt) : null
        }));
      }
      
      if (listsData) {
        this.lists = JSON.parse(listsData).map(list => ({
          ...list,
          createdAt: new Date(list.createdAt)
        }));
      }
      
      console.log('Data loaded:', { tasks: this.tasks.length, lists: this.lists.length });
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
      this.tasks = [];
      this.lists = [];
    }
  }

  saveData() {
    try {
      localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks));
      localStorage.setItem('taskflow-lists', JSON.stringify(this.lists));
      console.log('Data saved:', { tasks: this.tasks.length, lists: this.lists.length });
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error);
      this.showNotification('Failed to save data', 'error');
    }
  }

  // Theme Management
  loadTheme() {
    const savedTheme = localStorage.getItem('taskflow-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-color-scheme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-color-scheme', prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    localStorage.setItem('taskflow-theme', newTheme);
    
    this.showNotification(`Switched to ${newTheme} theme`, 'success');
  }

  // UI Interactions
  toggleSidebar() {
    this.sidebar?.classList.toggle('open');
  }

  closeSidebar() {
    this.sidebar?.classList.remove('open');
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    console.log('Search query:', this.searchQuery);
    this.renderTasks();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.currentList = null; // Clear list filter when using main filters
    
    // Update active filter
    document.querySelectorAll('.filter-item').forEach(item => {
      item.classList.toggle('active', item.dataset.filter === filter);
    });
    
    // Update active list
    document.querySelectorAll('.list-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Update title
    const filterNames = {
      all: 'All Tasks',
      today: 'Due Today',
      week: 'This Week',
      overdue: 'Overdue',
      completed: 'Completed'
    };
    
    if (this.contentTitle) {
      this.contentTitle.textContent = filterNames[filter] || 'Tasks';
    }
    
    this.renderTasks();
  }

  setCurrentList(listId) {
    this.currentList = listId;
    this.currentFilter = 'all'; // Reset filter when selecting a list
    
    // Update active filter
    document.querySelectorAll('.filter-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Update active list
    document.querySelectorAll('.list-item').forEach(item => {
      item.classList.toggle('active', item.dataset.listId === listId);
    });
    
    // Update title
    const list = this.lists.find(l => l.id === listId);
    if (this.contentTitle && list) {
      this.contentTitle.textContent = list.name;
    }
    
    this.renderTasks();
  }

  cycleSortOrder() {
    const sortOptions = ['created', 'dueDate', 'priority', 'title'];
    const currentIndex = sortOptions.indexOf(this.currentSort);
    this.currentSort = sortOptions[(currentIndex + 1) % sortOptions.length];
    
    const sortLabels = {
      created: 'Created',
      dueDate: 'Due Date',
      priority: 'Priority',
      title: 'Title'
    };
    
    this.showNotification(`Sorted by ${sortLabels[this.currentSort]}`, 'info');
    this.renderTasks();
  }

  // Task Management
  handleQuickAdd() {
    const title = this.quickAddInput?.value.trim();
    if (!title) return;

    const task = this.createTask({
      title,
      listId: this.currentList || this.lists[0]?.id,
      priority: 'medium'
    });

    this.tasks.push(task);
    this.quickAddInput.value = '';
    this.saveData();
    this.renderAll();
    this.showNotification('Task added successfully', 'success');
  }

  createTask(data) {
    const now = new Date();
    return {
      id: this.generateId(),
      title: data.title,
      description: data.description || '',
      completed: false,
      priority: data.priority || 'medium',
      listId: data.listId || this.lists[0]?.id,
      dueDate: data.dueDate || null,
      createdAt: now,
      updatedAt: now,
      completedAt: null
    };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  openTaskModal(task = null) {
    this.editingTask = task;
    
    // Populate list select first
    if (this.taskListSelect) {
      this.taskListSelect.innerHTML = this.lists.map(list => 
        `<option value="${list.id}">${list.icon} ${list.name}</option>`
      ).join('');
    }
    
    if (task) {
      // Edit mode
      if (this.modalTitle) this.modalTitle.textContent = 'Edit Task';
      if (this.taskTitle) this.taskTitle.value = task.title;
      if (this.taskDescription) this.taskDescription.value = task.description;
      if (this.taskDueDate) this.taskDueDate.value = task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
      if (this.taskDueTime) this.taskDueTime.value = task.dueDate ? task.dueDate.toTimeString().slice(0, 5) : '';
      if (this.taskPriority) this.taskPriority.value = task.priority;
      if (this.taskListSelect) this.taskListSelect.value = task.listId;
    } else {
      // Add mode
      if (this.modalTitle) this.modalTitle.textContent = 'Add New Task';
      this.taskForm?.reset();
      if (this.taskPriority) this.taskPriority.value = 'medium';
      if (this.taskListSelect) this.taskListSelect.value = this.currentList || this.lists[0]?.id;
    }
    
    this.taskModal?.classList.remove('hidden');
    setTimeout(() => this.taskModal?.classList.add('show'), 10);
    this.taskTitle?.focus();
  }

  closeTaskModal() {
    this.taskModal?.classList.remove('show');
    setTimeout(() => {
      this.taskModal?.classList.add('hidden');
      this.editingTask = null;
    }, 250);
  }

  handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = this.taskTitle?.value.trim();
    if (!title) {
      this.showNotification('Task title is required', 'error');
      return;
    }

    const dueDate = this.getCombinedDateTime();
    
    const taskData = {
      title,
      description: this.taskDescription?.value.trim() || '',
      priority: this.taskPriority?.value || 'medium',
      listId: this.taskListSelect?.value || this.lists[0]?.id,
      dueDate
    };

    if (this.editingTask) {
      // Update existing task
      Object.assign(this.editingTask, {
        ...taskData,
        updatedAt: new Date()
      });
      this.showNotification('Task updated successfully', 'success');
    } else {
      // Create new task
      const newTask = this.createTask(taskData);
      this.tasks.push(newTask);
      this.showNotification('Task created successfully', 'success');
    }

    this.saveData();
    this.renderAll();
    this.closeTaskModal();
  }

  getCombinedDateTime() {
    const dateValue = this.taskDueDate?.value;
    const timeValue = this.taskDueTime?.value;
    
    if (!dateValue) return null;
    
    const date = new Date(dateValue);
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
    }
    
    return date;
  }

  handleTaskListClick(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.dataset.taskId;
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check for edit button click
    if (e.target.closest('[data-action="edit"]')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Edit button clicked for task:', task.title);
      this.openTaskModal(task);
      return;
    }
    
    // Check for delete button click
    if (e.target.closest('[data-action="delete"]')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Delete button clicked for task:', task.title);
      this.deleteTask(task.id);
      return;
    }
  }

  handleTaskListChange(e) {
    if (e.target.matches('.task-checkbox')) {
      const taskItem = e.target.closest('.task-item');
      const taskId = taskItem.dataset.taskId;
      this.toggleTaskComplete(taskId);
    }
  }

  toggleTaskComplete(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.updatedAt = new Date();

    this.saveData();
    this.renderAll();
    
    const status = task.completed ? 'completed' : 'marked active';
    this.showNotification(`Task ${status}`, 'success');
  }

  deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveData();
    this.renderAll();
    this.showNotification('Task deleted', 'info');
  }

  // List Management
  openListModal(list = null) {
    this.editingList = list;
    
    if (list) {
      if (this.listName) this.listName.value = list.name;
      this.selectIconByValue(list.icon);
    } else {
      this.listForm?.reset();
      this.selectIconByValue('📋');
    }
    
    this.listModal?.classList.remove('hidden');
    setTimeout(() => this.listModal?.classList.add('show'), 10);
    this.listName?.focus();
  }

  closeListModal() {
    this.listModal?.classList.remove('show');
    setTimeout(() => {
      this.listModal?.classList.add('hidden');
      this.editingList = null;
    }, 250);
  }

  selectIcon(iconElement) {
    document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('active'));
    iconElement.classList.add('active');
  }

  selectIconByValue(icon) {
    const iconElement = document.querySelector(`.icon-option[data-icon="${icon}"]`);
    if (iconElement) this.selectIcon(iconElement);
  }

  handleListSubmit(e) {
    e.preventDefault();
    
    const name = this.listName?.value.trim();
    if (!name) {
      this.showNotification('List name is required', 'error');
      return;
    }

    const activeIcon = document.querySelector('.icon-option.active');
    const icon = activeIcon?.dataset.icon || '📋';

    if (this.editingList) {
      // Update existing list
      this.editingList.name = name;
      this.editingList.icon = icon;
      this.showNotification('List updated successfully', 'success');
    } else {
      // Create new list
      const newList = {
        id: this.generateId(),
        name,
        icon,
        createdAt: new Date()
      };
      this.lists.push(newList);
      this.showNotification('List created successfully', 'success');
    }

    this.saveData();
    this.renderAll();
    this.closeListModal();
  }

  // Filtering and Sorting
  getFilteredTasks() {
    let filtered = this.tasks.slice();
    console.log('Starting with tasks:', filtered.length);

    // Apply search first
    if (this.searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(this.searchQuery) ||
        task.description.toLowerCase().includes(this.searchQuery)
      );
      console.log('After search filter:', filtered.length);
    }

    // Apply list filter
    if (this.currentList) {
      filtered = filtered.filter(task => task.listId === this.currentList);
      console.log('After list filter:', filtered.length);
    }

    // Apply main filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (this.currentFilter) {
      case 'today':
        filtered = filtered.filter(task => {
          if (!task.dueDate || task.completed) return false;
          const dueDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
          return dueDate.getTime() === today.getTime();
        });
        break;
      case 'week':
        filtered = filtered.filter(task => {
          if (!task.dueDate || task.completed) return false;
          return task.dueDate >= today && task.dueDate <= weekFromNow;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(task => {
          if (!task.dueDate || task.completed) return false;
          return task.dueDate < now;
        });
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'all':
      default:
        // No additional filtering for 'all'
        break;
    }
    console.log('After main filter:', filtered.length);

    // Apply priority filters
    const enabledPriorities = [];
    if (this.priorityHigh?.checked) enabledPriorities.push('high');
    if (this.priorityMedium?.checked) enabledPriorities.push('medium');
    if (this.priorityLow?.checked) enabledPriorities.push('low');

    if (enabledPriorities.length < 3) {
      filtered = filtered.filter(task => enabledPriorities.includes(task.priority));
      console.log('After priority filter:', filtered.length);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate - b.dueDate;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    console.log('Final filtered tasks:', filtered.length);
    return filtered;
  }

  // Rendering
  renderAll() {
    this.renderLists();
    this.renderTasks();
    this.updateCounts();
  }

  renderLists() {
    if (!this.listNav) return;

    this.listNav.innerHTML = this.lists.map(list => `
      <li class="list-item ${this.currentList === list.id ? 'active' : ''}" data-list-id="${list.id}">
        <span class="list-icon">${list.icon}</span>
        <span class="list-name">${list.name}</span>
        <span class="list-count">${this.getTaskCountForList(list.id)}</span>
        <div class="list-actions">
          <button class="btn--ghost btn--sm" onclick="window.app.openListModal(window.app.lists.find(l => l.id === '${list.id}'))" title="Edit list">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
        </div>
      </li>
    `).join('');
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks();
    console.log('Rendering tasks:', filteredTasks.length);
    
    if (filteredTasks.length === 0) {
      if (this.taskPlaceholder) {
        this.taskPlaceholder.classList.remove('hidden');
      }
      if (this.taskList) {
        this.taskList.innerHTML = '';
      }
    } else {
      if (this.taskPlaceholder) {
        this.taskPlaceholder.classList.add('hidden');
      }
      if (this.taskList) {
        this.taskList.innerHTML = filteredTasks.map(task => this.renderTask(task)).join('');
      }
    }
    
    // Update task count immediately
    this.updateTaskCount(filteredTasks.length);
  }

  renderTask(task) {
    const list = this.lists.find(l => l.id === task.listId);
    const isOverdue = task.dueDate && !task.completed && task.dueDate < new Date();
    
    return `
      <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
        <div class="task-header">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <div class="task-content">
            <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
              <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
              ${task.dueDate ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${this.formatDueDate(task.dueDate)}</span>` : ''}
              ${list ? `<span class="task-list-badge">${list.icon} ${list.name}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn" data-action="edit" title="Edit task">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="task-action-btn" data-action="delete" title="Delete task">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  getTaskCountForList(listId) {
    return this.tasks.filter(task => task.listId === listId && !task.completed).length;
  }

  updateTaskCount(count) {
    if (this.taskCount) {
      this.taskCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
    }
  }

  updateCounts() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Filter counts
    const counts = {
      all: this.tasks.filter(t => !t.completed).length,
      today: this.tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate.getFullYear(), t.dueDate.getMonth(), t.dueDate.getDate());
        return dueDate.getTime() === today.getTime();
      }).length,
      week: this.tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return t.dueDate >= today && t.dueDate <= weekFromNow;
      }).length,
      overdue: this.tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return t.dueDate < now;
      }).length,
      completed: this.tasks.filter(t => t.completed).length
    };

    // Update count displays
    Object.keys(counts).forEach(key => {
      const element = document.getElementById(`count-${key}`);
      if (element) element.textContent = counts[key];
    });
  }

  // Utility Methods
  formatDueDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  handleKeyboardShortcuts(e) {
    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.openTaskModal();
        }
        break;
      case 'f':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.searchInput?.focus();
        }
        break;
      case 'escape':
        if (this.taskModal?.classList.contains('show')) {
          this.closeTaskModal();
        } else if (this.listModal?.classList.contains('show')) {
          this.closeListModal();
        }
        break;
    }
  }

  // Notifications
  showNotification(message, type = 'info') {
    if (!this.notificationContainer) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    this.notificationContainer.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing TaskFlow app...');
  
  // Initialize main application
  window.app = new TaskFlowApp();
  
  // Handle system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('taskflow-theme')) {
      document.documentElement.setAttribute('data-color-scheme', e.matches ? 'dark' : 'light');
    }
  });
  
  console.log('TaskFlow app fully initialized and ready to use');
});