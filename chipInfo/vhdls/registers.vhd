library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use IEEE.NUMERIC_STD.ALL;
use work.constantsIF.all;

entity registers is
port (
	clk, rst: in std_logic;
	r1addr, r2addr: in std_logic_vector(3 downto 0);

	r1re, r2re: in std_logic;

	waddr: in std_logic_vector(3 downto 0);
	wdata: in std_logic_vector(15 downto 0);
	we: in std_logic;

	r1data, r2data: out std_logic_vector(15 downto 0)
);
end entity;

architecture bhv of registers is
signal reg_array: RegArray := (others => ZeroWord);
begin

	process (clk)
	begin
		if falling_edge(clk) then
			if rst = RstEnable then
				NULL;
			elsif we = WriteEnable then
				reg_array(conv_integer(waddr)) <= wdata;
			end if;
		end if;
	end process;

	process (clk, rst, r1addr, r1re, waddr, wdata, we)
	begin
		if rst = RstEnable then
			r1data <= ZeroWord;
		elsif r1addr = waddr and we = WriteEnable and r1re = ReadEnable then
			r1data <= wdata;
		elsif r1re = ReadEnable then
			r1data <= reg_array(conv_integer(r1addr));
		else
			r1data <= ZeroWord;
		end if;
	end process;

	process (clk, rst, r2addr, r2re, waddr, wdata, we)
	begin
		if rst = RstEnable then
			r2data <= ZeroWord;
		elsif r2addr = waddr and we = WriteEnable and r2re = ReadEnable then
			r2data <= wdata;
		elsif r2re = ReadEnable then
			r2data <= reg_array(conv_integer(r2addr));
		else
			r2data <= ZeroWord;
		end if;
	end process;

end architecture;
