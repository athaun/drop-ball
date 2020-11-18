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
textFont(createFont("cursive"), 20);// sadly not availabe on all operating systems
textAlign(CENTER, CENTER);
frameRate(60);

var mp = false; // mouse pressed
var scene = "logo";// logo, menu, game, pause

var score = 1;

var pauseGame = false;
var playGame = false;
var playSounds = true;
var upTime = millis();// used to increase score??? (find out)
var beginGameTime = 0;// the millis() that the game began

var character = {
    x: 200,
    y: 200,
    w: 16,
    h: this.w,
    health: 360,// 360 = max health
    rotation: 0,
    isAlive: true,
    speed: 1.04,
    gravity: 4,
    shield: false,
    shieldTime: 7
}; //the properties of the player

// Used in the powerups for the wavy motion
var oscillate = function (period, amplitude) {
    // oscillation adapted from Dan Shiffman, natureofcode.com
    angleMode = "radians";
    // period: length of one period in frames
    // amplitude in pixels
    var x = amplitude * sin(TWO_PI * frameCount / period);
    angleMode = "degrees";
    return x;
};

/* Walls */
var distBtwnWalls = 100;
var scrollSpeed = 1; // Controlling the amount it scrolls
var walls = []; // new wall objects are pushed to this array and then drawn from it using a for()
var numberWalls = 0;// total number of walls that currently exist
var createWall = function(Y) {
    var wall = {};
    // picks how many holes there are in each wall (slight bias towards single holed walls)
    var oneHole = round(random(0, 3));
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
        // 0<-line0->hole0<-line1->hole1<-line2->400
        wall.startx[0] = -155;

        wall.endx[0] = hole0Center - hole0Width / 2;
        wall.startx[1] = hole0Center + hole0Width / 2;
        wall.endx[1] = hole1Center - hole1Width / 2;
        wall.startx[2] = hole1Center + hole1Width / 2;
        wall.endx[2] = 400;
    } else {
        var holeCenter = random(0, 400);
        var holeWidth = random(50, 100);

        // 0<-line0->hole<-line1->400
        wall.numberOfLines = 2;
        wall.startx = [];
        wall.endx = [];
        wall.startx[0] = 0;
        wall.endx[0] = holeCenter - holeWidth / 2;
        wall.startx[1] = holeCenter + holeWidth / 2;
        wall.endx[1] = 400;
    }
    // Y is same for any count of holes
    wall.Y = Y;
    return (wall);
}; // creating the walls
var drawWall = function(wallData) {

    stroke(255, 255, 255);
    noStroke();
    fill(255, 255, 255);
    for (var index = 0; index < wallData.numberOfLines; index++) {
        rect(wallData.startx[index], wallData.Y, wallData.endx[index] - wallData.startx[index], 3, 5);
    }

    wallData.Y -= scrollSpeed;
}; // Actaully DRAWING the walls

/* GUI */

var screenshake = {
    x: 0,
    y: 0,
    count: 0
};
var opacity = 1.1; // 1.1
var initialOpacity = 330;
var textYPos = 1.1;// for the "Drop Ball" text animation in the main menu
var gotoMenu = false;
var transitionOpacity = 0;
var transitionStage = 1;
var transitionSpeed = 1.26;
var drawMenuButtons = false;
var options = false;
var optionsOpacity = 1.1;

var screenshaker = function () {
    screenshake.x = random(-10, 10);
    screenshake.y = random(-10, 10);
    
    screenshake.count -= 0.1;
    
    if (screenshake.count < 1) {
        screenshake.x = 0;
        screenshake.y = 0;
    }
};

var back_ground = function() {
    var collided = false;
    background(77, 67, 140);
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
};// simulated gameplay (walls moving up) but without the character or rockets
var text3D = function(text_, size, xpos, ypos) {
    textAlign(CENTER, CENTER);
    textFont(createFont("cursive"), size);
    fill(46, 43, 64, opacity);
    text(text_, xpos + 2, ypos);
    text(text_, xpos, ypos + 2);
    text(text_, xpos + 2, ypos + 2);

    fill(152, 137, 250, opacity);
    text(text_, xpos, ypos);

    //text(text_,xpos,ypos);
};// gives text a "3D"/dropshadow look

