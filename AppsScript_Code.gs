// COMPLETE GOOGLE APPS SCRIPT - PRODUCTION MANAGEMENT SYSTEM
// Spreadsheet ID: 1IMhmYlJ3s2PPRgEQs1Ikd4O1OBXK4EYL1oV_-kWAkyg

function doGet(e) {
  try {
    if (!e.parameter) {
      return createJsonResponse({
        ok: false,
        error: 'No data received'
      });
    }
    
    const data = e.parameter;
    const action = data.action || '';
    
    // Open the spreadsheet
    const sheetId = '1IMhmYlJ3s2PPRgEQs1Ikd4O1OBXK4EYL1oV_-kWAkyg';
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    
    // Auto-initialize multi-sheet database structure
    initKajButtonDatabaseSheets(spreadsheet);

    // Route actions to appropriate functions
    switch(action) {
      case 'submitPackingOrder':
        return savePackingOrder(spreadsheet, data);
      case 'submitMaterialOrder':
        return saveMaterialOrder(spreadsheet, data);
      case 'updatePackingStatus':
        return updatePackingStatus(spreadsheet, data);
      case 'updateOverlockStatus':
        return updateOverlockStatus(spreadsheet, data);
      case 'updateFoldingStatus':
        return updateFoldingStatus(spreadsheet, data);
      case 'getPackingLots':
        return getPackingLots(spreadsheet, data);
      case 'getOverlockLots':
        return getOverlockLots(spreadsheet, data);
      case 'getFoldingLots':
        return getFoldingLots(spreadsheet, data);
      case 'submitOverlockOrder':
        return saveOverlockOrder(spreadsheet, data);
      case 'submitFoldingOrder':
        return saveFoldingOrder(spreadsheet, data);
      case 'getAllDepartmentsData':
        return getAllDepartmentsData(spreadsheet, data);

      // === KAJBUTTON ENDPOINTS ===
      case 'submitKajButtonOrder':
        return saveKajButtonOrder(spreadsheet, data);
      case 'updateKajButtonStatus':
        return updateKajButtonStatus(spreadsheet, data);
      case 'getKajButtonLots':
        return getKajButtonLots(spreadsheet, data);

      // === FEED UP ENDPOINTS ===
      case 'submitFeedUpOrder':
        return saveFeedUpOrder(spreadsheet, data);
      case 'updateFeedUpStatus':
        return updateFeedUpStatus(spreadsheet, data);
      case 'getFeedUpLots':
        return getFeedUpLots(spreadsheet, data);

      // === ELASTIC ENDPOINTS ===
      case 'submitElasticOrder':
        return saveElasticOrder(spreadsheet, data);
      case 'updateElasticStatus':
        return updateElasticStatus(spreadsheet, data);
      case 'getElasticLots':
        return getElasticLots(spreadsheet, data);

      // === WASHING ENDPOINTS ===
      case 'submitWashingOrder':
        return saveWashingOrder(spreadsheet, data);
      case 'updateWashingStatus':
        return updateWashingStatus(spreadsheet, data);
      case 'getWashingLots':
        return getWashingLots(spreadsheet, data);

      // === BONE (WELT) ENDPOINTS ===
      case 'submitBoneOrder':
        return saveBoneOrder(spreadsheet, data);
      case 'updateBoneStatus':
        return updateBoneStatus(spreadsheet, data);
      case 'getBoneLots':
        return getBoneLots(spreadsheet, data);

      // === JAYBIR EMBROIDERY ENDPOINTS ===
      case 'submitJaybirEmbroideryOrder':
      case 'submitJaybirEmbOrder':
        return saveJaybirEmbroideryOrder(spreadsheet, data);
      case 'updateJaybirEmbroideryStatus':
      case 'updateJaybirEmbStatus':
      case 'updateEmbroideryStatus':
        return updateJaybirEmbroideryStatus(spreadsheet, data);
      case 'getJaybirEmbroideryLots':
      case 'getJaybirEmbLots':
      case 'getEmbroideryLots':
        return getJaybirEmbroideryLots(spreadsheet, data);

      // === JAYBIR PRINTING ENDPOINTS ===
      case 'submitJaybirPrintingOrder':
      case 'submitJaybirPrintOrder':
        return saveJaybirPrintingOrder(spreadsheet, data);
      case 'updateJaybirPrintingStatus':
      case 'updateJaybirPrintStatus':
      case 'updatePrintingStatus':
        return updateJaybirPrintingStatus(spreadsheet, data);
      case 'getJaybirPrintingLots':
      case 'getJaybirPrintLots':
      case 'getPrintingLots':
        return getJaybirPrintingLots(spreadsheet, data);

      // === UNIVERSAL UPDATE ROUTE ===
      case 'updateStatus':
      case 'updateLotStatus':
        const dept = (data.department || data.dept || data.sheetName || '').toLowerCase();
        if (dept.includes('print')) return updateJaybirPrintingStatus(spreadsheet, data);
        if (dept.includes('embroid')) return updateJaybirEmbroideryStatus(spreadsheet, data);
        if (dept.includes('feed')) return updateFeedUpStatus(spreadsheet, data);
        if (dept.includes('elastic')) return updateElasticStatus(spreadsheet, data);
        if (dept.includes('wash')) return updateWashingStatus(spreadsheet, data);
        if (dept.includes('bone')) return updateBoneStatus(spreadsheet, data);
        if (dept.includes('overlock')) return updateOverlockStatus(spreadsheet, data);
        if (dept.includes('fold')) return updateFoldingStatus(spreadsheet, data);
        return updateKajButtonStatus(spreadsheet, data);

      default:
        return saveDefaultIssue(spreadsheet, data);
    }
    
  } catch (error) {
    console.error('doGet Error:', error);
    return createJsonResponse({
      ok: false,
      error: error.toString()
    });
  }
}

// ============ UTILITY FUNCTIONS & MULTI-SHEET DATABASE INIT ============
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return date;
  }
}

function formatDateTime(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return new Date().toLocaleString('en-IN');
  }
}

function getCanonicalProcess(name) {
  if (!name) return '';
  const clean = name.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if ((clean.includes('kaj') && clean.includes('mohri')) || clean === 'kajmohri' || clean === 'mohrikaj') {
    return 'kajmohri';
  }
  if (clean.includes('balt') || clean.includes('bart') || clean === 'baltag' || clean === 'baltach') {
    return 'baltach';
  }
  if (clean === 'kajbelt' || clean === 'beltkaj' || clean === 'belt') {
    return 'kajbelt';
  }
  if (clean === 'kajbutton' || clean === 'buttonkaj' || clean === 'kaj') {
    return 'kajbutton';
  }
  if (clean.includes('titch')) {
    return 'titchbutton';
  }
  if (clean.includes('eyelet')) {
    return 'eyelet';
  }
  if (clean.includes('pasting')) {
    return 'pasting';
  }
  if (clean.includes('sticker')) {
    return 'sticker';
  }
  if (clean.includes('down') && clean.includes('part')) {
    return 'downpart';
  }
  return clean;
}

function areProcessesEquivalent(p1, p2) {
  if (!p1 || !p2) return false;
  const c1 = getCanonicalProcess(p1);
  const c2 = getCanonicalProcess(p2);
  if (c1 && c2 && c1 === c2) return true;
  const words1 = p1.toString().toLowerCase().split(/[\s\-_]+/).filter(Boolean).sort().join(' ');
  const words2 = p2.toString().toLowerCase().split(/[\s\-_]+/).filter(Boolean).sort().join(' ');
  return words1 === words2;
}

