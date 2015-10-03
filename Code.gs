/**
 * @OnlyCurrentDoc  Limits the script to only accessing the current spreadsheet.
 */

var DIALOG_TITLE = 'Example Dialog';
var SIDEBAR_TITLE = 'Example Sidebar';
var NEW_SORTIE_TITLE = 'New Sortie';

var CONTEXT_ROW_COUNT = 1;
var MAX_ROW_CONSTANT = 999;

var COLUMN_CONTEXT = [
  "ATTEMPT_COL",
  "FUEL_COL",
  "AMMO_COL",
  "STEEL_COL",
  "BAUXITE_COL",
  "BUCKET_COL",
  "RESULT_COL",
  "COMMENTS_COL"
]

/**
 * Adds a custom menu with items to show the sidebar and dialog.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem('Add a run', 'addARun')
      .addToUi();
}


/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */
function showSidebar() {
  var ui = HtmlService.createTemplateFromFile('Sidebar')
      .evaluate()
      .setTitle(SIDEBAR_TITLE);
  SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * Opens a dialog. The dialog structure is described in the Dialog.html
 * project file.
 */
function showDialog() {
  var ui = HtmlService.createTemplateFromFile('Dialog')
      .evaluate()
      .setWidth(400)
      .setHeight(190);
  SpreadsheetApp.getUi().showModalDialog(ui, DIALOG_TITLE);
}

/**
* Add a sortie attempt
*
*/
function addARun(){
  var ui = HtmlService.createTemplateFromFile('AddRun')
              .evaluate()
              .setTitle(NEW_SORTIE_TITLE)
  SpreadsheetApp.getUi().showSidebar(ui)
}

/**
 * Returns the value in the active cell.
 *
 * @return {String} The value of the active cell.
 */
function getActiveValue() {
  // Retrieve and return the information requested by the sidebar.
  var cell = SpreadsheetApp.getActiveSheet().getActiveCell();
  return cell.getValue();
}

/**
 * Replaces the active cell value with the given value.
 *
 * @param {Number} value A reference number to replace with.
 */
function setActiveValue(value) {
  // Use data collected from sidebar to manipulate the sheet.
  var cell = SpreadsheetApp.getActiveSheet().getActiveCell();
  cell.setValue(value);
}

/**
 * Executes the specified action (create a new sheet, copy the active sheet, or
 * clear the current sheet).
 *
 * @param {String} action An identifier for the action to take.
 */
function modifySheets(action) {
  // Use data collected from dialog to manipulate the spreadsheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var currentSheet = ss.getActiveSheet();
  if (action == "create") {
    ss.insertSheet();
  } else if (action == "copy") {
    currentSheet.copyTo(ss);
  } else if (action == "clear") {
    currentSheet.clear();
  }
}

function getColumnContext(contextKeyword){
  return COLUMN_CONTEXT.indexOf(contextKeyword) + 1 ; // need to pad 1 position
}

function getValueAt(m, n){
  var values = SpreadsheetApp.getActiveSpreadsheet().getSheetValues(m, n, 1, 8);
  Logger.log(JSON.stringify(values));
}

function getLatestRowCount(){
  var latestRow = SpreadsheetApp.getActiveSheet().getLastRow();
  Logger.log("Last row: " + latestRow);
  return latestRow;
}

function formnameTranslateToColumnContextKeyword(name){
  return name.toUpperCase() + "_COL";
}

function createPrecalculatedNotation(arr){
  if (Array.isArray(arr)){
    if(arr.length==0)
      return "=".concat("0");
    else
      return "=".concat(arr.join("+"));
  }
  else
    return "=".concat(arr);
}

function processForm(formObject){
 
  var rowToAdd =  getLatestRowCount() + 1;
  
  

    
    var completedValueSet = {
      "fuel" : [formObject.fuel],
      "ammo" : [formObject.ammo],
      "steel" : ["0"],
      "bauxite" : formObject.bauxite ? formObject.bauxite : 0,
      "bucket" : ["0"],
      "comments" : formObject.comments,
      "result" : formObject.result
    }
  
  var dockedGirls = JSON.parse(formObject["docked-girls"]);

  
  for (girl in dockedGirls){
    completedValueSet["fuel"].push(dockedGirls[girl].fuel);
    completedValueSet["steel"].push(dockedGirls[girl].steel);
    completedValueSet["bucket"].push(dockedGirls[girl].bucket);    
  }
  

    
  
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var range = activeSheet.getRange(rowToAdd,1,1,8);
  range.getCell(1, getColumnContext("ATTEMPT_COL")).setValue(new Date().toLocaleDateString("en-US"));
  range.getCell(1, getColumnContext("FUEL_COL")).setValue(createPrecalculatedNotation(completedValueSet["fuel"]))
  range.getCell(1, getColumnContext("AMMO_COL")).setValue(createPrecalculatedNotation(completedValueSet["ammo"]));
  range.getCell(1, getColumnContext("STEEL_COL")).setValue(createPrecalculatedNotation(completedValueSet["steel"]));
  range.getCell(1, getColumnContext("BAUXITE_COL")).setValue(createPrecalculatedNotation(completedValueSet["bauxite"]));
  range.getCell(1, getColumnContext("BUCKET_COL")).setValue(createPrecalculatedNotation(completedValueSet["bucket"]));
  range.getCell(1, getColumnContext("RESULT_COL")).setValue(completedValueSet["result"]);
  range.getCell(1, getColumnContext("COMMENTS_COL")).setValue(completedValueSet["comments"]);
  
  return 1;
//  
  
}
