import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Google Sheets API Configuration
const SPREADSHEET_ID = '1IMhmYlJ3s2PPRgEQs1Ikd4O1OBXK4EYL1oV_-kWAkyg';
const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxS6Z3HUfnxFnzp9SAqhIKiXPmVAKwxhMqTbgGQ2s9gtU8joJuaIl8T3TjGrQuPBy_mkw/exec";


// Department / Sheet Definitions (Full Multi-Department Support)
const DEPARTMENTS = [
  {
    id: 'feedup',
    name: 'Feed Up',
    sheetName: 'FeedUp',
    shortName: 'Feed Up',
    updateAction: 'updateFeedUpStatus',
    supervisorKeys: ['Feed Up Supervisor', 'Feed Up Superv', 'Feed Up Super', 'Supervisor', 'FEED UP SUPERVISOR'],
    dateKeys: ['Feed Up Date', 'Date', 'FEED UP DATE'],
    wipKeys: ['WIP Feed Up', 'WIP', 'WIP FEED UP'],
    completeKeys: ['Feed Up Complete', 'Complete', 'FEED UP COMPLETE'],
    wipOptions: [
      'FEED UP WIP',
      'FEED UP RUNNING',
      'FEED UP ATTACH',
      'FEED UP FOLD',
      'TOP STITCH',
      'BALTACH',
      'Other'
    ],
    completeOptions: ['Feed Up Completed', 'Other']
  },
  {
    id: 'elastic',
    name: 'Elastic',
    sheetName: 'Elastic',
    shortName: 'Elastic',
    updateAction: 'updateElasticStatus',
    supervisorKeys: ['Elastic Supervisor', 'Supervisor', 'ELASTIC SUPERVISOR'],
    dateKeys: ['Elastic Date', 'Date', 'ELASTIC DATE'],
    wipKeys: ['WIP Elastic', 'WIP', 'WIP ELASTIC'],
    completeKeys: ['Elastic Complete', 'Complete', 'ELASTIC COMPLETE'],
    wipOptions: [
      'ELASTIC WIP',
      'ELASTIC ATTACH',
      'ELASTIC FOLD',
      'TOP STITCH',
      'BALTACH',
      'Other'
    ],
    completeOptions: ['Elastic Completed', 'Other']
  },
  {
    id: 'bone',
    name: 'Bone',
    sheetName: 'Bone',
    shortName: 'Bone',
    updateAction: 'updateBoneStatus',
    supervisorKeys: ['Bone Supervisor', 'Supervisor', 'BONE SUPERVISOR'],
    dateKeys: ['Bone Date', 'Date', 'BONE DATE'],
    wipKeys: ['WIP Bone', 'WIP', 'WIP BONE'],
    completeKeys: ['Bone Complete', 'Complete', 'BONE COMPLETE'],
    wipOptions: [
      'BONE WIP',
      'POCKET BONE',
      'WELT POCKET',
      'BONE ATTACH',
      'Other'
    ],
    completeOptions: ['Bone Completed', 'Other']
  },
  {
    id: 'washing',
    name: 'Washing',
    sheetName: 'Washing',
    shortName: 'Washing',
    updateAction: 'updateWashingStatus',
    supervisorKeys: ['Washing Supervisor', 'Supervisor', 'WASHING SUPERVISOR'],
    dateKeys: ['Washing Date', 'Date', 'WASHING DATE'],
    wipKeys: ['WIP Washing', 'WIP', 'WIP WASHING'],
    completeKeys: ['Washing Complete', 'Complete', 'WASHING COMPLETE'],
    wipOptions: [
      'WASHING WIP',
      'ENZYME WASH',
      'BIO WASH',
      'TUMBLE DRY',
      'SOFTENER',
      'Other'
    ],
    completeOptions: ['Washing Completed', 'Other']
  },
  {
    id: 'folding',
    name: 'Folding',
    sheetName: 'Folding',
    shortName: 'Folding',
    updateAction: 'updateFoldingStatus',
    supervisorKeys: ['Folding Supervisor', 'Supervisor', 'FOLDING SUPERVISOR'],
    dateKeys: ['Folding Date', 'Date', 'FOLDING DATE'],
    wipKeys: ['WIP Folding', 'WIP', 'WIP FOLDING'],
    completeKeys: ['Folding Complete', 'Complete', 'FOLDING COMPLETE'],
    wipOptions: [
      'FOLDING WIP',
      'THREAD CUTTING',
      'TAGGING',
      'POLY PACK',
      'STICKERING',
      'Other'
    ],
    completeOptions: ['Folding Completed', 'Other']
  },
  {
    id: 'kajbutton',
    name: 'KajButton',
    sheetName: 'KajButton',
    shortName: 'KajButton',
    updateAction: 'updateKajButtonStatus',
    supervisorKeys: ['kajButton Supervisor', 'KajButton Supervisor', 'Supervisor'],
    dateKeys: ['KajButton Date', 'Date'],
    wipKeys: ['WIP KajButton', 'WIP'],
    completeKeys: ['KajButton Complete', 'Complete'],
    wipOptions: [
      'KAJBUTTON',
      'BELT',
      'MOHRI KAJ',
      'TITCH BUTTON',
      'DOWN PART',
      'PASTING',
      'BALTACH',
      'Other'
    ],
    completeOptions: ['KajButton Completed', 'Other']
  },
  {
    id: 'overlock',
    name: 'Overlock',
    sheetName: 'Overlock',
    shortName: 'Overlock',
    updateAction: 'updateOverlockStatus',
    supervisorKeys: ['Overlock Supervisor', 'Supervisor', 'OVERLOCK SUPERVISOR'],
    dateKeys: ['Overlock Date', 'Date', 'OVERLOCK DATE'],
    wipKeys: ['WIP Overlock', 'WIP', 'WIP OVERLOCK'],
    completeKeys: ['Overlock Complete', 'Complete', 'OVERLOCK COMPLETE'],
    wipOptions: [
      'OVERLOCK WIP',
      'FRONT BACK OVERLOCK',
      'SLEEVE OVERLOCK',
      'BOTTOM OVERLOCK',
      'Other'
    ],
    completeOptions: ['Overlock Completed', 'Other']
  },
  {
    id: 'printing',
    name: 'Jaybir Printing',
    sheetName: 'Jaybir Printing',
    shortName: 'Printing',
    updateAction: 'updateJaybirPrintingStatus',
    supervisorKeys: ['Printing Supervisor', 'Supervisor', 'Jaybir Printing Supervisor'],
    dateKeys: ['Printing Date', 'Date'],
    wipKeys: ['WIP Jaybir Printing', 'WIP Printing', 'WIP'],
    completeKeys: ['Jaybir Printing Complete', 'Printing Complete', 'Complete'],
    wipOptions: [
      'PRINTING WIP',
      'SCREEN PRINTING',
      'TABLE PRINTING',
      'CURING',
      'COLOR MIXING',
      'Other'
    ],
    completeOptions: ['Jaybir Printing Complete', 'Printing Completed', 'Other']
  },
  {
    id: 'embroidery',
    name: 'Jaybir Embroidery',
    sheetName: 'Jaybir Embroidery',
    shortName: 'Embroidery',
    updateAction: 'updateJaybirEmbroideryStatus',
    supervisorKeys: ['Embroidery Supervisor', 'Supervisor', 'Jaybir Embroidery Supervisor'],
    dateKeys: ['Embroidery Date', 'Date'],
    wipKeys: ['WIP Jaybir Embroidery', 'WIP Embroidery', 'WIP'],
    completeKeys: ['Jaybir Embroidery Complete', 'Embroidery Complete', 'Complete'],
    wipOptions: [
      'EMBROIDERY WIP',
      'FRAME SETUP',
      'THREADING',
      'STITCHING EMBROIDERY',
      'TRIMMING',
      'Other'
    ],
    completeOptions: ['Jaybir Embroidery Complete', 'Embroidery Completed', 'Other']
  }
];

// Helper to determine the default department matching the user's role/profile
const getDeptIdForUser = (userObj) => {
  if (!userObj || !userObj.department) return 'feedup';
  const dept = userObj.department.toLowerCase().trim();
  if (dept.includes('feed')) return 'feedup';
  if (dept.includes('elastic')) return 'elastic';
  if (dept.includes('bone')) return 'bone';
  if (dept.includes('wash')) return 'washing';
  if (dept.includes('fold')) return 'folding';
  if (dept.includes('overlock') || dept.includes('ovelock')) return 'overlock';
  if (dept.includes('print')) return 'printing';
  if (dept.includes('embroid')) return 'embroidery';
  if (dept.includes('kaj') || dept.includes('button')) return 'kajbutton';
  const match = DEPARTMENTS.find(d =>
    d.id === dept ||
    d.name.toLowerCase().includes(dept) ||
    d.shortName.toLowerCase() === dept
  );
  return match ? match.id : 'feedup';
};

