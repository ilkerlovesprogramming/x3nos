
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        document.getElementById('taskbarTime').textContent = timeString;
    }

    setInterval(updateTime, 1000);
    updateTime();

    function generateCalendar(year, month) {
        const now = new Date();
        const today = now.getDate();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        let calendarHTML = '<table><thead><tr>';
        calendarHTML += '<th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th>';
        calendarHTML += '</tr></thead><tbody><tr>';

        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<td></td>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            if (year === thisYear && month === thisMonth && day === today) {
                calendarHTML += `<td class="current-date">${day}</td>`;
            } else {
                calendarHTML += `<td>${day}</td>`;
            }
            if ((firstDay + day) % 7 === 0) {
                calendarHTML += '</tr><tr>';
            }
        }

        if ((firstDay + daysInMonth) % 7 !== 0) {
            calendarHTML += '</tr>';
        }

        calendarHTML += '</tbody></table>';

        let calendarTitle = `${year} - ${new Date(year, month).toLocaleString('default', { month: 'long' })}`;
        if (year === thisYear && month === thisMonth) {
            document.getElementById('calendarTitle').classList.add('current-month');
        }

        document.getElementById('calendarTitle').textContent = calendarTitle;
        document.getElementById('calendarContent').innerHTML = calendarHTML;
    }

    generateCalendar(currentYear, currentMonth);

    document.getElementById('prevYear').addEventListener('click', () => {
        currentYear--;
        generateCalendar(currentYear, currentMonth);
    });

    document.getElementById('nextYear').addEventListener('click', () => {
        currentYear++;
        generateCalendar(currentYear, currentMonth);
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    });

    const settingsButton = document.getElementById('settings');
    const settingsDialog = document.getElementById('settingsDialog');
    const closeSettingsButton = document.getElementById('closeSettings');

    settingsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        settingsDialog.style.display = 'block';
    });

    closeSettingsButton.addEventListener('click', () => {
        settingsDialog.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (!settingsDialog.contains(event.target) && event.target !== settingsButton) {
            settingsDialog.style.display = 'none';
        }
    });


    const timeElement = document.getElementById('taskbarTime');
    const calendarDialog = document.getElementById('calendarDialog');

    timeElement.addEventListener('click', () => {
        calendarDialog.style.display = 'block';
    });

    window.addEventListener('click', (event) => {
        if (!calendarDialog.contains(event.target) && event.target !== timeElement) {
            calendarDialog.style.display = 'none';
        }
    });

    window.addEventListener('load', () => {
        document.querySelector('.startup-sound').play();
    });

    const brightnessSlider = document.getElementById('brightness');
    const brightnessOverlay = document.getElementById('brightnessOverlay');

    brightnessSlider.addEventListener('input', () => {
        const brightness = brightnessSlider.value;
        brightnessOverlay.style.backgroundColor = `rgba(0, 0, 0, ${1 - brightness / 100})`;
    });

    const volumeSlider = document.getElementById('volume');
    let soundPreview = new Audio('https://archive.org/download/logo_20240823/soundpop.mp3');

    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value / 100;
        soundPreview.volume = volume;
        soundPreview.currentTime = 0;
        soundPreview.play();
    });



    class WindowFrame {
        constructor(id, settings = {}) {
            this.element = document.getElementById(id);
            this.settings = settings;
            this.minimizeResizeData = {};
            this.maximizeResizeData = {};
            this.isMaximized = false;
            this.isMinimized = false;
            this.init();
        }
    
        init() {
            this.createWindowStructure();
            this.resizeCorner = this.element.querySelector('.resize-corner');
            this.titleBar = this.element.querySelector('.title-bar');
            this.titleBar.addEventListener('mousedown', this.startDrag.bind(this));
            this.resizeCorner.addEventListener('mousedown', this.startResize.bind(this));
    
            const minimizeButton = this.titleBar.querySelector('.btn-minimize');
            const maximizeButton = this.titleBar.querySelector('.btn-maximize');
            const closeButton = this.titleBar.querySelector('.btn-close');
    
            minimizeButton.addEventListener('click', () => this.minimize());
            maximizeButton.addEventListener('click', () => this.maximize());
            closeButton.addEventListener('click', () => this.close());
    
            if (this.settings.resizable) {
                this.element.classList.add('resizable');
            }
            if (this.settings.maximizable) {
                this.element.classList.add('maximizable');
            }
            if (this.settings.minimizable) {
                this.element.classList.add('minimizable');
            }
            if (this.settings.movable) {
                this.element.classList.add('movable');
            }
    
            this.storeResizeData();
        }
    
        createWindowStructure() {
            this.element.innerHTML = `
                <div class="title-bar">
                    <div class="title">${this.settings.title || 'Window'}</div>
                    <div class="controls">
                        <button class="btn-minimize"><i class="fas fa-window-minimize"></i></button>
                        <button class="btn-maximize"><i class="fas fa-window-maximize"></i></button>
                        <button class="btn-close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="content">
                    <p>${this.settings.content || 'This is a window.'}</p>
                </div>
                <div class="resize-corner"></div>
            `;
        }
    
        startDrag(e) {
            e.preventDefault();
            const currentX = e.browserX;
            const currentY = e.browserY;
            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.element;
    
            const onMouseMove = (e) => {
                const dx = e.browserX - currentX;
                const dy = e.browserY - currentY;
    
                let newLeft = offsetLeft + dx;
                let newTop = offsetTop + dy;
    
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
    
                if (newTop < 0) {
                    newTop = 0;
                }
    
                if (newTop + offsetHeight > viewportHeight + offsetHeight / 2) {
                    newTop = viewportHeight - offsetHeight / 2;
                }
    
                if (newLeft < -offsetWidth / 2) {
                    newLeft = -offsetWidth / 2;
                }
    
                if (newLeft + offsetWidth > viewportWidth + offsetWidth / 2) {
                    newLeft = viewportWidth - offsetWidth / 2;
                }
    
                this.element.style.left = `${newLeft}px`;
                this.element.style.top = `${newTop}px`;
            };
    
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    
        startResize(e) {
            e.preventDefault();
            const initialWidth = this.element.offsetWidth;
            const initialHeight = this.element.offsetHeight;
            const currentX = e.browserX;
            const currentY = e.browserY;
    
            const onMouseMove = (e) => {
                const dx = e.browserX - currentX;
                const dy = e.browserY - currentY;
                this.element.style.width = initialWidth + dx + 'px';
                this.element.style.height = initialHeight + dy + 'px';
            };
    
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                this.storeResizeData();
            };
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    
        storeResizeData() {
            if (!this.isMaximized) {
                this.maximizeResizeData = {
                    width: this.element.offsetWidth,
                    height: this.element.offsetHeight,
                    xStart: this.element.offsetLeft,
                    yStart: this.element.offsetTop,
                };
            }
        }
    
        minimize() {
            this.isMinimized = true;
            this.element.classList.add('minimized');
        }
    
        maximize() {
            if (this.isMaximized) {
                // Restore
                this.element.style.width = this.maximizeResizeData.width + 'px';
                this.element.style.height = this.maximizeResizeData.height + 'px';
                this.element.style.left = this.maximizeResizeData.xStart + 'px';
                this.element.style.top = this.maximizeResizeData.yStart + 'px';
                this.isMaximized = false;
            } else {
                // Maximize
                this.storeResizeData();
                this.element.style.width = '100%';
                this.element.style.height = '100%';
                this.element.style.left = '0';
                this.element.style.top = '0';
                this.isMaximized = true;
            }
            this.element.classList.toggle('maximized');
        }
    
        close() {
            this.element.remove();
        }
    }
    
    const createWindow = () => {
        const newWindow = document.createElement('div');
        newWindow.className = 'window-frame';
        newWindow.id = 'dynamicWindow';
        document.getElementById('displayArea').appendChild(newWindow);
        return new WindowFrame('dynamicWindow', { 
            resizable: true, 
            maximizable: true, 
            minimizable: true, 
            movable: true,
            title: 'Dynamic Window',
            content: 'This is a dynamically created window.'
        });
    };
    
    window.addEventListener('load', createWindow);
    