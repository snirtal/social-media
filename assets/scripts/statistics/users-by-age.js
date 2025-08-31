  document.addEventListener('DOMContentLoaded', () => {
            const noDataMessage = document.getElementById('noDataMessage');
            const chartContainer = document.getElementById('chartContainer');
            const legendContainer = document.getElementById('legendContainer');


            if (typeof d3 === 'undefined') {
                noDataMessage.classList.remove('hidden');
                noDataMessage.textContent = "Error: D3.js library could not be loaded.";
                chartContainer.classList.add('hidden');
                console.error("D3.js is not defined.");
                return;
            }

            let svg;

            const drawChart = (chartData) => {
                chartContainer.classList.remove('hidden');
                noDataMessage.classList.add('hidden');
                legendContainer.innerHTML = '';
                d3.select("#chartContainer svg").remove();

                const containerWidth = chartContainer.offsetWidth;
                const containerHeight = chartContainer.offsetHeight;
                const radius = Math.min(containerWidth, containerHeight) / 2 - 20;

                if (containerWidth <= 0 || containerHeight <= 0) {
                    noDataMessage.textContent = "Chart area is too small to display.";
                    noDataMessage.classList.remove('hidden');
                    chartContainer.classList.add('hidden');
                    return;
                }

                svg = d3.select("#chartContainer")
                    .append("svg")
                    .attr("width", containerWidth)
                    .attr("height", containerHeight)
                    .append("g")
                    .attr("transform", `translate(${containerWidth / 2},${containerHeight / 2})`);

                const color = d3.scaleOrdinal(d3.schemeCategory10);
                const pie = d3.pie().value(d => d.userCount).sort(null);
                const arc = d3.arc().innerRadius(0).outerRadius(radius);
                const outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

                svg.selectAll('slices')
                    .data(pie(chartData))
                    .enter()
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', d => color(d.data.age))
                    .attr("stroke", "white")
                    .style("stroke-width", "2px")
                    .style("opacity", 0.7);

                svg.selectAll('polylines')
                    .data(pie(chartData))
                    .enter()
                    .append('polyline')
                    .attr("stroke", "black")
                    .style("fill", "none")
                    .attr("stroke-width", 1)
                    .attr('points', d => {
                        const posA = arc.centroid(d);
                        const posB = outerArc.centroid(d);
                        const posC = [...posB];
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
                        return [posA, posB, posC];
                    });

                svg.selectAll('labels')
                    .data(pie(chartData))
                    .enter()
                    .append('text')
                    .text(d => `${d.data.age} (${d.data.userCount})`)
                    .attr('transform', d => {
                        const pos = outerArc.centroid(d);
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                        return `translate(${pos})`;
                    })
                    .style('text-anchor', d => {
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        return midangle < Math.PI ? 'start' : 'end';
                    });

                chartData.forEach((d) => {
                    const legendItem = document.createElement('div');
                    legendItem.className = 'legend-item';
                    legendItem.innerHTML = `
                        <div class="legend-color" style="background-color: ${color(d.age)};"></div>
                        <span>${d.age}</span>
                    `;
                    legendContainer.appendChild(legendItem);
                });
            };

            if (data && data.length > 0) {
                drawChart(data);
            } else {
                noDataMessage.classList.remove('hidden');
                chartContainer.classList.add('hidden');
                legendContainer.innerHTML = '';
            }

            window.addEventListener('resize', () => {
                if (data && data.length > 0) {
                    drawChart(data);
                }
            });
        });
