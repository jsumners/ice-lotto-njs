module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    migrate: {
      options: {
        config: './migrations/database.json',
        verbose: true,
        env: {
          NODE_ENV: 'development'
        }
      },
      verbose: true
    }
  });

  grunt.loadNpmTasks('grunt-db-migrate');
};
