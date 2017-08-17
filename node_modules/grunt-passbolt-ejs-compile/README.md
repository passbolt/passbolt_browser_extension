# grunt-ejs

A Grunt task for compiling [ejs](http://npmjs.org/package/ejs) templates.

## Getting Started

Install this grunt plugin next to your project's
[Gruntfile.js](http://gruntjs.com/getting-started) with: `npm install grunt-passbolt-ejs-compile --save-dev`.

Then add this line to your project's `Gruntfile.js`:

```javascript
  grunt.loadNpmTasks('grunt-passbolt-ejs-compile');
```

## Documentation

Add the task to your config and specify the destination for the compiled file:

```javascript
grunt.initConfig({
    ejs_compile: {
        all: {
    cwd: path.src_templates,
            src: ['**/*.ejs'],
            dest: path.build_templates,
            expand: true,
            ext: '.js'
        }
    }
});
```

## License
Licensed under the AGPL-3.0 license.
