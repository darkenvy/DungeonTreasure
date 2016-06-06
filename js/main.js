var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
  {
    preload: preload,
    create: create,
    update: update,
    render: render
  }
);

// Region is a offset for the Perlin generator.
// Split inf loading into chunks for management
// regionsLoaded is stored as strings as a bugfix
var region = [60,0];
var regionsLoaded = ["0,0"];
var land;
// Physics variables
var sprite;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
// var yAxis = p2.vec2.fromValues(0, 1);
var stars;

// Stats
var score = 0;
var scoreText;
var timer = 120;
var timerText;
var depth = 0;
var depthText;

var vignette;
var jetVelocity = 0;


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

function create() {
  // Define world boundries, land and initial spawn
  game.world.setBounds(0, 0, 192000, 192000);
  game.time.desiredFps = 30;
  game.renderer.renderSession.roundPixels = true;

  // land is now a group that contains all collidable tiles
  land = game.add.group();
  land.enableBody = true; // Give land the .body tag
  // Coins / stars
  stars = game.add.group();
  stars.enableBody = true;

  spawnRegion(region[0], region[1]); // Create the starter region (only runs once at this point)

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
  // jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  jetButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.camera.follow(player);


  // Setup screen texts & vignette
  vignette = game.add.sprite(0, 0, 'dark');
  vignette.alpha = 0.8;
  scoreText = game.add.text(0, 0, 'Score: 0', { fontSize: '32px', fill: '#fff' });
  depthText = game.add.text(0, 0, 'Depth [ 0m ]', { fontSize: '32px', fill: '#fff' });
  timerText = game.add.text(0, 0, '120', { fontSize: '32px', fill: '#e46' });

  game.time.events.repeat(Phaser.Timer.SECOND * 1, 100000, tictoc, this);


}

function tictoc() {
  timer -= 1;
  timerText.text = timer;

}

function spawnRegion(regionX, regionY) {
  // Perlin noise returns a float between 0-1.
  var pn = new Perlin('Reno');
  for (var y=0; y<25; y++) {
    for (var x=0; x<25; x++) {
      var offsetX = (regionX * 25) + x;
      var offsetY = (regionY * 25) + y;
      // Call Perlin noise and pass in offset coords
      cellNum = pn.noise(offsetX/4, offsetY/4, 0);
      starNum = pn.noise(offsetX/4, offsetY/4, 0.5);
      // Perlin maps to float between 0-1, multiply to get range 0-5
      cellNum = Math.floor(cellNum * 6);
      starNum = Math.floor(starNum * 7);

      if (cellNum != 3 && cellNum != 4) {
        if (cellNum == 1){
          var ground = land.create(offsetX*64, offsetY*64, 'darkEarth');
        } else {
          var ground = land.create(offsetX*64, offsetY*64, 'earth');
        }
        ground.body.immovable = true;
      }

      if (cellNum == 3 && starNum == 1) {
        var star = stars.create((offsetX*64)+32, (offsetY*64)+32, 'star');
        star.body.gravity.y = 300;
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
      }
    }
  }

}

