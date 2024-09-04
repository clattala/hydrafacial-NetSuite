/// <amd-module name="SuiteCommerce.MapAndContactUs.Common.DependencyProvider"/>
define("SuiteCommerce.MapAndContactUs.Common.DependencyProvider", ["require", "exports", "underscore", "Utils"], function (require, exports, _, UtilsModuleSC) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UtilsModule = getDependency(UtilsModuleSC);
    function getDependency(module) {
        if (isTranspiledModule(module)) {
            return module[Object.keys(module)[0]];
        }
        return module;
    }
    function isTranspiledModule(module) {
        var moduleKeys = Object.keys(module);
        return !_.isFunction(module) && moduleKeys.length === 1;
    }
});
