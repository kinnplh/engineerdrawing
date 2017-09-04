/**
 * Created by claud on 2016/11/9.
 */

var data;
var editSignalList = [];
var precision = 1;
var totalTime = 200;
//var inputNum = 4;
var graph = new Array();
var divlist;
var color = ['blue','red','brown','green','purple','orange','rgb(37,10,152)','rgb(19,111,34)'];
var num;
function initEdit() {
    var Object1 = new Object();
    Object1.name = "A[1]";
    Object1.list=[-1,0];
    editSignalList.push(Object1);

    var Object2 = new Object();
    Object2.name = "A[0]";
    Object2.list=[-1,0];
    editSignalList.push(Object2);

    var Object3 = new Object();
    Object3.name = "C";
    Object3.list = [-1,0];
    editSignalList.push(Object3);
}
function downV4(event, g, context) {
    context.initializeMouseDown(event, g, context);
    startEdit(event, g, context);
}
function moveV4(event, g, context) {
    if (context.isEditing) {
        moveEdit(event, g, context);
    }
}

function upV4(event, g, context) {
    if (context.isEditing) {
        endEdit(event, g, context);
    }
}

function startEdit (event, g, context) {
    context.isEditing = true;
    context.editMoved = false;
};
function moveEdit (event, g, context) {
    context.editMoved = true;
    context.dragEndX = Dygraph.dragGetX_(event, context);
    context.dragEndY = Dygraph.dragGetY_(event, context);

    var xDelta = Math.abs(context.dragStartX - context.dragEndX);
    var yDelta = Math.abs(context.dragStartY - context.dragEndY);

    // drag direction threshold for y axis is twice as large as x axis
    context.dragDirection = (xDelta < yDelta / 2) ? Dygraph.VERTICAL : Dygraph.HORIZONTAL;

    g.drawZoomRect_(
        context.dragDirection,
        context.dragStartX,
        context.dragEndX,
        context.dragStartY,
        context.dragEndY,
        context.prevDragDirection,
        context.prevEndX,
        context.prevEndY);

    context.prevEndX = context.dragEndX;
    context.prevEndY = context.dragEndY;
    context.prevDragDirection = context.dragDirection;
};
function endEdit(event, g, context){


    g.clearZoomRect_();
    context.isEditing = false;

    context.dragEndX = Dygraph.dragGetX_(event, context);
    context.dragEndY = Dygraph.dragGetY_(event, context);
    var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
    var regionHeight = Math.abs(context.dragEndY - context.dragStartY);

    if (regionWidth < 2 && regionHeight < 2 &&
        g.lastx_ !== undefined && g.lastx_ != -1) {
        Dygraph.Interaction.treatMouseOpAsClick(g, event, context);
    }

    context.regionWidth = regionWidth;
    context.regionHeight = regionHeight;


    var plotArea = g.getArea();
    if (context.regionWidth >= 10 &&
        context.dragDirection == Dygraph.HORIZONTAL) {
        var left = Math.min(context.dragStartX, context.dragEndX),
            right = Math.max(context.dragStartX, context.dragEndX);
        left = Math.max(left, plotArea.x);
        right = Math.min(right, plotArea.x + plotArea.w);
        if (left < right) {
            //alert(g.toDataXCoord(left));
            var leftdate = Math.round(g.toDataXCoord(left)/precision);
            var rightdate = Math.round(g.toDataXCoord(right)/precision);
            var thisDiv = g.graphDiv.parentNode;
            //alert(thisDiv);
            var thisDivId = thisDiv.getAttribute('id');
            //alert(thisDivId);
            var esnum;
            for (es in editSignalList)
            {

                if(editSignalList[es].id== thisDivId)
                {
                    thisSignalList = editSignalList[es].list;
                    //alert(editSignalList[es].id);
                    esnum = es;
                    break;
                }

            }

            var len = thisSignalList.length;
            for(var i = 0; i < len; i++)
            {
                if(leftdate*precision > thisSignalList[i])
                {
                    continue;
                }
                if(leftdate*precision == thisSignalList[i])
                {
                    thisSignalList = (thisSignalList.slice(0,i)).concat(thisSignalList.slice(i+1));
                    len = thisSignalList.length;
                    for(var j = i; j < len; j++)
                    {
                        if(rightdate * precision > thisSignalList[j])
                        {
                            continue;
                        }
                        if(rightdate * precision == thisSignalList[j])
                        {
                            thisSignalList = (thisSignalList.slice(0,j)).concat(thisSignalList.slice(j+1));
                            break;
                        }
                        if(rightdate * precision < thisSignalList[j])
                        {
                            thisSignalList.splice(j,0,rightdate*precision);
                            break;
                        }
                    }
                    break;
                }
                if(leftdate*precision < thisSignalList[i])
                {
                    //alert(rightdate * precision);
                    thisSignalList.splice(i,0,leftdate*precision);
                    len = thisSignalList.length;
                    //alert("lll"+thisSignalList);
                    for(var j = i; j < len; j++)
                    {
//               alert(thisSignalList[j]);
                        if(rightdate * precision > thisSignalList[j])
                        {
                            continue;
                        }
                        if(rightdate * precision == thisSignalList[j])
                        {

                            thisSignalList = (thisSignalList.slice(0,j)).concat(thisSignalList.slice(j+1));
                            break;
                        }
                        if(rightdate * precision < thisSignalList[j])
                        {
//                 alert(rightdate*precision);
                            thisSignalList.splice(j,0,rightdate*precision);
                            break;
                        }
                    }
                    break;
                }
            }
            editSignalList[esnum].list = thisSignalList;
            //alert(thisSignalList);
            thisdata = g.file_;
            for(var date = leftdate*precision; date < rightdate*precision; date++)
            {


                if(thisdata[date][1] == 1)
                {
                    thisdata[date]=[date,0];
                }
                else if(thisdata[date][1] == 0)
                {
                    thisdata[date]=[date,1];
                }
            }
            g.updateOptions({file:thisdata});

        }
        context.cancelNextDblclick = true;
    }
}