// Helper to determine the accessible departments based on user identity
// Jaybir -> KajButton, Jaybir Printing, Jaybir Embroidery
// Feed Up -> Feed Up
// Elastic -> Only Elastic
// Bone -> Only Bone
// Washing -> Only Washing
// Folding -> Only Folding
const getAccessibleDepartments = (userObj) => {
  if (!userObj) return DEPARTMENTS;

  const userName = (userObj.name || '').toLowerCase().trim();
  const userDept = (userObj.department || '').toLowerCase().trim();
  const userRole = (userObj.role || '').toLowerCase().trim();

  // Admin / Manager / All departments
  if (
    userRole === 'admin' ||
    userRole === 'manager' ||
    userDept === 'all' ||
    userDept.includes('all') ||
    userDept.includes('production')
  ) {
    return DEPARTMENTS;
  }

  // Jaybir manages KajButton, Jaybir Printing, and Jaybir Embroidery
  if (
    userName.includes('jaybir') ||
    userDept.includes('jaybir') ||
    userDept.includes('kaj') ||
    userDept.includes('button') ||
    userDept.includes('print') ||
    userDept.includes('embroid')
  ) {
    return DEPARTMENTS.filter(d => ['kajbutton', 'printing', 'embroidery'].includes(d.id));
  }

  // Feed Up Department Supervisor (only Feed Up lots)
  if (userDept.includes('feed') || userName.includes('feed') || userName.includes('mohan')) {
    return DEPARTMENTS.filter(d => d.id === 'feedup');
  }

  // Elastic Department Supervisor (only Elastic lots)
  if (userDept.includes('elastic') || userName.includes('elastic')) {
    return DEPARTMENTS.filter(d => d.id === 'elastic');
  }

  // Bone Department Supervisor (only Bone lots)
  if (userDept.includes('bone') || userName.includes('bone')) {
    return DEPARTMENTS.filter(d => d.id === 'bone');
  }

  // Washing Department Supervisor (only Washing lots)
  if (userDept.includes('wash') || userName.includes('wash')) {
    return DEPARTMENTS.filter(d => d.id === 'washing');
  }

  // Folding Department Supervisor (only Folding lots)
  if (userDept.includes('fold') || userName.includes('fold')) {
    return DEPARTMENTS.filter(d => d.id === 'folding');
  }

  // Overlock Department Supervisor (only Overlock lots)
  if (userDept.includes('overlock') || userDept.includes('ovelock') || userName.includes('overlock')) {
    return DEPARTMENTS.filter(d => d.id === 'overlock');
  }

  // Generic match
  const matched = DEPARTMENTS.filter(d =>
    d.id === userDept ||
    d.name.toLowerCase().includes(userDept) ||
    d.shortName.toLowerCase() === userDept
  );
  if (matched.length > 0) return matched;

  // Default to DEPARTMENTS if nothing matches
  return DEPARTMENTS;
};

const renderDeptIcon = (deptId, color = '#2563EB') => {
  switch (deptId) {
    case 'feedup':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
          <line x1="4" y1="21" x2="20" y2="21" strokeWidth="2.5" />
        </svg>
      );
    case 'elastic':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" strokeDasharray="2 2" />
          <line x1="3" y1="14" x2="21" y2="14" strokeDasharray="2 2" />
        </svg>
      );
    case 'bone':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.5" />
        </svg>
      );
    case 'washing':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          <path d="M8 14c1 1 2 1 3 0s2-1 3 0 2 1 2 0" />
        </svg>
      );
    case 'folding':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'overlock':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );
    case 'printing':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
          <path d="M6 14h12v8H6v-8z" />
        </svg>
      );
    case 'embroidery':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
        </svg>
      );
    case 'kajbutton':
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1.5" fill={color} />
          <circle cx="15" cy="10" r="1.5" fill={color} />
          <circle cx="12" cy="15" r="1.5" fill={color} />
        </svg>
      );
  }
};

