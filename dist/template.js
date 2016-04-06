"use strict";
var skin_1 = require('./skin');
exports.template = {
    viewPath: '/' + appPrefix + '/public/template/',
    containers: {},
    open: function (name, view) {
        var path = this.viewPath + view + '.html';
        var folder = appPrefix;
        if (appPrefix === '.') {
            folder = 'portal';
        }
        if (skin_1.skin.templateMapping[folder] && skin_1.skin.templateMapping[folder].indexOf(view) !== -1) {
            path = '/assets/themes/' + skin_1.skin.skin + '/template/' + folder + '/' + view + '.html';
        }
        this.containers[name] = path;
        if (this.callbacks && this.callbacks[name]) {
            this.callbacks[name].forEach(function (cb) {
                cb();
            });
        }
    },
    contains: function (name, view) {
        return this.containers[name] === this.viewPath + view + '.html';
    },
    isEmpty: function (name) {
        return this.containers[name] === 'empty' || !this.containers[name];
    },
    close: function (name) {
        this.containers[name] = 'empty';
        if (this.callbacks && this.callbacks[name]) {
            this.callbacks[name].forEach(function (cb) {
                cb();
            });
        }
    },
    watch: function (container, fn) {
        if (typeof fn !== 'function') {
            throw TypeError('template.watch(string, function) called with wrong parameters');
        }
        if (!this.callbacks) {
            this.callbacks = {};
        }
        if (!this.callbacks[container]) {
            this.callbacks[container] = [];
        }
        this.callbacks[container].push(fn);
    }
};
