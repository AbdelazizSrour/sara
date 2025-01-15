const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

// ضبط حجم الكانفاس
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// قائمة الفروع والقلوب
let branches = [];
let hearts = [];
let targetPoints = [];
let isAnimatingText = false;

// قائمة الألوان العشوائية
const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFD733", "#8E44AD"];

// كائن الفروع
class Branch {
    constructor(x, y, angle, length, depth, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
        this.depth = depth;
        this.color = color;
    }

    draw() {
        const newX = this.x + this.length * Math.cos(this.angle);
        const newY = this.y + this.length * Math.sin(this.angle);

        // رسم الفرع
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.max(this.depth, 1);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(newX, newY);
        ctx.stroke();

        // إضافة فروع جديدة إذا كان العمق > 0
        if (this.depth > 0) {
            const newLength = this.length * 0.75;
            const newDepth = this.depth - 1;
            const newColor = colors[Math.floor(Math.random() * colors.length)];

            // إضافة الفروع الجديدة
            branches.push(new Branch(newX, newY, this.angle - Math.PI / 4, newLength, newDepth, newColor));
            branches.push(new Branch(newX, newY, this.angle + Math.PI / 4, newLength, newDepth, newColor));
        } else {
            // إضافة القلوب عند النهاية
            const heartColor = colors[Math.floor(Math.random() * colors.length)];
            hearts.push(new Heart(newX, newY, heartColor));
        }
    }
}

// كائن القلوب
class Heart {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.targetX = null;
        this.targetY = null;
        this.speed = Math.random() * 2 + 1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.bezierCurveTo(this.x - 5, this.y - 5, this.x - 10, this.y + 10, this.x, this.y + 15);
        ctx.bezierCurveTo(this.x + 10, this.y + 10, this.x + 5, this.y - 5, this.x, this.y);
        ctx.fill();
    }

    update() {
        if (this.targetX !== null && this.targetY !== null) {
            // تحريك القلب نحو الهدف
            this.x += (this.targetX - this.x) * 0.05;
            this.y += (this.targetY - this.y) * 0.05;
        } else {
            // حركة عشوائية إذا لم يكن هناك هدف
            this.y -= this.speed;
        }
        this.draw();
    }
}

// إنشاء نقاط النص
function createTextPoints(text) {
    const fontSize = 150;
    ctx.font = `${fontSize}px Arial bold`;
    ctx.fillStyle = "white";
    ctx.fillText(text, canvas.width / 4, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = [];
    for (let y = 0; y < imageData.height; y += 10) {
        for (let x = 0; x < imageData.width; x += 10) {
            const index = (y * imageData.width + x) * 4;
            if (imageData.data[index] > 128) {
                points.push({ x, y });
            }
        }
    }
    return points;
}

// إنشاء شجرة جديدة
function createTree() {
    branches = [];
    hearts = [];
    isAnimatingText = false;
    targetPoints = createTextPoints("SARA");
    const startX = canvas.width / 2;
    const startY = canvas.height;
    const trunkLength = 200; // طول الجذع الأساسي
    const trunkDepth = 10; // عدد المستويات

    branches.push(new Branch(startX, startY, -Math.PI / 2, trunkLength, trunkDepth, colors[0]));
}

// تحريك القلوب إلى النص
function animateHeartsToText() {
    hearts.forEach((heart, index) => {
        if (index < targetPoints.length) {
            const target = targetPoints[index];
            heart.targetX = target.x;
            heart.targetY = target.y;
        }
    });
}

// تحديث الشاشة
function animate() {
    // تنظيف الشاشة لجعل الحركة مستمرة
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // رسم الفروع
    const currentBranches = [...branches];
    branches = [];
    currentBranches.forEach(branch => branch.draw());

    // تحريك ورسم القلوب
    hearts.forEach(heart => heart.update());

    if (!isAnimatingText && branches.length === 0 && currentBranches.length === 0) {
        isAnimatingText = true;
        animateHeartsToText();
    }

    // تشغيل الرسوم بشكل مستمر
    requestAnimationFrame(animate);

    // إعادة الشجرة عند انتهاء الحركة
    if (isAnimatingText && hearts.every(heart => Math.abs(heart.x - heart.targetX) < 1 && Math.abs(heart.y - heart.targetY) < 1)) {
        setTimeout(() => {
            createTree();
        }, 5000); // تأخير أكبر لإبقاء الكلمة معروضة لفترة
    }
}

// بدء الشجرة
createTree();
animate();
