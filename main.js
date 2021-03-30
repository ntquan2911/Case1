const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};

// Event Listeners
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});

class Player {
  constructor (x, y, width, height, color, dataType) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.dataType = dataType;
  
    if (this.dataType == "image") {
      this.image = new Image();
      this.image.src = color;
    }

    this.dy = 0;
    this.jumpForce = 15;
    this.originalHeight = height;
    this.grounded = false;
    this.jumpTimer = 0;
  }


  Animate () {
    
    // Jump
    if (keys['Space'] || keys['KeyW']) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys['ShiftLeft'] || keys['KeyS']) {
      this.height = this.originalHeight / 2;
    } else {
      this.height = this.originalHeight;
    }

    this.y += this.dy;

    // Gravity
    if (this.y + this.height < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.height;
    }

    this.Draw();
    
  }

  Jump () {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 50);
    }
  }

  Draw () {
    if (this.dataType == "image") {
      
      console.log(this.dataType);
      ctx.drawImage(this.image, 
        this.x, 
        this.y,
        this.width, this.height);
    } else {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.closePath();
      
    }
  }
}

class Obstacle {
  constructor (x, y, width, height, color, dataType) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color
    this.dataType = dataType
    this.dx = -gameSpeed;

      if (this.dataType == "image") {
        this.image = new Image();
        this.image.src = color;
      }
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw () {
    if (this.dataType == "image") {
      
      console.log(this.dataType);
      ctx.drawImage(this.image, 
        this.x, 
        this.y,
        this.width, this.height);
    } else {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();
    }
  }
}


class Text {
  constructor (t, x, y, a, color, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.color = color;
    this.s = s;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.font = this.s + "px sans-serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// Game Functions
function SpawnObstacle () {
  let size = RandomIntInRange(60, 100);
  let type = RandomIntInRange(0, 1);
  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, 'book.png', 'image');

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }
  obstacles.push(obstacle);
}


function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}




function Start () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px sans-serif";

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(400, 0, 100, 100,'kong.jpg', 'image');
  

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");
  
  requestAnimationFrame(Update);
  
}



let initialSpawnTimer = 150;
let spawnTimer = initialSpawnTimer;

function Update () {
  
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnObstacle();
    console.log(obstacles);
    spawnTimer = initialSpawnTimer - gameSpeed * 8;
    
    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  // Spawn Enemies
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.width < 0) {
      obstacles.splice(i, 1);
    }

    if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      obstacles = [];
      score = 0;
      spawnTimer = initialSpawnTimer;
      gameSpeed = 3;
      window.localStorage.setItem('highscore', highscore);
    }

    o.Update();
  }

  
  player.Animate();
  

  score++;
  scoreText.t = "Score: " + score;
  scoreText.Draw();

  
  if (score > highscore) {
    highscore = score;
    highscoreText.t = "Highscore: " + highscore;
  }
  
  highscoreText.Draw();

  gameSpeed += 0.003;
  
}


Start();