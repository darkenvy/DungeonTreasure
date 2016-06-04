$(document).ready(function() {
  // Declare htmlStr, it will be injected into .container
  htmlStr = '';

  // cycle through a 10x10 grid of Perlin noise and construct html according to results
  // Perlin noise returns a float 0-1.
  var pn = new Perlin(Math.random());
  for (var y=0; y<30; y++) {
    for (var x=0; x<30; x++) {
      cellNum = Math.floor(pn.noise(x/10, y/10, 0) * 6);
      constructor = '<div class="c' + cellNum + '">' + cellNum + '</div>';
      htmlStr += constructor;
    }
  }

  // Inject the html that was constructed
  $('.container').append(htmlStr);



})
