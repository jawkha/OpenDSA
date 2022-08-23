const margin = { top: 30, right: 90, bottom: 30, left: 90 };

const rectangleDimensions = { width: 76, height: 30 };

const durations = {
  nodes: { enter: 1000, exit: 1000, update: 2000 },
  paths: { enter: 3000, exit: 3000, update: 2000 },
};

const delays = {
  nodes: {},
  paths: {},
};

delays.paths.exit = 0;
delays.nodes.exit = delays.paths.exit + durations.paths.exit - 1000;
delays.paths.update = delays.nodes.exit + durations.nodes.exit - 1000;
delays.nodes.update = delays.paths.update;
delays.nodes.enter = delays.nodes.update + durations.nodes.update - 1000;
delays.paths.enter = delays.nodes.enter + durations.nodes.enter - 1000;

const colors = {
  file: { background: "#add8e6", text: "black" },
  directory: { background: "#0c3762", text: "white" },
  current: { background: "green", text: "white" },
  highlight: { background: "orange", text: "white" },
};

function renderFileStructureVisualization(data, currDirId, width, height, id) {
  const svgData = renderSVG(width, height, id);
  updateFileStructureVisualization(svgData, data, -1 * delays.nodes.enter);
  colorNode(svgData.group, currDirId, colors.current.background);

  return svgData;
}

function renderSVG(width, height, id) {
  const svgWidth = width - margin.left - margin.right;
  const svgHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom);

  const svgGroup = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return { group: svgGroup, width: svgWidth, height: svgHeight };
}

function selectNode(svgGroup, id) {
  return svgGroup.selectAll(".node").filter(function (d) {
    return d.data.id === id;
  });
}

function colorNode(svgGroup, id, color) {
  selectNode(svgGroup, id)
    .select("rect")
    .transition()
    .duration(1000)
    .style("fill", color);
}

function highlightNode(svgGroup, id, color, prevColor, prevText) {
  const node = selectNode(svgGroup, id);
  node.select("rect").transition().duration(1000).style("fill", color);
  node.select("text").transition().duration(1000).style("fill", "black");
  node
    .select("rect")
    .transition()
    .duration(1000)
    .delay(3000)
    .style("fill", prevColor);
  node
    .select("text")
    .transition()
    .duration(1000)
    .delay(3000)
    .style("fill", prevText);
}

function updateFileStructureVisualization(svgData, data, delayOffset) {
  const svgGroup = svgData.group;

  const treemap = d3.tree().size([svgData.width, svgData.height]);

  const hierarchyData = d3.hierarchy(data);

  const treeData = treemap(hierarchyData);

  // adds the nodes
  const nodes = svgGroup
    .selectAll(".node")
    .data(treeData.descendants(), function (d) {
      return d.data.id;
    })
    .join(
      function (enter) {
        const nodes = enter
          .append("g")
          .attr("class", "node")
          .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          })
          .style("fill-opacity", 1e-6)
          .style("stroke-opacity", 1e-6);

        nodes
          .append("rect")
          .attr("width", rectangleDimensions.width)
          .attr("height", rectangleDimensions.height)
          .attr("x", -rectangleDimensions.width / 2)
          .attr("y", -rectangleDimensions.height / 2)
          .style("fill", (d) => {
            return d.data.isDirectory
              ? colors.directory.background
              : colors.file.background;
          })
          .attr("stroke", "black")
          .attr("rx", 5)
          .attr("ry", 5);

        nodes
          .append("text")
          .attr("dy", ".35em")
          .attr("font-size", "0.8rem")
          .style("fill", (d) => {
            return d.data.isDirectory
              ? colors.directory.text
              : colors.file.text;
          })
          .style("text-anchor", "middle")
          .text(function (d) {
            return d.data.name;
          });

        nodes
          .transition()
          .duration(durations.nodes.enter)
          .delay(delays.nodes.enter + delayOffset)
          .style("fill-opacity", 1)
          .style("stroke-opacity", 1);

        return nodes;
      },
      function (update) {
        return update
          .attr("y", 0)
          .style("fill-opacity", 1)
          .style("stroke-opacity", 1)
          .transition()
          .duration(durations.nodes.update)
          .delay(delays.nodes.update + delayOffset)
          .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
      },
      function (exit) {
        return exit
          .transition()
          .duration(durations.nodes.exit)
          .delay(delays.nodes.exit + delayOffset)
          .style("fill-opacity", 1e-6)
          .style("stroke-opacity", 1e-6)
          .remove();
      }
    );

  // adds the links between the nodes
  const links = svgGroup
    .selectAll(".link")
    .data(treeData.descendants().slice(1), function (d) {
      return d.data.id;
    })
    .join(
      function (enter) {
        const nodes = enter
          .append("path")
          .lower()
          .attr("class", "link")
          .attr("d", function (d) {
            return `M ${d.x} , ${d.y} 
                      V ${(d.y + d.parent.y) / 2} 
                      H ${d.parent.x} 
                      V ${d.parent.y}`;
          })
          .each(function (d) {
            d.totalLength = this.getTotalLength();
          })
          .attr("stroke-dasharray", (d) => d.totalLength + " " + d.totalLength)
          .attr("stroke-dashoffset", (d) => d.totalLength)
          .transition()
          .delay(delays.paths.enter + delayOffset)
          .duration(durations.paths.enter)
          .attr("stroke-dashoffset", 0);

        return nodes;
      },
      function (update) {
        return update
          .transition()
          .duration(durations.paths.update)
          .delay(delays.paths.update + delayOffset)
          .attr("d", function (d) {
            return `M ${d.x} , ${d.y} 
                    V ${(d.y + d.parent.y) / 2} 
                    H ${d.parent.x} 
                    V ${d.parent.y}`;
          })
          .each(function (d) {
            d.totalLength = 1000;
          })
          .attr("stroke-dasharray", (d) => {
            return d.totalLength + " " + d.totalLength;
          })
          .attr("stroke-dashoffset", 0);
      },
      function (exit) {
        return exit
          .each(function (d) {
            d.totalLength = this.getTotalLength();
          })
          .attr("stroke-dasharray", (d) => d.totalLength + " " + d.totalLength)
          .attr("stroke-dashoffset", 0)
          .attr("stroke-dashoffset", 0)
          .transition()
          .delay(delays.paths.exit + delayOffset)
          .duration(3000)
          .attr("stroke-dashoffset", (d) => d.totalLength)
          .remove();
      }
    );
}

export {
  renderFileStructureVisualization,
  updateFileStructureVisualization,
  highlightNode,
  colorNode,
  colors,
  delays,
};