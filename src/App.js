import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
import './App.css';
import {scaleLinear,ordinal,domain} from 'd3-scale'
import {max,extent} from 'd3-array'
import {select,mouse,event} from 'd3-selection'
import {line} from 'd3-shape'
import {axisTop,axisRight,axisBottom,axisLeft} from 'd3-axis'
import {transition} from 'd3-transition'
import {interpolateRgb} from 'd3-interpolate'


{/* CANVAS TEST */}
//----------------------------------------------
function dataSet(){
    this.lineWidth = 2;
    //this.dataPoints = [{x:1,y:2},{x:2,y:4},{x:5,y:6},{x:4,y:3}]
    this.dataPoints = [{"score":10}, {"score": 20}, {"score": 2}, {"score":12}, {"score":6}, {"score": 8},
                        {"score": 25},{"score": 52},{"score": 7},{"score": 8}
                        ]
}

dataSet.prototype.alter = function(){
    var firstnalter = Math.floor(Math.random() * this.dataPoints.length)

    for (var i = 0; i < firstnalter; i++){
        var direction = Math.round((Math.random() * 2) - 1 );
        this.dataPoints[i]["score"] = Math.min(Math.max(this.dataPoints[i]["score"] + direction * Math.random()* 2,0),52)
    }
}

function drawLine(ctx,startX, startY, endX, endY, color){
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color){
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
    ctx.restore();
}

function drawChartBackground(canvasBackground){
    var ctx = canvasBackground.getContext("2d")
    ctx.clearRect(0,0,canvasBackground.width, canvasBackground.height)
    ctx.beginPath();
    ctx.fillStyle=  "black"
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0,0,canvasBackground.width,canvasBackground.height)
    ctx.clip();
    ctx.globalAlpha = 1;
    ctx.closePath()
}

function LineChart(options, ctxfg){
    this.ctxfg = ctxfg;
    this.options = options
    this.draw = function(){
        var yaxis_range = 0;
        this.options.dataset.dataPoints.forEach(function (dataPoint){
            yaxis_range = Math.max(yaxis_range,dataPoint["score"]);
        })

        var numberOfBars = this.options.dataset.dataPoints.length
        var canvasActualHeight = this.options.graphDimensions.height - 2 * this.options.padding;
        var canvasActualWidth  = this.options.graphDimensions.width - 2 * this.options.padding;


        var chartxstart = this.options.graphDimensions.xstart + this.options.padding;
        var chartystart = this.options.graphDimensions.ystart + this.options.padding;
        var barSize = canvasActualWidth / numberOfBars;

        for(var i = 0; i < this.options.dataset.dataPoints.length-1; i++){
            var dataPoint0score = this.options.dataset.dataPoints[i]["score"]
            var barHeight0 = Math.round(canvasActualHeight * dataPoint0score/yaxis_range);
            var dataPoint0x = barSize/2 + barSize*(i) + chartxstart
            var dataPoint0y = chartystart + (canvasActualHeight - barHeight0)


            var dataPoint1score = this.options.dataset.dataPoints[i+1]["score"]
            var barHeight1 = Math.round(canvasActualHeight * dataPoint1score/yaxis_range);
            var dataPoint1x = barSize/2 + barSize*(i+1) + chartxstart
            var dataPoint1y = chartystart + (canvasActualHeight - barHeight1)

            var midx = (dataPoint0x + dataPoint1x) /2
            ctxfg.save();
            ctxfg.beginPath();
            ctxfg.lineWidth = 10;
            ctxfg.strokeStyle = "#FF0000";
            ctxfg.moveTo(dataPoint0x, dataPoint0y )
            ctxfg.bezierCurveTo(midx,dataPoint0y,midx,dataPoint1y,dataPoint1x, dataPoint1y)
            ctxfg.stroke();
            ctxfg.closePath();
            ctxfg.restore();
        }


    }

}

