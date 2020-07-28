import React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import Loader from 'react-loader-spinner';

import { DateTimePicker } from './DateTimePicker';
import { NodeDetailCard } from './NodeDetailCard';
import './Graph.scss';


export class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      link: null,
      node: null,
      simulation: null,
      options: [],
      namespace: null,
      data: null,
      svg: null,
      g: null,
      loading: true
    };

    this.zoom = d3.zoom();

    this.generateGraph = this.generateGraph.bind(this);
    this.onDateTimeSelect = this.onDateTimeSelect.bind(this);
    this.ticked = this.ticked.bind(this);
    this.handleNamespaceChange = this.handleNamespaceChange.bind(this);
    this.nodeCircleRadius = 10;
    this.nodeDetailCard = React.createRef();
    this.scaleGraph = this.scaleGraph.bind(this);
    this.graphLoad = this.graphLoad.bind(this);
  }

  componentDidMount() {
    const div = document.getElementById('chart-area');
    div.style.visibility = 'hidden';
    this.prepareSvg();
    this.loadData();
  }

  onDateTimeSelect() {
    this.loadData();
  }

  handleNamespaceChange(e) {
    const namespace = e ? e.value : null;
    this.setState({
      namespace: namespace
    }, () =>{
      this.generateGraph(this.state.data);
    });
  }

  loadData() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/graph')
      .then((response) => {
        const namespaces = [...new Set(response.data.nodes.map(node => node.properties ? node.properties.namespace : null))];
        const options = namespaces.map(namespace => ({
          value: namespace,
          label: namespace
        }));

        this.setState({
          options: options,
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

  nodeMouseOver(node) {
    const radiusMultiplier = 1.5;
    node.attr('r', this.nodeCircleRadius * radiusMultiplier);
  }

  nodeMouseOut(node) {
    node.attr('r', this.nodeCircleRadius);
  }

  nodeClick(node, nodeData) {
    this.clearClicked();
    node.classed('clicked', true);
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
      .force('charge', d3.forceManyBody().strength(-50))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', this.ticked);

    const link = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 1.0)
      .selectAll('line');

    const node = g.append('g')
      .attr('fill', '#fff')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .selectAll('circle');

    this.setState({
      link: link,
      node: node,
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

  scaleGraph(){
    const svg = this.state.svg;
    const g  = this.state.g;

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const graphX = g.node().getBBox().x;
    const graphY = g.node().getBBox().y;
    const graphWidth = g.node().getBBox().width;
    const graphHeight = g.node().getBBox().height;

    const scale = 0.95 / Math.max( graphWidth/width, graphHeight/height );

    const transform = d3.zoomIdentity
      .translate(width/2 - scale * (graphX + graphWidth/2), height/2 - scale * (graphY + graphHeight/2))
      .scale(scale);

    svg
      .transition()
      .duration(0)
      .call(this.zoom.transform, transform);
  }

  generateGraph(data) {
    var links = data.links;
    var nodes = d3.values(data.nodes);

    if(this.state.namespace){
      nodes = nodes.filter(node => node.properties.namespace === this.state.namespace || node.kind === 'alert');
    }

    const nodesName = nodes.map(node => node.id);
    links = links.filter(link => nodesName.includes(link.source) && nodesName.includes(link.target));

    const alertsOtherNamespace = nodes.filter(node => node.kind === 'alert').filter(alert => {
      var valid = false;
      links.forEach(link => {
        if(link.source === alert.id || link.destination === alert.id) {
          valid = true;
        }
      });
      return !valid;
    });

    nodes = nodes.filter(node => !alertsOtherNamespace.includes(node));

    const old = new Map(this.state.node.data().map(d => [d.id, d]));
    nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    links = links.map(d => Object.assign({}, d));

    const node = this.state.node
      .data(nodes, d => d.id)
      .join(enter => enter.append('circle'))
      .attr('id', d => `graph-node-${d.id}`)
      .attr('class', d => `graph-node ${d.kind}`)
      .attr('r', this.nodeCircleRadius)
      .call(this.drag(this.state.simulation));

    node.append('title')
      .text((d) => { return d.id; });

    const link = this.state.link
      .data(links, d => [d.source, d.target])
      .join('line');
    node
      .on('mouseover', d => this.nodeMouseOver(d3.select(`#graph-node-${d.id}`), d))
      .on('mouseout', d => this.nodeMouseOut(d3.select(`#graph-node-${d.id}`), d))
      .on('click', d => this.nodeClick(d3.select(`#graph-node-${d.id}`), d));

    this.setState({
      node: node,
      link: link
    }, () => {
      this.state.simulation.nodes(nodes);
      this.state.simulation.force('link').links(links);
      this.state.simulation.alpha(1).restart();
    });
  }

  ticked() {
    this.state.link
      .attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });

    this.state.node
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
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

  render() {
    return (
      <div>
        <span className="loader">
          <Loader type="TailSpin" visible={this.state.loading} color='#343a40'/>
        </span>
        <div id="chart-area" />
        <NodeDetailCard ref={this.nodeDetailCard} />
        <DateTimePicker onSelect={this.onDateTimeSelect} options={this.state.options} handleNamespaceChange={this.handleNamespaceChange}/>
      </div>
    );
  }
}
