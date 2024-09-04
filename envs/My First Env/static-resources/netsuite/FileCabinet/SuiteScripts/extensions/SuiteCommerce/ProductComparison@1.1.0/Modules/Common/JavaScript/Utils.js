/// <amd-module name="SuiteCommerce.ProductComparison.Common.Utils"/>
define("SuiteCommerce.ProductComparison.Common.Utils", ["require", "exports", "underscore", "SuiteCommerce.ProductComparison.Common.DependencyProvider"], function (require, exports, _, DependencyProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.imageFlatten = function (images) {
            var _this = this;
            var result = [];
            if ('url' in images && 'altimagetext' in images) {
                return [images];
            }
            Object.getOwnPropertyNames(images).forEach(function (key) {
                if (_.isArray(images[key])) {
                    result.push(images[key]);
                }
                else {
                    result.push(_this.imageFlatten(images[key]));
                }
            });
            return _.flatten(result);
        };
        Utils.addParamsToUrl = function (baseUrl, params, avoidDoubleRedirect) {
            if (avoidDoubleRedirect) {
                var newParams_1 = {};
                _.each(params, function (paramValue, paramKey) {
                    newParams_1["__" + paramKey] = paramValue;
                });
                params = newParams_1;
            }
            if (baseUrl && !_.isEmpty(params)) {
                var paramString = jQuery.param(params);
                var joinString = baseUrl.indexOf('?') !== -1 ? '&' : '?';
                return baseUrl + joinString + paramString;
            }
            return baseUrl;
        };
        Utils.parseUrlOptions = function (optionsString) {
            var urlOption = optionsString || '';
            if (urlOption && urlOption.indexOf('?') !== -1) {
                urlOption = _.last(urlOption.split('?'));
            }
            if (urlOption && urlOption.indexOf('#') !== -1) {
                urlOption = _.first(urlOption.split('#'));
            }
            var options = {};
            if (urlOption && urlOption.length > 0) {
                var tokens = urlOption.split(/&/g);
                var currentToken = [];
                while (tokens.length > 0) {
                    var firstElement = tokens.shift();
                    if (firstElement) {
                        currentToken = firstElement.split(/=/g);
                    }
                    if (currentToken && currentToken[0].length !== 0) {
                        options[currentToken[0]] = this.getDecodedURLParameter(currentToken[1]);
                    }
                }
            }
            return options;
        };
        Utils.getDecodedURLParameter = function (urlParameter) {
            if (urlParameter === void 0) { urlParameter = ''; }
            var position;
            var temporal;
            for (temporal = ''; (position = urlParameter.indexOf('%')) >= 0; urlParameter = urlParameter.substring(position + 3)) {
                temporal += urlParameter.substring(0, position);
                var extract = urlParameter.substring(position, position + 3);
                try {
                    temporal += decodeURIComponent(extract);
                }
                catch (e) {
                    temporal += extract;
                }
            }
            return temporal + urlParameter;
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
    exports.Utils = Utils;
});
