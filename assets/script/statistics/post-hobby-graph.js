        document.addEventListener('DOMContentLoaded', async () => {
            const loadingMessage = document.getElementById('loadingMessage'); // This element is not in the HTML, can be removed or added
            const errorMessage = document.getElementById('errorMessage');
            const chartContainer = document.getElementById('chartContainer');
            chartContainer.classList.remove('hidden');

            const margin = { top: 20, right: 30, bottom: 80, left: 60 }; // Increased bottom margin for x-axis labels
            let width = chartContainer.offsetWidth - margin.left - margin.right;
            let height = chartContainer.offsetHeight - margin.top - margin.bottom;

            let svg; // Declare svg globally to be accessible by resize function

            // Clear any existing chart
            d3.select("#chartContainer svg").remove();

            // Update width and height based on current container size
            width = chartContainer.offsetWidth - margin.left - margin.right;
            height = chartContainer.offsetHeight - margin.top - margin.bottom;

            // Create SVG element
            svg = d3.select("#chartContainer")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Define X and Y scales
            const xScale = d3.scaleBand()
                .domain(data.map(d => d.name))
                .range([0, width])
                .padding(0.1);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.postCount) * 1.1]) // Add some padding to the top
                .range([height, 0]);

            // NEW: Define an ordinal color scale for the bars
            // Using a custom array of dark blue shades for variety
            const colorScale = d3.scaleOrdinal()
                .domain(data.map(d => d.name)) // Domain is hobby names
                .range([
                    "#1f4e79", // Dark Steel Blue
                    "#2a618d", // Lighter Steel Blue
                    "#3573a1", // Medium Dark Blue
                    "#4086b5", // Slightly Brighter Blue
                    "#4b98c9", // Medium Blue
                    "#56aadf", // Lighter Blue
                    "#61bceb", // Lightest Blue
                    "#0a2b4a", // Even darker for more options
                    "#0f3c64",
                    "#144d80"
                ]);


            // Add X axis
            svg.append("g")
                .attr("class", "axis x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-45)") // Rotate labels for better readability
                .style("text-anchor", "end");

            // Add Y axis
            svg.append("g")
                .attr("class", "axis y-axis")
                .call(d3.axisLeft(yScale));

            // Add bars
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.name))
                .attr("y", d => yScale(d.postCount))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - yScale(d.postCount))
                .attr("fill", d => colorScale(d.name)); // NEW: Use the color scale here

            // Add count labels on top of bars
            svg.selectAll(".text")
                .data(data)
                .enter()
                .append("text")
                .attr("class", "text-label")
                .attr("x", d => xScale(d.name) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(d.postCount) - 5) // Position slightly above the bar
                .attr("text-anchor", "middle")
                .style("font-size", "0.75rem")
                .style("fill", "#4b5563")
                .text(d => d.postCount);
        });
