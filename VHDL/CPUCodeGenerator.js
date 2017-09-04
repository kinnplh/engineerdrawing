/**
 * Created by kinnplh on 11/29/16.
 */
var cpu_comps = require('../chipInfo/cpu_comps');
var fs = require('fs'),
    path = require('path');
var process = require('child_process');
function CPUCodeGenerator(savePath, connectInfo, cpuName, portInfo, entityPath,callback){

    process.exec("cp " + path.join(entityPath, '* ') + ' ' + savePath, function(err, stdout, stderr){});


    portInfo.input = [];
    portInfo.output = [];
    //确定需要哪些模块，根据名字生成相应的Function
    var chipInfo = cpu_comps(entityPath);
    console.log(chipInfo);
    var nameInPort = new Set();

    var chipNameToChipClass = new Map();
    for(var chipId in connectInfo){
        var info = connectInfo[chipId];
        if(chipNameToChipClass.has(info.name))
            continue;
        console.log(info.name);
        if(info.name != "input" && info.name != "output")
            chipNameToChipClass.set(info.name, getFunctionAccordingToName(info.name, chipInfo[info.name].internalNameList, savePath));
        else
            chipNameToChipClass.set(info.name, getFunctionAccordingToName(info.name));
    }

    //确定每一个使用到的芯片的外部信号名，芯片名，并生成相应的实例
    var idToEntity = new Map(); // input and output included
    var idToInput = new Map();
    var idToOutput = new Map();
    var nameToEntity = new Map(); //防止在申明components的时候出现了重复
    for(var chipId in connectInfo){
        var info = connectInfo[chipId];
        var chipName = info.name;
        if(!chipNameToChipClass.has(chipName))
            throw new Error("No such chip " + chipName);
        var chipClass = chipNameToChipClass.get(chipName);

        //inputs and outputs are different!!
        if(chipName == "input"){
            var crtInput = new chipClass(chipId, "Chip" + chipName + chipId, info.tag);
            idToEntity.set(chipId, crtInput);
            crtInput = new chipClass(chipId, "Chip" + chipName + chipId, info.tag);
            idToInput.set(chipId, crtInput);
            portInfo.input.push(info.tag);
            if(info.tag.indexOf('(') == -1)
                nameInPort.add(info.tag);
            else
                nameInPort.add(info.tag.slice(0, info.tag.indexOf('(') ));
            continue;
        }

        if(chipName == "output"){
            var crtOutput = new chipClass(chipId, "Chip" + chipName + chipId, info.tag);
            idToEntity.set(chipId, crtOutput);
            crtOutput = new chipClass(chipId, "Chip" + chipName + chipId, info.tag);
            idToOutput.set(chipId, crtOutput);
            portInfo.output.push(info.tag);
            if(info.tag.indexOf('(') == -1)
                nameInPort.add(info.tag);
            else
                nameInPort.add(info.tag.slice(0, info.tag.indexOf('(') ));
            continue;
        }

        var currentChip = new chipClass(chipId, "Chip" + chipName + chipId);
        for(var i = 0; i < chipInfo[info.name].internalNameList.length; ++ i){
            currentChip.internalNameToExternalName.set(chipInfo[info.name].internalNameList[i],
                "Chip_" + chipName + '_' + chipId + '_' + chipInfo[info.name].internalNameList[i]);
        }
        idToEntity.set(chipId, currentChip);
        if(!nameToEntity.has(chipName))
            nameToEntity.set(chipName, currentChip);
    }

    // 整理连接信息，仅根据芯片的inputs
    var connectionArray = [];
    for(var chipId in connectInfo){
        var info = connectInfo[chipId];
        var inputsMap = info.inputs;
        for(var k in inputsMap)
        {//asyn
            var v = inputsMap[k];
            //k: port num of the current chip; it is the dest
            //v: array of the connection
            //each element is {num:a, parent: b}
            //b: the chipId a:the port in the parent chip
            for(var i = 0; i < v.length; ++ i){
                var parentInfo = v[i];
                //get the external name of the corresponding port

                var srcPortChip = idToEntity.get(parentInfo.parent.toString());
                var srcPortInfo = srcPortChip.portIdToPortInfo.get(parentInfo.num);
                var srcPortInternalName = srcPortInfo.internalName;
                var srcPortExternalName = srcPortChip.internalNameToExternalName.get(srcPortInternalName);

                var destPortChip = idToEntity.get(chipId);
                var destPortInfo = destPortChip.portIdToPortInfo.get(parseInt(k));
                var destPortInternalName = destPortInfo.internalName;
                var destPortExternalName = destPortChip.internalNameToExternalName.get(destPortInternalName);

                if(nameInPort.has(destPortExternalName))
                    connectionArray.push(new connection(srcPortExternalName, destPortExternalName));
                else
                    destPortChip.internalNameToExternalName.set(destPortInternalName, srcPortExternalName);

            }
        }
    }

    // start generate Code
    var code = "";
    // necessary libraries
    code += "library ieee;\nuse ieee.std_logic_1164.all;\nuse ieee.std_logic_arith.all;\nuse ieee.std_logic_unsigned.all;\n";

    //entity
    code += ("entity " + cpuName + " is\n");
    code += "   port(\n";
    //declare the port: input & output

    idToInput.forEach(function (v, k) {
        //k: chipId, v: chipEntity
        var inputPortInfo = v.portIdToPortInfo.get(0);
        var externalInputPortName = v.internalNameToExternalName.get(inputPortInfo.internalName);
        if(inputPortInfo.width == 1)
            code += ("  " + externalInputPortName + " : in std_logic;\n");
        else
            code += ("  " + externalInputPortName + ": in std_logic_vector(" + inputPortInfo.startNum + ' '
            + inputPortInfo.order + ' ' + inputPortInfo.endNum + ');\n');
    });

    idToOutput.forEach(function (v, k) {
        var outputPortInfo = v.portIdToPortInfo.get(0);
        console.log(outputPortInfo);
        console.log(v.internalNameToExternalName);


        var externalOutputPortName = v.internalNameToExternalName.get(outputPortInfo.internalName);
        if(outputPortInfo.width == 1)
            code += ("  " + externalOutputPortName + " : out std_logic;\n");
        else
            code += ("  " + externalOutputPortName + ": out std_logic_vector(" + outputPortInfo.startNum + ' '
            + outputPortInfo.order + ' ' + outputPortInfo.endNum + ');\n');
    });
    code = code.slice(0, -2); //去掉最后的分号
    code += ");\n";
    code += ("end " + cpuName + ";\n");

    // describe the architecture
    code += ("architecture bhv of " + cpuName + " is\n");
    //describe all signals
    //input and output should not be included
    //otherwise for every port of every entity
    //should bind a signal to it
    var externalNameUsed = new Set();
    idToEntity.forEach(function (v, k) {
        //k: chip id
        //v: chipEntity
        //all chips of all entities should maps to a signal here
        if(v.notInSignal)
            return;
        v.portIdToPortInfo.forEach(function (vv, kk) {
            //kk: num of port
            //vv: portInfo
            var crtExternalName = v.internalNameToExternalName.get(vv.internalName);
            if(externalNameUsed.has(crtExternalName) || nameInPort.has(crtExternalName))
                return;
            externalNameUsed.add(crtExternalName);
            if(vv.width == 1)
                code += ("   signal " + crtExternalName + " : std_logic;\n");
            else
                code += ("  signal " + crtExternalName + " : std_logic_vector(" + vv.startNum + ' '
                + vv.order + ' ' + vv.endNum + ');\n');
        });
    });

    //declare component
    nameToEntity.forEach(function (v, k) {
        //k: name, v: entityExample
        code += v.getComponentString();
    });
    code += "   begin\n";
    //signal assign
     for(var i = 0; i < connectionArray.length; ++ i){
         var curConnection = connectionArray[i];
         code += ("  " + curConnection.dest + " <= " + curConnection.src + ";\n");
     }
    //port map
    idToEntity.forEach(function (v, k) {
        //k: chipId, v: chip entity
        code += "   " + v.getPortMapString() + "\n";
    });
    code += "end bhv;\n";

    if(savePath !== "")
        fs.writeFile(path.join(savePath, cpuName + ".vhd"), code, callback);
    else
        console.log(code);
    return portInfo;
}

