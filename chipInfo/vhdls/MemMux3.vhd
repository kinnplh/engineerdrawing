library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity MemMux3 is
port (
	write_data: in std_logic_vector(15 downto 0);
	dm_data: in std_logic_vector(15 downto 0);
	im_data: in std_logic_vector(15 downto 0);

	mem_signal: in std_logic_vector(2 downto 0);

	out_data: out std_logic_vector(15 downto 0)
);
end entity;

architecture bhv of MemMux3 is
begin
	process(mem_signal, dm_data, im_data, write_data)
	begin
		case (mem_signal) is
			when DMRead => out_data <= dm_data;
			when SerialStateRead => out_data <= dm_data;
			when SerialDataRead => out_data <= dm_data;
			when IMRead => out_data <= im_data;
			when ALUResult => out_data <= write_data;
			when others => out_data <= ZeroWord;
		end case;
	end process;
end architecture;