library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity mux is	
 	port (
		data1, data2: in std_logic_vector(15 downto 0);
		choose: in std_logic;

		outdata: out std_logic_vector(15 downto 0)
	);
end entity ;


architecture arch of mux is
begin
	process(data1, data2, choose)
	begin
		if (choose = LHS) then
			outdata <= data1;
		elsif (choose = RHS) then
			outdata <= data2;
		else
			outdata <= "0000000000000000";
		end if;		
	end process;	
end architecture ;