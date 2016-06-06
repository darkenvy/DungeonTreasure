function controls() {
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
      // console.log(jetVelocity);
      // player.body.velocity.y = -200;
      player.body.velocity.y = jetVelocity ;

    }
  }
}
