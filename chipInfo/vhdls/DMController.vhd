library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity DMController is
port (

	clk: in std_logic;
	-- data
	read_write_addr: in std_logic_vector(15 downto 0);
	write_data: in std_logic_vector(15 downto 0);
	-- signal
	mem_signal: in std_logic_vector(2 downto 0); 
	-- output
	read_result: out std_logic_vector(15 downto 0);

	-- serial status
	tbre, tsre, data_ready: in std_logic;
	-- serial signal
	rdn, wrn: out std_logic;

	-- ram1 enable
	ram1_oe, ram1_we, ram1_en: out std_logic;
	-- ram1 bus
	ram1_addr: out std_logic_vector(17 downto 0);
	ram1_data: inout std_logic_vector(15 downto 0)
);
end entity ; -- DMController

architecture arch of DMController is
--signal read_data std_logic := '0';
begin
	
	process(read_write_addr, write_data, mem_signal, clk)
	begin
		-- default: all disabled
		ram1_oe <= '1';
		ram1_we <= '1';
		ram1_en <= '1';
		rdn <= '1';
		wrn <= '1';
		case (mem_signal) is
			when DMRead =>
				ram1_data <= "ZZZZZZZZZZZZZZZZ";
				ram1_en <= '0';
				ram1_oe <= '0';
				ram1_we <= '1';
				ram1_addr <= "00" & read_write_addr;
			when DMWrite =>
				ram1_data <= write_data;
				ram1_addr <= "00" & read_write_addr;
				ram1_en <= '0';
				ram1_oe <= '1';
				ram1_we <= '0';
			when SerialDataRead =>
				ram1_data <= "ZZZZZZZZZZZZZZZZ";
				rdn <= not clk;
			when SerialDataWrite =>
				ram1_data <= write_data;
				wrn <= clk;
			when others =>
				null;
		end case;
	end process;

	process(ram1_data, mem_signal, tbre, tsre, data_ready) --?
	begin
		if mem_signal = DMRead or mem_signal = SerialDataRead then
			read_result <= ram1_data;
		elsif mem_signal = SerialStateRead then
			read_result <= "00000000000000" & data_ready & (tbre AND tsre);
		else
			read_result <= NOPInstruct;
		end if;
	end process; -- getResult

end architecture; -- arch