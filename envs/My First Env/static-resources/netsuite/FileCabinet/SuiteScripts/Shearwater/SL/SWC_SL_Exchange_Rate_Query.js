/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/serverWidget','N/record','N/redirect','N/task','N/runtime','N/url','N/file','N/format'],

    function(search,serverWidget,record,redirect,task,runtime,url,file,format) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            //创建form
            var form = createMainform(context);
            //显示
            context.response.writePage(form);
        }
        //创建Form
        function createMainform(context){

            var filterJsonOption = context.request.parameters.filterJsonOption || '';       // body字段值(检索条件)
            var queryFlag = context.request.parameters.queryFlag || false;
            var startDateObj,endDateObj,subsidiary
            if(filterJsonOption){
                filterJsonOption = JSON.parse(filterJsonOption);
                startDateObj=filterJsonOption.startDateObj;

            }
            var form = serverWidget.createForm({title : '(美元-人民币)汇率查询'});
            form.clientScriptModulePath = '../CS/SWC_CS_Exchange_Rate_Query';
            form.addButton({id: "custpage_query", label: "汇率查询", functionName: "query"});

            var periodYear = form.addField({id : 'custpage_startdate',type : serverWidget.FieldType.SELECT,label : '期间'});
            var periodList = [];
            var accountingperiodSearchObj = search.create({
                type: "accountingperiod",
                filters:
                    [
                        ["isyear","is","F"],
                        "AND",
                        ["isquarter","is","F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "periodname",
                            label: "名称"
                        }),
                        search.createColumn({name: "internalid", label: "内部标识"}),
                        search.createColumn({
                            name: "startdate",
                            sort: search.Sort.ASC,
                            label: "开始日期"
                        })
                    ]
            });
            var searchResultCount = getAllSearchObj(accountingperiodSearchObj);
            if(searchResultCount&&searchResultCount.length>0){
                for(var i=0;i<searchResultCount.length;i++){
                    periodYear.addSelectOption({
                        value :searchResultCount[i].getValue({name: "internalid", label: "内部标识"}) ,
                        text : searchResultCount[i].getValue({
                            name: "periodname",
                            sort: search.Sort.ASC,
                            label: "名称"
                        })
                    });
                    periodList.push(searchResultCount[i].getValue({name: "internalid", label: "内部标识"}));
                }
            }


            if(queryFlag){
                form.updateDefaultValues({
                    'custpage_subsidiary':subsidiary,
                    'custpage_startdate':startDateObj,
                    'custpage_enddate':endDateObj
                });
            }

            //log.audit({title:'obj',details:JSON.stringify(obj)});
            //子列表
            form.addFieldGroup({id:'sublist_group',label:'补充资料'});
            var info_sublist = form.addSublist({id:'info_list',type:serverWidget.SublistType.LIST,label:'List',tab:'sublist_group'});
            info_sublist.addField({id:'sublist_base_cur',label:'基本货币',type:serverWidget.FieldType.TEXT});
            info_sublist.addField({id:'sublist_source_cur',label:'来源货币',type:serverWidget.FieldType.TEXT});
            info_sublist.addField({id:'sublist_exchange_rate_month',label:'月平均汇率',type:serverWidget.FieldType.TEXT});
            info_sublist.addField({id:'sublist_exchange_rate_end',label:'期末汇率',type:serverWidget.FieldType.TEXT});
            info_sublist.addField({id:'sublist_effective_date',label:'生效日期',type:serverWidget.FieldType.TEXT});
            if(startDateObj){
                var dataObj = getDataObj(startDateObj);
                for(var i=0;i<2;i++){
                    if(0==i){
                        info_sublist.setSublistValue({id:'sublist_base_cur',line:i,value:"人民币"});
                        info_sublist.setSublistValue({id:'sublist_source_cur',line:i,value:"美元"});
                        dataObj[i].month && info_sublist.setSublistValue({id:'sublist_exchange_rate_month',line:i,value:dataObj[i].month});
                        dataObj[i].end && info_sublist.setSublistValue({id:'sublist_exchange_rate_end',line:i,value:dataObj[i].end});
                        dataObj[i].date && info_sublist.setSublistValue({id:'sublist_effective_date',line:i,value:dataObj[i].date});
                    }else{
                        info_sublist.setSublistValue({id:'sublist_base_cur',line:i,value:"美元"});
                        info_sublist.setSublistValue({id:'sublist_source_cur',line:i,value:"人民币"});
                        dataObj[i].month && info_sublist.setSublistValue({id:'sublist_exchange_rate_month',line:i,value:dataObj[i].month});
                        dataObj[i].end && info_sublist.setSublistValue({id:'sublist_exchange_rate_end',line:i,value:dataObj[i].end});
                        dataObj[i].date && info_sublist.setSublistValue({id:'sublist_effective_date',line:i,value:dataObj[i].date});
                    }
                }
            }

            return form;
        }
        function getDataObj(startDateObj){
            var nowObj={};
            nowObj[0]={};
            nowObj[1]={};

            var startDateO = search.lookupFields({type:'accountingperiod',id:startDateObj,columns:['startdate','enddate']});
            var startDate = startDateO.startdate;
            log.audit({title:'startDate',details:startDate});
            var endDate = startDateO.enddate;
            var dateSysObjectStart = format.parse({
                value: startDate,
                type: format.Type.DATE
            });
            var year = dateSysObjectStart.getFullYear();
            var month = dateSysObjectStart.getMonth()+1;
            //获取当前日期
            var time= new Date(
                new Date().getTime() +
                new Date().getTimezoneOffset() * 60 * 1000 +
                8 * 60 * 60 * 1000
            );
            var nowYear = time.getFullYear();
            var nowYonth = time.getMonth()+1;
            var num=0;
            if(year==nowYear&&month==nowYonth){
                num = time.getDate();
            }else{
                num = getDaysInOneMonth(year,month);
            }
            log.audit({title:'num',details:num});
            getDetailsData(1,5,startDate,endDate,num,nowObj,0);
            getDetailsData(5,1,startDate,endDate,num,nowObj,1);

            log.audit({title:'nowObj',details:JSON.stringify(nowObj)});
            return nowObj;
        }
        /*
        原始货币
        目标货币
        开始日期
        结束日期
        计算日期数量
        数据对象
        key ： 0表示原始到目标 1表示目标到原始
         */
        function getDetailsData(from,end,startDate,endDate,num,nowObj,key){
            var numObj = {};
            var lastDay ='';
            var lastRate = '';
            for(var i=1;i<=num;i++){
                numObj[i]=0;
            }
            var currencyrateSearchObj = search.create({
                type: "currencyrate",
                filters:
                    [
                        ["basecurrency","anyof",from],
                        "AND",
                        ["transactioncurrency","anyof",end],
                        "AND",
                        ["effectivedate","within",startDate,endDate]
                    ],
                columns:
                    [
                        search.createColumn({name: "basecurrency", label: "基本货币"}),
                        search.createColumn({name: "transactioncurrency", label: "交易货币"}),
                        search.createColumn({name: "exchangerate", label: "汇率"}),
                        search.createColumn({
                            name: "effectivedate",
                            sort: search.Sort.ASC,
                            label: "生效日期"
                        })
                    ]
            });
            var searchResultCount =getAllSearchObj(currencyrateSearchObj);
            log.audit({title:'searchResultCount',details:JSON.stringify(searchResultCount)});
            var rateAmount = 0;
            for(var i=0;i<num;i++){
                if(searchResultCount[i]){
                    var effectDate = searchResultCount[i].getValue({name: "effectivedate",sort: search.Sort.ASC,label: "生效日期"});
                    var effectDateObj = format.parse({
                        value: effectDate,
                        type: format.Type.DATE
                    });
                    var effDay = effectDateObj.getDate();
                    log.audit({title:'effDay',details:effDay});
                    if(searchResultCount[i].getValue({name: "exchangerate", label: "汇率"})){
                        numObj[effDay] = searchResultCount[i].getValue({name: "exchangerate", label: "汇率"});
                    }else{
                        numObj[effDay] = numObj[Number(effDay)-1];
                    }
                    rateAmount = Number(rateAmount)+Number(numObj[effDay]);
                    if((i+1)==num){
                        lastDay = searchResultCount[i].getValue({name: "effectivedate",sort: search.Sort.ASC,label: "生效日期"});
                        lastRate = searchResultCount[i].getValue({name: "exchangerate", label: "汇率"});
                    }
                }

            }
            nowObj[key].month = (Number(rateAmount)/num).toFixed(6);
            nowObj[key].end = Number(lastRate).toFixed(6);
            nowObj[key].date = lastDay;
        }

        function getDaysInOneMonth(year, month){
            month = parseInt(month,10);
            var d= new Date(year,month,0);  //这个是都可以兼容的
            var date = new Date(year+"/"+month+"/0")   //IE浏览器可以获取天数，谷歌浏览器会返回NaN
            return d.getDate();
        }
        //处理超过4000条数据的时候
        function getAllSearchObj(searchObj){
            var RESULTCOUNT = 4000;
            var SIZE = 1000;
            var searchResultCount = searchObj.runPaged().count;
            var resList = [];
            if(searchResultCount>RESULTCOUNT){
                var resultSet = searchObj.run();
                var max = Math.ceil(searchResultCount / SIZE);
                for(var i=0;i<max;i++){
                    var results = resultSet.getRange({
                        start: SIZE*i,
                        end: Number(SIZE*i)+Number(SIZE)
                    });
                    for(var j=0;j<results.length;j++){
                        resList.push(results[j]);
                    }
                }
            }else{
                searchObj.run().each(function(result){
                    resList.push(result);
                    return true;
                });
            }
            return resList;
        }
        /**
         ** 除法函数，用来得到精确的除法结果
         ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
         ** 调用：accDiv(arg1,arg2)
         ** 返回值：arg1除以arg2的精确结果
         **/
        function accDiv(arg1, arg2) {
            var t1 = 0, t2 = 0, r1, r2;
            try {
                t1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
            }
            try {
                t2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
            }
            with (Math) {
                r1 = Number(arg1.toString().replace(".", ""));
                r2 = Number(arg2.toString().replace(".", ""));
                return (r1 / r2) * pow(10, t2 - t1);
            }
        }

        //给Number类型增加一个div方法，调用起来更加方便。
        Number.prototype.div = function (arg) {
            return accDiv(this, arg);
        };
        /**
         ** 乘法函数，用来得到精确的乘法结果
         ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
         ** 调用：accMul(arg1,arg2)
         ** 返回值：arg1乘以 arg2的精确结果
         **/
        function accMul(arg1, arg2) {

            var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
            try {
                m += s1.split(".")[1].length;
            }
            catch (e) {
            }
            try {
                m += s2.split(".")[1].length;
            }
            catch (e) {
            }
            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        }

        // 给Number类型增加一个mul方法，调用起来更加方便。
        Number.prototype.mul = function (arg) {
            return accMul(arg, this);
        };
        /**
         ** 减法函数，用来得到精确的减法结果
         ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
         ** 调用：accSub(arg1,arg2)
         ** 返回值：arg1加上arg2的精确结果
         **/
        function accSub(arg1, arg2) {
            var r1, r2, m, n;
            try {
                r1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
            n = (r1 >= r2) ? r1 : r2;
            return ((arg1 * m - arg2 * m) / m).toFixed(n);
        }

        // 给Number类型增加一个mul方法，调用起来更加方便。
        Number.prototype.sub = function (arg) {
            return accMul(arg, this);
        };
        /**
         ** 加法函数，用来得到精确的加法结果
         ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
         ** 调用：accAdd(arg1,arg2)
         ** 返回值：arg1加上arg2的精确结果
         **/
        function accAdd(arg1, arg2) {
            var r1, r2, m, c;
            try {
                r1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
                r2 = 0;
            }
            c = Math.abs(r1 - r2);
            m = Math.pow(10, Math.max(r1, r2));
            if (c > 0) {
                var cm = Math.pow(10, c);
                if (r1 > r2) {
                    arg1 = Number(arg1.toString().replace(".", ""));
                    arg2 = Number(arg2.toString().replace(".", "")) * cm;
                } else {
                    arg1 = Number(arg1.toString().replace(".", "")) * cm;
                    arg2 = Number(arg2.toString().replace(".", ""));
                }
            } else {
                arg1 = Number(arg1.toString().replace(".", ""));
                arg2 = Number(arg2.toString().replace(".", ""));
            }
            return (arg1 + arg2) / m;
        }

        //给Number类型增加一个add方法，调用起来更加方便。
        Number.prototype.add = function (arg) {
            return accAdd(arg, this);
        };
        function abs(x) {undefined
            if(x>=0) {undefined
                return x;
            } else{undefined
                return -x;
            }
        }
        return {
            onRequest: onRequest
        };

    });
