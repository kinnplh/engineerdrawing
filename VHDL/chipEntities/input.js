/**
 * Created by kinnplh on 10/16/16.
 */

function input(id, name) {
    this.notInSignal = true;
    this.id = id;
    this.name = name;
    this.pinType = {p0: 0};
    this.pinMap = new Map();
    this.getPortMapString = function () {
        return "";
    }
}
input.prototype.code = "";
input.prototype.getComponentString = function () {
  return "";
};
module.exports = input;