const { 
  series,
  parallel,
  src,
  dest,
  watch
} = require('gulp');
const { join } = require('path');
const { sync } = require('glob');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const path = join(__dirname, 'src');

const compileScss = () =>
  src(sync(join(path, 'scss', '**/*.scss')))
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(join(path, 'dist/css')));

const compileJS = (cb) => {
  cb();
}

const minifyCss = () =>
  src(sync(join(path, 'dist', '**/!(*.min).css')))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(
      rename(({ dirname, basename, extname }) => ({
        dirname,
        basename: `${basename}.min`,
        extname
      }))
    )
    .pipe(dest(join(path, 'dist/css')));

const minifyJS = (cb) => {
  cb();
}

const dev = () =>
  browserSync.init({
    server: {
      baseDir: join(path)
    }
  });

const watchJsAndScss = (cb) => {
  const jsFiles = sync(join(path, 'js', '**/*.js'));
  const scssFiles = sync(join(path, 'scss', '**/*.scss'));
  watch(jsFiles, series(compileJS, minifyJS, reloadBrowser));
  console.log('--- Watching JS ---');
  console.table(jsFiles);
  watch(scssFiles, series(compileScss, minifyCss, reloadBrowser));
  console.log('--- Watching SCSS ---');
  console.table(scssFiles);
  watch(sync(join(path, '**/*.html')), series(reloadBrowser));
  cb();
}

const reloadBrowser = (cb) => {
  browserSync.reload();
  cb();
}

exports.default = series(
  parallel(compileJS, compileScss),
  parallel(minifyJS, minifyCss),
  watchJsAndScss,
  dev
);