// Need to replace star destruction

function spawnRegion(regionX, regionY) {
  // Perlin noise returns a float between 0-1.
  var pn = new Perlin('Reno');
  for (var y = 0; y < 25; y++) {
    for (var x = 0; x < 25; x++) {
      var offsetX = (regionX * 25) + x;
      var offsetY = (regionY * 25) + y;
      // Call Perlin noise and pass in offset coords
      cellNum = pn.noise(offsetX / 4, offsetY / 4, 0);
      rockType = pn.noise(offsetX / 30, offsetY / 30, 0.25);
      starNum = pn.noise(offsetX / 4, offsetY / 4, 0.5);
      snakeNum = pn.noise(offsetX / 4, offsetY / 4, 0.5);
      // Perlin maps to float between 0-1, multiply to get range 0-5
      cellNum = Math.floor(cellNum * 6);
      rockType = Math.floor(rockType * 3);
      starNum = Math.floor(starNum * 8);
      snakeNum = Math.floor(snakeNum * 8);

      // offsetY > 4 is for the first tile of the game. So he is not undeground
      if (cellNum !== 3 && cellNum !== 4 && offsetY > 4) {
        // Different states of land, mapped out via the Perlin noise
        if (cellNum === 1 && offsetY !== 4) {
          ground = land.create(offsetX * 64, offsetY * 64, 'darkEarth');
        } else if (offsetY === 5) {
          ground = land.create(offsetX * 64, offsetY * 64, 'earthgrass');
        } else if (rockType === 1 && player.y <= 32000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'paleEarth');
        } else if (rockType === 2 && player.y <= 32000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'greyEarth');
        } else if (rockType > 0 && player.y > 64000) {
          // Hell Depth
          ground = land.create(offsetX * 64, offsetY * 64, 'hellEarth2');
        } else if (player.y > 32000) {
          ground = land.create(offsetX * 64, offsetY * 64, 'hellEarth');
        } else {
          ground = land.create(offsetX * 64, offsetY * 64, 'earth'); // Regular land
        }
        ground.body.immovable = true;
      }
      // Create background tiles
      if ((cellNum === 3 || cellNum === 4) && offsetY > 4) {
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
      if (cellNum === 3 && snakeNum === 1 && offsetY > 4) {
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
         // x'snakes:', snakes.children.length);
      spawnRegion(region[0] - 1, region[1]);
    }
  }
  if ((player.x % 1600) > 700) {
    // If the next region (left) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf((region[0] + 1).toString() + ',' + region[1].toString()) === -1) {
      regionsLoaded.push((region[0] + 1).toString() + ',' + region[1].toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // x'snakes:', snakes.children.length);
      spawnRegion(region[0] + 1, region[1]);
    }
  }

  if ((player.y % 1600) < 100) {
    // If the next region (upwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1] - 1).toString()) === -1) {
      regionsLoaded.push(region[0].toString() + ',' + (region[1] - 1).toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // x'snakes:', snakes.children.length);
      spawnRegion(region[0], region[1] - 1);
    }
  }
  if ((player.y % 1600) > 700) {
    // If the next region (downwards) is not inside 'regionsLoaded' then load and add to list
    if (regionsLoaded.indexOf(region[0].toString() + ',' + (region[1] + 1).toString()) === -1) {
      regionsLoaded.push(region[0].toString() + ',' + (region[1] + 1).toString());
      // console.log(regionsLoaded, regionsLoaded.length, land.children.length,
         // x'snakes:', snakes.children.length);
      spawnRegion(region[0], region[1] + 1);
    }
  }

  // ======================== Cleanup ========================= //
  // Destroy pieces if too far. Since levels are infinite, cleanup is needed.
  // This procedure only removes pieces in a perimeter around the player.
  // I think there is a leak as over time the game gets slower & more chunks loaded.
  land.forEach(function(piece) {
    if (Math.floor(piece.x / 1600) === region[0] - 2) {
      removeRegionLoaded(region[0] - 2, 0);
      piece.destroy();
    }
    if (Math.floor(piece.x / 1600) === region[0] + 2) {
      removeRegionLoaded(region[0] + 2, 0);
      piece.destroy();
    }
    if (Math.floor(piece.y / 1600) === region[1] - 2) {
      removeRegionLoaded(region[1] - 2, 1);
      piece.destroy();
    }
    if (Math.floor(piece.y / 1600) === region[1] + 2) {
      removeRegionLoaded(region[1] + 2, 1);
      piece.destroy();
    }
  });
}

function removeRegionLoaded(region, selector) {
  // console.log("destroyed");
  for (var i = 0; i < regionsLoaded.length; i++) {
    if (regionsLoaded[i].split(',')[selector] === region) {
      regionsLoaded.splice(i, 1);
      // console.log(land.length);
      // console.log(regionsLoaded, i);
    }
  }
}


// function deepCleanse() {
//   regionsLoaded.forEach(function(regPair) {
//     // If the player is 3 chunks away (vertically) than a loaded chunk, unload it
//     if ((regionsLoaded[i].split(',')[1] * 25 * 64) + player.y > 4800 ) {

//     }
//   })
// }
