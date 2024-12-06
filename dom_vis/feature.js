let wineData = { red: {}, white: {} };
let originalData = { red: [], white: [] };
let filteredData = { red: [], white: [] };

// Function to create dropdown options for each feature dynamically
function createDropdown(features) {
    const dropdown = document.getElementById('featureDropdown');
    features.forEach(feature => {
        let option = document.createElement('option');
        option.value = feature;
        option.textContent = feature;
        dropdown.appendChild(option);
    });
}

// Parse CSV file and load data
Papa.parse("combined_wine_quality.csv", {
    download: true,
    header: true,
    complete: function (results) {
        let data = results.data;
        // Segregate red and white wine data
        let redData = data.filter(d => d.type === 'red');
        let whiteData = data.filter(d => d.type === 'white');
        originalData.red = redData;
        originalData.white = whiteData;
        let features = Object.keys(redData[0]).filter(key => key !== 'type' && key !== 'quality');

        filterDataByQuality();
        createDropdown(features);
        updateChart(features[0]);
    }
});

let ctx = document.getElementById('wineChart').getContext('2d');
let wineChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Wine Feature'
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Percentage'
                }
            }
        }
    }
});

function updateChart(feature) {
    if (!feature) return;

    // Calculate percentages for Low, Medium, High using quantiles
    const calculatePercentages = (data) => {
        const sortedData = [...data].sort((a, b) => a - b);
        const total = data.length;
        const lowThreshold = sortedData[Math.floor(total * 0.33)];
        const highThreshold = sortedData[Math.floor(total * 0.66)];

        let low = 0, medium = 0, high = 0;
        data.forEach(value => {
            if (value <= lowThreshold) {
                low++;
            } else if (value <= highThreshold) {
                medium++;
            } else {
                high++;
            }
        });

        return [
            (low / total) * 100,
            (medium / total) * 100,
            (high / total) * 100
        ];
    }

    const redPercentages = calculatePercentages(filteredData.red.map(d => parseFloat(d[feature])));
    const whitePercentages = calculatePercentages(filteredData.white.map(d => parseFloat(d[feature])));

    // Update the chart data with separated stacked bars for red and white wines
    wineChart.data = {
        labels: [feature],
        datasets: [
            // Red Wine Data
            {
                label: 'Red Wine - Low',
                data: [redPercentages[0]],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                stack: 'Red'
            },
            {
                label: 'Red Wine - Medium',
                data: [redPercentages[1]],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                stack: 'Red'
            },
            {
                label: 'Red Wine - High',
                data: [redPercentages[2]],
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                stack: 'Red'
            },
            // White Wine Data
            {
                label: 'White Wine - Low',
                data: [whitePercentages[0]],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                stack: 'White'
            },
            {
                label: 'White Wine - Medium',
                data: [whitePercentages[1]],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                stack: 'White'
            },
            {
                label: 'White Wine - High',
                data: [whitePercentages[2]],
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                stack: 'White'
            }
        ]
    };

    // Update X-axis label dynamically based on the selected feature
    wineChart.options.scales.x.title.text = feature;

    wineChart.update();
}

function toggleQualitySliderVisibility() {
    const sliderContainer = document.getElementById('sliderContainer');
    sliderContainer.style.display = sliderContainer.style.display === 'none' ? 'flex' : 'none';
}

function updateQualityLabel(value) {
    document.getElementById('qualityLabel').textContent = value;
}

function filterDataByQuality() {
    const selectedQuality = parseInt(document.getElementById('qualitySlider').value);
    filteredData.red = originalData.red.filter(d => parseInt(d.quality) >= selectedQuality);
    filteredData.white = originalData.white.filter(d => parseInt(d.quality) >= selectedQuality);

    // Update the chart with the filtered data
    const selectedFeature = document.getElementById('featureDropdown').value;
    if (selectedFeature) {
        updateChart(selectedFeature);
    }
}