var logoScroll = height + 30;

var logo = function() {
    
    back_ground();

    initialOpacity -= 0.5;
    fill(0, 0, 0, initialOpacity);
    rect(0, 0, width, height);
    fill(77, 67, 140, initialOpacity);

    if (initialOpacity <= 3) {
        opacity *= 1.06;
        text3D("Drop\nBall", 90, 200, 200);
        if (opacity > 500) {
            scene = "menu";
        }
    } else {
        logoScroll -= scrollSpeed;
        text("Disco Nugget Development\nPresents...", 200, logoScroll);
    }
};// initial splashscreen/logo
var Button = function(X, Y, Width, Height, Text) {

    this.offsetY = 0;
    this.x = X;
    this.y = Y;
    this.width = Width;
    this.height = Height;
    this.bText = Text;
    this.pressed = false;
    this.hoverDim = 0;

    Button.prototype.draw = function() {

        noStroke();
        textSize(20);
        fill(46, 43, 64);
        rect(this.x, this.y + 3, this.width, this.height, 5);
        fill(152, 137, 250);
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

        fill(255, 255, 255);
        textAlign(CENTER, CENTER);
        text(this.bText, this.x + this.width / 2, this.y + this.height / 2 - 1 + this.offsetY);
        textAlign(TOP, LEFT);
    };

};// button class used throughout game button elements
var switchBtnColor = color(130, 0, 0);// default highlight color for all switch buttons
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
        fill((5, 5, 5));
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
            this.color_ = color(5, 5, 5);
            this.sliderColor = color(5, 5, 5);
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

var soundSwitch = new Switch(30, 100, true); // creating switches used in options modal
var powerUpsSwitch = new Switch(30, 140, true); 
var hardcoreModeSwitch = new Switch(30, 180, false); 

var playButton = new Button(95, 230, 100, 30, "Play!"); // creating all the buttons used throughout the game
var optionsButton = new Button(205, 230, 100, 30, "Options");
var resumeButton = new Button(150, 230, 100, 30, "Resume");
var mainMenuButton = new Button(150, 375, 100, 30, "Menu");
var exitOptionsModal = new Button(280, 25, 100, 30, "Close");

