'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var log = function(){};

function staticRouter() {
  var rootDir = (function lookupRootDir() {
    var findPath = __dirname;

    while (!fs.existsSync(findPath + '/package.json')) {
      findPath = path.resolve(findPath, '..');
    }

    return findPath;
  }());

  var nodeModuleDir = (function lookupNodeModuleDir(){
    var moduleDir = __dirname,
        checkPath = moduleDir;

    while (!fs.existsSync(checkPath + '/node_modules')) {
      checkPath = path.resolve(checkPath, '..');
    }

    return checkPath + '/node_modules';
  }());

  log.debug('rootDir => ', rootDir);
  log.debug('nodeModuleDir => ', nodeModuleDir);

  var router = express.Router();

  /**
   * <p>Adds a new static route relative to the directory where the
   * project's package.json resides.</p>
   *
   * <p>You can invoke this method with one or two parameters. When using
   * a single parameter, it doubles as the route and the location on the file
   * system. For example, <code>addRoute('/public')</code> would create the
   * route '/public' and serve files out of the public directory that is in
   * the same directory as the package.json.</p>
   *
   * <p>If you specify both parameters, the first is the route name and the
   * second is a relative path. For example,
   * <code>addRoute('/public', 'staticFiles/public')</code> would create the
   * route '/public' which serves files out of the directory
   * staticFiles/public which is relative to the package.json.</p>
   *
   * @param {string} name Optional bind path, e.g. '/public'
   * @param {string} routePath Directory where the files reside
   */
  router.addRoute = function addRoute(name, routePath) {
    var path = rootDir;
    if (!routePath) {
      path += (name.charAt(0) === '/') ? name : '/' + name;
      this.use(express.static(path));
    } else {
      path += (routePath.charAt(0) === '/') ? routePath : '/' + routePath;
      this.use(name, express.static(path));
    }

    log.debug('addRoute: [`%s`, `%s`]', name, path);
  };

  /**
   * Works like {@link #addRoute}, but uses the node_modules directory as
   * the base directory (instead of the directory where package.json resides).
   *
   * @param {string} name Optional bind path, e.g. '/public'
   * @param {string} nodeModulePath Directory relative to node_modules that
   * has the files to serve
   */
  router.addNodeRoute = function addNodeRoute(name, nodeModulePath) {
    var path = nodeModuleDir;
    if (!nodeModulePath) {
      path += (name.charAt(0) === '/') ? name : '/' + name;
      this.use(express.static(path));
    } else {
      path += (nodeModulePath.charAt(0) === 0) ? nodeModulePath
        : '/' + nodeModulePath;
      this.use(name, express.static(path));
    }

    log.debug('addNodeRoute: [`%s`, `%s`]', name, path);
  };

  return router;
}

exports = module.exports = function($logger) {
  log = $logger;
  return staticRouter();
};

exports['@require'] = [ 'logger' ];
exports['@singleton'] = false;