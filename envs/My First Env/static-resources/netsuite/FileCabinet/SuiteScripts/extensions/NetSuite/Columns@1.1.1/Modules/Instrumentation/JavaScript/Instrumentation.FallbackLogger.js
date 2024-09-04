/// <amd-module name="SuiteCommerce.Columns.Instrumentation.FallbackLogger"/>
define("SuiteCommerce.Columns.Instrumentation.FallbackLogger", ["require", "exports", "jQuery", "Url"], function (require, exports, jQuery, Url) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var queueErrorTemp = [];
    var queueInfoTemp = [];
    var FallbackLogger = /** @class */ (function () {
        function FallbackLogger(options) {
            var _this = this;
            this.options = options;
            if (!this.isEnabled()) {
                return;
            }
            this.isWaiting = false;
            setInterval(function () {
                _this.processQueues(true);
            }, 60000);
            window.addEventListener('beforeunload', function () {
                _this.processQueues(false);
            });
        }
        Object.defineProperty(FallbackLogger.prototype, "environment", {
            get: function () {
                if (this.options.environment) {
                    return this.options.environment;
                }
                console.error('Please initialize instrumentation with the Environment Component.');
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FallbackLogger.prototype, "queueErrorName", {
            get: function () {
                return "queueError" + this.options.queueNameSuffix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FallbackLogger.prototype, "queueInfoName", {
            get: function () {
                return "queueInfo" + this.options.queueNameSuffix;
            },
            enumerable: true,
            configurable: true
        });
        FallbackLogger.prototype.info = function (obj) {
            if (!this.isEnabled()) {
                return;
            }
            var objWrapper = obj;
            objWrapper.suiteScriptAppVersion = SC.ENVIRONMENT.RELEASE_METADATA.version;
            objWrapper.message = "clientSideLogDateTime: " + new Date().toISOString();
            if (this.isWaiting) {
                queueInfoTemp.push(objWrapper);
            }
            else {
                var queueInfo = JSON.parse(localStorage.getItem(this.queueInfoName)) || [];
                queueInfo.push(objWrapper);
                localStorage.setItem(this.queueInfoName, JSON.stringify(queueInfo));
            }
        };
        FallbackLogger.prototype.error = function (obj) {
            if (!this.isEnabled()) {
                return;
            }
            var objWrapper = obj;
            objWrapper.suiteScriptAppVersion = SC.ENVIRONMENT.RELEASE_METADATA.version;
            objWrapper.message = "clientSideLogDateTime: " + new Date().toISOString();
            if (this.isWaiting) {
                queueErrorTemp.push(objWrapper);
            }
            else {
                var queueError = JSON.parse(localStorage.getItem(this.queueErrorName)) || [];
                queueError.push(objWrapper);
                localStorage.setItem(this.queueErrorName, JSON.stringify(queueError));
            }
        };
        FallbackLogger.prototype.processQueues = function (isAsync) {
            if (!this.isEnabled()) {
                return;
            }
            var parsedURL = new Url().parse(SC.ENVIRONMENT.baseUrl);
            var product = SC.ENVIRONMENT.BuildTimeInf.product;
            var url = parsedURL.schema + "://" + parsedURL.netLoc + "/app/site/hosting/scriptlet.nl" +
                ("?script=customscript_" + product.toLowerCase() + "_loggerendpoint") +
                ("&deploy=customdeploy_" + product.toLowerCase() + "_loggerendpoint");
            var queueError = JSON.parse(localStorage.getItem(this.queueErrorName));
            var queueInfo = JSON.parse(localStorage.getItem(this.queueInfoName));
            if ((queueInfo && queueInfo.length > 0) ||
                (queueError && queueError.length > 0)) {
                this.isWaiting = true;
                var data = {
                    type: product,
                    info: queueInfo,
                    error: queueError,
                };
                if (navigator.sendBeacon) {
                    this.sendDataThroughUserAgent(url, data);
                }
                else {
                    this.sendDataThroughAjaxRequest(url, data, isAsync);
                }
            }
        };
        FallbackLogger.prototype.isEnabled = function () {
            return !this.environment.isPageGenerator();
        };
        FallbackLogger.prototype.sendDataThroughUserAgent = function (url, data) {
            var successfullyTransfer = navigator.sendBeacon(url, JSON.stringify(data));
            if (successfullyTransfer) {
                this.clearQueues();
            }
            else {
                this.appendTemp();
            }
        };
        FallbackLogger.prototype.sendDataThroughAjaxRequest = function (url, data, isAsync) {
            var _this = this;
            jQuery
                .ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'POST',
                async: isAsync,
            })
                .done(function () { return _this.clearQueues(); })
                .fail(function () { return _this.appendTemp(); });
        };
        FallbackLogger.prototype.clearQueues = function () {
            localStorage.setItem(this.queueErrorName, JSON.stringify(queueErrorTemp));
            localStorage.setItem(this.queueInfoName, JSON.stringify(queueInfoTemp));
            queueErrorTemp.length = 0;
            queueInfoTemp.length = 0;
            this.isWaiting = false;
        };
        FallbackLogger.prototype.appendTemp = function () {
            var queueErrorStr = localStorage.getItem(this.queueErrorName);
            var queueInfoStr = localStorage.getItem(this.queueInfoName);
            if (queueErrorTemp.length > 0) {
                var queueError = queueErrorStr == null ? [] : JSON.parse(queueErrorStr);
                localStorage.setItem(this.queueErrorName, JSON.stringify(queueError.concat(queueErrorTemp)));
            }
            if (queueInfoTemp.length > 0) {
                var queueInfo = queueInfoStr == null ? [] : JSON.parse(queueInfoStr);
                localStorage.setItem(this.queueInfoName, JSON.stringify(queueInfo.concat(queueInfoTemp)));
            }
            this.isWaiting = false;
        };
        return FallbackLogger;
    }());
    exports.FallbackLogger = FallbackLogger;
});
