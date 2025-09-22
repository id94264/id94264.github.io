// 数据模型
let tasks = [];
let categories = [
    { id: 'all', name: '我的任务' }
];

// 用于存储图片的临时数据
let tempImages = [];
let editTempImages = [];

// 滚动控制变量
let lastScrollTop = 0;
let floatingButtonsVisible = true;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadCategories();
    renderTasks();
    renderCategories();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 分类切换
    document.getElementById('categories').addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            document.querySelectorAll('#categories li').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            renderTasks();
        }
    });
    
    // 添加分类按钮
    document.getElementById('add-category-btn').addEventListener('click', openAddCategoryPrompt);
    
    // 导入按钮
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    
    // 文件选择
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportTasks);
    
    // 设置按钮
    document.getElementById('settings-button').addEventListener('click', openSettings);
    
    // 添加任务按钮
    document.getElementById('add-task-button').addEventListener('click', openAddTaskModal);
    
    // 添加任务表单提交
    document.getElementById('add-task-form').addEventListener('submit', handleAddTask);
    
    // 新增: 替换图片的文件输入
    document.getElementById('replace-image-input').addEventListener('change', function(e) {
        // 事件处理在replaceImage函数中动态绑定
    });
    
    // 关闭模态框
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // 取消按钮
    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // 图片预览
    document.getElementById('task-images').addEventListener('change', function(e) {
        handleImagePreview(e.target, 'image-preview', tempImages);
    });
    
    document.getElementById('edit-task-images').addEventListener('change', function(e) {
        handleImagePreview(e.target, 'edit-image-preview', editTempImages);
    });
    
    // 关闭详情按钮
    document.getElementById('close-detail-button').addEventListener('click', closeModals);
    
    // 滚动事件监听器
    window.addEventListener('scroll', handleScroll);
    
    // 添加分类表单提交
    document.getElementById('rename-category-form').addEventListener('submit', handleRenameCategory);
    
    // 添加编辑表单提交事件监听器
    document.getElementById('edit-task-form').addEventListener('submit', handleEditTask);
}

// 加载分类
function loadCategories() {
    try {
        const savedCategories = localStorage.getItem('todo-categories');
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
        }
    } catch (e) {
        console.error('加载分类失败:', e);
    }
}

// 保存分类
function saveCategories() {
    try {
        localStorage.setItem('todo-categories', JSON.stringify(categories));
    } catch (e) {
        console.error('保存分类失败:', e);
    }
}

// 渲染分类列表
function renderCategories() {
    const categoriesList = document.getElementById('categories');
    // 保留添加分类按钮
    const addButton = document.getElementById('add-category-btn');
    
    // 清空列表但保留按钮
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.dataset.category = category.id;
        
        // 默认分类不显示操作按钮
        if (category.id === 'all') {
            li.innerHTML = `
                <span>${category.name}</span>
            `;
            li.classList.add('active');
        } else {
            // 自定义分类显示操作按钮
            li.innerHTML = `
                <span>${category.name}</span>
                <div class="category-actions">
                    <button class="category-action-btn" data-action="edit" title="重命名">✏️</button>
                    <button class="category-action-btn" data-action="delete" title="删除">🗑️</button>
                </div>
            `;
            
            // 添加操作按钮事件监听
            const editBtn = li.querySelector('[data-action="edit"]');
            const deleteBtn = li.querySelector('[data-action="delete"]');
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openRenameCategoryModal(category.id, category.name);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCategory(category.id);
            });
        }
        
        categoriesList.appendChild(li);
    });
    
    // 重新添加按钮
    categoriesList.appendChild(addButton);
}

// 打开添加分类提示
function openAddCategoryPrompt() {
    const categoryName = prompt('请输入新分类名称:');
    if (categoryName && categoryName.trim() !== '') {
        const categoryId = categoryName.trim().toLowerCase().replace(/\s+/g, '-');
        
        // 检查分类是否已存在
        if (!categories.some(cat => cat.id === categoryId)) {
            categories.push({
                id: categoryId,
                name: categoryName.trim()
            });
            
            saveCategories();
            renderCategories();
        } else {
            alert('分类已存在!');
        }
    }
}

