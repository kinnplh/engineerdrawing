library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS90 is
  port (
	p1, p2, p3, p6, p7, p14: in std_logic;
	p8, p9, p11, p12: out std_logic
  ) ;
end entity ; -- Chip74LS90

architecture arch of Chip74LS90 is

begin
	two : process(p2, p3, p6, p7, p14)
	variable count_2: std_logic;
	begin
		if (p2 = '1' and p3 = '1' and (p6 and p7) = '0') then
			count_2 := '0';
			p12 <= '0';
		elsif (p14'event and p14 = '0') then
			count_2 := not count_2;
			p12 <= count_2;
		end if ;
	end process ; -- two

	five : process(p2, p3, p6, p7, p14)
	variable count_5 : std_logic_vector(2);
	begin
		if (p2 = '1' and p3 = '1' and (p6 and p7) = '0') then
			count_5 := "000";
			p9 <= '0';
			p8 <= '0';
			p11 <= '0';
		elsif (p1'event and p1 = '0') then
			if(count_5 = "100") then
				count_5 := "000";
			else
				count_5 := count_5 + "001";

			end if;
			p9 <= count_5(0);
			p8 <= count_5(1);
			p11 <= count_5(2);
		end if;
	end process ; -- five

end architecture ; -- arch