var transition = function(nextScene) {
    fill(0, 0, 0, transitionOpacity);
    rect(0, 0, width, height);
    // println("Switch Scene " + nextScene + " | current scene " + scene);
    switch (transitionStage) {
        case 1:
            transitionOpacity += 3;
            if (transitionOpacity >= 40) {
                transitionStage = 2;
            }
            break;
        case 2:
            transitionOpacity *= transitionSpeed;
            if (transitionOpacity >= 255) {
                transitionStage = 3;
                scene = nextScene;
                transitionOpacity = 255;
            }
            break;
        case 3:
            transitionOpacity /= transitionSpeed - 0.22;

            if (transitionOpacity <= 7) {
                transitionStage = 4;
            }
            break;
        case 4:
            transitionOpacity--;
            if (transitionOpacity <= 0) {
                transitionOpacity = 0;
            }
            break;
        default:
            println("unable to transition to scene: " + nextScene);
            break;
    }
    // TODO: fine tune transitions
}; // smoothly transition from scene to scene with fade
var menuButtons = function() {
    playButton.draw();
    optionsButton.draw();
    if (playButton.pressed && !options) {
        scrollSpeed = 1;
         character = {
            x: 200,
            y: 200,
            w: 16,
            h: 16,
            health: 360,
            rotation: 0,
            isAlive: true,
            speed: 1.04,
            gravity: 4
        };
        transitionStage = 1;
        playGame = true;
        beginGameTime = upTime / 100000000; // this is the aproximate time the game began from program start
    }
    if (optionsButton.pressed) {
        options = true;
        exitOptionsModal.pressed = false;
    }

}; // draws and adds functionality to most of the buttons used in the main menu
var menu = function() {
    back_ground();
    textYPos *= 1.1;
    text3D("Drop\nBall", 90, 200, 201.1 - textYPos);
    if (textYPos > 80) {
        textYPos = 80;
        drawMenuButtons = true;
    }
    if (drawMenuButtons) {
        menuButtons();
        textAlign(CENTER, CENTER);
        text("Don't get squished on the ceiling,\navoid getting blown up by rockets.", 200, 300);
        textAlign(CORNER);
    }
    if (options) {
        if (optionsOpacity >= 255) {
            optionsOpacity = 255;
        }
        pushMatrix();
        // fade menu in and scale up
        scale(optionsOpacity/255);
        fill(5, 5, 5, optionsOpacity);
        rect(10, 10, 380, 580, 10);
        fill(128, 0, 0, optionsOpacity);
        rect(10, 10, 380, 60, 10);
        rect(10, 30, 380, 40);
        optionsOpacity *= 1.2;
        fill(235, 235, 235);
        
        text("Options", 32, 45);
        
        soundSwitch.draw();
        fill(179, 0, 3);
        text("Sound", 80, 117);
        
        powerUpsSwitch.draw();
        fill(179, 0, 3);
        text("Power Ups", 80, 158);
        
        hardcoreModeSwitch.draw();
        fill(179, 0, 3);
        text("Hardcore Mode", 80, 197);
        
        exitOptionsModal.draw();
        popMatrix();
        
        if (exitOptionsModal.pressed) {
            options = false;
        }
    } else {
        // fade and scale out modal animation
        pushMatrix();
        scale(optionsOpacity/255);
        fill(5, 5, 5, optionsOpacity);
        rect(10, 10, 380, 580, 10);
        fill(128, 0, 0, optionsOpacity);
        rect(10, 10, 380, 60, 10);
        rect(10, 30, 380, 40);
        optionsOpacity /= 1.2;
        if (optionsOpacity <= 2) {
            optionsOpacity = 2;
        }
        popMatrix();
        
    }
}; // 3D "Drop Ball" text and options modal | main menu
var pause = function() {
    back_ground();
    fill(255, 0, 0, 40);
    noStroke();
    rect(0, 200, width, 200);
    textAlign(CENTER, CENTER);
    fill(255, 222, 222);
    textSize(30);
    text("Game Paused", 200, 275);
    textSize(23);
    text("Mouse over to resume", 200, 310);
}; // pause screen TODO implement pause on mouseOut

/* Player */
var ball = function() {
    fill(0, 0, 0);
    ellipse(0, 0, character.w, character.h); //background
    fill(150, 150, 150);
    for (var i = 0; i < 360; i += 60) {
        arc(0, 0, character.w, character.h, i, i + 30); //spindles
    }
    ellipse(0, 0, character.w / 3, character.h / 3); //tire
    stroke(150, 150, 150);
    noFill();
    strokeWeight(3);
    stroke(92, 92, 92);
    ellipse(0, 0, character.w, character.h);
};// the character skin
var player = function() {
    // particles.push(new Particle(new PVector(character.x, character.y)));
    // for (var i = particles.length - 1; i >= 0; i--) {
    //     var p = particles[i];
    //     p.run();
    //     if (p.isDead()) {
    //         particles.splice(i, 1);
    //     }
    // }

    pushMatrix();
    translate(character.x, character.y);
    rotate(character.rotation);
    ball();
    popMatrix();

}; //the player

