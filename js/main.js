const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const scoreEl = document.querySelector("#Score");
const bigScoreEl = document.querySelector("#bigScore");
const startGame = document.querySelector("#startGamebtn");
const modalEl = document.querySelector("#modalEl");
const titleDiv = document.querySelector(".title-div");
canvas.width = innerWidth;
canvas.height = innerHeight;

let shootSound = new Audio("assets/laser.mp3")
let enemySound = new Audio("assets/death.mp3")
let music = new Audio("assets/music.mp3");
let gameOverSound = new Audio("assets/game-over");

class Player {
    constructor (x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill();
    }

}

class Bullet {
    constructor (x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill();
    }   
    update() {
        this.draw();
        this.x = this.velocity.x + this.x;
        this.y = this.velocity.y + this.y;
    }
}

class Enemy {
    constructor (x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill();
    }   
    update() {
        this.draw();
        this.x = this.velocity.x + this.x;
        this.y = this.velocity.y + this.y;
    }
}
class EnemyBlood {
    constructor (x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }   
    update() {
        this.draw();
        this.x = this.velocity.x + this.x;
        this.y = this.velocity.y + this.y;
        this.alpha -= 0.01;
    }
}
const canvx = canvas.width /2;
const canvy = canvas.height /2;
let player = new Player(canvx, canvy, 20, "white")
player.draw();
let bullets = [];
let enemies = [];
let enemyBlood = [];
let score = 0;

function init() {
    player = new Player(canvx, canvy, 20, "white")
    bullets = [];
    enemies = [];
    enemyBlood = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
    music.load();
    music.play();
}

function enemyMaker() {
    setInterval(() => {
        let x;
        let y;
        const radius = 25;//Math.random() * (30-20) + 20;
        const color = "green";
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : 2*canvx + radius;
            y = Math.random() * 2*canvy;
        }
        else {
            x = Math.random() * 2*canvx;
            y = Math.random() < 0.5 ? 0 - radius : 2*canvy + radius;
        }
        const angle = Math.atan2(canvy - y, canvx - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }   
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000);
}

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0, 0, 0, 0.4)"
    c.fillRect(0,0, canvas.width, canvas.height)
    player.draw();
    enemyBlood.forEach((particle,index) => {
        if (particle.alpha <= 0) {
            enemyBlood.splice(index, 1);
        } else {
            particle.update();
        }
        
    })
    bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    shootSound.play();
    if (
        bullet.x + bullet.radius < 0 ||
        bullet.x - bullet.radius > canvx*2 ||
        bullet.y + bullet.radius < 0 ||
        bullet.y - bullet.radius > canvy*2
    ) {
        setTimeout(() => {
            bullets.splice(bulletIndex, 1);
        }, 0);
    }
    });
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)    
        // Game over
        if (dist - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = "flex";
            bigScoreEl.innerHTML = score;
            music.pause();
            gameOverSound.play();
        }
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y)
            // When bullet hits enemy
            if (dist - enemy.radius - bullet.radius < 1) {
                enemySound.play();
                score +=10;
                scoreEl.innerHTML = score;
                for (let i = 0; i < 8; i++) {
                    enemyBlood.push(new EnemyBlood(bullet.x, bullet.y, 2, "red", {
                        x: (Math.random() - 0.5) * 2,
                    y : (Math.random() - 0.5) * 2}));
                    
                }
                setTimeout(() => {
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                }, 0);
                
            }
        });      
    });
}

addEventListener("click", (e) => {
    const angle = Math.atan2(e.clientY - canvy, e.clientX - canvx);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    console.log(bullets)
    console.log(angle);
    bullets.push(new Bullet (canvx, canvy, 8, "white", velocity))
})
startGame.addEventListener("click", ()=> {
    init();
    animate();
    enemyMaker(); 
    modalEl.style.display = "none";
    titleDiv.style.top = "0";
})
