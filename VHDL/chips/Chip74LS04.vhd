library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS04 is
  port (
	p1, p3, p5, p9, p11, p13: in std_logic;
	p2, p4, p6, p8, p10, p12: out std_logic
  ) ;
end entity ; -- Chip74LS04

architecture arch of Chip74LS04 is
begin
	p2 <= not p1;
	p4 <= not p3;
	p6 <= not p5;
	p8 <= not p9;
	p10 <= not p11;
	p12 <= not p13;
end architecture ; -- arch