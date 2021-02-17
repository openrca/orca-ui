import * as d3 from 'd3';

function filterByKind(nodes, links, kind) {
  return nodes.filter(nodeGroup => nodeGroup.kind === kind).filter(alert => {
    var valid = false;
    links.forEach(link => {
      if(link.source === alert.id || link.target === alert.id) valid = true;
    });
    return !valid;
  });
}

function filterK8sNodesOtherNamespace(nodes, links) {
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

function getNeighbours(links, object) {
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

function filterByNamespace(nodes, namespace) {
  if(namespace) {
    nodes = nodes.filter(nodeGroup => nodeGroup.properties.namespace === namespace || nodeGroup.kind === 'alert' ||
      nodeGroup.kind === 'cluster' || nodeGroup.kind === 'node');
  }

  return nodes;
}

function filterNodes(nodes, links, namespace) {
  if(namespace !== '{}'){
    const k8sNodesOtherNamespace = filterK8sNodesOtherNamespace(nodes, links);
    const k8sNodesOtherNamespaceNames = k8sNodesOtherNamespace.map(node => node.id);
    const k8sNodesOtherNamespaceLinks = links.filter(link => k8sNodesOtherNamespaceNames.includes(link.source) || k8sNodesOtherNamespaceNames.includes(link.target));

    nodes = nodes.filter(nodeGroup => !k8sNodesOtherNamespace.includes(nodeGroup));
    links = links.filter(linkGroup => !k8sNodesOtherNamespaceLinks.includes(linkGroup));
  }

  return [nodes, links];
}

function filterByKinds(nodes, kinds) {
  if(kinds) {
    nodes = nodes.filter(nodeGroup => kinds.includes(nodeGroup.kind));
  }

  return nodes;
}

function filterByAlerts(nodes, links) {
  const alertsToHide = filterByKind(nodes, links, 'alert');
  nodes = nodes.filter(nodeGroup => !alertsToHide.includes(nodeGroup));
  return nodes;
}

function getLinksBetweenNodes(nodes, links) {
  const nodesName = nodes.map(nodeGroup => nodeGroup.id);
  links = links.filter(link => nodesName.includes(link.source) && nodesName.includes(link.target));
  return links;
}

function detectFaultTrajectory(nodes, links) {
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

export function getGraphData(data, namespace, kinds, nodeGroup) {
  var links = data.links;
  var nodes = d3.values(data.nodes);
  
  nodes = filterByNamespace(nodes, namespace);
  links = getLinksBetweenNodes(nodes, links);

  const filteredNodesComponents = filterNodes(nodes, links, namespace);
  nodes = filteredNodesComponents[0];
  links = filteredNodesComponents[1];

  nodes = filterByKinds(nodes, kinds);
  links = getLinksBetweenNodes(nodes, links);

  nodes = filterByAlerts(nodes, links);
  links = getLinksBetweenNodes(nodes, links);

  const old = new Map(nodeGroup.data().map(d => [d.id, d]));
  nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));

  const faultTrajectoryComponents = detectFaultTrajectory(nodes, links);
  const faultNodes = faultTrajectoryComponents[0];
  links = faultTrajectoryComponents[1];

  return [nodes, links, faultNodes];
}
