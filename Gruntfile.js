module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
            ' * Cyberplus v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright 1994-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            '* \n' +
            '*            .                                     .                                  \n' +
            '* .  *               *   *             .                          .       .       *   \n' +
            '*        .  *                     *   *    .  *      ,:      .        *     .    .    \n' +
            '*                           *                      ,\' |     .     *                   \n' +
            '*  *   .        *       .       .       *         /   :                               \n' +
            '*                                              --\'   /                .         .     \n' +
            '*     .  *                       *              \/ />/                                 \n' +
            '*             *                                / <//_\\                 .     -o-      \n' +
            '*  *   .         \\:/    .       .       *   __/   /                                   \n' +
            '*                 O                         )\'-. /             .                .     \n' +
            '*                    .                      ./  :\\                                    \n' +
            '*        *   .                .             /.\' \'                                     \n' +
            '*                                          \'/\'       .  *           *                 \n' +
            '*               .                         +                    .                      \n' +
            '*       *                     .           \'                                .          \n' +
            '*                                       `.                                            \n' +
            '*               *                   .-"-             .                       .        \n' +
            '*                                  (    |                                             \n' +
            '*           .                   . .-\'  \'.                          *                  \n' +
            '*                              ( (.   )A:                                             \n' +
            '*                          .\'    / (_  )                                  -o-         \n' +
            '*                           _. :(.   )AP  `                 .                         \n' +
            '*     *   .            .  (  `-\' (  `.   .                                            \n' +
            '*                        .  :  (   .APx)                                              \n' +
            '*                       /_`( "a `a. )"\'                                               \n' +
            '*                   (  (/  .  \' )==\'       .  *                             *         \n' +
            '*                  (   (    )  .A"   +                                                \n' +
            '*                    (`\'AP.( _(   (                                                   \n' +
            '*                 ..-. `AP    ) `  )  +                                               \n' +
            '*               -\'   (      +aP:  )                                                   \n' +
            '*             \'    _  `    (AP.cx                    *                                \n' +
            '*           _(    (    )b  -`.  ) +                                                   \n' +
            '*           )/    (AP   (AP    )  )                                                   \n' +
            '*           (  (/  .  \' )  \' ) )                                                      \n' +
            '*            .  (  `-\' (  `.  .                                                       \n' +
            '*            ( (.   )    )                                                            \n' +
            '*               (    |                                                                \n' +
            '* \n' +
            ' */\n',
    
    
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      build: {
        src: 'demo/js/<%= pkg.name %>.js',
        dest: 'demo/js-min/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
    	all: ['Gruntfile.js', 'demo/js/**/*.js']
  	},
    less: {
      options: {
        banner: '<%= banner %>',
				strictMath: true,
				sourceMap: true,
				outputSourceFiles: true,
				sourceMapURL: '<%= pkg.name %>.css.map',
				sourceMapFilename: 'demo/css/<%= pkg.name %>.css.map'
      },
      build: {
        src: 'demo/less/<%= pkg.name %>.less',
        dest: 'demo/css/<%= pkg.name %>.css'
      }
    },
    copy: {
      angular: {
        files: [
            {
              expand: true,
              flatten: true,
              src: ['bower_components/angular*/**/angular*.js'],
              dest: 'demo/lib/'
            },
            {
              expand: true,
              flatten: true,
              src: ['bower_components/angular*/**/angular*.map'],
              dest: 'demo/lib/'
            }
        ]
      },
      boostrapMixins: {
        files: [
            {
              expand: true,
              flatten: true,
              src: ['bower_components/bootstrap/less/mixins.less'],
              dest: 'demo/less/bootstrap/'
            },
            {
              expand: true,
              flatten: true,
              src: ['bower_components/bootstrap/less/mixins/*.less'],
              dest: 'demo/less/bootstrap/mixins'
            }
        ]
      }
    },
    shell: {
      build: {
        
      }
    },
    
    connect: {
      server: {
        options: {
          port: 8000,
          base: 'demo/',
          open: true
        }
      }
    },
    
    watch: {
      less: {
        files: ['demo/less/**/*.less', 'demo/**/*.html', 'demo/data/**/*.json', 'demo/js/**/*.js'],
        tasks: ['less:dev', 'jshint']
      },
      options: {
        livereload: true
      }
    }

  });

  // Default task(s).
  grunt.registerTask('default', ['less', 'uglify', 'jshint']);
  
  grunt.registerTask('init', ['copy']);
  
  // Build task(s).
  grunt.registerTask('build', ['less:build', 'uglify', 'jshint']);
  
  // Build task(s).
  grunt.registerTask('serve', ['connect', 'watch']);



};