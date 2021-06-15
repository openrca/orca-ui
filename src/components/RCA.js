import React from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import queryString from 'query-string';
import * as d3 from 'd3';
import { getGraphData } from './GraphUtils';
import * as visualization from './Visualization';
import { IconMap } from './IconMap';
import { truncate } from './Utils';
import './Graph.scss';
import { Selector } from './Selector';

export class RCA extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      source: null,
      time_point: null,
      loading: true,
      rca: null,
      //Same format as in /v1/graph endpoint
      nodeGroup: null,
      scale_const: 0.5,
      selector_hidden: false
    };

    this.zoom = d3.zoom();

    this.generateGraph = this.generateGraph.bind(this);
    this.handleTrajectoryChange = this.handleTrajectoryChange.bind(this);
    this.ticked = this.ticked.bind(this);
    this.nodeCircleRadius = 16;
    this.nodeIconFontSize = 16;
    this.nodeLabelFontSize = 16;
    this.nodeLabelLength = 18;
    this.linkLabelFontSize = 10;
  }

  componentDidMount() {
    const div = document.getElementById('chart-area');
    div.style.visibility = 'hidden';
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

  handleTrajectoryChange(selected) {
    this.generateGraph(this.state.rca[selected]);
  }

  loadData() {
    axios.get(process.env.REACT_APP_BACKEND_HOST + '/v1/rca?source=' + this.state.source + '&time_point=' + this.state.time_point)
      .then((response) => {
        this.setState({
          rca: response.data
        }, () => {
          this.generateGraph(this.state.rca[0]);
          setTimeout(() => {
            visualization.scaleGraph(this.state.svg, this.state.g, this.zoom, this.state.scale_const);
            const div = document.getElementById('chart-area');
            div.style.visibility = 'visible';
            this.setState({
              loading: false,
              selector_hidden: false
            });
          }, 2000);
        });
      })
      .catch((err) => {
        console.log(err);
      });
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

    const linkGroup = g.append('g')
      .selectAll('.link-group')

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
      linkGroup: linkGroup,
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

  nodeMouseOver(nodeGroup) {
    const multiplier = 1.5;
    nodeGroup.raise();
    nodeGroup.selectAll('circle').attr('r', this.nodeCircleRadius * multiplier);
    nodeGroup.selectAll('.node-icon').attr('font-size', `${this.nodeIconFontSize * multiplier}px`);
    nodeGroup.selectAll('.node-label').attr('font-size', `${this.nodeLabelFontSize * multiplier}px`)
      .classed('mouse-over', true)
      .attr('y', this.nodeCircleRadius * 2 * multiplier)
      .text((d) => d.properties.name);


    const labelBBox = nodeGroup.select('.node-label').node().getBBox();

    nodeGroup.append('rect')
      .attr('class', (d) => `node-label-background ${d.kind}`)
      .classed('hidden', !this.state.showLabels)
      .attr('x', labelBBox.x - 4)
      .attr('y', labelBBox.y)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', labelBBox.width + 8)
      .attr('height', labelBBox.height)
      .lower();
  }

  nodeMouseOut(nodeGroup) {
    nodeGroup.selectAll('circle').attr('r', this.nodeCircleRadius);
    nodeGroup.selectAll('.node-icon').attr('font-size', `${this.nodeIconFontSize}px`);
    nodeGroup.selectAll('.node-label').attr('font-size', `${this.nodeLabelFontSize}px`)
      .classed('mouse-over', false)
      .attr('y', this.nodeCircleRadius * 2)
      .text((d) => truncate(d.properties.name, this.nodeLabelLength));
    nodeGroup.selectAll('.node-label-background').remove();
  }

  nodeClick(nodeGroup, nodeData) {
    visualization.clearClicked();
    nodeGroup.classed('clicked', true);
    this.setState({
      nodeData: nodeData,
      showDetailCard: true,
      displayStats: false
    });
  }

  generateGraph(data) {
    const objectKinds = [...new Set(data.nodes.map(nodeGroup => nodeGroup.kind))];
    const graphData = getGraphData(data, null, objectKinds, this.state.nodeGroup);

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

    const linkGroup = this.state.linkGroup
      .data(links, d => [d.source, d.target])
      .join(enter => enter.append('g')
        .attr('class', 'link-group')
        .attr('id', d => `link-group-${d.id}`))

    const link = linkGroup.append("line")
      .data(links, d => [d.source, d.target])
      .join('line')
      .attr('class', d => {return d.fault ? 'link fault' : 'link';});

    const linkText = linkGroup.append("text")
      .attr("class", "link-label")
      .attr('font-size', `${this.linkLabelFontSize}px`)
      .attr('text-anchor', 'middle')
      .text(d => d.properties.strength);

    nodeGroup
      .on('mouseover', d => this.nodeMouseOver(d3.select(`#node-group-${d.id}`), d))
      .on('mouseout', d => this.nodeMouseOut(d3.select(`#node-group-${d.id}`), d))
      .on('click', d => this.nodeClick(d3.select(`#node-group-${d.id}`), d));

    this.setState({
      nodeCircle: nodeCircle,
      nodeIcon: nodeIcon,
      nodeGroup: nodeGroup,
      showLabels: nodeLabel._groups[0].length > 0 ? !nodeLabel.classed('hidden') : null,
      link: link,
      linkText: linkText,
      linkGroup: linkGroup
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

    if(this.state.linkText) {
      this.state.linkText
        .attr('x', d => (d.source.x + d.target.x)/2)
        .attr('y', d => (d.source.y + d.target.y)/2)
    }

    this.state.nodeGroup
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
  }

  render() {
    return(
      <div>
        <span className="loader">
          <Loader type="TailSpin" visible={this.state.loading} color='#343a40' />
        </span>
        <div id="chart-area" />
        <Selector hidden={this.state.selector_hidden} options={this.state.rca} handleChange={this.handleTrajectoryChange} />
      </div>
    );
  }
}
