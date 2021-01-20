import * as d3 from 'd3';

export function truncate(fullStr, strLen, separator='...') {
  if (fullStr.length <= strLen) return fullStr;
  
  const sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2);
  
  return fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars);
}

export function clearClicked() {
  d3.selectAll('.clicked').classed('clicked', false);
}

export function scaleGraph(svg, g, zoom) {
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;

  const graphX = g.node().getBBox().x;
  const graphY = g.node().getBBox().y;
  const graphWidth = g.node().getBBox().width;
  const graphHeight = g.node().getBBox().height;

  if(graphWidth === 0 || graphHeight === 0) return;

  const scale = 0.95 / Math.max(graphWidth / width, graphHeight / height);

  const transform = d3.zoomIdentity
    .translate(width / 2 - scale * (graphX + graphWidth / 2), height / 2 - scale * (graphY + graphHeight / 2))
    .scale(scale);

  svg
    .transition()
    .duration(0)
    .call(zoom.transform, transform);
}

export function filterAlerts(nodes, links) {
  return nodes.filter(nodeGroup => nodeGroup.kind === 'alert').filter(alert => {
    var valid = false;
    links.forEach(link => {
      if(link.source === alert.id || link.target === alert.id) valid = true;
    });
    return !valid;
  });
}

export function filterK8sNodesOtherNamespace(nodes, links) {
  return nodes.filter(nodeGroup => nodeGroup.kind === 'node').filter(node => {
    var valid = false;
    const clusterNames = nodes.filter(nodeGroup => nodeGroup.kind === 'cluster').map(cluster => cluster.id);
    const linksWithoutClusters = links.filter(link => !(clusterNames.includes(link.source) || clusterNames.includes(link.target)));

    linksWithoutClusters.forEach(link => {
      if(link.source === node.id || link.target === node.id) valid = true;
    });
    return !valid;
  });
}

export function getNeighbours(links, object) {
  const objectLinks = links.filter(link => link.source === object || link.target === object);
  const neighbours = [];
  objectLinks.forEach(link => {
    if(link.source === object) {
      neighbours.push(link.target);
    } else {
      neighbours.push(link.source);
    }

    return true;
  });
  return neighbours;
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