// 处理滚动事件
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 如果向下滚动且按钮可见，则隐藏按钮
    if (scrollTop > lastScrollTop && floatingButtonsVisible) {
        document.querySelector('.floating-button').style.transform = 'translateY(100px)';
        document.querySelector('.settings-button').style.transform = 'translateY(100px)';
        floatingButtonsVisible = false;
    } 
    // 如果向上滚动且按钮不可见，则显示按钮
    else if (scrollTop < lastScrollTop && !floatingButtonsVisible) {
        document.querySelector('.floating-button').style.transform = 'translateY(0)';
        document.querySelector('.settings-button').style.transform = 'translateY(0)';
        floatingButtonsVisible = true;
    }
    
    lastScrollTop = scrollTop;
}

// 打开添加任务模态框
function openAddTaskModal() {
    document.getElementById('add-task-form').reset();
    document.getElementById('image-preview').innerHTML = '';
    tempImages = [];
    
    // 更新分类选择框
    updateCategorySelects();
    
    document.getElementById('add-task-modal').style.display = 'flex';
}

// 更新分类选择框
function updateCategorySelects() {
    const categorySelects = document.querySelectorAll('.task-category-select');
    categorySelects.forEach(select => {
        // 保存当前选择
        const currentValue = select.value;
        
        // 清空选项
        select.innerHTML = '';
        
        // 添加所有分类选项
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
        
        // 恢复选择（如果存在）
        if (currentValue && categories.some(cat => cat.id === currentValue)) {
            select.value = currentValue;
        }
    });
}

// 新增: 添加图片预览项
function addImagePreviewItem(container, src, index, previewContainerId, imageArray) {
    const item = document.createElement('div');
    item.className = 'image-preview-item';
    
    item.innerHTML = `
        <img src="${src}" alt="预览">
        <div class="image-actions">
            <button class="move-up" title="上移">↑</button>
            <button class="move-down" title="下移">↓</button>
            <button class="replace" title="替换">🔄</button>
            <button class="delete" title="删除">🗑️</button>
        </div>
    `;
    
    // 添加事件监听器
    item.querySelector('.move-up').addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        // 添加边界检查
        if (index > 0) {
            moveImage(index, 'up', previewContainerId, imageArray);
        }
    });
    
    item.querySelector('.move-down').addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        // 添加边界检查
        if (index < imageArray.length - 1) {
            moveImage(index, 'down', previewContainerId, imageArray);
        }
    });
    
    item.querySelector('.replace').addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        replaceImage(index, previewContainerId, imageArray);
    });
    
    item.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        deleteImage(index, previewContainerId, imageArray);
    });
    
    container.appendChild(item);
}

// 新增: 删除图片
function deleteImage(index, previewContainerId, imageArray) {
    imageArray.splice(index, 1);
    refreshImagePreviews(previewContainerId, imageArray);
}

// 新增: 移动图片
function moveImage(index, direction, previewContainerId, imageArray) {
    // 添加边界检查，防止在边界位置点击按钮时关闭模态框
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < imageArray.length - 1)) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        // 交换数组中的元素
        [imageArray[index], imageArray[newIndex]] = [imageArray[newIndex], imageArray[index]];
        refreshImagePreviews(previewContainerId, imageArray);
    }
}

// 新增: 替换图片
function replaceImage(index, previewContainerId, imageArray) {
    const input = document.getElementById('replace-image-input');
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageArray[index] = e.target.result;
                refreshImagePreviews(previewContainerId, imageArray);
            };
            reader.readAsDataURL(file);
        }
        // 修复：重置文件输入的onchange事件和值
        input.value = '';
        input.onchange = null;
    };
    input.click();
}

// 新增: 刷新图片预览
function refreshImagePreviews(previewContainerId, imageArray) {
    const previewContainer = document.getElementById(previewContainerId);
    previewContainer.innerHTML = '';
    
    imageArray.forEach((src, index) => {
        addImagePreviewItem(previewContainer, src, index, previewContainerId, imageArray);
    });
}

// 修改: 处理图片预览
function handleImagePreview(input, previewContainerId, imageArray) {
    const previewContainer = document.getElementById(previewContainerId);
    const files = input.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imageArray.push(e.target.result);
            addImagePreviewItem(previewContainer, e.target.result, imageArray.length - 1, previewContainerId, imageArray);
        };
        reader.readAsDataURL(file);
    }
    
    // 修复：重置文件输入
    input.value = '';
}

