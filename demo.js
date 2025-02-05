//var various = null;
var aishah = null;
var hafsah54 = null;
var ramlah59 = null;
var umsalamah56 = null;
var safiyyah2802 = null;
var amrah11455 = null;
var fatimah10526 = null;
var hafsah11039 = null;
var asma69 = null;
var asma70 = null;
var asma84 = null;
var khayrah10737 = null;
var nusaybah71 = null;
var umdarda11457 = null;
var recenter = null;

var allNodes = null; //12/5/22
var allEdges = null; //3/13/23
var allEles = null; //12/5/22

$(function () {

  var layoutPadding = 50;
  var aniDur = 500;
  var easing = 'linear';

  var cy; // var cy = null; worked too



  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({ // ayah: graphP would be the default graph, the initial one passed into the initCy function that users see when they first get to the page
    url: 'data/aishah_53.json',
    type: 'GET',
    dataType: 'json'
  });

/*   variousgraph = $.ajax({
    url: 'data/various.json',
    type: 'GET',
    dataType: 'json'
  }); */

  aishahgraph = $.ajax({ 
    url: 'data/aishah_53.json',
    type: 'GET',
    dataType: 'json'
  });

  hafsah54graph = $.ajax({ //ayah testing
    url: 'data/hafsah_54.json',
    type: 'GET',
    dataType: 'json'
  });

  umsalamah56graph = $.ajax({ //ayah testing
    url: 'data/umsalamah_56.json',
    type: 'GET',
    dataType: 'json'
  });

  ramlah59graph = $.ajax({ //ayah testing
    url: 'data/ramlah_59.json',
    type: 'GET',
    dataType: 'json'
  });

  safiyyah2802graph = $.ajax({ //ayah testing
    url: 'data/safiyyah_2802.json',
    type: 'GET',
    dataType: 'json'
  });

  umdarda11457graph = $.ajax({ //ayah testing
    url: 'data/umdarda_11457.json',
    type: 'GET',
    dataType: 'json'
  });

  nusaybah71graph = $.ajax({ //ayah testing
    url: 'data/nusaybah_71.json',
    type: 'GET',
    dataType: 'json'
  });

  khayrah10737graph = $.ajax({ //ayah testing
    url: 'data/khayrah_10737.json',
    type: 'GET',
    dataType: 'json'
  });

  amrah11455graph = $.ajax({ //ayah testing
    url: 'data/amrah_11455.json',
    type: 'GET',
    dataType: 'json'
  });

  fatimah10526graph = $.ajax({ //ayah testing
    url: 'data/fatimah_10526.json',
    type: 'GET',
    dataType: 'json'
  });

  hafsah11039graph = $.ajax({ //ayah testing
    url: 'data/hafsah_11039.json',
    type: 'GET',
    dataType: 'json'
  });

  asma69graph = $.ajax({ //ayah testing
    url: 'data/asma_69.json',
    type: 'GET',
    dataType: 'json'
  });

  asma70graph = $.ajax({ //ayah testing
    url: 'data/asma_70.json',
    type: 'GET',
    dataType: 'json'
  });

  asma84graph = $.ajax({ //ayah testing
    url: 'data/asma_84.json',
    type: 'GET',
    dataType: 'json'
  });
  // also get style via ajax
  var styleP = $.ajax({
    url: './style.json',//3/14/23'./style.cycss', 
    type: 'GET',
    dataType: 'json'//3/14'text'
  });


  var NodeInfoTemplate = Handlebars.compile($('#node-info').html());
  var EdgeInfoTemplate = Handlebars.compile($('#edge-info').html()); //3/27

  // when both graph export json and style loaded, init cy
  Promise.all([graphP, styleP]).then(initCy);



//12/5  var allNodes = null;
//12/5  var allEles = null;
  var lastHighlighted = null;
  var lastUnhighlighted = null;

  function getFadePromise(ele, opacity) {
    return ele.animation({
      style: { 'opacity': opacity },
      duration: aniDur
    }).play().promise();
  };

  var restoreElesPositions = function (nhood) {
    return Promise.all(nhood.map(function (ele) {
      var p = ele.data('orgPos');

      return ele.animation({
        position: { x: p.x, y: p.y },
        duration: aniDur,
        easing: easing
      }).play().promise();
    }));
  };

  function highlight(node) {
    var oldNhood = lastHighlighted;

    var nhood = lastHighlighted = node.closedNeighborhood();
    var others = lastUnhighlighted = cy.elements().not(nhood);

    var reset = function () {
      cy.batch(function () {
        others.addClass('hidden');
        nhood.removeClass('hidden');

        allEles.removeClass('faded highlighted');

        nhood.addClass('highlighted');

        others.nodes().forEach(function (n) {
          var p = n.data('orgPos');

          n.position({ x: p.x, y: p.y });
        });
      });

      return Promise.resolve().then(function () {
        if (isDirty()) {
          return fit();
        } else {
          return Promise.resolve();
        };
      }).then(function () {
        return Promise.delay(aniDur);
      });
    };

    var runLayout = function () {
      var p = node.data('orgPos');

      var l = nhood.filter(':visible').makeLayout({
        name: 'concentric',
        fit: false,
        animate: true,
        animationDuration: aniDur,
        animationEasing: easing,
        boundingBox: {
          x1: p.x - 1,
          x2: p.x + 1,
          y1: p.y - 1,
          y2: p.y + 1
        },
        avoidOverlap: true,
        concentric: function (ele) {
          if (ele.same(node)) {
            return 2;
          } else {
            return 1;
          }
        },
        levelWidth: function () { return 1; },
        padding: layoutPadding
      });

      var promise = cy.promiseOn('layoutstop');

      l.run();

      return promise;
    };

    var fit = function () {
      return cy.animation({
        fit: {
          eles: nhood.filter(':visible'),
          padding: layoutPadding
        },
        easing: easing,
        duration: aniDur
      }).play().promise();
    };

    var showOthersFaded = function () {
      return Promise.delay(250).then(function () {
        cy.batch(function () {
          others.removeClass('hidden').addClass('faded');
        });
      });
    };

    return Promise.resolve()
      .then(reset)
      .then(runLayout)
      .then(fit)
      .then(showOthersFaded)
      ;

  }

  function isDirty() {
    return lastHighlighted != null;
  }

  function clear(opts) {
    if (!isDirty()) { return Promise.resolve(); }

    opts = $.extend({

    }, opts);

    cy.stop();
    allNodes.stop();

    var nhood = lastHighlighted;
    var others = lastUnhighlighted;

    lastHighlighted = lastUnhighlighted = null;

    var hideOthers = function () {
      return Promise.delay(125).then(function () {
        others.addClass('hidden');

        return Promise.delay(125);
      });
    };

    var showOthers = function () {
      cy.batch(function () {
        allEles.removeClass('hidden').removeClass('faded');
      });

      return Promise.delay(aniDur);
    };

    var restorePositions = function () {
      cy.batch(function () {
        others.nodes().forEach(function (n) {
          var p = n.data('orgPos');

          n.position({ x: p.x, y: p.y });
        });
      });

      return restoreElesPositions(nhood.nodes());
    };

    var resetHighlight = function () {
      nhood.removeClass('highlighted');
    };

    return Promise.resolve()
      .then(resetHighlight)
      .then(hideOthers)
      .then(restorePositions)
      .then(showOthers)
      ;
  }

  function showNodeInfo(node) {
    $('#info').html(NodeInfoTemplate(node.data())).show();
  }

  function hideNodeInfo() {
    $('#info').hide();
  }

  //3/27
  function showEdgeInfo(edge) {
    $('#info').html(EdgeInfoTemplate(edge.data())).show();
  }

  function hideEdgeInfo() {
    $('#info').hide();
  }

  function initCy(then) {
    var loading = document.getElementById('loading');

    // ayah
    // initialize variables with graph data if they haven't yet been initialized
    // this allows various to still store the graph in the dropdown function
    /*if (various == null) {
      various = variousgraph['responseJSON'];
    } */
    if (aishah == null) {
      aishah = aishahgraph['responseJSON'];
    }
    if (hafsah54 == null) {
      hafsah54 = hafsah54graph['responseJSON'];
    } 
    if (umsalamah56 == null) {
      umsalamah56 = umsalamah56graph['responseJSON'];
    }
    if (ramlah59 == null) {
      ramlah59 = ramlah59graph['responseJSON'];
    }
    if (safiyyah2802 == null) {
      safiyyah2802 = safiyyah2802graph['responseJSON'];
    }
    if (umdarda11457 == null) {
      umdarda11457 = umdarda11457graph['responseJSON'];
    }
    if (nusaybah71 == null) {
      nusaybah71 = nusaybah71graph['responseJSON'];
    }
    if (khayrah10737 == null) {
      khayrah10737 = khayrah10737graph['responseJSON'];
    }
    if (amrah11455 == null) {
      amrah11455 = amrah11455graph['responseJSON'];
    }
    if (fatimah10526 == null) {
      fatimah10526 = fatimah10526graph['responseJSON'];
    }
    if (hafsah11039 == null) {
      hafsah11039 = hafsah11039graph['responseJSON'];
    }
    if (asma69 == null) {
      asma69 = asma69graph['responseJSON'];
    }
    if (asma70 == null) {
      asma70 = asma70graph['responseJSON'];
    }
    if (asma84 == null) {
      asma84 = asma84graph['responseJSON'];
    }

    var expJson = then[0];
    var styleJson = then[1];
    var elements = expJson.elements;


  elements.nodes.forEach(function (n) {
      n.data.orgPos = {
        x: n.position.x,
        y: n.position.y
      };
    }); 


    loading.classList.add('loaded');

    cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: { name: 'preset', padding: layoutPadding },
      style: styleJson,
      elements: elements,
      motionBlur: true,
      selectionType: 'single',
      boxSelectionEnabled: false,
      autoungrabify: true
    });

    allNodes = cy.nodes();
    //03/13/23
    //console.log(allNodes.selectable());//3/13
    allEles = cy.elements();
    //console.log(allEles.selectable());//3/13
    allEdges = cy.edges(); //3/13/23
    //console.log(allEdges.selectable());//3/13

    cy.on('free', 'node', function (e) {
      var n = e.cyTarget;
      var p = n.position();

      n.data('orgPos', {
        x: p.x,
        y: p.y
      });
    });

    cy.on('tap', function () {
      $('#search').blur();
    });

    cy.on('select unselect', 'node', _.debounce(function (e) {
      var node = cy.$('node:selected');

      if (node.nonempty()) {
        showNodeInfo(node);

        Promise.resolve().then(function () {
          return highlight(node);
        });
      } else {
        hideNodeInfo();
        clear();
      }

    }, 100));

    //3/13/23 this doesn't do anything :/
    //3/14/23 this does something! :) 
    cy.on('select unselect', 'edge', _.debounce(function (e) {
      var edge = cy.$('edge:selected');
      //console.log(edge.selectable());

      //3/27/23
      if (edge.nonempty()) {
        showEdgeInfo(edge);
      } else {
        hideEdgeInfo();
        clear();
      }

    }, 100));

 
  }

  var lastSearch = '';

  $('#search').typeahead({
    minLength: 2,
    highlight: true,
  },
    {
      name: 'search-dataset',
      source: function (query, cb) {
        function matches(str, q) {
          str = (str || '').toLowerCase();
          q = (q || '').toLowerCase();

          return str.match(q);
        }

        var fields = ['fullname', 'displayname', 'searchname']; //aea

        function anyFieldMatches(n) {
          for (var i = 0; i < fields.length; i++) {
            var f = fields[i];

            if (matches(n.data(f), query)) {
              return true;
            }
          }

          return false;
        }

        function getData(n) {
          var data = n.data();

          return data;
        }

        function sortByName(n1, n2) {
          if (n1.data('name') < n2.data('name')) {
            return -1;
          } else if (n1.data('name') > n2.data('name')) {
            return 1;
          }

          return 0;
        }

        var res = allNodes.stdFilter(anyFieldMatches).sort(sortByName).map(getData);

        cb(res);
      },
      templates: {
        suggestion: NodeInfoTemplate
      }
    }).on('typeahead:selected', function (e, entry, dataset) {
      var n = cy.getElementById(entry.id);

      cy.batch(function () {
        allNodes.unselect();

        n.select();
      });

      showNodeInfo(n);
    }).on('keydown keypress keyup change', _.debounce(function (e) {
      var thisSearch = $('#search').val();

      if (thisSearch !== lastSearch) {
        $('.tt-dropdown-menu').scrollTop(0);

        lastSearch = thisSearch;
      }
    }, 50));