function BarChart(options, ctxfg, canvas){
    this.options = options;
    this.ctxfg = ctxfg;
    canvas.addEventListener("click", this.click.bind(this),false);



    this.draw = function(color){
        const reducerx = (maxValue, currentValue) => maxValue > currentValue.x ? maxValue : currentValue.x;
        const reducery = (maxValue, currentValue) => maxValue + currentValue.y;

        var xaxis_range = 0;
        var yaxis_range = 0;
        this.options.dataset.dataPoints.forEach(function (dataPoint){
            yaxis_range = Math.max(yaxis_range,dataPoint["score"]);
        })
        var canvasActualHeight = this.options.graphDimensions.height - 2 * this.options.padding;
        var canvasActualWidth  = this.options.graphDimensions.width - 2 * this.options.padding;


        var chartxstart = this.options.graphDimensions.xstart + this.options.padding;
        var chartystart = this.options.graphDimensions.ystart + this.options.padding;

        var gridValue = 0;

        var gridMax = Math.floor(yaxis_range / this.options.gridScale) + 1

        while (gridValue <= gridMax){

            var gridY = canvasActualHeight * (1 - gridValue*this.options.gridScale/yaxis_range) + chartystart;
            drawLine(this.ctxfg, chartxstart ,gridY, chartxstart + canvasActualWidth,gridY,"black")
            this.ctxfg.save();
            this.ctxfg.fillStyle = "red"
            this.ctxfg.font = "bold 20px Arial"
            this.ctxfg.fillText(gridValue*this.options.gridScale,chartxstart-10, gridY)
            this.ctxfg.restore();
            gridValue += 1

        };

        var barIndex = 0;
        var numberOfBars = this.options.dataset.dataPoints.length
        var barSize = canvasActualWidth / numberOfBars;
        this.options.dataset.dataPoints.forEach(function(dataPoint){
            var val = dataPoint["score"];
            var barHeight = Math.round(canvasActualHeight * val/yaxis_range);
            drawBar(this.ctxfg,chartxstart+barIndex*barSize,
                chartystart + (canvasActualHeight - barHeight), barSize, barHeight, color)
        //
            barIndex++;
        }, this);
    }
}

BarChart.prototype.click = function(e){
    this.mouse = [e.clientX, e.clientY]
    var hexcolor = "#"+((1<<24)*Math.random()|0).toString(16)
    this.draw(hexcolor)
}

function drawChartForeground(canvasBackground,canvasForeground, dataset){
    var ctxfg = canvasForeground.getContext("2d")
    ctxfg.clearRect(0,0,canvasBackground.width, canvasBackground.height)
    var graphDimensions = {xstart: canvasBackground.width*0.1,
                           ystart: canvasBackground.height*0.1,
                           width : canvasBackground.width - canvasBackground.width*0.2,
                           height: canvasBackground.height- canvasBackground.height*0.2
                          }
    ctxfg.globalAlpha = 0.8;
    ctxfg.fillStyle = "white"
    ctxfg.fillRect(graphDimensions.xstart, graphDimensions.ystart, graphDimensions.width, graphDimensions.height)
    ctxfg.globalAlpha = 1.0;

    var options = {dataset: dataset, graphDimensions: graphDimensions, padding: 10, gridScale: 6, seriesName:"TestGraph"}


    var chart = new BarChart(options,ctxfg,canvasForeground)
    var defaultcolor = "green"
    chart.draw(defaultcolor)
    var linechart = new LineChart(options, ctxfg)
    linechart.draw()
    ctxfg.save();
    ctxfg.textBaseline = "top";
    ctxfg.textAlign = "center";
    ctxfg.fillStyle = "#F345FF";
    ctxfg.font = "bold 14px Arial";
    ctxfg.fillText("TEST", canvasBackground.width /2 , 20 )
    ctxfg.restore();


}

function splitPlot(canvasBackground, canvasForeground){
    this.dataset = new dataSet();
    window.requestAnimationFrame(this.animate.bind(this,canvasBackground,canvasForeground,this.dataset))
        //this.prototype.animate(this.canvasBackground,this.canvasForeground,this.dataset))

}

splitPlot.prototype.animate = function(canvasBackground,canvasForeground,dataset){
    drawChartBackground(canvasBackground);
    drawChartForeground(canvasBackground, canvasForeground, dataset)
    var alter = this.dataset.alter.bind(this.dataset)
    alter()
    window.requestAnimationFrame(this.animate.bind(this,canvasBackground,canvasForeground,this.dataset))
}

