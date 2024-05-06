/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @author Ards Bautista
 * @overview The script retrieves the vendor bills with empty Invoice Link values.
 * The script retrieves the earliest file attached and gets the file URL to populate
 * the Invoice Link field on the vendor bills.
 */
define(['N/record', 'N/search', 'N/runtime', 'N/file', 'N/url'], (record, search, runtime, file, url) => {
  const TRAN = {
    INVOICE_LINK: 'custbody_re_invoice_link'
  };
  const SEARCH = {
    BILL_ATTACH: 'customsearch_mhi_re_bill_with_attachment' // **DO NOT DELETE** MHI | RE | Bills with Attachments
  };

  /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
  const getInputData = () => {
    const logTitle = 'getInputData';

    try {
      log.debug(logTitle, '*** Start of Execution ***');
      const searchId = runtime.getCurrentScript().getParameter('custscript_mhi_re_billattachment_search');

      if (searchId) {
        const searchObj = search.load({ id: searchId });

        return searchObj;
      }
    } catch (errorLog) {
      log.error(logTitle, errorLog);
    }
  };

  /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
  const map = (context) => {
    const vbId = context.key;
    const logTitle = 'map_' + vbId;
    log.debug(logTitle, context.value);

    const mapValue = JSON.parse(context.value).values;
    const fileId = mapValue['internalid.file'].value;
    const fileName = mapValue['name.file'];
    let fileUrl = mapValue['url.file'];
    const vbNum = mapValue.tranid;

    if (fileUrl) {
      const host = url.resolveDomain({
        hostType: url.HostType.APPLICATION
      });
      fileUrl = 'http://' + host + fileUrl;
    }

    context.write({
      key: vbId,
      value: {
        id: fileId,
        name: fileName,
        url: fileUrl,
        num: vbNum
      }
    });
  };

  /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
  const reduce = (context) => {
    const vbId = context.key;
    const logTitle = 'reduce_' + vbId;

    let vbNum = '';
    const fileObj = {};
    for (let i = 0; i < context.values.length; i += 1) {
      const data = JSON.parse(context.values[i]);
      const { id, name } = data;

      if (!vbNum) vbNum = data.num;
      if (!fileObj[id]) fileObj[id] = { url: data.url, name };
    }

    log.debug(logTitle, 'fileObj=' + JSON.stringify(fileObj));

    const arrIds = Object.keys(fileObj);
    arrIds.sort();

    if (arrIds.length > 0) {
      const fileName = fileObj[arrIds[0]].name;
      const fileUrl = fileObj[arrIds[0]].url;
      const fileId = arrIds[0];

      if (fileUrl) {
        const submitObj = {};
        submitObj[TRAN.INVOICE_LINK] = fileUrl;

        record.submitFields({
          type: record.Type.VENDOR_BILL,
          id: vbId,
          values: submitObj
        });
        log.audit(logTitle, 'Bill#' + vbNum + ' has been updated. URL of file ' + fileName + ' has been set.');

        context.write({
          key: vbId,
          value: 'Bill#' + vbNum + ' File ID=' + fileId
        });
      }

      if (fileId) {
        const documentObj = file.load({
          id: fileId
        });
        documentObj.isOnline = true;
        documentObj.save();
        log.audit(logTitle, 'File ' + fileName + ' has been marked available without login.');
      }
    }
  };


  /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
  const summarize = (summary) => {
    const logTitle = 'summarize_';
    try {
      const errorMap = [];
      summary.mapSummary.errors.iterator().each((key, value) => {
        log.error(logTitle + 'errorMap_' + key, value);
        errorMap.push({
          stage: 'map',
          key,
          error: JSON.parse(value)
        });
        return true;
      });

      const errorReduce = [];
      summary.reduceSummary.errors.iterator().each((key, value) => {
        log.error(logTitle + 'errorReduce_' + key, value);
        errorReduce.push({
          stage: 'reduce',
          key,
          error: JSON.parse(value)
        });
        return true;
      });

      const errorList = errorMap.concat(errorReduce);

      let success = 0;
      summary.output.iterator().each((key, value) => {
        log.debug(logTitle + success, key + ' - ' + value);
        success += 1;

        return true;
      });

      log.audit(logTitle, success + ' bills/s have been processed.');
      log.audit(logTitle, errorList.length + ' error/s found.');
    } catch (errorLog) {
      log.error(logTitle, errorLog);
    }
  };

  return {
    getInputData,
    map,
    reduce,
    summarize
  };
});
