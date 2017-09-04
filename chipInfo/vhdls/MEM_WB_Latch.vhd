library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity MEM_WB_Latch is
port (
	clk, rst: in std_logic;
	mem_write_reg: in std_logic_vector(3 downto 0);
	wb_write_reg: out std_logic_vector(3 downto 0);
	mem_write_back: in std_logic;
	wb_write_back: out std_logic;
	
	write_data: in std_logic_vector(15 downto 0);
	dm_data: in std_logic_vector(15 downto 0);
	im_data: in std_logic_vector(15 downto 0);

	mem_signal: in std_logic_vector(2 downto 0);
	
	write_data_out: out std_logic_vector(15 downto 0);
	dm_data_out: out std_logic_vector(15 downto 0);
	im_data_out: out std_logic_vector(15 downto 0);

	mem_signal_out: out std_logic_vector(2 downto 0)
	
);
end entity;

architecture arch of MEM_WB_Latch is
begin
	process(clk, rst)
	begin
		if rst = RstEnable then
			wb_write_back <= '0';
			wb_write_reg <= "0000"; --?
		elsif rising_edge(clk) then
			wb_write_reg <= mem_write_reg;
			wb_write_back <= mem_write_back;
	
			write_data_out <= write_data;
			dm_data_out <= dm_data;
			im_data_out <= im_data;
			mem_signal_out <= mem_signal;
			
		end if;
	end process;
end architecture;