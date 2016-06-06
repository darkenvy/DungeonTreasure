
function init() {
  game.load.spritesheet('snake', 'img/snake2.png', 64, 64);
}

function create() {
  snakes = game.add.group();
    snakes.enableBody = true;
    for (var i = 0; i < 12; i++)
    {
        //  Create a snake inside of the 'snakes' group
        var snake = snakes.create(i * 70, 0, 'snake');

        //  Let gravity do its thing
        snake.body.gravity.y = 300;

        //  This just gives each snake a slightly random bounce value
        snake.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
}


function update() {
  game.physics.arcade.collide(snakes, land);
}