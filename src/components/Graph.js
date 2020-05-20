import React from 'react';
import * as d3 from 'd3';
import data from './flare-2.json';

export class Graph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      link: null,
      node: null
    }
  }

  componentDidMount(){
    this.generateGraph();
  }

  generateGraph() {
    const width = 600;
    const height = 600;
    const svg = d3.select('#chart-area')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('link', d3.forceLink(links).id(d => d.id).distance(0).strength(1))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line');
    
    const node = svg.append('g')
      .attr('fill', '#fff')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('fill', d => d.children ? null : '#000')
      .attr('stroke', d => d.children ? null : '#fff')
      .attr('r', 3.5);
    
    node.append('title')
      .text((d) => {return d.id;});

    this.setState({
      link: link,
      node: node
    }, () => {
      simulation.on('tick', this.ticked.bind(this));
    })
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

  render(){
    return(
      <div className="app">
        <p> OpenRCA Graph</p>
        <div id="chart-area"></div>
      </div>
    );
  }
}
