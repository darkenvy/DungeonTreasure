$(document).ready(function() {
  perlinHTML();

  // Zooom Buttons
  $('#zOut').click(function() {
    if (zoom > 2.5) {
      zoom -= 0.5;
      // Helps center zoom panning
      lrPan = lrPan - zoom/5;
      udPan = udPan - zoom/5;
      perlinHTML();
      console.log("zoom: ", zoom)
    }
  })
  $('#zIn').click(function() {
    if (zoom < 20) {
      zoom += 0.5;
      // Helps center zoom panning
      lrPan = lrPan + zoom/5;
      udPan = udPan + zoom/5;
      perlinHTML();
    }
  })

  // Left/Right Buttons
  $('#right').click(function() {
    lrPan += 1;
    perlinHTML();
  })
  $('#left').click(function() {
    lrPan -= 1;
    perlinHTML();
  })

  // up/down Buttons
  $('#up').click(function() {
    udPan -= 1;
    perlinHTML();
  })
  $('#down').click(function() {
    udPan += 1;
    perlinHTML();
  })

  // expand narrow buttons
  $('#expand').click(function() {
    expandB -= 0.01;
    expandT += 0.01;
    console.log("expand", expandB, expandT);
    perlinHTML();
  })
  $('#narrow').click(function() {
    expandB += 0.01;
    expandT -= 0.01;
    console.log("expand", expandB, expandT);
    perlinHTML();
  })

})

zoom = 10;
lrPan = 0;
udPan = 0;
expandB = 0.5;
expandT = 0.67;

function perlinHTML() {
  // Declare htmlStr, it will be injected into .container
  htmlStr = '';

  // cycle through a 10x10 grid of Perlin noise and construct html according to results
  // Perlin noise returns a float 0-1.
  var pn = new Perlin('Reno');
  for (var y=0; y<40; y++) {
    for (var x=0; x<40; x++) {
      cellNum = pn.noise((x + lrPan)/zoom, (y + udPan)/zoom, 0);

      if (cellNum >= expandB && cellNum < expandT) {
        cellNum = 3;
      }
      else {
        cellNum = Math.floor(cellNum * 6);
      }

      constructor = '<div class="c' + cellNum + '">' + cellNum +  '</div>';
      htmlStr += constructor;
      }
    }
  // Inject the html that was constructed
  $('.container').html(htmlStr);

}
