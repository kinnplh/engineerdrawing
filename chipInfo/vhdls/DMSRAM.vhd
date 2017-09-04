library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use std.textio.all;
use ieee.std_logic_textio.all;
use IEEE.STD_LOGIC_unsigned.ALL;
use work.constantsIF.all;

entity DMSRAM is
  port (
	RAM_OE, RAM_WE, RAM_EN: in std_logic;
	RAM_Addr: in std_logic_vector(17 downto 0);
	RAM_Data: inout std_logic_vector(15 downto 0)
  ) ;
end entity ; -- SRAM

architecture arch of DMSRAM is
type MemArray is array(255 downto 0) of std_logic_vector(15 downto 0);
signal mem_array: MemArray := (others => NOPInstruct);
signal data_out: std_logic_vector(15 downto 0);
begin

	process(RAM_OE, RAM_WE, RAM_EN, RAM_Addr, RAM_Data)
	file stDM_a: text open read_mode is "inputDM.txt";
	file outfile:text open write_mode is "outputDM.txt";
	variable line_a : line;
	variable line_b : line;
	variable line_out : line;

	variable a_temp : std_logic_vector(15 downto 0);
	variable b_temp : integer;
	variable out_temp : integer;

	variable linenum :integer := 0;
	variable file_status:file_open_status;
	begin
		while not(endfile(stDM_a)) loop

			readline(stDM_a,line_a);
			read(line_a,a_temp);
			mem_array(linenum) <= a_temp;
			linenum := linenum + 1;
		end loop;

		if RAM_WE = '1' and RAM_OE = '0' then -- read
			data_out <= mem_array(conv_integer(RAM_Addr(7 downto 0)));
		elsif RAM_WE = '0' then -- write
			mem_array(conv_integer(RAM_Addr(7 downto 0))) <= RAM_Data;
			linenum := 0;
			file_open(file_status,outfile,"outputDM.txt",write_mode);
			while linenum < 256 loop
				write(line_out,mem_array(linenum));
				writeline(outfile,line_out);
				linenum := linenum+1;
			end loop;
			file_close(outfile);
		else
			null;
		end if ;
	end process;

	RAM_data <= data_out when (RAM_WE = '1' and RAM_OE = '0' and RAM_EN = '0') else (others => 'Z');


end architecture ; -- arch
