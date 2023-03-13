/* global Promise, fetch, window, cytoscape, document, tippy, _ */

Promise.all([
  fetch('cy-style.json')
    .then(function(res) {
      return res.json();
    }),
  fetch('data.json')
    .then(function(res) {
      return res.json();
    })
])
  .then(function(dataArray) {
    var h = function(tag, attrs, children){
      var el = document.createElement(tag);

      Object.keys(attrs).forEach(function(key){
        var val = attrs[key];

        el.setAttribute(key, val);
      });

      children.forEach(function(child){
        el.appendChild(child);
      });

      return el;
    };

    var t = function(text){
      var el = document.createTextNode(text);

      return el;
    };

    var $ = document.querySelector.bind(document);

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      style: dataArray[0],
      elements: dataArray[1],
      layout: { name: 'random' }
    });

    var params = {
      name: 'cola',
      nodeSpacing: 5,
      edgeLengthVal: 45,
      animate: true,
      randomize: false,
      maxSimulationTime: 1500
    };
    var layout = makeLayout();

    layout.run();

    var $btnParam = h('div', {
      'class': 'param'
    }, []);

    var $config = $('#config');

    $config.appendChild( $btnParam );

    var sliders = [
      {
        label: 'Edge length',
        param: 'edgeLengthVal',
        min: 1,
        max: 200
      },

      {
        label: 'Node spacing',
        param: 'nodeSpacing',
        min: 1,
        max: 50
      }
    ];

    var buttons = [
      {
        label: h('span', { 'class': 'fa fa-random' }, []),
        layoutOpts: {
          randomize: true,
          flow: null
        }
      },

      {
        label: h('span', { 'class': 'fa fa-long-arrow-down' }, []),
        layoutOpts: {
          flow: { axis: 'y', minSeparation: 30 }
        }
      }
    ];

    sliders.forEach( makeSlider );

    buttons.forEach( makeButton );

    function makeLayout( opts ){
      params.randomize = false;
      params.edgeLength = function(e){ return params.edgeLengthVal / e.data('weight'); };

      for( var i in opts ){
        params[i] = opts[i];
      }

      return cy.layout( params );
    }

    function makeSlider( opts ){
      var $input = h('input', {
        id: 'slider-'+opts.param,
        type: 'range',
        min: opts.min,
        max: opts.max,
        step: 1,
        value: params[ opts.param ],
        'class': 'slider'
      }, []);

      var $param = h('div', { 'class': 'param' }, []);

      var $label = h('label', { 'class': 'label label-default', for: 'slider-'+opts.param }, [ t(opts.label) ]);

      $param.appendChild( $label );
      $param.appendChild( $input );

      $config.appendChild( $param );

      var update = _.throttle(function(){
        params[ opts.param ] = $input.value;

        layout.stop();
        layout = makeLayout();
        layout.run();
      }, 1000/30);

      $input.addEventListener('input', update);
      $input.addEventListener('change', update);
    }

    function makeButton( opts ){
      var $button = h('button', { 'class': 'btn btn-default' }, [ opts.label ]);

      $btnParam.appendChild( $button );

      $button.addEventListener('click', function(){
        layout.stop();

        if( opts.fn ){ opts.fn(); }

        layout = makeLayout( opts.layoutOpts );
        layout.run();
      });
    }

    var makeTippy = function(node, html){
      return tippy( node.popperRef(), {
        html: html,
        trigger: 'manual',
        arrow: true,
        placement: 'bottom',
        hideOnClick: false,
        interactive: true
      } ).tooltips[0];
    };

    var hideTippy = function(node){
      var tippy = node.data('tippy');

      if(tippy != null){
        tippy.hide();
      }
    };

    var hideAllTippies = function(){
      cy.nodes().forEach(hideTippy);
    };

    cy.on('tap', function(e){
      if(e.target === cy){
        hideAllTippies();
      }
    });

    cy.on('tap', 'edge', function(e){
      hideAllTippies();
    });

    cy.on('zoom pan', function(e){
      hideAllTippies();
    });

    cy.nodes().forEach(function(n){
      var g = n.data('name');

      var $links = [
        {
          name: 'GeneCard',
          url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
        },
        {
          name: 'UniProt search',
          url: 'http://www.uniprot.org/uniprot/?query='+ g +'&fil=organism%3A%22Homo+sapiens+%28Human%29+%5B9606%5D%22&sort=score'
        },
        {
          name: 'GeneMANIA',
          url: 'http://genemania.org/search/human/' + g
        }
      ].map(function( link ){
        return h('a', { target: '_blank', href: link.url, 'class': 'tip-link' }, [ t(link.name) ]);
      });

      var tippy = makeTippy(n, h('div', {}, $links));

      n.data('tippy', tippy);

      n.on('click', function(e){
        tippy.show();

        cy.nodes().not(n).forEach(hideTippy);
      });
    });

    $('#config-toggle').addEventListener('click', function(){
      $('body').classList.toggle('config-closed');

      cy.resize();
    });

  });
