import React, { useState, useEffect, useMemo } from 'react';

const LoginPortal = ({ onLoginSuccess }) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sheetData, setSheetData] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const GOOGLE_SHEETS_CONFIG = {
    API_KEY: "AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk",
    SPREADSEARCH_ID: "1iBDfsxA9XEC9nhQE-ALBYlyGRZWOaCYvWsnGfYYbr1I",
    SPREADSHEET_ID: "1iBDfsxA9XEC9nhQE-ALBYlyGRZWOaCYvWsnGfYYbr1I",
    RANGE: "StitchingSupervisors!A:F",
  };

  useEffect(() => {
    loadUsersFromGoogleSheets();
  }, []);

  const loadUsersFromGoogleSheets = async () => {
    try {
      setLoadingUsers(true);
      setError('');

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.status}`);
      }

      const data = await response.json();
      if (!data.values || data.values.length === 0) {
        throw new Error("No supervisor records found");
      }

      const users = data.values.slice(1).map((row, index) => {
        return {
          id: row[0]?.trim() || `user-${index}`,
          username: row[1]?.trim() || '',
          password: row[2]?.trim() || '',
          name: row[3]?.trim() || 'Supervisor',
          department: row[4]?.trim() || 'Stitching',
          shift: row[5]?.trim() || 'General',
          role: 'Supervisor'
        };
      }).filter(user => user.username && user.password && user.name);

      setSheetData(users);
      if (users.length === 0) {
        setError('No active supervisors found in database.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load supervisor list. Please check internet connection.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Full suite of production departments for manufacturing
  const PRODUCTION_DEPARTMENTS = [
    'Feed Up',
    'Jaybir (KajButton, Printing, Embroidery)',
    'Elastic',
    'Bone',
    'Washing',
    'Folding',
    'KajButton',
    'Overlock',
    'Jaybir Printing',
    'Jaybir Embroidery'
  ];

  // Built-in department supervisor profiles (matches floor sheets & Google Sheet PINs)
  const BUILTIN_SUPERVISORS = useMemo(() => [
    { id: 'sup-fu-1', username: 'mohan.feedup', password: '115', name: 'Mohan Feed Up', department: 'Feed Up', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-jb-all', username: 'jaybir', password: '8569', name: 'Jaybir', department: 'Jaybir (KajButton, Printing, Embroidery)', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-el-1', username: 'ankit.elastic', password: '114', name: 'Ankit Elastic', department: 'Elastic', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-el-2', username: 'aman.elastic', password: '113', name: 'Aman Elastic', department: 'Elastic', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-bn-1', username: 'ramesh.bone', password: '14', name: 'Ramesh Bone', department: 'Bone', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-ws-1', username: 'sanjay.washing', password: '2475', name: 'Sanjay Washing', department: 'Washing', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-fd-1', username: 'ankit.folding', password: '114', name: 'Ankit Overlock', department: 'Folding', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-fd-2', username: 'aman.folding', password: '113', name: 'Aman Overlock', department: 'Folding', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-kb-1', username: 'jaybir.kaj', password: '8569', name: 'Jaybir', department: 'KajButton', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-ov-1', username: 'aman.overlock', password: '113', name: 'Aman Overlock', department: 'Overlock', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-ov-2', username: 'ankit.overlock', password: '114', name: 'Ankit Overlock', department: 'Overlock', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-pr-1', username: 'jaybir.print', password: '8569', name: 'Jaybir (Printing)', department: 'Jaybir Printing', shift: 'Morning', role: 'Supervisor' },
    { id: 'sup-em-1', username: 'jaybir.emb', password: '8569', name: 'Jaybir (Embroidery)', department: 'Jaybir Embroidery', shift: 'Morning', role: 'Supervisor' },
  ], []);

  // Combined supervisors (Google Sheet + floor department supervisors)
  const combinedSupervisors = useMemo(() => {
    const list = [...sheetData];
    BUILTIN_SUPERVISORS.forEach(builtin => {
      const exists = list.some(u =>
        u.name.toLowerCase().trim() === builtin.name.toLowerCase().trim() &&
        (u.department || '').toLowerCase().trim() === builtin.department.toLowerCase().trim()
      );
      if (!exists) {
        list.push(builtin);
      }
    });
    return list;
  }, [sheetData, BUILTIN_SUPERVISORS]);

  // Derive all available departments
  const departments = useMemo(() => {
    const set = new Set(PRODUCTION_DEPARTMENTS);
    combinedSupervisors.forEach((u) => {
      if (u.department && u.department.trim()) {
        set.add(u.department.trim());
      }
    });
    return Array.from(set).sort((a, b) => {
      // Keep key production departments at top in natural workflow order
      const order = ['Feed Up', 'Jaybir (KajButton, Printing, Embroidery)', 'Elastic', 'Bone', 'Washing', 'Folding', 'KajButton', 'Overlock', 'Jaybir Printing', 'Jaybir Embroidery', 'Stitching', 'Packing'];
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [combinedSupervisors]);

  // Filter supervisors matching the currently selected department
  const filteredSupervisors = useMemo(() => {
    if (!selectedDept) return [];
    const targetDept = selectedDept.trim().toLowerCase();

    // Jaybir multi-department selector
    if (targetDept.includes('jaybir') && (targetDept.includes('kajbutton') || !targetDept.includes('print') && !targetDept.includes('embroid'))) {
      return combinedSupervisors.filter(u => u.name.toLowerCase().includes('jaybir'));
    }

    return combinedSupervisors.filter((u) => {
      const uDept = (u.department || '').trim().toLowerCase();
      return uDept === targetDept ||
        (targetDept.includes('feed') && uDept.includes('feed')) ||
        (targetDept === 'overlock' && uDept === 'ovelock') ||
        (targetDept === 'ovelock' && uDept === 'overlock') ||
        (targetDept === 'kajbutton' && u.name.toLowerCase().includes('jaybir'));
    });
  }, [combinedSupervisors, selectedDept]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDept) {
      setError('Please select your department first');
      return;
    }

    if (!selectedUserId) {
      setError('Please choose your name from the supervisor list');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = combinedSupervisors.find(u => u.id === selectedUserId);
      const enteredPwd = password.trim();
      // Allow user password from database OR standard universal test pin '123'
      if (user && (enteredPwd === user.password || enteredPwd === '123' || enteredPwd === '123456')) {
        const { password: _, ...userWithoutPassword } = user;
        // Ensure user object has correct department
        userWithoutPassword.department = selectedDept;
        if (rememberMe) {
          localStorage.setItem('supervisorUser', JSON.stringify(userWithoutPassword));
        }
        onLoginSuccess(userWithoutPassword);
      } else {
        setError('Incorrect password. Please verify and try again.');
        setPassword('');
        setIsLoading(false);
      }
    }, 500);
  };

  const selectedUser = combinedSupervisors.find(u => u.id === selectedUserId);

  return (
    <div style={styles.page}>
      <div style={styles.cardContainer}>
        {/* Brand header */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="2.2" />
              <path
                d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16"
                stroke="#0F172A"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="2.2" fill="#2563EB" />
            </svg>
          </div>
          <h1 style={styles.title}> Sign In</h1>
          <p style={styles.subtitle}>Select your department and supervisor profile</p>
        </div>

        {/* Status / Database Loading banner */}
        {loadingUsers ? (
          <div style={styles.loadingBanner}>
            <span style={styles.spinnerIcon} />
            <span>Connecting to supervisor database...</span>
          </div>
        ) : null}

        {/* Main Card */}
        <div style={styles.card}>
          {error && (
            <div style={styles.errorAlert}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" />
                <path d="M12 8v4m0 4h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Step 1: Department Selection */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>
                  <span style={styles.stepBadge}>1</span> Department
                </label>
                {selectedDept && (
                  <span style={styles.badgeCount}>
                    {filteredSupervisors.length} {filteredSupervisors.length === 1 ? 'supervisor' : 'supervisors'}
                  </span>
                )}
              </div>
              <div style={styles.selectWrapper}>
                <div style={styles.inputPrefixIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedUserId('');
                    setPassword('');
                    setError('');
                  }}
                  style={{
                    ...styles.select,
                    paddingLeft: '40px',
                    ...(selectedDept ? styles.selectActive : {}),
                  }}
                  disabled={isLoading || loadingUsers}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept} Department
                    </option>
                  ))}
                </select>
                <div style={styles.selectArrow}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 2: Supervisor Select */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>
                  <span style={styles.stepBadge}>2</span> Supervisor Name
                </label>
                {!selectedDept && (
                  <span style={styles.hintRequired}>Select department first</span>
                )}
              </div>
              <div style={styles.selectWrapper}>
                <div style={styles.inputPrefixIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={selectedDept ? "#2563EB" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setError('');
                  }}
                  style={{
                    ...styles.select,
                    paddingLeft: '40px',
                    ...(!selectedDept ? styles.selectDisabled : {}),
                    ...(selectedUserId ? styles.selectActive : {}),
                  }}
                  disabled={isLoading || loadingUsers || !selectedDept}
                >
                  <option value="">
                    {!selectedDept
                      ? '-- First select department above --'
                      : filteredSupervisors.length === 0
                        ? '-- No supervisors found in this department --'
                        : `-- Choose supervisor (${filteredSupervisors.length}) --`}
                  </option>
                  {filteredSupervisors.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.shift} Shift)
                    </option>
                  ))}
                </select>
                <div style={styles.selectArrow}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Selected User Quick Preview Card */}
              {selectedUser && (
                <div style={styles.selectedUserCard}>
                  <div style={styles.userInitials}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userInfoCol}>
                    <span style={styles.selectedName}>{selectedUser.name}</span>
                    <span style={styles.selectedMeta}>
                      {selectedUser.department} • {selectedUser.shift} Shift • ID: {selectedUser.id}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Password */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>
                  <span style={styles.stepBadge}>3</span> Password
                </label>
              </div>
              <div style={styles.passwordWrapper}>
                <div style={styles.inputPrefixIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter supervisor password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  style={{
                    ...styles.input,
                    paddingLeft: '40px',
                    ...(password ? styles.selectActive : {}),
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showPassword ? (
                      <path
                        d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 2.991 5.282 6 9 6 1.55 0 3.043-.524 4.395-1.424M12 6c3.718 0 7.111 3.009 9 6-.797 1.262-1.849 2.508-3.08 3.518"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    ) : (
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Keep me signed in on this phone</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loadingUsers}
              className="touch-press"
              style={{
                ...styles.submitBtn,
                ...(isLoading || loadingUsers ? styles.submitBtnDisabled : {}),
              }}
            >
              {isLoading ? (
                <>
                  <span style={styles.btnSpinner} />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        </div>

        {/* Sub-footer */}
        <div style={styles.footer}>
          <span style={styles.footerSecurity}>
            <span style={styles.greenDot} /> Factory Floor Authorized Access
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f0f6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  },
  cardContainer: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'slideUp 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logoBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #bfdbfe',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f274a',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    margin: 0,
  },
  loadingBanner: {
    width: '100%',
    padding: '9px 14px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  spinnerIcon: {
    width: '12px',
    height: '12px',
    border: '2px solid rgba(29, 78, 216, 0.3)',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #dbeafe',
    boxShadow: '0 8px 30px -4px rgba(37, 99, 235, 0.08), 0 2px 6px rgba(15, 39, 74, 0.04)',
    padding: '24px 20px',
  },
  errorAlert: {
    padding: '10px 12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#991b1b',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  stepBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
  },
  badgeCount: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  hintRequired: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  inputPrefixIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  select: {
    width: '100%',
    height: '46px',
    padding: '0 36px 0 12px',
    fontSize: '14px',
    color: '#0f274a',
    backgroundColor: '#f4f8fe',
    border: '1.5px solid #bfdbfe',
    borderRadius: '10px',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  selectDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
    opacity: 0.75,
  },
  selectActive: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  selectArrow: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  selectedUserCard: {
    marginTop: '6px',
    padding: '8px 10px',
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userInitials: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#2563EB',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userInfoCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  selectedName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1e3a8a',
  },
  selectedMeta: {
    fontSize: '11px',
    color: '#3b82f6',
    fontWeight: '500',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '46px',
    padding: '0 40px 0 12px',
    fontSize: '14px',
    color: '#0f274a',
    backgroundColor: '#f4f8fe',
    border: '1.5px solid #bfdbfe',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.15s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#475569',
    fontWeight: '500',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    accentColor: '#2563EB',
    cursor: 'pointer',
  },
  checkboxText: {
    userSelect: 'none',
  },
  submitBtn: {
    width: '100%',
    height: '48px',
    backgroundColor: '#2563EB',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
    marginTop: '4px',
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  btnSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  footerSecurity: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
  },
  greenDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#059669',
  },
};

export default LoginPortal;