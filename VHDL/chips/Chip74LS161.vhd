library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS161 is
  port (
	p1, p2, p3, p4, p5, p6, p7, p9, p10, p15: in std_logic;
	p11, p12, p13, p14: inout std_logic
  ) ;
end entity ; -- Chip74LS161

architecture arch of Chip74LS161 is
begin

	main : process(p2, p1, p9, p7, p10)
	variable counter: std_logic_vector(3 downto 0);
	begin
		if p1 = '1' then
			counter := "0000";
			p11 <= counter(3);
			p12 <= counter(2);
			p13 <= counter(1);
			p14 <= counter(0);
		end if ;

		if (p1 = '0' and p9 = '0' and (p7 and p10) = '0') then
			p11 <= counter(3);
			p12 <= counter(2);
			p13 <= counter(1);
			p14 <= counter(0);
		end if ;

		if (p2'event and p2 = '1') then
			if (p1 = '0' and p9 = '1') then
				counter := (p6 & p5 & p4 & p3);
				p11 <= counter(3);
				p12 <= counter(2);
				p13 <= counter(1);
				p14 <= counter(0);
			end if;

			if (p1 = '0' and p9 = '0' and p7 = '1' and p10 = '1') then
				counter := counter + "0001";
				p11 <= counter(3);
				p12 <= counter(2);
				p13 <= counter(1);
				p14 <= counter(0);
			end if ;
		end if ;
	end process ; -- main
end architecture ; -- arch