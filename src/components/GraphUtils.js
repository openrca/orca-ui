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

export function filterByType(nodes, links, type) {
  return nodes.filter(nodeGroup => nodeGroup.kind === type).filter(alert => {
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

export function filterByNamespace(nodes, namespace) {
  if(namespace) {
    nodes = nodes.filter(nodeGroup => nodeGroup.properties.namespace === namespace || nodeGroup.kind === 'alert' ||
      nodeGroup.kind === 'cluster' || nodeGroup.kind === 'node');
  }

  return nodes;
}

export function filterNodes(nodes, links, namespace) {
  if(namespace !== '{}'){
    const k8sNodesOtherNamespace = filterK8sNodesOtherNamespace(nodes, links);
    const k8sNodesOtherNamespaceNames = k8sNodesOtherNamespace.map(node => node.id);
    const k8sNodesOtherNamespaceLinks = links.filter(link => k8sNodesOtherNamespaceNames.includes(link.source) || k8sNodesOtherNamespaceNames.includes(link.target));

    nodes = nodes.filter(nodeGroup => !k8sNodesOtherNamespace.includes(nodeGroup));
    links = links.filter(linkGroup => !k8sNodesOtherNamespaceLinks.includes(linkGroup));
  }

  return [nodes, links];
}

export function filterByTypes(nodes, kinds) {
  if(kinds) {
    nodes = nodes.filter(nodeGroup => kinds.includes(nodeGroup.kind));
  }

  return nodes;
}

export function filterByAlerts(nodes, links) {
  const alertsToHide = filterByType(nodes, links, 'alert');
  nodes = nodes.filter(nodeGroup => !alertsToHide.includes(nodeGroup));
  return nodes;
}

export function actualizeLinks(nodes, links) {
  const nodesName = nodes.map(nodeGroup => nodeGroup.id);
  links = links.filter(link => nodesName.includes(link.source) && nodesName.includes(link.target));
  return links;
}

export function detectFaultTrajectory(nodes, links) {
  const alerts = nodes.filter(nodeGroup => nodeGroup.kind === 'alert').map(alert => alert.id);
  const faultNodes = [];

  links.forEach(link => {
    if(alerts.includes(link.source) || alerts.includes(link.target)) {
      const object = alerts.includes(link.source) ? link.target : link.source;
      const objectNeighs = getNeighbours(links, object);
      objectNeighs.forEach(neigh => {
        const neighNeighs = getNeighbours(links, neigh);
        neighNeighs.forEach(neigh2 => {
          if(alerts.includes(neigh2)) {
            const faultLink = links.filter(faultLink => (faultLink.source === neigh && faultLink.target === object) ||
            (faultLink.source === object && faultLink.target === neigh))[0];
            faultLink.fault = true;
            if(!faultNodes.includes(faultLink.source)) faultNodes.push(faultLink.source);
            if(!faultNodes.includes(faultLink.target)) faultNodes.push(faultLink.target);
          }
        });
        return true;
      });
    }
    return true;
  });

  links = links.map(d => Object.assign({}, d));

  return [faultNodes, links];
}

export function prepareGraphData(data, namespace, kinds, nodeGroup) {
  var links = data.links;
  var nodes = d3.values(data.nodes);
  
  nodes = filterByNamespace(nodes, namespace);
  links = actualizeLinks(nodes, links);

  const filteredNodesComponents = filterNodes(nodes, links, namespace);
  nodes = filteredNodesComponents[0];
  links = filteredNodesComponents[1];

  nodes = filterByTypes(nodes, kinds);
  links = actualizeLinks(nodes, links);

  nodes = filterByAlerts(nodes, links);
  links = actualizeLinks(nodes, links);

  const old = new Map(nodeGroup.data().map(d => [d.id, d]));
  nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));

  const faultTrajectoryComponents = detectFaultTrajectory(nodes, links);
  const faultNodes = faultTrajectoryComponents[0];
  links = faultTrajectoryComponents[1];

  return [nodes, links, faultNodes];
}
