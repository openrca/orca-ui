import React from 'react';
import * as d3 from 'd3';
import axios from 'axios';

import { DateTimePicker } from './DateTimePicker';

export class Graph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      link: null,
      node: null,
      simulation: null
    };

    this.generateGraph = this.generateGraph.bind(this);
    this.graphUpdate = this.graphUpdate.bind(this);
    this.onDateTimeSelect = this.onDateTimeSelect.bind(this);
    this.ticked = this.ticked.bind(this);
  }

  componentDidMount(){
    this.prepareSvg();
    this.loadData(this.generateGraph);
  }

  onDateTimeSelect(){
    this.loadData(this.graphUpdate);
  }

  loadData(cb) {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/graph')
      .then((response) => {
        cb(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  graphUpdate(response){
    this.generateGraph(response);
  }

  prepareSvg(){
    const svg = d3.select('#chart-area')
      .append('svg')
      .style('width', '100%')
      .style('height', '100%');

    const g = svg
      .call(d3.zoom().on('zoom', () => {
        g.attr('transform', d3.event.transform);
      }))
      .append('g');

    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(width / 2, height / 2))
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
      simulation: simulation
    });
  }

  generateGraph(response) {
    var links = response.data.links;
    var nodes = d3.values(response.data.nodes);

    const old = new Map(this.state.node.data().map(d => [d.id, d]));
    nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    links = links.map(d => Object.assign({}, d));

    const node = this.state.node
      .data(nodes, d => d.id)
      .join(enter => enter.append('circle'))
      .attr('r', 10)
      .attr('fill', d => d.kind === 'pod' ? '#3f33ff' : null)
      .attr('fill', d => d.kind === 'service' ? '#68686f' : null)
      .call(this.drag(this.state.simulation));

    node.append('title')
      .text((d) => {return d.id;});
      
    const link = this.state.link
      .data(links, d => [d.source, d.target])
      .join('line');

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
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    this.state.node
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
  }

  drag(simulation) {
    function dragstarted(d) {
      if(!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
  
    function dragended(d) {
      if(!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  render(){
    return(
      <div>
        <div id="chart-area" />
        <DateTimePicker onSelect={this.onDateTimeSelect}/>
      </div>
    );
  }
}
