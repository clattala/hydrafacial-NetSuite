/**
 * scaUtils.ts
 * by shelby.severin@trevera.com
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(["N/log", "N/record"], function (log, record) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEmployeeName = exports.validateWebstoreLinkRequest = exports.validateWebstoreRequest = exports.getRequireParameters = exports.checkRequireParameters = void 0;
    var customerCenterRoles = [1093];
    exports.checkRequireParameters = function (requiredParameters, params) {
        var valid = true;
        var paramKeys = Object.keys(params);
        log.debug({ title: 'requiredParameters', details: requiredParameters });
        log.debug({ title: 'paramKeys', details: paramKeys });
        for (var _i = 0, requiredParameters_1 = requiredParameters; _i < requiredParameters_1.length; _i++) {
            var prop = requiredParameters_1[_i];
            if (paramKeys.indexOf(prop) < 0) {
                return false;
            }
        }
        for (var prop in params) {
            //log.debug('prop ' + prop, typeof prop)
            if (!params.hasOwnProperty(prop))
                continue;
            if (!params[prop] || !prop || prop == "null") {
                valid = false;
                break;
            }
            if ((typeof params[prop] === 'number' || params[prop] instanceof Number)) {
                valid = params[prop] > 0;
                //log.debug('prop number', prop);
                break;
            }
            else if (typeof params[prop] === 'string' || params[prop] instanceof String) {
                valid = params[prop].length > 0;
                //log.debug('prop string', prop);
                break;
            }
        }
        log.debug('checkRequireParameters', valid);
        return valid;
    };
    exports.getRequireParameters = function (requiredParameters, params, bodyString) {
        var body;
        try {
            body = bodyString.length > 0 ? JSON.parse(bodyString) : null;
        }
        catch (e) {
            log.error('body in wrong format', e);
            body = {};
        }
        log.debug('params', params);
        log.debug('body', body);
        var propertyMap = {};
        for (var _i = 0, requiredParameters_2 = requiredParameters; _i < requiredParameters_2.length; _i++) {
            var prop = requiredParameters_2[_i];
            if (params.hasOwnProperty(prop) && typeof params[prop] != "undefined" && params[prop] != "undefined") {
                log.debug({ title: 'prop ' + prop, details: typeof params[prop] });
                propertyMap[prop] = params[prop];
            }
            else if (body && body.hasOwnProperty(prop) && typeof body[prop] != "undefined") {
                log.debug({ title: 'body && body[prop] ' + prop, details: !!body && !!body[prop] });
                propertyMap[prop] = body[prop];
            }
        }
        log.debug('propertyMap', propertyMap);
        return propertyMap;
    };
    exports.validateWebstoreRequest = function (user) {
        var isValid = !(user.role != 31 || user.roleId != 'online_form_user' || user.roleCenter != 'CUSTOMER' || user.subsidiary != 1);
        log.debug('validateWebstoreRequest', "Role " + user.role + ", roleId " + user.roleId + ", center " + user.roleCenter + ", subsidiary " + user.subsidiary + ", valid: " + isValid + ".");
        return isValid;
    };
    exports.validateWebstoreLinkRequest = function (user, requestorID) {
        var isAllowedRole = customerCenterRoles.indexOf(user.role) > -1;
        log.debug("user " + isAllowedRole, !(user.roleId != 'customer_center' || user.roleCenter != 'CUSTOMER' || user.id.toString() != requestorID.toString()));
        return isAllowedRole || (user.roleId != 'customer_center' || user.roleCenter != 'CUSTOMER' || user.id.toString() != requestorID.toString());
    };
    exports.getEmployeeName = function (recordID) {
        var name;
        //log.debug('getEmployeeName', recordID);
        if (parseInt(recordID) > 0) {
            try {
                var employeeRec = record.load({
                    id: recordID,
                    type: record.Type.EMPLOYEE
                });
                name = employeeRec.getValue('firstname') + ' ' + employeeRec.getValue('lastname');
            }
            catch (e) {
                //log.debug('not an employee record', 'load as customer');
                var employeeRec = record.load({
                    id: recordID,
                    type: record.Type.CUSTOMER
                });
                //log.debug('customer', employeeRec.getValue('companyname'))
                name = employeeRec.getValue('companyname');
            }
        }
        return name;
    };
    return exports;
});