class Canvas extends Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
        var canvasBackground = this.refs.canvasBackground1
        var canvasForeground = this.refs.canvasBackground2
        var plot = new splitPlot(canvasBackground,canvasForeground)
    }

    render(){
        return (
            <div>
            <canvas id="layer1" ref="canvasBackground1" width={600} height={600}
                style={{position:"absolute",left:0, top:0, zIndex:0}}/>
            <canvas id ="layer2" ref="canvasBackground2" width={600} height={600}
                style={{position:"absolute",left:0, top:0, zIndex:1}}/>
            </div>
        );

    }
}

//-------------------------------------------------------

function createData2(lowerbound,upperbound, mean){
    var data = []
    var mean = mean;
    var sd   = 2;
    var step = (upperbound - lowerbound) / 10000
    for (var i = lowerbound; i <= upperbound; i = i+step){
        let x = i;
        var result = (1/sd)* (1/Math.sqrt(2*Math.PI))* Math.exp(-0.5 *Math.pow(((i-mean)/sd),2))
        var el = {
            "q":x, "p":result
        }
        data.push(el)
    }
    data.sort(function(x,y){
        return x.q - y.q
    })
    return data;
}


{/*SVG TEST */}
class SVG extends Component{
    constructor(props){
        super(props);
        //this.createData2 = this.createData2.bind(this)
        this.createBarChart = this.createBarChart.bind(this)
        this.mouseMove = this.mouseMove.bind(this)
        this.data = [];
    }




    componentDidMount(){
        //this.createBarChart();
        this.createGaussianChart()
    }

    mouseMove(target){
        let mouse = mouse(target)
        console.log(mouse)
    }



    createGaussianChart(){
        var data = createData2(-20,20, -10)
        const node2 = this.node2;
        var  margin = {top:20, right:20, bottom:30, left:50}
        var width = 500 -margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        var x = scaleLinear().range([0,width]);
        var y = scaleLinear().range([height-100,0]);

        console.log(x)

        var xAxis = axisBottom(x);
        var yAxis = axisLeft(y);

        var newline = line()
            .x(function(d){
             return x(d.q);
         }).y(function(d){
             return y(d.p)
         })

        x.domain([-20,20])
        y.domain([0,1])

        var svg = select(node2).attr("width", width)
                               .attr("height", height)
                               .style("background-color", "gray")
                               .append("g")
                               .attr("transform", "translate(40,40)")

        svg.append("g").attr("class", "xaxis")
                       .attr("transform", "translate(0," + (height - 100) + ")")
                       .call(xAxis);
        svg.append("g").attr("class", "yaxis")
                       .call(yAxis);

        var path = svg.append("path").data([data]).attr("class", "linechange").attr("stroke-width",10).attr("stroke", "red").attr("d", newline)
        svg.on("mousemove", function(){var x = mouse(svg.node())[0]; console.log(x);
                                     path.attr("d", newline(createData2(-20,20,x*4/100 -8)));})


        // function(){var pt = mouse(this); console.log("called");var data = createData2(-20,20,4);
        //                                     select("").datum(data)});



        select(this.experiment).transition().attrTween("background-color", function(){interpolateRgb("red", "blue")})
    }

    createBarChart(){
        const node = this.node;
        const dataMax = max(this.props.data)
        const yScale = scaleLinear().domain([0,dataMax]).range([0, this.props.size[1]])

        select(node).selectAll('rect').data(this.props.data).enter().append('rect')
        select(node).selectAll('rect').data(this.props.data).exit().remove()

        select(node).selectAll('rect').data(this.props.data).style('fill','#fe9922')
                    .attr('x', (d,i) => i*25)
                    .attr('y', d=> this.props.size[1] - yScale(d))
                    .attr('height', d => yScale(d))
                    .attr('width', 25)
    }

    render(){
        {/*return(<svg ref={node => this.node = node} width={500} height={500} />
               <svg ref={node2=> this.node2 = node2}/>)
            */}
            return (<div ref={experiment => this.experiment = experiment}>
                    <svg ref={node2=> this.node2 = node2}/>
                    </div>
                )
    }

}


class App extends Component {
    constructor(props){
        super(props);
    }

    render() {
            return (
            <div className="App">
            {/*<Canvas />*/}
            <SVG data={[5,10,1,3]} size={[500,500]}/>
            <h1>Test</h1>
            </div>

        );
    }
}




export default App;
