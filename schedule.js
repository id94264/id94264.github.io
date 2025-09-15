function init() {
    // 添加保存备注按钮事件监听
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    
    // 绑定课程单元格点击事件
    bindCourseCellEvents();
    
    // 解决备注历史滚动问题
    const notesHistory = document.getElementById('notesHistory');
    notesHistory.addEventListener('wheel', function(e) {
        // 阻止页面滚动，只滚动备注历史区域
        if (this.scrollHeight > this.clientHeight) {
            e.preventDefault();
            this.scrollTop += e.deltaY;
        }
    });
}

// 保存备注函数
function saveNote() {
    // 修改：将noteInput改为courseNote，确保正确获取备注内容
    const note = document.getElementById('courseNote').value;
    const course = getCurrentCourse();
    if (course) {
        course.note = note;
        updateCourseCell(course);
        addNoteToHistory(course.name, note);
    }
}

// 更新课程单元格内容
function updateCourseCell(course) {
    const cell = document.getElementById(`course-${course.id}`);
    if (course) {
        cell.innerHTML = `
                    <div class="course-info">
                        <div class="course-name">${course.name}</div>
                        <div class="course-location">${course.location}</div>
                        <div class="course-teacher">${course.teacher}</div>
                        ${course.note ? `<div class="course-note">${course.note}</div>` : ''}
                    </div>
                `;
    } else {
        cell.innerHTML = '<div class="empty-cell"></div>';
    }

}

// 绑定课程单元格点击事件
function bindCourseCellEvents() {
    const cells = document.querySelectorAll('.course-cell');
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            const course = getCurrentCourse();
            if (course) {
                document.getElementById('noteInput').value = course.note || '';
            }
        });
    });
}

// 添加备注到历史记录
function addNoteToHistory(courseKey, note) {
    const notesHistory = document.getElementById('notesHistory');
    // 清空容器内容，避免重复添加
    if (notesHistory.innerHTML === '<p style="color: #999; font-style: italic;">暂无备注历史</p>') {
        notesHistory.innerHTML = '';
    }
    
    const noteElement = document.createElement('div');
    noteElement.className = 'note-item';
    
    // 获取节次信息
    const [day, period] = courseKey.split('-');
    const periodInfo = periodSettings[parseInt(period) - 1];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    // 修复：正确获取note索引，通过内容匹配找到正确的索引位置
    const courseNotes = scheduleData[courseKey].notes;
    let noteIndex = -1;
    for (let i = 0; i < courseNotes.length; i++) {
        if (courseNotes[i].content === note) {
            noteIndex = i;
            break;
        }
    }
    
    // 如果没找到匹配的内容，说明是新添加的备注，索引为最后一个
    if (noteIndex === -1 && courseNotes.length > 0) {
        noteIndex = courseNotes.length - 1;
    }
    
    noteElement.innerHTML = `
        <div class="note-header-period">
            <span class="note-header">${scheduleData[courseKey].name}</span>
            <span class="note-period">${dayNames[parseInt(day) - 1]} ${periodInfo ? periodInfo.name : period}节</span>
        </div>
        <div class="note-content">${note}</div>
        <div class="note-timestamp">${new Date().toLocaleString()}</div>
        <div class="note-item-actions">
            <button class="edit-note-btn" data-course-key="${courseKey}" data-note-index="${noteIndex}">编辑</button>
        </div>
    `;
    
    notesHistory.appendChild(noteElement);
    
    // 修复：使用事件委托替代直接绑定，确保动态元素正确响应
    noteElement.querySelector('.edit-note-btn').addEventListener('click', function() {
        const courseKey = this.getAttribute('data-course-key');
        const noteIndex = parseInt(this.getAttribute('data-note-index'));
        editNote(courseKey, noteIndex);
    });
}

// 获取当前选中的课程
function getCurrentCourse() {
    const selectedCell = document.querySelector('.course-cell.selected');
    return selectedCell ? courses.find(course => course.id === parseInt(selectedCell.id.split('-')[1])) : null;
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
    
    // 创建新的模态框元素，避免ID冲突
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
                                </option>`
                            ).join('')}
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
                
                <!-- 新增：添加时间戳编辑字段 -->
                <div class="form-group">
                    <label for="editNoteTimestamp">日期时间</label>
                    <input type="text" id="editNoteTimestamp" value="${note.timestamp || new Date().toLocaleString()}" placeholder="格式: YYYY/MM/DD HH:mm:ss">
                    <small>请输入有效日期时间格式，例如: 2023/12/25 14:30:00</small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelEditNoteBtn">取消</button>
                    <button type="button" class="btn-danger" id="deleteEditNoteBtn">删除</button>
                    <button type="submit">保存</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(editNoteModal);
    
    // 绑定事件
    const closeBtn = editNoteModal.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelEditNoteBtn');
    const deleteBtn = document.getElementById('deleteEditNoteBtn');
    const editNoteForm = document.getElementById('editNoteForm');
    
    const closeModal = () => {
        document.body.removeChild(editNoteModal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这条备注吗？')) {
            scheduleData[courseKey].notes.splice(noteIndex, 1);
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
        }
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
        // 新增：获取时间戳值
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

// 新增：验证日期时间格式的函数（支持不带秒的格式）
function isValidDateTimeFormat(dateTimeStr) {
    // 支持格式如: 2023/12/25 14:30:00 或 2023-12-25 14:30:00 或 2023/12/25 14:30 或 2023-12-25 14:30
    const regexWithSeconds = /^\d{4}[\/\-]\d{2}[\/\-]\d{2} \d{2}:\d{2}:\d{2}$/;
    const regexWithoutSeconds = /^\d{4}[\/\-]\d{2}[\/\-]\d{2} \d{2}:\d{2}$/;
    return regexWithSeconds.test(dateTimeStr) || regexWithoutSeconds.test(dateTimeStr);
}