//12/1/22
recenter = function () {
if (isDirty()) {
  clear(); // clear() checks isDirty anyway so the if statement here might be redundant
} else { 
 
  allNodes = cy.nodes(); // this line is the only difference from the function for #reset
  allNodes.unselect();

  hideNodeInfo();

  cy.stop();

  cy.animation({
    fit: {
      eles: cy.elements(),
      padding: layoutPadding
    },
    duration: aniDur,
    easing: easing
  }).play();
}
};

  $('#reset').on('click', function () {
    if (isDirty()) {
      clear();
    } else {
      allNodes.unselect();

      hideNodeInfo();

      cy.stop();

      cy.animation({
        fit: {
          eles: cy.elements(),
          padding: layoutPadding
        },
        duration: aniDur,
        easing: easing
      }).play();
    }
  });

  $('#filters').on('click', 'input', function () {
    /* ayah commented var soft = $('#soft').is(':checked');
      var semiSoft = $('#semi-soft').is(':checked');
      var na = $('#na').is(':checked');
      var semiHard = $('#semi-hard').is(':checked');
      var hard = $('#hard').is(':checked');
  
      var red = $('#red').is(':checked');
      var white = $('#white').is(':checked');
      var cider = $('#cider').is(':checked');
  
      var england = $('#chs-en').is(':checked');
      var france = $('#chs-fr').is(':checked');
      var italy = $('#chs-it').is(':checked');
      var usa = $('#chs-usa').is(':checked');
      var spain = $('#chs-es').is(':checked');
      var switzerland = $('#chs-ch').is(':checked');
      var euro = $('#chs-euro').is(':checked');
      var newWorld = $('#chs-nworld').is(':checked');
      var naCountry = $('#chs-na').is(':checked');
  */
    var male = $('#male').is(':checked');
    var female = $('#female').is(':checked');
    cy.batch(function () {

      allNodes.forEach(function (n) {

        //        var type = n.data('NodeType'); ayah


        //ayah:
        var gender = n.data('gender');

        // not ayah:
        n.removeClass('filtered');

        var filter = function () {
          n.addClass('filtered');
        };

        // ayah:
        if (gender === 'male') {
          if (!male) { filter(); }
        } else if (gender === 'female') {
          if (!female) { filter(); }
        }
      });

    });

  });

  $('#filter').qtip({
    position: {
      my: 'top center',
      at: 'bottom center',
      adjust: {
        method: 'shift'
      },
      viewport: true
    },

    show: {
      event: 'click'
    },

    hide: {
      event: 'unfocus'
    },

    style: {
      classes: 'qtip-bootstrap qtip-filters',
      tip: {
        width: 16,
        height: 8
      }
    },

    content: $('#filters')
  });
 
  // ayah
  $('#graph-dropdown').qtip({
    position: {
      my: 'top center',
      at: 'bottom center',
      adjust: {
        method: 'shift'
      },
      viewport: true
    },

    show: {
      event: 'click'
    },

    hide: {
      event: 'unfocus'
    },

    style: {
      classes: 'qtip-bootstrap qtip-filters',
      tip: {
        width: 16,
        height: 8
      }
    },

    content: $('#dropdown-content')
  });
  // not ayah
  $('#about').qtip({
    position: {
      my: 'bottom center',
      at: 'top center',
      adjust: {
        method: 'shift'
      },
      viewport: true
    },

    show: {
      event: 'click'
    },

    hide: {
      event: 'unfocus'
    },

    style: {
      classes: 'qtip-bootstrap qtip-about',
      tip: {
        width: 16,
        height: 8
      }
    },

    content: $('#about-content')
  });
});

