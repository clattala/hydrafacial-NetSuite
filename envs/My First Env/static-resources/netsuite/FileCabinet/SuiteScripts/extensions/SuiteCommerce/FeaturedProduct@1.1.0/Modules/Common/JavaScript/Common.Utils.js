/// <amd-module name="SC.FeaturedProduct.Common.Utils"/>
define("SC.FeaturedProduct.Common.Utils", ["require", "exports", "underscore", "jQuery", "SuiteCommerce.FeaturedProduct.Common.DependencyProvider"], function (require, exports, _, jQuery, DependencyProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.trim = function (text) {
            return jQuery.trim(text);
        };
        Utils.resizeImage = function (sizes, url, size) {
            var resize = _.where(sizes, { name: size })[0];
            url = url || '';
            if (resize) {
                return url + (url.indexOf('?') !== -1 ? '&' : '?') + resize.urlsuffix;
            }
            return url;
        };
        Utils.getThemeAbsoluteUrlOfNonManagedResources = function (default_value, file) {
            return DependencyProvider_1.UtilsModule.getThemeAbsoluteUrlOfNonManagedResources(default_value, file);
        };
        Utils.imageFlatten = function (images) {
            var result = [];
            if ('url' in images && 'altimagetext' in images) {
                return [images];
            }
            Object.getOwnPropertyNames(images).forEach(function (key) {
                if (_.isArray(images[key])) {
                    result.push(images[key]);
                }
                else {
                    result.push(Utils.imageFlatten(images[key]));
                }
            });
            return _.flatten(result);
        };
        Utils.addParamsToUrl = function (baseUrl, params, avoidDoubleRedirect) {
            if (avoidDoubleRedirect) {
                var new_params_1 = {};
                _.each(params, function (param_value, param_key) {
                    new_params_1['__' + param_key] = param_value;
                });
                params = new_params_1;
            }
            // We get the search options from the config file
            if (baseUrl && !_.isEmpty(params)) {
                var paramString = jQuery.param(params);
                var join_string = baseUrl.indexOf('?') !== -1 ? '&' : '?';
                return baseUrl + join_string + paramString;
            }
            return baseUrl;
        };
        Utils.translate = function (text) {
            var continuationText = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                continuationText[_i - 1] = arguments[_i];
            }
            return DependencyProvider_1.UtilsModule.translate(text, continuationText);
        };
        return Utils;
    }());
    exports.default = Utils;
});
