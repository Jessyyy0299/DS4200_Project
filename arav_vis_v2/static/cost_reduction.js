d3.csv("../data/combined_wine_quality.csv").then(function (data) {
  const chemicalProperties = Object.keys(data[0]).filter(
    (key) => key !== "quality" && key !== "type" && !isNaN(data[0][key])
  );

  const propertySelect = document.getElementById("chemical-property");
  chemicalProperties.forEach((prop) => {
    propertySelect.add(new Option(prop, prop));
  });

  propertySelect.value = "citric acid";

  updatePlot();

  propertySelect.addEventListener("change", updatePlot);

  function updatePlot() {
    const propertyName = propertySelect.value;

    d3.select("#property-quality-plot").html("");

    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const width =
      document.getElementById("property-quality-plot").offsetWidth -
      margin.left -
      margin.right;
    const height =
      document.getElementById("property-quality-plot").offsetHeight -
      margin.top -
      margin.bottom;

    const svg = d3
      .select("#property-quality-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get unique quality values and sort them
    const qualities = Array.from(new Set(data.map(d => +d.quality))).sort((a, b) => a - b);

    // Create color scale
    const color = d3
      .scaleSequential()
      .domain([d3.min(qualities), d3.max(qualities)])
      .interpolator(d3.interpolateViridis);

    // Create x scale with some padding
    const xExtent = d3.extent(data, d => +d[propertyName]);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.05;
    const x = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, width]);

    // Calculate densities for all quality levels first to get the max density
    const allDensities = [];
    qualities.forEach(quality => {
      const qualityData = data.filter(d => +d.quality === quality)
        .map(d => +d[propertyName]);
      const kde = kernelDensityEstimator(kernelEpanechnikov(0.5), x.ticks(50));
      const density = kde(qualityData);
      allDensities.push(...density.map(d => d[1]));
    });

    // Create y scale with the max density
    const y = d3.scaleLinear()
      .domain([0, d3.max(allDensities) * 1.05]) // Add 5% padding to the top
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Compute and draw density curves for each quality level
    qualities.forEach(quality => {
      const qualityData = data.filter(d => +d.quality === quality)
        .map(d => +d[propertyName]);

      // Generate density data
      const kde = kernelDensityEstimator(kernelEpanechnikov(0.5), x.ticks(50));
      const density = kde(qualityData);

      // Add the area
      svg.append("path")
        .datum(density)
        .attr("fill", "none")
        .attr("stroke", color(quality))
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(d => x(d[0]))
          .y(d => y(d[1]))
        )
        .attr("class", "density-line")
        .on("mouseover", function(event) {
          // Highlight this line
          d3.select(this)
            .attr("stroke-width", 4);
          
          // Show tooltip
          const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
          
          tooltip.html(`Quality Level: ${quality}`);
        })
        .on("mouseout", function() {
          // Reset line thickness
          d3.select(this)
            .attr("stroke-width", 2);
          
          // Hide tooltip
          d3.select(".tooltip").remove();
        });
    });

    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .style("text-anchor", "middle")
      .text(propertyName);

    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .style("text-anchor", "middle")
      .text("Density");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 10}, 0)`);

    qualities.forEach((quality, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", color(quality))
        .attr("stroke-width", 2);
      
      legendRow.append("text")
        .attr("x", 25)
        .attr("y", 4)
        .text(`Quality ${quality}`);
    });
  }

  // Kernel density estimator functions
  function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
    };
  }

  function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }
});
