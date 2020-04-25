var CANVAS = document.getElementById('field');
var STEP = 5,
    FPS = 40;
var A,
    ENEMIES = [],
    ENEMIES_AMOUNT = 6,
    ELEMENTS = [],
    game,
    xv = 0,
    yv = 0,
    key_active = 'ArrowRight';
var tmp_top,
    tmp_left,
    tmp_x,
    tmp_y;

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}



function Bullet() {
    this.obj = document.createElement('div');
    this.obj.className = 'bullet';
    this.obj.style.display = 'None';
    CANVAS.appendChild(this.obj);

    this.BORDER_TOP = 0;
    // this.BORDER_BOTTOM = CANVAS.offsetHeight - this.obj.offsetHeight;
    this.BORDER_BOTTOM = CANVAS.offsetHeight - 10;
    this.BORDER_LEFT = 0;
    // this.BORDER_RIGHT = CANVAS.offsetWidth - this.obj.offsetWidth;
    this.BORDER_RIGHT = CANVAS.offsetWidth - 10;
    this.xv = 0;
    this.yv = 0;
    
    this.fired = function(top, left, direction) {
        this.obj.style.display = 'block';
        if (direction == 'rotate(90deg)') {
            [this.xv, this.yv] = [0, -1];
            this.obj.style.top = top + 'px';
            this.obj.style.left = left + 20 + 'px';
        } else if (direction == 'rotate(270deg)') {
            [this.xv, this.yv] = [0, 1];
            this.obj.style.top = top + 'px';
            this.obj.style.left = left + 20 + 'px';
        } else if (direction == 'rotate(0deg)') {
            [this.xv, this.yv] = [-1, 0];
            this.obj.style.top = top + 20 + 'px';
            this.obj.style.left = left + 'px';
        } else if (direction == 'rotate(180deg)') {
            [this.xv, this.yv] = [1, 0];
            this.obj.style.top = top + 20 + 'px';
            this.obj.style.left = left + 'px';
        }
    }
    
    this.move = function() {
        let tmp_x = this.obj.offsetTop + this.yv * STEP * 2;
        let tmp_y = this.obj.offsetLeft + this.xv * STEP * 2;
        
        if (tmp_x >= this.BORDER_TOP && tmp_x <= this.BORDER_BOTTOM) {
            this.obj.style.top = tmp_x + 'px';
        } else {
            this.obj.style.display = 'None';
            return false;
        }
        if (tmp_y >= this.BORDER_LEFT && tmp_y <= this.BORDER_RIGHT) {
            this.obj.style.left = tmp_y + 'px';
        } else {
            this.obj.style.display = 'None';
            return false;
        }
        return true;
    }
}