function getFunctionAccordingToName(chipName, internalNameList, entityPath) {
    if(chipName == "input"){
        function input(id, name, tag) {
            this.id = id;
            this.name = name;
            this.internalNameToExternalName = new Map();
            this.typeName = "input";
            this.internalNameList = ["input"];
            this.code = "";
            this.portIdToPortInfo = new Map();
            this.portIdToPortInfo.set(0, new portInfo(tag, 0));
            this.internalNameToExternalName.set("input", this.portIdToPortInfo.get(0).internalName);
            this.portIdToPortInfo.get(0).internalName = "input";
            this.getComponentString = function () {return "";};
            this.getPortMapString = function () {return "";};
            this.notInSignal = true;
        }
        return input;
    }

    if(chipName == "output"){
        function output(id, name, tag) {
            this.id = id;
            this.name = name;
            this.internalNameToExternalName = new Map();
            this.typeName = "output";
            this.internalNameList = ["output"];
            this.code = "";
            this.portIdToPortInfo = new Map();
            this.portIdToPortInfo.set(0, new portInfo(tag, 1));
            this.internalNameToExternalName.set("output", this.portIdToPortInfo.get(0).internalName);
            this.portIdToPortInfo.get(0).internalName = "output";
            this.getComponentString = function () {return "";};
            this.getPortMapString = function () {return "";};
            this.notInSignal = true;
        }
        return output;
    }


    var chipInfo = cpu_comps(entityPath);
    var codeFile = path.resolve(path.dirname(fs.realpathSync(__filename)),
        '..', './chipInfo/vhdls');
    if(fs.existsSync(path.join(codeFile, chipName + '.vhd')))
        codeFile = path.join(codeFile, chipName + '.vhd');
    else if(fs.existsSync(path.join(codeFile, chipName + '.vhdl')))
        codeFile = path.join(codeFile, chipName + '.vhdl');
    else {
        throw new Error("No such chip " + chipName);
    }

    //move the component file into the corresponding folder


 //   process.exec("cp " + codeFile + ' ' +  savePath, function(err, stdout, stderr){});

    var code = fs.readFileSync(codeFile, 'utf8').toLowerCase();
    var getPortRe = /(port\s*\([\s\S]*\)\s*;\s*)end\s*entity\s*;/ig;
    var resArray = getPortRe.exec(code);
    console.log(resArray[1]);
    var portInfoFromArray = resArray[1];

    var portIdToPortInfo = new Map();
    var inPortNameToPortId = new Map();//used to distinguish inout

    //add in node
    var inputNodes = chipInfo[chipName].inputNodes;
    for(var i = 0; i < inputNodes.length; ++ i){
        var crtNode = inputNodes[i];
        portIdToPortInfo.set(crtNode.num, new portInfo(crtNode.name, 1));
        inPortNameToPortId.set(crtNode.name, crtNode.num);
    }
    //add out node and change to inout if necessary
    var outputNodes = chipInfo[chipName].outputNodes;
    for(var i = 0; i < outputNodes.length; ++ i){
        var crtNode = outputNodes[i];
        if(!inPortNameToPortId.has(crtNode.name))
            portIdToPortInfo.set(crtNode.num, new portInfo(crtNode.name, 0));
        else {
            var portInfoToBeChanged = portIdToPortInfo.get(inPortNameToPortId.get(crtNode.name));
            portInfoToBeChanged.type = 10;
            portIdToPortInfo.set(inPortNameToPortId.get(crtNode.name), portInfoToBeChanged);
            portIdToPortInfo.set(crtNode.num, portInfoToBeChanged);
        }
    }
    function f(id, name) {
        this.notInSignal = false;
        this.id = id;
        this.name = name;
        this.internalNameToExternalName = new Map();
        this.typeName = chipName;
        this.internalNameList = internalNameList;
        this.code = code;
        this.portIdToPortInfo = portIdToPortInfo;
        this.getPortMapString = function () {
            var mapRes = "";

            for(var index in this.internalNameList){
                //if(this.internalNameToExternalName.has(internalName))
                    mapRes += (this.internalNameToExternalName.get(this.internalNameList[index]) + ",");
            }
            //不要忘记去掉最后的逗号
            return this.name + ":" + this.typeName + " port map(" + mapRes.slice(0, -1) + ");\n";
        };

        this.getComponentString = function () {
            var res = "";
            res += "\ncomponent " + this.typeName + "\n";
            res += portInfoFromArray;
            res += "end component;\n";
            return res;
        };
    };
    return f;
}

function portInfo(name, type) {//0: out, 1: in, 10: inout
    if(name.indexOf('(') != -1) {
        re = /([_0-9a-zA-Z]*)\(([0-9]*):([0-9]*)\)/ig;
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
    this.type = type;
}

function connection(src, dest) {
    this.src = src;
    this.dest = dest;
}
module.exports = CPUCodeGenerator;

