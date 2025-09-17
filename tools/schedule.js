 // 课程表数据结构
let scheduleData = {};

// 节次时间设置
let periodSettings = [
    { name: "第1节", time: "08:00-08:45" },
    { name: "第2节", time: "08:55-09:40" },
    { name: "第3节", time: "09:50-10:35" },
    { name: "第4节", time: "10:45-11:30" },
    { name: "第5节", time: "11:40-12:25" },
    { name: "第6节", time: "14:00-14:45" },
    { name: "第7节", time: "14:55-15:40" },
    { name: "第8节", time: "15:50-16:35" },
    { name: "第9节", time: "16:45-17:30" },
    { name: "第10节", time: "19:00-19:45" },
    { name: "第11节", time: "19:55-20:40" },
    { name: "第12节", time: "20:50-21:35" }
];

// 页面元素
const scheduleTable = document.getElementById('scheduleTable');
const courseModal = document.getElementById('courseModal');
const settingsModal = document.getElementById('settingsModal');
const courseForm = document.getElementById('courseForm');
const settingsForm = document.getElementById('settingsForm');
const modalTitle = document.getElementById('modalTitle');
const closeBtns = document.querySelectorAll('.close-btn');
const addCourseBtn = document.getElementById('addCourseBtn');
const settingsBtn = document.getElementById('settingsBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const deleteCourseBtn = document.getElementById('deleteCourseBtn');
const periodSettingsContainer = document.getElementById('periodSettings');
const courseTimeSelect = document.getElementById('courseTime');
const addPeriodBtn = document.getElementById('addPeriodBtn');
// 新增导入导出相关元素
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const importFile = document.getElementById('importFile');

// 初始化课程表
function initSchedule() {
    // 加载保存的数据
    loadScheduleData();
    loadPeriodSettings();
    
    // 生成课程表
    generateScheduleTable();
    updatePeriodSettingsUI();
    updateCourseTimeOptions();
    
    // 绑定事件
    bindEvents();
}

// 生成课程表格
function generateScheduleTable() {
    const tbody = scheduleTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // 生成表格行
    for (let i = 0; i < periodSettings.length; i++) {
        const row = document.createElement('tr');
        
        // 根据行号设置交替背景色
        if (i % 2 === 0) {
            row.className = 'even-row';
        } else {
            row.className = 'odd-row';
        }
        
        // 检查是否为特殊节次（早读、午自习、晚自习等）
        const periodName = periodSettings[i].name;
        if (periodName.includes('早读') || periodName.includes('午自习') || 
            periodName.includes('晚自习') || periodName.includes('自习')) {
            row.className = 'special-period';
        }
        
        // 时间列
        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.innerHTML = `${periodSettings[i].name}<br>${periodSettings[i].time}`;
        row.appendChild(timeCell);
        
        // 周一到周日的课程格子
        for (let day = 1; day <= 7; day++) {
            const cell = document.createElement('td');
            cell.className = 'course-cell';
            cell.dataset.day = day;
            cell.dataset.period = i + 1;
            
            // 获取该时间段的课程信息
            const course = scheduleData[`${day}-${i+1}`];
            
            if (course) {
                // 显示课程信息
                let notesHTML = '';
                if (course.notes && course.notes.length > 0) {
                    // 截取前10个字符并添加省略号
                    const latestNote = course.notes[course.notes.length - 1];
                    const shortNote = latestNote.content.length > 10 
                        ? latestNote.content.substring(0, 10) + '...' 
                        : latestNote.content;
                    notesHTML = `<div class="course-note">${shortNote}</div>`;
                } else if (course.note) {
                    // 兼容旧版本的单条备注
                    const shortNote = course.note.length > 10 
                        ? course.note.substring(0, 10) + '...' 
                        : course.note;
                    notesHTML = `<div class="course-note">${shortNote}</div>`;
                }

                cell.innerHTML = `
                    <div class="course-info">
                        <div class="course-name">${course.name}</div>
                        <div class="course-location">${course.location}</div>
                        <div class="course-teacher">${course.teacher}</div>
                        <div class="course-details">
                            ${course.note || (course.notes && course.notes.length > 0) ? `<div class="note-indicator">★</div>` : ''}
                            ${notesHTML}
                        </div>
                    </div>
                `;
            } else {
                cell.innerHTML = '<div class="empty-cell"></div>';
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
    
    // 重新绑定课程单元格点击事件
    bindCourseCellEvents();
}

// 更新节次设置UI
function updatePeriodSettingsUI() {
    periodSettingsContainer.innerHTML = '';
    
    periodSettings.forEach((period, index) => {
        const periodSetting = document.createElement('div');
        periodSetting.className = 'period-setting';
        periodSetting.innerHTML = `
            <input type="text" class="period-name" value="${period.name}" placeholder="节次名称">
            <input type="text" class="period-time" value="${period.time}" placeholder="时间范围">
            <div class="period-actions">
                <button type="button" class="btn-danger delete-period-btn">删除</button>
            </div>
        `;
        
        // 绑定删除节次事件
        const deleteBtn = periodSetting.querySelector('.delete-period-btn');
        deleteBtn.addEventListener('click', () => {
            deletePeriod(index);
        });
        
        periodSettingsContainer.appendChild(periodSetting);
    });
}

// 更新课程时间选项
function updateCourseTimeOptions() {
    courseTimeSelect.innerHTML = '';
    
    periodSettings.forEach((period, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = `${period.name} (${period.time})`;
        courseTimeSelect.appendChild(option);
    });
}

// 绑定事件
function bindEvents() {
    // 关闭模态框
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === courseModal) {
            closeAllModals();
        }
        if (e.target === settingsModal) {
            closeAllModals();
        }
    });
    
    // 添加课程按钮
    addCourseBtn.addEventListener('click', () => {
        openCourseModal();
    });
    
    // 设置按钮
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    // 提交表单
    courseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCourse();
    });
    
    // 提交设置表单
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
    
    // 删除课程
    deleteCourseBtn.addEventListener('click', deleteCourse);
    
    // 清空课程表
    clearAllBtn.addEventListener('click', () => {
        if (confirm('确定要清空整个课程表吗？')) {
            scheduleData = {};
            saveScheduleData();
            generateScheduleTable();
            closeAllModals();
        }
    });
    
    // 恢复默认设置
    resetSettingsBtn.addEventListener('click', () => {
        if (confirm('确定要恢复默认节次设置吗？')) {
            // 恢复默认节次设置
            periodSettings = [
                { name: "第1节", time: "08:00-08:45" },
                { name: "第2节", time: "08:55-09:40" },
                { name: "第3节", time: "09:50-10:35" },
                { name: "第4节", time: "10:45-11:30" },
                { name: "第5节", time: "11:40-12:25" },
                { name: "第6节", time: "14:00-14:45" },
                { name: "第7节", time: "14:55-15:40" },
                { name: "第8节", time: "15:50-16:35" },
                { name: "第9节", time: "16:45-17:30" },
                { name: "第10节", time: "19:00-19:45" },
                { name: "第11节", time: "19:55-20:40" },
                { name: "第12节", time: "20:50-21:35" }
            ];
            updatePeriodSettingsUI();
            updateCourseTimeOptions();
        }
    });
    
    // 新增导入导出事件绑定
    exportDataBtn.addEventListener('click', exportScheduleData);
    importDataBtn.addEventListener('click', () => {
        importFile.click();
    });
    importFile.addEventListener('change', importScheduleData);
    
    // 新增节次按钮
    addPeriodBtn.addEventListener('click', addNewPeriod);
    
    // 添加保存备注按钮事件监听
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    
    // 为备注输入框添加回车换行功能
    document.getElementById('courseNote').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // 插入换行符
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
            // 调整光标位置
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });
    
    // 添加课程模态框取消按钮事件监听
    document.getElementById('cancelCourseBtn').addEventListener('click', closeAllModals);
    
    // 添加设置模态框取消按钮事件监听
    document.getElementById('cancelSettingsBtn').addEventListener('click', closeAllModals);
    
    // 绑定课程单元格点击事件
    bindCourseCellEvents();
    
    // 为备注输入框添加回车换行功能
    document.getElementById('courseNote').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // 插入换行符
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
            // 调整光标位置
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });
}

