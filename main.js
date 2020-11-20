// Started - 08/29/2019 (actually 07/08/2018, but I scrapped the old code)
// finished -

/**
TODO:
- fix controller bugs
- add explosion (done)
- fine tune gameplay/GUIs
- add powerups
- fix replay bug
- add options screen
- add skins
- fix wall collisions
- pause screen



*/

/* Setup */
smooth(); // for Firefox users
textFont(createFont("Tahoma Bold"), 20);// sadly not availabe on all operating systems
textAlign(CENTER, CENTER);
frameRate(60);

var bg = function(){
        pushMatrix();
    translate(0, 80);
    background(1, 30, 97);
    fill(255, 255, 255);
    ellipse(200 + 10, 200, 100, 100);
    fill(1, 30, 97);
    ellipse(211 + 13, 200, 100, 100);
    fill(255, 255, 255, 200);
    ellipse(285, 200, 5, 5);
    ellipse(254, 99, 5, 5);
    ellipse(153, 123, 5, 5);
    ellipse(92, 220, 5, 5);
    ellipse(132, 303, 3, 3);
    ellipse(271, 298, 3, 3);
    pushMatrix();
    translate(1, 0);
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
    
    for(var i = 0; i < 50; i ++)
    {
        fill(255, 255, 255, 1.5);
        ellipse(200, 200, i * 15, i * 15);
    }
    
    fill(255, 255, 255, 10);
    rect(0, 593, 400, 10);
    rect(0, 584, 400, 16);
    rect(0, 575, 400, 26);
    
    fill(0, 0, 0, 10);
    rect(0, 0, 400, 600);
};

var mp = false; // mouse pressed
var scene = "logo";// logo, menu, game, pause

var score = 1;

var pauseGame = false;
var playGame = false;
var playSounds = true;
var upTime = 0;
var beginGameTime = 0;// the millis() that the game began

var Player = {
    x: 200,
    y: 200,
    w: 20,
    h: this.w,
    health: 360,// 360 = max health
    rotation: 0,
    isAlive: true,
    speed: 1.04,
    gravity: 4,
    shield: false,
    shieldTime: 8
}; //the properties of the player

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
    // oscillation adapted from Dan Shiffman, natureofcode.com
    angleMode = "radians";
    // period: length of one period in frames
    // amplitude in pixels
    var x = amplitude * sin(TWO_PI * frameCount / period);
    angleMode = "degrees";
    return x;
}

