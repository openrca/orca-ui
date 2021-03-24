import React from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import queryString from 'query-string';
import * as d3 from 'd3';
import { getGraphData } from './GraphUtils';
import * as visualization from './Visualization';
import { IconMap } from './IconMap';
import { truncate } from './Utils';

export class RCA extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      source: null,
      time_point: null,
      loading: true,
      rca: null,
      //Same format as in /v1/graph endpoint
      graphData: null
    };

    this.zoom = d3.zoom();
  }

  componentDidMount() {
    this.handleQueryParams();
  }

  handleQueryParams() {
    const params = queryString.parse(this.props.location.search);
    
    this.setState({
      source: params.source,
      time_point: params.time_point
    }, () => {
      this.prepareSvg();
      this.loadData();
    });
  }

  loadData() {
    // axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/rca?source=' + this.state.source + '&time_point=' + this.state.time_point)
    //   .then((response) => {
    //     this.setState({
    //       rca: response.data,
    //       loading: false
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    this.setState({
      loading: false,
      rca: [
            {
                "nodes": [{
                  "id": "1",
                  "kind": "cluster",
                  "origin": "kubernetes",
                  "properties": {
                      "name": "cluster"
                  }
                }, {"id": "2",
                    "kind": "cluster",
                    "origin": "kubernetes",
                    "properties": {
                        "name": "cluster"
                    }
                  }],
                "links": [{        
                  "id": "aeffcea5-01ee-5c90-a16a-6ba296e0f3f7",
                  "source": "1",
                  "target": "2"
              }],
                "score": 0.555
            },
            {
                "nodes": [],
                "links": [],
                "score": 0.555
            },
            {
                "nodes": [],
                "links": [],
                "score": 0.555
            }
        ]
   }, () => {
     this.generateGraph(this.state.rca[0]);
   })
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
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collide', d3.forceCollide().strength(.7).radius(function(d) {
        return d.radius;
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

    const nodeLabel = g.append('g')
      .selectAll('text');

    this.setState({
      link: link,
      nodeGroup: nodeGroup,
      nodeCircle: nodeCircle,
      nodeIcon: nodeIcon,
      nodeLabel: nodeLabel,
      showLabels: false,
      simulation: simulation,
      svg: svg,
      g: g
    });
  }

  generateGraph(data) {
    const graphData = getGraphData(data, this.state.namespace, this.state.kinds, this.state.nodeGroup);
    
    const nodes = graphData[0];
    const links = graphData[1];
    const faultNodes = graphData[2];

    const nodeGroup = this.state.nodeGroup
      .data(nodes, d => d.id)
      .join(enter => enter.append('g')
        .attr('class', 'node-group')
        .attr('id', d => `node-group-${d.id}`))
      .call(visualization.drag(this.state.simulation));

    //Removing old
    const circles = nodeGroup.selectAll('circle');
    circles.remove();

    const text = nodeGroup.selectAll('text');
    text.remove();

    const nodeCircle = nodeGroup.append('circle')
      .attr('id', d => `graph-node-${d.id}`)
      .attr('class', d => { return faultNodes.includes(d.id) ? `graph-node ${d.kind} fault` : `graph-node ${d.kind}`;})
      .attr('r', this.nodeCircleRadius);

    nodeCircle.append('title')
      .text((d) => { return d.id; });

    const nodeIcon = nodeGroup.append('text')
      .attr('class', d => `fas node-icon ${d.kind}`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${this.nodeIconFontSize}px`)
      .text((d) => IconMap[d.kind]);

    const nodeLabel = nodeGroup.append('text')
      .attr('class', (d) => `node-label ${d.kind}`)
      .classed('hidden', !this.state.showLabels)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${this.nodeLabelFontSize}px`)
      .attr('y', this.nodeCircleRadius * 2)
      .text((d) => truncate(d.properties.name, this.nodeLabelLength));

    const link = this.state.link
      .data(links, d => [d.source, d.target])
      .join('line')
      .attr('class', d => {return d.fault ? 'link fault' : 'link';});

    nodeGroup
      .on('mouseover', d => this.nodeMouseOver(d3.select(`#node-group-${d.id}`), d))
      .on('mouseout', d => this.nodeMouseOut(d3.select(`#node-group-${d.id}`), d))
      .on('click', d => this.nodeClick(d3.select(`#node-group-${d.id}`), d));

    this.setState({
      nodeCircle: nodeCircle,
      nodeIcon: nodeIcon,
      nodeGroup: nodeGroup,
      showLabels: nodeLabel._groups[0].length > 0 ? !nodeLabel.classed('hidden') : null,
      link: link
    }, () => {
      this.state.simulation.nodes(nodes);
      this.state.simulation.force('link').links(links);
      this.state.simulation.alpha(1).restart();
      //this.calculateGraphStats(nodes);
    });
  }

  render() {
    return(
      <div>
        <span className="loader">
          <Loader type="TailSpin" visible={this.state.loading} color='#343a40' />
        </span>
        <div id="chart-area" />
      </div>
    );
  }
}
