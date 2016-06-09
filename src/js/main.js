var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
  preload: preload,
  create: create, update: update });

// Land Variables
// Region is a offset for the Perlin generator. Split inf loading into chunks for management.
var region = [60, 0];
var regionsLoaded = ['60,0']; // regionsLoaded is stored as strings as a bugfix
var land;
var ground;

// Physics variables
var sprite;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var stars;
var jetVelocity = 0;
var snakes;

// Stats
var score = 0;
var scoreText;
var totalHurts = 0;
var totalCollects = 0;
var health = 100;
var healthCooldown = 0;
var willFallDamage = false;
var timer = 120;
var depth = 0;
var currBlackness = 0.0;
var fallDmgWarning = 0;
var isPopup = true;

var vignette;
var blackness;
var music;
var destroy;

// function render() {
//     // game.debug.cameraInfo(game.camera, 32, 32);
//     // game.debug.spriteCoords(player, 32, 500);
// }

// ===================== Preload ======================= //

function preload() {
  // Load Image Assets
  game.load.image('sky', 'assets/tests/sky.png');
  game.load.image('ground', 'assets/sprites/platform.png');
  game.load.image('earth', 'img/earth.png', 64, 64);
  game.load.image('paleEarth', 'img/paleearth.png', 64, 64);
  game.load.image('earthgrass', 'img/earthgrass.png', 64, 64);
  game.load.image('darkEarth', 'img/dark-earth.png', 64, 64);
  game.load.image('greyEarth', 'img/greyearth.png', 64, 64);
  game.load.image('hellEarth', 'img/hellearth.png', 64, 64);
  game.load.image('hellEarth2', 'img/hellearth2.png', 64, 64);
  game.load.image('background', 'img/background.png', 64, 64);
  game.load.image('backgroundsky', 'img/nightsky.png', 64, 64);
  game.load.image('dark', 'img/dark.png', 64, 64);
  game.load.image('blackness', 'img/blackness.jpg', 64, 64);
  game.load.image('destroy', 'img/destroy.png', 16, 16);
  // game.load.image('star', 'assets/games/starstruck/star.png');
  game.load.image('star', 'img/ore.png', 64, 64);
  game.load.spritesheet('snake', 'img/snake.png', 64, 48);
  game.load.spritesheet('dude', 'assets/games/starstruck/dude.png', 32, 48);
  game.load.spritesheet('bomb', 'img/BombExploding.png', 32, 64);
  game.load.audio('boden', ['audio/Blz_-_May.mp3']);
}

// ======================= Create ========================= //

function create() {
  // Define world boundries, land and initial spawn
  game.world.setBounds(0, 0, 192000, 640000);
  game.time.desiredFps = 30;
  game.renderer.renderSession.roundPixels = true;

  // Music - needs to loop
  music = game.add.audio('boden');
  // music.play();

  // Group creation for physical objects. Enable body for collision methods
  land = game.add.group(); // land is now a group that contains all collidable tiles
  land.enableBody = true; // Give land the .body tag
  background = game.add.group();
  stars = game.add.group();
  stars.enableBody = true;
  bombs = game.add.group();
  bombs.enableBody = true;
  destructor = game.add.group();
  destructor.enableBody = true;
  snakes = game.add.group();
  snakes.enableBody = true;

  //  Add a sprite with animations & directions
  player = game.add.sprite(96540, 100, 'dude');
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  // Create the starter region (only runs once at this point)
  spawnRegion(region[0], region[1]);

  // Physics Enable
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.enable(player);
  player.body.gravity.y = 500;

  // Setup Arrow keys & Camera
  cursors = game.input.keyboard.createCursorKeys();
  jetButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.camera.follow(player);

  // Setup screen texts & vignette
  vignette = game.add.sprite(0, 0, 'dark');
  blackness = game.add.sprite(0, 0, 'blackness');
  // healthText = game.add.text(0, 0, 'health: 100%', { fontSize: '20px', fill: '#fff' });
  // depthText = game.add.text(0, 0, 'Depth [ 0m ]', { fontSize: '20px', fill: '#fff' });
  // timerText = game.add.text(0, 0, '120', { fontSize: '12px', fill: '#e46' });
  scoreText = game.add.text(0, 0, 'Score: ', { fontSize: '20px', fill: '#fff' });
  vignette.alpha = 0.8;
  game.time.events.repeat(Phaser.Timer.SECOND * 1, 100000, tictoc, this);
  game.time.events.repeat(Phaser.Timer.SECOND * 10, 100000, function() {
    if (health < 100) { health += 1; }
    deepClean();
    // healthText.text = 'health: ' + health + '%';
  }, this);
  game.time.events.repeat(1, 100000000, function() {
    if (timer > 0.5 && health > 1) {
      timer -= 0.01;
      // timerText.text = timer;
    }
  }, this);
}