//12/1/22
function elementsetup(el) {
  el.nodes.forEach(function (n) {

    n.data.orgPos = {
      x: n.position.x,
      y: n.position.y
    };
  });
} 
 //12/1/22 
 function changeGraph() {
  var nargraphs = document.getElementById("dropdown-list");
  var selectednarrator = nargraphs.options[nargraphs.selectedIndex].value;
  if (selectednarrator == "aishah_53") {
    elementsetup(aishah.elements);
    cy.json({ elements: aishah.elements });
    allNodes = cy.nodes(); //12/5/22
    allEdges = cy.edges(); //3/13/23
    allEles = cy.elements(); //12/5/22
    recenter();
  } /*else if (selectednarrator == "various") {
    elementsetup(various.elements);
    cy.json({ elements: various.elements });
    allNodes = cy.nodes(); //12/5/22
    allEdges = cy.edges(); //3/13/23
    allEles = cy.elements(); //12/5/22
    recenter();
    
  }*/ else if (selectednarrator == "hafsah54") {
    elementsetup(hafsah54.elements);
    cy.json({ elements: hafsah54.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "umsalamah56") {
    elementsetup(umsalamah56.elements);
    cy.json({ elements: umsalamah56.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "ramlah59") {
    elementsetup(ramlah59.elements);
    cy.json({ elements: ramlah59.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "safiyyah2802") {
    elementsetup(safiyyah2802.elements);
    cy.json({ elements: safiyyah2802.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "umdarda11457") {
    elementsetup(umdarda11457.elements);
    cy.json({ elements: umdarda11457.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "nusaybah71") {
    elementsetup(nusaybah71.elements);
    cy.json({ elements: nusaybah71.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "khayrah10737") {
    elementsetup(khayrah10737.elements);
    cy.json({ elements: khayrah10737.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "amrah11455") {
    elementsetup(amrah11455.elements);
    cy.json({ elements: amrah11455.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "fatimah10526") {
    elementsetup(fatimah10526.elements);
    cy.json({ elements: fatimah10526.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "hafsah11039") {
    elementsetup(hafsah11039.elements);
    cy.json({ elements: hafsah11039.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "asma69") {
    elementsetup(asma69.elements);
    cy.json({ elements: asma69.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "asma70") {
    elementsetup(asma70.elements);
    cy.json({ elements: asma70.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  } else if (selectednarrator == "asma84") {
    elementsetup(asma84.elements);
    cy.json({ elements: asma84.elements });
    allNodes = cy.nodes(); 
    allEdges = cy.edges(); 
    allEles = cy.elements();
    recenter();
    
  }
  } 