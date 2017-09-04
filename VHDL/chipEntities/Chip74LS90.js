/**
 * Created by kinnplh on 11/9/16.
 */
function Chip74LS90(id, name) {
    this.id = id;
    this.pinType = {
        p1: 1,
        p2: 1,
        p3: 1,
        p4: -1,
        p5: 2,
        p6: 1,
        p7: 1,
        p8: 0,
        p9: 0,
        p10: -2,
        p11: 0,
        p12: 0,
        p13: -1,
        p14: 1
    };
    this.pinMap = new Map();
    this.name = name;
    this.getPortMapString = function () {
        var mapRes = "";
        mapRes += (this.pinMap.get("1") + ", ");
        mapRes += (this.pinMap.get("2") + ", ");
        mapRes += (this.pinMap.get("3") + ", ");
        mapRes += (this.pinMap.get("6") + ", ");
        mapRes += (this.pinMap.get("7") + ", ");
        mapRes += (this.pinMap.get("14") + ", ");
        mapRes += (this.pinMap.get("8") + ", ");
        mapRes += (this.pinMap.get("9") + ", ");
        mapRes += (this.pinMap.get("11") + ", ");
        mapRes += (this.pinMap.get("12"));
        return this.name + ":Chip74LS90 port map(" + mapRes + ");\n";
    };
}

Chip74LS90.prototype.getComponentString = function () {
  return "\ncomponent Chip74LS90\n\
  port(p1, p2, p3, p6, p7, p14: in std_logic;\
    p8, p9, p11, p12: out std_logic);\n\
    end component;\n";
};

Chip74LS90.prototype.code = "library ieee;\n\
use ieee.std_logic_1164.all;\n\
use ieee.std_logic_arith.all;\n\
use ieee.std_logic_unsigned.all;\n\
\n\
entity Chip74LS90 is\n\
port (\n\
    p1, p2, p3, p6, p7, p14: in std_logic;\n\
p8, p9, p11, p12: out std_logic\n\
) ;\n\
end entity ; -- Chip74LS90\n\
\n\
architecture arch of Chip74LS90 is\n\
\n\
begin\n\
two : process(p2, p3, p6, p7, p14)\n\
variable count_2: std_logic := '0';\n\
begin\n\
if (p2 = '1' and p3 = '1' and (p6 and p7) = '0') then\n\
count_2 := '0';\n\
p12 <= '0';\n\
elsif(p6 = '1' and p7 = '1') then\n\
count_2 := '1';\n\
p12 <= '1';\n\
elsif (p14'event and p14 = '0') then\n\
count_2 := not count_2;\n\
p12 <= count_2;\n\
end if ;\n\
end process ; -- two\n\
\n\
five : process(p2, p3, p6, p7, p1)\n\
variable count_5 : std_logic_vector(2 downto 0) := \"000\";\n\
begin\n\
if (p2 = '1' and p3 = '1' and (p6 and p7) = '0') then\n\
count_5 := \"000\";\n\
p9 <= '0';\n\
p8 <= '0';\n\
p11 <= '0';\n\
elsif(p6 = '1' and p7 = '1') then\n\
count_5 := \"100\";\n\
p9 <= '0';\n\
p8 <= '0';\n\
p11 <= '1';\n\
elsif (p1'event and p1 = '0') then\n\
if(count_5 = \"100\") then\n\
count_5 := \"000\";\n\
else\n\
count_5 := count_5 + \"001\";\n\
\n\
end if;\n\
p9 <= count_5(0);\n\
p8 <= count_5(1);\n\
p11 <= count_5(2);\n\
end if;\n\
end process ; -- five\n\
\n\
end architecture ; -- arch\n";

module.exports = Chip74LS90;