// 处理添加任务
function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value.trim();
    const content = document.getElementById('task-content').value.trim();
    const category = document.getElementById('task-category').value;
    
    if (!title) {
        alert('请输入任务标题');
        return;
    }
    
    addTask(title, content, [...tempImages], category);
    closeModals();
}

// 添加任务
function addTask(title, content = '', images = [], category = 'all') {
    const task = {
        id: Date.now(),
        title: title,
        content: content,
        completed: false,
        category: category,
        images: images,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
}

// 切换任务完成状态
function toggleTaskCompletion(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    
    saveTasks();
    renderTasks();
}

// 删除任务
function deleteTask(id) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// 打开编辑任务模态框
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-content').value = task.content;
    document.getElementById('edit-task-category').value = task.category;
    
    // 更新分类选择框
    updateCategorySelects();
    // 确保选中正确的分类
    document.getElementById('edit-task-category').value = task.category;
    
    // 显示现有图片
    editTempImages = [...(task.images || [])];
    const previewContainer = document.getElementById('edit-image-preview');
    previewContainer.innerHTML = '';
    
    if (task.images && task.images.length > 0) {
        task.images.forEach((imgSrc, index) => {
            addImagePreviewItem(previewContainer, imgSrc, index, 'edit-image-preview', editTempImages);
        });
    }
    
    document.getElementById('edit-task-modal').style.display = 'flex';
}

// 打开任务详情模态框
function openTaskDetailModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('task-detail-title').textContent = task.title;
    document.getElementById('task-detail-content').textContent = task.content || '无内容';
    
    const imagesContainer = document.getElementById('task-detail-images');
    imagesContainer.innerHTML = '';
    
    if (task.images && task.images.length > 0) {
        task.images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            imagesContainer.appendChild(img);
        });
    } else {
        imagesContainer.innerHTML = '<p>无图片</p>';
    }
    
    document.getElementById('task-detail-modal').style.display = 'flex';
}

// 处理编辑任务
function handleEditTask(e) {
    e.preventDefault();
    
    const taskId = parseInt(document.getElementById('edit-task-id').value);
    const title = document.getElementById('edit-task-title').value.trim();
    const content = document.getElementById('edit-task-content').value.trim();
    const category = document.getElementById('edit-task-category').value;
    
    if (!title) {
        alert('请输入任务标题');
        return;
    }
    
    editTask(taskId, title, content, [...editTempImages], category);
    closeModals();
}

// 编辑任务
function editTask(taskId, title, content, images, category) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                title: title,
                content: content,
                category: category,
                images: images
            };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

// 关闭所有模态框
function closeModals() {
    document.getElementById('add-task-modal').style.display = 'none';
    document.getElementById('edit-task-modal').style.display = 'none';
    document.getElementById('task-detail-modal').style.display = 'none';
    document.getElementById('settings-modal').style.display = 'none';
    document.getElementById('rename-category-modal').style.display = 'none';
    document.getElementById('task-images').value = '';
    document.getElementById('edit-task-images').value = '';
}

