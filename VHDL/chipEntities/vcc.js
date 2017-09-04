/**
 * Created by kinnplh on 11/2/16.
 */
function vcc(id, name) {
    this.id = id;
    this.name = name;
    this.pinType = {p0: 0};
    this.pinMap = new Map();
    this.getPortMapString = function () {
        return "";
    }
}
vcc.prototype.code = "";
vcc.prototype.getComponentString = function () {
    return "";
};
module.exports = vcc;