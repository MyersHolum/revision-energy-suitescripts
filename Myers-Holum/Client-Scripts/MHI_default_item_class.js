/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 */
 define(['N/url', 'N/currentRecord', 'N/record', 'N/search'], function(url, currentRecord, record, search) {
    function fieldChanged(context){
        var newRec = context.currentRecord;
        if (context.mode == 'delete') {
            return
        }        
        if(context.fieldId == 'custbody_re_default_class_item_line'){
            try{
                var bodyClass = newRec.getValue({fieldId:'custbody_re_default_class_item_line'});
                if (!isNullOrEmpty(bodyClass)) {
                    var lineCount = newRec.getLineCount({sublistId:'item'});
                    for (var i=0; i<lineCount; i++) {
                        newRec.selectLine({sublistId:'item', line:i});
                        var lineClass = newRec.getCurrentSublistValue({sublistId:'item', fieldId:'class'});
                        if (isNullOrEmpty(lineClass)) {
                           
                            newRec.setCurrentSublistValue({sublistId:'item', fieldId:'class', value:bodyClass});
                            newRec.commitLine({sublistId:'item'});
                        }
                    }

                }

            }catch (e) {
                log.error('Unexpected error:', getErrorInfo(e, context));
            }

        }

    }
    function validateLine(context) {
        try{
            var newRec = context.currentRecord;
            var bodyClass = newRec.getValue({fieldId:'custbody_re_default_class_item_line'});
            log.debug('bodyClass', bodyClass);
            var lineClass = newRec.getCurrentSublistValue({sublistId:'item',fieldId:'class'});

            if (isNullOrEmpty(lineClass) && !isNullOrEmpty(bodyClass)) {
                newRec.setCurrentSublistValue({sublistId:'item',fieldId:'class',value:bodyClass});
            }
        }catch (e) {
            log.error('Unexpected error:', getErrorInfo(e, context));
        }

        return true;
    }

    function getErrorInfo(e, context) {
        var retval = 'error: ';
        if (typeof e.message !== 'undefined' && e.message != null) {
            retval += e.message;
        } else {
            retval += JSON.stringify(e);
        }
        if (e.stack !== 'undefined') {
            retval += ' @ ' + e.stack;
        }

        retval += ' context: ' + JSON.stringify(context);
        return retval;
    }
    function isNullOrEmpty(objVariable) {
        return (objVariable == null || objVariable == "" || objVariable == undefined);
    };

    return {
        fieldChanged: fieldChanged,
        validateLine: validateLine
    };

});
