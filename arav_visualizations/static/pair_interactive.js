d3.csv("../data/combined_wine_quality.csv").then(function (data) {
  const numericalColumns = Object.keys(data[0]).filter(
    (key) => !isNaN(data[0][key])
  );

  const xSelect = document.getElementById("x-axis");
  const ySelect = document.getElementById("y-axis");

  numericalColumns.forEach((col) => {
    xSelect.add(new Option(col, col));
    ySelect.add(new Option(col, col));
  });

  xSelect.value = "pH";
  ySelect.value = "citric acid";

  updatePlot();

  xSelect.addEventListener("change", updatePlot);
  ySelect.addEventListener("change", updatePlot);

  function updatePlot() {
    const xValue = xSelect.value;
    const yValue = ySelect.value;

    d3.select("#scatter-hex-plot").html("");

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width =
      document.getElementById("scatter-hex-plot").offsetWidth -
      margin.left -
      margin.right;
    const height =
      document.getElementById("scatter-hex-plot").offsetHeight -
      margin.top -
      margin.bottom;

    const svg = d3
      .select("#scatter-hex-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[xValue]))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[yValue]))
      .range([height, 0]);

    const numBins = 30;
    const xBins = d3.bin().domain(x.domain()).thresholds(numBins)(
      data.map((d) => +d[xValue])
    );

    const yBins = d3.bin().domain(y.domain()).thresholds(numBins)(
      data.map((d) => +d[yValue])
    );

    const densityData = Array(numBins)
      .fill()
      .map(() => Array(numBins).fill(0));

    data.forEach((d) => {
      const xBin = Math.floor((x(+d[xValue]) / width) * numBins);
      const yBin = Math.floor((1 - y(+d[yValue]) / height) * numBins);
      if (xBin >= 0 && xBin < numBins && yBin >= 0 && yBin < numBins) {
        densityData[yBin][xBin]++;
      }
    });

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(densityData.flat())])
      .interpolator(d3.interpolateBlues);

    const cellWidth = width / numBins;
    const cellHeight = height / numBins;

    svg
      .selectAll("g")
      .data(densityData)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * cellHeight})`)
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d, i) => i * cellWidth)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("fill", (d) => colorScale(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text(xValue);

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(yValue);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`${xValue} vs ${yValue}`);
  }
});
