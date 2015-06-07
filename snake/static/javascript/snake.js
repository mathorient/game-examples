/*global setInterval,clearInterval,setTimeout */
(function (window, document, $) {
  // Setup the canvas
  var $canvas = $('#canvas');
  var canvas = $canvas[0];
  var ctx = canvas.getContext('2d');
  var w = $canvas.width();
  var h = $canvas.height();

  var cw = 10; // cell width
  var d; // direction
  var food;
  var score;

  var snakeArray = []; // array of cells for the snake
  var grid = []; // grid of points on the canvas
  var gameLoop = undefined;
  var acknowledgeKeys = true;

  function init() {
    d = 'right'; // default direction
    score = 0;
    acknowledgeKeys = true;

    createSnake();
    createGrid();
    createFood();

    if (typeof gameLoop !== 'undefined') {
      clearInterval(gameLoop);
    }
    gameLoop = setInterval(repaint, 60 /* 60 ms */);
  }

  function deinit() {
    clearInterval(gameLoop);
    gameLoop = undefined;
    grid = [];
    snakeArray = [];
    score = 0;
    food = undefined;
    acknowledgeKeys = true;
  }

  function createGrid() {
    for (var x = 0; x < (w - cw) / cw; x++) {
      for (var y = 0; y < (h - cw) / cw; y++) {
        grid.push({ x: x, y: y });
      }
    }
  }

  function createSnake() {
    for (var i = 4; i >= 0; i--) {
      snakeArray.push({ x: i, y: 0 });
    }
  }

  function fisherYates(sourceArray) {
    var array = sourceArray.slice();
    var currentIndex = array.length;
    var temp, rand;

    // While theer are still elements to shuffle
    while (currentIndex !== 0) {
      // Pick an element
      rand = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // Swap it with the current element
      temp = array[currentIndex];
      array[currentIndex] = array[rand];
      array[rand] = temp;
    }
    return array;
  }

  function createFood() {
    if (grid.length == 0) {
      food = null;
      return;
    }

    // Reshuffle our grid to choose the next location
    grid = fisherYates(grid);

    // Make sure we only choose a cell for the food that does not
    // collide with the snake.  If we can't, then we've actually beaten
    // the game.
    var length = grid.length;
    var array = grid.slice();
    var item = array.pop();
    while (length && checkCollision(item.x, item.y, snakeArray)) {
      length--;
      item = array.pop();
    }

    if (length == 0) {
      // No more cells
      grid = [];
    } else {
      food = item;
    }
  }

  function repaint() {
    if (typeof gameLoop === 'undefined') {
      return;
    }

    // We remove the last item in the snakeArray, and draw
    // the front item in the snakeArray
    var nx = snakeArray[0].x;
    var ny = snakeArray[0].y;
    switch(d) {
      case 'right':
        nx++;
        break;
      case 'left':
        nx--;
        break;
      case 'up':
        ny--;
        break;
      default:
        ny++;
    }

    // Check for collision against the boundaries are against the body
    // of the snake itself.
    if (nx == -1 || nx == w / cw || ny == -1 || ny == h / cw ||
        checkCollision(nx, ny, snakeArray)) {
      deinit();
      return;
    }

    // We need to repaint the background on every update.
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, w, h);

    // Check if the snake is eating the food.  If so, draw the new head
    // instead of removing from the tail of the array.
    var tail;
    if (nx == food.x && ny == food.y) {
      tail = { x: nx, y: ny };
      score++;
      createFood();
    } else {
      tail = snakeArray.pop();
      tail.x = nx; tail.y = ny;
    }

    snakeArray.unshift(tail);

    for (var i = 0; i < snakeArray.length; i++) {
      var cell = snakeArray[i];
      paintCell(cell.x, cell.y);
    }

    // Paint the food onto the screen
    if (food) {
      paintCell(food.x, food.y);
    }

    // Update the score
    var scoreText = 'Score: ' + score;
    ctx.fillStyle = 'black';
    ctx.fillText(scoreText, 5, h - 5);

    if (grid.length == 0) {
      // The snake has covered the entire board, so we're done.
      deinit();
    }
    acknowledgeKeys = true;
  }

  function paintCell(x, y) {
    ctx.fillStyle = 'pink';
    ctx.fillRect(x * cw, y * cw, cw, cw);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * cw, y * cw, cw, cw);
  }

  function checkCollision(x, y, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].x == x && array[i].y == y) {
        return true;
      }
    }
    return false;
  }

  $(document).keydown(function(e) {
    var key = e.keyCode || e.which;
    // Prevent going reverse by checking the direction against
    // the key.
    if ((key == '37' || key == '65') && d != 'right' && acknowledgeKeys) {
      d = 'left';
      acknowledgeKeys = false;
    } else if ((key == '38' || key == '87') && d != 'down' && acknowledgeKeys) {
      d = 'up';
      acknowledgeKeys = false;
    } else if ((key == '39' || key == '68') && d != 'left' && acknowledgeKeys) {
      d = 'right';
      acknowledgeKeys = false;
    } else if ((key == '40' || key == '83') && d != 'up' && acknowledgeKeys) {
      d = 'down';
      acknowledgeKeys = false;
    } else if (key == '32') {
      if (typeof gameLoop !== 'undefined') {
        deinit();
      }
      init();
    }
  });

  init();  
})(window, document || window.document, window.$ || window.jQuery);