function initKajButtonDatabaseSheets(spreadsheet) {
  let kajSheet = spreadsheet.getSheetByName('KajButton');
  if (!kajSheet) {
    kajSheet = spreadsheet.insertSheet('KajButton');
    kajSheet.appendRow([
      'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
      'Style', 'kajButton Supervisor', 'KajButton Date', 'Total Pcs',
      'WIP KajButton', 'KajButton Complete', 'Total Manpower',
      'Stiching Supervisor', 'BRAND', 'Process', 'REOPEN', 'REOPEN DATE', 'REOPEN FOR WHICH PROCESS', 'CUTTING JSON', 'STAGE JSON'
    ]);
  }

  let receiptSheet = spreadsheet.getSheetByName('KajButton_ShadeReceipts');
  if (!receiptSheet) {
    receiptSheet = spreadsheet.insertSheet('KajButton_ShadeReceipts');
    receiptSheet.appendRow([
      'Timestamp', 'Lot Number', 'Shade Color', 'Receipt Status', 'Received Pcs', 'Supervisor', 'Remarks'
    ]);
  }

  let stageLogSheet = spreadsheet.getSheetByName('KajButton_StageLogs');
  if (!stageLogSheet) {
    stageLogSheet = spreadsheet.insertSheet('KajButton_StageLogs');
    stageLogSheet.appendRow([
      'Timestamp', 'Lot Number', 'Shade Color', 'Stage Name', 'Stage Status', 'Supervisor', 'Remarks'
    ]);
  }
}

function ensureReopenColumns(sheet, headers) {
  if (!headers || !headers.length) {
    headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(h => (h || '').toString().trim());
  }
  let reopenCol = headers.findIndex(h => h.toLowerCase() === 'reopen') + 1;
  let reopenDateCol = headers.findIndex(h => h.toLowerCase() === 'reopen date') + 1;
  let reopenProcessCol = headers.findIndex(h => h.toLowerCase() === 'reopen for which process') + 1;

  if (reopenCol === 0 || reopenDateCol === 0 || reopenProcessCol === 0) {
    const processIndex = headers.findIndex(h => h.toLowerCase() === 'process');
    if (processIndex !== -1 && reopenCol === 0 && reopenDateCol === 0 && reopenProcessCol === 0) {
      sheet.insertColumnsAfter(processIndex + 1, 3);
      sheet.getRange(1, processIndex + 2).setValue('REOPEN');
      sheet.getRange(1, processIndex + 3).setValue('REOPEN DATE');
      sheet.getRange(1, processIndex + 4).setValue('REOPEN FOR WHICH PROCESS');
    } else {
      if (reopenCol === 0) {
        const nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue('REOPEN');
      }
      if (reopenDateCol === 0) {
        const nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue('REOPEN DATE');
      }
      if (reopenProcessCol === 0) {
        const nextCol = sheet.getLastColumn() + 1;
        sheet.getRange(1, nextCol).setValue('REOPEN FOR WHICH PROCESS');
      }
    }
    SpreadsheetApp.flush();
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => (h || '').toString().trim());
    return {
      headers: updatedHeaders,
      reopenCol: updatedHeaders.findIndex(h => h.toLowerCase() === 'reopen') + 1,
      reopenDateCol: updatedHeaders.findIndex(h => h.toLowerCase() === 'reopen date') + 1,
      reopenProcessCol: updatedHeaders.findIndex(h => h.toLowerCase() === 'reopen for which process') + 1
    };
  }
  return { headers, reopenCol, reopenDateCol, reopenProcessCol };
}

// ============ FEED UP FUNCTIONS ============
function saveFeedUpOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('FeedUp');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('FeedUp');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Brand', 'Feed Up Supervisor', 'Feed Up Date', 'Total Pcs',
        'WIP Feed Up', 'Feed Up Complete', 'Total Manpower'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 'Brand', 
        'Feed Up Supervisor', 'Feed Up Date', 'Total Pcs', 
        'WIP Feed Up', 'Feed Up Complete', 'Total Manpower'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Brand': data.brand || '',
      'Feed Up Supervisor': data.feedUpSupervisor || data.supervisor || '',
      'Feed Up Date': data.feedUpDate || data.issueDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Feed Up');
    const completeIndex = currentHeaders.indexOf('Feed Up Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Feed Up order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save Feed Up order: ${error.toString()}`
    });
  }
}

function updateFeedUpStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('FeedUp');
    if (!sheet) {
      return createJsonResponse({ ok: false, error: 'FeedUp sheet not found' });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Feed Up') + 1;
    const completeHistoryCol = headers.indexOf('Feed Up Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Feed Up');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Feed Up Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Feed Up') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Feed Up Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({ ok: false, error: `Lot ${lotNumber} not found in FeedUp sheet` });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Feed Up Completed') {
        const feedUpDateCol = updatedHeaders.indexOf('Feed Up Date') + 1;
        if (feedUpDateCol > 0) {
          sheet.getRange(lotRowIndex, feedUpDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const feedUpDateCol = updatedHeaders.indexOf('Feed Up Date') + 1;
      if (feedUpDateCol > 0) {
        sheet.getRange(lotRowIndex, feedUpDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();
    return createJsonResponse({
      ok: true,
      message: `Feed Up ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
  } catch (error) {
    return createJsonResponse({ ok: false, error: `Failed to update Feed Up status: ${error.toString()}` });
  }
}

function getFeedUpLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('FeedUp');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({ ok: true, lots: [], total: 0, message: 'No Feed Up data found' });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      if (lot['WIP Feed Up']) {
        try {
          const parsed = JSON.parse(lot['WIP Feed Up']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      if (lot['Feed Up Complete']) {
        try {
          const parsed = JSON.parse(lot['Feed Up Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Feed Up';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Feed Up Completed' || latestComplete.status.includes('Complete')) {
          currentStatus = 'Feed Up Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => (lot['Feed Up Supervisor'] || '').toLowerCase().trim().includes(supervisorName))
      : lots;
    
    return createJsonResponse({ ok: true, lots: filteredLots, total: filteredLots.length });
  } catch (error) {
    return createJsonResponse({ ok: false, error: `Failed to get Feed Up lots: ${error.toString()}`, lots: [] });
  }
}

// ============ KAJBUTTON FUNCTIONS ============
function saveKajButtonOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('KajButton');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('KajButton');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'kajButton Supervisor', 'KajButton Date', 'Total Pcs',
        'WIP KajButton', 'KajButton Complete', 'Total Manpower',
        'Stiching Supervisor', 'BRAND', 'Process', 'REOPEN', 'REOPEN DATE', 'REOPEN FOR WHICH PROCESS', 'CUTTING JSON', 'STAGE JSON'
      ]);
    } else {
      let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 
        'kajButton Supervisor', 'KajButton Date', 'Total Pcs', 
        'WIP KajButton', 'KajButton Complete', 'Total Manpower',
        'Stiching Supervisor', 'BRAND', 'Process', 'REOPEN', 'REOPEN DATE', 'REOPEN FOR WHICH PROCESS', 'CUTTING JSON', 'STAGE JSON'
      ];
      requiredHeaders.forEach((header) => {
        const found = headers.some(h => (h || '').toString().trim().toLowerCase() === header.toLowerCase());
        if (!found) {
          const nextCol = sheet.getLastColumn() + 1;
          sheet.getRange(1, nextCol).setValue(header);
          headers.push(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');

    let cuttingJsonVal = '';
    if (data.cuttingJson) {
      cuttingJsonVal = typeof data.cuttingJson === 'string' ? data.cuttingJson : JSON.stringify(data.cuttingJson);
    } else if (data.cuttingMatrix) {
      cuttingJsonVal = typeof data.cuttingMatrix === 'string' ? data.cuttingMatrix : JSON.stringify(data.cuttingMatrix);
    } else if (data.matrix) {
      cuttingJsonVal = typeof data.matrix === 'string' ? data.matrix : JSON.stringify(data.matrix);
    }

    let stageJsonVal = '';
    if (data.stageJson) {
      stageJsonVal = typeof data.stageJson === 'string' ? data.stageJson : JSON.stringify(data.stageJson);
    }

    let processVal = '';
    if (data.process) {
      processVal = Array.isArray(data.process) ? data.process.join(', ') : data.process;
    } else if (data.processes) {
      processVal = Array.isArray(data.processes) ? data.processes.join(', ') : data.processes;
    } else if (data.selectedProcesses) {
      processVal = Array.isArray(data.selectedProcesses) ? data.selectedProcesses.join(', ') : data.selectedProcesses;
    }
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'kajButton Supervisor': data.kajButtonSupervisor || data.supervisor || '',
      'KajButton Date': data.kajButtonDate || data.issueDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0',
      'Stiching Supervisor': data.stitchingSupervisor || data.stichingSupervisor || '',
      'BRAND': data.brand || '',
      'Process': processVal,
      'Processes': processVal,
      'CUTTING JSON': cuttingJsonVal,
      'STAGE JSON': stageJsonVal
    };
    
    currentHeaders.forEach((header, index) => {
      const hTrim = (header || '').toString().trim();
      const hLower = hTrim.toLowerCase();

      if (columnMapping[hTrim] !== undefined) {
        rowData[index] = columnMapping[hTrim];
      } else if (hLower === 'stiching supervisor' || hLower === 'stitching supervisor') {
        rowData[index] = columnMapping['Stiching Supervisor'];
      } else if (hLower === 'brand') {
        rowData[index] = columnMapping['BRAND'];
      } else if (hLower === 'process' || hLower === 'processes' || hLower === 'selected processes') {
        rowData[index] = processVal;
      } else if (hLower === 'cutting json' || hLower === 'cuttingjson' || hLower === 'cutting matrix') {
        rowData[index] = columnMapping['CUTTING JSON'];
      } else if (hLower === 'stage json' || hLower === 'stagejson' || hLower === 'stage matrix') {
        rowData[index] = columnMapping['STAGE JSON'];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.findIndex(h => (h || '').toString().trim().toLowerCase() === 'wip kajbutton');
    const completeIndex = currentHeaders.findIndex(h => (h || '').toString().trim().toLowerCase() === 'kajbutton complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `KajButton order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save KajButton order: ${error.toString()}`
    });
  }
}

function updateKajButtonStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('KajButton');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'KajButton sheet not found'
      });
    }
    
    let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    headers = headers.map(h => (h || '').toString().trim());

    let stageJsonIndex = headers.findIndex(h => h.toLowerCase() === 'stage json');
    if (stageJsonIndex === -1) {
      const newColIndex = headers.length + 1;
      sheet.getRange(1, newColIndex).setValue('STAGE JSON');
      SpreadsheetApp.flush();
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => (h || '').toString().trim());
      stageJsonIndex = headers.findIndex(h => h.toLowerCase() === 'stage json');
    }

    const lotNumberCol = headers.findIndex(h => h.toLowerCase() === 'lot number') + 1;
    const wipHistoryCol = headers.findIndex(h => h.toLowerCase() === 'wip kajbutton') + 1;
    const completeHistoryCol = headers.findIndex(h => h.toLowerCase() === 'kajbutton complete') + 1;
    const stageJsonCol = stageJsonIndex + 1;

    if (lotNumberCol === 0) {
      return createJsonResponse({
        ok: false,
        error: 'Lot Number column not found in sheet header'
      });
    }

    const lotNumber = (data.lotNumber || data.lotNo || '').toString().trim();
    if (!lotNumber) {
      return createJsonResponse({
        ok: false,
        error: 'No lotNumber provided'
      });
    }

    const totalRows = sheet.getLastRow();
    if (totalRows < 2) {
      return createJsonResponse({
        ok: false,
        error: 'No lot rows exist in KajButton sheet'
      });
    }

    const lotNumbers = sheet.getRange(2, lotNumberCol, totalRows - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => (num || '').toString().trim() === lotNumber) + 2;

    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in KajButton sheet`
      });
    }

    if (data.stageJson && stageJsonCol > 0) {
      const stageVal = typeof data.stageJson === 'string' ? data.stageJson : JSON.stringify(data.stageJson);
      sheet.getRange(lotRowIndex, stageJsonCol).setValue(stageVal);
    }

    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status || 'Updated';
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();

    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };

    if (statusType === 'wip' && wipHistoryCol > 0) {
      const existingWip = sheet.getRange(lotRowIndex, wipHistoryCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.toString().trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, wipHistoryCol).setValue(JSON.stringify(wipHistory));

    } else if (statusType === 'complete' && completeHistoryCol > 0) {
      const existingComplete = sheet.getRange(lotRowIndex, completeHistoryCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.toString().trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, completeHistoryCol).setValue(JSON.stringify(completeHistory));

      const kajButtonDateCol = headers.findIndex(h => h.toLowerCase() === 'kajbutton date') + 1;
      if (kajButtonDateCol > 0) {
        sheet.getRange(lotRowIndex, kajButtonDateCol).setValue(new Date().toISOString().split('T')[0]);
      }

      const reopenCols = ensureReopenColumns(sheet, headers);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      const reopenProcess = (data.process || data.status || 'Pending').trim();

      const processCol = headers.findIndex(h => h.toLowerCase() === 'process') + 1;
      if (processCol > 0) {
        const sheetProcessRaw = (sheet.getRange(lotRowIndex, processCol).getValue() || '').toString();
        const sheetProcessList = sheetProcessRaw.split(',').map(p => p.trim()).filter(Boolean);
        const isMatched = sheetProcessList.some(p => areProcessesEquivalent(p, reopenProcess));
        if (isMatched) {
          return createJsonResponse({
            ok: false,
            error: `Cannot reopen Lot #${lotNumber} for "${reopenProcess}" because it is equivalent to an original completed process (${sheetProcessRaw}) for this lot.`
          });
        }
      }

      if (completeHistoryCol > 0) {
        sheet.getRange(lotRowIndex, completeHistoryCol).setValue('[]');
      }
      const kajButtonDateCol = headers.findIndex(h => h.toLowerCase() === 'kajbutton date') + 1;
      if (kajButtonDateCol > 0) {
        sheet.getRange(lotRowIndex, kajButtonDateCol).setValue('');
      }

      const reopenCols = ensureReopenColumns(sheet, headers);
      headers = reopenCols.headers;
      if (reopenCols.reopenCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      }
      if (reopenCols.reopenDateCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      }
      if (reopenCols.reopenProcessCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);
      }

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };

      if (wipHistoryCol > 0) {
        const existingWip = sheet.getRange(lotRowIndex, wipHistoryCol).getValue();
        let wipHistory = [];
        if (existingWip && existingWip.toString().trim() !== '') {
          try {
            wipHistory = JSON.parse(existingWip);
            if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
          } catch (e) {
            wipHistory = [{ status: existingWip, timestamp: new Date().toISOString() }];
          }
        }
        wipHistory.unshift(reopenEntry);
        sheet.getRange(lotRowIndex, wipHistoryCol).setValue(JSON.stringify(wipHistory));
      }
    }

    if (statusType === 'reopen') {
      const stageLogSheet = spreadsheet.getSheetByName('KajButton_StageLogs');
      if (stageLogSheet) {
        stageLogSheet.appendRow([
          new Date(),
          lotNumber,
          data.color || 'All Colors',
          `Reopened for ${data.process || data.status || 'Pending'}`,
          'Reopened',
          supervisor,
          remarks
        ]);
      }
    } else if (status.includes('[SHADE RECEIPT SUMMARY]')) {
      const receiptSheet = spreadsheet.getSheetByName('KajButton_ShadeReceipts');
      if (receiptSheet) {
        const parts = status.split('Summary:')[1] || status;
        receiptSheet.appendRow([
          new Date(),
          lotNumber,
          data.color || 'Selected Shades',
          'Shades Received',
          parts,
          supervisor,
          remarks
        ]);
      }
    } else {
      const stageLogSheet = spreadsheet.getSheetByName('KajButton_StageLogs');
      if (stageLogSheet) {
        stageLogSheet.appendRow([
          new Date(),
          lotNumber,
          data.color || 'All Colors',
          status.replace(' Done', ''),
          status.includes('Done') ? 'Done' : 'In Progress',
          supervisor,
          remarks
        ]);
      }
    }

    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: statusType === 'reopen'
        ? `Lot #${lotNumber} reopened successfully for ${data.process || 'Pending'}!`
        : `KajButton ${statusType} status updated across Master & Multi-Sheet Logs`,
      lotNumber: lotNumber,
      status: status
    });

  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update KajButton status: ${error.toString()}`
    });
  }
}

function getKajButtonLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('KajButton');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No KajButton data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      let cuttingJson = null;
      let stageJson = null;
      
      if (lot['WIP KajButton']) {
        try {
          const parsed = JSON.parse(lot['WIP KajButton']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['KajButton Complete']) {
        try {
          const parsed = JSON.parse(lot['KajButton Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }

      const cuttingRaw = lot['CUTTING JSON'] || lot['Cutting JSON'] || lot['cuttingJson'] || lot['CUTTING MATRIX'] || '';
      if (cuttingRaw) {
        try {
          cuttingJson = typeof cuttingRaw === 'string' ? JSON.parse(cuttingRaw) : cuttingRaw;
        } catch (e) { cuttingJson = cuttingRaw; }
      }

      const stageRaw = lot['STAGE JSON'] || lot['Stage JSON'] || lot['stageJson'] || '';
      if (stageRaw) {
        try {
          stageJson = typeof stageRaw === 'string' ? JSON.parse(stageRaw) : stageRaw;
        } catch (e) { stageJson = stageRaw; }
      }

      const processVal = lot['Process'] || lot['Processes'] || lot['processes'] || lot['process'] || '';
      
      let currentStatus = 'Ready for KajButton';
      let isCompleted = false;
      let isInProgress = false;
      
      const isReopenFlag = (lot['REOPEN'] || lot['Reopen'] || '').toString().trim().toLowerCase() === 'yes';
      const isReopenWip = isReopenFlag || (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen'))));

      if (isReopenWip) {
        currentStatus = (wipHistory.length > 0 && wipHistory[0].status) || `Reopened: ${lot['REOPEN FOR WHICH PROCESS'] || 'Pending'}`;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'KajButton Completed' || latestComplete.status.includes('Complete')) {
          currentStatus = 'KajButton Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        cuttingJson: cuttingJson,
        stageJson: stageJson,
        process: processVal,
        processes: processVal,
        reopen: lot['REOPEN'] || lot['Reopen'] || '',
        reopenDate: lot['REOPEN DATE'] || lot['Reopen Date'] || '',
        reopenForWhichProcess: lot['REOPEN FOR WHICH PROCESS'] || lot['Reopen For Which Process'] || '',
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['kajButton Supervisor'] || lot['KajButton Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get KajButton lots: ${error.toString()}`,
      lots: []
    });
  }
}

