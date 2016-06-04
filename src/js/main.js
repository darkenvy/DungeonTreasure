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
var region = [0,1];
var regionsLoaded = ["0,0"];
var land;

function preload() {
  game.load.image('sky', 'assets/tests/sky.png');
  game.load.image('ground', 'assets/sprites/platform.png');
  game.load.image('earth', 'img/earth.png', 32, 32);
  game.load.image('darkEarth', 'img/dark-earth.png', 32, 32);
  game.load.spritesheet('dude', 'assets/games/snotattack/dude.png', 64, 64);
}

function create() {
  game.world.setBounds(0, 0, 192000, 192000);
  land = game.add.group();

  // Create the starter region (only runs once at this point)
  spawnRegion();

  // Create character
  game.physics.startSystem(Phaser.Physics.P2JS);
  player = game.add.sprite(100,100, 'dude');
  game.physics.p2.enable(player);
  cursors = game.input.keyboard.createCursorKeys();
  game.camera.follow(player);
}

function spawnRegion() {
  // create stars
  // Limit: 12,800 - 20,000 objects before slowdown
  // for (var i=0; i<160; i++) {
  //   for (var j=0; j<80; j++) {
  //     game.add.sprite(i*10, j*10, 'star');
  //   }
  // }
  // cycle through a 10x10 grid of Perlin noise and construct html according to results
  // Perlin noise returns a float 0-1.
  var pn = new Perlin('Reno');
  for (var y=0; y<25; y++) {
    for (var x=0; x<25; x++) {
      var offsetX = (region[0] * 25) + x;
      var offsetY = (region[1] * 25) + y;
      // Call Perlin noise and pass in offset coords
      cellNum = pn.noise(offsetX/10, offsetY/10, 0);
      // Perlin maps to float between 0-1, multiply to get range 0-5
      cellNum = Math.floor(cellNum * 6);

      if (cellNum != 3) {
        if (cellNum == 1){
          land.create(x*32, y*32, 'darkEarth');
        } else {
          land.create(x*32, y*32, 'earth');
        }
      }
    }
  }

}

function update() {
  player.body.setZeroVelocity();

  // Controls
  if (cursors.up.isDown) {
      player.body.moveUp(300)
  } else if (cursors.down.isDown) {
      player.body.moveDown(300);
  }
  if (cursors.left.isDown) {
      player.body.velocity.x = -300;
  } else if (cursors.right.isDown) {
      player.body.moveRight(300);
  }

  // Destroy pieces if too far. Since levels are infinite, cleanup is needed.
  // land.forEach(function(piece) {
  //   if ( (Math.abs(player.x - piece.x)) > 1000 ||
  //        (Math.abs(player.y - piece.y)) > 1000) {
  //     piece.destroy();
  //   }

  // })


  // Keep region info up to date
  region[0] = Math.floor(player.x / 800);
  region[1] = Math.floor(player.y / 800);

  // Load upcoming area
  // dont forget to upscale when I 'zoom-in' the level
  if ((player.y % 800 ) > 600) {
    // If the next region (downwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1]+1).toString() ) == -1){
      regionsLoaded.push(region[0].toString() + ',' + (region[1]+1).toString());
      console.log(regionsLoaded);
    }
  }



}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}
