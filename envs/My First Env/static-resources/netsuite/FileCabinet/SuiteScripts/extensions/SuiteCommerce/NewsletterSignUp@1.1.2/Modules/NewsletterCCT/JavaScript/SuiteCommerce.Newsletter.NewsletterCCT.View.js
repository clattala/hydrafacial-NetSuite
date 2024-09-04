/// <amd-module name="SuiteCommerce.Newsletter.NewsletterCCT.View"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define("SuiteCommerce.Newsletter.NewsletterCCT.View", ["require", "exports", "SuiteCommerce.Newsletter.NewsletterCCT.Model", "CustomContentType.Base.View", "Backbone.FormView", "SuiteCommerce.Newsletter.ExtMessage.View", "netsuite_newslettercct.tpl", "jQuery", "underscore", "SuiteCommerce.Newsletter.Instrumentation", "SuiteCommerce.Newsletter.ExtMessage.Model"], function (require, exports, SuiteCommerce_Newsletter_NewsletterCCT_Model_1, CustomContentTypeBaseView, BackboneFormView, ExtMessage_View_1, NetsuiteNewslettersCCTTpl, jQuery, _, Instrumentation_1, ExtMessage_Model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NewsletterCCTView = /** @class */ (function (_super) {
        __extends(NewsletterCCTView, _super);
        function NewsletterCCTView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = NetsuiteNewslettersCCTTpl;
            _this.model = new SuiteCommerce_Newsletter_NewsletterCCT_Model_1.NewsletterCCTModel();
            _this.fieldNamePrefix = 'custrecord_cct_ns_news_';
            _this.state = {
                code: '',
                message: '',
                messageType: '',
            };
            _this.events = {
                'submit form': 'doSubscribe',
            };
            _this.bindings = {
                '[name="email"]': 'email',
                '[name="firstName"]': 'firstName',
                '[name="lastName"]': 'lastName',
                '[name="company"]': 'company',
            };
            _this.LAYOUT = {
                '1': 'horizontal',
                '2': 'vertical',
                '3': 'left',
                '4': 'right',
            };
            _this.MIN_WIDTH_LAYOUT = 380;
            _this.container = options.container;
            BackboneFormView.add(_this);
            return _this;
        }
        NewsletterCCTView.prototype.parseSettings = function () {
            var resizeId;
            this.newsletterSettings = {
                imgresize: this.getSetting('imgresize'),
                bgimg_url: this.getSetting('bgimg_url'),
                header: this.getSetting('header'),
                subHeader: this.getSetting('subheader'),
                buttonText: this.getSetting('buttontext'),
                showFirstName: this.getSetting('showfirst', 'F') === 'T',
                showLastName: this.getSetting('showlast', 'F') === 'T',
                showCompany: this.getSetting('showcompany', 'F') === 'T',
                optionalFirstName: this.getSetting('optfirst', 'F') === 'T',
                optionalLastName: this.getSetting('optlast', 'F') === 'T',
                optionalCompany: this.getSetting('optcompany', 'F') === 'T',
                firstName: this.getSetting('placefirst'),
                lastName: this.getSetting('placelast'),
                company: this.getSetting('placecompany'),
                email: this.getSetting('placeemail', 'username@domain.com'),
                labelFirstName: this.getSetting('labelfirst'),
                labelLastName: this.getSetting('labellast'),
                labelCompany: this.getSetting('labelcompany'),
                labelEmail: this.getSetting('labelemail'),
                leadSubsidiary: this.container
                    .getComponent('Environment')
                    .getConfig('newsletterSignUp.leadSubsidiary'),
                termsLabel: this.getSetting('termslabel'),
                termsLink: this.getSetting('termslink'),
                hasLink: !!this.getSetting('termslink'),
                layout: this.LAYOUT[this.getSetting('layout', '1')],
            };
            if (this.newsletterSettings.bgimg_url &&
                this.newsletterSettings.imgresize) {
                resizeId = this.findResizeId();
                if (resizeId) {
                    this.newsletterSettings.bgimg_url += '&resizeid=' + resizeId;
                }
            }
            this.newsletterSettings.termsLabel =
                !this.newsletterSettings.termsLabel && !!this.newsletterSettings.termsLink
                    ? this.newsletterSettings.termsLink
                    : this.newsletterSettings.termsLabel;
            this.messages = {
                emailEmpty: this.getSetting('v_emailempty'),
                emailNotValid: this.getSetting('v_emailwrong'),
                firstNameEmpty: this.getSetting('v_fnameempty'),
                lastNameEmpty: this.getSetting('v_lnameempty'),
                companyEmpty: this.getSetting('v_companyempty'),
            };
            this.feedback = {
                OK: {
                    type: 'success',
                    message: this.getSetting('m_ok'),
                },
                ERR_USER_STATUS_ALREADY_SUBSCRIBED: {
                    type: 'warning',
                    message: this.getSetting('m_warn'),
                },
                ERR_USER_STATUS_DISABLED: {
                    type: 'error',
                    message: this.getSetting('m_emailerr'),
                },
                ERROR: {
                    type: 'error',
                    message: this.getSetting('m_err'),
                },
            };
        };
        NewsletterCCTView.prototype.getSetting = function (fieldName, defaultValue) {
            if (defaultValue === void 0) { defaultValue = ''; }
            if (!this.settings) {
                return null;
            }
            var setValue = jQuery.trim(this.settings[this.fieldNamePrefix + fieldName]);
            return setValue || defaultValue;
        };
        NewsletterCCTView.prototype.findResizeId = function () {
            var _this = this;
            var imagesizes = this.container
                .getComponent('Environment')
                .getSiteSetting('imagesizes');
            var found = _.find(imagesizes, function (imagesize) {
                return imagesize.name === _this.newsletterSettings.imgresize;
            });
            return found && found.internalid ? found.internalid : null;
        };
        NewsletterCCTView.prototype.install = function (settings, contextData) {
            var promise = jQuery.Deferred();
            _super.prototype.install.call(this, settings, contextData);
            this.parseSettings();
            this.updateModel();
            return promise.resolve();
        };
        NewsletterCCTView.prototype.update = function (settings) {
            _super.prototype.update.call(this, settings);
            this.parseSettings();
            this.updateModel();
            return jQuery.Deferred().resolve();
        };
        NewsletterCCTView.prototype.updateModel = function () {
            this.model.validation = {
                email: [
                    {
                        required: true,
                        msg: this.messages.emailEmpty,
                    },
                    {
                        pattern: 'email',
                        msg: this.messages.emailNotValid,
                    },
                ],
            };
            if (this.newsletterSettings.showLastName &&
                !this.newsletterSettings.optionalLastName) {
                this.model.validation.lastName = [
                    {
                        required: true,
                        msg: this.messages.lastNameEmpty,
                    },
                ];
            }
            if (this.newsletterSettings.showFirstName &&
                !this.newsletterSettings.optionalFirstName) {
                this.model.validation.firstName = [
                    {
                        required: true,
                        msg: this.messages.firstNameEmpty,
                    },
                ];
            }
            if (this.newsletterSettings.showCompany &&
                !this.newsletterSettings.optionalCompany) {
                this.model.validation.company = [
                    {
                        required: true,
                        msg: this.messages.companyEmpty,
                    },
                ];
            }
            this.model.set('subsidiary', this.getSubsidiary());
        };
        NewsletterCCTView.prototype.getSubsidiary = function () {
            var _this = this;
            var subsidiaries = this.container
                .getComponent('Environment')
                .getSiteSetting('subsidiaries');
            var subsidiary = _.find(subsidiaries, function (subsidiary) {
                return subsidiary.internalid === _this.newsletterSettings.leadSubsidiary;
            });
            if (!subsidiary) {
                subsidiary = _.find(subsidiaries, function (subsidiary) {
                    return subsidiary.isdefault === 'T';
                });
            }
            return subsidiary.internalid;
        };
        NewsletterCCTView.prototype.validateContextDataRequest = function () {
            return true;
        };
        NewsletterCCTView.prototype.getContext = function () {
            var context = __assign(__assign({}, _(this.newsletterSettings).clone()), { isFeedback: !!this.state.code, model: this.model });
            return context;
        };
        Object.defineProperty(NewsletterCCTView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    GlobalMessageFeedback: function () {
                        return new ExtMessage_View_1.ExtMessageView({ model: new ExtMessage_Model_1.ExtMessageModel({
                                message: _this.state.message,
                                type: _this.state.messageType,
                                closable: true,
                            }) });
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        NewsletterCCTView.prototype.doSubscribe = function (e) {
            var _this = this;
            var promise;
            var errorCode;
            var response;
            var leadRequestLog = Instrumentation_1.default.getLog('leadRequestLog');
            var errorCorrectionTrackingLog = Instrumentation_1.default.getLog('errorCorrectionTrackingLog');
            var leadProcessedLog = Instrumentation_1.default.getLog('leadProcessedLog');
            leadRequestLog.setParameters({
                activity: 'Time it takes for saving the entered values in newsletter form',
                clientContextURL: window.location.href,
            });
            errorCorrectionTrackingLog.setParameter('activity', 'Error correction tracking before submits newsletter form.');
            leadProcessedLog.setParameter('activity', 'Lead processed');
            e.preventDefault();
            promise = this.saveForm(e);
            if (promise) {
                leadRequestLog.startTimer();
                if (errorCorrectionTrackingLog.parametersToSubmit.submitAttemptsWithError) {
                    errorCorrectionTrackingLog.submit();
                    errorCorrectionTrackingLog.setParameter('submitAttemptsWithError', 0);
                }
                promise
                    .fail(function (jqXhr) {
                    response = jqXhr;
                    response.preventDefault = true;
                    var responseCauseName = jqXhr && jqXhr.responseJSON && jqXhr.responseJSON.cause && jqXhr.responseJSON.cause.name
                        ? jqXhr.responseJSON.cause.name
                        : '';
                    errorCode =
                        responseCauseName && _this.feedback[responseCauseName]
                            ? responseCauseName
                            : 'ERROR';
                    _this.state.code = errorCode;
                    _this.state.message = _this.feedback[errorCode].message;
                    _this.state.messageType = _this.feedback[errorCode].type;
                })
                    .done(function () {
                    leadRequestLog.endTimer();
                    var code = _this.model.get('code');
                    _this.state.code = code;
                    _this.state.message = _this.feedback[code].message;
                    _this.state.messageType = _this.feedback[code].type;
                    _this.model.set('email', '');
                    _this.model.set('firstName', '');
                    _this.model.set('lastName', '');
                    _this.model.set('company', '');
                    leadRequestLog.setParameters({
                        totalTime: leadRequestLog.getElapsedTimeForTimer(),
                    });
                    leadRequestLog.submit();
                    leadProcessedLog.setParameter('subType', _this.container
                        .getComponent('Environment')
                        .getConfig('newsletterSignUp.createCompanyLeads')
                        ? 'Company'
                        : 'Individual');
                    leadProcessedLog.submit();
                })
                    .always(_.bind(this.render, this));
            }
            else {
                this.trackErrorInFormBeforeSubmit();
            }
        };
        NewsletterCCTView.prototype.trackErrorInFormBeforeSubmit = function () {
            var errorCorrectionTrackingLog = Instrumentation_1.default.getLog('errorCorrectionTrackingLog');
            var submitAttemptsWithError = errorCorrectionTrackingLog.parametersToSubmit.submitAttemptsWithError;
            if (!submitAttemptsWithError) {
                errorCorrectionTrackingLog.setParameter('submitAttemptsWithError', 0);
                submitAttemptsWithError = 0;
            }
            errorCorrectionTrackingLog.setParameter('submitAttemptsWithError', submitAttemptsWithError + 1);
        };
        NewsletterCCTView.prototype.render = function () {
            var view = _super.prototype.render.call(this);
            if (this.isUsingHorizontalLayout()) {
                this.forceVerticalLayoutInSmallPlaceholders();
            }
            return view;
        };
        NewsletterCCTView.prototype.isUsingHorizontalLayout = function () {
            var horizontalLayout = this.LAYOUT['1'];
            return this.newsletterSettings.layout === horizontalLayout;
        };
        NewsletterCCTView.prototype.forceVerticalLayoutInSmallPlaceholders = function () {
            var _this = this;
            _.defer(_.bind(function () {
                if (_this.isRenderedInSmallPlaceholder()) {
                    _this.forceVerticalLayout();
                }
            }));
        };
        NewsletterCCTView.prototype.isRenderedInSmallPlaceholder = function () {
            var htmlElementWidth = this.$el.width();
            return htmlElementWidth < this.MIN_WIDTH_LAYOUT;
        };
        NewsletterCCTView.prototype.forceVerticalLayout = function () {
            this.newsletterSettings.layout = this.LAYOUT['2'];
            _super.prototype.render.call(this);
        };
        return NewsletterCCTView;
    }(CustomContentTypeBaseView));
    exports.NewsletterCCTView = NewsletterCCTView;
});
