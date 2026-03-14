import React, { useEffect, useRef } from 'react';
import { Card } from '../components/ui';
import * as d3 from 'd3';

export default function NetworkGraph() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Mock Overtake Relationship Data
    const nodes = [{id: "Verstappen"}, {id: "Hamilton"}, {id: "Leclerc"}, {id: "Norris"}, {id: "Alonso"}];
    const links = [
      {source: "Verstappen", target: "Hamilton"},
      {source: "Hamilton", target: "Leclerc"},
      {source: "Leclerc", target: "Norris"},
      {source: "Norris", target: "Verstappen"}
    ];

    const width = 400;
    const height = 200;

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#475569")
        .attr("stroke-opacity", 0.6);

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#ef4444");

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("cx", d => d.x).attr("cy", d => d.y);
    });

  }, []);

  return (
    <Card className="p-6 bg-slate-800 border-slate-700 h-64 overflow-hidden text-white">
      <h3 className="font-bold mb-4">Network Graph: Overtake Relationship</h3>
      <svg ref={svgRef} width="100%" height="200"></svg>
    </Card>
  );
}
