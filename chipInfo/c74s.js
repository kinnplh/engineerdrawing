/**
 * Created by kinnplh on 11/2/16.
 */

const c74s = {
    '74LS00': {
        name: '74LS00',
        type: 'gate',
        number: 3,
        description: '四-二输入与非门',
        inputNodes: [
            {y: 1, name: 'Vcc', num: 14, specieName: 'vcc'},
            {y: 2, name: '1A', num: 1},
            {y: 3, name: '1B', num: 2},
            {y: 4, name: '2A', num: 4},
            {y: 5, name: '2B', num: 5},
            {y: 6, name: '3A', num: 9},
            {y: 7, name: '3B', num: 10},
            {y: 8, name: '4A', num: 12},
            {y: 9, name: '4B', num: 13},
            {y: 10, name: 'GND', num: 7, specieName: 'gnd'}
        ],
        outputNodes: [
            {y: 2, name: '1Y', num: 3},
            {y: 4, name: '2Y', num: 6},
            {y: 6, name: '3Y', num: 8},
            {y: 8, name: '4Y', num: 11}
        ],
        height: 11
    },
    '74LS04': {
        name: '74LS04',
        type: 'gate',
        number: 3,
        description: '六反相器',
        inputNodes: [
            {y: 1, name: 'Vcc', num: 14, specieName: 'vcc'},
            {y: 2, name: '1A', num: 1},
            {y: 3, name: '2A', num: 3},
            {y: 4, name: '3A', num: 5},
            {y: 5, name: '4A', num: 9},
            {y: 6, name: '5A', num: 11},
            {y: 7, name: '6A', num: 13},
            {y: 8, name: 'GND', num: 7, specieName: 'gnd'}
        ],
        outputNodes: [
            {y: 2, name: '1Y', num: 2},
            {y: 3, name: '2Y', num: 4},
            {y: 4, name: '3Y', num: 6},
            {y: 5, name: '4Y', num: 8},
            {y: 6, name: '5Y', num: 10},
            {y: 7, name: '6Y', num: 12},
        ],
        height: 9
    },
    '74LS11': {
        name: '74LS11',
        type: 'gate',
        number: 3,
        description: '三输入与门',
        inputNodes: [
            {y: 1, name: 'Vcc', num: 14, specieName: 'vcc'},
            {y: 2, name: '1A', num: 1},
            {y: 3, name: '1B', num: 2},
            {y: 4, name: '1C', num: 13},
            {y: 5, name: '2A', num: 3},
            {y: 6, name: '2B', num: 4},
            {y: 7, name: '2C', num: 5},
            {y: 8, name: '3A', num: 9},
            {y: 9, name: '3B', num: 10},
            {y: 10, name: '3C', num: 11},
            {y: 11, name: 'GND', num: 7, specieName: 'gnd'}
        ],
        outputNodes: [
            {y: 3, name: '1Y', num: 12},
            {y: 6, name: '2Y', num: 6},
            {y: 9, name: '3Y', num: 8},
        ],
        height: 12
    },
    '74LS86': {
        name: '74LS86',
        type: 'gate',
        number: 3,
        description: '四-二输入异或门',
        inputNodes: [
            {y: 1, name: 'Vcc', num: 14, specieName: 'vcc'},
            {y: 2, name: '1A', num: 1},
            {y: 3, name: '1B', num: 2},
            {y: 4, name: '2A', num: 4},
            {y: 5, name: '2B', num: 5},
            {y: 6, name: '3A', num: 9},
            {y: 7, name: '3B', num: 10},
            {y: 8, name: '4A', num: 12},
            {y: 9, name: '4B', num: 13},
            {y: 10, name: 'GND', num: 7, specieName: 'gnd'}
        ],
        outputNodes: [
            {y: 2, name: '1Y', num: 3},
            {y: 4, name: '2Y', num: 6},
            {y: 6, name: '3Y', num: 8},
            {y: 8, name: '4Y', num: 11}
        ],
        height: 11
    },
    '74LS90': {
        name: '74LS90',
        type: 'counter',
        number: 3,
        description: '二-五-十进制异步计数器',
        inputNodes: [
            {y:1, name: 'Vcc', num: 5, specieName: 'vcc'},
            {y:2, name: 'CPA', num: 14},
            {y:3, name: 'CPB', num: 1},
            {y:4, name: 'R1', num: 2},
            {y:5, name: 'R2', num: 3},
            {y:6, name: 'NC', num: 4, specieName: 'nc'},
            {y:7, name: 'S1', num: 6},
            {y:8, name: 'S2', num: 7},
            {y:9, name: 'GND', num: 10, specieName: 'gnd'}
        ],
        outputNodes: [
            {y:2, name: 'NC', num: 13, specieName: 'nc'},
            {y:4, name: 'Q0', num: 12},
            {y:5, name: 'Q1', num: 9},
            {y:6, name: 'Q2', num: 8},
            {y:7, name: 'Q3', num: 11},

        ],
        height: 10
    },
    '74LS161': {
        name: '74LS161',
        type: 'counter',
        number: 2,
        description: '4位二进制同步计数器',
        inputNodes: [
            {y:1, name: 'Vcc', num: 16, specieName: 'vcc'},
            {y:2, name: '~R', num: 1},
            {y:3, name: 'CP', num: 2},
            {y:4, name: 'A', num: 3},
            {y:5, name: 'B', num: 4},
            {y:6, name: 'C', num: 5},
            {y:7, name: 'D', num: 6},
            {y:8, name: 'P', num: 7},
            {y:9, name: 'T', num: 10},
            {y:10, name: '~LD', num: 9},
            {y:11, name: 'GND', num: 8, specieName: 'gnd'}
        ],
        outputNodes: [
            {y:2, name: 'Co', num: 15},
            {y:4, name: 'Q0', num: 14},
            {y:5, name: 'Q1', num: 13},
            {y:6, name: 'Q2', num: 12},
            {y:7, name: 'Q3', num: 11},

        ],
        height: 12
    }
};

module.exports = c74s;