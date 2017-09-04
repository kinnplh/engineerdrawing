library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS27 is
  port (
	p1, p2, p3, p4, p5, p9, p10, p11, p13: in std_logic;
	p6, p8, p12: out std_logic
  ) ;
end entity ; -- Chip74LS27

architecture arch of Chip74LS27 is
begin
	p12 <= not (p1 or p2 or p13);
	p8 <= not (p9 or p10 or p11);
	p6 <= not (p3 or p4 or p5);
end architecture ; -- arch