// 保存备注函数
function saveNote() {
    const noteContent = document.getElementById('courseNote').value.trim();
    const day = document.getElementById('editDay').value;
    const period = document.getElementById('editPeriod').value;
    
    // 如果有课程信息且备注内容不为空，则更新备注
    if (day && period && noteContent) {
        const courseKey = `${day}-${period}`;
        if (scheduleData[courseKey]) {
            // 初始化notes数组（如果不存在）
            if (!scheduleData[courseKey].notes) {
                scheduleData[courseKey].notes = [];
            }
            // 添加新备注到数组
            scheduleData[courseKey].notes.push({
                content: noteContent,
                timestamp: new Date().toLocaleString()
            });
            // 更新当前显示的备注为最新一条
            scheduleData[courseKey].note = noteContent;
            saveScheduleData();
            generateScheduleTable();
            
            // 更新备注历史显示
            updateNotesHistory(courseKey);
            
            // 清空备注输入框
            document.getElementById('courseNote').value = '';
            
        }
    } else if (!noteContent) {
        alert('请输入备注内容');
    }
}

// 更新备注历史显示
function updateNotesHistory(courseKey) {
    const notesHistory = document.getElementById('notesHistory');
    const currentCourseName = scheduleData[courseKey]?.name;
    
    if (currentCourseName) {
        // 收集所有同名课程的备注
        const allNotes = [];
        Object.keys(scheduleData).forEach(key => {
            const course = scheduleData[key];
            if (course.name === currentCourseName && course.notes && course.notes.length > 0) {
                // 修改：保存原始note索引
                course.notes.forEach((note, noteIndex) => {
                    const [day, period] = key.split('-');
                    allNotes.push({
                        ...note,
                        day: parseInt(day),
                        period: parseInt(period),
                        courseKey: key,
                        noteIndex: noteIndex
                    });
                });
            }
        });
        
        // 按时间排序
        allNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (allNotes.length > 0) {
            let historyHTML = '';
            allNotes.forEach((note) => {
                const dayName = getDayName(note.day);
                const periodName = periodSettings[note.period - 1]?.name || `第${note.period}节`;
                // 修改：使用保留秒数的格式化函数
                const formattedTime = formatDateTimeWithSeconds(note.timestamp);
                const formattedContent = note.content.replace(/\n/g, '<br>');
                historyHTML += `<div class="note-item" data-key="${note.courseKey}" data-index="${note.noteIndex}">
                    <div class="note-header-period">
                        <span class="note-header">${formattedTime}</span>
                        <span class="note-period">星期${dayName} ${periodName}</span>
                    </div>
                    <div class="note-content">${formattedContent}</div>
                    <div class="note-item-actions">
                        <button class="delete-note-btn" data-key="${note.courseKey}" data-index="${note.noteIndex}">删除</button>
                        <button class="edit-note-btn" data-key="${note.courseKey}" data-index="${note.noteIndex}">编辑</button>
                    </div>
                </div>`;
            });
            notesHistory.innerHTML = historyHTML;
            notesHistory.className = 'notes-history-container';
            
            // 使用事件委托处理动态生成的元素
            notesHistory.addEventListener('wheel', function(e) {
                this.scrollTop += e.deltaY;
                e.preventDefault();
            });
        } else {
            notesHistory.innerHTML = '<p style="color: #999; font-style: italic;">暂无备注历史</p>';
            notesHistory.className = '';
        }
    } else {
        notesHistory.innerHTML = '<p style="color: #999; font-style: italic;">暂无备注历史</p>';
        notesHistory.className = '';
    }
}

