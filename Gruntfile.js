module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
            ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
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
    
    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            'build/*',
            '!build/.git*'
          ]
        }]
      }
    },
    
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    
    jshint: {
    	all: ['Gruntfile.js', 'src/**/*.js']
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
        src: 'src/less/<%= pkg.name %>.less',
        dest: 'build/css/<%= pkg.name %>.css'
      },
      dev: {
        src: 'src/less/<%= pkg.name %>.less',
        dest: 'src/css/<%= pkg.name %>.css'
      },
      themeMedium: {
        src: 'demo/less/theme-medium.less',
        dest: 'demo/css/theme-medium.css'
      },
      themeIos: {
        src: 'demo/less/theme-ios.less',
        dest: 'demo/css/theme-ios.css'
      },
      themeAndroid: {
        src: 'demo/less/theme-android.less',
        dest: 'demo/css/theme-android.css'
      },
      themeBlueMoon: {
        src: 'demo/less/theme-blue-moon.less',
        dest: 'demo/css/theme-blue-moon.css'
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
      build: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['src/**/*.js'],
            dest: 'build/'
          },
          {
            expand: true,
            flatten: true,
            src: ['css/**/*.css'],
            dest: 'build/css/'
          }
        ]
      },
    },
    
    shell: {
      build: {
        
      }
    },
    
    plato: {
      build: {
        options : {
          exclude: /\.min\.js$/    // excludes source files finishing with ".min.js"
        },
        files: {
          'report': ['src/**/*.js']
        }
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
        files: ['demo/less/**/*.less', 'demo/**/*.html', 'demo/js/**/*.js'],
        tasks: ['less:dev', 'less:themeMedium', 'less:themeIos', 'less:themeAndroid', 'less:themeBlueMoon', 'jshint']
      },
      options: {
        livereload: true
      }
    }

  });

  // Default task(s).
  grunt.registerTask('default', ['build']);
  
  grunt.registerTask('init', ['clean', 'copy:angular']);
  
  // Build task(s).
  grunt.registerTask('build', ['clean', 'less:build', 'uglify', 'jshint', 'copy:build', 'plato']);
  
  // Build task(s).
  grunt.registerTask('serve', ['connect', 'watch']);



};