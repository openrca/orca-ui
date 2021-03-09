import * as d3 from 'd3';

export function clearClicked() {
  d3.selectAll('.clicked').classed('clicked', false);
}

export function scaleGraph(svg, g, zoom) {
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;

  const bboxX = g.node().getBBox().x;
  const bboxY = g.node().getBBox().y;
  const bboxWidth = g.node().getBBox().width;
  const bboxHeight = g.node().getBBox().height;

  if(bboxWidth === 0 || bboxHeight === 0) return;

  const scale = 0.95 / Math.max(bboxWidth / width, bboxHeight / height);

  const transform = d3.zoomIdentity
    .translate(width / 2 - scale * (bboxX + bboxWidth / 2), height / 2 - scale * (bboxY + bboxHeight / 2))
    .scale(scale);

  svg
    .transition()
    .duration(0)
    .call(zoom.transform, transform);
}

export function drag(simulation) {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}