function init(){
    //initEdit();
    divlist = new Array();
    graph = new Array();
    data = [];
    num = editSignalList.length;
    var parentdiv = document.getElementById("graphdiv");
    parentdiv.innerHTML = "";
    for(k in editSignalList)
    {
        //init div

        var childdiv=document.createElement("div");
        var id = "graph"+k;
        childdiv.setAttribute('id',id);

        parentdiv.appendChild(childdiv);
        divlist.push(id);

        //init editSignalList
        var len = editSignalList[k].list;
        if(editSignalList[k].list[len-1] != totalTime)
        {
            editSignalList[k].list.push(totalTime+1);
        }
        editSignalList[k].id = id;


        //init data

        thisDataList = editSignalList[k].list;
        var y = 1;
        var td = 1;//thisDataList标志
        var thisdata = [];
        for(var j = 0; j <= totalTime; j++)
        {
            if(j == thisDataList[td])
            {
                y = 1-y;
                td = td + 1;
            }

            var row = [j,y];
            thisdata.push(row);
        }
        data.push(thisdata);
    }
}
function createGraph(){
    init();
    for(k in editSignalList)
    {
        id = "graph"+k;

        if(k == num -1)
        {
            g = new Dygraph(
                document.getElementById(id),
                data[k],
                {
                    labels: ['x',editSignalList[k].ref.tag],//.concat(signallist),//.concat(signal),
                    connectSeparatedPoints: true,
                    drawPoints: false,
                    showLabelsOnHighlight: true,
                    height:80,
                    width: 900,
                    panEdgeFraction: 0.00000001,
                    showRangeSelector:true,
                    rangeSelectorHeight:30,
                    rangeSelectorPlotStrokeColor:"white",
                    rangeSelectorPlotFillColor:"white",
                    strokeWidth:1.2,
                    ylabel:editSignalList[k].ref.tag,
                    stepPlot:true,
                    colors:[color[k%8]],
                    interactionModel:{
                        mousedown:downV4,
                        mousemove:moveV4,
                        mouseup:upV4,
                    },
                    axes: {
                        x: {
                            valueRange: [0, 50000],

                        },
                        y: {

                            axisLabelFormatter: function (y) {
                                return null;
                            },
                            drawAxis:true,
                            drawGrid:false,
                            valueRange: [0, 1.2],
                            pixelsPerLabel:9,

                        }
                    }
                }
            );
        }
        else
        {
            g = new Dygraph(

                // containing div

                document.getElementById(id),
                data[k],

                {
                    labels: ['x',editSignalList[k].ref.tag],//.concat(signallist),//.concat(signal),
                    connectSeparatedPoints: true,
                    drawPoints: false,
                    showLabelsOnHighlight: true,
                    height: 3*9,
                    width: 900,
                    panEdgeFraction: 0.00000001,
                    ylabel:editSignalList[k].ref.tag,
                    stepPlot:true,
                    xAxisHeight:0.000001,
                    xLabelHeight:0.00000000001,
                    strokeWidth:1.2,
                    colors:[color[k%8]],
                    interactionModel:{
                        mousedown:downV4,
                        mousemove:moveV4,
                        mouseup:upV4,
                    },
                    axes: {
                        x: {
                            axisLabelFormatter: function (x) {
                                if (x < 0)return null;
                                return x;
                            },
                            axisLineWidth:0.00000001,
                            valueRange: [0, 50000],
                            axisLabelFontSize:0
                        },
                        y: {
                            axisLabelFormatter: function (y) {
                                return null;

                            },
                            drawAxis:true,
                            drawGrid:false,
                            valueRange: [0, 1.2],
                            pixelsPerLabel:9
                        }
                    }
                }
            );
        }

        graph.push(g);

    }
    if(num > 1)
    {
        var sync = Dygraph.synchronize(graph,{
            selection: false,
            zoom: true,
            range:false,
        });
    }

}
function onclickStart(){
    var temp = totalTime;
    totalTime = parseInt(document.getElementById("simTime").value);
    if(isNaN(totalTime))
    {
        alert("wrong time!");
        totalTime = 200;
    }
    for(k in editSignalList)
    {
        var len = editSignalList[k].list.length;
        if(editSignalList[k].list[len - 1] == temp+1)
        {
            editSignalList[k].list.pop();
        }

    }
    createGraph();
}
function onclickReset(){
    var sigName = document.getElementById("sigName").value;
    var graphid;
    for(k in editSignalList)
    {
        if(editSignalList[k].ref.tag.toUpperCase() == sigName.toUpperCase())
        {
            graphid = k;
            break;
        }
        if(k == num-1)alert("wrong name!");
    }
    thisdata = [];
    editSignalList[graphid].list=[-1,0];
    for(var j = 0; j <= totalTime; j++)
    {
        var row = [j,0];
        thisdata.push(row);
    }
    (editSignalList[graphid].list).push(totalTime+1);
    //alert(editSignalList[graphid]);
    graph[graphid].updateOptions({file:thisdata});

}
function onclickPlot(){
    var period = document.getElementById("period").value * 2;
    //alert(period);
    if(isNaN(period)||period <= 0 || ((period/2) % 1) != 0)alert("wrong time");
    var halfperiod = parseInt(period)/2;
    //alert(halfperiod);
    var sigName = document.getElementById("sigName").value;
    var graphid;
    for(k in editSignalList)
    {
        if(editSignalList[k].ref.tag.toUpperCase() == sigName.toUpperCase())
        {
            graphid = k;
            break;
        }
        if(k == num-1)alert("wrong name!");
    }
    thisdata=[];
    //var len = xt.length-1;
    editSignalList[graphid].list=[-1];
    for(var j = 0; j <= totalTime; j++)
    {
        var row = [j,Math.floor(j/halfperiod)%2];
        thisdata.push(row);
        if(j % halfperiod == 0)
        {
            (editSignalList[graphid].list).push(j);

        }
    }
    (editSignalList[graphid].list).push(totalTime+1);
    //alert(editSignalList[graphid]);
    graph[graphid].updateOptions({file:thisdata});

}
function highlightSignal(ref){
    var signalName = ref.tag;
    var index;
    for(k in editSignalList)
    {
        if(signalName == editSignalList[k].ref.tag)
        {
            index = k;
            break;
        }
    }
    graph[index].updateOptions({strokeWidth:3});

}
function disHighlightSignal(ref) {
    var signalName = ref.tag;
    var index;
    for(k in editSignalList)
    {
        if(signalName == editSignalList[k].ref.tag)
        {
            index = k;
            break;
        }
    }
    graph[index].updateOptions({strokeWidth:1.2});
}
function changeName(ref){
    var cn = ref.tag;
    var index;
    for(k in editSignalList)
    {
        if(cn == editSignalList[k].ref.tag)
        {
            index = k;
            break;
        }
    }
    graph[index].updateOptions({ylabel:cn});
}
function reloadJili(projectId) {
    // alert(editSignalList);
    var inputSignalList = [];
    //var outputSignalList = [];
    var editList = [];
    for (k in editSignalList)
    {
        inputSignalList.push(editSignalList[k].ref.tag);
        editList.push(editSignalList[k].list);
    }
    $.ajax({
        type: "post",
        url: "/file/reloadJili",
        data: {
            inputSignal:JSON.stringify(inputSignalList),
            //outputsignal:,
            editSignal:JSON.stringify(editList),
            projectId: projectId
        },
        dataType: 'json',
        success: function (r) {
            //alert("Reload the file successfully!");
        },

        error: function (e) {
            alert("error");
        }

    });
}