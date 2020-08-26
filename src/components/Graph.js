import React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import { Button } from 'react-bootstrap';

import { DateTimePicker } from './DateTimePicker';
import { NodeDetailCard } from './NodeDetailCard';
import { IconMap } from './IconMap';
import './Graph.scss';


export class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      link: null,
      nodeCircle: null,
      nodeIcon: null,
      nodeGroup: null,
      simulation: null,
      namespaceOptions: [],
      objectKindOptions: [],
      namespace: null,
      kinds: null,
      data: null,
      svg: null,
      g: null,
      loading: true,
      stat: null
    };

    this.zoom = d3.zoom();

    this.generateGraph = this.generateGraph.bind(this);
    this.onDateTimeSelect = this.onDateTimeSelect.bind(this);
    this.ticked = this.ticked.bind(this);
    this.handleNamespaceChange = this.handleNamespaceChange.bind(this);
    this.handleKindChange = this.handleKindChange.bind(this);
    this.nodeCircleRadius = 16;
    this.nodeIconFontSize = 16;
    this.nodeDetailCard = React.createRef();
    this.scaleGraph = this.scaleGraph.bind(this);
    this.graphLoad = this.graphLoad.bind(this);
    this.handleStatButton = this.handleStatButton.bind(this);
  }

  componentDidMount() {
    const div = document.getElementById('chart-area');
    div.style.visibility = 'hidden';
    this.prepareSvg();
    this.loadData();
  }

  onDateTimeSelect(timestamp) {
    this.loadData(timestamp);
  }

  handleNamespaceChange(e) {
    const namespace = e ? e.value : null;
    this.setState({
      namespace: namespace
    }, () => {
      this.generateGraph(this.state.data);
    });
  }

  handleKindChange(selectList) {
    console.log(selectList);
    const kindList = selectList && selectList.length > 0 ? selectList.map(e => e.value) : null;
    this.setState({
      kinds: kindList
    }, () => {
      this.generateGraph(this.state.data);
    });
  }

  loadData(timestamp = null) {
    const param = timestamp ? `?time_point=${timestamp}` : '';
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/graph' + param)
      .then((response) => {
        const namespaces = [...new Set(response.data.nodes.map(nodeGroup => nodeGroup.properties ? nodeGroup.properties.namespace : null))];
        const namespaceOptions = namespaces.map(namespace => ({
          value: namespace,
          label: namespace
        }));

        const objectTypes = [...new Set(response.data.nodes.map(nodeGroup => nodeGroup.kind))];
        const objectKindOptions = objectTypes.map(type => ({
          value: type,
          label: type
        }));

        this.setState({
          namespaceOptions: namespaceOptions,
          objectKindOptions: objectKindOptions,
          data: response.data
        }, () => {
          this.generateGraph(response.data);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  clearClicked() {
    d3.selectAll('.clicked').classed('clicked', false);
  }

  nodeMouseOver(nodeGroup) {
    const multiplier = 1.5;
    nodeGroup.select('circle').attr('r', this.nodeCircleRadius * multiplier);
    nodeGroup.select('text').attr('font-size', `${this.nodeIconFontSize * multiplier}px`);
  }

  nodeMouseOut(nodeGroup) {
    nodeGroup.select('circle').attr('r', this.nodeCircleRadius);
    nodeGroup.select('text').attr('font-size', `${this.nodeIconFontSize}px`);
  }

  nodeClick(nodeGroup, nodeData) {
    this.clearClicked();
    nodeGroup.classed('clicked', true);
    this.nodeDetailCard.current.updateNodeData(nodeData);
    this.nodeDetailCard.current.show();
  }

  prepareSvg() {
    const svg = d3.select('#chart-area')
      .append('svg')
      .attr('class', 'graph')
      .style('width', '100%')
      .style('height', '100%');

    const g = svg
      .call(this.zoom.on('zoom', () => {
        g.attr('transform', d3.event.transform);
      }))
      .append('g');

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(100).strength(1))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('collide', d3.forceCollide().strength(.7).radius(function(d) {
        return d.radius
      }))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', this.ticked);

    const link = g.append('g')
      .selectAll('line');

    const nodeGroup = g.append('g')
      .selectAll('.node-group');

    const nodeCircle = g.append('g')
      .selectAll('circle');

    const nodeIcon = g.append('g')
      .selectAll('text');

    this.setState({
      link: link,
      nodeGroup: nodeGroup,
      nodeCircle: nodeCircle,
      nodeIcon: nodeIcon,
      simulation: simulation,
      svg: svg,
      g: g
    }, () => {
      setTimeout(this.graphLoad, 2000);
    });
  }

  graphLoad() {
    this.setState({
      loading: false
    }, () => {
      const div = document.getElementById('chart-area');
      div.style.visibility = 'visible';
      this.scaleGraph();
    });
  }

  scaleGraph() {
    const svg = this.state.svg;
    const g = this.state.g;

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const graphX = g.node().getBBox().x;
    const graphY = g.node().getBBox().y;
    const graphWidth = g.node().getBBox().width;
    const graphHeight = g.node().getBBox().height;

    const scale = 0.95 / Math.max(graphWidth / width, graphHeight / height);

    const transform = d3.zoomIdentity
      .translate(width / 2 - scale * (graphX + graphWidth / 2), height / 2 - scale * (graphY + graphHeight / 2))
      .scale(scale);

    svg
      .transition()
      .duration(0)
      .call(this.zoom.transform, transform);
  }

  filterAlertOtherNamespace(nodes, links) {
    return nodes.filter(nodeGroup => nodeGroup.kind === 'alert').filter(alert => {
      var valid = false;
      links.forEach(link => {
        if(link.source === alert.id || link.target === alert.id) valid = true;
      });
      return !valid;
    });
  }

  filterK8sNodesOtherNamespace(nodes, links) {
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

  generateGraph(data) {
    var links = data.links;
    var nodes = d3.values(data.nodes);

    //Filter by namespace
    if (this.state.namespace) {
      nodes = nodes.filter(nodeGroup => nodeGroup.properties.namespace === this.state.namespace || nodeGroup.kind === 'alert' || 
        nodeGroup.kind === 'cluster' || nodeGroup.kind === 'node');
    }

    var nodesName = nodes.map(nodeGroup => nodeGroup.id);
    links = links.filter(link => nodesName.includes(link.source) && nodesName.includes(link.target));

    //Filter alerts
    const alertsOtherNamespace = this.filterAlertOtherNamespace(nodes, links);
    nodes = nodes.filter(nodeGroup => !alertsOtherNamespace.includes(nodeGroup));
    
    //Filter nodes
    if(this.state.namespace !== '{}'){
      const k8sNodesOtherNamespace = this.filterK8sNodesOtherNamespace(nodes, links);
      const k8sNodesOtherNamespaceNames = k8sNodesOtherNamespace.map(node => node.id);
      const k8sNodesOtherNamespaceLinks = links.filter(link => k8sNodesOtherNamespaceNames.includes(link.source) || k8sNodesOtherNamespaceNames.includes(link.target));
    
      nodes = nodes.filter(nodeGroup => !k8sNodesOtherNamespace.includes(nodeGroup));
      links = links.filter(linkGroup => !k8sNodesOtherNamespaceLinks.includes(linkGroup));
    }

    //Filter by type
    if(this.state.kinds) {
      nodes = nodes.filter(nodeGroup => this.state.kinds.includes(nodeGroup.kind));
    }

    nodesName = nodes.map(nodeGroup => nodeGroup.id);
    links = links.filter(link => nodesName.includes(link.source) && nodesName.includes(link.target));

    const old = new Map(this.state.nodeGroup.data().map(d => [d.id, d]));
    nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    links = links.map(d => Object.assign({}, d));

    const nodeGroup = this.state.nodeGroup
      .data(nodes, d => d.id)
      .join(enter => enter.append('g')
        .attr('class', 'node-group')
        .attr('id', d => `node-group-${d.id}`))
      .call(this.drag(this.state.simulation));

    const nodeCircle = nodeGroup.append('circle')
      .attr('id', d => `graph-node-${d.id}`)
      .attr('class', d => `graph-node ${d.kind}`)
      .attr('r', this.nodeCircleRadius);

    nodeCircle.append('title')
      .text((d) => { return d.id; });

    const nodeIcon = nodeGroup.append('text')
      .attr('class', d => `fas node-icon ${d.kind}`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${this.nodeIconFontSize}px`)
      .text((d) => IconMap[d.kind]);

    const link = this.state.link
      .data(links, d => [d.source, d.target])
      .join('line')
      .attr('class', 'link');

    nodeGroup
      .on('mouseover', d => this.nodeMouseOver(d3.select(`#node-group-${d.id}`), d))
      .on('mouseout', d => this.nodeMouseOut(d3.select(`#node-group-${d.id}`), d))
      .on('click', d => this.nodeClick(d3.select(`#node-group-${d.id}`), d));

    this.setState({
      nodeCircle: nodeCircle,
      nodeIcon: nodeIcon,
      nodeGroup: nodeGroup,
      link: link
    }, () => {
      this.state.simulation.nodes(nodes);
      this.state.simulation.force('link').links(links);
      this.state.simulation.alpha(1).restart();
      this.calculateGraphStats(nodes);
    });
  }

  ticked() {
    this.state.link
      .attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

    this.state.nodeGroup
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
  }

  drag(simulation) {
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

  calculateGraphStats(nodes) {
    const stat = {};
    stat.all = nodes.length;
    nodes.reduce((acc, nodeGroup) => {
      stat[nodeGroup.kind] ? stat[nodeGroup.kind] += 1 : stat[nodeGroup.kind] = 1;
      return stat;
    }, stat);
    this.setState({
      stat: stat
    });
  }

  handleStatButton() {
    this.clearClicked();
    this.nodeDetailCard.current.updateNodeData({
      kind: 'Statistics',
      properties: this.state.stat
    });
    this.nodeDetailCard.current.show();
  }

  render() {
    return (
      <div>
        <span className="loader">
          <Loader type="TailSpin" visible={this.state.loading} color='#343a40' />
        </span>
        <Button className="stats" onClick={this.handleStatButton} variant="outline-dark" size="xs">
          Stats
        </Button>
        <div id="chart-area" />
        <NodeDetailCard ref={this.nodeDetailCard} />
        <DateTimePicker onSelect={this.onDateTimeSelect} namespaceOptions={this.state.namespaceOptions}
          objectKindOptions={this.state.objectKindOptions} handleNamespaceChange={this.handleNamespaceChange}
          handleKindChange={this.handleKindChange} />
      </div>
    );
  }
}
