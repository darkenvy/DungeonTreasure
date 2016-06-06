// Need to replace star destruction
  // Destroy stars if traveling too fast
  // for (var i=0; i< stars.children.length; i++) {
  //   if (stars.children[i].body.velocity.y > 200) {
  //     stars.children[i].destroy();
  //   }
  // }

function regionManagement() {
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
      starNum = Math.floor(starNum * 10);

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
        // star.body.gravity.y = 300;
        // star.body.bounce.y = 0.7 + Math.random() * 0.2;
      }
    }
  }

}


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