// ====================================================== //
// ==                                                  == //
// ==                     Update                       == //
// ==                                                  == //
// ====================================================== //

function update() {
  // If the popup is up, reset the timer constantly
  if (isPopup === true) {
    // Failsafe incase of glitch with popup
    if (player.body.velocity.x !== 0) { isPopup = false; }
    timer = 120;
  }
  $('#replay').click(function() {
    region.push('60,0');
    player.x = 96540;
    player.y = 100;
    health = 100;
    timer = 120;
    score = 0;
    totalHurts = 0;
    totalCollects = 0;
    healthCooldown = 0;
    willFallDamage = false;
    depth = 0;
    currBlackness = 0.0;
  });

  // Keep region info up to date
  region[0] = Math.floor(player.x / 1600);
  region[1] = Math.floor(player.y / 1600);

  // =============== Collision Detection ================ //

  game.physics.arcade.collide(player, land, fallDamage);
  game.physics.arcade.collide(stars, land);
  game.physics.arcade.collide(snakes, land);
  game.physics.arcade.collide(snakes, snakes);
  game.physics.arcade.collide(destructor, land, function(destr, land) {
    if (land.key !== 'darkEarth') {
      land.destroy();
    }
  });
  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  game.physics.arcade.overlap(player, stars, collectStar, null, this);
  if (player.body.velocity.y > 750 && willFallDamage === false) {
    willFallDamage = true;
  } else if (player.body.velocity.y <= 750 && willFallDamage === true) {
    willFallDamage = false;
  }
  game.physics.arcade.collide(player, snakes, null, function(p, s) {
    if (healthCooldown === 0) {
      health -= 12;
      totalHurts += 1;
      player.body.velocity.y = -300;
      healthCooldown = 3;
      // healthText.text = 'health: ' + health + '%';
    }
    return false;
  });

  // ============= End Collision Detection ============ //

  // Snake Management
  for (var i = 0; i < snakes.children.length; i++) {
    if (snakes.children[i].animations.name === 'right' &&
        snakes.children[i].body.velocity.x <= 1 &&
        snakes.children[i].animations.frame > 6) {
      // If a right wall stops snake, turn left
      snakes.children[i].body.velocity.x = -150;
      snakes.children[i].animations.play('left');
    } else if (snakes.children[i].animations.name === 'left' &&
               snakes.children[i].body.velocity.x >= -1 &&
               snakes.children[i].animations.frame > 2) {
      // If a left wall stops snake, turn right
      snakes.children[i].body.velocity.x = 150;
      snakes.children[i].animations.play('right');
    }
  }

  // Bomb management
  if (bombs.children.length > 0) {
    // Only one bomb at a time anyways, so I forgo to the looping through children
    if (bombs.children[0].animations.frame === 6) {
      bombs.children[0].play('explode');
      // insert bomb damage here
    }
    if (bombs.children[0].animations.frame === 12) {
      explode();
    }
  }
  // Function calls in other files
  hud(); // Located in hud.js
  controls(); // Located in controls.js
  regionManagement(); // Located in regions.js

  if (health < 1 || timer < 0.5) {
    $('#scoreList :nth-child(1)').text('Depth: ' + depth);
    $('#scoreList :nth-child(2)').text('Ore Collected: ' + totalCollects);
    $('#scoreList :nth-child(3)').text('Dmg Taken: ' + totalHurts * 12 + ' HP');
    $('#scoreList :nth-child(4)').text('Time Remaining: ' + Math.floor(timer) + ' sec');
    $('#myScore').modal();
    $('#finalScore').text( score + Math.floor(timer));
    // timer = 1;
    healthCooldown = 9001;
  }


  // Fall damage aura warning
  if (player.body.velocity.y > 600 && fallDmgWarning < 1) {
    fallDmgWarning += 0.1;
    $('#game').css('box-shadow', '0 0 50px 5px rgba(255,153,0, ' + fallDmgWarning + ')');
  } else if (willFallDamage === false && fallDmgWarning > 0) {
    fallDmgWarning -= 0.1;
    $('#game').css('box-shadow', '0 0 50px 5px rgba(255,153,0, ' + fallDmgWarning + ')');
  }
}


