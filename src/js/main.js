var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

// Land Variables
var region = [60,0]; // Region is a offset for the Perlin generator. Split inf loading into chunks for management.
var regionsLoaded = ["0,0"]; // regionsLoaded is stored as strings as a bugfix
var land;

// Physics variables
var sprite;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var stars;
var jetVelocity = 0;

// Stats
var score = 0;
var scoreText;
var timer = 120;
var timerText;
var depth = 0;
var depthText;

var vignette;

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
  game.load.image('darkEarth', 'img/dark-earth.png', 64, 64);
  game.load.image('dark', 'img/dark.png', 64, 64);
  game.load.image('star', 'assets/games/starstruck/star.png');
  game.load.spritesheet('dude', 'assets/games/starstruck/dude.png', 32, 48);
}

// ======================= Create ========================= //

function create() {
  // Define world boundries, land and initial spawn
  game.world.setBounds(0, 0, 192000, 192000);
  game.time.desiredFps = 30;
  game.renderer.renderSession.roundPixels = true;

  // Group creation for physical objects. Enable body for collision methods
  land = game.add.group(); // land is now a group that contains all collidable tiles
  land.enableBody = true; // Give land the .body tag
  stars = game.add.group();
  stars.enableBody = true;

  // Create the starter region (only runs once at this point)
  spawnRegion(region[0], region[1]);

  //  Add a sprite with animations & directions
  player = game.add.sprite(96540,100, 'dude');
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

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
  scoreText = game.add.text(0, 0, 'Score: 0', { fontSize: '32px', fill: '#fff' });
  depthText = game.add.text(0, 0, 'Depth [ 0m ]', { fontSize: '32px', fill: '#fff' });
  timerText = game.add.text(0, 0, '120', { fontSize: '32px', fill: '#e46' });
  vignette.alpha = 0.8;
  game.time.events.repeat(Phaser.Timer.SECOND * 1, 100000, tictoc, this);

}


// ====================== Update ======================== //

function update() {

  // Keep region info up to date
  region[0] = Math.floor(player.x / 1600);
  region[1] = Math.floor(player.y / 1600);

  // Collision Detection
  game.physics.arcade.collide(player, land);
  game.physics.arcade.collide(stars, land);
  game.physics.arcade.overlap(player, stars, collectStar, null, this); //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function

  // Function calls in other files
  hud(); // Located in hud.js
  controls(); // Located in controls.js
  regionManagement(); // Located in regions.js


}


// ======= Secondary functions (Non-Phaser specific functions) ======== //

function tictoc() {
  timer -= 1;
  timerText.text = timer;
}

function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
    timer += 10;
}

