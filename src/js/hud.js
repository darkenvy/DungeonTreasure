function hud() {
  // Move the health and Counter with camera
  scoreText.x = game.camera.x + 50;
  scoreText.y = game.camera.y + 500;
  // healthText.x = game.camera.x + 50;
  // healthText.y = game.camera.y + 30;
  // timerText.x = game.camera.x + 400;
  // timerText.y = game.camera.y + 30;
  // depthText.x = game.camera.x + 650;
  // depthText.y = game.camera.y + 30;
  depth = Math.floor(player.y / 64) - 4;
  // depthText.text = "Depth [ " + depth + "m ]";
  score = depth + (totalCollects * 20) - (totalHurts * 20);
  scoreText.text = 'Score: ' + score;

  vignette.x = game.camera.x - 25; // 25 pixels on each side for overscan
  vignette.y = game.camera.y - 25;
  blackness.x = game.camera.x - 25; // 25 pixels on each side for overscan
  blackness.y = game.camera.y - 25;
  blackness.alpha = 0;
  // Vignette flicker
  if ((vignette.alpha <= currBlackness) && timer <= 180) {
    vignette.alpha += 0.005;
  } else {
    vignette.alpha -= (Math.random() / 10);
  }
  // Blackness & Vignette darkening
  if (timer <= 180 && timer > 0) {
    vignette.alpha = 1 - (timer / 180);
    if (timer <= 10) {
      blackness.alpha = 1 - (timer / 10);
    }
  }


}
