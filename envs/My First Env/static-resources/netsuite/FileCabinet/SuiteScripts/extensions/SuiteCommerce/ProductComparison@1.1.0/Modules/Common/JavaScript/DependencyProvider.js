/// <amd-module name="SuiteCommerce.ProductComparison.Common.DependencyProvider"/>
define("SuiteCommerce.ProductComparison.Common.DependencyProvider", ["require", "exports", "underscore", "Backbone.CachedCollection", "Backbone.CachedModel", "AjaxRequestsKiller", "Profile.Model", "Utils"], function (require, exports, _, BackboneCachedCollectionModule, BackboneCachedModelModule, AjaxRequestsKillerModule, ProfileModelModule, UtilsModuleSC) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackboneCachedCollection = getDependency(BackboneCachedCollectionModule);
    exports.BackboneCachedModel = getDependency(BackboneCachedModelModule);
    exports.AjaxRequestsKiller = getDependency(AjaxRequestsKillerModule);
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
