/**
 * Created by kinnplh on 10/16/16.
 */

function Chip74LS00(id, name) {
    this.id = id;
    this.pinType = {//input: 1, output: 0, gnd: -2, gcc: 2
        p1: 1,
        p2: 1,
        p3: 0,
        p4: 1,
        p5: 1,
        p6: 0,
        p7: -2,
        p8: 0,
        p9: 1,
        p10: 1,
        p11: 0,
        p12: 1,
        p13: 1,
        p14: 2
    };
    this.pinMap = new Map();
    this.name = name;
    this.getPortMapString = function () {
        var mapRes = "";
        mapRes += (this.pinMap.get("1") + ", ");
        mapRes += (this.pinMap.get("2") + ", ");
        mapRes += (this.pinMap.get("4") + ", ");
        mapRes += (this.pinMap.get("5") + ", ");
        mapRes += (this.pinMap.get("9") + ", ");
        mapRes += (this.pinMap.get("10") + ", ");
        mapRes += (this.pinMap.get("12") + ", ");
        mapRes += (this.pinMap.get("13") + ", ");
        mapRes += (this.pinMap.get("3") + ", ");
        mapRes += (this.pinMap.get("6") + ", ");
        mapRes += (this.pinMap.get("8") + ", ");
        mapRes += (this.pinMap.get("11"));
        return this.name + ":Chip74LS00 port map(" + mapRes + ");\n";
    }
}
Chip74LS00.prototype.code ="\nlibrary ieee;\n\
    use ieee.std_logic_1164.all;\n\
    use ieee.std_logic_arith.all;\n\
    use ieee.std_logic_unsigned.all;\n\
\n\
    entity Chip74LS00 is\n\
    port (\n\
        p1, p2, p4, p5, p9, p10, p12, p13: in std_logic;\n\
    p3, p6, p8, p11: out std_logic\n\
) ;\n\
    end entity ; -- Chip74LS00\n\
\n\
    architecture arch of Chip74LS00 is\n\
    begin\n\
    p3 <= not (p1 and p2);\n\
    p6 <= not (p4 and p5);\n\
    p8 <= not (p9 and p10);\n\
    p11 <= not (p12 and p13);\n\
    end architecture ; -- arch\n";
Chip74LS00.prototype.getComponentString = function () {
    return"\ncomponent Chip74LS00\n\
        port(p1, p2, p4, p5, p9, p10, p12, p13: in std_logic;\n\
            p3, p6, p8, p11: out std_logic);\n\
            end component;\n";
};
module.exports = Chip74LS00;

