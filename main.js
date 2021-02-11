Object.constructor.prototype.new = function () {
    var obj = Object.create(this.prototype);
    this.apply(obj, arguments);
    return obj;
};

draw = function () {
// Started - 08/29/2019 (actually 07/08/2018, but I scrapped the old code)
// finished - TBA


/*
TODO -

  Make powerups act like the player - so that all the rules that apply to the player
  (like death, hit detection, and so on) are applied to the powerups

 */

/* Setup */



smooth(); // For Firefox users
textFont(createFont("Trebuchet MS"), 20); // Not availabe on all operating systems
textAlign(CENTER, CENTER);
frameRate(60);

background(0, 0, 0, 0);
noStroke();
for (var i = 0; i < 600; i += 20) {
    fill(255, 255, 255, 200);
    ellipse(random(600), i, 5, 5);
}
var stars = get();

var buttonTilt = random(ceil(360));

var back_ground = function(){
    noStroke();
    pushMatrix();
    translate(0, 80);
    background(1, 30, 97);
    for (var i = 0; i < 600; i += 50) {
        fill(1 + i/10, 30 + i/10, 97 + i/10);
        rect(0, i, 600, i);
    }
    fill(255, 255, 255);
    beginShape();
    vertex(137 + 45, 163);
    bezierVertex(88 + 45, 233, 136 + 47, 273, 204 + 45, 243);
    bezierVertex(160 + 45, 240, 121 + 41, 238, 137 + 45, 163);
    endShape(CLOSE);
    image(stars, 0, -80);
    pushMatrix();
    translate(0, 0);
    ellipse(80, 80, 5, 5);
    ellipse(82, 78, 5, 5);
    ellipse(85, 75, 4, 4);
    ellipse(88, 72, 3, 3);
    ellipse(91, 69, 1, 1);
    popMatrix();
    pushMatrix();
    translate(138, 271);
    ellipse(80, 80, 5, 5);
    ellipse(82, 78, 5, 5);
    ellipse(85, 75, 4, 4);
    ellipse(88, 72, 3, 3);
    ellipse(91, 69, 1, 1);
    popMatrix();
    pushMatrix();
    translate(-5, 305);
    ellipse(80, 80, 5, 5);
    ellipse(82, 78, 5, 5);
    ellipse(85, 75, 4, 4);
    ellipse(88, 72, 3, 3);
    ellipse(91, 69, 1, 1);
    popMatrix();
    popMatrix();

    fill(0, 0, 0, 70);
    rect(0, 0, 400, 600);
};

var rocket = function(x, y, w, h){
    pushMatrix();
    translate(x, y);
    rotate(+sin(frameCount * 10) * 1.5);
    scale(w, h);
    translate(-145 - 5, -102);
    noStroke();
    fill(255, 111, 0, 150);
    triangle(168, 163, 68 + 56, 163, 147 + random(-10, 10), 200 + random(-30, 0));
    triangle(168, 163, 68 + 56, 163, 147 + random(-10, 10), 200 + random(-30, 10));
    triangle(168, 163, 68 + 56, 163, 147 + random(-10, 10), 200 + random(-30, 20));
    triangle(168, 163, 68 + 56, 163, 147 + random(-10, 10), 200 + random(-30, 30));
    triangle(168, 163, 68 + 56, 163, 147 + random(-10, 10), 200 + random(-30, 40));
    fill(130, 130, 130);
    rect(118 + 5, 86, 55 - 10, 86, 10);
    fill(171, 171, 171);
    rect(118, 82, 55, 86, 10);
    fill(255, 255, 255);
    rect(118, 47, 55, 63, 154);
    rect(118, 78, 55, 86);
    fill(0, 0, 0, 30);
    rect(118, 78, 39, 86);
    rect(118, 78, 17, 86);

    fill(255, 0, 0);
    arc(118, 164, 39, 50, -195, -90);
    arc(173, 164, 39, 50, -90, 15);
    arc(145.5, 79, 57, 102, -187, 7);

    fill(0, 0, 0, 70);
    arc(118, 164, 39, 50, -195, -122);
    arc(118, 164, 39, 50, -195, -159);
    arc(173, 164, 39, 50, -23, 15);
    arc(173, 164, 39, 50, -60, 15);
    arc(145.5, 79, 57, 102, -187, -62);
    arc(145.5, 79, 57, 102, -187, -117);

    popMatrix();
};

var mp = false; // Mouse pressed
var scene = "logo"; // Logo, menu, game, pause
var gotoScene = "logo";

var score = 0;

var pauseGame = false;
var playGame = false;
var upTime = 0;
var beginGameTime = 0; // The millis() that the game began
var soundVolume = 1.00; // Float ranges from 1 to 0

var Player = {
    x: 200,
    y: 200,
    w: 20,
    h: 20,
    health: 360, // 360 = max health
    rotation: 0,
    isAlive: true,
    speed: 1.04,
    gravity: 4,
    shield: false,
    shieldTime: 8
}; // The properties of the player

/* Effects */
var screenshake = {
    x: 0,
    y: 0,
    count: 0
};
function screenshaker () {
    screenshake.x = random(-10, 10);
    screenshake.y = random(-10, 10);

    screenshake.count -= 0.1;

    if (screenshake.count < 1) {
        screenshake.x = 0;
        screenshake.y = 0;
    }
}

// Used in the powerups for the wavy motion
function oscillate (period, amplitude) {
    // Oscillation adapted from Dan Shiffman, natureofcode.com
    angleMode = "radians";
    // Period: length of one period in frames
    // Amplitude in pixels
    var x = amplitude * sin(TWO_PI * frameCount / period);
    angleMode = "degrees";
    return x;
}

/* Walls */
var distBtwnWalls = 100;
var scrollSpeed = 1; // Controlling the amount it scrolls
var walls = []; // New wall objects are pushed to this array and then drawn from it using a for()
var numberWalls = 0; // Total number of walls that currently exist
function createWall (Y) {
    var wall = {};
    // Picks how many holes there are in each wall
    var oneHole = round(random(0, 1.4));
    // If two holes
    if (oneHole === 0) {
        // Randomize the two hole centers and sizes
        var hole0Center = random(0, 200);
        var hole0Width = random(65, 100);
        var hole1Center = random(200, 400) + hole0Width;
        var hole1Width = random(50, 100);
        // Build lines for the two holes
        wall.numberOfLines = 3;
        wall.startx = [];
        wall.endx = [];
        // 0<-line0->hole0<-line1->hole1<-line2->width
        wall.startx[0] = -100;

        wall.endx[0] = hole0Center - hole0Width / 2;
        wall.startx[1] = hole0Center + hole0Width / 2;
        wall.endx[1] = hole1Center - hole1Width / 2;
        wall.startx[2] = hole1Center + hole1Width / 2;
        wall.endx[2] = width;
    } else {
        var holeCenter = random(0, 400);
        var holeWidth = random(65, 100);

        // 0<-line0->hole<-line1->400
        wall.numberOfLines = 2;
        wall.startx = [];
        wall.endx = [];
        wall.startx[0] = -100;
        wall.endx[0] = holeCenter - holeWidth / 2;
        wall.startx[1] = holeCenter + holeWidth / 2;
        wall.endx[1] = 500;
    }
    // Y is same for any count of holes
    wall.Y = Y;
    return (wall);
}
function drawWall (wallData) {

    stroke(255, 255, 255);
    noStroke();
    for (var index = 0; index < wallData.numberOfLines; index++) {
        fill(0, 0, 0, 100);
        rect(wallData.startx[index], wallData.Y + 5, wallData.endx[index] - wallData.startx[index], 4, 5);
        fill(255, 255, 255);
        rect(wallData.startx[index], wallData.Y, wallData.endx[index] - wallData.startx[index], 5, 5);
    }

    wallData.Y -= scrollSpeed;
}

/* GUI */

var opacity = 1.1; // The opacity of the transition overlay (1.1 lowest safe parameter)
var transitionStage = 0;
function transition () {
    if (scene !== gotoScene) {
        if (transitionStage === 0) {
            opacity = constrain(opacity *= 1.2, 0, 256);
            if (opacity > 255) {
                scene = gotoScene;
                transitionStage = 1;
            }
        }
    }
    if (transitionStage === 1) {
        opacity = constrain(opacity -= 20, 1.1, 255);
        if (opacity < 3) {
            opacity = 1.1;
            transitionStage = 0;
        }
    }
    fill(255, 255, 255, opacity);
    rect(-100, -100, width + 200, height + 200);
} // Smoothly transition from scene to scene with fade

function backgroundScroll () {
    var collided = false;

    for (var i = 0; i < numberWalls; i ++) {
        drawWall(walls[i]);
    } // Drawing all of the walls

    if (walls[0].Y <= -4) {
        // Get rid of wall 0.  Move wall 1 through numberWalls up one.
        for (var index = 0; index < numberWalls - 1; index++) {
            walls[index] = walls[index + 1];
        }
        // Add new wall at end of array of walls (to replace wall[0] that removed)
        walls[numberWalls - 1] = createWall(walls[numberWalls - 2].Y + distBtwnWalls);
    }
    noStroke();
} // Simulated gameplay (walls moving up) but without the Player or rockets
function text3D (text_, size, xpos, ypos) {
    textAlign(CENTER, CENTER);
    textSize(size);
    fill(46, 43, 64, opacity);
    text(text_, xpos + 2, ypos);
    text(text_, xpos, ypos + 2);
    text(text_, xpos + 2, ypos + 2);

    fill(152, 137, 250, opacity);
    text(text_, xpos, ypos);

    //text(text_,xpos,ypos);
} // Gives text a "3D"/dropshadow look

function logo () {

    gotoScene = "menu";

    text("Disco Nugget Development\nAnd\nIsaac Emerald\nPresent...", 200, height/2);

} // Initial splashscreen/logo
function Button (X, Y, Width, Height, Text, s) {
    this.offsetY = 0;
    this.x = X;
    this.y = Y;
    this.width = Width;
    this.height = Height;
    this.bText = Text;
    this.pressed = false;
    this.hoverDim = 0;
    this.s = s;

    

} // Button class used throughout game button elements
Button.prototype.draw = function() {
    noStroke();
    textSize(20);
    fill(0, 0, 0, 100);
    rect(this.x, this.y + 3, this.width, this.height, 5);
    fill(87, 124, 235);

    if (mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height) {
        this.offsetY = constrain(this.offsetY += 0.4, 0, 3);
        this.pressed = mp;
        this.hoverDim = constrain(this.hoverDim += 10, 0, 40);
    } else {
        this.offsetY = constrain(this.offsetY -= 0.4, 0, 3);
        this.hoverDim = constrain(this.hoverDim -= 10, 0, 40);
    }

    rect(this.x, this.y + this.offsetY, this.width, this.height, 5);
    fill(0, 0, 0, this.hoverDim);
    rect(this.x, this.y + this.offsetY, this.width, this.height, 5);

    textSize(this.s);
    textAlign(CENTER, CENTER);
    fill(255, 255, 255);
    text(this.bText, this.x + this.width / 2, this.y + this.height / 2 - 1 + this.offsetY);
    textAlign(TOP, LEFT);
};

function CircleButton (X, Y, r, t, s) {
    this.offsetY = 0;
    this.x = X;
    this.y = Y;
    this.radius = r;
    this.bText = t;
    this.pressed = false;
    this.hoverDim = 0;
    this.s = s;

    
}
CircleButton.prototype.draw = function() {
    noStroke();
fill(87, 124, 235);
    if (dist(mouseX, mouseY, this.x, this.y) < this.radius) {
        this.offsetY = constrain(this.offsetY += 0.4, 0, 3);
        this.pressed = mp;
        this.hoverDim = constrain(this.hoverDim += 10, 0, 40);
        if (mp) {
            var localSound = getSound("rpg/metal-clink");
            localSound.audio.volume = soundVolume;
            playSound(localSound);
        }
    } else {
        this.offsetY = constrain(this.offsetY -= 0.4, 0, 3);
        this.hoverDim = constrain(this.hoverDim -= 10, 0, 40);
    }
arc(this.x, this.y + this.offsetY, this.radius * 2, this.radius * 2, 90 + buttonTilt, 270 + buttonTilt);
fill(87 + 10, 124 + 10, 235 + 10);
arc(this.x, this.y + this.offsetY, this.radius * 2, this.radius * 2, 270 + buttonTilt, 450 + buttonTilt);
    fill(0, 0, 0, this.hoverDim);
    ellipse(this.x, this.y + this.offsetY, this.radius * 2, this.radius * 2);

    textSize(this.s);
    textAlign(CENTER, CENTER);
    fill(255, 255, 255);
    text(this.bText, this.x, this.y - 1 + this.offsetY);
    textAlign(TOP, LEFT);
    noStroke();
};
var playButton = CircleButton.new(200, 350, 70, "Play", 36); // Creating all the buttons used throughout the game
var optionsButton = CircleButton.new(120, 460, 50, "Options", 20);
var storeButton = CircleButton.new(300 - 20, 460, 50, "Store", 20);
var mainMenuButton = CircleButton.new(200, 450, 50, "Menu", 25);

var drawMenuButtons = true;

function menu () {
    backgroundScroll();

    textAlign(CENTER, CENTER);
    textSize(62);
    fill(0, 0, 0, 70);
    text("D R O P", 205, 134 - 30);
    fill(240, 240, 240);
    text("D R O P", 200, 134 - 30);
    ellipse(229, 136 - 30, 54, 54);
    textSize(87.4);
    fill(0, 0, 0, 70);
    text("B A L L", 205, 202 - 30);
    fill(240, 240, 240);
    text("B A L L", 200, 202 - 30);

    playButton.draw();
    optionsButton.draw();
    storeButton.draw();
    if (playButton.pressed) {
        scrollSpeed = 1;
         Player = {
            x: 200,
            y: 200,
            w: 30,
            h: 30,
            health: 360,
            rotation: 0,
            isAlive: true,
            speed: 1.04,
            gravity: 4
        };
        gotoScene = "game";
        beginGameTime = upTime / 100000000; // This is the aproximate time the game began from program start
    }
    if (optionsButton.pressed) {
        gotoScene = "options";
    }
    if (storeButton.pressed) {
        gotoScene = "store";
    }
} // Main menu

function optionsScreen () {
    // Add - An option for adjusting the variable "soundVolume"
    // Add - An option to disable particles (?)
}

/* Store */

function StoreItem (y, title) {
    this.y = y;
    this.title = title;
    this.strokeAlpha = 0;
    this.init = false;
    this.buyButton = null;
    StoreItem.prototype.draw = function() {
        if (!this.init) {
            this.buyButton = Button.new(width - 120, this.y + 20, 70, 30, "$15", 14);
            this.init = true;
        }
        fill(165, 183, 237, 100);
        stroke(255, 255, 255, this.strokeAlpha);
        strokeWeight(4);
        
        if (mouseX > 30 && mouseX < width - 30 && mouseY > this.y && mouseY < this.y + 70) {
            this.strokeAlpha += 20;
        } else {
            this.strokeAlpha /= 1.05;
        }
        this.strokeAlpha = constrain(this.strokeAlpha, 5, 155);
        
        rect(30, this.y, 340, 70, 10);
        noStroke();
        
        fill(255, 255, 255, 200);
        ellipse(65, this.y + 35, 50, 50);
        
        fill(255);
        textAlign(LEFT, CENTER);
        text(this.title, 100, this.y + 35);
        
        this.buyButton.draw();
    };
}

var items = [];
var storeInit = true;
var arrowHoverAlpha = 55;
var arrowAnimationX = 0;
function store () {
    back_ground();
    if (storeInit) {
        // Initialize the store items
        for (var i = 0; i < 10; i ++) {
            items.push(StoreItem.new((i * 80) + 70, "Item " + i));
        }
        storeInit = false;
    }
    
    // Top Bar
    fill(87, 124, 235, 100);
    rect(0, 0, width, 52);
    fill(87, 124, 235);
    rect(0, 0, width, 50);
    
    // Place holder for coins count
    textAlign(RIGHT, CENTER);
    fill(245, 212, 49);
    ellipse(width - 20, 25, 20, 20);
    text("142", width - 40, 23);
    
    // Screen title
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(25);
    text("Shop", 200, 23);
    textSize(16);

    // Drawing store items
    for (var i = 0; i < 10; i ++) {
        items[i].draw();
    }
    
    // Arrow button
    stroke(200 + arrowHoverAlpha);
    strokeWeight(4);
    if (mouseX < 50 && mouseY < 50) {
        arrowHoverAlpha -= 5;
        arrowAnimationX += 0.5;
        if (mp) {
            gotoScene = "menu";
        }
    } else {
        arrowHoverAlpha += 5;
        arrowAnimationX -= 0.5;
    }
    arrowAnimationX = constrain(arrowAnimationX, 0, 6);
    arrowHoverAlpha = constrain(arrowHoverAlpha, 0, 55);
    pushMatrix();
    translate(-arrowAnimationX, 0);
    line(20, 25, 40, 25);
    line(20, 25, 30, 16);
    line(20, 25, 30, 25+9);
    popMatrix();
    
}

/* Player */

function player () {
    pushMatrix();
    translate(Player.x, Player.y);
    rotate(Player.rotation);
    fill(204, 204, 204);
    ellipse(0, 0, Player.w, Player.h); // Background
    fill(255, 255, 255);
    for (var i = 0; i < 360; i += 60) {
        arc(0, 0, Player.w, Player.h, i, i + 30); // Spindles
    }
    ellipse(0, 0, Player.w / 3, Player.h / 3); // Tire
    noFill();
    strokeWeight(3);
    stroke(255, 255, 255, 150);
    ellipse(0, 0, Player.w, Player.h);
    popMatrix();
}

function wallCollision (wallData, X) {
    var collided = false;
    for (var index = 0; index < wallData.numberOfLines; index++) {
        if ((X > wallData.startx[index] - 9) && (X < wallData.endx[index] + 9)) {
            collided = true;
        }
    }
    return (collided);
} // Used inside of game(); to determine whether or not the player is colliding with the walls

/* Input */

var lastKey = null;
var canControl = true;
var keys = []; // Player rotation
mousePressed = function () {
    mp = true;
};
keyPressed = function () {
    keys[keyCode] = true;
};
keyReleased = function () {
    keys[keyCode] = false;
};
var keyController = function () {
    if (keyIsPressed) {
        canControl = true;
    } else {
        // Decelerate
        canControl = false;
        if (lastKey === "left") {
            Player.x -= Player.speed;
            Player.rotation -= Player.speed * 3.14;
        }
        if (lastKey === "right") {
            Player.x += Player.speed;
            Player.rotation += Player.speed * 3.14;
        }
    }

    if (canControl) {
        // Add speed if either of the movement keys are pressed
        if (keys[RIGHT] || keys[LEFT] || keys[65] || keys[68]) {
            Player.speed += 1.08;
            if (Player.speed > 5) {
                // Max speed of 5
                Player.speed = 5;
            }
        }
        // Normal movement
        if (keys[LEFT] || keys[65]) {
            Player.x -= Player.speed;
            Player.rotation -= Player.speed * 3.14;
            lastKey = "left";
        } else if (keys[RIGHT] || keys[68]) {
            Player.x += Player.speed;
            Player.rotation += Player.speed * 3.14;
            lastKey = "right";
        }
    } else {
        // If the movement keys are released, slow down the movement, but don't instantly stop it
        Player.speed /= 1.06;
    }
};

/* Particle System */

angleMode = "radians";

var Particle = function(position) {
    this.acceleration = PVector.new(0, 0);
    this.velocity = PVector.new(random(-1, 1), random(1, 2));
    this.position = position.get();
    this.timeToLive = 50;
    this.mass = random(5, 15);

    Particle.prototype.run = function() {
        this.update();
        this.display();
    };
    Particle.prototype.applyForce = function(force) {
        var f = force.get();
        f.div(this.mass);
        this.acceleration.add(f);
    };
    Particle.prototype.update = function() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.timeToLive -= 2.0;
    };
    Particle.prototype.display = function() {
        noStroke();
        fill(150, 150, 150, this.timeToLive);
        ellipse(this.position.x, this.position.y, this.mass, this.mass);
    };
    Particle.prototype.isDead = function(){
        return this.timeToLive < 0;
    };
};
var ParticleSystem = function(position) {
    this.origin = position.get();
    this.particles = [];
    
    ParticleSystem.prototype.addParticle = function() {
        this.particles.push(Particle.new(this.origin));
    };
    ParticleSystem.prototype.applyForce = function(f){
        for(var i = 0; i < this.particles.length; i++){
            this.particles[i].applyForce(f);
        }
    };
    ParticleSystem.prototype.run = function(){
        for (var i = this.particles.length-1; i >= 0; i--) {
            var p = this.particles[i];
            p.run();
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    };
};

var rocketTrails = [];

var particleSystem = ParticleSystem.new(PVector.new(175, height/2));
var wind = PVector.new(0, 0.1);

angleMode = "degrees";

/* Rockets */

var rockets = [];
var xPos = Player.x; // X axis of where the explosion happens
var yPos = Player.y; // Y axis of where the explosion happens
var Rocket = function (x, y) {
    this.x = x;
    this.y = y;
    this.exploded = false;
    this.endX = 0;
    this.endY = 0; // Last known coordinates of rocket (used to draw explosion)

    this.initializedRocketTrail = false;
    this.rocketTrailIndex = 0;

    Rocket.prototype.draw = function () {

        if (!this.initializedRocketTrail) {
            this.rocketTrailIndex = rocketTrails.length;

            rocketTrails[this.rocketTrailIndex] = ParticleSystem.new(PVector.new(this.x, this.y));
            this.initializedRocketTrail = true;
        }
        this.y -= scrollSpeed * 2;

        rocketTrails[this.rocketTrailIndex].addParticle();
        rocketTrails[this.rocketTrailIndex].run();

        rocketTrails[this.rocketTrailIndex].origin.y = this.y + 40;

        rocket(this.x + 1.5, this.y + 23, 0.25, 0.3);

        if (Player.x + Player.w > this.x && Player.x - Player.w/2 < this.x + 20 && Player.y > this.y && Player.y < this.y + 30) {
                var localSound = getSound("retro/boom2");
                localSound.audio.volume = soundVolume;
                playSound(localSound);
            if (!Player.shield) {
                Player.health -= 360 / 2;
            }
            this.exploded = true;
            this.endX = this.x;
            this.endY = this.y;
            screenshake.count = 7;
        }

        if (this.y >= height + 50 && this.y < height + 300) {
            fill(255, 0, 0, 100);
            ellipse(this.x, height - 40, 30, 30);
            fill(255);
            text("!", this.x, height - 40);
        }
    };
};

var explosion = function (x, y) {
    // Todo
};

/* Power-ups */

var powerUps = [];
var PowerUp = function (x, y) {

    this.x = x;
    this.y = y;
    this.diameter = 25;
    this.alive = true;
    this.type = round(random(0, 1));
    this.speedModifier = random(0, 0.3);

    PowerUp.prototype.draw = function () {
        this.y += oscillate(120, 2);
        this.x += 0.6 + this.speedModifier;
        pushMatrix();
        translate(this.x, this.y);
        noStroke();
        fill(255, 0, 0, 100);
        pushMatrix();
        translate(-32, -32);
        scale(0.2);
        beginShape();
        vertex(110,105);
        vertex(240,105);
        vertex(235,190);
        vertex(175,239);
        vertex(115,190);
        endShape(CLOSE);
        popMatrix();

        popMatrix();

        if (Player.x + Player.w > this.x && Player.x - Player.w/2 < this.x + 25 && Player.y > this.y && Player.y < this.y + 30) {
                var localSound = getSound("rpg/metal-chime");
                localSound.audio.volume = soundVolume;
                playSound(localSound);
            if(this.type === 1) {
                Player.health += 360 / 2;
            } else {
                Player.shield = true;
            }
            this.alive = false;
        }

        if (this.x >= width + 30) {
            this.alive = false;
        }

        if (this.type === 1) {
            // Health powerup
            pushMatrix();
            translate(this.x, this.y);
                fill(255);
                pushMatrix();
                // scale(1, 0.5);
                // scale(0.7);
                translate(-44.4, -20);
                noStroke();
                beginShape();
                vertex(50, 15);
                bezierVertex(50, -5, 75, 5, 50, 45);
                vertex(50, 15);
                bezierVertex(50, -5, 25, 5, 50, 45);
                endShape();
                popMatrix();
            popMatrix();
        } else {
            if (Player.shield) {
                // Change the powerup to health if the shield is already activated
                this.type = 1;
            }
            // Shield powerup
            fill(255);
            text("S", this.x + 4, this.y);
        }
    };
};

/* Gems */


/* HUD */

var round10 = function(n) {
    return (n + 5) / 10 * 10;
}; // Rounds input to the nearest integer 10 and returns that
var healthscore = 360;
var subtractionSpeed = 15;
var healthIcon = function() {

    if (Player.health < healthscore) {
        healthscore -= subtractionSpeed;
        if (healthscore <= 0) {
            healthscore = 0;
            subtractionSpeed = 1;
        }
    } if (Player.health > healthscore) {
        fill(255);
        textSize(40);
        healthscore += subtractionSpeed;
        if (healthscore >= 360) {
            healthscore = 360;
            Player.health = 360;
            subtractionSpeed = 1;
        }
        textSize(20);
    } if (healthscore === Player.health) {
        healthscore = Player.health;
    }

    strokeWeight(6);
    noFill();

    stroke(0, 0, 0, 50);
    arc(50 + 2, 50 + 2, 40, 40, 0, 360);
    stroke(107, 2, 2);
    arc(50, 50, 40, 40, 0, 360);
    stroke(255, 0, 0);

    arc(50, 50, 40, 40, 0, healthscore);
    textAlign(CENTER, CENTER);

    pushMatrix();
    scale(1, 0.5);
    translate(2, 84);
    noStroke();
    fill(0, 0, 0, 50);
    beginShape();
    vertex(50, 15);
    bezierVertex(50, -5, 75, 5, 50, 45);
    vertex(50, 15);
    bezierVertex(50, -5, 25, 5, 50, 45);
    endShape();

    pushMatrix();
    scale(1, 1.0);
    translate(-2, -2);
    noStroke();
    fill(255, 0, 0);
    beginShape();
    vertex(50, 15);
    bezierVertex(50, -5, 75, 5, 50, 45);
    vertex(50, 15);
    bezierVertex(50, -5, 25, 5, 50, 45);
    endShape();
    popMatrix();
    popMatrix();
};
var shieldOpacity = 1;
var hud = function() {
    healthIcon();
    fill(255);

    if (Player.shield) {
        shieldOpacity *= 1.1;
        if (shieldOpacity >= 255) {
            shieldOpacity = 255;
        }
        fill(255, 0, 0, shieldOpacity);
        pushMatrix();
        scale(0.3);
        translate(-9, 182);
        beginShape();
        vertex(110,105);
        vertex(240,105);
        vertex(235,190);
        vertex(175,239);
        vertex(115,190);
        endShape(CLOSE);
        popMatrix();
        fill(255, 255, 255, shieldOpacity);
        text(round(Player.shieldTime), 50, 100);
    } else {
        shieldOpacity /= 1.1;
        if (shieldOpacity <= 1.1) {
            shieldOpacity = 1.1;
        }
        fill(255, 0, 0, shieldOpacity);
        pushMatrix();
        scale(0.3);
        translate(-9, 182);
        beginShape();
        vertex(110, 105);
        vertex(240, 105);
        vertex(235, 190);
        vertex(175, 239);
        vertex(115, 190);
        endShape(CLOSE);
        popMatrix();
    }
    fill(255);
    textSize(25);
    text(score, width - 30, 30);
};
var gameOverOpacity = {
    // Values used for the fade in effect in the game over scene
    one: 0,
    two: 255,
    three: 255
};

/* Game */
function shieldEffect () {
    if (Player.shield) {
        noStroke();
        fill(255, 35, 35, shieldOpacity - 200);
        ellipse(Player.x, Player.y, 50, 50);

        Player.shieldTime -= 0.01;
        if (Player.shieldTime <= 0) {
            Player.shield = false;
            Player.shieldTime = 8;
        }
    }
}

function playerSideCollisions () {
    Player.x = constrain(Player.x, Player.w/2 + 3, width - Player.w/2 - 3);
    Player.y = constrain(Player.y, -100, height - Player.w/2 - 5);
    // Top collision
    if (Player.y <= 5) {
        Player.alive = false;
        Player.health -= 360;
        screenshake.count = 4;
            var localSound = getSound("rpg/hit-splat");
            localSound.audio.volume = soundVolume;
            playSound(localSound);
    }
}

var tickTimer = 0;

var collided;
function game () {
    tickTimer ++;

    if (Player.isAlive) {
        // Speed that the floor moves up
        subtractionSpeed = 15;

         if ((tickTimer % 50) === 0) {
             score += 1;
         }

        // Increase scrollspeed until it reaches a cap
        scrollSpeed += 0.0006;
        scrollSpeed = constrain(scrollSpeed, 0, 2.5);

        gameOverOpacity = {
            // Todo: move this to reset function, no need to keep resetting
            one: 0,
            two: 255,
            three: 255
        };

        Player.isAlive = Player.health > 0; // Ends the game when player dies

        collided = false;

        playerSideCollisions();

        noStroke();

        for (var i = 0; i < numberWalls; i++) {
            var w = walls[i];
            drawWall(w);
            if ((w.Y > Player.y + (Player.h / 2) - Player.gravity * 2) && (w.Y < Player.y + Player.h / 2 + 3)) {
                if (wallCollision(w, Player.x)) {
                    Player.y = w.Y - Player.h/2; // Move the player up
                    collided = true;
                }
            }
        } // Drawing all of the walls
        if (walls[0].Y <= -8) { // -8 to make it look smooth
            // Get rid of wall 0.  Move wall 1 through numberWalls up one.
            for (var index = 0; index < numberWalls - 1; index++) {
                walls[index] = walls[index + 1];
            }
            // Add new wall at end of array of walls (to replace wall[0] that removed)
            walls[numberWalls - 1] = createWall(walls[numberWalls - 2].Y + distBtwnWalls);
        }

        canControl = collided;
        if (collided === false) {
            if (Player.y < height) {
                Player.y += Player.gravity;
            }
        }
        noStroke();
        player();
        keyController();

        for (var i = 0; i < rockets.length; i++) {
            rockets[i].draw();
            if (rockets[i].y <= -400 || rockets[i].exploded) {
                if (rockets[i].exploded) {

                }
                rockets.splice(i, 1);
            }
        }
        for (var i = 0; i < powerUps.length; i++) {
            powerUps[i].draw();
            if (!powerUps[i].alive) {
                powerUps.splice(i, 1);
            }
        }

        shieldEffect();

        hud();

    } else {
        backgroundScroll();
        gameOverOpacity.one += 4;
        fill(0, 0, 0, gameOverOpacity.one);
        rect(0, 0, width, height);
        fill(255, 255, 255);
        textSize(40);
        text("Game Over", 200, 300);
        if (gameOverOpacity.one > 320) {
            textSize(22);
            text("You Scored " + score + (score > 1 || score === 0? " Points." : " Point."), 200, 351);
            noStroke();
            gameOverOpacity.two -= 2;
            fill(0, 0, 0, gameOverOpacity.two);
            rect(0, 338, width, 30);

            if (gameOverOpacity.one > 500) {
                mainMenuButton.draw();
                textAlign(CENTER, CENTER);
                gameOverOpacity.three -= 2;
                fill(0, 0, 0, gameOverOpacity.three);
                rect(0, 371, width, 322);
            }
        }

        if (mainMenuButton.pressed) {
            gotoScene = "menu";
            score = 0; // Resetting the score (TODO: Save score to scoreboard)
        }
    }
}

for (var yloc = 100; yloc < height + distBtwnWalls*2; yloc += distBtwnWalls) {
    walls[numberWalls++] = createWall(yloc);
} // Declaring the distance between different walls

/* Draw */

draw = function () {
    screenshaker();
    pushMatrix();
    back_ground();
    translate(screenshake.x, screenshake.y);
    var rocketLaunchProbability = round(random(0, 1000));
    var spawnPowerUpProbability = round(random(0, 1000));
    var spawnCoinProbability = round(random(0, 1000));
    if (rocketLaunchProbability <= 4 && rockets.length <= 4) {
        rockets.push(Rocket.new(random(0, width), random(800, 1200)));
    }
    if (spawnPowerUpProbability <= 5 && powerUps.length <= 0) {
        powerUps.push(PowerUp.new(-50, random(400, height - 100)));
    }

    switch (scene) {
        case "logo":
            logo();
            break;
        case "menu":
            menu();
            break;
        case "options":
            optionsScreen();
            break;
        case "store":
            store();
            break;
        case "game":
            game();
            break;
        case "pause":
            break;
        default:
            fill(255, 255, 255);
            textAlign(CENTER, CENTER);
            text("Unable to find scene \"" + (scene === ""? "____" : scene) + "\",\nPlease restart the program", width/2, height/2);
            break;
    }

    canControl = false;
    upTime += 0.05;
    mp = false;
    popMatrix();
    transition();
};
};