// ============ JAYBIR EMBROIDERY FUNCTIONS ============
function saveJaybirEmbroideryOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Jaybir Embroidery');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Jaybir Embroidery');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Brand', 'Embroidery Supervisor', 'Embroidery Date', 'Total Pcs',
        'WIP Jaybir Embroidery', 'Jaybir Embroidery Complete', 'Total Manpower'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 'Brand', 
        'Embroidery Supervisor', 'Embroidery Date', 'Total Pcs', 
        'WIP Jaybir Embroidery', 'Jaybir Embroidery Complete', 'Total Manpower'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Brand': data.brand || '',
      'Embroidery Supervisor': data.supervisor || data.embroiderySupervisor || data.jaybirEmbSupervisor || 'JAYBIR EMBROIDERY',
      'Embroidery Date': data.issueDate || data.embroideryDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Jaybir Embroidery');
    const completeIndex = currentHeaders.indexOf('Jaybir Embroidery Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Jaybir Embroidery order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save Jaybir Embroidery order: ${error.toString()}`
    });
  }
}

function updateJaybirEmbroideryStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Jaybir Embroidery');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Jaybir Embroidery sheet not found'
      });
    }
    
    let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    headers = headers.map(h => (h || '').toString().trim());
    
    let wipHistoryCol = headers.findIndex(h => h.toLowerCase() === 'wip jaybir embroidery') + 1;
    let completeHistoryCol = headers.findIndex(h => h.toLowerCase() === 'jaybir embroidery complete') + 1;
    
    if (wipHistoryCol === 0) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('WIP Jaybir Embroidery');
      headers.push('WIP Jaybir Embroidery');
      wipHistoryCol = nextCol;
    }
    if (completeHistoryCol === 0) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('Jaybir Embroidery Complete');
      headers.push('Jaybir Embroidery Complete');
      completeHistoryCol = nextCol;
    }
    
    const lotNumberCol = headers.findIndex(h => h.toLowerCase() === 'lot number') + 1;
    if (lotNumberCol === 0) {
      return createJsonResponse({
        ok: false,
        error: 'Lot Number column not found in Jaybir Embroidery sheet'
      });
    }
    
    const lotNumber = (data.lotNumber || data.lotNo || '').toString().trim();
    if (!lotNumber) {
      return createJsonResponse({
        ok: false,
        error: 'No lotNumber provided'
      });
    }

    const totalRows = sheet.getLastRow();
    if (totalRows < 2) {
      return createJsonResponse({
        ok: false,
        error: 'No lot rows exist in Jaybir Embroidery sheet'
      });
    }

    const lotNumbers = sheet.getRange(2, lotNumberCol, totalRows - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => (num || '').toString().trim() === lotNumber) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Jaybir Embroidery sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status || 'Updated';
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'JAYBIR EMBROIDERY';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, wipHistoryCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.toString().trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, wipHistoryCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, completeHistoryCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.toString().trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, completeHistoryCol).setValue(JSON.stringify(completeHistory));
      
      const embDateCol = headers.findIndex(h => h.toLowerCase() === 'embroidery date') + 1;
      if (embDateCol > 0) {
        sheet.getRange(lotRowIndex, embDateCol).setValue(new Date().toISOString().split('T')[0]);
      }
      const supervisorCol = headers.findIndex(h => h.toLowerCase() === 'embroidery supervisor') + 1;
      if (supervisorCol > 0 && supervisor) {
        sheet.getRange(lotRowIndex, supervisorCol).setValue(supervisor);
      }

      const reopenCols = ensureReopenColumns(sheet, headers);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (completeHistoryCol > 0) {
        sheet.getRange(lotRowIndex, completeHistoryCol).setValue('[]');
      }
      const embDateCol = headers.findIndex(h => h.toLowerCase() === 'embroidery date') + 1;
      if (embDateCol > 0) {
        sheet.getRange(lotRowIndex, embDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, headers);
      headers = reopenCols.headers;
      if (reopenCols.reopenCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      }
      if (reopenCols.reopenDateCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      }
      if (reopenCols.reopenProcessCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);
      }

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, wipHistoryCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.toString().trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, wipHistoryCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Jaybir Embroidery ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update Jaybir Embroidery status: ${error.toString()}`
    });
  }
}

function getJaybirEmbroideryLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Jaybir Embroidery');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No Jaybir Embroidery data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Jaybir Embroidery']) {
        try {
          const parsed = JSON.parse(lot['WIP Jaybir Embroidery']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Jaybir Embroidery Complete']) {
        try {
          const parsed = JSON.parse(lot['Jaybir Embroidery Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Embroidery';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status.includes('Completed') || latestComplete.status.includes('Complete')) {
          currentStatus = 'Jaybir Embroidery Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Embroidery Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get Jaybir Embroidery lots: ${error.toString()}`,
      lots: []
    });
  }
}

// ============ JAYBIR PRINTING FUNCTIONS ============
function saveJaybirPrintingOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Jaybir Printing');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Jaybir Printing');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Brand', 'Printing Supervisor', 'Printing Date', 'Total Pcs',
        'WIP Jaybir Printing', 'Jaybir Printing Complete', 'Total Manpower'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 'Brand', 
        'Printing Supervisor', 'Printing Date', 'Total Pcs', 
        'WIP Jaybir Printing', 'Jaybir Printing Complete', 'Total Manpower'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Brand': data.brand || '',
      'Printing Supervisor': data.supervisor || data.printingSupervisor || data.jaybirPrintSupervisor || 'JAYBIR PRINTING',
      'Printing Date': data.issueDate || data.printingDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Jaybir Printing');
    const completeIndex = currentHeaders.indexOf('Jaybir Printing Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Jaybir Printing order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save Jaybir Printing order: ${error.toString()}`
    });
  }
}

function updateJaybirPrintingStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Jaybir Printing');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Jaybir Printing sheet not found'
      });
    }
    
    let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    headers = headers.map(h => (h || '').toString().trim());
    
    let wipHistoryCol = headers.findIndex(h => h.toLowerCase() === 'wip jaybir printing') + 1;
    let completeHistoryCol = headers.findIndex(h => h.toLowerCase() === 'jaybir printing complete') + 1;
    
    if (wipHistoryCol === 0) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('WIP Jaybir Printing');
      headers.push('WIP Jaybir Printing');
      wipHistoryCol = nextCol;
    }
    if (completeHistoryCol === 0) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('Jaybir Printing Complete');
      headers.push('Jaybir Printing Complete');
      completeHistoryCol = nextCol;
    }
    
    const lotNumberCol = headers.findIndex(h => h.toLowerCase() === 'lot number') + 1;
    if (lotNumberCol === 0) {
      return createJsonResponse({
        ok: false,
        error: 'Lot Number column not found in Jaybir Printing sheet'
      });
    }
    
    const lotNumber = (data.lotNumber || data.lotNo || '').toString().trim();
    if (!lotNumber) {
      return createJsonResponse({
        ok: false,
        error: 'No lotNumber provided'
      });
    }

    const totalRows = sheet.getLastRow();
    if (totalRows < 2) {
      return createJsonResponse({
        ok: false,
        error: 'No lot rows exist in Jaybir Printing sheet'
      });
    }

    const lotNumbers = sheet.getRange(2, lotNumberCol, totalRows - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => (num || '').toString().trim() === lotNumber) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Jaybir Printing sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status || 'Updated';
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'JAYBIR PRINTING';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, wipHistoryCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.toString().trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, wipHistoryCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, completeHistoryCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.toString().trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, completeHistoryCol).setValue(JSON.stringify(completeHistory));
      
      const printDateCol = headers.findIndex(h => h.toLowerCase() === 'printing date') + 1;
      if (printDateCol > 0) {
        sheet.getRange(lotRowIndex, printDateCol).setValue(new Date().toISOString().split('T')[0]);
      }
      const supervisorCol = headers.findIndex(h => h.toLowerCase() === 'printing supervisor') + 1;
      if (supervisorCol > 0 && supervisor) {
        sheet.getRange(lotRowIndex, supervisorCol).setValue(supervisor);
      }

      const reopenCols = ensureReopenColumns(sheet, headers);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (completeHistoryCol > 0) {
        sheet.getRange(lotRowIndex, completeHistoryCol).setValue('[]');
      }
      const printDateCol = headers.findIndex(h => h.toLowerCase() === 'printing date') + 1;
      if (printDateCol > 0) {
        sheet.getRange(lotRowIndex, printDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, headers);
      headers = reopenCols.headers;
      if (reopenCols.reopenCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      }
      if (reopenCols.reopenDateCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      }
      if (reopenCols.reopenProcessCol > 0) {
        sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);
      }

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, wipHistoryCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.toString().trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, wipHistoryCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Jaybir Printing ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update Jaybir Printing status: ${error.toString()}`
    });
  }
}

function getJaybirPrintingLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Jaybir Printing');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No Jaybir Printing data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Jaybir Printing']) {
        try {
          const parsed = JSON.parse(lot['WIP Jaybir Printing']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Jaybir Printing Complete']) {
        try {
          const parsed = JSON.parse(lot['Jaybir Printing Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Printing';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status.includes('Completed') || latestComplete.status.includes('Complete')) {
          currentStatus = 'Jaybir Printing Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Printing Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get Jaybir Printing lots: ${error.toString()}`,
      lots: []
    });
  }
}

// ============ ELASTIC FUNCTIONS ============
function saveElasticOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Elastic');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Elastic');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Brand', 'Elastic Supervisor', 'Elastic Date', 'Total Pcs',
        'WIP Elastic', 'Elastic Complete', 'Total Manpower'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 'Brand', 
        'Elastic Supervisor', 'Elastic Date', 'Total Pcs', 
        'WIP Elastic', 'Elastic Complete', 'Total Manpower'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Brand': data.brand || '',
      'Elastic Supervisor': data.elasticSupervisor || data.supervisor || '',
      'Elastic Date': data.elasticDate || data.issueDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Elastic');
    const completeIndex = currentHeaders.indexOf('Elastic Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Elastic order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save Elastic order: ${error.toString()}`
    });
  }
}

function updateElasticStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Elastic');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Elastic sheet not found'
      });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Elastic') + 1;
    const completeHistoryCol = headers.indexOf('Elastic Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Elastic');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Elastic Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Elastic') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Elastic Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Elastic sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Elastic Completed') {
        const elasticDateCol = updatedHeaders.indexOf('Elastic Date') + 1;
        if (elasticDateCol > 0) {
          sheet.getRange(lotRowIndex, elasticDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const elasticDateCol = updatedHeaders.indexOf('Elastic Date') + 1;
      if (elasticDateCol > 0) {
        sheet.getRange(lotRowIndex, elasticDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Elastic ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update Elastic status: ${error.toString()}`
    });
  }
}

function getElasticLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Elastic');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No Elastic data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Elastic']) {
        try {
          const parsed = JSON.parse(lot['WIP Elastic']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Elastic Complete']) {
        try {
          const parsed = JSON.parse(lot['Elastic Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Elastic';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Elastic Completed') {
          currentStatus = 'Elastic Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Elastic Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get Elastic lots: ${error.toString()}`,
      lots: []
    });
  }
}

// ============ WASHING FUNCTIONS ============
function saveWashingOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Washing');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Washing');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Brand', 'Washing Supervisor', 'Washing Date', 'Total Pcs',
        'WIP Washing', 'Washing Complete', 'Total Manpower', 'Selected Colors'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 'Brand',
        'Washing Supervisor', 'Washing Date', 'Total Pcs', 
        'WIP Washing', 'Washing Complete', 'Total Manpower', 'Selected Colors'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Brand': data.brand || '',
      'Washing Supervisor': data.washingSupervisor || data.supervisor || '',
      'Washing Date': data.washingDate || data.issueDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0',
      'Selected Colors': Array.isArray(data.selectedColors) ? data.selectedColors.join(', ') : (data.selectedColors || '')
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Washing');
    const completeIndex = currentHeaders.indexOf('Washing Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Washing order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save Washing order: ${error.toString()}`
    });
  }
}

function updateWashingStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Washing');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Washing sheet not found'
      });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Washing') + 1;
    const completeHistoryCol = headers.indexOf('Washing Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Washing');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Washing Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Washing') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Washing Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Washing sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Washing Completed') {
        const washingDateCol = updatedHeaders.indexOf('Washing Date') + 1;
        if (washingDateCol > 0) {
          sheet.getRange(lotRowIndex, washingDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const washingDateCol = updatedHeaders.indexOf('Washing Date') + 1;
      if (washingDateCol > 0) {
        sheet.getRange(lotRowIndex, washingDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Washing ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update Washing status: ${error.toString()}`
    });
  }
}

function getWashingLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Washing');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No Washing data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Washing']) {
        try {
          const parsed = JSON.parse(lot['WIP Washing']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Washing Complete']) {
        try {
          const parsed = JSON.parse(lot['Washing Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Washing';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Washing Completed') {
          currentStatus = 'Washing Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Washing Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get Washing lots: ${error.toString()}`,
      lots: []
    });
  }
}

// ============ BONE FUNCTIONS ============
function saveBoneOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Bone');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Bone');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Brand', 'Bone Supervisor', 'Bone Date', 'Total Pcs',
        'WIP Bone', 'Bone Complete', 'Total Manpower'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 'Brand', 
        'Bone Supervisor', 'Bone Date', 'Total Pcs', 
        'WIP Bone', 'Bone Complete', 'Total Manpower'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || data.lotNo || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Brand': data.brand || '',
      'Bone Supervisor': data.boneSupervisor || data.supervisor || '',
      'Bone Date': data.boneDate || data.issueDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Bone');
    const completeIndex = currentHeaders.indexOf('Bone Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Bone order saved to row ${lastRow}`,
      lotNumber: data.lotNumber || data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save Bone order: ${error.toString()}`
    });
  }
}

function updateBoneStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Bone');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Bone sheet not found'
      });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Bone') + 1;
    const completeHistoryCol = headers.indexOf('Bone Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Bone');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Bone Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Bone') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Bone Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Bone sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Bone Completed') {
        const boneDateCol = updatedHeaders.indexOf('Bone Date') + 1;
        if (boneDateCol > 0) {
          sheet.getRange(lotRowIndex, boneDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const boneDateCol = updatedHeaders.indexOf('Bone Date') + 1;
      if (boneDateCol > 0) {
        sheet.getRange(lotRowIndex, boneDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Bone ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update Bone status: ${error.toString()}`
    });
  }
}

function getBoneLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Bone');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No Bone data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Bone']) {
        try {
          const parsed = JSON.parse(lot['WIP Bone']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Bone Complete']) {
        try {
          const parsed = JSON.parse(lot['Bone Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Bone';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Bone Completed') {
          currentStatus = 'Bone Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Bone Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get Bone lots: ${error.toString()}`,
      lots: []
    });
  }
}

// ============ OVERLOCK & FOLDING & PACKING FUNCTIONS ============
function saveOverlockOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Overlock');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Overlock');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Overlock Supervisor', 'Overlock Date', 'Total Pcs',
        'Total Manpower', 'WIP Overlock', 'Overlock Complete'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 
        'Overlock Supervisor', 'Overlock Date', 'Total Pcs', 
        'Total Manpower', 'WIP Overlock', 'Overlock Complete'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Overlock Supervisor': data.overlockSupervisor || '',
      'Overlock Date': data.overlockDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Overlock');
    const completeIndex = currentHeaders.indexOf('Overlock Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Overlock order saved to row ${lastRow}`,
      lotNumber: data.lotNumber
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save overlock order: ${error.toString()}`
    });
  }
}

function updateOverlockStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Overlock');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Overlock sheet not found'
      });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Overlock') + 1;
    const completeHistoryCol = headers.indexOf('Overlock Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Overlock');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Overlock Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Overlock') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Overlock Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Overlock sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Overlock Completed') {
        const overlockDateCol = updatedHeaders.indexOf('Overlock Date') + 1;
        if (overlockDateCol > 0) {
          sheet.getRange(lotRowIndex, overlockDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const overlockDateCol = updatedHeaders.indexOf('Overlock Date') + 1;
      if (overlockDateCol > 0) {
        sheet.getRange(lotRowIndex, overlockDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Overlock ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update overlock status: ${error.toString()}`
    });
  }
}

function getOverlockLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Overlock');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No overlock data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Overlock']) {
        try {
          const parsed = JSON.parse(lot['WIP Overlock']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Overlock Complete']) {
        try {
          const parsed = JSON.parse(lot['Overlock Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Overlock';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Overlock Completed') {
          currentStatus = 'Overlock Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Overlock Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get overlock lots: ${error.toString()}`,
      lots: []
    });
  }
}

function saveFoldingOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('Folding');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Folding');
      sheet.appendRow([
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 
        'Style', 'Folding Supervisor', 'Folding Date', 'Total Pcs',
        'Total Manpower', 'WIP Folding', 'Folding Complete'
      ]);
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const requiredHeaders = [
        'Timestamp', 'Lot Number', 'Garment Type', 'Fabric', 'Style', 
        'Folding Supervisor', 'Folding Date', 'Total Pcs', 
        'Total Manpower', 'WIP Folding', 'Folding Complete'
      ];
      requiredHeaders.forEach((header, index) => {
        if (!headers.includes(header)) {
          sheet.getRange(1, index + 1).setValue(header);
        }
      });
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = new Array(currentHeaders.length).fill('');
    
    const columnMapping = {
      'Timestamp': new Date(data.timestamp || new Date().toISOString()),
      'Lot Number': data.lotNumber || '',
      'Garment Type': data.garmentType || '',
      'Fabric': data.fabric || '',
      'Style': data.style || '',
      'Folding Supervisor': data.foldingSupervisor || '',
      'Folding Date': data.foldingDate || '',
      'Total Pcs': parseFloat(data.totalPcs) || 0,
      'Total Manpower': data.totalManpower || '0'
    };
    
    currentHeaders.forEach((header, index) => {
      if (columnMapping[header] !== undefined) {
        rowData[index] = columnMapping[header];
      }
    });
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    const wipIndex = currentHeaders.indexOf('WIP Folding');
    const completeIndex = currentHeaders.indexOf('Folding Complete');
    
    if (wipIndex !== -1) sheet.getRange(lastRow, wipIndex + 1).setValue('[]');
    if (completeIndex !== -1) sheet.getRange(lastRow, completeIndex + 1).setValue('[]');
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Folding order saved to row ${lastRow}`,
      lotNumber: data.lotNumber
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save folding order: ${error.toString()}`
    });
  }
}

function updateFoldingStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Folding');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Folding sheet not found'
      });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Folding') + 1;
    const completeHistoryCol = headers.indexOf('Folding Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Folding');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Folding Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Folding') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Folding Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Folding sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Folding Completed') {
        const foldingDateCol = updatedHeaders.indexOf('Folding Date') + 1;
        if (foldingDateCol > 0) {
          sheet.getRange(lotRowIndex, foldingDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const foldingDateCol = updatedHeaders.indexOf('Folding Date') + 1;
      if (foldingDateCol > 0) {
        sheet.getRange(lotRowIndex, foldingDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Folding ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update folding status: ${error.toString()}`
    });
  }
}

function getFoldingLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Folding');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No folding data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Folding']) {
        try {
          const parsed = JSON.parse(lot['WIP Folding']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Folding Complete']) {
        try {
          const parsed = JSON.parse(lot['Folding Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Folding';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Folding Completed') {
          currentStatus = 'Folding Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Folding Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get folding lots: ${error.toString()}`,
      lots: []
    });
  }
}

function savePackingOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('PackingOrders');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('PackingOrders');
      sheet.appendRow([
        'Timestamp', 'PSO Number', 'Lot Number', 'Brand', 'Garment Type', 
        'Quantity (PCS)', 'Priority', 'Accessories', 'Remarks', 'Prepared By',
        'Total Lot Quantity', 'Existing PSO Count', 'Already Issued Quantity', 'Pending Quantity'
      ]);
    }
    
    const totalQty = parseFloat(data.totalLotQuantity) || 0;
    const issuedQty = parseFloat(data.issuedQuantity) || 0;
    const pendingQty = Math.max(0, totalQty - issuedQty);
    
    sheet.appendRow([
      new Date(data.timestamp || new Date().toISOString()),
      data.orderNo || '',
      data.lotNo || '',
      data.brand || '',
      data.garmentType || '',
      parseFloat(data.quantity) || 0,
      data.priority || 'Normal',
      Array.isArray(data.accessories) ? data.accessories.join(', ') : data.accessories || '',
      data.remarks || '',
      data.createdBy || '',
      totalQty,
      parseInt(data.existingPSOCount) || 0,
      issuedQty,
      pendingQty
    ]);
    
    SpreadsheetApp.flush();
    const lastRow = sheet.getLastRow();
    return createJsonResponse({
      ok: true,
      message: `Packing Order saved to row ${lastRow}`,
      orderNo: data.orderNo,
      lotNo: data.lotNo
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save packing order: ${error.toString()}`
    });
  }
}

function updatePackingStatus(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Issues');
    if (!sheet) {
      return createJsonResponse({
        ok: false,
        error: 'Issues sheet not found'
      });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lotNumberCol = headers.indexOf('Lot Number') + 1;
    const wipHistoryCol = headers.indexOf('WIP Packing') + 1;
    const completeHistoryCol = headers.indexOf('Packing Complete') + 1;
    
    if (wipHistoryCol === 0) sheet.getRange(1, headers.length + 1).setValue('WIP Packing');
    if (completeHistoryCol === 0) sheet.getRange(1, headers.length + 2).setValue('Packing Complete');
    
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const finalWipCol = updatedHeaders.indexOf('WIP Packing') + 1;
    const finalCompleteCol = updatedHeaders.indexOf('Packing Complete') + 1;
    
    const lotNumber = data.lotNumber;
    const lotNumbers = sheet.getRange(2, lotNumberCol, sheet.getLastRow() - 1, 1).getValues().flat();
    const lotRowIndex = lotNumbers.findIndex(num => num.toString() === lotNumber.toString()) + 2;
    
    if (lotRowIndex < 2) {
      return createJsonResponse({
        ok: false,
        error: `Lot ${lotNumber} not found in Issues sheet`
      });
    }
    
    const statusType = (data.statusType || 'wip').toLowerCase();
    const status = data.status;
    const remarks = data.remarks || '';
    const supervisor = data.supervisor || 'Unknown';
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      status: status,
      remarks: remarks,
      supervisor: supervisor,
      timestamp: timestamp,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    };
    
    if (statusType === 'wip') {
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: new Date().toISOString()}];
        }
      }
      wipHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
      
    } else if (statusType === 'complete') {
      const existingComplete = sheet.getRange(lotRowIndex, finalCompleteCol).getValue();
      let completeHistory = [];
      if (existingComplete && existingComplete.trim() !== '') {
        try {
          completeHistory = JSON.parse(existingComplete);
          if (!Array.isArray(completeHistory)) completeHistory = [completeHistory];
        } catch (e) {
          completeHistory = [{status: existingComplete, timestamp: new Date().toISOString()}];
        }
      }
      completeHistory.unshift(historyEntry);
      sheet.getRange(lotRowIndex, finalCompleteCol).setValue(JSON.stringify(completeHistory));
      
      if (status === 'Packing Completed') {
        const packingDateCol = updatedHeaders.indexOf('Packing Date') + 1;
        if (packingDateCol > 0) {
          sheet.getRange(lotRowIndex, packingDateCol).setValue(new Date().toISOString().split('T')[0]);
        }
      }

      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) {
        const curReopen = sheet.getRange(lotRowIndex, reopenCols.reopenCol).getValue();
        if (curReopen && curReopen.toString().trim().toLowerCase() === 'yes') {
          sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Completed');
        }
      }
    } else if (statusType === 'reopen') {
      if (finalCompleteCol > 0) {
        sheet.getRange(lotRowIndex, finalCompleteCol).setValue('[]');
      }
      const packingDateCol = updatedHeaders.indexOf('Packing Date') + 1;
      if (packingDateCol > 0) {
        sheet.getRange(lotRowIndex, packingDateCol).setValue('');
      }

      const reopenProcess = data.process || data.status || 'Pending';
      const reopenCols = ensureReopenColumns(sheet, updatedHeaders);
      if (reopenCols.reopenCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenCol).setValue('Yes');
      if (reopenCols.reopenDateCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenDateCol).setValue(formatDate(new Date()));
      if (reopenCols.reopenProcessCol > 0) sheet.getRange(lotRowIndex, reopenCols.reopenProcessCol).setValue(reopenProcess);

      const reopenEntry = {
        status: `Reopened: ${reopenProcess}`,
        action: 'reopen',
        process: reopenProcess,
        remarks: remarks || `Reopened for ${reopenProcess}`,
        supervisor: supervisor,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
      };
      const existingWip = sheet.getRange(lotRowIndex, finalWipCol).getValue();
      let wipHistory = [];
      if (existingWip && existingWip.trim() !== '') {
        try {
          wipHistory = JSON.parse(existingWip);
          if (!Array.isArray(wipHistory)) wipHistory = [wipHistory];
        } catch (e) {
          wipHistory = [{status: existingWip, timestamp: timestamp}];
        }
      }
      wipHistory.unshift(reopenEntry);
      sheet.getRange(lotRowIndex, finalWipCol).setValue(JSON.stringify(wipHistory));
    }
    
    SpreadsheetApp.flush();

    return createJsonResponse({
      ok: true,
      message: `Packing ${statusType} status updated successfully`,
      lotNumber: lotNumber,
      status: status
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to update packing status: ${error.toString()}`
    });
  }
}

function getPackingLots(spreadsheet, data) {
  try {
    const sheet = spreadsheet.getSheetByName('Issues');
    if (!sheet || sheet.getLastRow() < 2) {
      return createJsonResponse({
        ok: true,
        lots: [],
        total: 0,
        message: 'No packing data found'
      });
    }
    
    const supervisorName = (data.supervisor || '').toLowerCase().trim();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length);
    const rows = dataRange.getValues();
    
    const lots = rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        lot[header] = row[colIndex] || '';
      });
      
      let wipHistory = [];
      let completeHistory = [];
      
      if (lot['WIP Packing']) {
        try {
          const parsed = JSON.parse(lot['WIP Packing']);
          wipHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { wipHistory = []; }
      }
      
      if (lot['Packing Complete']) {
        try {
          const parsed = JSON.parse(lot['Packing Complete']);
          completeHistory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) { completeHistory = []; }
      }
      
      let currentStatus = 'Ready for Packing';
      let isCompleted = false;
      let isInProgress = false;
      
      if (wipHistory.length > 0 && (wipHistory[0].action === 'reopen' || (wipHistory[0].status && wipHistory[0].status.toString().toLowerCase().includes('reopen')))) {
        currentStatus = wipHistory[0].status;
        isCompleted = false;
        isInProgress = false;
      } else if (completeHistory.length > 0) {
        const latestComplete = completeHistory[0];
        if (latestComplete.status === 'Packing Completed') {
          currentStatus = 'Packing Completed';
          isCompleted = true;
        } else {
          currentStatus = latestComplete.status;
          isInProgress = true;
        }
      } else if (wipHistory.length > 0) {
        currentStatus = wipHistory[0].status;
        isInProgress = true;
      }
      
      return {
        ...lot,
        id: index + 1,
        currentStatus: currentStatus,
        isCompleted: isCompleted,
        isInProgress: isInProgress,
        wipHistory: wipHistory,
        completeHistory: completeHistory,
        lastUpdated: wipHistory.length > 0 ? wipHistory[0].timestamp : 
                    completeHistory.length > 0 ? completeHistory[0].timestamp : ''
      };
    });
    
    const filteredLots = supervisorName 
      ? lots.filter(lot => {
          const lotSupervisor = (lot['Packing Supervisor'] || '').toLowerCase().trim();
          return lotSupervisor.includes(supervisorName);
        })
      : lots;
    
    return createJsonResponse({
      ok: true,
      lots: filteredLots,
      total: filteredLots.length
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get packing lots: ${error.toString()}`,
      lots: []
    });
  }
}

function saveDefaultIssue(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('DefaultIssues');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('DefaultIssues');
      sheet.appendRow([
        'Timestamp', 'Issue Type', 'Description', 'Severity', 
        'Reported By', 'Status', 'Resolution'
      ]);
    }
    
    sheet.appendRow([
      new Date(data.timestamp || new Date().toISOString()),
      data.issueType || 'General',
      data.description || '',
      data.severity || 'Medium',
      data.reportedBy || 'Unknown',
      'Open',
      ''
    ]);
    
    SpreadsheetApp.flush();
    const lastRow = sheet.getLastRow();
    return createJsonResponse({
      ok: true,
      message: `Default issue saved to row ${lastRow}`
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save default issue: ${error.toString()}`
    });
  }
}

