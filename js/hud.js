function hud() {
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
  // Vignette flicker
  if (vignette.alpha <= 0.8) {
    vignette.alpha += 0.005;
  } else {
    vignette.alpha = 0.7 + (Math.random()/10)
  }
}
