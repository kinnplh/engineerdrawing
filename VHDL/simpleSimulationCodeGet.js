/**
 * Created by kinnplh on 12/2/16.
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
function simulationCodeGenerator(prj, signal, editSignal, callback) {
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
    for(var i = 0; i < prj.input.length; ++ i){
        if(i == 0)
            res += "\n";
        if(i != prj.input.length - 1)
            res += (prj.input[i] + ", ");
        else
            res += prj.input[i] + ": in std_logic";
    }
    for(var i = 0; i < prj.output.length; ++ i){
        if(i == 0)
            res += ";\n"; //
        if(i != prj.output.length - 1)
            res += (prj.output[i] + ", ");
        else
            res += prj.output[i] + ": out std_logic";
    }
    res += ");\n";
    res += "end component;\n";
    // declare signals the same name as the port
    for(var i = 0; i < prj.input.length; ++ i){
        if(i == 0)
            res += "signal ";
        if(i != prj.input.length - 1)
            res += (prj.input[i] + ", ");
        else
            res += prj.input[i] + ": std_logic;\n";
    }

    for(var i = 0; i < prj.output.length; ++ i){
        if(i == 0)
            res += "signal "; //
        if(i != prj.output.length - 1)
            res += (prj.output[i] + ", ");
        else
            res += prj.output[i] + ": std_logic;\n";
    }

    res += "begin\n";

    //port map
    res += "    " + prj.topEntityName + "_test: " + prj.topEntityName + " port map(";
    for(var i = 0; i < prj.input.length; ++ i){
        if(i != prj.input.length - 1)
            res += (prj.input[i] + ", ");
        else
            res += prj.input[i];
    }
    for(var i = 0; i < prj.output.length; ++ i){
        if(i == 0)
            res += ", "; //
        if(i != prj.output.length - 1)
            res += (prj.output[i] + ", ");
        else
            res += prj.output[i];
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