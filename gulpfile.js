var gulp = require('gulp');
var rollup = require('rollup').rollup;
var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');

gulp.task('build', function() {
    return rollup({

        entry: 'src/index.js',
        plugins: [
            nodeResolve({ jsnext: true }),
            commonjs()
        ]
    }).then(function(bundle) {
        return bundle.write({
            format: 'umd',
            globals:[
                "moment"
            ],
            moduleName:"Calendar",
            dest: 'dist/calendar.js'
        });
    });
});

gulp.task("watch",function(){
    gulp.watch("src/**/*.js",["build"]);
})

gulp.task("default",["build","watch"])