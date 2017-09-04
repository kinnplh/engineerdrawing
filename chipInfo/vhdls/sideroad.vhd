library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity sideroad is
 	port (
		reg1_addr, reg2_addr: in std_logic_vector(3 downto 0);
		reg1_data, reg2_data: in std_logic_vector(15 downto 0);
		reg1_read_enable, reg2_read_enable: in std_logic;

		exe_reg_write_address, mem_reg_write_address: in std_logic_vector(3 downto 0);
		exe_reg_write_data, mem_reg_write_data: in std_logic_vector(15 downto 0);
		exe_reg_write_enable, mem_reg_write_enable: in std_logic;

		real_reg1_data, real_reg2_data: out std_logic_vector(15 downto 0)
	);
end entity ;


architecture arch of sideroad is
begin
	process(reg1_addr, reg1_data, reg1_read_enable,
		exe_reg_write_enable, exe_reg_write_data, exe_reg_write_address,
		mem_reg_write_enable, mem_reg_write_data, mem_reg_write_address)
	begin
		if (reg1_read_enable = ENABLE) then
			if (exe_reg_write_enable = ENABLE) and (reg1_addr = exe_reg_write_address) then
				real_reg1_data <= exe_reg_write_data;	
			elsif (mem_reg_write_enable = ENABLE) and (reg1_addr = mem_reg_write_address) then
				real_reg1_data <= mem_reg_write_data;
			else
				real_reg1_data <= reg1_data;
			end if;
		else
			real_reg1_data <= "0000000000000000"; 
		end if;
	end process;

	process(reg2_addr, reg2_data, reg2_read_enable,
		exe_reg_write_enable, exe_reg_write_data, exe_reg_write_address,
		mem_reg_write_enable, mem_reg_write_data, mem_reg_write_address)
	begin
		if (reg2_read_enable = ENABLE) then
			if (exe_reg_write_enable = ENABLE) and (reg2_addr = exe_reg_write_address) then
				real_reg2_data <= exe_reg_write_data;	
			elsif (mem_reg_write_enable = ENABLE) and (reg2_addr = mem_reg_write_address) then
				real_reg2_data <= mem_reg_write_data;
			else
				real_reg2_data <= reg2_data;
			end if;	
		else
			real_reg2_data <= "0000000000000000";	
		end if;
	end process;	
end architecture ; -- arch