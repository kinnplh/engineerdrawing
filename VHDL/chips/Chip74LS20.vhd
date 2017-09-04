library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS20 is
  port (
	p1, p2, p4, p5, p9, p10, p12, p13: in std_logic;
	p6, p8: out std_logic
  ) ;
end entity ; -- Chip74LS20

architecture arch of Chip74LS20 is
begin
	p6 <= not(p1 and p2 and p4 and p5);
	p8 <= not(p9 and p10 and p12 and p13);

end architecture ; -- arch