// 获取星期名称
function getDayName(dayIndex) {
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    return days[dayIndex - 1];
}

// 打开课程编辑模态框
function openCourseModal(day, period) {
    // 重置表单
    courseForm.reset();
    
    // 设置模态框标题
    if (day && period) {
        modalTitle.textContent = '编辑课程';
        document.getElementById('editDay').value = day;
        document.getElementById('editPeriod').value = period;
        
        // 填充已有课程信息
        const course = scheduleData[`${day}-${period}`];
        if (course) {
            document.getElementById('courseName').value = course.name || '';
            document.getElementById('courseLocation').value = course.location || '';
            document.getElementById('courseTeacher').value = course.teacher || '';
            document.getElementById('courseTime').value = period;
            document.getElementById('courseDay').value = day;
            // 修改：确保删除按钮显示为inline-block
            deleteCourseBtn.style.display = 'inline-block';
            
            // 显示备注历史
            updateNotesHistory(`${day}-${period}`);
        } else {
            // 当点击空单元格时，设置默认值
            document.getElementById('courseTime').value = period;
            document.getElementById('courseDay').value = day;
            // 清空备注字段
            document.getElementById('courseNote').value = '';
            deleteCourseBtn.style.display = 'none';
            document.getElementById('notesHistory').innerHTML = '<p style="color: #999; font-style: italic;">暂无备注历史</p>';
        }
    } else {
        modalTitle.textContent = '添加课程';
        deleteCourseBtn.style.display = 'none';
        document.getElementById('notesHistory').innerHTML = '<p style="color: #999; font-style: italic;">暂无备注历史</p>';
    }
    
    // 显示模态框
    courseModal.style.display = 'flex';
}

