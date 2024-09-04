/// <amd-module name="SuiteCommerce.Columns.Instrumentation.Logger"/>
define("SuiteCommerce.Columns.Instrumentation.Logger", ["require", "exports", "SuiteCommerce.Columns.Instrumentation.FallbackLogger", "SuiteCommerce.Columns.Instrumentation.MockAppender"], function (require, exports, Instrumentation_FallbackLogger_1, Instrumentation_MockAppender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Logger = /** @class */ (function () {
        function Logger() {
        }
        Logger.getLogger = function () {
            this.instance = this.instance || this.buildLoggerInstance();
            return this.instance;
        };
        Logger.buildLoggerInstance = function () {
            var _a;
            try {
                // @ts-ignore
                var LoggersModule = require('Loggers').Loggers;
                // @ts-ignore
                var elasticAppender = require('Loggers.Appender.ElasticLogger').LoggersAppenderElasticLogger.getInstance();
                // Just for test purposes in local environments: the output of MockApppender is the browser console.
                var mockAppender = Instrumentation_MockAppender_1.MockAppender.getInstance();
                // @ts-ignore
                var configurationModule = require('Loggers.Configuration');
                var loggerName = "CommerceExtensions" + Logger.options.queueNameSuffix;
                LoggersModule.setConfiguration((_a = {},
                    _a[loggerName] = {
                        log: [
                            { profile: configurationModule.prod, appenders: [elasticAppender] },
                            { profile: configurationModule.dev, appenders: [mockAppender] },
                        ],
                        actions: {},
                        loggers: {},
                    },
                    _a));
                return LoggersModule.getLogger(loggerName);
            }
            catch (e) {
                return new Instrumentation_FallbackLogger_1.FallbackLogger(this.options);
            }
        };
        return Logger;
    }());
    exports.Logger = Logger;
});
