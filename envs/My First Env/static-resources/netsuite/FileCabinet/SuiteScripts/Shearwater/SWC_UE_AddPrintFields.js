/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currency', 'N/currentRecord', 'N/format', 'N/log', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget'],
    /**
     * @param{currency} currency
     * @param{currentRecord} currentRecord
     * @param{format} format
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (currency, currentRecord, format, log, record, runtime, search,serverWidget) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            log.debug({
                title: scriptContext.type,
                details: scriptContext.type
            })
            if(scriptContext.type == "print"){
                var newRec = scriptContext.newRecord;
                var customerId = newRec.getValue({fieldId:"entity"});
                log.debug({
                    title: customerId,
                    details: customerId
                })
                //根据customer  获取 联系人  电话 手机号码 语言
                var cusInfoObj = getCusInfo(customerId);
                //form 添加客户信息，打印使用
                if(cusInfoObj){
                    var form = scriptContext.form;
                    form.addField({id:"custpage_phone",type:"text",label:"customer phone"}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
                    form.addField({id:"custpage_cellphone",type:"text",label:"customer cell"}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
                    form.addField({id:"custpage_contact",type:"text",label:"ciontact"}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
                    newRec.setValue({fieldId:"custpage_phone",value:cusInfoObj.phone});
                    log.debug({title: cusInfoObj.phone, details: cusInfoObj.phone});
                    newRec.setValue({fieldId:"custpage_cellphone",value:cusInfoObj.altphone});
                    log.debug({title: cusInfoObj.altphone, details: cusInfoObj.altphone });
                    newRec.setValue({fieldId:"custpage_contact",value:cusInfoObj.contact});
                    log.debug({title: cusInfoObj.contact,details: cusInfoObj.contact});
                }
                //获取货品日文名称，循环赋值日文
                var lineCount = newRec.getLineCount({sublistId:'item'});
                log.debug({title:'lineCount',details:lineCount});
                var itemArr = [];
                for(let line=0; line<lineCount; line++){
                    itemArr.push(newRec.getSublistValue({sublistId: 'item',fieldId: 'item',line: line}));
                }
                log.debug({title:'itemArr',details:JSON.stringify(itemArr)});
                //赋值货品翻译
                var ItemInfoObj = getItemJPName(itemArr);
                if(ItemInfoObj){
                    var itemSublist = form.getSublist({id:"item"});
                    itemSublist.addField({id:'custpage_translation',type:'text',label:'Translation'});
                    for(let j=0; j<lineCount; j++){
                        var itemId = newRec.getSublistValue({sublistId: 'item',fieldId: 'item',line: j});
                        log.debug({title:'itemId',details:j+'----'+itemId});
                        itemSublist.setSublistValue({id:'custpage_translation',line: j,value:ItemInfoObj[itemId]});
                    }
                }
            }
        }

        const getItemJPName = (itemArr) => {
            if(!itemArr || itemArr.length==0) return;
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalid","anyof",itemArr],
                        "AND",
                        ["language","anyof","ja_JP"]
                    ],
                columns:
                    [
                        search.createColumn({name: "formulatext", formula: "NVL({displaynametranslated}, {name})", label: "Formula (Text)" })
                    ]
            });
            var itemJPNameObj = {};
            itemSearchObj.run().each(function(result){
                var itemId = result.id;
                var itemJPName = result.getValue({name: "formulatext", formula: "NVL({displaynametranslated}, {name})", label: "Formula (Text)" });
                itemJPNameObj[itemId] = itemJPName;
                return true;
            });
            return itemJPNameObj;
        }

        const getCusInfo = (customerId) => {
            if(!customerId) return;
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid","anyof",customerId]
                    ],
                columns:
                    [
                        search.createColumn({name: "phone", label: "Phone"}),
                        search.createColumn({name: "entityid",join: "contactPrimary", label: "Name"}),
                        search.createColumn({name: "altphone", label: "Office Phone"}),
                    ]
            });
            var resObj = {};
            customerSearchObj.run().each(function(result){
                resObj["contact"] = result.getValue({name: "entityid",join: "contactPrimary", label: "Name"});
                resObj["phone"] = result.getValue({name: "phone"});
                resObj["altphone"] = result.getValue({name: "altphone"});
                return true;
            });
            return resObj;
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
