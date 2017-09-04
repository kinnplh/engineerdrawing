module.exports = function(grunt) {
    grunt.initConfig({
        qunit:{
            target: {
                src: ['test/*.html']
            }
        },
        concat: {
            // options: {
            //     banner: bannerContent,
            //     separator: ';'
            // },
            target : {
                src : [
                    'canvasDev/macros.js',
                    'canvasDev/line.js',
                    'canvasDev/node.js',
                    'canvasDev/chip.js',
                    'canvasDev/circuit.js',

                    'canvasDev/keys.js',
                    'canvasDev/pageElements.js',
                ],
                dest : 'public/js/canvas.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['qunit', 'concat']);
};