const graph = document.getElementById("app");
const tooltip = document.createElement("div");
tooltip.setAttribute("id", "tooltip");
tooltip.setAttribute("data-year", 0);
graph.appendChild(tooltip);

const w = 900,
      h = 600,
      padding = 100;

const svg = d3.select("#app")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

d3.select("#title")
  .append("header")
  .html("<h2>Americam Crisis: Mass Shooting</h2>");

fetch("https://raw.githubusercontent.com/erickouassi/Acms/master/data.json")
.then(resp => resp.json())
.then(jsonData => drawScatterPlot(jsonData))
.catch(err => console.error(err));

function drawScatterPlot(json) {
    let dataset = json;
    console.log(json);

    const getDateY = d => new Date(d["Year"], 0, 0, 0, 0, 0, 0);
    const getDateMS = d => {
      let [mm, ss] = d["Injuries"].split(":").map(x => Number(x));
      let date = new Date();
      date.setMinutes(mm);
      date.setSeconds(ss);
      return date;
    }
    const minX = d3.min(dataset, d => getDateY(d));
    const maxX = d3.max(dataset, d => getDateY(d));
    const minY = d3.min(dataset, d => getDateMS(d));
    const maxY = d3.max(dataset, d => getDateMS(d));
    const yPad = 1;
    const sPad = 10;
    minX.setFullYear(minX.getFullYear() - yPad);
    maxX.setFullYear(maxX.getFullYear() + yPad);
    minY.setSeconds(minY.getSeconds() - sPad);
    maxY.setSeconds(maxY.getSeconds() + sPad);

    const xScale = d3.scaleTime()
        .domain([minX, maxX])
        .range([padding, w - padding]);

    const yScale = d3.scaleTime()
        .domain([minY, maxY])
        .range([padding, h - padding]);

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.scaleTime().tickFormat(10, "%Y"));

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.scaleTime().tickFormat(10, "%M:%S"));

    svg.append("g")
        .attr("id", "x-axis")  // x axis
        .attr("transform", `translate(0, ${h - padding})`)
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")  // y axis
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);
    
   svg.append("text") // second title
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", padding / 2)
        .text("Alleged Drug Use During 1994 - 2015")

    svg.append("text")
        .attr("id", "x-label") // x label
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", h - padding / 2)
        .text("Year");

    svg.append("text")
        .attr("id", "y-label") // y label
        .attr("text-anchor", "end")
        .attr("x", padding / 1)
        .attr("y", h / 7)
        .text("Injuries");

    let legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${w - 2 * padding - 10}, ${padding + 10})`)

    legend.append("rect")
        .attr("width", 120)
        .attr("height", "3em")
        .attr("stroke", "white")
        .attr("stroke-width", "1")
        .attr("fill", "none");


    let legendData = [
        { text: "deaths" },
        { text: "injuries" }
    ];

    legend.selectAll("rect")
        .exit()
        .data(legendData)
        .enter()
        .append("rect")
        .attr("class", d => d.text)
        .attr("x", "0.25em")
        .attr("y", (d, i) => `${0.25 + i * 1.5}em`)
        .attr("width", "1em")
        .attr("height", "1em");

    legend.selectAll("text")
        .exit()
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", "1.5em")
        .attr("y", (d, i) => `${1.1 + i * 1.5}em`)
        .attr("font-size", "1em")
        .text(d => d.text);

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .classed("dot", true)
        .classed("deaths", (d, i) => d["Deaths"] !== "")
        .classed("injuries", (d, i) => d["Deaths"] === "")
        .attr("cx", (d, i) => xScale(getDateY(d)))
        .attr("cy", (d, i) => yScale(getDateMS(d)))
        .attr("r", 5)
        .attr("data-xvalue", d => getDateY(d))
        .attr("data-yvalue", d => getDateMS(d))
        .on("mouseover", (d) => {
            tooltip.style.visibility = "visible";

            tooltip.setAttribute("data-year", getDateY(d));  
            tooltip.style.transform =
                `translate(${xScale(getDateY(d)) + 10}px, ${yScale(getDateMS(d))}px)`;

            let dotInfo = [
                `Incident: ${d["Incident"]}`,
                `Year: ${d["Year"]}`,
                `Injuries: ${d["Injuries"]}`,
                `Deaths: ${d["Deaths"]}`
            ];
            tooltip.innerHTML = dotInfo.join("<br>");
        })
        .on("mouseout", (d) => {
            tooltip.style.visibility = "hidden";
        });
};