// Tank object
function Tank(left, top, tank_type) {
    this.obj = document.createElement('div');
    this.obj.style.top = top + 'px';
    this.obj.style.left = left + 'px';
    this.obj.style.transform = 'rotate(0deg)';
    this.obj.className = tank_type; // tank_type = 'x' OR 'y'
    
    this.getSize = function(top, left) {
        this.top = top;
        this.left = left;
        this.bottom = top + 50;
        this.right = left + 50;
    }
    
    this.getSize(top, left);
    // Adding a picture of a tank
    var temp = document.createElement('div');
    temp.className = 'x_inner';
    this.obj.appendChild(temp);
    var temp = document.createElement('div');
    temp.className = 'x_t';
    this.obj.appendChild(temp);
    
    this.bullet = new Bullet();
    this.shoot_act = false;
    
    this.CollisionDetector = function(xv, yv) {
        if (xv != 0) {
            this.coord_const = this.obj.offsetLeft + 50 * xv;
            this.line_max = this.obj.offsetTop + 50;
            this.line_min = this.obj.offsetTop - 50;
        }
        if (yv != 0) {
            this.coord_const = this.obj.offsetTop + 50 * yv;
            this.line_max = this.obj.offsetLeft + 50;
            this.line_min = this.obj.offsetLeft - 50;
        }
        for(let i = 0; i < ELEMENTS.length; i++) {
            if (ELEMENTS[i] !== this) {
                if (xv != 0) {
                    if (ELEMENTS[i].obj.offsetLeft == this.coord_const && +
                        ELEMENTS[i].obj.offsetTop < this.line_max && +
                        ELEMENTS[i].obj.offsetTop > this.line_min) {
                        return false;
                    }
                }
                if (yv != 0) {
                    if (ELEMENTS[i].obj.offsetTop == this.coord_const && +
                        ELEMENTS[i].obj.offsetLeft < this.line_max && +
                        ELEMENTS[i].obj.offsetLeft > this.line_min) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    this.BORDER_TOP = 0;
    // this.BORDER_BOTTOM = CANVAS.offsetHeight - this.obj.offsetHeight;
    this.BORDER_BOTTOM = CANVAS.offsetHeight - 50;
    this.BORDER_LEFT = 0;
    // this.BORDER_RIGHT = CANVAS.offsetWidth - this.obj.offsetWidth;
    this.BORDER_RIGHT = CANVAS.offsetWidth - 50;

    this.xv = 0;
    this.yv = 0;

    this.move = function(xv=this.xv, yv=this.yv) {
        // actual moving
        if (xv != 0 || yv != 0) {
            let tmp_top = this.obj.offsetTop + yv * STEP;
            let tmp_left = this.obj.offsetLeft + xv * STEP;

            if (this.CollisionDetector(xv, yv)) {
                if (tmp_top >= this.BORDER_TOP && tmp_top <= this.BORDER_BOTTOM) {
                    this.obj.style.top = tmp_top + 'px';
                    this.getSize(tmp_top, tmp_left);
                }
                if (tmp_left >= this.BORDER_LEFT && tmp_left <= this.BORDER_RIGHT) {
                    this.obj.style.left = tmp_left + 'px';
                    this.getSize(tmp_top, tmp_left);
                }
            }
            
            // turning the tank
            if (xv == -1) {
                this.obj.style.transform = 'rotate(0deg)';
            } else if (xv == 1) {
                this.obj.style.transform = 'rotate(180deg)';
            } else if (yv == -1) {
                this.obj.style.transform = 'rotate(90deg)';
            } else if (yv == 1) {
                this.obj.style.transform = 'rotate(270deg)';
            }
        }
        // shooting
        if (this.shoot_act) {
            this.shoot_act = this.bullet.move();
        }
    }

    this.add = function() {
        CANVAS.appendChild(this.obj);
    }

    this.shoot = function() {
        if (!this.shoot_act) {
            this.shoot_act = true;
            this.bullet.fired(this.obj.offsetTop, this.obj.offsetLeft, this.obj.style.transform);
        }
    }
}

// Main cycle

function Bot() {
    let xv, yv;
    for(let i = 0; i < ENEMIES.length; i++) {
        xv = 0;
        yv = 0;
        xv = getRndInteger(-1, 1);
        if (xv == 0) {
            yv = getRndInteger(-1, 1);
        }
        ENEMIES[i].xv = xv;
        ENEMIES[i].yv = yv;
        if (getRndInteger(0, 1)) {
            ENEMIES[i].shoot();
        }
    }
}

function Runtime() {
    for(let i = 0; i < ELEMENTS.length; i++) {
        if (i == ELEMENTS.length - 1) {
            ELEMENTS[i].move(xv, yv);
        } else {
            ELEMENTS[i].move();
        }
    }
}

// Event listeners
window.addEventListener("load", function() {
    A = new Tank(100, 100, 'x');
    A.add();

    for(let i = 0; i < ENEMIES_AMOUNT; i++) {
        ENEMIES.push(new Tank(100*(i+1), 0, 'y'));
        ENEMIES[i].add();
        ELEMENTS.push(ENEMIES[i]);
    }

    ELEMENTS.push(A);

    game = setInterval(Runtime, 1000 / FPS);
    setInterval(Bot, 1000);
})
// Controller
window.addEventListener("keydown", function() {
    if (this.event.code == 'ArrowUp') {
        [xv, yv] = [0, -1];
        key_active = 'ArrowUp';
    } else if (this.event.code == 'ArrowDown') {
        [xv, yv] = [0, 1];
        key_active = 'ArrowDown';
    } else if (this.event.code == 'ArrowLeft') {
        [xv, yv] = [-1, 0];
        key_active = 'ArrowLeft';
    } else if (this.event.code == 'ArrowRight') {
        [xv, yv] = [1, 0];
        key_active = 'ArrowRight';
    }
})
// Shooting
window.addEventListener("keypress", function() {
    if (this.event.code == 'KeyX') {
        A.shoot();
    }
})

window.addEventListener("keyup", function() {
    if (this.event.code == key_active) {
        [xv, yv] = [0, 0];
    }
})