// 渲染任务
function renderTasks() {
    const activeCategory = document.querySelector('#categories li.active').dataset.category;
    const taskList = document.querySelector('.task-list');
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (activeCategory !== 'all') {
        filteredTasks = tasks.filter(task => task.category === activeCategory);
    }
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">没有任务</div>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // 获取分类名称
        const category = categories.find(cat => cat.id === task.category) || { name: '未知分类' };
        
        // 构建任务内容HTML
        let taskContentHTML = `<div class="task-content">${task.title}</div>`;
        
        // 添加任务详情（如果有内容或图片）
        if (task.content || (task.images && task.images.length > 0)) {
            taskContentHTML += `<div class="task-detail">`;
            
            if (task.content) {
                taskContentHTML += `${task.content.substring(0, 50)}${task.content.length > 50 ? '...' : ''}`;
            }
            
            // 有图片时显示图片标志
            if (task.images && task.images.length > 0) {
                taskContentHTML += ` 📷`;
            }
            
            taskContentHTML += `</div>`;
        }
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-main">
                ${taskContentHTML}
            </div>
            <div class="task-actions">
                <button class="task-edit">✎</button>
                <button class="task-delete">×</button>
            </div>
        `;
        
        // 点击任务内容显示详情
        const taskContentElement = taskElement.querySelector('.task-content');
        taskContentElement.addEventListener('click', () => openTaskDetailModal(task.id));
        
        // 如果有详情信息，也添加点击事件
        const taskDetailElement = taskElement.querySelector('.task-detail');
        if (taskDetailElement) {
            taskDetailElement.addEventListener('click', () => openTaskDetailModal(task.id));
        }
        
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        
        const editBtn = taskElement.querySelector('.task-edit');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditTaskModal(task.id);
        });
        
        const deleteBtn = taskElement.querySelector('.task-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });
        
        taskList.appendChild(taskElement);
    });
}

// 保存任务到localStorage
function saveTasks() {
    try {
        localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('保存任务失败:', e);
        alert('存储空间已满，无法保存任务');
    }
}

// 从localStorage加载任务
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('todo-tasks');
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            
            // 验证数据结构
            if (Array.isArray(parsedTasks) && parsedTasks.every(task => 
                task.id && task.content !== undefined && task.completed !== undefined)) {
                tasks = parsedTasks;
            } else {
                console.warn('任务数据格式不正确，已重置');
                tasks = [];
            }
        }
    } catch (e) {
        console.error('加载任务失败:', e);
        tasks = [];
    }
}

// 导出任务
function exportTasks() {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedTasks = JSON.parse(event.target.result);
            
            // 验证导入的数据
            if (!Array.isArray(importedTasks)) {
                throw new Error('导入的文件格式不正确，应为任务数组');
            }
            
            if (importedTasks.length === 0) {
                throw new Error('导入的文件中没有任务数据');
            }
            
            // 验证每个任务的结构
            const isValid = importedTasks.every(task => 
                task.id && task.content !== undefined && task.completed !== undefined);
                
            if (!isValid) {
                throw new Error('部分任务数据格式不正确');
            }
            
            if (confirm(`确定要导入 ${importedTasks.length} 个任务吗？这将覆盖当前的所有任务`)) {
                tasks = importedTasks;
                saveTasks();
                renderTasks();
                alert(`成功导入 ${importedTasks.length} 个任务！`);
            }
        } catch (e) {
            console.error('导入任务失败:', e);
            alert(`导入失败: ${e.message}\n请确保文件格式正确`);
        }
        
        // 重置文件输入，以便可以再次选择相同的文件
        document.getElementById('file-input').value = '';
    };
    
    reader.onerror = function() {
        console.error('文件读取失败:', reader.error);
        alert('文件读取失败，请重试');
        document.getElementById('file-input').value = '';
    };
    
    reader.readAsText(file);
}

// 打开设置
function openSettings() {
    // 这里可以添加更多设置选项
    document.getElementById('settings-modal').style.display = 'flex';
}

// 打开重命名分类模态框
function openRenameCategoryModal(categoryId, categoryName) {
    document.getElementById('rename-category-id').value = categoryId;
    document.getElementById('rename-category-name').value = categoryName;
    document.getElementById('rename-category-modal').style.display = 'flex';
}

// 处理重命名分类
function handleRenameCategory(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('rename-category-id').value;
    const categoryName = document.getElementById('rename-category-name').value.trim();
    
    if (!categoryName) {
        alert('请输入分类名称');
        return;
    }
    
    renameCategory(categoryId, categoryName);
    closeModals();
}

// 重命名分类
function renameCategory(categoryId, newName) {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
        category.name = newName;
        saveCategories();
        renderCategories();
    }
}

// 删除分类
function deleteCategory(categoryId) {
    if (confirm('确定要删除这个分类吗？该分类下的所有任务将移至"我的任务"')) {
        // 将该分类下的任务移至"我的任务"
        tasks = tasks.map(task => {
            if (task.category === categoryId) {
                return { ...task, category: 'all' };
            }
            return task;
        });
        
        // 删除分类
        categories = categories.filter(cat => cat.id !== categoryId);
        
        saveCategories();
        saveTasks();
        renderCategories();
        renderTasks();
    }
}