/* 
This demo visualises wine and cheese pairings.
*/
var testing = null;

$(function(){

  var layoutPadding = 50;
  var aniDur = 500;
  var easing = 'linear';

  var cy;



  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({
   // url: 'https://cdn.rawgit.com/maxkfranz/3d4d3c8eb808bd95bae7/raw', // wine-and-cheese.json
     url: 'data/aishah_53.json',
    type: 'GET',
    dataType: 'json'
  });

/*  ayah testingvar */ variousgraph = $.ajax({ //ayah testing
    // url: 'https://cdn.rawgit.com/maxkfranz/3d4d3c8eb808bd95bae7/raw', // wine-and-cheese.json
      url: 'data/various.json',
     type: 'GET',
     dataType: 'json'
   });
 
  // also get style via ajax
  var styleP = $.ajax({
    url: './style.cycss', // wine-and-cheese-style.cycss
    type: 'GET',
    dataType: 'text'
  });

 
// const testing = graphP['responseJSON'];
 console.log(graphP['responseJSON']);

  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{name}}</p>',
    '<p class="ac-node-type"><i class="fa fa-info-circle"></i> {{NodeTypeFormatted}} {{#if Type}}({{Type}}){{/if}}</p>',
    '{{#if Milk}}<p class="ac-milk"><i class="fa fa-angle-double-right"></i> {{Milk}}</p>{{/if}}',
    '{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',
    '<p class="ac-more"><i class="fa fa-external-link"></i> <a target="_blank" href="https://duckduckgo.com/?q={{name}}">More information</a></p>'
  ].join(''));

  // when both graph export json and style loaded, init cy
  //Promise.all([ graphP, styleP ]).then(initCy);
  Promise.all([ graphP, styleP ]).then(initCy);



  var allNodes = null;
  var allEles = null;
  var lastHighlighted = null;
  var lastUnhighlighted = null;

  function getFadePromise( ele, opacity ){
    return ele.animation({
      style: { 'opacity': opacity },
      duration: aniDur
    }).play().promise();
  };

  var restoreElesPositions = function( nhood ){
    return Promise.all( nhood.map(function( ele ){
      var p = ele.data('orgPos');

      return ele.animation({
        position: { x: p.x, y: p.y },
        duration: aniDur,
        easing: easing
      }).play().promise();
    }) );
  };

  function highlight( node ){
    var oldNhood = lastHighlighted;

    var nhood = lastHighlighted = node.closedNeighborhood();
    var others = lastUnhighlighted = cy.elements().not( nhood );

    var reset = function(){
      cy.batch(function(){
        others.addClass('hidden');
        nhood.removeClass('hidden');

        allEles.removeClass('faded highlighted');

        nhood.addClass('highlighted');

        others.nodes().forEach(function(n){
          var p = n.data('orgPos');

          n.position({ x: p.x, y: p.y });
        });
      });

      return Promise.resolve().then(function(){
        if( isDirty() ){
          return fit();
        } else {
          return Promise.resolve();
        };
      }).then(function(){
        return Promise.delay( aniDur );
      });
    };

    var runLayout = function(){
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
        concentric: function( ele ){
          if( ele.same( node ) ){
            return 2;
          } else {
            return 1;
          }
        },
        levelWidth: function(){ return 1; },
        padding: layoutPadding
      });

      var promise = cy.promiseOn('layoutstop');

      l.run();

      return promise;
    };

    var fit = function(){
      return cy.animation({
        fit: {
          eles: nhood.filter(':visible'),
          padding: layoutPadding
        },
        easing: easing,
        duration: aniDur
      }).play().promise();
    };

    var showOthersFaded = function(){
      return Promise.delay( 250 ).then(function(){
        cy.batch(function(){
          others.removeClass('hidden').addClass('faded');
        });
      });
    };

    return Promise.resolve()
      .then( reset )
      .then( runLayout )
      .then( fit )
      .then( showOthersFaded )
    ;

  }

  function isDirty(){
    return lastHighlighted != null;
  }

  function clear( opts ){
    if( !isDirty() ){ return Promise.resolve(); }

    opts = $.extend({

    }, opts);

    cy.stop();
    allNodes.stop();

    var nhood = lastHighlighted;
    var others = lastUnhighlighted;

    lastHighlighted = lastUnhighlighted = null;

    var hideOthers = function(){
      return Promise.delay( 125 ).then(function(){
        others.addClass('hidden');

        return Promise.delay( 125 );
      });
    };

    var showOthers = function(){
      cy.batch(function(){
        allEles.removeClass('hidden').removeClass('faded');
      });

      return Promise.delay( aniDur );
    };

    var restorePositions = function(){
      cy.batch(function(){
        others.nodes().forEach(function( n ){
          var p = n.data('orgPos');

          n.position({ x: p.x, y: p.y });
        });
      });

      return restoreElesPositions( nhood.nodes() );
    };

    var resetHighlight = function(){
      nhood.removeClass('highlighted');
    };

    return Promise.resolve()
      .then( resetHighlight )
      .then( hideOthers )
      .then( restorePositions )
      .then( showOthers )
    ;
  }

  function showNodeInfo( node ){
    $('#info').html( infoTemplate( node.data() ) ).show();
  }

  function hideNodeInfo(){
    $('#info').hide();
  }

  function initCy( then ){
    var loading = document.getElementById('loading');
    console.log("initcy - then[0]");
    console.log(then[0]);
   // console.log("initcy - graphP");
    // console.log(graphP);
    console.log(graphP['responseJSON']); // this works and it looks like then[0]. but the testing variable if defined above  doesn't
    if ( testing == null ) {
    testing = variousgraph['responseJSON']; } //this allows testing to have the graph in the dropdown function
    console.log("testing");
    console.log(testing);
    /*    console.log("initcy - variousgraph");
    console.log(variousgraph);
    console.log("initcy - currentgraph");
    console.log(currentgraph);
    console.log("initcy - currentgraphelements");
    console.log(currentgraphelements); // undefined? why?*/
   var expJson = then[0];
   var styleJson = then[1];
   var elements = expJson.elements;


    elements.nodes.forEach(function(n){
      var data = n.data;

      data.NodeTypeFormatted = data.NodeType;

      if( data.NodeTypeFormatted === 'RedWine' ){
        data.NodeTypeFormatted = 'Red Wine';
      } else if( data.NodeTypeFormatted === 'WhiteWine' ){
        data.NodeTypeFormatted = 'White Wine';
      }

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

    cy.on('free', 'node', function( e ){
      var n = e.cyTarget;
      var p = n.position();

      n.data('orgPos', {
        x: p.x,
        y: p.y
      });
    });

    cy.on('tap', function(){
      $('#search').blur();
    });

    cy.on('select unselect', 'node', _.debounce( function(e){
      var node = cy.$('node:selected');

      if( node.nonempty() ){
        showNodeInfo( node );

        Promise.resolve().then(function(){
          return highlight( node );
        });
      } else {
        hideNodeInfo();
        clear();
      }

    }, 100 ) );

  }

  var lastSearch = '';

  $('#search').typeahead({
    minLength: 2,
    highlight: true,
  },
  {
    name: 'search-dataset',
    source: function( query, cb ){
      function matches( str, q ){
        str = (str || '').toLowerCase();
        q = (q || '').toLowerCase();

        return str.match( q );
      }

      //var fields = ['name', 'NodeType', 'Country', 'Type', 'Milk'];
      var fields = ['fullname', 'displayname', 'searchname']; //aea

      function anyFieldMatches( n ){
        for( var i = 0; i < fields.length; i++ ){
          var f = fields[i];

          if( matches( n.data(f), query ) ){
            return true;
          }
        }

        return false;
      }

      function getData(n){
        var data = n.data();

        return data;
      }

      function sortByName(n1, n2){
        if( n1.data('name') < n2.data('name') ){
          return -1;
        } else if( n1.data('name') > n2.data('name') ){
          return 1;
        }

        return 0;
      }

      var res = allNodes.stdFilter( anyFieldMatches ).sort( sortByName ).map( getData );

      cb( res );
    },
    templates: {
      suggestion: infoTemplate
    }
  }).on('typeahead:selected', function(e, entry, dataset){
    var n = cy.getElementById(entry.id);

    cy.batch(function(){
      allNodes.unselect();

      n.select();
    });

    showNodeInfo( n );
  }).on('keydown keypress keyup change', _.debounce(function(e){
    var thisSearch = $('#search').val();

    if( thisSearch !== lastSearch ){
      $('.tt-dropdown-menu').scrollTop(0);

      lastSearch = thisSearch;
    }
  }, 50));

  $('#reset').on('click', function(){
    if( isDirty() ){
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

  $('#filters').on('click', 'input', function(){
    console.log('filters on click');
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
    
    cy.batch(function(){

      allNodes.forEach(function( n ){

//        var type = n.data('NodeType'); ayah

        
        //ayah:
        var gender = n.data('gender');

        // not ayah:
        n.removeClass('filtered');

        var filter = function(){
          n.addClass('filtered');
        };

        // ayah:
        if( gender === 'male' ){
          if( !male ){ filter(); }
        } else if( gender === 'female'){
          if( !female ){ filter(); }
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
// not ayah:
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
  $('#dropdown-content').on('click', 'input', function() {
    console.log('graph dropdown on click');
    console.log('graphP');
    console.log(graphP); //graphP['responseJSON'] is undefined here
    console.log("testing");
    console.log(testing); // this works - definine var testing outside then defining/assigning it in initcy.
  /*  console.log('graphP');
    console.log(graphP); this is not the graph object it was originally defined as. */
    var various = $('#various').is(':selected');
    var aishah = $('#aishah').is(':selected');
    //var hafsah = $('#hafsah').is(':selected');
   // var dataurl = 'data/aishah_53.json';
    if( various ){ // ok this is if statement is not working
      console.log("if various = true");
      initCy([ testing, styleP ]);
     // Promise.all([ testing, styleP ]).then(initCy);
    }
    console.log("about to initCY in dropdown function");
    initCy([ testing, styleP ]);
     // dataurl = 'data/various.json';
     // currentgraph = variousgraph; // variousgraph and graphP 
    /*}else if( aishah ){
      dataurl = 'data/aishah_53.json';
      //currentgraph = graphP;
    }*/
    
 /*   var graphP1 = $.ajax({
      url: 'data/various.json', //dataurl
     type: 'GET',
     dataType: 'json'
   });
   
   console.log("graphP in dropdown function:");
   console.log(graphP); // this is not the graph object for some reason. 

   console.log("currentgraph in dropdown function");
   console.log(currentgraph); // this changes from the initial object it was above. by the time it reaches this line it's no longer the json graph object
   console.log("currentgraphelements in dropdown function");
   console.log(currentgraphelements);*/

   /* I just put this here to see if this needs to be here for promise.all to work as it does above. 
   infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{name}}</p>',
    '<p class="ac-node-type"><i class="fa fa-info-circle"></i> {{NodeTypeFormatted}} {{#if Type}}({{Type}}){{/if}}</p>',
    '{{#if Milk}}<p class="ac-milk"><i class="fa fa-angle-double-right"></i> {{Milk}}</p>{{/if}}',
    '{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',
    '<p class="ac-more"><i class="fa fa-external-link"></i> <a target="_blank" href="https://duckduckgo.com/?q={{name}}">More information</a></p>'
  ].join(''));*/
  // initCy([ graphP1, styleP ]);
   //Promise.all([ graphP, styleP ]).then( initCy );
   // problem is that Problem.all call at the top correctly passes the json object into initcy.
   // here, something else gets passed.
   // then try: Promise.resolve().then( reset )
   // also try RETURNING the promise?
   
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
