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
    
    // 创建表格行
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
                cell.innerHTML = `
                    <div class="course-info">
                        <div class="course-name">${course.name}</div>
                        <div class="course-location">${course.location}</div>
                        <div class="course-teacher">${course.teacher}</div>
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
    
    // 绑定课程单元格点击事件
    bindCourseCellEvents();
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
            deleteCourseBtn.style.display = 'inline-block';
        } else {
            // 当点击空单元格时，设置默认值
            document.getElementById('courseTime').value = period;
            document.getElementById('courseDay').value = day;
            deleteCourseBtn.style.display = 'none';
        }
    } else {
        modalTitle.textContent = '添加课程';
        deleteCourseBtn.style.display = 'none';
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
    
    if (!name) {
        alert('请输入课程名称');
        return;
    }
    
    // 保存到数据结构
    scheduleData[`${day}-${period}`] = {
        name: name,
        location: location,
        teacher: teacher
    };
    
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