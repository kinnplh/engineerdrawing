filename=$1
jiliname=$2
vlib -unix work
vcom ${filename}.vhd ${jiliname}.vhd
vsim -c -do "vcd add wave /${jiliname}/*" -do "run 3000ns" -do "quit -sim" -do "q" ${jiliname}
echo "#" >> dump.vcd
#rm -rf work
#rm ./transcript

