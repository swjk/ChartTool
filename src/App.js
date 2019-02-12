import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
import './App.css';

function dataSet(){
    this.lineWidth = 2;
    //this.dataPoints = [{x:1,y:2},{x:2,y:4},{x:5,y:6},{x:4,y:3}]
    this.dataPoints = {"Classical music":10, "Alternative rock": 20, "Pop": 2, "Jazz":12}
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
    ctx.beginPath();
    ctx.fillStyle=  "black"
    ctx.fillRect(0,0,canvasBackground.width,canvasBackground.height)
    ctx.clip();
    ctx.closePath()
}

function BarChart(options, ctxfg){
    this.options = options;
    this.ctxfg = ctxfg;

    this.draw = function(){
        const reducerx = (maxValue, currentValue) => maxValue > currentValue.x ? maxValue : currentValue.x;
        const reducery = (maxValue, currentValue) => maxValue + currentValue.y;

        var xaxis_range = 0;
        var yaxis_range = 0;
        for (var point in this.options.dataset.dataPoints){
            yaxis_range = Math.max(yaxis_range,this.options.dataset.dataPoints[point]);
        }



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
        var numberOfBars = Object.keys(this.options.dataset.dataPoints).length
        var barSize = canvasActualWidth / numberOfBars;
        for (point in this.options.dataset.dataPoints){
            var val = this.options.dataset.dataPoints[point];
            var barHeight = Math.round(canvasActualHeight * val/yaxis_range);
            drawBar(this.ctxfg,chartxstart+barIndex*barSize,
                chartystart + (canvasActualHeight - barHeight), barSize, barHeight, "green")

            barIndex++;
        }


    }
}

function drawChartForeground(canvasBackground,canvasForeground, dataset){
    var ctxfg = canvasForeground.getContext("2d")
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


    var chart = new BarChart(options,ctxfg)
    chart.draw()

    ctxfg.save();
    ctxfg.textBaseline = "top";
    ctxfg.textAlign = "center";
    ctxfg.fillStyle = "#F345FF";
    ctxfg.font = "bold 14px Arial";
    ctxfg.fillText("TEST", canvasBackground.width /2 , 20 )
    ctxfg.restore();


}


function splitPlot(canvasBackground, canvasForeground){
    var dataset = new dataSet();
    drawChartBackground(canvasBackground);
    drawChartForeground(canvasBackground, canvasForeground,dataset)









}




class Canvas extends Component{
    componentDidMount(){
        var canvasBackground = this.refs.canvasBackground1
        var canvasForeground = this.refs.canvasBackground2
        splitPlot(canvasBackground, canvasForeground)
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

class App extends Component {
    constructor(props){
        super(props);
    }

    render() {
            return (
            <div className="App">
            <Canvas />
            <h1>Test</h1>
            </div>

        );
    }
}




export default App;