function update() {
  game.physics.arcade.collide(player, land);
  game.physics.arcade.collide(stars, land);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  game.physics.arcade.overlap(player, stars, collectStar, null, this);

  // Move the Score and Counter with camera
  scoreText.x = game.camera.x + 50;
  scoreText.y = game.camera.y + 30;
  timerText.x = game.camera.x + 400;
  timerText.y = game.camera.y + 30;
  depthText.x = game.camera.x + 50;
  depthText.y = game.camera.y + 60;
  depth = Math.floor(player.y/64);
  depthText.text = "Depth [ " + depth + "m ]";

  vignette.x = game.camera.x - 25; // 25 pixels on each side for overscan
  vignette.y = game.camera.y - 25;
  if (vignette.alpha <= 0.8) {
    vignette.alpha += 0.005;
  } else {
    vignette.alpha = 0.7 + (Math.random()/10)
  }

  for (var i=0; i< stars.children.length; i++) {
    if (stars.children[i].body.velocity.y > 200) {
      console.log(i, "destroyed");
      stars.children[i].destroy();
    }
  }

  // Keep region info up to date
  region[0] = Math.floor(player.x / 1600);
  region[1] = Math.floor(player.y / 1600);

  // Controls
  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
      player.body.velocity.x = -200;

      if (facing != 'left') {
          player.animations.play('left');
          facing = 'left';
      }
  }
  else if (cursors.right.isDown) {
      player.body.velocity.x = 200;

      if (facing != 'right') {
          player.animations.play('right');
          facing = 'right';
      }
  }
  else {
      if (facing != 'idle') {
          player.animations.stop();

          if (facing == 'left') {
              player.frame = 0;
          }
          else {
              player.frame = 5;
          }

          facing = 'idle';
      }
  }
  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -450;
  }
  // Jetpack activate
  if (jetButton.isDown) {
    // console.log(player.body.velocity.y);
    if (player.body.velocity.y > -200) {
      jetVelocity = player.body.velocity.y - 50;
      console.log(jetVelocity);
      // player.body.velocity.y = -200;
      player.body.velocity.y = jetVelocity ;

    }
  }


  // ================= Load upcoming area ===================== //
  // dont forget to upscale when I 'zoom-in' the level
  if ((player.x % 1600 ) < 100) {
    // If the next region (right) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf((region[0]-1).toString() + ',' + region[1].toString() ) == -1){
      regionsLoaded.push((region[0]-1).toString() + ',' + region[1].toString());
      console.log(regionsLoaded);
      spawnRegion(region[0]-1, region[1]);
    }
  }
  if ((player.x % 1600 ) > 700) {
    // If the next region (left) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf((region[0]+1).toString() + ',' + region[1].toString() ) == -1){
      regionsLoaded.push((region[0]+1).toString() + ',' + region[1].toString());
      console.log(regionsLoaded);
      spawnRegion(region[0]+1, region[1]);
    }
  }

  if ((player.y % 1600 ) < 100) {
    // If the next region (upwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1]-1).toString() ) == -1){
      regionsLoaded.push(region[0].toString() + ',' + (region[1]-1).toString());
      console.log(regionsLoaded);
      spawnRegion(region[0], region[1]-1);
    }
  }
  if ((player.y % 1600 ) > 700) {
    // If the next region (downwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1]+1).toString() ) == -1){
      regionsLoaded.push(region[0].toString() + ',' + (region[1]+1).toString());
      console.log(regionsLoaded);
      spawnRegion(region[0], region[1]+1);
    }
  }

  // ======================== Cleanup ========================= //
  // Destroy pieces if too far. Since levels are infinite, cleanup is needed.
  land.forEach(function(piece) {
    if (Math.floor(piece.x / 1600) == region[0]-2) {
      removeRegionLoaded(region[0]-2, 0);
      piece.destroy();
    }
    if (Math.floor(piece.x / 1600) == region[0]+2) {
      removeRegionLoaded(region[0]+2, 0);
      piece.destroy();
    }
    if (Math.floor(piece.y / 1600) == region[1]-2) {
      removeRegionLoaded(region[1]-2, 1);
      piece.destroy();
    }
    if (Math.floor(piece.y / 1600) == region[1]+2) {
      removeRegionLoaded(region[1]+2, 1);
      piece.destroy();
    }

  })

  function removeRegionLoaded(region, selector) {
    console.log("destroyed");
    for (var i=0; i<regionsLoaded.length; i++) {
      if (regionsLoaded[i].split(',')[selector] == region) {
        regionsLoaded.splice(i, 1);
        console.log(land.length);
        // console.log(regionsLoaded, i);
      }
    }
  }




}


function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
    timer += 10;


}

function render() {

    // game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}
