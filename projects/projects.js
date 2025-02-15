import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Draw pie chart with D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

// Declare selectedIndex globally to track the selected slice index
let selectedIndex = -1;

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
    // Re-calculate rolled data based on filtered projects
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    // Re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // Clear existing paths and legends
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove(); // Clear existing chart paths

    let newLegend = d3.select('.legend');
    newLegend.selectAll('li').remove(); // Clear existing legend items

    // Generate slice data
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map(d => arcGenerator(d));

    let svg = d3.select('svg');
    svg.selectAll('path').remove(); // Remove old paths

    let selectedIndex = -1; // Make sure selectedIndex is initialized properly

    // Add the arc paths to the SVG and set the click event handler
    newArcs.forEach((arc, i) => {
        const path = svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;

                // Update the pie chart paths class
                svg.selectAll('path')
                    .attr('class', (_, idx) => (
                        idx === selectedIndex ? 'selected' : ''
                    ));

                // Update the legend items' class
                newLegend.selectAll('li')
                    .attr('class', (_, idx) => (
                        idx === selectedIndex ? 'selected' : ''
                    ));

                // Filter and render projects based on selected year or reset if no slice is selected
                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2');  // Show all projects
                } else {
                    const selectedYear = newArcData[selectedIndex].data.label;

                    // Filter projects based on the selected year
                    const filteredProjects = projects.filter(project => project.year === selectedYear);

                    // Render filtered projects
                    renderProjects(filteredProjects, projectsContainer, 'h2');  // Show filtered projects based on selected year
                }
            });
    });

    // Render the legend
    newData.forEach((d, idx) => {
        newLegend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}


// Call this function on page load to render the initial pie chart
renderPieChart(projects);

// Add search for projects
let query = '';
let searchInput = document.querySelector('.searchBar');

// Filter function for search query
function setQuery(query) {
    return projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
}

// Event listener for the search bar
searchInput.addEventListener('change', (event) => {
    let filteredProjects = setQuery(event.target.value);

    // Re-render projects and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});