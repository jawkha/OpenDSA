/*global PIFRAMES */
$(document).ready(function() {
  "use strict";
  var av_name = "PDAFS";
  var av = new JSAV(av_name);
  var Frames = PIFRAMES.init(av_name);

  //Frame 1
  av.umsg("Recall that a DFA is formally defined as $(Q, \\Sigma, \\delta, q_0, F)$.<br/><br/>In a DFA, the tape is read only, the head moves to the right only. DFAs are limited in power. They recognize regular languages but cannot recognize many other 'simple' languages like $a^nb^n$");
  av.displayInit();
  //Init and show a DFA
  var xStart = 50;
  var yStart = 150;
  av.label("input tape", {left: xStart + 40, top: yStart - 45});
  var strings = ["a", "a", "a", "a", "b", "b", "", "", "", "", ""];
  var tape = av.ds.tape(strings, xStart, yStart, "right");
  tape.highlightPosition(2);
  // av.ds.array(strings, {left: xStart, top: yStart});
  
  av.g.line(xStart + 80, yStart + 95, xStart + 80, yStart + 35,
            {"arrow-end": "classic-wide-long"});
  av.label("tape head", {left: xStart + 5, top: yStart + 25});
  var rectangleHeight = 30;
  var squareHeight = 90;
  var squareWidth = 90;
  av.label("current state", {left: xStart + 45, top: yStart + rectangleHeight + 50});
  av.g.rect(xStart + 40, yStart + 25 + rectangleHeight + 40, squareWidth, squareHeight);
  av.g.circle(xStart + 40 + (squareWidth / 2), yStart + 35 + rectangleHeight + 40 + ((squareHeight - 10) / 2), 30);
  av.g.line(xStart + 40 + (squareWidth / 2), yStart + 155, xStart + 90, yStart + 145,
            {"arrow-end": "classic-wide-long"});
  av.label("1", {left: xStart + 90, top: yStart + rectangleHeight + 85});
  av.label("0", {left: xStart + 70, top: yStart + rectangleHeight + 85});
  
  av.label("head moves", {left: xStart + 150, top: yStart + 25});
  av.g.line(xStart + 240, 50 + yStart, 275 + xStart, 50 + yStart,
            {"arrow-end": "classic-wide-long"});
  
  // Frame 2
  av.umsg("We are now going to give the DFA a stack. This new machine is called a Pushdown Automata (PDA).");
  av.step();
  //Add the stack
  av.g.rect(xStart + 200, yStart + 50 + rectangleHeight + 40, squareWidth / 2, squareHeight / 4);
  av.g.rect(xStart + 200, yStart + 50 + rectangleHeight + 40 + squareHeight / 4, squareWidth / 2, squareHeight / 4);
  av.g.rect(xStart + 200, yStart + 50 + rectangleHeight + 40 + squareHeight / 2, squareWidth / 2, squareHeight / 4);

  av.label("a", {left: xStart + 200 + squareWidth/4, top: yStart + 50 + rectangleHeight + 25});
  av.label("a", {left: xStart + 200 + squareWidth/4, top: yStart + 50 + rectangleHeight + 25 + squareHeight / 4});
  av.label("Z", {left: xStart + 200 + squareWidth/4, top: yStart + 50 + rectangleHeight + 25 + squareHeight / 2});
  av.label("Stack", {left: xStart + 250 + squareWidth/4, top: yStart + 50 + rectangleHeight + 25});
  av.g.line(xStart + 43 + squareWidth, yStart + 45 + rectangleHeight + 40 + squareHeight / 5,
            xStart + 200 - 5, yStart + 45 + rectangleHeight + 40 + squareHeight / 5,
            {"arrow-end": "classic-wide-long"});

  // Frame 3
  av.umsg(Frames.addQuestion("q2"));
  av.step();

  // Frame 4
  av.umsg("A Pushdown Automata (PDA) is formally defined as $M = (Q, \\Sigma, \\Gamma, \\delta, q_0, z, F).$ <br/> $Q$ is a finite set of states <br/> $\\Sigma$ is the tape (input) alphabet (a finite set)  <br/>  $\\Gamma$ is the stack alphabet (a finite set) <br/>$q_0$ is the initial state, $q0 \\in Q$ <br/> z is the start stack symbol (marks the bottom of the stack), z $\\in \\Gamma$ <br/> $F$⊆$Q$ is the set of final states <br/> $\\delta : Q \\times (\\Sigma \\cup \\{\\lambda\\}) \\times \\Gamma \\rightarrow Q \\times \\Gamma^*$");
  av.step();

  // Frame 5
  av.umsg(Frames.addQuestion("q3"));
  av.step();

  // Frame 6
  av.umsg(Frames.addQuestion("q5"));
  av.step();

  // Frame 7
  av.umsg(Frames.addQuestion("q6"));
  av.step();

  // Frame 8
  av.umsg(Frames.addQuestion("q7"));
  av.step();

  //Frame 9
  av.umsg(Frames.addQuestion("q9"));
  av.step();

  // Frame 10
  av.umsg(Frames.addQuestion("q10"));
  av.step();

  // Frame 11
  av.umsg(Frames.addQuestion("q11"));
  av.step();

  // Frame 12
  av.umsg(Frames.addQuestion("q12"));
  av.step();

  // Frame 13
  av.umsg("Congratulations! Frameset completed.");
  av.recorded();
});
