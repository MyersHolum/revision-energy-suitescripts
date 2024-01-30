/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'], (record, search, runtime) => {
  /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     * @Since 2015.2
     */
  const beforeLoad = (context) => {
    const exeContext = runtime.executionContext;
    const logTitle = 'beforeLoad_' + exeContext + '_' + context.type;
    log.debug(logTitle, '*** Start of Execution ***');
  };

  /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
  const beforeSubmit = (context) => {
    const exeContext = runtime.executionContext;
    const logTitle = 'beforeSubmit_' + exeContext + '_' + context.type;
    log.debug(logTitle, '*** Start of Execution ***');
  };

  /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {string} context.type - Trigger type
     * @Since 2015.2
     */
  const afterSubmit = (context) => {
    const exeContext = runtime.executionContext;
    const logTitle = 'afterSubmit_' + exeContext + '_' + context.type;
    log.debug(logTitle, '*** Start of Execution ***');
  };

  return {
    beforeLoad,
    beforeSubmit,
    afterSubmit
  };
});
