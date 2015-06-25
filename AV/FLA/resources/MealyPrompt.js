function TraversePrompt() {
    this.render = function() {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogueoverlay = document.getElementById('dialogueoverlay');
        var dialoguebox = document.getElementById('dialoguebox');
        dialogueoverlay.style.display = "block";
        dialogueoverlay.style.height = winH+"px";
        dialoguebox.style.left = (winW/2) - (550/2)+"px";
        dialoguebox.style.top = "100px";
        dialoguebox.style.display = "block";
        document.getElementById('dialogueboxhead').innerHTML = "Traverse:";
        document.getElementById('dialogueboxbody').innerHTML = 'Input String: <input class="newinput" id="first">';
        document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="addNewInput()">Add New Input</button> <button onclick="traverseInput()">Traverse</button> <button onclick="goback()">Cancel</button>';
        document.getElementById('first').focus();
    }
    goback = function() {
        document.getElementById('dialoguebox').style.display = "none";
        document.getElementById('dialogueoverlay').style.display = "none";
    }
    traverseInput = function() {
        var values = [];
        var x = document.getElementById('dialogueboxbody').getElementsByClassName('newinput');
        for (var i = 0; i < x.length; i++) {
            values.push(x[i].value);
        }
        window["traverseInputs"](values);
        this.goback();
    }
    addNewInput = function() {
        var values = [];
        var x = document.getElementById('dialogueboxbody').getElementsByClassName('newinput');
        for (var j = 0; j < x.length; j++) {
            values.push(x[j].value);
        }
        document.getElementById('dialogueboxbody').innerHTML += '<br>Input String: <input class="newinput">';
        x = document.getElementById('dialogueboxbody').getElementsByClassName('newinput');
        for (var k = 0; k < values.length; k++) {
            x[k].value = values[k];
        }
        x[x.length - 1].focus();
    }
}

function NodePrompt() {
    this.render = function(value, is, lab) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogueoverlay = document.getElementById('dialogueoverlay');
        var dialoguebox = document.getElementById('dialoguebox');
        dialogueoverlay.style.display = "block";
        dialogueoverlay.style.height = winH+"px";
        dialoguebox.style.left = (winW/2) - (550/2)+"px";
        dialoguebox.style.top = "100px";
        dialoguebox.style.display = "block";
        document.getElementById('dialogueboxhead').innerHTML = "Edit Node <b>" + value + ":</b>";
        document.getElementById('dialogueboxbody').innerHTML = 'Initial State:<input type="checkbox" id="initial_state">';
        document.getElementById('dialogueboxbody').innerHTML += '<br>State Label: <input id="label">';
        document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="ok()">OK</button> <button onclick="terminate()">Cancel</button>';
        if (is) {
            document.getElementById('initial_state').checked = true;
        }
        if (lab) {
            document.getElementById('label').value = lab;
        }
        document.getElementById('label').focus();
    }
    terminate = function() {
        document.getElementById('dialoguebox').style.display = "none";
        document.getElementById('dialogueoverlay').style.display = "none";
    }
    ok = function() {
        var initial_state = document.getElementById('initial_state').checked;
        var node_label = document.getElementById('label').value;
        window["updateNode"](initial_state, node_label);
        this.terminate();
    }
}

function EdgePrompt() {
    this.render = function(edgeWeight) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogueoverlay = document.getElementById('dialogueoverlay');
        var dialoguebox = document.getElementById('dialoguebox');
        dialogueoverlay.style.display = "block";
        dialogueoverlay.style.height = winH+"px";
        dialoguebox.style.left = (winW/2) - (550/2)+"px";
        dialoguebox.style.top = "100px";
        dialoguebox.style.display = "block";
        document.getElementById('dialogueboxbody').innerHTML = 'Input Character: <input id="inputChar">';
        document.getElementById('dialogueboxbody').innerHTML += '<br>Output Character: <input id="outputChar">';
        var inputValue, outputValue;
        if(edgeWeight === ""){
            inputValue = "";
            outputValue = "";
            document.getElementById('dialogueboxhead').innerHTML = "Create Edge:";
            document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="addEdge()">OK</button> <button onclick="end()">Cancel</button>';
        }
        else {
            document.getElementById('dialogueboxhead').innerHTML = "Edit Edge:";
            document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="changeEdge()">OK</button> <button onclick="end()">Cancel</button>';
            var values = edgeWeight.split(":");
            inputValue = values[0];
            outputValue = values[1];
            if (inputValue != lambda && inputValue != epsilon) {
                document.getElementById('inputChar').value = inputValue;
            }
            if (outputValue && outputValue != lambda && outputValue != epsilon) {
                document.getElementById('outputChar').value = outputValue;
            }
        }
        document.getElementById('inputChar').focus();
    }
    end = function() {
        document.getElementById('dialoguebox').style.display = "none";
        document.getElementById('dialogueoverlay').style.display = "none";
    }
    addEdge = function() {
        var edge_input = document.getElementById('inputChar').value;
        if (edge_input === "") {
            edge_input = emptystring;
        }
        var edge_output = document.getElementById('outputChar').value;
        if (edge_output === "") {
            edge_output = emptystring;
        }
        var edge_label = edge_input + ":" + edge_output;
        window["createEdge"](edge_label);
        this.end();
    }
    changeEdge = function() {
        var edge_input = document.getElementById('inputChar').value;
        if (edge_input === "") {
            edge_input = emptystring;
        }
        var edge_output = document.getElementById('outputChar').value;
        if (edge_output === "") {
            edge_output = emptystring;
        }
        var edge_label = edge_input + ":" + edge_output;
        window["updateEdge"](edge_label);
        this.end();
    }
}