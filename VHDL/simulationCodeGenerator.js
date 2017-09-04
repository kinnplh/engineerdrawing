/**
 * Created by kinnplh on 11/7/16.
 */

var path = require('path');
var fs = require('fs');
function jumpInfoPerTime(time) {
    this.time = time;
    this.jumpList = [];
}
function jumpInfo(signalName, valueAfter) {
    this.signalName = signalName;
    this.valueAfter = valueAfter;
}

function portInfo(name) {//0: out, 1: in, 10: inout
    console.log("name: "  + name);
    if(name.indexOf('(') != -1) {
        re = /([_0-9a-zA-Z]*)\s*\(\s*([0-9]*)\s*:\s*([0-9]*)\s*\)/ig;
        var result = re.exec(name);
        this.internalName = result[1];
        this.startNum = parseInt(result[2]);
        this.endNum = parseInt(result[3]);
        this.width = Math.abs(this.startNum - this.endNum) + 1;
        this.order = (this.startNum > this.endNum)? "downto" : "to";
    }else {
        this.internalName = name;
        this.width = 1;
        this.startNum = undefined;
        this.endNum = undefined;
        this.order = undefined;
    }
}

function simulationCodeGenerator(prj, signal, editSignal, callback) {


    var inPortInfo = [];
    var outPortInfo = [];

    for(var index = 0; index < prj.input.length; ++ index)
        inPortInfo.push(new portInfo(prj.input[index]));

    for(var index = 0; index < prj.output.length; ++ index)
        outPortInfo.push(new portInfo(prj.output[index]));


    if(signal.length == 0) {
        console.log("NO signal to be simulated!!!");
        return;
    }
    //generate jump info
    var signalNum = signal.length;
    var currentIndexForSignals = [];
    for(var i = 0; i < signalNum; ++ i)
        currentIndexForSignals.push(0);
    var currentTime = -1;
    var maxTime = editSignal[0][editSignal[0].length - 1]; // not included!
    var jumpInfoAll = [];
    var nextTime = maxTime;
    jumpInfoAll.push(new jumpInfoPerTime(-1));
    while (currentTime < maxTime){
        for(var i = 0; i < signalNum; ++ i){
            // for everySignal
            // no duplicate in the array, can only concern the current index
            if(editSignal[i][currentIndexForSignals[i]] == currentTime){
                jumpInfoAll[jumpInfoAll.length - 1].jumpList.push(new jumpInfo(signal[i],
                    currentIndexForSignals[i] % 2));
                currentIndexForSignals[i] += 1;
                if(editSignal[i][currentIndexForSignals[i]] < nextTime)
                    nextTime = editSignal[i][currentIndexForSignals[i]];
            }
            else {
                if(editSignal[i][currentIndexForSignals[i]] < nextTime)
                    nextTime = editSignal[i][currentIndexForSignals[i]];
            }
        }
        currentTime = nextTime;
        nextTime = maxTime;
        jumpInfoAll.push(new jumpInfoPerTime(currentTime));
    }
    var res = "";
    var topEntitySimulator = path.basename(prj.inputFile, '.vhd');
    // necessary library
    res += "library ieee;\n\
use ieee.std_logic_1164.all;\n\
use ieee.std_logic_unsigned.all;\n\
use ieee.std_logic_arith.all;\n";
    res += "entity " + topEntitySimulator + " is\nend "+ topEntitySimulator + ";\n";
    res += "architecture TB of " + topEntitySimulator + " is\n";
    res += "component " + prj.topEntityName + " is\n";
    res += "port(";
    // only for std_logic; vector not supported
    for(var i = 0; i < inPortInfo.length; ++ i){
        if(i == 0)
            res += "\n";

        if(inPortInfo[i].width == 1)
            res += inPortInfo[i].internalName + ": in std_logic;\n";
        else
            res += (inPortInfo[i].internalName + ": in std_logic_vector(" +
            inPortInfo[i].startNum + ' ' + inPortInfo[i].order + ' ' +
            inPortInfo[i].endNum + ');\n');
    }
    for(var i = 0; i < outPortInfo.length; ++ i){
        if(outPortInfo[i].width == 1)
            res += outPortInfo[i].internalName + ": out std_logic;\n";
        else
            res += (outPortInfo[i].internalName + ": out std_logic_vector(" +
            outPortInfo[i].startNum + ' ' + outPortInfo[i].order + ' ' +
            outPortInfo[i].endNum + ');\n');
    }
    res = res.slice(0, -2);

    res += ");\n";
    res += "end component;\n";
    // declare signals the same name as the port
    for(var i = 0; i < inPortInfo.length; ++ i){

        res += "signal ";
        if(inPortInfo[i].width == 1)
            res += inPortInfo[i].internalName + ": std_logic;\n";
        else
            res += (inPortInfo[i].internalName + ": std_logic_vector(" +
            inPortInfo[i].startNum + ' ' + inPortInfo[i].order + ' ' +
            inPortInfo[i].endNum + ');\n');
    }

    for(var i = 0; i < prj.output.length; ++ i){
        res += "signal "; //
        if(outPortInfo[i].width == 1)
            res += outPortInfo[i].internalName + ": std_logic;\n";
        else
            res += (outPortInfo[i].internalName + ": std_logic_vector(" +
            outPortInfo[i].startNum + ' ' + outPortInfo[i].order + ' ' +
            outPortInfo[i].endNum + ');\n');
    }

    res += "begin\n";

    //port map
    res += "    " + prj.topEntityName + "_test: " + prj.topEntityName + " port map(";
    for(var i = 0; i < inPortInfo.length; ++ i){

        if(i != inPortInfo.length - 1)
            res += (inPortInfo[i].internalName + ", ");
        else
            res += inPortInfo[i].internalName;
    }
    for(var i = 0; i < outPortInfo.length; ++ i){
        if(i == 0)
            res += ", "; //

        if(i != outPortInfo.length - 1)
            res += (outPortInfo[i].internalName + ", ");
        else
            res += outPortInfo[i].internalName;
    }
    res += ");\n";
    //simulation process
    res += "    process\n";
    res += "    begin\n";
    // specially considered the first
    // assign '1' to all of the signal
    for(var i = 0; i < jumpInfoAll[0].jumpList.length; ++ i){
        var currentJumpInfo = jumpInfoAll[0].jumpList[i];
        res += "        " + currentJumpInfo.signalName +" <= '" + (1 - currentJumpInfo.valueAfter) +"';\n";
    }
    if(jumpInfoAll[1].time != 0)
        res += "    wait for " + jumpInfoAll[1].time + " ns;\n";
    for(var i = 1; i < jumpInfoAll.length - 1; ++ i){
        for(var j = 0; j < jumpInfoAll[i].jumpList.length; ++ j){
            var currentJumpInfo = jumpInfoAll[i].jumpList[j];
            res += "        " + currentJumpInfo.signalName +" <= '" + (1 - currentJumpInfo.valueAfter) +"';\n";
        }
        res += "    wait for " + (jumpInfoAll[i + 1].time - jumpInfoAll[i].time) + " ns;\n";
    }
    res += "    wait;\n";
    res += "    end process;\n";
    res += "end TB;\n";
    fs.writeFile(path.join(prj.filePath, prj.inputFile), res, callback);
    return res;
}
module.exports = simulationCodeGenerator;