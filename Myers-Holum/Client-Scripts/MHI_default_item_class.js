/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 */
define(['N/currentRecord', 'N/record'], function(currentRecord, record) {
  function fieldChanged(context) {
    var newRec = context.currentRecord;
    if (context.mode == 'delete') {
      return;
    }
    if (context.fieldId == 'custbody_re_default_class_item_line') {
      try {
        var bodyClass = newRec.getValue ({
          fieldId: 'custbody_re_default_class_item_line'
        }) || '';
        if (!isEmpty(bodyClass)) {
          var lineCount = newRec.getLineCount ({
            sublistId: 'item'
          }) || 0;
          for (var i = 0; i < lineCount; i += 1) {
            newRec.selectLine({
              sublistId: 'item',
              line: i
            });
            var lineClass = newRec.getCurrentSublistValue ({
              sublistId: 'item',
              fieldId: 'class'
            }) || '';
            if (isEmpty(lineClass)) {
              newRec.setCurrentSublistValue ({
                sublistId: 'item',
                fieldId: 'class',
                value: bodyClass
              });
              newRec.commitLine ({
                sublistId: 'item'
              });
            }
          }

        }

      } catch (e) {
        log.error('Unexpected error:', getErrorInfo(e, context));
      }

    }

  }

  function validateLine(context) {
    try {
      var newRec = context.currentRecord;
      var bodyClass = newRec.getValue ({
        fieldId: 'custbody_re_default_class_item_line'
      }) || '';
      var lineClass = newRec.getCurrentSublistValue ({
        sublistId: 'item',
        fieldId: 'class'
      }) || '';

      if (isEmpty(lineClass) && !isEmpty(bodyClass)) {
        newRec.setCurrentSublistValue ({
          sublistId: 'item',
          fieldId: 'class',
          value: bodyClass
        });
      }
    } catch (e) {
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
  
  function isEmpty(thisVar) {
    return (
      thisVar === '' ||
      thisVar == null ||
      thisVar == undefined ||
      (thisVar.constructor === Array && thisVar.length == 0) ||
      (thisVar.constructor === Object && Object.keys(thisVar).length === 0)
    );
  }

  return {
    fieldChanged: fieldChanged,
    validateLine: validateLine
  };

});