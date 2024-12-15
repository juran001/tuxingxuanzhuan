class ShapeRotation {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.shapes = {
            line: this.drawLine.bind(this),
            triangle: this.drawTriangle.bind(this),
            trapezoid: this.drawTrapezoid.bind(this),
            pentagon: this.drawPentagon.bind(this)
        };
        
        this.currentRotation = 0;
        this.initialPosition = 0;
        this.isAnimating = false;
        
        // 更新音效链接为本地文件
        this.sounds = {
            rotate: new Audio('./sounds/click.mp3'),
            reset: new Audio('./sounds/reset.mp3'),
            change: new Audio('./sounds/switch.mp3')
        };
        
        // 预加载音效并设置音量
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.2; // 降低音量到20%
        });
        
        this.initialSetup();
        this.bindEvents();
    }

    initialSetup() {
        this.resizeCanvas();
        this.drawCoordinateSystem();
        this.shapes[document.getElementById('shape-select').value]();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.scale = Math.min(this.canvas.width, this.canvas.height) * (3/8);
    }

    drawCoordinateSystem() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格和刻度
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        const gridSize = this.scale / 2; // 网格大小

        // 绘制垂直网格线
        for (let x = this.centerX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let x = this.centerX; x > 0; x -= gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // 绘制水平网格线
        for (let y = this.centerY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        for (let y = this.centerY; y > 0; y -= gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // 绘制主坐标轴
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1;
        
        // X轴
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.canvas.width, this.centerY);
        this.ctx.stroke();
        
        // Y轴
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.canvas.height);
        this.ctx.stroke();
        
        // 原点
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawShape(rotation, isInitial = false) {
        // 设置绘图式
        this.ctx.lineWidth = 2; // 加粗线条
        this.ctx.strokeStyle = '#007AFF'; // 使用蓝色
        
        if (isInitial) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.fillStyle = 'rgba(0, 122, 255, 0.2)'; // 半透明填充色
        } else {
            this.ctx.globalAlpha = 1;
            this.ctx.setLineDash([]);
            this.ctx.fillStyle = 'rgba(0, 122, 255, 0.5)'; // 半透明填充色
        }

        // 获取当前选择的图形
        const currentShape = document.getElementById('shape-select').value;
        this.shapes[currentShape](rotation);

        // 重置样式
        this.ctx.globalAlpha = 1;
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 1;
    }

    drawLine(rotation = 0) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;  // 加粗线条
        this.ctx.strokeStyle = '#007AFF';  // 使用蓝色
        
        // 从原点开始绘制
        this.ctx.moveTo(this.centerX, this.centerY);
        const endX = this.centerX + this.scale * Math.cos(rotation);
        const endY = this.centerY + this.scale * Math.sin(rotation);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // 标注端点
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('A', this.centerX - 15, this.centerY - 5);
        this.ctx.fillText('B', endX + 5, endY + 5);
        
        // 重置线条样式
        this.ctx.lineWidth = 1;
    }

    drawTriangle(rotation = 0) {
        const radius = this.scale;
        const points = [];
        
        // A点固定在原点
        points.push({ x: this.centerX, y: this.centerY });
        
        // B点：从A点出发，向右旋转
        const angleB = rotation;
        points.push({
            x: this.centerX + radius * Math.cos(angleB),
            y: this.centerY + radius * Math.sin(angleB)
        });
        
        // C点：从B点旋转60度
        const angleC = rotation + Math.PI / 3; // 60度 = π/3
        points.push({
            x: this.centerX + radius * Math.cos(angleC),
            y: this.centerY + radius * Math.sin(angleC)
        });
        
        // 绘制三角形
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.closePath();
        this.ctx.fill(); // 先填充
        this.ctx.stroke(); // 后描边
        
        // 标注顶点
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        const labels = ['A', 'B', 'C'];
        points.forEach((point, i) => {
            const offset = i === 0 ? -15 : 5;
            this.ctx.fillText(labels[i], point.x + offset, point.y + 5);
        });
    }

    drawTrapezoid(rotation = 0) {
        const radius = this.scale;
        const points = [];
        
        // 设置梯形的参数
        const baseAngle = Math.PI / 3;  // 60度
        const bottomWidth = radius;      // 下底长度
        const topWidth = radius * 0.6;   // 上底长度
        
        // A点固定在原点
        points.push({ x: this.centerX, y: this.centerY });
        
        // B点：从A点出发，向右旋转，与水平线成120度角
        const angleB = rotation + (2 * Math.PI / 3); // 120度
        points.push({
            x: this.centerX + topWidth * Math.cos(angleB),
            y: this.centerY + topWidth * Math.sin(angleB)
        });
        
        // C点：从B点水平向右
        points.push({
            x: points[1].x + bottomWidth * Math.cos(rotation),
            y: points[1].y + bottomWidth * Math.sin(rotation)
        });
        
        // D点：从A点水平向右
        points.push({
            x: this.centerX + bottomWidth * Math.cos(rotation),
            y: this.centerY + bottomWidth * Math.sin(rotation)
        });
        
        // 绘制梯形
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.closePath();
        this.ctx.fill(); // 先填充
        this.ctx.stroke(); // 后描边
        
        // 标注顶点
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        const labels = ['A', 'B', 'C', 'D'];
        points.forEach((point, i) => {
            const offset = i === 0 ? -15 : 5;
            this.ctx.fillText(labels[i], point.x + offset, point.y + 5);
        });
    }

    drawPentagon(rotation = 0) {
        const radius = this.scale;
        const points = [];
        
        // 计算正五边形的边长
        const sideLength = radius;
        // 计算中心到顶点的距离（外接圆半径）
        const R = sideLength / (2 * Math.sin(Math.PI / 5));
        // 计算内角（108度）
        const innerAngle = (3 * Math.PI) / 5;
        
        // A点固定在原点
        points.push({ x: this.centerX, y: this.centerY });
        
        // 计算其他四个顶点
        for (let i = 1; i < 5; i++) {
            // ��个顶点间隔72度(2π/5)，从A点开始
            const angle = rotation + (i * 2 * Math.PI / 5);
            // 使用外接圆半径确保边长相等
            points.push({
                x: this.centerX + R * Math.cos(angle),
                y: this.centerY + R * Math.sin(angle)
            });
        }
        
        // 绘制正五边形
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        // 闭合路径，连回第一个点
        this.ctx.closePath();
        this.ctx.stroke();
        
        // 标注顶点
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        const labels = ['A', 'B', 'C', 'D', 'E'];
        points.forEach((point, i) => {
            const offset = i === 0 ? -15 : 5;
            this.ctx.fillText(labels[i], point.x + offset, point.y + 5);
        });
    }

    redraw() {
        this.drawCoordinateSystem();
        if (this.isAnimating) {
            // 绘制初始位置的图形
            this.drawShape(this.initialPosition, true);
        }
        // 绘制当前位置的图形
        this.drawShape(this.currentRotation, false);
    }

    rotate() {
        if (this.isAnimating) return;
        
        // 播放旋转音效
        this.sounds.rotate.currentTime = 0;
        this.sounds.rotate.play().catch(e => console.log('Audio play failed:', e));
        
        const order = document.querySelector('input[name="rotation-order"]:checked').value;
        this.initialPosition = this.currentRotation;
        this.animateRotation(this.currentRotation);
    }

    animateRotation(targetRotation) {
        const duration = 1000; // 每步动画持续1秒
        const order = document.querySelector('input[name="rotation-order"]:checked').value;
        const clockwiseAngle = parseFloat(document.getElementById('clockwise').value) || 0;
        const counterClockwiseAngle = parseFloat(document.getElementById('counterclockwise').value) || 0;

        const animate = (step = 1, initialRotation = this.currentRotation) => {
            return new Promise((resolve) => {
                let startTime = null;
                let stepRotation = 0;

                // 计算这一步需要旋转的角度
                switch (order) {
                    case 'clockwise-only':
                        stepRotation = clockwiseAngle * Math.PI / 180;
                        break;
                    case 'counterclockwise-only':
                        stepRotation = -counterClockwiseAngle * Math.PI / 180;
                        break;
                    case 'clockwise-then-counter':
                        stepRotation = step === 1 ? 
                            clockwiseAngle * Math.PI / 180 : 
                            -counterClockwiseAngle * Math.PI / 180;
                        break;
                    case 'counter-then-clockwise':
                        stepRotation = step === 1 ? 
                            -counterClockwiseAngle * Math.PI / 180 : 
                            clockwiseAngle * Math.PI / 180;
                        break;
                }

                const targetRotation = initialRotation + stepRotation;

                const doAnimation = (currentTime) => {
                    if (!startTime) startTime = currentTime;
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // 使用缓动函数使动画更平滑
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    
                    this.currentRotation = initialRotation + (stepRotation * easeProgress);
                    this.redraw();

                    if (progress < 1) {
                        requestAnimationFrame(doAnimation);
                    } else {
                        resolve(this.currentRotation);
                    }
                };

                requestAnimationFrame(doAnimation);
            });
        };

        const runAnimation = async () => {
            this.isAnimating = true;
            
            // 记录初始位置用于显示虚线图形
            this.initialPosition = this.currentRotation;
            
            // 执行第一步动画
            const firstStepRotation = await animate(1);

            // 如果需要执行第二步动画
            if (order === 'clockwise-then-counter' || order === 'counter-then-clockwise') {
                // 等待500ms
                await new Promise(resolve => setTimeout(resolve, 500));
                // 执行第二步动画，使用第一步结束时的位置作为起点
                await animate(2, firstStepRotation);
            }

            this.isAnimating = false;
        };

        runAnimation();
    }

    reset() {
        // 播放重置音效
        this.sounds.reset.currentTime = 0;
        this.sounds.reset.play().catch(e => console.log('Audio play failed:', e));
        
        document.getElementById('clockwise').value = 0;
        document.getElementById('counterclockwise').value = 0;
        document.getElementById('clockwise-only').checked = true;
        this.currentRotation = 0;
        this.initialPosition = 0;
        this.isAnimating = false;
        this.redraw();
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.redraw();
        });

        document.getElementById('rotate-btn').addEventListener('click', () => this.rotate());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        
        document.getElementById('shape-select').addEventListener('change', () => {
            // 播放切换音效
            this.sounds.change.currentTime = 0;
            this.sounds.change.play().catch(e => console.log('Audio play failed:', e));
            
            this.redraw();
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ShapeRotation();
}); 