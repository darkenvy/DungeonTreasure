// Need to replace star destruction

function spawnRegion(regionX, regionY) {
  // Perlin noise returns a float between 0-1.
  // var pn = new Perlin('Reno');
  var pn = new Perlin(Math.random());
  for (var y = 0; y < 25; y++) {
    for (var x = 0; x < 25; x++) {
      var offsetX = (regionX * 25) + x;
      var offsetY = (regionY * 25) + y;
      // Call Perlin noise and pass in offset coords
      cellNum = pn.noise(offsetX / 4, offsetY / 4, 0);
      rockType = pn.noise(offsetX / 30, offsetY / 30, 0.25);
      specNum = pn.noise(offsetX / 30, offsetY / 30, 0.7); // used for cavities atm
      starNum = pn.noise(offsetX / 4, offsetY / 4, 0.5);
      snakeNum = pn.noise(offsetX / 4, offsetY / 4, 0.4);
      // Perlin maps to float between 0-1, multiply to get range 0-5
      cellNum = Math.floor(cellNum * 6);
      rockType = Math.floor(rockType * 3);
      specNum = Math.floor(specNum * 10);
      starNum = Math.floor(starNum * 8);
      // starNum = Math.floor(starNum * 2);
      snakeNum = Math.floor(snakeNum * 7);

      // offsetY > 4 is for the first tile of the game. So he is not undeground
      if (cellNum !== 3 && cellNum !== 4 && offsetY > 4) {
        // Different states of land, mapped out via the Perlin noise
        if (specNum < 7 && cellNum === 1 && offsetY !== 4) {
          ground = land.create(offsetX * 64, offsetY * 64, 'darkEarth');
        } else if (specNum < 7 && offsetY === 5) {
          ground = land.create(offsetX * 64, offsetY * 64, 'earthgrass');
        } else if (specNum < 7 && rockType === 1 && player.y <= 32000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'paleEarth');
        } else if (specNum < 7 && rockType === 2 && player.y <= 32000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'greyEarth');
        } else if (specNum < 7 && rockType > 0 && player.y > 64000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'hellEarth2'); // Hell Depth2
        } else if (specNum < 7 && player.y > 32000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'hellEarth'); // Hell Depth
        } else if (specNum < 7) {
          ground = land.create(offsetX * 64, offsetY * 64, 'earth'); // Regular land
        } else {
          // This is a bugfix. We obviously dont want lands at 0,0 but without this
          // the game refuses to start in certain cases
          ground = land.create(0,0, 'earth');
        }
        ground.body.immovable = true;
      }
      // Create background tiles
      if (((cellNum === 3 || cellNum === 4) || (specNum === 7 )) && offsetY > 4) {
        var bg = background.create(offsetX * 64, offsetY * 64, 'background');
      } else if (offsetY <= 4) {
        var bgsky = background.create(offsetX * 64, offsetY * 64, 'backgroundsky');
      }

      // Create stars
      if (cellNum === 3 && starNum === 1) {
        var star = stars.create((offsetX * 64), (offsetY * 64), 'star');
        // star.body.gravity.y = 300;
        // star.body.bounce.y = 0.7 + Math.random() * 0.2;
      }
      if (cellNum === 3 && snakeNum === 1 && snakes.children.length < 40 && offsetY > 4) {
        //  Create a snake inside of the 'snakes' group
        var snake = snakes.create((offsetX * 64), (offsetY * 64), 'snake');
        snake.animations.add('left', [0, 1, 2, 3], 10, true);
        snake.animations.add('right', [4, 5, 6, 7], 10, true);

        //  Let gravity do its thing
        snake.body.gravity.y = 300;
        // snake.body.collideWorldBounds=true;
        snake.body.velocity.x = 150;
        snake.animations.play('right');
      }
    }
  }
}

function regionManagement() {
  // ================= Load upcoming area ===================== //
  // dont forget to upscale when I 'zoom-in' the level
  if ((player.x % 1600) < 100) {
    // If the next region (right) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf((region[0] - 1).toString() + ',' + region[1].toString()) === -1) {
      regionsLoaded.push((region[0] - 1).toString() + ',' + region[1].toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // 'snakes:', snakes.children.length);
      spawnRegion(region[0] - 1, region[1]);
    }
  }
  if ((player.x % 1600) > 700) {
    // If the next region (left) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf((region[0] + 1).toString() + ',' + region[1].toString()) === -1) {
      regionsLoaded.push((region[0] + 1).toString() + ',' + region[1].toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // 'snakes:', snakes.children.length);
      spawnRegion(region[0] + 1, region[1]);
    }
  }

  if ((player.y % 1600) < 100) {
    // If the next region (upwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1] - 1).toString()) === -1) {
      regionsLoaded.push(region[0].toString() + ',' + (region[1] - 1).toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // 'snakes:', snakes.children.length);
      spawnRegion(region[0], region[1] - 1);
    }
  }
  if ((player.y % 1600) > 700) {
    // If the next region (downwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1] + 1).toString()) === -1) {
      regionsLoaded.push(region[0].toString() + ',' + (region[1] + 1).toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // 'snakes:', snakes.children.length);
      spawnRegion(region[0], region[1] + 1);
    }
  }
}
  // ======================== Cleanup ========================= //


function deepClean() {
  console.log("Before: ", land.children.length);
  for (var i=0; i<land.children.length; i++) {
    if (Math.floor(land.children[i].y / 25 / 64) <= region[1] - 2) {
      land.children[i].destroy();
    }
  }
  // land.forEach(function(piece) {
  //   // If the piece is in 2 regions above, destroy it.
  //   if (Math.floor(piece.y / 25 / 64) <= region[1] - 2) {
  //     piece.destroy();
  //   }
  // })
  console.log("After: ", land.children.length);
  // Clean out regions from the regionsLoaded list
  // Unfortunately, for performance, we must assume the region is unloaded.
  for (var i=0; i<regionsLoaded.length; i++) {
    if (regionsLoaded[i].split(',')[1] <= region[1] - 2) {
      console.log("region removed: ", regionsLoaded[i]);
      regionsLoaded.splice(i, 1);
    }
  }
}
