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

function preload() {
  game.load.image('sky', 'assets/tests/sky.png');
  game.load.image('ground', 'assets/sprites/platform.png');
  game.load.image('earth', 'img/earth.png', 64, 64);
  game.load.image('darkEarth', 'img/dark-earth.png', 64, 64);
  game.load.spritesheet('dude', 'assets/games/snotattack/dude.png', 64, 64);
}

function create() {
  game.world.setBounds(0, 0, 192000, 192000);
  land = game.add.group();

  // Create the starter region (only runs once at this point)
  spawnRegion(region[0], region[1]);

  // Create character
  game.physics.startSystem(Phaser.Physics.P2JS);
  player = game.add.sprite(96400,100, 'dude');
  game.physics.p2.enable(player);
  cursors = game.input.keyboard.createCursorKeys();
  game.camera.follow(player);
}

function spawnRegion(regionX, regionY) {
  // Perlin noise returns a float between 0-1.
  var pn = new Perlin('Reno');
  for (var y=0; y<25; y++) {
    for (var x=0; x<25; x++) {
      var offsetX = (regionX * 25) + x;
      var offsetY = (regionY * 25) + y;
      // Call Perlin noise and pass in offset coords
      cellNum = pn.noise(offsetX/10, offsetY/10, 0);
      // Perlin maps to float between 0-1, multiply to get range 0-5
      cellNum = Math.floor(cellNum * 6);

      if (cellNum != 3) {
        if (cellNum == 1){
          land.create(offsetX*64, offsetY*64, 'darkEarth');
        } else {
          land.create(offsetX*64, offsetY*64, 'earth');
        }
      }
    }
  }

}

function update() {
  // Keep region info up to date
  region[0] = Math.floor(player.x / 1600);
  region[1] = Math.floor(player.y / 1600);
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


function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}
