let wineData = { red: {}, white: {} };
let originalData = { red: [], white: [] };
let filteredData = { red: [], white: [] };

document.addEventListener('DOMContentLoaded', () => {
    // Initialize quality slider and dropdown
    const slider = document.getElementById('qualitySlider');
    const qualityLabel = document.getElementById('qualityLabel');
    const dropdown = document.getElementById('featureDropdown');

    // Load data
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

    // Create dropdown options
    function createDropdown(features) {
        features.forEach(feature => {
            let option = document.createElement('option');
            option.value = feature;
            option.textContent = feature;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', () => updateChart(dropdown.value));
    }

    // Update chart
    function updateChart(feature) {
        if (!feature) return;

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
        };

        const redPercentages = calculatePercentages(filteredData.red.map(d => parseFloat(d[feature])));
        const whitePercentages = calculatePercentages(filteredData.white.map(d => parseFloat(d[feature])));

        wineChart.data = {
            labels: ['Low', 'Medium', 'High'],
            datasets: [
                {
                    label: 'Red Wine',
                    data: redPercentages,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'White Wine',
                    data: whitePercentages,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        };

        wineChart.update();
    }

    // Toggle slider visibility
    document.getElementById('toggleQualitySlider').addEventListener('click', () => {
        const sliderContainer = document.getElementById('sliderContainer');
        sliderContainer.style.display = sliderContainer.style.display === 'none' ? 'flex' : 'none';
    });

    // Update quality label and filter data
    slider.addEventListener('input', () => {
        qualityLabel.textContent = slider.value;
    });

    slider.addEventListener('change', filterDataByQuality);

    function filterDataByQuality() {
        const selectedQuality = parseInt(slider.value);
        filteredData.red = originalData.red.filter(d => parseInt(d.quality) >= selectedQuality);
        filteredData.white = originalData.white.filter(d => parseInt(d.quality) >= selectedQuality);

        if (dropdown.value) {
            updateChart(dropdown.value);
        }
    }
});
