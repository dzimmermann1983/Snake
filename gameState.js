
var score = 0;
var scoreText;
var spaceBetweenParts = 25;
var snakeParts = 5;
var direction;
var finishGame = false;
var parts = [];
var foods = [];
var speed = 0;
var edges;

var gameState = {
    preload: function() {
        game.load.image('star', 'assets/star.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('food', 'assets/diamond.png');
    },

    create: function() {
        finishGame = false;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#000000';

        scoreText = game.add.text(25, 16, 'Score: '+score, {fontSize: '32px', fill: '#FFFFFF'});

        cursors = game.input.keyboard.createCursorKeys();
        console.log(cursors.pollRate);
        createParts();
        createFood();
        createWalls();
    }
};

var Food = function(game, x, y){
    Phaser.Sprite.call(this, game, x, y, 'food');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    foods.push(this);
};

Food.prototype = Object.create(Phaser.Sprite.prototype);
Food.prototype.constructor = Food;
Food.prototype.update = function(){
    var head = parts[0];
    game.physics.arcade.overlap(this, head, head.eat, null, this);
};

var Snake = function(game, x, y, target){
    Phaser.Sprite.call(this, game, x, y, 'star');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    this.target = target;
    this.anchor.setTo(0.5, 0.5);
    this.history = [];
};

Snake.prototype = Object.create(Phaser.Sprite.prototype);
Snake.prototype.constructor = Snake;
Snake.prototype.setVelocity = function() {
    var length = this.target.history.length - 1;
    var rotation = this.game.math.angleBetween(this.x, this.y, this.target.history[length].x, this.target.history[length].y);

    this.body.velocity.x = Math.cos(rotation) * 150;
    this.body.velocity.y = Math.sin(rotation) * 150;
};

Snake.prototype.eat = function(){
    this.kill();
    createFood();
    score++;
    scoreText.setText("Score: "+score);

    var lastPart = parts[parts.length-1];

    if(lastPart.deltaX < -0.5){
        var part = game.add.existing(new Snake(game, lastPart.x + spaceBetweenParts, lastPart.y, lastPart));
    } else if(lastPart.deltaX > 0.5){
        var part = game.add.existing(new Snake(game, lastPart.x - spaceBetweenParts, lastPart.y, lastPart));
    } else if(lastPart.deltaY < -0.5){
        var part = game.add.existing(new Snake(game, lastPart.x, lastPart.y + spaceBetweenParts, lastPart));
    } else if(lastPart.deltaY > 0.5){
        var part = game.add.existing(new Snake(game, lastPart.x, lastPart.y - spaceBetweenParts, lastPart));
    }

    parts.push(part);
};

var timecheck = 0;
Snake.prototype.update = function() {


    if(!finishGame){
        game.physics.arcade.collide(this, edges, endGame, null, this);

        if(this.target === null) {
            /*if(this.x <= 20){
             var tmpY = this.body.y;
             var tmpVelocityX = this.body.velocity.x;
             var tmpVelocityY = this.body.velocity.y;

             this.destroy();
             parts.shift();
             var part = game.add.existing(new Snake(game, game.width-20, tmpY, null));
             part.body.velocity.setTo(tmpVelocityX, tmpVelocityY);
             parts.unshift(part);
             this.history.push({x: part.x, y: part.y});

             } else{*/
            if(game.time.now - timecheck >= 200){
                var tmpMove = move.bind(this);
                tmpMove();
            }

            //}
        } else {
            var distanceToTarget = Phaser.Math.distance(this.x, this.y, this.target.x, this.target.y);

            if(distanceToTarget > spaceBetweenParts){
                this.setVelocity();
            }
        }

        this.history.push({x: this.x, y: this.y});
        if(this.history.length >= 5){
            this.history.shift();
        }

    }

    function move(){
        if(cursors.left.isDown && direction !== 'right'){
            direction = 'left';
            this.body.velocity.setTo(-150 - speed, 0);
            timecheck = game.time.now;
        } else if(cursors.right.isDown && direction !== 'left'){
            direction = 'right';
            this.body.velocity.setTo(150 + speed, 0);
            timecheck = game.time.now;
        } else if(cursors.down.isDown && direction !== 'up'){
            direction = 'down';
            this.body.velocity.setTo(0, 150 + speed);
            timecheck = game.time.now;
        } else if(cursors.up.isDown && direction !== 'down'){
            direction = 'up';
            this.body.velocity.setTo(0, -150 - speed);
            timecheck = game.time.now;
        }

    }
};

function createParts(){
    for(var i = 0; i < snakeParts; i++){
        var part = game.add.existing(new Snake(game, game.width/2 + i * spaceBetweenParts, game.height/2, part || null));
        parts.push(part);
    }
}

function createWalls(){
    edges = game.add.group();
    edges.enableBody = true;

    for(var i = 0; i < 5; i++){
        var randomX = getRandomIntFromInterval(0, game.width);
        var randomY = getRandomIntFromInterval(0, game.height);

        if(i % 2 === 0){
            var scaleX = 1;
            var scaleY = 0.5;
        } else{
            var scaleX = 0.05;
            var scaleY = 5;
        }

        var wall = edges.create(randomX, randomY, 'ground');
        wall.scale.setTo(scaleX, scaleY);
        wall.anchor.setTo(0.5, 0.5);
        wall.body.immovable = true;

        parts.forEach(function(part){
            game.physics.arcade.overlap(wall, part, removeWall, null, this);
        });

        foods.forEach(function(food){
            game.physics.arcade.overlap(wall, food, removeWall, null, this);
        });
    }

    function removeWall(wall, element){
        edges.remove(wall, true, true);
        wall.destroy();
    }
}

function createFood(){
    var randomX = getRandomIntFromInterval(50, game.width - 50);
    var randomY = getRandomIntFromInterval(50, game.height - 50);
    var food = new Food(game, randomX, randomY);

    if(typeof edges !== "undefined"){
        edges.forEach(checkCollision, this, true, food);
    }

    function checkCollision(wall, food){
        parts.forEach(function(part){
            game.physics.arcade.overlap(food, part, removeFood, null, this);
        });
        game.physics.arcade.overlap(wall, food, removeFood, null, this);
    }

    food.scale.setTo(0.7, 0.7);
    game.add.existing(food);

    var removeFood = function(){
        food.kill();
        createFood();
    }
}

function getRandomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function endGame(){
    game.world.alpha = 0;
    game.time.events.add(1000, function(){
        game.state.start('menu', true, true, true, score);
    }, this);
}

function startGame (){
    game.state.start('game', true, true);
}