// ======= Secondary functions (Non-Phaser specific functions) ======== //

function fallDamage() {
  if (willFallDamage) {
    willFallDamage = false;
    healthCooldown = 2;
    health -= 20;
    totalHurts += 1;
    tictoc();
    // healthText.text = 'health: ' + health + '%';
  }
}

function tictoc() {
  if (healthCooldown > 0) {
    healthCooldown -= 1;
    player.alpha = 0.5;
  } else if (player.alpha !== 1) {
    player.alpha = 1;
  }
  if ((timer > 120) && (vignette.alpha !== 0 || blackness.alpha !== 0)) {
    // for some reason this runs every second. It is why it is inside tictoc
    vignette.alpha = 0;
    blackness.alpha = 0;
    // console.log(vignette.alpha, blackness.alpha);
  }

  // Destroy snakes if 3200px away (2 regions)
  for (var i = 0; i < snakes.children.length; i++) {
    if (Math.abs(snakes.children[i].y - player.y) > 3200) {
      snakes.children[i].destroy();
    }
  }
  // Destroy stars if 3200px away (2 regions)
  for (var i = 0; i < stars.children.length; i++) {
    if (Math.abs(stars.children[i].y - player.y) > 3200) {
      stars.children[i].destroy();
    }
  }

  // Update out-of-canvas elements
  if (depth < 1000) {
    $('#depth-circle').attr('style', 'top: ' + (Math.floor(depth / 1.81) - 10) + 'px');
    $('.score-tag').attr('style', 'margin-top: ' + (Math.floor(depth / 1.81) + 13) + 'px');
    $('#score-tag-elem').html('<a>' + depth + ' Meters</a>');
  } else {
    $('#score-tag-elem').html('<a>' + depth / 1000 + ' Km</a>');
  }
  if (health > 0 && health <= 100) {
    // Change these to .css() eventually
    $('#health-bar').attr('style', 'width: ' + Math.floor(health * 8) + 'px');
  } else {
    $('#health-bar').attr('style', 'width: ' + 0 + 'px');
  }
}

function collectStar (player, star) {
  // Removes the star from the screen
  star.kill();
  timer += 10;
  totalCollects += 1;
}

function explode() {
  // destructor wont clean up all the way. bug. Should not be a problem.
  for (i = 0; i < destructor.children.length; i++) {
    // console.log(i);
    destructor.children[i].destroy();
  }
  // remember, the sprite is technically 50px above the player.
  destroy1 = destructor.create(bombs.children[0].x - 50, bombs.children[0].y + 50, 'destroy');
  destroy2 = destructor.create(bombs.children[0].x + 50, bombs.children[0].y + 50, 'destroy');
  destroy3 = destructor.create(bombs.children[0].x, bombs.children[0].y, 'destroy');
  destroy4 = destructor.create(bombs.children[0].x, bombs.children[0].y + 100, 'destroy');

  destroy5 = destructor.create(bombs.children[0].x + 65, bombs.children[0].y, 'destroy');
  destroy6 = destructor.create(bombs.children[0].x - 65, bombs.children[0].y, 'destroy');
  destroy7 = destructor.create(bombs.children[0].x + 50, bombs.children[0].y + 100, 'destroy');
  destroy8 = destructor.create(bombs.children[0].x - 50, bombs.children[0].y + 100, 'destroy');
  bombs.children[0].destroy();
  // console.log("exploded");
}
