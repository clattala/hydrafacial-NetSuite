/// <amd-module name="SuiteCommerce.FeaturedProduct.Common.DependencyProvider"/>
define("SuiteCommerce.FeaturedProduct.Common.DependencyProvider", ["require", "exports", "underscore", "Profile.Model", "Utils", "Backbone.CachedModel"], function (require, exports, _, ProfileModelModule, UtilsModuleSC, BackboneCachedModelModule) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackboneCachedModel = getDependency(BackboneCachedModelModule);
    exports.ProfileModel = getDependency(ProfileModelModule);
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
