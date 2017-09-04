library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity IMController is
  port (
	PCInput, AluInput: in std_logic_vector(15 downto 0);
	write_data: in std_logic_vector(15 downto 0);
	
	mem_signal: in std_logic_vector(2 downto 0);

	read_result: out std_logic_vector(15 downto 0);

	ram2_oe, ram2_we, ram2_en: out std_logic;
	ram2_addr: out std_logic_vector(17 downto 0);
	ram2_data: inout std_logic_vector(15 downto 0)
  ) ;
end entity ; -- IMController

architecture arch of IMController is
begin
	
	ram2_en <= '0';
	process(PCInput, AluInput, write_data, mem_signal)
	begin
		case (mem_signal) is
			when IMWrite =>
			-- elsif read_enable /= IMReadEnable and write_enable = IMWriteEnable then
				-- write IM
				ram2_data <= write_data;
				ram2_addr <= "00" & AluInput;
				ram2_oe <= '1';
				ram2_we <= '0';
			when IMRead =>
				ram2_data <= "ZZZZZZZZZZZZZZZZ";
				ram2_oe <= '0';
				ram2_we <= '1';
				ram2_addr <= "00" & AluInput;
			when others =>
				ram2_data <= "ZZZZZZZZZZZZZZZZ";
				ram2_oe <= '0';
				ram2_we <= '1';
				ram2_addr <= "00" & PCInput;
		end case;
	end process ;

	getResult : process(ram2_data)
	begin
		-- when write, the IF/ID will be disabled
		if mem_signal /= IMWrite then
			read_result <= ram2_data;
		else
			read_result <= NOPInstruct;
		end if;
	end process ; -- getResult
end architecture ; -- arch