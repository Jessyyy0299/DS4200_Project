// Set dimensions and margins with extra space for the title and y-axis
const margin = {top: 60, right: 20, bottom: 40, left: 60},
      width = 450 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom,
      plotHeight = height / 3;

// Append SVG and create a container
const svg = d3.select("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom + 40) // Extra space for legend
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
d3.csv("covariance_data.csv").then(data => {
  // Parse covariance values as numbers
  data.forEach(d => {
    d.covariance = +d.covariance;
  });

  // Define unique groups (ratios)
  const groups = Array.from(new Set(data.map(d => d.group)));
  const categories = ["low", "medium", "high"];
  const wineTypes = ["red", "white"];

  // Define color scale for wine types with stronger contrast
  const color = d3.scaleOrdinal()
                  .domain(wineTypes)
                  .range(['#D32F2F', '#1976D2']); // Darker red and blue for more contrast

  // Create one plot for each group (ratio), arranged vertically
  groups.forEach((group, i) => {
    const groupData = data.filter(d => d.group === group);

    // Define x scale for categories within each plot
    const x = d3.scaleBand()
                .domain(categories)
                .range([0, width])
                .padding(0.2);

    // Define y scale for each subplot individually
    const y = d3.scaleLinear()
                .domain([d3.min(groupData, d => d.covariance) * 1.1, d3.max(groupData, d => d.covariance) * 1.1])
                .range([plotHeight, 0]);

    // Define sub-scale for wine type within each category
    const xSubgroup = d3.scaleBand()
                        .domain(wineTypes)
                        .range([0, x.bandwidth()])
                        .padding(0.05);

    // Group for each subplot
    const plot = svg.append("g")
                    .attr("transform", `translate(0,${i * (plotHeight + margin.top / 4)})`);

    // Add y-axis for each plot
    plot.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .attr("font-size", "8px"); // Smaller y-axis labels

    // Add x-axis for each plot
    plot.append("g")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("font-size", "8px"); // Smaller x-axis labels

    // Add bars with slight outline for emphasis
    plot.selectAll(".bar")
        .data(groupData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category) + xSubgroup(d.type))
        .attr("y", d => y(d.covariance))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => plotHeight - y(d.covariance))
        .attr("fill", d => color(d.type))
        .attr("stroke", "#333")           // Outline to enhance contrast
        .attr("stroke-width", "0.3px");   // Thinner outline due to scaling

    // Add group name as a label below each subplot
    plot.append("text")
        .attr("x", width / 2)
        .attr("y", plotHeight + margin.bottom / 2)
        .attr("class", "axis-label")
        .style("text-anchor", "middle")
        .style("font-size", "10px") // Smaller group label font size
        .text(group.replace('_', ' '));
  });

  // Shared y-axis label with more spacing
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", -margin.left + 15)
     .attr("x", -height / 2)
     .attr("class", "axis-label")
     .attr("font-size", "10px") // Smaller shared y-axis label
     .style("text-anchor", "middle")
     .text("Covariance Score of Quality");

  // Adjusted main title position with extra top margin
  svg.append("text")
     .attr("x", width / 2)
     .attr("y", -margin.top + 20)
     .attr("class", "title")
     .style("text-anchor", "middle")
     .style("font-size", "16px") // Slightly smaller title font
     .text("Covariance of Quality with Ratios by Wine Type");

  // Adjusted legend position and size
  const legend = svg.append("g")
                    .attr("transform", `translate(${width - 80},${-margin.top + 30})`);

  legend.selectAll("legend-rect")
        .data(wineTypes)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 15)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => color(d));

  legend.selectAll("legend-text")
        .data(wineTypes)
        .enter()
        .append("text")
        .attr("x", 15)
        .attr("y", (d, i) => i * 15 + 8)
        .text(d => d.charAt(0).toUpperCase() + d.slice(1))
        .attr("class", "legend")
        .attr("font-size", "10px");
});
