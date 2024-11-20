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

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
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

    const propertyValues = data.map((d) => +d[propertyName]);
    const bins = 5;
    const binWidth = (d3.max(propertyValues) - d3.min(propertyValues)) / bins;

    const binnedData = d3
      .bin()
      .domain(d3.extent(propertyValues))
      .thresholds(bins)(propertyValues);

    const groupedData = [];
    binnedData.forEach((bin, i) => {
      const binRange = `${bin.x0.toFixed(2)} - ${bin.x1.toFixed(2)}`;
      const qualityCounts = d3.rollup(
        data.filter(
          (d) => +d[propertyName] >= bin.x0 && +d[propertyName] < bin.x1
        ),
        (v) => v.length,
        (d) => d.quality
      );
      qualityCounts.forEach((count, quality) => {
        groupedData.push({
          bin: binRange,
          quality: quality,
          count: count,
        });
      });
    });

    const x = d3
      .scaleBand()
      .domain(Array.from(new Set(groupedData.map((d) => d.bin))))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(groupedData, (d) => d.count)])
      .range([height, 0]);

    const color = d3
      .scaleSequential()
      .domain([3, 9])
      .interpolator(d3.interpolateViridis);

    svg
      .selectAll("rect")
      .data(groupedData)
      .join("rect")
      .attr("x", (d) => x(d.bin))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", (d) => color(d.quality))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8);
        showTooltip(event, d);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
        hideTooltip();
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .style("text-anchor", "middle")
      .text(`${propertyName} Ranges`);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .style("text-anchor", "middle")
      .text("Count");
  }

  function showTooltip(event, d) {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px");

    tooltip.html(`
            Range: ${d.bin}<br>
            Quality: ${d.quality}<br>
            Count: ${d.count}
        `);
  }

  function hideTooltip() {
    d3.select(".tooltip").remove();
  }
});