// 关闭所有模态框
function closeAllModals() {
    courseModal.style.display = 'none';
    settingsModal.style.display = 'none';
}

// 保存课程
function saveCourse() {
    const day = document.getElementById('courseDay').value;
    const period = document.getElementById('courseTime').value;
    const name = document.getElementById('courseName').value;
    const location = document.getElementById('courseLocation').value;
    const teacher = document.getElementById('courseTeacher').value;
    // 添加备注字段获取
    const note = document.getElementById('courseNote').value;
    
    if (!name) {
        alert('请输入课程名称');
        return;
    }
    
    // 保存到数据结构
    const courseKey = `${day}-${period}`;
    if (!scheduleData[courseKey]) {
        scheduleData[courseKey] = {};
    }
    
    scheduleData[courseKey].name = name;
    scheduleData[courseKey].location = location;
    scheduleData[courseKey].teacher = teacher;
    
    // 如果有新备注内容，则更新备注
    if (note) {
        scheduleData[courseKey].note = note;
        // 初始化notes数组（如果不存在）
        if (!scheduleData[courseKey].notes) {
            scheduleData[courseKey].notes = [];
        }
        // 检查是否已存在相同的备注内容
        const noteExists = scheduleData[courseKey].notes.some(n => n.content === note);
        if (!noteExists) {
            scheduleData[courseKey].notes.push({
                content: note,
                timestamp: new Date().toLocaleString()
            });
        }
    }
    
    // 保存到本地存储
    saveScheduleData();
    
    // 重新生成表格
    generateScheduleTable();
    
    // 关闭模态框
    closeAllModals();
}

// 删除课程
function deleteCourse() {
    const day = document.getElementById('editDay').value;
    const period = document.getElementById('editPeriod').value;
    
    if (confirm('确定要删除这门课程吗？')) {
        delete scheduleData[`${day}-${period}`];
        saveScheduleData();
        generateScheduleTable();
        closeAllModals();
    }
}

// 添加新节次
function addNewPeriod() {
    // 先保存当前用户输入的设置
    saveCurrentPeriodSettings();
    
    const newPeriod = {
        name: `第${periodSettings.length + 1}节`,
        time: "00:00-00:00"
    };
    periodSettings.push(newPeriod);
    updatePeriodSettingsUI();
}

