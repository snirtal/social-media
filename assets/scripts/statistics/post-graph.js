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

                const postsByDate = {};
                posts.forEach(post => {
                    const date = new Date(post.created).toISOString().split('T')[0];
                    postsByDate[date] = (postsByDate[date] || 0) + 1;
                });

                const chartData = Object.keys(postsByDate).map(date => ({
                    date: d3.timeParse("%Y-%m-%d")(date), 
                    count: postsByDate[date]
                })).sort((a, b) => a.date - b.date); 

                console.log('Chart Data:', chartData);

                const xScale = d3.scaleBand()
                    .domain(chartData.map(d => d.date))
                    .range([0, width])
                    .padding(0.1);

                const yScale = d3.scaleLinear()
                    .domain([0, d3.max(chartData, d => d.count)]).nice()
                    .range([height, 0]);

                const getDarkerBlue = (index, totalLength) => {
                    const startValue = 0.3; 
                    const endValue = 1.0;
                    const normalizedIndex = index / (totalLength - 1); 
                    const interpolatedValue = startValue + normalizedIndex * (endValue - startValue);
                    return d3.interpolateBlues(interpolatedValue);
                };


                const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat("%b %d"));

                const yAxis = d3.axisLeft(yScale);

                svg.append("g")
                    .attr("class", "x-axis axis")
                    .attr("transform", `translate(0,${height})`)
                    .call(xAxis)
                    .selectAll("text")
                    .attr("transform", "rotate(-45)") 
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

                svg.selectAll(".bar")
                    .data(chartData)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", d => xScale(d.date))
                    .attr("y", d => yScale(d.count))
                    .attr("width", xScale.bandwidth())
                    .attr("height", d => height - yScale(d.count))
                    .attr("fill", (d, i) => getDarkerBlue(i, chartData.length)) 
            } catch (error) {
                console.error('Error fetching posts or building chart:', error);
                alert('Failed to load posts chart.');
            }
        }

        document.addEventListener('DOMContentLoaded', fetchPostsAndBuildChart);