```
var various = null;
var aishah = null;
//var switcher = true;
var recenter = null;

var allNodes = null; //12/5/22
var allEles = null; //12/5/22

$(function () {

  var layoutPadding = 50;
  var aniDur = 500;
  var easing = 'linear';

  var cy; // var cy = null; worked too



  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({ // ayah: graphP would be the default graph, the initial one passed into the initCy function that users see when they first get to the page
    // url: 'https://cdn.rawgit.com/maxkfranz/3d4d3c8eb808bd95bae7/raw', // wine-and-cheese.json
    url: 'data/aishah_53.json',
    type: 'GET',
    dataType: 'json'
  });

/*  ayah testingvar */ variousgraph = $.ajax({ //ayah testing
    url: 'data/various.json',
    type: 'GET',
    dataType: 'json'
  });

  aishahgraph = $.ajax({ //ayah testing
    url: 'data/aishah_53.json',
    type: 'GET',
    dataType: 'json'
  });

  // also get style via ajax
  var styleP = $.ajax({
    url: './style.cycss', // wine-and-cheese-style.cycss
    type: 'GET',
    dataType: 'text'
  });


  var infoTemplate = Handlebars.compile($('#node-info').html()); 

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
    $('#info').html(infoTemplate(node.data())).show();
  }

  function hideNodeInfo() {
    $('#info').hide();
  }


  function initCy(then) {
    var loading = document.getElementById('loading');

    // ayah
    // initialize variables with graph data if they haven't yet been initialized
    // this allows various to still store the graph in the dropdown function
    if (various == null) {
      various = variousgraph['responseJSON'];
    }
    if (aishah == null) {
      aishah = aishahgraph['responseJSON'];
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
    allEles = cy.elements();

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

/*    12/6/22 - this doesn't do anything btw
    cy.on('tap', 'edge', function(e){
      console.log('edge tapped');
    });
 12/6/22 */

 
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

        //var fields = ['name', 'NodeType', 'Country', 'Type', 'Milk'];
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
        suggestion: infoTemplate
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
        /*
                if( type === 'Cheese' || type === 'CheeseType' ){
        
                  var cType = n.data('Type');
                  var cty = n.data('Country');
        
                  if(
                    // moisture
                       (cType === 'Soft' && !soft)
                    || (cType === 'Semi-soft' && !semiSoft)
                    || (cType === undefined && !na)
                    || (cType === 'Semi-hard' && !semiHard)
                    || (cType === 'Hard' && !hard)
        
                    // country
                    || (cty === 'England' && !england)
                    || (cty === 'France' && !france)
                    || (cty === 'Italy' && !italy)
                    || (cty === 'US' && !usa)
                    || (cty === 'Spain' && !spain)
                    || (cty === 'Switzerland' && !switzerland)
                    || ( (cty === 'Holland' || cty === 'Ireland' || cty === 'Portugal' || cty === 'Scotland' || cty === 'Wales') && !euro )
                    || ( (cty === 'Canada' || cty === 'Australia') && !newWorld )
                    || (cty === undefined && !naCountry)
                  ){
                    filter();
                  }
        
                } else if( type === 'RedWine' ){
        
                  if( !red ){ filter(); }
        
                } else if( type === 'WhiteWine' ){
        
                  if( !white ){ filter(); }
        
                } else if( type === 'Cider' ){
        
                  if( !cider ){ filter(); }
        
                }
        */
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
    allEles = cy.elements(); //12/5/22
    recenter();
  } else if (selectednarrator == "various") {
    elementsetup(various.elements);
    cy.json({ elements: various.elements });
    allNodes = cy.nodes(); //12/5/22
    allEles = cy.elements(); //12/5/22
    recenter();
    
  }
  } 
```
