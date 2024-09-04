/// <amd-module name="SC.FeaturedProduct.Common.Utils"/>
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define("SC.FeaturedProduct.Common.Utils", ["require", "exports", "underscore", "jQuery", "SC.FeaturedProduct.Common.Configuration"], function (require, exports, _, jQuery, Common_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var profile = null;
    var RegistrationType;
    (function (RegistrationType) {
        // no login, no register, checkout as guest only
        RegistrationType["disabled"] = "disabled";
        // login, register, guest
        RegistrationType["optional"] = "optional";
        // login, register, no guest
        RegistrationType["required"] = "required";
        // login, no register, no guest
        RegistrationType["existing"] = "existing";
    })(RegistrationType || (RegistrationType = {}));
    function stringFormat(text) {
        var continuationText = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            continuationText[_i - 1] = arguments[_i];
        }
        return text.replace(/\$\((\d+)\)/g, function (match, number) {
            if (typeof continuationText[number] !== 'undefined') {
                return continuationText[number].toString();
            }
            return match.toString();
        });
    }
    function isUrlAbsolute(url) {
        return /^https?:\/\//.test(url);
    }
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
        Utils.getThemeAbsoluteUrlOfNonManagedResources = function (defaultValue, file) {
            if (!file) {
                file = '';
                if (SC.ENVIRONMENT.isExtended) {
                    file = SC.ENVIRONMENT.themeAssetsPath || '';
                }
                else if (SC.ENVIRONMENT.BuildTimeInf && SC.ENVIRONMENT.BuildTimeInf.isSCLite) {
                    if (SC.CONFIGURATION.unmanagedResourcesFolderName) {
                        file = "site/" + SC.CONFIGURATION.unmanagedResourcesFolderName + "/";
                    }
                    else {
                        file = 'default/';
                    }
                }
                file += defaultValue;
            }
            return Utils.getAbsoluteUrl(file);
        };
        Utils.getAbsoluteUrl = function (file) {
            if (file === void 0) { file = ''; }
            var base_url = (SC && SC.ENVIRONMENT && SC.ENVIRONMENT.baseUrl) || '';
            var fileReplace = file;
            if (base_url && !isUrlAbsolute(fileReplace)) {
                return base_url.replace('{{file}}', fileReplace);
            }
            return file;
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
            if (!text) {
                return '';
            }
            // Turns the arguments object into an array
            var parameters = [];
            // Checks the translation table
            var result = SC.Translations && SC.Translations[text] ? SC.Translations[text] : text;
            if (continuationText && continuationText.length && result) {
                var firstParameter = continuationText[0];
                if (_.isArray(firstParameter) && firstParameter.length) {
                    parameters = firstParameter;
                }
                else {
                    parameters = _.map(continuationText, function (param) {
                        return _.escape(param);
                    });
                }
            }
            result = stringFormat.apply(void 0, __spreadArrays([result], parameters));
            return result;
        };
        Utils.hidePrices = function () {
            if (this.userProfileData) {
                return (this.getRegistrationType() !== RegistrationType.disabled &&
                    Common_Configuration_1.Configuration.get('siteSettings.requireloginforpricing', 'F') === 'T' &&
                    !this.userProfileData.isloggedin);
            }
            //SCA <19.1
            var ProfileModel = require('Profile.Model');
            return ProfileModel.getInstance().hidePrices();
        };
        Utils.getRegistrationType = function () {
            // registrationmandatory is 'T' when customer registration is disabled
            if (Common_Configuration_1.Configuration.get('siteSettings.registration.registrationmandatory', null) === 'T') {
                return RegistrationType.disabled;
            }
            if (Common_Configuration_1.Configuration.get('siteSettings.registration.registrationoptional', null) === 'T') {
                return RegistrationType.optional;
            }
            if (Common_Configuration_1.Configuration.get('siteSettings.registration.registrationallowed', null) === 'T') {
                return RegistrationType.required;
            }
            return RegistrationType.existing;
        };
        Object.defineProperty(Utils, "userProfileData", {
            get: function () {
                if (profile) {
                    return profile;
                }
                return null;
            },
            set: function (profileData) {
                profile = profileData;
            },
            enumerable: true,
            configurable: true
        });
        return Utils;
    }());
    exports.default = Utils;
});
