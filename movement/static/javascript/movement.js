/*global setInterval,clearInterval,setTimeout */
(function (window, document, $) {
  var $canvas = $('#canvas');
  var canvas = $canvas[0];
  var $window = $(window);

  // Grab the drawing variables
  var ctx = canvas.getContext('2d');
  var w = $canvas.width();
  var h = $canvas.height();

  // Game attributes
  var d; // direction
  var cw = 10; // cell width

  // Lets define some walls to block movement.
  // Walls are defined as rectangles.  The `posn` attributes gives
  // us the top left corner.  From there we specify number of blocks
  // that it stretches horizontally.
  var walls = [
    {
      posn: {
        x: (((w / cw) / 2) - 5), // center horizontally
        y: ((h / cw) / 2 - 1) // center vertically
      },
      length: 10
    }
  ];

  // Game variables
  var gameLoop = undefined;
  var pacman = undefined;
  var acknowledgeKeys = true;

  function init() {
    d = 'right'; // default direction
    acknowledgeKeys = true;
    pacman = { x: 0, y: 0 };

    if (typeof gameLoop !== 'undefined') {
      clearInterval(gameLoop);
    }
    gameLoop = setInterval(repaint, 60 /* 60 ms */);
  }

  function repaint() {
    if (typeof gameLoop == 'undefined') {
      return;
    }

    var nx = pacman.x;
    var ny = pacman.y;
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

    // Check for collision with a wall
    walls.forEach(function(block) {
      var posn = {
        x: block.posn.x,
        y: block.posn.y
      };
      for (var i = 0; i < block.length; i++) {
        if (posn.x == nx && posn.y == ny) {
          nx = pacman.x;
          ny = pacman.y;
          break;
        }
        posn.x += 1;
      }
    });

    // We need to repaint the background on every update.
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    // Check if we've moved off the board's boundaries, in which case
    // we want to redraw on the opposite side of the board
    var tail = { x: nx, y: ny };
    var maxX = (w - cw) / cw;
    var maxY = (h - cw) / cw;
    if (tail.x < 0) { // Off screen on the left
      tail.x = maxX;
    } else if (tail.x > maxX) { // Off screen on the right
      tail.x = 0;
    } else if (tail.y < 0) { // Off screen moving up
      tail.y = maxY;
    } else if (tail.y > maxY) { // Off screne moving down
      tail.y = 0;
    }

    // Redraw the walls
    walls.forEach(function(block) {
      var posn = {
        x: block.posn.x,
        y: block.posn.y
      };
      for (var i = 0; i < block.length; i++) {
        paintCell(posn, 'blue', 'blue');
        posn.x += 1;
      }
    });

    // Redraw pacman
    pacman = tail;
    paintCell(pacman, 'white', 'white');

    acknowledgeKeys = true;
  }

  function paintCell(obj, fillColour, strokeColour) {
    ctx.fillStyle = fillColour;
    ctx.fillRect(obj.x * cw, obj.y * cw, cw, cw);
    ctx.strokeStyle = strokeColour;
    ctx.strokeRect(obj.x * cw, obj.y * cw, cw, cw);
  }

  $(document).keydown(function(e) {
    var key = e.keyCode || e.which;
    if (acknowledgeKeys) {
      if (key == '37' || key == '65') { // left
        d = 'left';
        acknowledgeKeys = false;
      } else if (key == '38' || key == '87') { // up
        d = 'up';
        acknowledgeKeys = false;
      } else if (key == '39' || key == '68') { // right
        d = 'right';
        acknowledgeKeys = false;
      } else if (key == '40' || key == '83') { // down
        d = 'down';
        acknowledgeKeys = false;
      }
    }

    if (key == '32') {
      init();
    }
  });

  init();
})(window, document || window.document, window.$ || window.jQuery);
