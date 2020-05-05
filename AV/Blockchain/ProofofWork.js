/*global ODSA */
// Inseh1234 slideshow
$(document).ready(function() {
    "use strict";
    var av_name = "ProofOfWork";
    var config = ODSA.UTILS.loadConfig({av_name: av_name}),
        interpret = config.interpreter;                   // get the code object
    var av = new JSAV(av_name);
    
    var topMargin = 50;
    var leftMargin = 390;
    let leftAdding = 54;
    var blockchain = av.ds.list({top: topMargin, left: leftMargin, nodegap: 10});
    var graph = av.ds.graph({visible: true, left: -10, bottom: 5});

    // this code is the starting state of the graph
    graph.css({"font-size": "12px"});
    const a = graph.addNode('1', { "left": "10%", "bottom":"90%"});
    const b = graph.addNode('2', {"right": "90%", "left":"10%", "top":"90%"});
    const c = graph.addNode('3', {"left": "55%", "bottom":"90%"});
    const d = graph.addNode('4', {"bottom":"10%", "top":"90%", "left":"55%"});
    graph.addEdge(a,b);
    graph.addEdge(a,c);
    graph.addEdge(a,d);
    graph.addEdge(b,c);
    graph.addEdge(b,d);
    graph.addEdge(c,d);
    av.g.line(300, 10, 300, 220);

    graph.layout();
  
    // Slide 1
    av.umsg(interpret("sc1"));

    //enter  code here





    blockchain.addFirst("Blk 2").addFirst("Blk 1");
    
    // let node4Block = blockchain.newNode("Node 4");

    let forkMargin = 168; //the distance we want in the fork
    // node1Block.css({top: topMargin-100, left: forkMargin});
    // node4Block.css({top: topMargin, left: forkMargin});

    // blockchain.get(1).next(node4Block);
    // node1Arrow.show();
    blockchain.layout({updateTop: false});

    av.displayInit();
  
    // Slide 2
    av.umsg(interpret("sc2"));
    
    graph.removeEdge(a,b);
    graph.removeEdge(a,c);
    graph.removeEdge(a,d);
    graph.removeEdge(b,c);
    graph.removeEdge(b,d);
    graph.removeEdge(c,d);
    graph.layout();

    const aBlock = graph.addNode("Block", {"left":"33%", "top":"40%"});
    const aEdge = graph.addEdge(a,aBlock);
    aBlock.addClass('greennode');
    aEdge.addClass('greenedge');

    let node1Block = blockchain.newNode("Node 1");
    
    node1Block.css({top: 0, left: leftAdding * 2});
    node1Block.addClass('greenBlock');

    a.addClass('greennode');
    graph.layout({updateTop: false});
    blockchain.layout();

    av.step();

    // Slide 3
    av.umsg(interpret("sc3"));

    graph.removeNode(aBlock);
    graph.removeEdge(aEdge);
    const dBlock = graph.addNode("Block", {"left":"33%", "top":"40%"});
    const dEdge = graph.addEdge(d,dBlock);

    d.addClass('rednode');
    dBlock.addClass('rednode');
    dEdge.addClass('rededge');

    let node4Block = blockchain.newNode("Node 4");
    
    // node 4 arrow
    // subtracting 15 because the start of the auto-gen arrows are about 15 pixels    
    let node1Arrow = av.g.line(leftMargin + leftAdding*2 - 15, topMargin + 31,
        leftMargin + leftAdding*2, topMargin ,
        {"arrow-end": "classic-wide-long",
        opacity: 0, "stroke-width": 2});

    // move node 1 block up
    node1Block.css({top: topMargin-100, left: leftAdding * 2});

    // add node 4 block and move it down
    node4Block.css({top: topMargin, left: leftAdding * 2});
    node4Block.addClass('redBlock');
    
    graph.layout({updateTop: false, updateLeft: false});
    blockchain.layout({updateTop: false});

    av.step();

    // Slide 4
    av.umsg(interpret("sc4"));

    graph.removeNode(dBlock);
    graph.removeEdge(dEdge);
    
    graph.layout();

    // start blockchain
    
    blockchain.get(1).next(node4Block);
    node1Arrow.show();
    blockchain.layout({updateTop: false});

    // blockchain.addFirst("Blk 2").addFirst("Blk 1");
    // // let node1Block = blockchain.newNode("Node 1");
    // // let node4Block = blockchain.newNode("Node 4");

    // let node1Arrow = av.g.line(leftMargin + 122, topMargin + 31,
    //                             leftMargin + 168, topMargin - 5,
    //                             {"arrow-end": "classic-wide-long",
    //                             opacity: 0, "stroke-width": 2});
    
    // let node1NextArrow = av.g.line(leftMargin + 122 + 84, topMargin - 17,
    //                             leftMargin + 168 + 84, topMargin - 17,
    //                             {"arrow-end": "classic-wide-long",
    //                             opacity: 0, "stroke-width": 2});

    // let node1NextNextArrow = av.g.line(leftMargin + 122 + 84*2, topMargin - 17,
    //                                 leftMargin + 168 + 84*2, topMargin - 17,
    //                                 {"arrow-end": "classic-wide-long",
    //                                 opacity: 0, "stroke-width": 2});

    // // let forkMargin = 168;
    // node1Block.css({top: topMargin-100, left: forkMargin});
    // node4Block.css({top: topMargin, left: forkMargin});

    // blockchain.get(1).next(node4Block);
    // node1Arrow.show();
    // blockchain.layout({updateTop: false});

    av.step();
    
    // Slide 5
    av.umsg(interpret("sc5"));

    // graph
    const bBlock = graph.addNode("Block", {"left":"33%", "top":"40%"});
    const bEdge = graph.addEdge(b,bBlock);

    b.addClass('bluenode');
    bBlock.addClass('bluenode');
    bEdge.addClass('blueedge');
    graph.layout();

    // blockchain




    // node1NextArrow.show();
    // let node4aBlock = blockchain.newNode("Node 4\'");
    // let node1aBlock = blockchain.newNode("Node 1\'");
    // node4aBlock.css({top: topMargin, left: forkMargin + 84});
    // node1aBlock.css({top: topMargin-100, left: forkMargin + 84});
    // node4Block.next(node4aBlock);
    // node1Block.next(node1aBlock);
    // blockchain.layout({updateTop: false});

    av.step();
    // Slide 6
    av.umsg(interpret("sc6"));
    // graph


    graph.removeNode(bBlock);
    graph.removeEdge(bEdge);

    const cBlock = graph.addNode("Block", {"left":"33%", "top":"40%"});
    const cEdge = graph.addEdge(c,cBlock);

    c.addClass('orangenode');
    cBlock.addClass('orangenode');
    cEdge.addClass('orangeedge');
    graph.layout();

    // node1NextNextArrow.show();
    // let node4bBlock = blockchain.newNode("Node 4\"");
    // let node1bBlock = blockchain.newNode("Node 1\"");
    // node4bBlock.css({top: topMargin, left: forkMargin + 84 * 2});
    // node1bBlock.css({top: topMargin-100, left: forkMargin + 84 * 2});
    // node4aBlock.next(node4bBlock);
    // node1aBlock.next(node1bBlock);
    // blockchain.layout({updateTop: false});
    

    av.step();
    // // Slide 7
    // av.umsg(interpret("sc7"));
    // let node4cBlock = blockchain.newNode("Node 4\"\'");
    // node4cBlock.css({top: topMargin, left: forkMargin + 84 * 3});
    // node4bBlock.next(node4cBlock);
    // node1bBlock.next(null);
    // blockchain.layout({updateTop: false});

    // av.step();

    // av.umsg(interpret("sc8"));
    // node1Arrow.hide();
    // node1NextArrow.hide();
    // node1NextNextArrow.hide();
    // node1Block.hide();
    // node1aBlock.hide();
    // node1bBlock.hide();
    // node4Block./*hide()*/css({top: topMargin});
    // node4aBlock./*hide()*/css({top: topMargin});
    // node4bBlock./*hide()*/css({top: topMargin});
    // node4cBlock./*hide()*/css({top: topMargin});
    // // create final nodes
    // // let block3 = blockchain.newNode("Blk 3");
    // // let block4 = blockchain.newNode("Blk 4");
    // // let block5 = blockchain.newNode("Blk 5");
    // // let block6 = blockchain.newNode("Blk 6");
    // // blockchain.get(1).next(block3);
    // // block3.next(block4);
    // // block4.next(block5);
    // // block5.next(block6);
    // blockchain.layout();
    // av.step();

    av.recorded();
  });
  