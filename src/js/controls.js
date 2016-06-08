function controls() {
  // Controls
  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
    player.body.velocity.x = -200;

    if (facing !== 'left') {
      player.animations.play('left');
      facing = 'left';
    }
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 200;

    if (facing !== 'right') {
      player.animations.play('right');
      facing = 'right';
    }
  } else {
    if (facing !== 'idle') {
      player.animations.stop();

      if (facing === 'left') {
        player.frame = 0;
      } else {
        player.frame = 5;
      }

      facing = 'idle';
    }
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -450;
  }

  if (cursors.down.isDown && bombs.children.length === 0 && timer > 5) {
    timer -= 5;

    var bomb = bombs.create(Math.floor(player.x / 64) * 64,
      (Math.floor(player.y / 64) * 64) - 50, 'bomb');
    bomb.smooth = false;
    bomb.scale.x = 2;
    bomb.scale.y = 2;
    bomb.animations.add('lit', [0, 1, 2, 3, 4, 5, 6], 5, false);
    bomb.animations.add('explode', [7, 8, 9, 10, 11, 12], 10, false);
    bomb.play('lit');
    // player.body.velocity.y = -450;
  }

  // Jetpack activate
  if (jetButton.isDown && timer > 1) {
    if (player.body.velocity.y > -200) {
      jetVelocity = player.body.velocity.y - 50;
      player.body.velocity.y = jetVelocity;
      timer -= 0.3;
      // timer = (Math.floor(timer * 10))/10;
      // timerText.text = timer;
    }
  }
}