const Dashboard = ({ user, onLogout }) => {
  const accessibleDepts = useMemo(() => getAccessibleDepartments(user), [user]);

  const [activeDeptId, setActiveDeptId] = useState(() => {
    const list = getAccessibleDepartments(user);
    const userDeptId = getDeptIdForUser(user);
    const found = list.find(d => d.id === userDeptId);
    return found ? found.id : (list[0]?.id || 'elastic');
  });

  // Auto-switch to user's assigned department if user changes
  useEffect(() => {
    const list = getAccessibleDepartments(user);
    const userDeptId = getDeptIdForUser(user);
    const found = list.find(d => d.id === userDeptId);
    setActiveDeptId(found ? found.id : (list[0]?.id || 'elastic'));
  }, [user]);
  const [deptData, setDeptData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Supervisor view toggle: 'my' (assigned to current user) or 'all'
  const [viewScope, setViewScope] = useState('my');

  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'in-progress', 'pending'
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [expandedRows, setExpandedRows] = useState({});

  // Status update bottom sheet modal state
  const [updateModal, setUpdateModal] = useState(null);
  const [updateStatusType, setUpdateStatusType] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  const [customStatus, setCustomStatus] = useState('');

  // Reopen Lot modal state
  const [reopenModal, setReopenModal] = useState(null);
  const [reopenProcess, setReopenProcess] = useState('');
  const [reopenRemarks, setReopenRemarks] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const [reopenMessage, setReopenMessage] = useState({ type: '', text: '' });

  const activeDept = useMemo(() => {
    return DEPARTMENTS.find(d => d.id === activeDeptId) || DEPARTMENTS[0];
  }, [activeDeptId]);

  // Calculate days elapsed:
  // For completed lot: completion date - issue date
  // For pending / in-progress lot: today's date - issue date
  const getDaysElapsed = useCallback((issueDate, completionDate = null, isCompleted = false) => {
    if (!issueDate) return null;
    try {
      const issue = new Date(issueDate);
      if (isNaN(issue.getTime())) return null;

      let endDate = null;
      if (isCompleted && completionDate) {
        const comp = new Date(completionDate);
        if (!isNaN(comp.getTime())) {
          endDate = comp;
        }
      }

      // If not completed or completion date not parsed, use today's date
      if (!endDate) {
        endDate = new Date();
      }

      // Set to start of day for accurate full calendar days count
      const endClean = new Date(endDate);
      const issueClean = new Date(issue);
      endClean.setHours(0, 0, 0, 0);
      issueClean.setHours(0, 0, 0, 0);

      const diffTime = endClean.getTime() - issueClean.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return null;
    }
  }, []);

  const getLotDaysElapsed = useCallback((lot) => {
    if (!lot) return null;
    return getDaysElapsed(lot.operationDate, lot.completionDate, lot.isCompleted);
  }, [getDaysElapsed]);

  // Helper to find a matching column header
  const findColumnValue = (row, possibleKeys) => {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== '') return row[key];
    }
    const lowerKeys = possibleKeys.map(k => k.toLowerCase());
    for (const header of Object.keys(row)) {
      if (lowerKeys.includes(header.toLowerCase()) && row[header] !== undefined) {
        return row[header];
      }
    }
    return '';
  };

  const transformSheetData = useCallback((sheetData, dept) => {
    if (!sheetData || sheetData.length === 0) return [];

    const headers = sheetData[0].map(h => h.trim());
    const rows = sheetData.slice(1);

    return rows.map((row, index) => {
      const lot = {};
      headers.forEach((header, colIndex) => {
        if (header && row[colIndex] !== undefined) {
          lot[header] = row[colIndex] || '';
        }
      });

      lot.id = `${dept.id}-lot-${index}`;
      lot.deptId = dept.id;
      lot.deptName = dept.name;

      lot.lotNumber = findColumnValue(lot, ['Lot Number', 'Lot', 'LOT', 'Lot No', 'Lot #', 'LOT NUMBER']) || `L-${index + 1}`;
      lot.garmentType = findColumnValue(lot, ['Garment Type', 'Garment', 'GARMENT', 'Item', 'Product', 'GARMENT TYPE']) || 'Garment';
      lot.style = findColumnValue(lot, ['Style', 'STYLE', 'Style Name', 'STYLE NAME']) || 'N/A';
      lot.brand = findColumnValue(lot, ['Brand', 'BRAND', 'Buyer', 'BUYER']) || '';
      if (lot.brand.startsWith('#')) {
        lot.brand = '';
      }
      lot.fabric = findColumnValue(lot, ['Fabric', 'FABRIC', 'Fabric Name', 'FABRIC NAME']) || '';
      lot.totalPcs = findColumnValue(lot, ['Total Pcs', 'Pcs', 'PCS', 'Quantity', 'QTY', 'TOTAL PCS']) || '0';
      lot.totalManpower = findColumnValue(lot, ['Total Manpower', 'Manpower', 'MANPOWER', 'TOTAL MANPOWER']) || '0';
      lot.selectedColors = findColumnValue(lot, ['Selected Colors', 'SelectedColors', 'Colors', 'COLORS']) || '';
      lot.stitchingSupervisor = findColumnValue(lot, ['Stiching Supervisor', 'Stitching Supervisor', 'STITCHING SUPERVISOR']) || '';

      // Parse Processes from sheet (Column 'Process', 'Processes', etc.)
      const rawProcess = findColumnValue(lot, [
        'Process', 'Processes', 'PROCESS', 'PROCESSES', 'Process Name', 'PROCESS NAME', 'Operation', 'OPERATIONS'
      ]) || '';
      lot.processes = rawProcess;

      if (Array.isArray(rawProcess)) {
        lot.processList = rawProcess.map(p => String(p).trim()).filter(Boolean);
      } else if (typeof rawProcess === 'string' && rawProcess.trim()) {
        const trimmed = rawProcess.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            lot.processList = Array.isArray(parsed) ? parsed.map(p => String(p).trim()).filter(Boolean) : [trimmed];
          } catch {
            lot.processList = trimmed.split(',').map(p => p.trim()).filter(Boolean);
          }
        } else {
          lot.processList = trimmed.split(',').map(p => p.trim()).filter(Boolean);
        }
      } else {
        lot.processList = [];
      }

      lot.supervisor = findColumnValue(lot, dept.supervisorKeys) || 'Not Assigned';
      lot.operationDate = findColumnValue(lot, dept.dateKeys) || lot['Timestamp'] || '';

      // Parse WIP history
      const wipRaw = findColumnValue(lot, dept.wipKeys);
      try {
        if (wipRaw && wipRaw.trim().startsWith('[')) {
          lot.wipHistory = JSON.parse(wipRaw);
        } else {
          lot.wipHistory = [];
        }
      } catch {
        lot.wipHistory = [];
      }

      // Parse Complete history
      const completeRaw = findColumnValue(lot, dept.completeKeys);
      try {
        if (completeRaw && completeRaw.trim().startsWith('[')) {
          lot.completeHistory = JSON.parse(completeRaw);
        } else {
          lot.completeHistory = [];
        }
      } catch {
        lot.completeHistory = [];
      }

      const hasWip = lot.wipHistory && lot.wipHistory.length > 0;
      const hasComplete = lot.completeHistory && lot.completeHistory.length > 0;

      // Look for explicit Completion Date column in sheet or in complete history
      const explicitCompletionDate = findColumnValue(lot, [
        'Completion Date', 'Complete Date', 'Completed Date', 'COMPLETION DATE', 'COMPLETE DATE',
        'KajButton Complete Date', 'Kajbutton Complete Date', 'Complete Timestamp', 'Completion Timestamp'
      ]);

      let completionDate = explicitCompletionDate || '';

      // Find latest WIP entry by timestamp
      let latestWip = null;
      if (hasWip) {
        latestWip = lot.wipHistory.reduce((prev, curr) => {
          const prevTime = prev && (prev.timestamp || prev.date) ? new Date(prev.timestamp || prev.date).getTime() : 0;
          const currTime = curr && (curr.timestamp || curr.date) ? new Date(curr.timestamp || curr.date).getTime() : 0;
          return currTime >= prevTime ? curr : prev;
        }, lot.wipHistory[0]);
      }

      // Find latest completion entry by timestamp
      let latestComplete = null;
      if (hasComplete) {
        latestComplete = lot.completeHistory.reduce((prev, curr) => {
          const prevTime = prev && (prev.timestamp || prev.date) ? new Date(prev.timestamp || prev.date).getTime() : 0;
          const currTime = curr && (curr.timestamp || curr.date) ? new Date(curr.timestamp || curr.date).getTime() : 0;
          return currTime >= prevTime ? curr : prev;
        }, lot.completeHistory[0]);
      }

      const compTime = latestComplete && (latestComplete.timestamp || latestComplete.date) ? new Date(latestComplete.timestamp || latestComplete.date).getTime() : 0;

      // Check explicit REOPEN columns from Google Sheets
      const reopenColVal = (findColumnValue(lot, ['REOPEN', 'Reopen', 'reopen']) || '').toString().trim();
      const reopenDateColVal = (findColumnValue(lot, ['REOPEN DATE', 'Reopen Date', 'reopenDate']) || '').toString().trim();
      const reopenProcessColVal = (findColumnValue(lot, ['REOPEN FOR WHICH PROCESS', 'Reopen For Which Process', 'reopenForWhichProcess', 'reopenProcess']) || '').toString().trim();

      // Look specifically for a reopen event in WIP history
      const latestReopenEntry = (lot.wipHistory || []).find(item =>
        item && (item.action === 'reopen' || (item.status && item.status.toString().toLowerCase().includes('reopen')))
      );
      const reopenTime = latestReopenEntry && (latestReopenEntry.timestamp || latestReopenEntry.date)
        ? new Date(latestReopenEntry.timestamp || latestReopenEntry.date).getTime()
        : 0;

      const isExplicitReopen = reopenColVal.toLowerCase() === 'yes' || reopenColVal.toLowerCase() === 'reopened';
      // Lot is ONLY reopened if explicitly marked REOPEN=Yes or latestReopenEntry occurred after completion
      const isReopenWip = isExplicitReopen || !!(latestReopenEntry && (!hasComplete || reopenTime >= compTime));

      // CASE 1: Reopened lot (reopened more recently than completed, or explicit REOPEN=Yes)
      if (isReopenWip) {
        lot.isCompleted = false;
        lot.isInProgress = false; // Strictly lands in Pending category!
        lot.isReopened = true;
        const reopenProc = reopenProcessColVal || (latestReopenEntry && latestReopenEntry.process) || (latestReopenEntry && latestReopenEntry.status ? latestReopenEntry.status.toString().replace(/^Reopened:\s*/i, '') : '');
        lot.reopen = reopenColVal || 'Yes';
        lot.reopenDate = reopenDateColVal || (latestReopenEntry && (latestReopenEntry.date || (latestReopenEntry.timestamp ? latestReopenEntry.timestamp.split('T')[0] : ''))) || '';
        lot.reopenProcess = reopenProc;
        lot.reopenForWhichProcess = reopenProc;
        lot.currentStatus = (latestReopenEntry && latestReopenEntry.status) || `Reopened: ${reopenProc || 'Pending'}`;
        lot.statusShort = reopenProc ? `Pending: ${reopenProc}` : 'Pending (Reopened)';
        completionDate = ''; // Cleared so days elapsed uses Today - Issue Date
      } else if (hasComplete) {
        // CASE 2: Completed lot (Has valid complete record and was NOT reopened)
        lot.currentStatus = (latestComplete && latestComplete.status) || 'Completed';
        lot.statusShort = 'Completed';
        lot.isCompleted = true;
        lot.isInProgress = false;
        lot.isReopened = false;
        if (!completionDate && latestComplete && (latestComplete.timestamp || latestComplete.date)) {
          completionDate = latestComplete.timestamp || latestComplete.date;
        }
      } else if (completeRaw && !completeRaw.trim().startsWith('[') && !completeRaw.trim().startsWith('{') && !isReopenWip) {
        const trimmedComplete = completeRaw.trim();
        if (trimmedComplete.toLowerCase().includes('complete')) {
          lot.currentStatus = trimmedComplete;
          lot.statusShort = 'Completed';
          lot.isCompleted = true;
          lot.isInProgress = false;
          lot.isReopened = false;
        } else if (!isNaN(new Date(trimmedComplete).getTime())) {
          lot.currentStatus = 'Completed';
          lot.statusShort = 'Completed';
          lot.isCompleted = true;
          lot.isInProgress = false;
          lot.isReopened = false;
          if (!completionDate) completionDate = trimmedComplete;
        }
      } else if (hasWip) {
        // CASE 3: Active in-progress lot
        lot.currentStatus = latestWip.status || 'In Progress';
        lot.statusShort = latestWip.status || 'In Progress';
        lot.isCompleted = false;
        lot.isInProgress = true;
        lot.isReopened = false;
      } else {
        // CASE 4: Fresh/Ready lot (Pending)
        lot.currentStatus = 'Ready';
        lot.statusShort = 'Ready';
        lot.isCompleted = false;
        lot.isInProgress = false;
        lot.isReopened = false;
      }

      lot.completionDate = completionDate;

      return lot;
    });
  }, []);

  // Fetch sheet data for a specific department
  const fetchDeptData = useCallback(async (dept, showRefreshing = true) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      setError('');

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(dept.sheetName)}?key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load ${dept.name}: ${response.status}`);
      }

      const data = await response.json();
      if (!data.values || !Array.isArray(data.values)) {
        throw new Error(`Invalid format for ${dept.name}`);
      }

      const transformedLots = transformSheetData(data.values, dept);

      setDeptData(prev => ({
        ...prev,
        [dept.id]: {
          allLots: transformedLots,
          lastRefresh: new Date()
        }
      }));
    } catch (err) {
      console.error(err);
      setError(`Failed to load ${dept.name} data. Please check connection.`);
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  }, [transformSheetData]);

  // Initial load
  useEffect(() => {
    fetchDeptData(activeDept, false);
  }, [activeDept, fetchDeptData]);

  const handleRefresh = () => {
    fetchDeptData(activeDept, true);
  };

  // Get lots for current department
  const currentDeptLots = useMemo(() => {
    return deptData[activeDept.id]?.allLots || [];
  }, [deptData, activeDept.id]);

  // Filter lots based on supervisor viewScope
  const supervisorFilteredLots = useMemo(() => {
    if (viewScope === 'all' || !user?.name) {
      return currentDeptLots;
    }
    const supervisorName = user.name.trim().toLowerCase();
    const matched = currentDeptLots.filter(lot => {
      const s = lot.supervisor.trim().toLowerCase();
      return s.includes(supervisorName) || supervisorName.includes(s);
    });
    return matched.length > 0 ? matched : currentDeptLots;
  }, [currentDeptLots, viewScope, user]);

  const activeLots = useMemo(() => {
    return supervisorFilteredLots.filter(l => !l.isCompleted);
  }, [supervisorFilteredLots]);

  const completedLots = useMemo(() => {
    return supervisorFilteredLots.filter(l => l.isCompleted);
  }, [supervisorFilteredLots]);

  // Stats for the active department
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let redZone = 0;

    supervisorFilteredLots.forEach(lot => {
      if (lot.isCompleted) {
        completed++;
      } else {
        if (lot.isInProgress) inProgress++;
        else pending++;

        const days = getLotDaysElapsed(lot);
        if (days !== null && days > 7) {
          redZone++;
        }
      }
    });

    return {
      total: supervisorFilteredLots.length,
      completed,
      inProgress,
      pending,
      redZone,
      activeLots: activeLots.length
    };
  }, [supervisorFilteredLots, activeLots.length, getLotDaysElapsed]);

  // Filtered lots for search & status tabs
  const filteredLots = useMemo(() => {
    let filtered;
    if (filters.status === 'completed') {
      filtered = [...completedLots];
    } else if (filters.status === 'in-progress') {
      filtered = activeLots.filter(lot => lot.isInProgress);
    } else if (filters.status === 'pending') {
      filtered = activeLots.filter(lot => !lot.isInProgress);
    } else if (filters.status === 'red-zone') {
      filtered = activeLots.filter(lot => {
        const days = getLotDaysElapsed(lot);
        return days !== null && days > 7;
      });
    } else if (filters.status === 'all-lots') {
      filtered = [...supervisorFilteredLots];
    } else {
      filtered = [...activeLots];
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(lot =>
        lot.lotNumber.toLowerCase().includes(q) ||
        lot.style.toLowerCase().includes(q) ||
        lot.brand.toLowerCase().includes(q) ||
        lot.fabric.toLowerCase().includes(q) ||
        lot.garmentType.toLowerCase().includes(q) ||
        (lot.processes && lot.processes.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.operationDate || '');
          bValue = new Date(b.operationDate || '');
          break;
        case 'lot':
          aValue = a.lotNumber;
          bValue = b.lotNumber;
          break;
        case 'style':
          aValue = a.style;
          bValue = b.style;
          break;
        case 'quantity':
          aValue = parseInt(a.totalPcs) || 0;
          bValue = parseInt(b.totalPcs) || 0;
          break;
        default:
          aValue = a.lotNumber;
          bValue = b.lotNumber;
      }
      return filters.sortOrder === 'desc'
        ? (bValue > aValue ? 1 : -1)
        : (aValue > bValue ? 1 : -1);
    });

    return filtered;
  }, [activeLots, completedLots, supervisorFilteredLots, filters, getLotDaysElapsed]);

  // Update status via Apps Script
  const updateStatusSubmit = async (statusType, lotNumber, status, remarks) => {
    setIsUpdating(true);
    setUpdateMessage({ type: '', text: '' });

    try {
      const finalStatus = status === 'Other' ? customStatus : status;
      if (status === 'Other' && !customStatus.trim()) {
        setUpdateMessage({ type: 'error', text: 'Please specify custom status' });
        setIsUpdating(false);
        return;
      }

      const actionName = activeDept.updateAction || 'updateKajButtonStatus';
      const params = new URLSearchParams({
        action: actionName,
        sheetName: activeDept.sheetName,
        department: activeDept.id,
        lotNumber: lotNumber.toString(),
        statusType: statusType,
        status: finalStatus,
        remarks: remarks || '',
        supervisor: user?.name || 'Dashboard User'
      });

      const url = `${APP_SCRIPT_URL}?${params.toString()}`;

      let resData = null;
      try {
        const response = await fetch(url);
        resData = await response.json();
      } catch (err) {
        // Fallback for environments with strict opaque redirect rules
        await fetch(url, { method: 'GET', mode: 'no-cors' });
      }

      if (resData && resData.ok === false) {
        setUpdateMessage({
          type: 'error',
          text: resData.error || `Error updating lot #${lotNumber}`
        });
        setIsUpdating(false);
        return;
      }

      setUpdateMessage({
        type: 'success',
        text: (resData && resData.message) || `Status updated for Lot #${lotNumber}! Syncing...`
      });

      setTimeout(() => {
        fetchDeptData(activeDept, false);
        setUpdateModal(null);
        setUpdateStatus('');
        setUpdateRemarks('');
        setCustomStatus('');
        setUpdateMessage({ type: '', text: '' });
      }, 1200);
    } catch (error) {
      console.error('Update status error:', error);
      setUpdateMessage({
        type: 'warning',
        text: 'Update sent. Refreshing sheet data...'
      });
      setTimeout(() => {
        fetchDeptData(activeDept, false);
        setUpdateModal(null);
      }, 1500);
    } finally {
      setIsUpdating(false);
    }
  };

  const openUpdateModal = (lot, type) => {
    setUpdateModal({ lot });
    setUpdateStatusType(type);
    setUpdateStatus(
      type === 'complete'
        ? activeDept.completeOptions[0]
        : activeDept.wipOptions[0]
    );
    setUpdateRemarks('');
    setCustomStatus('');
    setUpdateMessage({ type: '', text: '' });
  };

  // Helper for equating process synonyms (e.g. 'Kaj Mohri' == 'Mohri Kaj', 'BalTag' == 'Baltach', 'Kaj Belt' == 'Belt')
  const getCanonicalProcess = (name) => {
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
  };

  const areProcessesEquivalent = (p1, p2) => {
    if (!p1 || !p2) return false;
    const c1 = getCanonicalProcess(p1);
    const c2 = getCanonicalProcess(p2);
    if (c1 && c2 && c1 === c2) return true;
    const words1 = p1.toString().toLowerCase().split(/[\s\-_]+/).filter(Boolean).sort().join(' ');
    const words2 = p2.toString().toLowerCase().split(/[\s\-_]+/).filter(Boolean).sort().join(' ');
    return words1 === words2;
  };

  const openReopenModal = (lot) => {
    setReopenModal({ lot });
    const availableDeptOpt = activeDept.wipOptions.find(o =>
      o !== 'Other' && !(lot.processList || []).some(p => areProcessesEquivalent(p, o))
    );
    setReopenProcess(availableDeptOpt || '');
    setReopenRemarks('');
    setReopenMessage({ type: '', text: '' });
  };

  const handleReopenSubmit = async () => {
    if (!reopenModal?.lot) return;
    const lot = reopenModal.lot;
    const processVal = reopenProcess.trim();
    if (!processVal) {
      setReopenMessage({ type: 'error', text: 'Please specify the process for reopening this lot' });
      return;
    }

    // Disallow reopening for original processes that were already completed in the sheet (including synonyms)
    const isAlreadyCompleted = (lot.processList || []).some(p => areProcessesEquivalent(p, processVal));
    if (isAlreadyCompleted) {
      setReopenMessage({
        type: 'error',
        text: `Cannot reopen: "${processVal}" is equivalent to an original completed process for this lot (${lot.processList.join(', ')}). Please select or enter a different process.`
      });
      return;
    }

    setIsReopening(true);
    setReopenMessage({ type: '', text: '' });

    try {
      const actionName = activeDept.updateAction || 'updateKajButtonStatus';
      const params = new URLSearchParams({
        action: actionName,
        sheetName: activeDept.sheetName,
        department: activeDept.id,
        lotNumber: lot.lotNumber.toString(),
        statusType: 'reopen',
        status: `Reopened: ${processVal}`,
        process: processVal,
        remarks: reopenRemarks.trim() || `Reopened for ${processVal}`,
        supervisor: user?.name || 'Dashboard User'
      });

      const url = `${APP_SCRIPT_URL}?${params.toString()}`;

      let resData = null;
      try {
        const response = await fetch(url);
        resData = await response.json();
      } catch (err) {
        await fetch(url, { method: 'GET', mode: 'no-cors' });
      }

      if (resData && resData.ok === false) {
        setReopenMessage({
          type: 'error',
          text: resData.error || `Failed to reopen Lot #${lot.lotNumber}`
        });
        setIsReopening(false);
        return;
      }

      setReopenMessage({
        type: 'success',
        text: (resData && resData.message) || `Lot #${lot.lotNumber} reopened for ${processVal}! Moved to Pending.`
      });

      setTimeout(() => {
        fetchDeptData(activeDept, false);
        setReopenModal(null);
        setReopenProcess('');
        setReopenRemarks('');
        setReopenMessage({ type: '', text: '' });
      }, 1200);

    } catch (err) {
      console.error('Reopen lot error:', err);
      setReopenMessage({
        type: 'warning',
        text: 'Reopen update sent. Refreshing sheet data...'
      });
      setTimeout(() => {
        fetchDeptData(activeDept, false);
        setReopenModal(null);
        setReopenProcess('');
        setReopenRemarks('');
      }, 1500);
    } finally {
      setIsReopening(false);
    }
  };

  const toggleRow = (lotId) => {
    setExpandedRows(prev => ({
      ...prev,
      [lotId]: !prev[lotId]
    }));
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    if (typeof d === 'string' && d.length <= 11 && (d.includes(' ') || d.includes('-') || d.includes('/'))) {
      return d;
    }
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return String(d);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  if (loading && currentDeptLots.length === 0) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading Operations Data...</p>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      {/* SINGLE UNIFIED STICKY HEADER (Header + Tabs stay together with NO overlapping!) */}
      <header style={styles.unifiedHeader}>
        {/* Supervisor User Row */}
        <div style={styles.headerUserRow}>
          <div style={styles.headerUser}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div style={styles.userMeta}>
              <span style={styles.supervisorTag}>
                {user?.department ? `${user.department.toUpperCase()} SUPERVISOR` : 'SUPERVISOR'}
              </span>
              <h2 style={styles.supervisorName}>{user?.name}</h2>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={styles.refreshBtn}
            title="Refresh Data"
            aria-label="Refresh lots"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
              }}
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                stroke="#2563EB"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Clean Department Switcher / Single Department Banner */}
        {accessibleDepts.length > 1 ? (
          <div style={styles.deptSegmentedBox}>
            {accessibleDepts.map((dept) => {
              const isActive = dept.id === activeDeptId;
              const count = deptData[dept.id]?.allLots?.length;

              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setActiveDeptId(dept.id);
                    setFilters(f => ({ ...f, status: 'all', search: '' }));
                  }}
                  style={{
                    ...styles.deptSegmentBtn,
                    ...(isActive ? styles.deptSegmentBtnActive : {}),
                  }}
                  className="touch-press"
                >
                  {renderDeptIcon(dept.id, isActive ? '#1d4ed8' : '#2563eb')}
                  <span>{dept.shortName}</span>
                  {count !== undefined && (
                    <span style={{
                      ...styles.deptCountPill,
                      backgroundColor: isActive ? '#2563EB' : '#bfdbfe',
                      color: isActive ? '#ffffff' : '#1e40af'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={styles.singleDeptBanner}>
            <div style={styles.singleDeptBadge}>
              {renderDeptIcon(activeDept.id, '#1d4ed8')}
              <span style={styles.singleDeptName}>{activeDept.name} Production Lots</span>
            </div>
            {deptData[activeDept.id]?.allLots?.length !== undefined && (
              <span style={styles.singleDeptCount}>
                {deptData[activeDept.id]?.allLots?.length} {deptData[activeDept.id]?.allLots?.length === 1 ? 'Lot' : 'Lots'}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={styles.main}>
        {/* Search & Filter Bar */}
        <div style={styles.searchSection}>
          <div style={styles.searchBar}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
              <circle cx="11" cy="11" r="8" stroke="#2563EB" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${activeDept.shortName} by lot #, style, brand, process...`}
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              style={styles.searchInput}
            />
            {filters.search && (
              <button
                onClick={() => setFilters(f => ({ ...f, search: '' }))}
                style={styles.searchClearBtn}
              >
                ✕
              </button>
            )}
          </div>

          {/* Modern KPI Stats Carousel / Stat Pills */}
          <div style={styles.statsPillRow}>
            {/* Total Lots */}
            <div
              onClick={() => setFilters(f => ({ ...f, status: f.status === 'all-lots' ? 'all' : 'all-lots' }))}
              style={{
                ...styles.statPillCard,
                backgroundColor: '#eff6ff',
                border: filters.status === 'all-lots' ? '2px solid #2563eb' : '1px solid #bfdbfe',
                boxShadow: filters.status === 'all-lots' ? '0 3px 10px rgba(37, 99, 235, 0.25)' : '0 2px 6px rgba(37, 99, 235, 0.04)',
                cursor: 'pointer'
              }}
              className="touch-press"
              title="Click to view all lots (both active & completed)"
            >
              <div style={{ ...styles.statPillIconBox, backgroundColor: '#dbeafe' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={styles.statPillInfo}>
                <span style={{ ...styles.statPillValue, color: '#1e40af' }}>{stats.total}</span>
                <span style={styles.statPillLabel}>Total Lots</span>
              </div>
            </div>

            {/* WIP / Active */}
            <div
              onClick={() => setFilters(f => ({ ...f, status: f.status === 'in-progress' ? 'all' : 'in-progress' }))}
              style={{
                ...styles.statPillCard,
                backgroundColor: '#fffbeb',
                border: filters.status === 'in-progress' ? '2px solid #d97706' : '1px solid #fde68a',
                boxShadow: filters.status === 'in-progress' ? '0 3px 10px rgba(217, 119, 6, 0.25)' : '0 2px 6px rgba(217, 119, 6, 0.04)',
                cursor: 'pointer'
              }}
              className="touch-press"
              title="Click to view in-progress / active lots"
            >
              <div style={{ ...styles.statPillIconBox, backgroundColor: '#fef3c7' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={styles.statPillInfo}>
                <span style={{ ...styles.statPillValue, color: '#b45309' }}>{stats.inProgress}</span>
                <span style={styles.statPillLabel}>WIP / Active</span>
              </div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setFilters(f => ({ ...f, status: f.status === 'completed' ? 'all' : 'completed' }))}
              style={{
                ...styles.statPillCard,
                backgroundColor: '#ecfdf5',
                border: filters.status === 'completed' ? '2px solid #059669' : '1px solid #a7f3d0',
                boxShadow: filters.status === 'completed' ? '0 3px 10px rgba(5, 150, 105, 0.25)' : '0 2px 6px rgba(5, 150, 105, 0.04)',
                cursor: 'pointer'
              }}
              className="touch-press"
              title="Click to view completed lots"
            >
              <div style={{ ...styles.statPillIconBox, backgroundColor: '#d1fae5' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={styles.statPillInfo}>
                <span style={{ ...styles.statPillValue, color: '#065f46' }}>{stats.completed}</span>
                <span style={styles.statPillLabel}>Completed</span>
              </div>
            </div>

            {/* Red Zone (> 7 Days) */}
            {stats.redZone > 0 && (
              <div
                onClick={() => setFilters(f => ({ ...f, status: f.status === 'red-zone' ? 'all' : 'red-zone' }))}
                style={{
                  ...styles.statPillCard,
                  backgroundColor: '#fef2f2',
                  border: filters.status === 'red-zone' ? '2px solid #dc2626' : '1px solid #fecaca',
                  boxShadow: filters.status === 'red-zone' ? '0 3px 10px rgba(220, 38, 38, 0.25)' : '0 2px 6px rgba(220, 38, 38, 0.04)',
                  cursor: 'pointer'
                }}
                className="touch-press"
                title="Click to view delayed lots (> 7 days)"
              >
                <div style={{ ...styles.statPillIconBox, backgroundColor: '#fee2e2' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={styles.statPillInfo}>
                  <span style={{ ...styles.statPillValue, color: '#dc2626' }}>{stats.redZone}</span>
                  <span style={{ ...styles.statPillLabel, color: '#991b1b', fontWeight: '700' }}>&gt; 7 Days</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter Chips */}
          <div style={styles.statusChipsRow}>
            <button
              onClick={() => setFilters(f => ({ ...f, status: 'all' }))}
              style={{
                ...styles.statusChipBtn,
                ...(filters.status === 'all' ? styles.statusChipBtnActive : {})
              }}
              className="touch-press"
            >
              All Active ({activeLots.length})
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, status: 'in-progress' }))}
              style={{
                ...styles.statusChipBtn,
                ...(filters.status === 'in-progress' ? styles.statusChipBtnActive : {})
              }}
              className="touch-press"
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, status: 'pending' }))}
              style={{
                ...styles.statusChipBtn,
                ...(filters.status === 'pending' ? styles.statusChipBtnActive : {})
              }}
              className="touch-press"
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, status: 'completed' }))}
              style={{
                ...styles.statusChipBtn,
                ...(filters.status === 'completed'
                  ? { backgroundColor: '#059669', border: '1px solid #059669', color: '#ffffff', fontWeight: '700', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)' }
                  : { backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontWeight: '700' }
                )
              }}
              className="touch-press"
            >
              Completed ({stats.completed})
            </button>
            {stats.redZone > 0 && (
              <button
                onClick={() => setFilters(f => ({ ...f, status: 'red-zone' }))}
                style={{
                  ...styles.statusChipBtn,
                  ...(filters.status === 'red-zone'
                    ? { backgroundColor: '#dc2626', border: '1px solid #dc2626', color: '#ffffff', fontWeight: '700' }
                    : { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: '700' }
                  )
                }}
                className="touch-press"
              >
                ⚠️ Red Zone ({stats.redZone})
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div style={styles.errorNotification}>
            <span>{error}</span>
            <button onClick={handleRefresh} style={styles.retryAction}>Retry</button>
          </div>
        )}

        {/* Lots Feed */}
        <div style={styles.lotsList}>
          {isRefreshing && filteredLots.length === 0 ? (
            /* Modern Skeleton Shimmer Loading */
            <>
              {[1, 2, 3].map(n => (
                <div key={n} style={styles.skeletonCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div className="skeleton-shimmer" style={{ width: '80px', height: '26px' }} />
                    <div className="skeleton-shimmer" style={{ width: '100px', height: '26px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
                  <div className="skeleton-shimmer" style={{ width: '40%', height: '14px', marginBottom: '16px' }} />
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '54px', marginBottom: '14px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="skeleton-shimmer" style={{ flex: 1, height: '40px' }} />
                    <div className="skeleton-shimmer" style={{ flex: 1, height: '40px' }} />
                  </div>
                </div>
              ))}
            </>
          ) : filteredLots.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={styles.emptyHeadline}>
                {filters.status === 'completed'
                  ? `No Completed ${activeDept.shortName} Lots`
                  : stats.activeLots === 0 && stats.completed > 0
                    ? `All ${activeDept.shortName} Lots Completed!`
                    : `No ${activeDept.shortName} lots found`}
              </h3>
              <p style={styles.emptyDesc}>
                {filters.search
                  ? 'No lots match your search query.'
                  : filters.status === 'completed'
                    ? `There are no completed lots recorded in ${activeDept.name} yet.`
                    : stats.activeLots === 0
                      ? `All ${completedLots.length} assigned lots in ${activeDept.name} are complete.`
                      : `No pending lots in ${activeDept.name}.`}
              </p>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const isExpanded = !!expandedRows[lot.id];
              const isInProgress = lot.isInProgress;
              const daysElapsed = getLotDaysElapsed(lot);
              const isRedZone = !lot.isCompleted && daysElapsed !== null && daysElapsed > 7;

              return (
                <article
                  key={lot.id}
                  style={{
                    ...styles.card,
                    ...(isRedZone ? styles.cardRedZone : {})
                  }}
                  className={isRedZone ? 'red-zone-card' : ''}
                >
                  {/* Red Zone Banner for Lots > 7 Days */}
                  {isRedZone && (
                    <div style={styles.redZoneBanner}>
                      <span style={styles.redZoneBannerText}>
                        🚨 RED ZONE • DELAYED ({daysElapsed} DAYS IN PRODUCTION)
                      </span>
                    </div>
                  )}

                  {/* Card Header Row: Lot Badge on left, Days pill in center/right, Status Chip on right */}
                  <div style={styles.cardTopRow}>
                    <div style={styles.lotNumberGroup}>
                      <span style={{
                        ...styles.lotNumberBadge,
                        backgroundColor: isRedZone ? '#dc2626' : lot.isCompleted ? '#059669' : '#1d4ed8',
                        boxShadow: isRedZone ? '0 2px 5px rgba(220, 38, 38, 0.3)' : lot.isCompleted ? '0 2px 5px rgba(5, 150, 105, 0.25)' : '0 2px 5px rgba(29, 78, 216, 0.25)'
                      }}>
                        #{lot.lotNumber}
                      </span>
                      {lot.brand && (
                        <span style={styles.brandTag}>
                          {lot.brand}
                        </span>
                      )}
                      {lot.isReopened && (
                        <span
                          style={styles.reopenedBadge}
                          title={`${lot.reopenDate ? `Reopened on ${lot.reopenDate} for ` : 'Reopened for '}${lot.reopenProcess || 'Pending'}`}
                        >
                          ↺ Reopened{lot.reopenProcess ? `: ${lot.reopenProcess}` : ''}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {daysElapsed !== null && (
                        <div style={{
                          ...styles.daysBadge,
                          backgroundColor: isRedZone ? '#dc2626' : lot.isCompleted ? '#ecfdf5' : daysElapsed > 5 ? '#fef2f2' : daysElapsed > 2 ? '#fffbeb' : '#eff6ff',
                          border: `1px solid ${isRedZone ? '#b91c1c' : lot.isCompleted ? '#a7f3d0' : daysElapsed > 5 ? '#fecaca' : daysElapsed > 2 ? '#fde68a' : '#bfdbfe'}`,
                          color: isRedZone ? '#ffffff' : lot.isCompleted ? '#065f46' : daysElapsed > 5 ? '#dc2626' : daysElapsed > 2 ? '#b45309' : '#1d4ed8',
                          fontWeight: '800'
                        }} title={lot.isCompleted
                          ? `Completed in ${daysElapsed} day(s) (Formula: ${formatDate(lot.completionDate || 'N/A')} - ${formatDate(lot.operationDate)}).`
                          : `Issued on ${formatDate(lot.operationDate)}. Running for ${daysElapsed} day(s) (Formula: Today - Issue Date).`}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>{daysElapsed === 0 ? (lot.isCompleted ? 'Same day' : 'Today') : `${daysElapsed}d`}</span>
                        </div>
                      )}

                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: lot.isCompleted ? '#ecfdf5' : isInProgress ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${lot.isCompleted ? '#a7f3d0' : isInProgress ? '#fde68a' : '#e2e8f0'}`,
                        color: lot.isCompleted ? '#065f46' : isInProgress ? '#b45309' : '#475569'
                      }}>
                        <span style={{
                          ...styles.statusDot,
                          backgroundColor: lot.isCompleted ? '#10b981' : isInProgress ? '#d97706' : '#94a3b8'
                        }} />
                        <span>{lot.statusShort}</span>
                      </div>
                    </div>
                  </div>

                  {/* Garment Title & Style Description */}
                  <div style={styles.cardTitleBlock}>
                    <h3 style={styles.garmentTitle}>{lot.garmentType}</h3>
                    <p style={styles.styleLine}>
                      <span style={styles.stylePrefix}>Style:</span> {lot.style}
                    </p>
                  </div>

                  {/* Processes Badge Row */}
                  {lot.processList && lot.processList.length > 0 && (
                    <div style={styles.processStrip}>
                      <div style={styles.processStripHeader}>
                        <span style={styles.processStripLabel}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px', verticalAlign: '-1px' }}>
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                          Processes ({lot.processList.length})
                        </span>
                      </div>
                      <div style={styles.processChipsWrap}>
                        {lot.processList.map((proc, pIdx) => (
                          <span
                            key={pIdx}
                            style={styles.processChip}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilters(f => ({ ...f, search: proc }));
                            }}
                            title={`Filter by ${proc}`}
                          >
                            <span style={styles.processDot} />
                            {proc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Structured Spec Box (Mobile-optimized 3-Column Strip) */}
                  <div style={styles.specsBox} onClick={() => toggleRow(lot.id)}>
                    <div style={styles.specCol}>
                      <span style={styles.specColLabel}>QTY</span>
                      <span style={styles.specColValueBold}>{lot.totalPcs} <span style={styles.specPcsUnit}>pcs</span></span>
                    </div>

                    <div style={styles.specDivider} />

                    <div style={styles.specCol}>
                      <span style={styles.specColLabel}>FABRIC</span>
                      <span style={styles.specColValue} title={lot.fabric}>
                        {lot.fabric || 'Standard'}
                      </span>
                    </div>

                    <div style={styles.specDivider} />

                    <div style={styles.specCol}>
                      <span style={styles.specColLabel}>{lot.isCompleted ? 'DURATION' : 'AGE'}</span>
                      <span style={{
                        ...styles.specColValueBold,
                        color: lot.isCompleted ? '#065f46' : daysElapsed > 5 ? '#dc2626' : daysElapsed > 2 ? '#b45309' : '#1d4ed8'
                      }}>
                        {daysElapsed !== null ? (daysElapsed === 0 ? (lot.isCompleted ? 'Same day' : 'Day 1') : `${daysElapsed}d`) : 'N/A'}
                      </span>
                    </div>

                    <div style={styles.specChevronBox}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Expandable Accordion Body */}
                  {isExpanded && (
                    <div style={styles.cardAccordion}>
                      <div style={styles.detailsTable}>
                        <div style={styles.tableRow}>
                          <span style={styles.tableLabel}>Issue Date:</span>
                          <span style={styles.tableVal}>{formatDate(lot.operationDate)}</span>
                        </div>
                        {lot.isCompleted && lot.completionDate ? (
                          <div style={styles.tableRow}>
                            <span style={styles.tableLabel}>Completion Date:</span>
                            <span style={{ ...styles.tableVal, color: '#065f46' }}>{formatDate(lot.completionDate)}</span>
                          </div>
                        ) : null}
                        <div style={styles.tableRow}>
                          <span style={styles.tableLabel}>{lot.isCompleted ? 'Duration:' : 'Days in Production:'}</span>
                          <span style={{
                            ...styles.tableVal,
                            color: lot.isCompleted ? '#065f46' : daysElapsed > 5 ? '#dc2626' : daysElapsed > 2 ? '#b45309' : '#1d4ed8'
                          }}>
                            {daysElapsed !== null ? (
                              lot.isCompleted
                                ? `${daysElapsed} day(s) (${lot.completionDate ? `${formatDate(lot.completionDate)} - ${formatDate(lot.operationDate)}` : 'Completed'})`
                                : `${daysElapsed} day(s) (${daysElapsed === 0 ? 'Issued today' : `Issued ${daysElapsed} days ago`})`
                            ) : 'N/A'}
                          </span>
                        </div>
                        <div style={styles.tableRow}>
                          <span style={styles.tableLabel}>Supervisor:</span>
                          <span style={styles.tableVal}>{lot.supervisor}</span>
                        </div>
                        <div style={styles.tableRow}>
                          <span style={styles.tableLabel}>Manpower:</span>
                          <span style={styles.tableVal}>{lot.totalManpower}</span>
                        </div>
                        <div style={styles.tableRow}>
                          <span style={styles.tableLabel}>Department:</span>
                          <span style={styles.tableVal}>{lot.deptName}</span>
                        </div>
                        {lot.selectedColors ? (
                          <div style={styles.tableRow}>
                            <span style={styles.tableLabel}>Colors:</span>
                            <span style={styles.tableVal}>{lot.selectedColors}</span>
                          </div>
                        ) : null}
                        {lot.stitchingSupervisor ? (
                          <div style={styles.tableRow}>
                            <span style={styles.tableLabel}>Stitching Sup:</span>
                            <span style={styles.tableVal}>{lot.stitchingSupervisor}</span>
                          </div>
                        ) : null}
                        {lot.processes ? (
                          <div style={{ ...styles.tableRow, alignItems: 'flex-start' }}>
                            <span style={styles.tableLabel}>Processes:</span>
                            <div style={styles.tableProcessesWrap}>
                              {lot.processList && lot.processList.length > 0 ? (
                                lot.processList.map((proc, pIdx) => (
                                  <span key={pIdx} style={styles.tableProcessTag}>
                                    {proc}
                                  </span>
                                ))
                              ) : (
                                <span style={styles.tableVal}>{lot.processes}</span>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Timeline of WIP updates */}
                      <div style={styles.timelineBox}>
                        <div style={styles.timelineHeader}>
                          <span style={styles.timelineTitle}>Activity History</span>
                          <span style={styles.timelineCount}>
                            {lot.wipHistory?.length || 0} updates
                          </span>
                        </div>

                        {lot.wipHistory && lot.wipHistory.length > 0 ? (
                          <div style={styles.timelineList}>
                            {[...lot.wipHistory].reverse().map((item, idx) => (
                              <div key={idx} style={styles.timelineRow}>
                                <div style={styles.timelineDot} />
                                <div style={styles.timelineBody}>
                                  <div style={styles.timelineStatusRow}>
                                    <span style={styles.timelineStatusText}>{item.status}</span>
                                    <span style={styles.timelineDateText}>{formatTime(item.timestamp)}</span>
                                  </div>
                                  {item.remarks && (
                                    <p style={styles.timelineRemarksText}>"{item.remarks}"</p>
                                  )}
                                  <span style={styles.timelineAuthorText}>By {item.supervisor}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={styles.timelineEmpty}>No WIP updates recorded yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div style={styles.cardActions}>
                    {lot.isCompleted ? (
                      <>
                        <button
                          onClick={() => openReopenModal(lot)}
                          style={styles.actionBtnReopen}
                          className="touch-press"
                          title="Reopen this completed lot to pending category"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Reopen Lot</span>
                        </button>

                        <div style={styles.completedBadgePill}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Completed</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openUpdateModal(lot, 'wip')}
                          style={styles.actionBtnWip}
                          className="touch-press"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFFFFF" />
                          </svg>
                          <span>Update WIP</span>
                        </button>

                        <button
                          onClick={() => openUpdateModal(lot, 'complete')}
                          style={styles.actionBtnComplete}
                          className="touch-press"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Complete</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        const daysText = daysElapsed !== null
                          ? lot.isCompleted
                            ? `Completed in ${daysElapsed} day(s)`
                            : (daysElapsed === 0 ? 'Today (Day 1)' : `${daysElapsed} day(s)`)
                          : 'N/A';
                        const compText = lot.isCompleted && lot.completionDate ? `\n*Completion Date:* ${formatDate(lot.completionDate)}` : '';
                        const procText = lot.processes ? `\n*Processes:* ${lot.processes}` : '';
                        const text = `📋 *Lot #${lot.lotNumber} Report* (${lot.deptName})\n*Garment:* ${lot.garmentType}\n*Style:* ${lot.style}\n*Brand:* ${lot.brand || 'N/A'}\n*Quantity:* ${lot.totalPcs} pcs${procText}\n*Status:* ${lot.statusShort}\n*${lot.isCompleted ? 'Duration' : 'Days in Production'}:* ${daysText}\n*Supervisor:* ${lot.supervisor}\n*Issue Date:* ${formatDate(lot.operationDate)}${compText}`;
                        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                        window.open(url, '_blank');
                      }}
                      style={styles.actionBtnShare}
                      className="touch-press"
                      title="Share to WhatsApp"
                      aria-label="Share lot to WhatsApp"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      {/* Slide-Up Status Update Bottom Sheet */}
      {updateModal && (
        <div style={styles.sheetOverlay} onClick={() => !isUpdating && setUpdateModal(null)}>
          <div style={styles.sheet} onClick={e => e.stopPropagation()}>
            <div style={styles.sheetHandle} />

            <div style={styles.sheetHead}>
              <div>
                <h3 style={styles.sheetTitle}>
                  {updateStatusType === 'complete'
                    ? `Mark ${activeDept.shortName} Complete`
                    : `Update ${activeDept.shortName} WIP`}
                </h3>
                <span style={styles.sheetSubtitle}>
                  Lot #{updateModal.lot.lotNumber} • {updateModal.lot.garmentType} ({updateModal.lot.totalPcs} Pcs)
                </span>
              </div>
              <button
                onClick={() => !isUpdating && setUpdateModal(null)}
                style={styles.sheetClose}
              >
                ✕
              </button>
            </div>

            {updateMessage.text && (
              <div style={{
                ...styles.sheetAlert,
                backgroundColor: updateMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
                color: updateMessage.type === 'error' ? '#991b1b' : '#065f46',
                border: `1px solid ${updateMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
              }}>
                {updateMessage.text}
              </div>
            )}

            <div style={styles.sheetForm}>
              {/* Assigned Processes for this Lot */}
              {updateModal?.lot?.processList && updateModal.lot.processList.length > 0 && (
                <div style={styles.sheetProcessBox}>
                  <div style={styles.sheetProcessHeader}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginRight: '5px' }}>
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <span>Assigned Processes {updateStatusType === 'wip' ? '(Tap to select as WIP status)' : ''}</span>
                  </div>
                  <div style={styles.sheetProcessChips}>
                    {updateModal.lot.processList.map((proc, pIdx) => {
                      const isProcSelected = updateStatus === proc;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            if (updateStatusType !== 'complete') {
                              setUpdateStatus(proc);
                            }
                          }}
                          style={{
                            ...styles.sheetProcessChip,
                            ...(isProcSelected ? styles.sheetProcessChipSelected : {})
                          }}
                        >
                          <span style={{
                            ...styles.sheetProcessChipDot,
                            backgroundColor: isProcSelected ? '#ffffff' : '#2563EB'
                          }} />
                          {proc}
                          {isProcSelected && <span style={{ marginLeft: '4px' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <label style={styles.sheetLabel}>Select Status</label>

              <div style={styles.pillOptionsGrid}>
                {(updateStatusType === 'complete'
                  ? activeDept.completeOptions
                  : activeDept.wipOptions
                ).map((opt) => {
                  const isSelected = updateStatus === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setUpdateStatus(opt)}
                      style={{
                        ...styles.pillOpt,
                        ...(isSelected ? styles.pillOptSelected : {})
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {updateStatus === 'Other' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={styles.sheetLabel}>Specify Custom Status</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Process..."
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    style={styles.sheetInput}
                    autoFocus
                  />
                </div>
              )}

              <div style={{ marginTop: '14px' }}>
                <label style={styles.sheetLabel}>Supervisor Remarks (Optional)</label>
                <textarea
                  placeholder="Notes on quantity, delay, or special instructions..."
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  style={styles.sheetTextarea}
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  updateStatusSubmit(
                    updateStatusType,
                    updateModal.lot.lotNumber,
                    updateStatus,
                    updateRemarks
                  );
                }}
                disabled={isUpdating}
                className="touch-press"
                style={{
                  ...styles.sheetSubmitBtn,
                  backgroundColor: updateStatusType === 'complete' ? '#059669' : '#2563EB',
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                {isUpdating ? 'Saving to Database...' : 'Save Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Reopen Lot Bottom Sheet */}
      {reopenModal && (
        <div style={styles.sheetOverlay} onClick={() => !isReopening && setReopenModal(null)}>
          <div style={styles.sheet} onClick={e => e.stopPropagation()}>
            <div style={styles.sheetHandle} />

            <div style={styles.sheetHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={styles.reopenBadgeIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h3 style={styles.sheetTitle}>
                    Reopen Lot #{reopenModal.lot.lotNumber}
                  </h3>
                  <span style={styles.sheetSubtitle}>
                    {reopenModal.lot.garmentType} • Style: {reopenModal.lot.style} ({reopenModal.lot.totalPcs} pcs)
                  </span>
                </div>
              </div>
              <button
                onClick={() => !isReopening && setReopenModal(null)}
                style={styles.sheetClose}
              >
                ✕
              </button>
            </div>

            {reopenMessage.text && (
              <div style={{
                ...styles.sheetAlert,
                backgroundColor: reopenMessage.type === 'error' ? '#fef2f2' : '#ecfdf5',
                color: reopenMessage.type === 'error' ? '#991b1b' : '#065f46',
                border: `1px solid ${reopenMessage.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
              }}>
                {reopenMessage.text}
              </div>
            )}

            <div style={styles.sheetForm}>
              <div style={styles.reopenInfoNotice}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={styles.reopenInfoText}>
                  This lot will move back to the <strong>Pending</strong> category. After processing, you can mark it completed again.
                </div>
              </div>

              {/* Question: What process are you reopening this lot for? */}
              <label style={styles.sheetQuestionLabel}>
                What process are you reopening this lot for? <span style={{ color: '#dc2626' }}>*</span>
              </label>

              {/* Completed sheet processes chips (Locked/Disabled - Cannot Reopen) */}
              {reopenModal.lot.processList && reopenModal.lot.processList.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={styles.reopenChipsSubtitle}>
                      Original Sheet Processes (Already Completed):
                    </span>
                    <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#dc2626" strokeWidth="2.5" />
                        <path d="M7 11V7a5 5 0 0110 0v4" stroke="#dc2626" strokeWidth="2.5" />
                      </svg>
                      Cannot Reopen
                    </span>
                  </div>
                  <div style={styles.sheetProcessChips}>
                    {reopenModal.lot.processList.map((proc, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 11px',
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#94a3b8',
                          cursor: 'not-allowed',
                          userSelect: 'none'
                        }}
                        title={`"${proc}" is an original process for this lot and was already completed. You cannot reopen for this process.`}
                      >
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '800' }}>✓</span>
                        <span style={{ textDecoration: 'line-through' }}>{proc}</span>
                        <span style={{
                          fontSize: '9px',
                          backgroundColor: '#e2e8f0',
                          color: '#64748b',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          Completed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Department WIP operations (Filter/disable already completed ones) */}
              <div style={{ marginBottom: '12px' }}>
                <span style={styles.reopenChipsSubtitle}>Available Department Operations:</span>
                <div style={styles.pillOptionsGrid}>
                  {activeDept.wipOptions.filter(opt => opt !== 'Other').map((opt) => {
                    const isCompleted = (reopenModal.lot.processList || []).some(
                      p => areProcessesEquivalent(p, opt)
                    );
                    const isSelected = !isCompleted && areProcessesEquivalent(reopenProcess, opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isCompleted}
                        onClick={() => {
                          if (!isCompleted) setReopenProcess(opt);
                        }}
                        style={{
                          ...styles.pillOpt,
                          ...(isSelected ? styles.pillOptSelected : {}),
                          ...(isCompleted ? {
                            opacity: 0.45,
                            cursor: 'not-allowed',
                            textDecoration: 'line-through',
                            backgroundColor: '#f8fafc',
                            borderColor: '#e2e8f0',
                            color: '#94a3b8'
                          } : {})
                        }}
                        title={isCompleted ? `"${opt}" is already completed for this lot` : `Select ${opt}`}
                      >
                        {opt}
                        {isCompleted && ' 🔒'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Process Name Input */}
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.sheetLabel}>Reopening Process Name</label>
                <input
                  type="text"
                  placeholder="Enter or select process name..."
                  value={reopenProcess}
                  onChange={(e) => setReopenProcess(e.target.value)}
                  style={styles.sheetInput}
                />
              </div>

              {/* Remarks */}
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.sheetLabel}>Supervisor Remarks / Reason (Optional)</label>
                <textarea
                  placeholder="e.g. Alteration needed, Missing buttons, Extra pass required..."
                  value={reopenRemarks}
                  onChange={(e) => setReopenRemarks(e.target.value)}
                  style={styles.sheetTextarea}
                  rows={2}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => !isReopening && setReopenModal(null)}
                  disabled={isReopening}
                  style={styles.reopenCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReopenSubmit}
                  disabled={isReopening || !reopenProcess.trim()}
                  className="touch-press"
                  style={{
                    ...styles.sheetSubmitBtn,
                    backgroundColor: '#d97706',
                    flex: 2,
                    marginTop: 0,
                    opacity: (isReopening || !reopenProcess.trim()) ? 0.6 : 1,
                  }}
                >
                  {isReopening ? 'Reopening Lot...' : 'Confirm & Reopen to Pending'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Native Mobile Bottom Navigation Bar (Dynamic Department & Flow Navigation) */}
      <nav style={styles.bottomBar}>
        {accessibleDepts.length > 1 ? (
          /* Multiple Accessible Departments (e.g. Jaybir managing KajButton, Printing, Embroidery) */
          accessibleDepts.map((dept) => {
            const isActive = activeDeptId === dept.id;
            return (
              <button
                key={dept.id}
                style={{
                  ...styles.bottomBarItem,
                  ...(isActive ? styles.bottomBarItemActive : {})
                }}
                onClick={() => {
                  setActiveDeptId(dept.id);
                  setFilters(f => ({ ...f, status: 'all', search: '' }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="touch-press"
              >
                {renderDeptIcon(dept.id, isActive ? '#2563eb' : '#64748b')}
                <span style={{
                  ...styles.bottomBarLabel,
                  color: isActive ? '#2563eb' : '#64748b',
                  fontWeight: isActive ? '800' : '600'
                }}>
                  {dept.shortName}
                </span>
              </button>
            );
          })
        ) : (
          /* Single Department (e.g. Elastic, Bone, Washing, Folding) */
          <button
            style={{
              ...styles.bottomBarItem,
              ...styles.bottomBarItemActive
            }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="touch-press"
          >
            {renderDeptIcon(activeDept.id, '#2563eb')}
            <span style={{
              ...styles.bottomBarLabel,
              color: '#2563eb',
              fontWeight: '800'
            }}>
              {activeDept.shortName}
            </span>
          </button>
        )}

        {/* Button 3: View Scope (My Lots vs All Floor) */}
        <button
          style={styles.bottomBarItem}
          onClick={() => {
            setViewScope(s => s === 'my' ? 'all' : 'my');
          }}
          className="touch-press"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={viewScope === 'all' ? '#2563EB' : '#64748B'} strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke={viewScope === 'all' ? '#2563EB' : '#64748B'} strokeWidth="2" />
            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={viewScope === 'all' ? '#2563EB' : '#64748B'} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{
            ...styles.bottomBarLabel,
            color: viewScope === 'all' ? '#2563EB' : '#64748b',
            fontWeight: viewScope === 'all' ? '800' : '600'
          }}>
            {viewScope === 'my' ? 'My Lots' : 'All Floor'}
          </span>
        </button>

        {/* Button 4: Live Refresh */}
        <button
          style={styles.bottomBarItem}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="touch-press"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
            }}
          >
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              stroke={isRefreshing ? '#2563EB' : '#64748B'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{
            ...styles.bottomBarLabel,
            color: isRefreshing ? '#2563EB' : '#64748B'
          }}>
            Refresh
          </span>
        </button>

        {/* Button 5: Exit / Logout */}
        <button
          style={styles.bottomBarItem}
          onClick={onLogout}
          className="touch-press"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ ...styles.bottomBarLabel, color: '#ef4444' }}>Exit</span>
        </button>
      </nav>
    </div>
  );
};

const styles = {
  shell: {
    minHeight: '100vh',
    backgroundColor: '#f0f6ff',
    color: '#0f274a',
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
    paddingBottom: '88px',
  },
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f6ff',
    gap: '14px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #dbeafe',
    borderTopColor: '#2563EB',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '700',
  },

  // UNIFIED STICKY HEADER (Header + Tabs together, NO overlapping)
  unifiedHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dbeafe',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)',
    paddingTop: 'var(--safe-top)',
  },
  headerUserRow: {
    padding: '12px 16px 10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    border: '2px solid #bfdbfe',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  supervisorTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: '0.6px',
  },
  supervisorName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f274a',
    margin: 0,
    lineHeight: '1.2',
  },
  refreshBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
  },

  // Department Segmented Switcher (Smooth horizontal scrolling pill tabs)
  deptSegmentedBox: {
    margin: '0 12px 10px 12px',
    padding: '4px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    display: 'flex',
    gap: '6px',
    border: '1px solid #bfdbfe',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
  },
  deptSegmentBtn: {
    flex: '0 0 auto',
    padding: '7px 12px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#1e40af',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  deptSegmentBtnActive: {
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    fontWeight: '800',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.16)',
    border: '1px solid #bfdbfe',
  },
  homeDeptDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#059669',
    display: 'inline-block',
  },
  deptCountPill: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '1px 6px',
    borderRadius: '999px',
  },
  singleDeptBanner: {
    margin: '0 14px 10px 14px',
    padding: '8px 14px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(37, 99, 235, 0.06)',
  },
  singleDeptBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  singleDeptName: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#1d4ed8',
  },
  singleDeptCount: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#ffffff',
    backgroundColor: '#2563EB',
    padding: '2px 8px',
    borderRadius: '10px',
  },

  // Main Scroll Content
  main: {
    padding: '12px 14px 24px 14px',
    maxWidth: '480px',
    margin: '0 auto',
  },

  // Search & Filter Section
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  searchBar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '42px',
    padding: '0 34px 0 36px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #bfdbfe',
    borderRadius: '12px',
    fontSize: '13px',
    outline: 'none',
    color: '#0f274a',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.04)',
  },
  searchClearBtn: {
    position: 'absolute',
    right: '10px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  statusChipsRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  statusChipBtn: {
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.05)',
  },
  statusChipBtnActive: {
    backgroundColor: '#2563EB',
    border: '1px solid #2563EB',
    color: '#ffffff',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
  },

  // Error Alert
  errorNotification: {
    padding: '10px 12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  retryAction: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },

  // Lots List
  lotsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px dashed #bfdbfe',
    padding: '36px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.04)',
  },
  emptyIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px auto',
  },
  emptyHeadline: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f274a',
    margin: '0 0 4px 0',
  },
  emptyDesc: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },

  // GORGEOUS, POLISHED CARD (Blue & White Theme)
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #dbeafe',
    boxShadow: '0 4px 16px -2px rgba(37, 99, 235, 0.07), 0 2px 6px -1px rgba(15, 39, 74, 0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  cardRedZone: {
    border: '1.5px solid #f87171',
    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.18)',
  },
  redZoneBanner: {
    backgroundColor: '#dc2626',
    padding: '4px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.4px',
  },
  redZoneBannerText: {
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardTopRow: {
    padding: '12px 14px 6px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '6px',
  },
  lotNumberGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  lotNumberBadge: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.4px',
    boxShadow: '0 2px 5px rgba(29, 78, 216, 0.25)',
  },
  brandTag: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  daysBadge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 7px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },

  // Title Block
  cardTitleBlock: {
    padding: '4px 14px 8px 14px',
  },
  garmentTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f274a',
    margin: '0 0 2px 0',
    lineHeight: '1.2',
  },
  styleLine: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '500',
    margin: 0,
  },
  stylePrefix: {
    color: '#2563eb',
    fontWeight: '700',
  },

  // Processes Strip on Lot Card
  processStrip: {
    margin: '0 14px 10px 14px',
    backgroundColor: '#f8fafd',
    border: '1px solid #dbeafe',
    borderRadius: '10px',
    padding: '8px 10px',
  },
  processStripHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
  },
  processStripLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
  },
  processChipsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  processChip: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  processDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
  },

  // 3-Column Structured Spec Box (Ice Blue / White)
  specsBox: {
    margin: '0 14px 10px 14px',
    backgroundColor: '#f4f8fe',
    border: '1px solid #dbeafe',
    borderRadius: '12px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  specCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  specColLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  specColValueBold: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0f274a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  specPcsUnit: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2563eb',
  },
  specColValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1e3a8a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  specDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#dbeafe',
    margin: '0 8px',
    flexShrink: 0,
  },
  specChevronBox: {
    paddingLeft: '4px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Accordion
  cardAccordion: {
    padding: '12px 14px',
    backgroundColor: '#f8fbff',
    borderTop: '1px solid #dbeafe',
    borderBottom: '1px solid #dbeafe',
  },
  detailsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  tableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  tableLabel: {
    color: '#64748b',
    fontWeight: '600',
  },
  tableVal: {
    color: '#0f274a',
    fontWeight: '700',
  },
  tableProcessesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    justifyContent: 'flex-end',
    maxWidth: '65%',
  },
  tableProcessTag: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },

  // Timeline
  timelineBox: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #dbeafe',
    padding: '10px 12px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  timelineTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1e3a8a',
  },
  timelineCount: {
    fontSize: '10px',
    color: '#64748b',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  timelineRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2563EB',
    marginTop: '5px',
    flexShrink: 0,
  },
  timelineBody: {
    flex: 1,
  },
  timelineStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  timelineStatusText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0f274a',
  },
  timelineDateText: {
    fontSize: '10px',
    color: '#64748b',
  },
  timelineRemarksText: {
    fontSize: '11px',
    color: '#475569',
    margin: '2px 0',
  },
  timelineAuthorText: {
    fontSize: '10px',
    color: '#64748b',
  },
  timelineEmpty: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0,
  },

  // Modern Mobile KPI Stats Carousel / Stat Pills
  statsPillRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    paddingBottom: '2px',
  },
  statPillCard: {
    flex: '1 1 0px',
    minWidth: '100px',
    padding: '8px 10px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.04)',
  },
  statPillIconBox: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statPillInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statPillValue: {
    fontSize: '15px',
    fontWeight: '800',
    lineHeight: '1.1',
  },
  statPillLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#64748b',
    marginTop: '1px',
    whiteSpace: 'nowrap',
  },

  // Skeleton Card
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #dbeafe',
    padding: '16px',
    boxShadow: '0 4px 16px -2px rgba(37, 99, 235, 0.05)',
  },

  // Actions (Blue and White Theme)
  cardActions: {
    padding: '0 14px 12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionBtnWip: {
    flex: 1,
    height: '40px',
    backgroundColor: '#2563EB',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
  },
  actionBtnComplete: {
    flex: 1,
    height: '40px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #2563EB',
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
  },
  actionBtnReopen: {
    flex: 1,
    height: '40px',
    backgroundColor: '#fffbeb',
    border: '1.5px solid #f59e0b',
    color: '#b45309',
    fontSize: '13px',
    fontWeight: '800',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  completedBadgePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 12px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    fontSize: '13px',
    fontWeight: '700',
    flex: 1,
    justifyContent: 'center',
  },
  reopenedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.2px',
  },
  actionBtnShare: {
    width: '40px',
    height: '40px',
    backgroundColor: '#eff6ff',
    border: '1.5px solid #bfdbfe',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)',
  },
  sheetQuestionLabel: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
    marginTop: '4px',
  },
  reopenChipsSubtitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    display: 'block',
    marginBottom: '6px',
  },
  reopenInfoNotice: {
    display: 'flex',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    marginBottom: '14px',
    alignItems: 'flex-start',
  },
  reopenInfoText: {
    fontSize: '12px',
    color: '#92400e',
    lineHeight: '1.4',
  },
  reopenBadgeIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reopenCancelBtn: {
    flex: 1,
    height: '46px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '10px',
    cursor: 'pointer',
  },

  // Bottom Sheet Modal
  sheetOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '14px 18px',
    paddingBottom: 'calc(18px + var(--safe-bottom))',
    boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
    animation: 'slideUp 0.25s ease',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  sheetHandle: {
    width: '36px',
    height: '4px',
    backgroundColor: '#cbd5e1',
    borderRadius: '999px',
    margin: '0 auto 12px auto',
  },
  sheetHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  sheetTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 2px 0',
  },
  sheetSubtitle: {
    fontSize: '12px',
    color: '#64748b',
  },
  sheetClose: {
    fontSize: '16px',
    color: '#94a3b8',
    padding: '4px',
  },
  sheetAlert: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid',
    marginBottom: '12px',
  },
  sheetForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  sheetProcessBox: {
    marginBottom: '14px',
    padding: '10px 12px',
    backgroundColor: '#f0f7ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
  },
  sheetProcessHeader: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sheetProcessChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  sheetProcessChip: {
    backgroundColor: '#ffffff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    fontSize: '12px',
    fontWeight: '700',
    padding: '5px 10px',
    borderRadius: '7px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sheetProcessChipSelected: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderColor: '#1d4ed8',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
  },
  sheetProcessChipDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
  sheetLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
  },
  pillOptionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  pillOpt: {
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  pillOptSelected: {
    backgroundColor: '#2563EB',
    color: '#ffffff',
    border: '1px solid #2563EB',
  },
  sheetInput: {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
  },
  sheetTextarea: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
  },
  sheetSubmitBtn: {
    width: '100%',
    height: '46px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '10px',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Bar
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #dbeafe',
    boxShadow: '0 -4px 16px rgba(37, 99, 235, 0.05)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '6px 4px',
    paddingBottom: 'calc(6px + var(--safe-bottom))',
    zIndex: 90,
  },
  bottomBarItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 6px',
    borderRadius: '10px',
    transition: 'all 0.15s ease',
  },
  bottomBarItemActive: {
    transform: 'scale(1.05)',
  },
  bottomBarLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.2px',
  },
};

export default Dashboard;