var wallCollision = function(wallData, X) {
    var collided = false;
    for (var index = 0; index < wallData.numberOfLines; index++) {
        if ((X > wallData.startx[index] - 9) && (X < wallData.endx[index] + 9)) {
            collided = true;
        }
    }
    return (collided);
}; // used (inside of game();) to determine whether or not the player is colliding with the walls 
var lastKey = null;
var canControl = true;
var keys = []; //character rotation
var keyPressed = function() {
    keys[keyCode] = true;
};
var keyReleased = function() {
    keys[keyCode] = false;
};
var keyController = function() {
    if (keyIsPressed) {
        canControl = true;
    } else {
        // decelerate
        canControl = false;
        if (lastKey === "left") {
            character.x -= character.speed;
            character.rotation -= character.speed * 5;
        }
        if (lastKey === "right") {
            character.x += character.speed;
            character.rotation += character.speed * 5;
        }
    }

    if (canControl) {
        // add speed if either of the movement keys are pressed
        if (keys[RIGHT] || keys[LEFT]) {
            character.speed += 1.08;
            if (character.speed > 5) {
                // max speed of 5
                character.speed = 5;
            }
        }
        // normal movement
        if (keys[LEFT]) {
            character.x -= character.speed;
            character.rotation -= character.speed * 5;
            lastKey = "left";
        } else if (keys[RIGHT]) {
            character.x += character.speed;
            character.rotation += character.speed * 5;
            lastKey = "right";
        }
    } else {
        // if the movement keys are released, slow down the movement, but don't instantly stop it
        character.speed /= 1.06;
    }

    // wall collisions
    if (character.x - character.w / 2 <= 0) {
        character.x += character.speed;
    }
    if (character.x + character.w / 2 >= width) {
        character.x -= character.speed;
    }

    // top collision
    if (character.y <= 5) {
        character.y += 15;
        character.health -= 360 / 2;
        screenshake.count = 4;
        if (playSounds) {
            playSound(getSound("rpg/hit-splat"));
        }
        
    }
};

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
var xPos = character.x;//where the explosion happens
var yPos = character.y;//^
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
        
        if (character.x + character.w > this.x && character.x - character.w/2 < this.x + 20 && character.y > this.y && character.y < this.y + 30) {
            if (playSounds) {
                playSound(getSound("retro/boom2"));
            }
            if (!character.shield) {
                character.health -= 360 / 2;
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
var explosionInfo = {
    exploding: false,
    x: null,
    y: null
};

var explosion = function (x, y) {
    noStroke();
    fill(255, 20, 0, xPlosionTransparency);
    ellipse(x, y, xPlosionSize, xPlosionSize);
    fill(xPlosionColor/2, 0, 0, xPlosionTransparency * 1.5);
    ellipse(x, y, xPlosionSize/2, xPlosionSize/2);
    
    //the variables change
    xPlosionSize *= 1.2;
    xPlosionColor -= 5;
    xPlosionTransparency -= 8;
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
        
        if (character.x + character.w > this.x && character.x - character.w/2 < this.x + 25 && character.y > this.y && character.y < this.y + 30) {
            if (playSounds) {
                playSound(getSound("rpg/battle-spell"));
            }
            if(this.type === 1) {
                character.health += 360/2;
                // println(character.health);
            } else {
                character.shield = true;
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
            if (character.shield) {
                // change the powerup to health if the shield is already activated
                this.type = 1;
            }
            // shield powerup
            fill(255);
            text("S", this.x + 4, this.y);
        }
    };
};

/* coins */

var coins = [];
var Coin = function (x, y) {
    
    this.x = x;
    this.y = y;
    this.diameter = 16;
    this.collected = false;
    
    Coin.prototype.draw = function () {
        if (!this.collected) {
            fill(204, 173, 16);
            ellipse(this.x, this.y, this.diameter, this.diameter);
            this.y -= scrollSpeed;
        }
    };
};

/* HUD */

var round10 = function(n) {
    return (n + 5) / 10 * 10;
};// rounds input to the nearest integer 10 and returns that 
var healthscore = 360;
var subtractionSpeed = 15;
var healthIcon = function() {

    if (character.health < healthscore) {
        healthscore -= subtractionSpeed;
        if (healthscore <= 0) {
            healthscore = 0;
            subtractionSpeed = 1;
        }
    } if (character.health > healthscore) {
        fill(255);
        textSize(40);
        healthscore += subtractionSpeed;
        if (healthscore >= 360) {
            healthscore = 360;
            character.health = 360;
            subtractionSpeed = 1;
        }
        textSize(20);
    } if (healthscore === character.health) {
        healthscore = character.health;
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

    if (character.shield) {
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
        text(round(character.shieldTime), 50, 100);
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

var game = function() {
    
    if (character.isAlive) {
        subtractionSpeed = 15;
        
        score += 0.0006;
    
        if (scrollSpeed > 2.5) {
            // scrollSpeed += 0.0001;
        } else {
            scrollSpeed += 0.0006;
        }
        
        gameOverOpacity = {
            one: 0,
            two: 255,
            three: 255
        };
        var gameTime = upTime / 100000000 - beginGameTime; // - pauseTime
        score = round(gameTime / 5);

        if (character.health <= 0) {
            character.isAlive = false;
        }// ends the game when player dies

        var collided = false;
        background(77, 67, 140);
        
        for (var wallindex = 0; wallindex < numberWalls; wallindex++) {
            drawWall(walls[wallindex]);
            // spikes[wallindex].draw();
            if ((walls[wallindex].Y > character.y + character.h / 2 - 3 - character.gravity * 2) && (walls[wallindex].Y < character.y + character.h / 2 + 3)) {
                if (wallCollision(walls[wallindex], character.x)) {
                    character.y -= scrollSpeed; //move the player up
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
        if (collided === false) {
            canControl = false;
            if (character.y < height) {
                character.y += character.gravity;
            }
        } else {
            canControl = true;
        }
        noStroke();
        player();
        keyController();
        
        for (var i = 0; i < rockets.length; i++) {
            rockets[i].draw();
            if (rockets[i].y <= -400 || rockets[i].exploded) {
                if (rockets[i].exploded) {
                    explosionInfo = {
                        exploding: true,
                        x: rockets[i].endX,
                        y: rockets[i].endY
                    };
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
        
        if (character.shield) {
            
            noStroke();
            fill(255, 35, 35, shieldOpacity - 200);
            ellipse(character.x, character.y, 50, 50);
            
            character.shieldTime -= 0.01;
            if (character.shieldTime <= 0) {
                character.shield = false;
                character.shieldTime = 8;
            }
        }

        hud();
        
    }
    else {
        back_ground();
        gameOverOpacity.one += 2;
        fill(0, 0, 0, gameOverOpacity.one);
        rect(0, 0, width, height);
        fill(255, 255, 255);
        textSize(40);
        text("Game Over", 200, 300);
        if (gameOverOpacity.one > 320) {
            textSize(22);
            text("You Scored " + score + (score > 1 || score === 0? " Points." : " Point."), 200, 351);
            noStroke();
            gameOverOpacity.two --;
            fill(0, 0, 0, gameOverOpacity.two);
            rect(0, 338, width, 30);
            
            if (gameOverOpacity.one > 500) {
                mainMenuButton.draw();
                textAlign(CENTER, CENTER);
                gameOverOpacity.three --;
                fill(0, 0, 0, gameOverOpacity.three);
                rect(0, 371, width, 322);
            }
        }
        
        if (mainMenuButton.pressed) {
            gotoMenu = true;
            playGame = false;
            transitionStage = 1;
        }
    }
};

for (var yloc = 100; yloc < height + distBtwnWalls; yloc += distBtwnWalls) {
    walls[numberWalls++] = createWall(yloc);
} // declaring the distance between different walls

/* Draw */

draw = function() {
    screenshaker();
    pushMatrix();
    translate(screenshake.x, screenshake.y);
    var rocketLaunch = round(random(0, 1000));
    var spawnPowerUp = round(random(0, 1000));
    var spawnCoin = round(random(0, 1000));
    if (rocketLaunch <= 3 && rockets.length <= 4) {
        rockets.push(new Rocket(random(0, width), height + 200));
    }
    if (spawnPowerUp <= 5 && powerUps.length <= 0) {
        powerUps.push(new PowerUp(-50, random(200, height - 50)));
    }
    if (spawnCoin <= 5 && coins.length <= 0) {
        coins.push(new Coin(random(0, width), height + 10));
    }
    // println(coins.length);
    
    for (var i = 0; i < coins.length; i ++) {
        coins[i].draw();
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
            pause();
            break;
        default:
            background(77, 67, 140);
            fill(255, 255, 255);
            textAlign(CENTER, CENTER);
            text("Unable to find scene \"" + (scene === ""? "____" : scene) + "\",\nPlease restart the program", width/2, height/2);
            break;
    }
    
    // Apply wind force to all Particles

    if (playGame) {
        transition("game");
    } if (gotoMenu) {
        transition("menu");
        opacity = 255;
    } if (pauseGame) {
        transition("pause");
    }
    
    if (explosionInfo.exploding) {
        explosion(explosionInfo.x, explosionInfo.y);
    }
    canControl = false;
    upTime += millis();
    mp = false;
    popMatrix();
};

mousePressed = function() {
    mp = true;
};

















































































