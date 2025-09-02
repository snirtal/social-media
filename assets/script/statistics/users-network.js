      const width = 800;
        const height = 600;

        const svg = d3.select("#forceGraph")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]); // For responsiveness

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        async function fetchUsersAndBuildGraph() {
            try {
                const response = await fetch('http://localhost:3000/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const users = await response.json();

                // D3 requires nodes and links arrays
                const nodes = users.map(user => ({
                    id: user._id,
                    name: `${user.firstName}`
                }));

                const links = [];
                // Create links for each friendship (ensure no duplicates for undirected graph)
                const existingLinks = new Set();
                users.forEach(user => {
                    console.log(user.friends)
                    user.friends.map(x=> x._id).forEach(friendId => {
                        // Only create a link if both users exist in our nodes array
                        const sourceNode = nodes.find(n => n.id === user._id);
                        const targetNode = nodes.find(n => n.id === friendId);

                        if (sourceNode && targetNode) {
                            // Ensure links are added only once for an undirected graph (e.g., A-B not B-A)
                            const linkIdentifier1 = `${user._id}-${friendId}`;
                            const linkIdentifier2 = `${friendId}-${user._id}`;

                            if (!existingLinks.has(linkIdentifier1) && !existingLinks.has(linkIdentifier2)) {
                                links.push({ source: user._id, target: friendId });
                                existingLinks.add(linkIdentifier1);
                            }
                        }
                    });
                });

                // D3 Force Simulation
                const simulation = d3.forceSimulation(nodes)
                    .force("link", d3.forceLink(links).id(d => d.id).distance(100)) // Link force, distance between nodes
                    .force("charge", d3.forceManyBody().strength(-300)) // Node repulsion
                    .force("center", d3.forceCenter(width / 2, height / 2)) // Center the graph
                    .force("x", d3.forceX().strength(0.05)) // Mild force to keep nodes within x bounds
                    .force("y", d3.forceY().strength(0.05)); // Mild force to keep nodes within y bounds

                // Create Links
                const link = svg.append("g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(links)
                    .join("line")
                    .attr("stroke-width", d => Math.sqrt(d.value || 1)) // If you had link values
                    .attr("class", "link");

                // Create Nodes
                const node = svg.append("g")
                    .attr("class", "nodes")
                    .selectAll("circle")
                    .data(nodes)
                    .join("circle")
                    .attr("r", 15) // Node radius
                    .attr("fill", d => d3.schemeCategory10[nodes.indexOf(d) % 10]) // Different colors for nodes
                    .attr("class", "node")
                    .call(drag(simulation)); // Enable dragging

                // Add text labels to nodes (optional, but helpful)
                const labels = svg.append("g")
                    .attr("class", "labels")
                    .selectAll("text")
                    .data(nodes)
                    .join("text")
                    .text(d => d.name)
                    .attr("font-size", 10)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em") // Vertically center text
                    .attr("pointer-events", "none"); // Allow clicks to pass through to circle

                // Tooltip events
                node.on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`<strong>${d.name}</strong><br>ID: ${d.id}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

                // Update positions on each tick of the simulation
                simulation.on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    labels
                        .attr("x", d => d.x)
                        .attr("y", d => d.y);
                });

                // Drag functionality
                function drag(simulation) {
                    function dragstarted(event, d) {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }

                    function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                    }

                    function dragended(event, d) {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }

                    return d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended);
                }

            } catch (error) {
                console.error('Error fetching users or building graph:', error);
                alert('Failed to load user graph.');
            }
        }

        document.addEventListener('DOMContentLoaded', fetchUsersAndBuildGraph);