// 保存当前用户在节次设置界面输入的内容
function saveCurrentPeriodSettings() {
    const periodNames = document.querySelectorAll('.period-name');
    const periodTimes = document.querySelectorAll('.period-time');
    
    // 更新periodSettings数组中的内容为用户当前输入的内容
    for (let i = 0; i < periodNames.length && i < periodSettings.length; i++) {
        if (periodNames[i] && periodTimes[i]) {
            periodSettings[i].name = periodNames[i].value;
            periodSettings[i].time = periodTimes[i].value;
        }
    }
}

// 删除节次
function deletePeriod(index) {
    if (periodSettings.length <= 1) {
        alert('至少需要保留一个节次');
        return;
    }
    
    // 先保存当前用户输入的设置
    saveCurrentPeriodSettings();
    
    if (confirm(`确定要删除"${periodSettings[index].name}"吗？`)) {
        // 删除该节次的所有课程数据
        for (let day = 1; day <= 7; day++) {
            delete scheduleData[`${day}-${index + 1}`];
            // 更新后续节次的课程数据索引
            for (let i = index + 1; i < periodSettings.length; i++) {
                if (scheduleData[`${day}-${i + 1}`]) {
                    scheduleData[`${day}-${i}`] = scheduleData[`${day}-${i + 1}`];
                    delete scheduleData[`${day}-${i + 1}`];
                }
            }
        }
        
        // 从节次设置中删除
        periodSettings.splice(index, 1);
        
        // 更新UI
        updatePeriodSettingsUI();
        updateCourseTimeOptions();
        generateScheduleTable();
        saveScheduleData();
    }
}

// 保存设置
function saveSettings() {
    // 收集节次设置
    const periodNames = document.querySelectorAll('.period-name');
    const periodTimes = document.querySelectorAll('.period-time');
    
    periodSettings = [];
    for (let i = 0; i < periodNames.length; i++) {
        periodSettings.push({
            name: periodNames[i].value,
            time: periodTimes[i].value
        });
    }
    
    // 保存设置到本地存储
    localStorage.setItem('periodSettings', JSON.stringify(periodSettings));
    
    // 更新UI
    generateScheduleTable();
    updateCourseTimeOptions();
    
    // 关闭模态框
    closeAllModals();
}

// 导出课程表数据
function exportScheduleData() {
    // 创建要导出的数据对象
    const exportData = {
        periodSettings: periodSettings,
        scheduleData: scheduleData,
        exportDate: new Date().toISOString()
    };
    
    // 转换为JSON字符串
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // 创建下载链接
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = '课程表数据.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 导入课程表数据
function importScheduleData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importedData.periodSettings || !importedData.scheduleData) {
                throw new Error('数据格式不正确');
            }
            
            if (confirm('导入数据将覆盖当前所有设置和课程数据，确定要导入吗？')) {
                // 应用导入的数据
                periodSettings = importedData.periodSettings;
                scheduleData = importedData.scheduleData;
                
                // 保存到本地存储
                localStorage.setItem('periodSettings', JSON.stringify(periodSettings));
                localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
                
                // 更新UI
                updatePeriodSettingsUI();
                updateCourseTimeOptions();
                generateScheduleTable();
                
                alert('数据导入成功！');
            }
        } catch (error) {
            alert('导入失败：' + error.message);
        }
        
        // 清空文件输入框
        importFile.value = '';
    };
    
    reader.readAsText(file);
}

// 保存课程表数据到本地存储
function saveScheduleData() {
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
}

// 从本地存储加载课程表数据
function loadScheduleData() {
    const savedData = localStorage.getItem('scheduleData');
    if (savedData) {
        scheduleData = JSON.parse(savedData);
    }
}

// 从本地存储加载节次设置
function loadPeriodSettings() {
    const savedSettings = localStorage.getItem('periodSettings');
    if (savedSettings) {
        periodSettings = JSON.parse(savedSettings);
    }
}