/* Walls */
var distBtwnWalls = 100;
var scrollSpeed = 1; // Controlling the amount it scrolls
var walls = []; // new wall objects are pushed to this array and then drawn from it using a for()
var numberWalls = 0; // total number of walls that currently exist
function createWall (Y) {
    var wall = {};
    // picks how many holes there are in each wall
    var oneHole = round(random(0, 1.4));
    // If two holes
    if (oneHole === 0) {
        // Randomize the two hole centers and sizes
        var hole0Center = random(0, 200);
        var hole0Width = random(50, 100);
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
        var holeWidth = random(50, 100);

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

var opacity = 1.1; // 1.1

function transition (nextScene) {

} // smoothly transition from scene to scene with fade



var backgroundScroll = function() {
    var collided = false;
    
    for (var wallindex = 0; wallindex < numberWalls; wallindex++) {
        drawWall(walls[wallindex]);
    } // drawing all of the walls

    if (walls[0].Y <= -4) {
        // Get rid of wall 0.  Move wall 1 through numberWalls up one.
        for (var index = 0; index < numberWalls - 1; index++) {
            walls[index] = walls[index + 1];
        }
        // Add new wall at end of array of walls (to replace wall[0] that removed)
        walls[numberWalls - 1] = createWall(walls[numberWalls - 2].Y + distBtwnWalls);
    }
    noStroke();
};// simulated gameplay (walls moving up) but without the Player or rockets
var text3D = function(text_, size, xpos, ypos) {
    textAlign(CENTER, CENTER);
    textSize(size);
    fill(46, 43, 64, opacity);
    text(text_, xpos + 2, ypos);
    text(text_, xpos, ypos + 2);
    text(text_, xpos + 2, ypos + 2);

    fill(152, 137, 250, opacity);
    text(text_, xpos, ypos);

    //text(text_,xpos,ypos);
};// gives text a "3D"/dropshadow look

var logo = function() {

    scene = "menu";

    text("Disco Nugget Development\nAnd\nIsaac Emerald\nPresent...", 200, height/2);

};// initial splashscreen/logo
var Button = function(X, Y, Width, Height, Text, s) {

    this.offsetY = 0;
    this.x = X;
    this.y = Y;
    this.width = Width;
    this.height = Height;
    this.bText = Text;
    this.pressed = false;
    this.hoverDim = 0;
    this.s = s;

    Button.prototype.draw = function() {

        noStroke();
        textSize(20);
        fill(0, 0, 0, 100);
        rect(this.x, this.y + 3, this.width, this.height, 5);
        fill(87, 124, 235);
        if (mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height) {
            // fill(255, 50, 50);
            this.offsetY = constrain(this.offsetY += 0.4, 0, 3);
            if (mp) {
                this.pressed = true;
            } else {
                this.pressed = false;
            }
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

};// button class used throughout game button elements
var switchBtnColor = color(152, 137, 250);// default highlight color for all switch buttons
var Switch = function(X, Y, defaultState) {
    this.x = X;
    this.y = Y;
    this.bx = X;
    this.by = Y;
    this.active = false;
    this.slider = 0;
    this.color_ = switchBtnColor;
    this.sliderColor = switchBtnColor;
    this.done = false;

    this.initialCall = true; // only true on the first call
    this.defaultState = defaultState; // active or not by default

    var sliderColor = switchBtnColor;
    Switch.prototype.draw = function() {
        if (this.initialCall) {
           if (this.defaultState === true) {
                this.active = true;
                this.done = true;
                this.slider = 20;
           }
           this.initialCall = false; // never call this code again
        }
        fill(255);
        stroke(switchBtnColor);
        strokeWeight(5);
        if (mouseX > this.x - 2 && mouseX < this.x + 42 && mouseY > this.y - 2 && mouseY < this.y + 21) {
            if (mp && this.active === false && this.done === false) {
                this.active = true; //turn it on
                this.done = true;
            } else if(mp && this.done){
                this.done = false;
                this.active = false;//turn it off
            }
        }
        if (this.active && this.done) {
            this.active = true;
            this.color_ = color(255);
            this.sliderColor = color(255);
            this.slider += 2;
            if(this.slider > 20){
                this.slider = 20;
                this.done = true;
            }
            fill(switchBtnColor);
        } else {
            this.sliderColor = sliderColor;
            this.slider -= 2;
            if(this.slider < 0){
                this.slider = 0;
                this.done = false;
            }
        } //off
        rect(this.x, this.y, 40, 19, 10);

        pushMatrix();
        translate(this.x + 10, this.y + 10);
        noStroke();
        fill(this.sliderColor);
        ellipse(this.slider, 0, 10, 10);
        popMatrix();
        return this.active;
    };
};// switch button class used in options modal

var soundSwitch = new Switch(60, 110, true); // creating switches used in options modal
var powerUpsSwitch = new Switch(60, 150, true);
var hardcoreModeSwitch = new Switch(60, 190, false);

var playButton = new Button(100, 350, 200, 100, "PLAY", 50); // creating all the buttons used throughout the game
var optionsButton = new Button(100, 460, 200, 40, "OPTIONS", 20);
var resumeButton = new Button(150, 230, 100, 30, "Resume");
var mainMenuButton = new Button(150, 375, 100, 30, "Menu");
var exitOptionsModal = new Button(247, 50, 100, 30, "CLOSE", 20);

var drawMenuButtons = false;
var options = false;

function menuButtons () {
    playButton.draw();
    optionsButton.draw();
    if (playButton.pressed && !options) {
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
        scene = "game";
        beginGameTime = upTime / 100000000; // this is the aproximate time the game began from program start
    }
    if (optionsButton.pressed) {
        options = true;
        exitOptionsModal.pressed = false;
    }

} // draws and adds functionality to most of the buttons used in the main menu

var optionsOpacity = 1.1;
function optionsModal () {
    optionsOpacity = constrain(optionsOpacity, 2 , 255);

    pushMatrix();
    scale(optionsOpacity/255);
    noStroke();
    fill(255, 255, 255, optionsOpacity);
    rect(40, 40, 320, 520, 10);

    fill(107, 87, 255);
    rect(40, 40, 320, 50, 10);
    rect(40, 50, 320, 40);

    popMatrix();

    if (options) {
        pushMatrix();
        // fade menu in and scale up
        scale(optionsOpacity/255);

        optionsOpacity *= 1.2;
        fill(255, 255, 255);

        text("Options", 60, 70);

        soundSwitch.draw();
        fill(91, 72, 240);
        text("Sound", 110, 126);

        powerUpsSwitch.draw();
        fill(91, 72, 240);
        text("Power Ups", 110, 167);

        hardcoreModeSwitch.draw();
        fill(91, 72, 240);
        text("Hardcore Mode", 110, 207);

        exitOptionsModal.draw();
        popMatrix();

        if (exitOptionsModal.pressed) {
            options = false;
        }
    } else {
        // fade and scale out modal animation
        optionsOpacity /= 1.2;
    }
}

function menu () {
    backgroundScroll();
    
    textAlign(CENTER, CENTER);
    textSize(70);
    fill(0, 0, 0, 70);
    text("DROP", 205, 134 - 30);
    fill(255, 255, 255);
    text("DROP", 200, 134 - 30);
    ellipse(229, 136 - 30, 54, 54);
    textSize(81.5);
    fill(0, 0, 0, 70);
    text("BALL", 205, 202 - 30);
    fill(255, 255, 255);
    text("BALL", 200, 202 - 30);

    menuButtons();
    textAlign(CENTER, CENTER);
    text3D("Don't get squished on the ceiling,\navoid getting blown up by rockets.", 18, 200, height - 50);
    textAlign(CORNER);

    optionsModal();
} // 3D "Drop Ball" text and options modal | main menu

/* Player */

function player () {
    pushMatrix();
    translate(Player.x, Player.y);
    rotate(Player.rotation);
    fill(204, 204, 204);
    ellipse(0, 0, Player.w, Player.h); //background
    fill(255, 255, 255);
    for (var i = 0; i < 360; i += 60) {
        arc(0, 0, Player.w, Player.h, i, i + 30); //spindles
    }
    ellipse(0, 0, Player.w / 3, Player.h / 3); //tire
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
} // used (inside of game();) to determine whether or not the player is colliding with the walls

/* Input */

var lastKey = null;
var canControl = true;
var keys = []; //Player rotation
function mousePressed () {
    mp = true;
}
function keyPressed () {
    keys[keyCode] = true;
}
function keyReleased () {
    keys[keyCode] = false;
}
function keyController () {
    if (keyIsPressed) {
        canControl = true;
    } else {
        // decelerate
        canControl = false;
        if (lastKey === "left") {
            Player.x -= Player.speed;
            Player.rotation -= Player.speed * 5;
        }
        if (lastKey === "right") {
            Player.x += Player.speed;
            Player.rotation += Player.speed * 5;
        }
    }

    if (canControl) {
        // add speed if either of the movement keys are pressed
        if (keys[RIGHT] || keys[LEFT]) {
            Player.speed += 1.08;
            if (Player.speed > 5) {
                // max speed of 5
                Player.speed = 5;
            }
        }
        // normal movement
        if (keys[LEFT]) {
            Player.x -= Player.speed;
            Player.rotation -= Player.speed * 5;
            lastKey = "left";
        } else if (keys[RIGHT]) {
            Player.x += Player.speed;
            Player.rotation += Player.speed * 5;
            lastKey = "right";
        }
    } else {
        // if the movement keys are released, slow down the movement, but don't instantly stop it
        Player.speed /= 1.06;
    }
}

/* Particle System */

angleMode = "radians";

var Particle = function(position) {

    this.acceleration = new PVector(0, 0);
    this.velocity = new PVector(random(-1, 1), random(1, 2));
    this.position = position.get();
    this.timeToLive = 100;
    this.mass = random(10, 23);



};
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

var ParticleSystem = function(position) {
    this.origin = position.get();
    this.particles = [];
};
ParticleSystem.prototype.addParticle = function() {
    this.particles.push(new Particle(this.origin));
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

var rocketTrails = [];

var particleSystem = new ParticleSystem(new PVector(175, height/2));
var wind = new PVector(0, 0.1);

angleMode = "degrees";

/* Rockets */

var rockets = [];
var xPlosionSize = 20;//the size of the death explosion
var xPos = Player.x;//where the explosion happens
var yPos = Player.y;//^
var xPlosionColor = 255;//color of explosion
var xPlosionTransparency = 255;//transpoerancy of the explosion
var Rocket = function (x, y) {
    this.x = x;
    this.y = y;
    this.exploded = false;
    this.endX = 0;
    this.endY = 0; // last known coordinates of rocket (used to draw explosion)

    this.initializedRocketTrail = false;
    this.rocketTrailIndex = 0;

    Rocket.prototype.draw = function () {

        if (!this.initializedRocketTrail) {
            this.rocketTrailIndex = rocketTrails.length;

            rocketTrails[this.rocketTrailIndex] = new ParticleSystem(new PVector(this.x, this.y));
            this.initializedRocketTrail = true;
        }
        this.y -= scrollSpeed * 2;

        // rocketTrails[this.rocketTrailIndex].applyForce(wind);
        rocketTrails[this.rocketTrailIndex].addParticle();
        rocketTrails[this.rocketTrailIndex].run();

        rocketTrails[this.rocketTrailIndex].origin.y = this.y + 40;

        noStroke();
        fill(222, 130, 0, 150);
        triangle(this.x + random(0,4), this.y + 60 + random(0,4), this.x + 4 + random(0,4), this.y + 40, this.x - 10 + random(0,4), this.y + 30);
        fill(222, 111, 0, 150);
        triangle(this.x - 3 + random(0,4), this.y + 55 + random(0,4), this.x + random(0,4), this.y + 40, this.x - 10 + random(0,4), this.y + 30);
        fill(222, 107, 0, 150);
        triangle(this.x + random(0,4), this.y + 60 + random(0,4), this.x + 4 + random(0,4), this.y + 40, this.x - 10 + random(0,4), this.y + 30);

        noFill();
        stroke(255, 0, 0);
        pushMatrix();
        translate(-60 + this.x, -49 + this.y);
        scale(0.3);

        noStroke();
        fill(255, 0, 0);
        triangle(200, 290, 240, 290, 200, 160);
        triangle(200, 290, 160, 290, 200, 160);
        pushMatrix();
        translate(400, 400);
        rotate(180);
        beginShape();
        curveVertex(200, 370); // top
        curveVertex(180,100);
        curveVertex(180,220);
        curveVertex(218,220);
        curveVertex(218,100);
        endShape(CLOSE);
        popMatrix();
        fill(255);
        rect(180, 200, 44.5, 104);
        fill(255, 0, 0);
        rect(200, 240, 5, 50);
        popMatrix();

        if (Player.x + Player.w > this.x && Player.x - Player.w/2 < this.x + 20 && Player.y > this.y && Player.y < this.y + 30) {
            if (playSounds) {
                playSound(getSound("retro/boom2"));
            }
            if (!Player.shield) {
                Player.health -= 360 / 2;
            }
            this.exploded = true;
            xPlosionSize = 20;//the size of the death explosion
            xPlosionColor = 255;//color of explosion
            xPlosionTransparency = 255;//transpoerancy of the explosion
            this.endX = this.x;
            this.endY = this.y;
            screenshake.count = 7;
        }

        if (this.y >= height + 50) {
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
            if (playSounds) {
                playSound(getSound("rpg/battle-spell"));
            }
            if(this.type === 1) {
                Player.health += 360/2;
                // println(Player.health);
            } else {
                Player.shield = true;
            }
            this.alive = false;
        }

        if (this.x >= width + 30) {
            this.alive = false;
        }

        if (this.type === 1) {
            // health powerup
            pushMatrix();
            translate(this.x, this.y);
                fill(255);
                pushMatrix();
                scale(1, 0.5);
                scale(0.7);
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
                // change the powerup to health if the shield is already activated
                this.type = 1;
            }
            // shield powerup
            fill(255);
            text("S", this.x + 4, this.y);
        }
    };
};

/* Gems */


/* HUD */

var round10 = function(n) {
    return (n + 5) / 10 * 10;
};// rounds input to the nearest integer 10 and returns that
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
    stroke(255, 0, 0, 50);
    noFill();

    arc(50, 50, 40, 40, 0, 360);
    stroke(255, 0, 0);

    arc(50, 50, 40, 40, 0, healthscore);
    textAlign(CENTER, CENTER);

    pushMatrix();
    scale(1, 0.5);
    translate(0, 77);
    noStroke();
    fill(255, 0, 0);
    beginShape();
    vertex(50, 15);
    bezierVertex(50, -5, 75, 5, 50, 45);
    vertex(50, 15);
    bezierVertex(50, -5, 25, 5, 50, 45);
    endShape();
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
        vertex(110,105);
        vertex(240,105);
        vertex(235,190);
        vertex(175,239);
        vertex(115,190);
        endShape(CLOSE);
        popMatrix();
    }
    fill(255);
    text(score, width - 30, 30);
};
var gameOverOpacity = {
    // values used for the fade in effect in the game over scene
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
    // top collision
    if (Player.y <= 5) {
        Player.alive = false;
        Player.health -= 360;
        screenshake.count = 4;
        if (playSounds) {
            playSound(getSound("rpg/hit-splat"));
        }
    }
}

var collided;
function game () {

    if (Player.isAlive) {
        // Speed that the floor moves up
        subtractionSpeed = 15;

        score += 0.0006;

        // Increase scrollspeed until it reaches a cap
        scrollSpeed += 0.0006;
        scrollSpeed = constrain(scrollSpeed, 0, 2.5);

        gameOverOpacity = {
            // Todo: move this to reset function, no need to keep resetting
            one: 0,
            two: 255,
            three: 255
        };

        score = round(upTime / 5); // - pause time

        Player.isAlive = Player.health > 0;// ends the game when player dies

        collided = false;
        
        playerSideCollisions();
        
        noStroke();

        for (var wallindex = 0; wallindex < numberWalls; wallindex++) {
            drawWall(walls[wallindex]);
            if ((walls[wallindex].Y > Player.y + (Player.h / 2) - Player.gravity * 2) && (walls[wallindex].Y < Player.y + Player.h / 2 + 3)) {
                if (wallCollision(walls[wallindex], Player.x)) {
                    Player.y -= scrollSpeed; //move the player up
                    collided = true;
                }
            }
        } // drawing all of the walls
        if (walls[0].Y <= -8) { //-8 to make it look smooth
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
                    // explosionInfo = {
                    //     exploding: true,
                    //     x: rockets[i].endX,
                    //     y: rockets[i].endY
                    // };
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

    }
    else {
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
            scene = "menu";
        }
    }
}

for (var yloc = 100; yloc < height + distBtwnWalls*2; yloc += distBtwnWalls) {
    walls[numberWalls++] = createWall(yloc);
} // declaring the distance between different walls

/* Draw */

function draw () {
    screenshaker();
    pushMatrix();
    bg();
    translate(screenshake.x, screenshake.y);
    var rocketLaunchProbability = round(random(0, 1000));
    var spawnPowerUpProbability = round(random(0, 1000));
    var spawnCoinProbability = round(random(0, 1000));
    if (rocketLaunchProbability <= 4 && rockets.length <= 4) {
        rockets.push(new Rocket(random(0, width), height + 200 + random(0, 200)));
    }
    if (spawnPowerUpProbability <= 5 && powerUps.length <= 0) {
        powerUps.push(new PowerUp(-50, random(200, height - 100)));
    }

    switch (scene) {
        case "logo":
            logo();
            break;
        case "menu":
            menu();
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
    
}

