import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TechTreeProps {
  data: any;
}

export default function TechTree({ data }: TechTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    
    // Ensure data has at least a name or children to be hierarchical
    if (!data.name && (!data.children || data.children.length === 0)) {
      console.warn('TechTree: Invalid data structure', data);
      return;
    }

    const root = d3.hierarchy(data);
    tree(root);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return (d3.linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x) as any)(d);
      })
      .attr("fill", "none")
      .attr("stroke", "#141414")
      .attr("stroke-opacity", 0.2)
      .attr("stroke-width", 1.5);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", (d: any) => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 6)
      .attr("fill", (d: any) => d.children ? "#141414" : "#fff")
      .attr("stroke", "#141414")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.children ? -10 : 10)
      .attr("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.name)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("text-transform", "uppercase")
      .attr("letter-spacing", "0.05em");

    // Tooltip simulation
    node.on("mouseover", function(event, d: any) {
      d3.select(this).select("circle").attr("r", 8).attr("fill", "#141414");
    }).on("mouseout", function(event, d: any) {
      d3.select(this).select("circle").attr("r", 6).attr("fill", d.children ? "#141414" : "#fff");
    });

  }, [data]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 500" 
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
