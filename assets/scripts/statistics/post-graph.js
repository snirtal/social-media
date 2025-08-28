 const margin = { top: 20, right: 30, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#postsChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        async function fetchPostsAndBuildChart() {
            try {
                const response = await fetch('http://localhost:3000/posts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const posts = await response.json();

                // 1. Process data: Count posts per date
                const postsByDate = {};
                posts.forEach(post => {
                    // Extract date part (YYYY-MM-DD)
                    const date = new Date(post.created).toISOString().split('T')[0];
                    postsByDate[date] = (postsByDate[date] || 0) + 1;
                });

                // Convert to array of {date: "YYYY-MM-DD", count: N} objects
                const chartData = Object.keys(postsByDate).map(date => ({
                    date: d3.timeParse("%Y-%m-%d")(date), // Parse string to Date object
                    count: postsByDate[date]
                })).sort((a, b) => a.date - b.date); // Sort by date

                console.log('Chart Data:', chartData);

                // 2. Define Scales
                const xScale = d3.scaleBand()
                    .domain(chartData.map(d => d.date))
                    .range([0, width])
                    .padding(0.1);

                const yScale = d3.scaleLinear()
                    .domain([0, d3.max(chartData, d => d.count)]).nice()
                    .range([height, 0]);

                // Function to get a darker blue color based on index
                const getDarkerBlue = (index, totalLength) => {
                    // Start from 0.3 (or higher, like 0.4, 0.5 for even darker)
                    // and scale up to 1.0 (darkest blue)
                    const startValue = 0.3; // Adjust this value to control the lightest shade (higher = darker start)
                    const endValue = 1.0;
                    const normalizedIndex = index / (totalLength - 1); // Normalize index to [0, 1]
                    const interpolatedValue = startValue + normalizedIndex * (endValue - startValue);
                    return d3.interpolateBlues(interpolatedValue);
                };


                // 3. Add Axes
                const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat("%b %d")); // Format date for display

                const yAxis = d3.axisLeft(yScale);

                svg.append("g")
                    .attr("class", "x-axis axis")
                    .attr("transform", `translate(0,${height})`)
                    .call(xAxis)
                    .selectAll("text")
                    .attr("transform", "rotate(-45)") // Rotate labels for better readability
                    .style("text-anchor", "end");

                svg.append("text")
                    .attr("class", "x-axis-label")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom - 10)
                    .text("Date");

                svg.append("g")
                    .attr("class", "y-axis axis")
                    .call(yAxis);

                svg.append("text")
                    .attr("class", "y-axis-label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -margin.left + 20)
                    .attr("x", -(height / 2))
                    .text("Number of Posts");

                // 4. Draw Bars
                svg.selectAll(".bar")
                    .data(chartData)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", d => xScale(d.date))
                    .attr("y", d => yScale(d.count))
                    .attr("width", xScale.bandwidth())
                    .attr("height", d => height - yScale(d.count))
                    .attr("fill", (d, i) => getDarkerBlue(i, chartData.length)) // Set initial fill color


            } catch (error) {
                console.error('Error fetching posts or building chart:', error);
                alert('Failed to load posts chart.');
            }
        }

        // Call the function to build the chart when the page loads
        document.addEventListener('DOMContentLoaded', fetchPostsAndBuildChart);
