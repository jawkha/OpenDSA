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
    var topProposal = "-5%";
    var leftProposal = "3.5%";
    let topCenterGraph = "35%";
    let leftCenterGraph = "14%";
    let node4ALeft = "55%";
    let node4ATop = "90%"


    var blockchain = av.ds.list({top: topMargin, left: leftMargin, nodegap: 10});
    var graph = av.ds.graph({visible: true, left: -10, bottom: 5});
    var blockProposal1 = av.ds.list({top: topProposal, left: leftProposal});

    // this code is the starting state of the graph
    ;
    graph.css({"font-size": "12px"});
    const a = graph.addNode('1', { "left": "10%", "bottom":"90%"});
    const b = graph.addNode('2', {"right": "90%", "left":"10%", "top":"90%"});
    const c = graph.addNode('3', {"left": "55%", "bottom":"90%"});
    const d = graph.addNode('4', {"bottom":"10%", "top":node4ATop, "left":node4ALeft});
    graph.addEdge(a,b);
    graph.addEdge(a,c);
    graph.addEdge(a,d);
    graph.addEdge(b,c);
    graph.addEdge(b,d);
    graph.addEdge(c,d);
    av.g.line(300, 10, 300, 220);

    graph.addClass('backward'); //move the graph behind the new proposed blocks
    graph.layout();
  
    // Slide 1
    av.umsg(interpret("sc1"));

    blockchain.addFirst("Blk 2").addFirst("Blk 1");

    let forkMargin = 163; //the distance we want in the fork

    blockchain.layout({updateTop: false});

    av.displayInit();
  
    // Slide 2
    av.umsg(interpret("sc2"));
    
    let blkA = blockProposal1.addFirst("Blk A").get(0);
    blkA.addClass("greenBlock");
    blockProposal1.css({top: topCenterGraph, left: leftCenterGraph});
    graph.layout({updateLeft: false, updateTop: false});

    let node1Block = blockchain.newNode("Blk A");
    
    node1Block.css({top: 0, left: leftAdding * 2});
    node1Block.addClass('greenBlock');

    a.addClass('greennode');
    graph.layout({updateTop: false});
    blockchain.layout();

    av.step();

    // Slide 3
    av.umsg(interpret("sc3"));

    blockProposal1.removeFirst();

    // blockProposal1.css({top: node4ATop, left: node4ALeft});
    let blockProposal4 = av.ds.list({top: "76%", left: "24.6%"});
    let blkB = blockProposal4.addFirst("Blk B").get(0);
    blkB.addClass("redBlock");
    blockProposal4.css({top: topCenterGraph, left: leftCenterGraph});
    // const dBlock = graph.addNode("Block", {"left":"33%", "top":"40%"});
    // const dEdge = graph.addEdge(d,dBlock);
    // blockProposal.css({top: node4ATop, left: node4ALeft});
    // let blkB = blockProposal.addFirst("Blk B").get(0);
    // blkA.addClass("redBlock");
    
    
    // blockProposal.css({top: topCenterGraph, left: leftCenterGraph});
    
    graph.layout({updateLeft: false, updateTop: false});

    d.addClass('rednode');

    let node4Block = blockchain.newNode("Blk B");
    
    // node 4 arrow
    // subtracting 15 because the start of the auto-gen arrows are about 15 pixels    
    let node1Arrow = av.g.line(leftMargin + leftAdding*2 - 15, topMargin + 31,
        leftMargin + leftAdding*2 + 10, topMargin ,
        {"arrow-end": "classic-wide-long",
        opacity: 0, "stroke-width": 2});

    // move node 1 block up
    node1Block.css({top: topMargin, left: leftAdding * 2});

    // add node 4 block and move it down
    node4Block.css({top: topMargin-100, left: leftAdding * 2});
    node4Block.addClass('redBlock');
    
    graph.layout({updateTop: false, updateLeft: false});
    blockchain.layout({updateTop: false});

    av.step();

    // Slide 4
    av.umsg(interpret("sc4"));

    // graph.removeNode(dBlock);
    // graph.removeEdge(dEdge);
    blockProposal4.removeFirst();
    
    graph.layout();

    // start blockchain
    
    blockchain.get(1).next(node1Block);
    node1Arrow.show();
    blockchain.layout({updateTop: false});

    av.step();
    
    // Slide 5
    av.umsg(interpret("sc5"));

    // graph
    // const bBlock = graph.addNode("Block", {"left":"33%", "top":"40%"});
    // const bEdge = graph.addEdge(b,bBlock);

    b.addClass('bluenode');
    // bBlock.addClass('bluenode');
    // bEdge.addClass('blueedge');

    let blockProposal2 = av.ds.list({top: "76%", left: "3.6%"});
    let blkC = blockProposal2.addFirst("Blk C").get(0);
    blkC.addClass("blueBlock");
    blockProposal2.css({top: topCenterGraph, left: leftCenterGraph});

    graph.layout();

    // blockchain
    let node2Block = blockchain.newNode("Blk C");
    node2Block.css({top: topMargin});
    node2Block.addClass('blueBlock');
    blockchain.get(2).next(node2Block);
    blockchain.layout({updateTop: false});

    av.step();
    // Slide 6
    av.umsg(interpret("sc6"));
    // graph


    // graph.removeNode(bBlock);
    // graph.removeEdge(bEdge);
    
    blockProposal2.removeFirst();

    const cBlock = graph.addNode("Block", {"left":"33%", "top":"30%"});
    const cEdge = graph.addEdge(c,cBlock);

    c.addClass('orangenode');
    cBlock.addClass('orangenode');
    cEdge.addClass('orangeedge');

    const red2 = graph.addNode("Block", {"left":"33%", "top":"50%"});
    const red2edge = graph.addEdge(d,red2);

    red2.addClass('rednode');
    red2edge.addClass('rededge');
    graph.layout();

    let node4Arrow = av.g.line(leftMargin + leftAdding*3 - 12, topMargin - 17,
        leftMargin + leftAdding*3 + 2, topMargin - 17,
        {"arrow-end": "classic-wide-long",
        opacity: 0, "stroke-width": 2});
    
    let node3Block = blockchain.newNode("Blk D");
    let node4aBlock = blockchain.newNode("Blk E");

    node4aBlock.css({top: topMargin-100, left: forkMargin});
    node3Block.css({top: topMargin})
    node4aBlock.addClass('redBlock')
    node3Block.addClass('orangeBlock');
    node2Block.next(node3Block);
    node4Block.next(node4aBlock);
    node4Arrow.show();
    blockchain.layout({updateTop: false});
    

    av.step();
    // // Slide 7
    av.umsg(interpret("sc7"));

    graph.removeNode(cBlock);
    graph.removeEdge(cEdge);

    graph.removeNode(red2);
    graph.removeEdge(red2edge);

    const eBlock = graph.addNode("Block", {"left":"33%", "top":"30%"});
    const eEdge = graph.addEdge(a,eBlock);

    eBlock.addClass('greennode');
    eEdge.addClass('greenedge');

    const fBlock = graph.addNode("Block", {"left":"33%", "top":"50%"});
    const fEdge = graph.addEdge(b,fBlock);

    fBlock.addClass('bluenode');
    fEdge.addClass('blueedge');

    graph.layout();

    let node2aBlock = blockchain.newNode("Blk F");
    let node1aBlock = blockchain.newNode("Blk G");
    
    node2aBlock.css({top: topMargin});
    node1aBlock.css({top: topMargin});
    node2aBlock.addClass('blueBlock');
    node1aBlock.addClass('greenBlock');
    node3Block.next(node2aBlock);
    node2aBlock.next(node1aBlock);
    blockchain.layout({updateTop: false});

    av.step();

    av.umsg(interpret("sc8"));

    node1Arrow.hide();
    node4Arrow.hide();
    node4Block.hide();
    node4aBlock.hide();
    blockchain.layout();

    av.recorded();
  });
  