// 绑定课程单元格点击事件
function bindCourseCellEvents() {
    document.querySelectorAll('.course-cell').forEach(cell => {
        // 先移除已存在的事件监听器（如果有的话）
        const clone = cell.cloneNode(true);
        cell.parentNode.replaceChild(clone, cell);
        
        // 为新元素添加事件监听器
        clone.addEventListener('click', () => {
            const day = parseInt(clone.dataset.day);
            const period = parseInt(clone.dataset.period);
            const course = scheduleData[`${day}-${period}`];
            
            if (course) {
                // 如果有课程，则编辑课程
                openCourseModal(day, period);
            } else {
                // 如果没有课程，则添加课程，并传递默认的节次和星期
                openCourseModal(day, period);
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSchedule);

// 使用事件委托处理备注历史中的编辑和删除按钮点击事件
document.addEventListener('click', function(e) {
    // 处理编辑按钮点击
    if (e.target.classList.contains('edit-note-btn')) {
        // 阻止事件冒泡到模态框背景
        e.stopPropagation();
        const key = e.target.dataset.key;
        const index = parseInt(e.target.dataset.index);
        editNote(key, index);
    }
    
    // 处理删除按钮点击
    if (e.target.classList.contains('delete-note-btn')) {
        // 阻止事件冒泡到模态框背景
        e.stopPropagation();
        const key = e.target.dataset.key;
        const index = parseInt(e.target.dataset.index);
        deleteNote(key, index);
    }
});

// 新增：格式化日期时间用于输入框显示（精确到分钟，去除秒数）
function formatDateTimeForInput(dateTimeStr) {
    // 将 "YYYY/MM/DD HH:mm:ss" 或 "YYYY-MM-DD HH:mm:ss" 格式转换为 "YYYY-MM-DDTHH:mm" 格式
    try {
        const date = new Date(dateTimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        // 如果解析失败，返回空字符串
        return '';
    }
}

// 新增：格式化输入框的日期时间为显示格式（精确到分钟，去除秒数）
function formatInputDateTime(inputDateTime) {
    // 将 "YYYY-MM-DDTHH:mm" 格式转换为 "YYYY/MM/DD HH:mm" 格式
    try {
        const date = new Date(inputDateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    } catch (e) {
        // 如果解析失败，返回当前时间
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
}

// 新增：格式化日期时间（去除秒数）
function formatDateTimeWithoutSeconds(dateTimeStr) {
    try {
        const date = new Date(dateTimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    } catch (e) {
        return dateTimeStr; // 如果解析失败，返回原始字符串
    }
}

// 新增：格式化日期时间（保留秒数）
function formatDateTimeWithSeconds(dateTimeStr) {
    try {
        const date = new Date(dateTimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        return dateTimeStr; // 如果解析失败，返回原始字符串
    }
}

// 编辑备注
function editNote(courseKey, noteIndex) {
    // 修复：检查数据是否存在
    if (!scheduleData[courseKey] || !scheduleData[courseKey].notes || scheduleData[courseKey].notes.length <= noteIndex) {
        alert('备注数据不存在');
        return;
    }
    
    const note = scheduleData[courseKey].notes[noteIndex];
    const [day, period] = courseKey.split('-');
    
    // 创建编辑备注的模态框
    const editNoteModal = document.createElement('div');
    editNoteModal.className = 'modal';
    editNoteModal.style.display = 'flex';
    
    editNoteModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>编辑备注</h2>
                <button class="close-btn">&times;</button>
            </div>
            <form id="editNoteForm">
                <div class="form-group">
                    <label for="editNoteContent">备注内容</label>
                    <textarea id="editNoteContent" rows="4" style="width: 100%;">${note.content}</textarea>
                </div>
                
                <div class="form-group" style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label for="editNoteTime">上课时间</label>
                        <select id="editNoteTime">
                            ${periodSettings.map((periodSetting, index) => 
                                `<option value="${index + 1}" ${parseInt(period) === (index + 1) ? 'selected' : ''}>
                                    ${periodSetting.name} (${periodSetting.time})
                                </option>`).join('')}
                        </select>
                    </div>
                    
                    <div style="flex: 1;">
                        <label for="editNoteDay">星期</label>
                        <select id="editNoteDay">
                            <option value="1" ${parseInt(day) === 1 ? 'selected' : ''}>周一</option>
                            <option value="2" ${parseInt(day) === 2 ? 'selected' : ''}>周二</option>
                            <option value="3" ${parseInt(day) === 3 ? 'selected' : ''}>周三</option>
                            <option value="4" ${parseInt(day) === 4 ? 'selected' : ''}>周四</option>
                            <option value="5" ${parseInt(day) === 5 ? 'selected' : ''}>周五</option>
                            <option value="6" ${parseInt(day) === 6 ? 'selected' : ''}>周六</option>
                            <option value="7" ${parseInt(day) === 7 ? 'selected' : ''}>周日</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editNoteTimestamp">日期时间</label>
                    <input type="text" id="editNoteTimestamp" value="${note.timestamp || new Date().toLocaleString()}" placeholder="格式: YYYY/MM/DD HH:mm:ss">
                    <small>请输入有效日期时间格式，例如: 2023/12/25 14:30:00</small>
                </div>
                
                <div class="form-actions">
                <button type="button" class="btn-danger" id="deleteEditNoteBtn">删除</button>
                    <button type="button" class="btn-secondary" id="cancelEditNoteBtn">取消</button>
                    <button type="submit">保存</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(editNoteModal);
    
    // 修改closeModal函数，使其只在手动关闭编辑模态框时显示课程模态框
    const closeModal = () => {
        document.body.removeChild(editNoteModal);
    };
    
    const showCourseModal = () => {
        const courseModal = document.getElementById('courseModal');
        if (courseModal) {
            courseModal.style.display = 'flex';
        }
    };

    // 绑定事件
    const closeBtn = editNoteModal.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelEditNoteBtn');
    const deleteBtn = document.getElementById('deleteEditNoteBtn');
    const editNoteForm = document.getElementById('editNoteForm');

    closeBtn.addEventListener('click', () => {
        closeModal();
        showCourseModal();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeModal();
        showCourseModal();
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这条备注吗？')) {
            scheduleData[courseKey].notes.splice(noteIndex, 1);
            // 如果删除的是最后一条备注，更新当前显示的备注
            if (scheduleData[courseKey].notes.length > 0) {
                const latestNote = scheduleData[courseKey].notes[scheduleData[courseKey].notes.length - 1];
                scheduleData[courseKey].note = latestNote.content;
            } else {
                delete scheduleData[courseKey].note;
            }
            saveScheduleData();
            generateScheduleTable();
            updateNotesHistory(courseKey);
            closeModal();
            showCourseModal(); // 确保删除后保持课程模态框打开
        }
        // 如果用户点击取消，不执行任何操作，保持当前界面状态
    });

    // 修复：正确设置节次和星期的默认值
    const editNoteTime = document.getElementById('editNoteTime');
    const editNoteDay = document.getElementById('editNoteDay');
    
    // 设置当前节次和星期的选中状态
    editNoteTime.value = period;
    editNoteDay.value = day;
    
    editNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newContent = document.getElementById('editNoteContent').value;
        const newDay = document.getElementById('editNoteDay').value;
        const newPeriod = document.getElementById('editNoteTime').value;
        const newTimestamp = document.getElementById('editNoteTimestamp').value;
        const newCourseKey = `${newDay}-${newPeriod}`;
        
        // 验证时间戳格式
        if (newTimestamp && !isValidDateTimeFormat(newTimestamp)) {
            alert('请输入有效的日期时间格式，例如: 2023/12/25 14:30:00');
            return;
        }
        
        // 如果更改了日期或节次，需要移动备注
        if (newCourseKey !== courseKey) {
            // 在新的位置创建课程数据（如果不存在）
            if (!scheduleData[newCourseKey]) {
                scheduleData[newCourseKey] = {
                    name: `课程${newDay}-${newPeriod}`,
                    location: '',
                    teacher: '',
                    notes: []
                };
            }
            
            // 将备注添加到新位置
            scheduleData[newCourseKey].notes = scheduleData[newCourseKey].notes || [];
            scheduleData[newCourseKey].notes.push({
                content: newContent,
                timestamp: newTimestamp || note.timestamp // 保持原时间戳或使用新时间戳
            });
            
            // 从原位置删除备注
            scheduleData[courseKey].notes.splice(noteIndex, 1);
            
            // 如果原位置没有备注了，删除note字段
            if (scheduleData[courseKey].notes.length === 0) {
                delete scheduleData[courseKey].note;
            }
        } else {
            // 同位置修改备注
            scheduleData[courseKey].notes[noteIndex].content = newContent;
            // 新增：更新时间戳
            if (newTimestamp) {
                scheduleData[courseKey].notes[noteIndex].timestamp = newTimestamp;
            }
        }
        
        saveScheduleData();
        generateScheduleTable();
        updateNotesHistory(newCourseKey);
        closeModal();
    });
}

// 删除备注函数
function deleteNote(courseKey, noteIndex) {
    if (confirm('确定要删除这条备注吗？')) {
        scheduleData[courseKey].notes.splice(noteIndex, 1);
        // 如果删除的是最后一条备注，更新当前显示的备注
        if (scheduleData[courseKey].notes.length > 0) {
            const latestNote = scheduleData[courseKey].notes[scheduleData[courseKey].notes.length - 1];
            scheduleData[courseKey].note = latestNote.content;
        } else {
            delete scheduleData[courseKey].note;
        }
        saveScheduleData();
        generateScheduleTable();
        updateNotesHistory(courseKey);
    }
    // 如果用户点击取消，不执行任何操作，保持当前界面状态
}

// 新增：验证日期时间格式的函数
function isValidDateTimeFormat(dateTimeStr) {
    // 支持格式如: 2023/12/25 14:30:00 或 2023-12-25 14:30:00 或 2023/12/25 14:30 或 2023-12-25 14:30
    const regexWithSeconds = /^\d{4}[\/\-]\d{2}[\/\-]\d{2} \d{2}:\d{2}:\d{2}$/;
    const regexWithoutSeconds = /^\d{4}[\/\-]\d{2}[\/\-]\d{2} \d{2}:\d{2}$/;
    // 新增：支持单位数月份和日期的格式
    const regexWithSingleDigits = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2} \d{1,2}:\d{2}(:\d{2})?$/;
    return regexWithSeconds.test(dateTimeStr) || regexWithoutSeconds.test(dateTimeStr) || regexWithSingleDigits.test(dateTimeStr);
}

// 新增：格式化日期时间的函数，自动补零
function formatDateTime(dateTimeStr) {
    // 尝试解析日期时间字符串
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
        // 如果无法解析，尝试手动解析
        const parts = dateTimeStr.split(' ');
        if (parts.length === 2) {
            const datePart = parts[0].split(/[-\/]/);
            const timePart = parts[1].split(':');
            
            if (datePart.length === 3 && (timePart.length === 2 || timePart.length === 3)) {
                const year = datePart[0];
                const month = datePart[1].padStart(2, '0');
                const day = datePart[2].padStart(2, '0');
                const hour = timePart[0].padStart(2, '0');
                const minute = timePart[1].padStart(2, '0');
                const second = timePart[2] ? timePart[2].padStart(2, '0') : '00';
                
                if (timePart.length === 2) {
                    return `${year}/${month}/${day} ${hour}:${minute}`;
                } else {
                    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
                }
            }
        }
        return dateTimeStr; // 如果无法解析，返回原始字符串
    }
    
    // 如果能正常解析，格式化为标准格式
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    // 检查原始字符串是否包含秒
    if (dateTimeStr.includes(':') && dateTimeStr.split(':')[2]) {
        return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    } else {
        return `${year}/${month}/${day} ${hour}:${minute}`;
    }
}