function saveMaterialOrder(spreadsheet, data) {
  try {
    let sheet = spreadsheet.getSheetByName('MaterialOrders');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('MaterialOrders');
      sheet.appendRow([
        'Timestamp', 'Material Type', 'Quantity', 'Unit', 
        'Required Date', 'Requested By', 'Status', 'Supplier', 'Notes'
      ]);
    }
    
    sheet.appendRow([
      new Date(data.timestamp || new Date().toISOString()),
      data.materialType || '',
      parseFloat(data.quantity) || 0,
      data.unit || 'PCS',
      data.requiredDate || '',
      data.requestedBy || '',
      'Pending',
      data.supplier || '',
      data.notes || ''
    ]);
    
    SpreadsheetApp.flush();
    const lastRow = sheet.getLastRow();
    return createJsonResponse({
      ok: true,
      message: `Material order saved to row ${lastRow}`
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to save material order: ${error.toString()}`
    });
  }
}

function getAllDepartmentsData(spreadsheet, data) {
  try {
    const departments = {};
    const summary = {
      totalLots: 0,
      completedLots: 0,
      inProgressLots: 0,
      pendingLots: 0
    };

    try {
      const feedUpSheet = spreadsheet.getSheetByName('FeedUp');
      if (feedUpSheet && feedUpSheet.getLastRow() > 1) {
        const feedUpData = getFeedUpLots(spreadsheet, {});
        const parsed = JSON.parse(feedUpData.getContent());
        if (parsed.ok) {
          departments.feedUp = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}
    
    try {
      const overlockSheet = spreadsheet.getSheetByName('Overlock');
      if (overlockSheet && overlockSheet.getLastRow() > 1) {
        const overlockData = getOverlockLots(spreadsheet, {});
        const parsed = JSON.parse(overlockData.getContent());
        if (parsed.ok) {
          departments.overlock = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}
    
    try {
      const foldingSheet = spreadsheet.getSheetByName('Folding');
      if (foldingSheet && foldingSheet.getLastRow() > 1) {
        const foldingData = getFoldingLots(spreadsheet, {});
        const parsed = JSON.parse(foldingData.getContent());
        if (parsed.ok) {
          departments.folding = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}
    
    try {
      const packingSheet = spreadsheet.getSheetByName('Issues');
      if (packingSheet && packingSheet.getLastRow() > 1) {
        const packingData = getPackingLots(spreadsheet, {});
        const parsed = JSON.parse(packingData.getContent());
        if (parsed.ok) {
          departments.packing = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}
    
    try {
      const kajButtonSheet = spreadsheet.getSheetByName('KajButton');
      if (kajButtonSheet && kajButtonSheet.getLastRow() > 1) {
        const kajButtonData = getKajButtonLots(spreadsheet, {});
        const parsed = JSON.parse(kajButtonData.getContent());
        if (parsed.ok) {
          departments.kajButton = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}

    try {
      const elasticSheet = spreadsheet.getSheetByName('Elastic');
      if (elasticSheet && elasticSheet.getLastRow() > 1) {
        const elasticData = getElasticLots(spreadsheet, {});
        const parsed = JSON.parse(elasticData.getContent());
        if (parsed.ok) {
          departments.elastic = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}

    try {
      const washingSheet = spreadsheet.getSheetByName('Washing');
      if (washingSheet && washingSheet.getLastRow() > 1) {
        const washingData = getWashingLots(spreadsheet, {});
        const parsed = JSON.parse(washingData.getContent());
        if (parsed.ok) {
          departments.washing = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}

    try {
      const boneSheet = spreadsheet.getSheetByName('Bone');
      if (boneSheet && boneSheet.getLastRow() > 1) {
        const boneData = getBoneLots(spreadsheet, {});
        const parsed = JSON.parse(boneData.getContent());
        if (parsed.ok) {
          departments.bone = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}

    try {
      const embSheet = spreadsheet.getSheetByName('Jaybir Embroidery');
      if (embSheet && embSheet.getLastRow() > 1) {
        const embData = getJaybirEmbroideryLots(spreadsheet, {});
        const parsed = JSON.parse(embData.getContent());
        if (parsed.ok) {
          departments.jaybirEmbroidery = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}

    try {
      const printSheet = spreadsheet.getSheetByName('Jaybir Printing');
      if (printSheet && printSheet.getLastRow() > 1) {
        const printData = getJaybirPrintingLots(spreadsheet, {});
        const parsed = JSON.parse(printData.getContent());
        if (parsed.ok) {
          departments.jaybirPrinting = parsed.lots;
          summary.totalLots += parsed.total;
          parsed.lots.forEach(lot => {
            if (lot.isCompleted) summary.completedLots++;
            else if (lot.isInProgress) summary.inProgressLots++;
            else summary.pendingLots++;
          });
        }
      }
    } catch (e) {}
    
    return createJsonResponse({
      ok: true,
      departments: departments,
      summary: summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: `Failed to get all departments data: ${error.toString()}`,
      departments: {},
      summary: {}
    });
  }
}

// ============ POST HANDLER ============
function doPost(e) {
  try {
    const data = e.postData ? JSON.parse(e.postData.contents) : {};
    const action = data.action || '';
    
    const sheetId = '1IMhmYlJ3s2PPRgEQs1Ikd4O1OBXK4EYL1oV_-kWAkyg';
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    
    switch(action) {
      case 'submitOverlockOrder':
        return saveOverlockOrder(spreadsheet, data);
      case 'submitFoldingOrder':
        return saveFoldingOrder(spreadsheet, data);
      case 'submitPackingOrder':
        return savePackingOrder(spreadsheet, data);
      case 'submitKajButtonOrder':
        return saveKajButtonOrder(spreadsheet, data);
      case 'submitFeedUpOrder':
        return saveFeedUpOrder(spreadsheet, data);
      case 'submitElasticOrder':
        return saveElasticOrder(spreadsheet, data);
      case 'submitWashingOrder':
        return saveWashingOrder(spreadsheet, data);
      case 'submitBoneOrder':
        return saveBoneOrder(spreadsheet, data);
      case 'submitJaybirEmbroideryOrder':
      case 'submitJaybirEmbOrder':
        return saveJaybirEmbroideryOrder(spreadsheet, data);
      case 'submitJaybirPrintingOrder':
      case 'submitJaybirPrintOrder':
        return saveJaybirPrintingOrder(spreadsheet, data);

      // Status updates
      case 'updateJaybirPrintingStatus':
      case 'updateJaybirPrintStatus':
      case 'updatePrintingStatus':
        return updateJaybirPrintingStatus(spreadsheet, data);

      case 'updateJaybirEmbroideryStatus':
      case 'updateJaybirEmbStatus':
      case 'updateEmbroideryStatus':
        return updateJaybirEmbroideryStatus(spreadsheet, data);

      case 'updateKajButtonStatus':
        return updateKajButtonStatus(spreadsheet, data);
      case 'updateFeedUpStatus':
        return updateFeedUpStatus(spreadsheet, data);
      case 'updatePackingStatus':
        return updatePackingStatus(spreadsheet, data);
      case 'updateOverlockStatus':
        return updateOverlockStatus(spreadsheet, data);
      case 'updateFoldingStatus':
        return updateFoldingStatus(spreadsheet, data);
      case 'updateElasticStatus':
        return updateElasticStatus(spreadsheet, data);
      case 'updateWashingStatus':
        return updateWashingStatus(spreadsheet, data);
      case 'updateBoneStatus':
        return updateBoneStatus(spreadsheet, data);

      case 'updateStatus':
      case 'updateLotStatus':
        const dept = (data.department || data.dept || data.sheetName || '').toLowerCase();
        if (dept.includes('print')) return updateJaybirPrintingStatus(spreadsheet, data);
        if (dept.includes('embroid')) return updateJaybirEmbroideryStatus(spreadsheet, data);
        if (dept.includes('feed')) return updateFeedUpStatus(spreadsheet, data);
        if (dept.includes('elastic')) return updateElasticStatus(spreadsheet, data);
        if (dept.includes('wash')) return updateWashingStatus(spreadsheet, data);
        if (dept.includes('bone')) return updateBoneStatus(spreadsheet, data);
        if (dept.includes('overlock')) return updateOverlockStatus(spreadsheet, data);
        if (dept.includes('fold')) return updateFoldingStatus(spreadsheet, data);
        return updateKajButtonStatus(spreadsheet, data);

      case 'bulkUpdate':
        return createJsonResponse({
          ok: true,
          message: 'Bulk update received'
        });
      default:
        return createJsonResponse({
          ok: false,
          error: 'Invalid action for POST request: ' + action
        });
    }
    
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: error.toString()
    });
  }
}
