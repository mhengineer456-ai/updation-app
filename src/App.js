import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from './Components/SplashScreen';
import Dashboard from './Components/Dashboard';
import LoginPortal from './Components/LoginPortal';

// Helper function to create a <style> block for CSS-in-JS
const createStyleTag = (styles) => {
    let styleString = '';
    for (const selector in styles) {
        if (selector.startsWith('@keyframes')) {
            // Handle Keyframes
            styleString += `${selector} {`;
            for (const keyframe in styles[selector]) {
                styleString += `${keyframe} {`;
                for (const prop in styles[selector][keyframe]) {
                    styleString += `${prop}:${styles[selector][keyframe][prop]};`;
                }
                styleString += `}`;
            }
            styleString += `}`;
        } else if (selector.startsWith('.')) {
            // Handle Class Selectors (for :hover support)
            styleString += `${selector} {`;
            for (const prop in styles[selector]) {
                styleString += `${prop}:${styles[selector][prop]};`;
            }
            styleString += `}`;
        }
    }
    return <style>{styleString}</style>;
};

const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    process.env.NODE_ENV === 'development'
);

function App() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isWithinOperatingHours, setIsWithinOperatingHours] = useState(true);
    const [isWithinAllowedLocation, setIsWithinAllowedLocation] = useState(isDevelopment);
    const [locationError, setLocationError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [distanceFromOrg, setDistanceFromOrg] = useState(null);
    const [devBypass, setDevBypass] = useState(isDevelopment);
    const locationIntervalRef = useRef(null);
   
    // Operating hours: 10:00 AM to 8:00 PM (20:00 in 24-hour format)
    const OPERATING_HOURS = {
        start: 10, // 10:00 AM
        end: 20,    // 8:00 PM (20:00)
    };

    // Your organization's coordinates (Punjab, India)
    const ALLOWED_LOCATION = {
        latitude: 30.9544768,  // Your organization's latitude
        longitude: 75.8577128, // Your organization's longitude
        radius: 70, // 70 meters radius around your organization
        organizationName: "Your Organization",
        address: "Your Organization Address, Punjab, India"
    };

    // Check if current time is within operating hours
    const checkOperatingHours = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInHours = currentHour + (currentMinutes / 60);
        
        // Check if current time is between 10:00 AM and 8:00 PM
        const isWithinHours = currentTimeInHours >= OPERATING_HOURS.start && 
                             currentTimeInHours < OPERATING_HOURS.end;
        
        setIsWithinOperatingHours(isWithinHours);
        return isWithinHours;
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };

    // Check if user is within allowed location
    const checkLocation = (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        setUserLocation({
            latitude: userLat,
            longitude: userLng
        });
        
        const distance = calculateDistance(
            userLat,
            userLng,
            ALLOWED_LOCATION.latitude,
            ALLOWED_LOCATION.longitude
        );
        
        setDistanceFromOrg(distance);
        
        const isWithinLocation = distance <= ALLOWED_LOCATION.radius;
        setIsWithinAllowedLocation(isWithinLocation);
        
        return isWithinLocation;
    };

    // Get user's current location with safety timeout
    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser. Please use a modern browser."));
                return;
            }

            // Fallback timeout so app never hangs indefinitely waiting for prompt
            const timeoutId = setTimeout(() => {
                reject(new Error("Location request timed out. Please allow location access or check GPS."));
            }, 6000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve(position);
                },
                (error) => {
                    clearTimeout(timeoutId);
                    let errorMessage = "Unable to retrieve your location";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access is required to use this system. Please enable location services in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Your location could not be determined. Please check your device's GPS or network connection.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out. Please ensure you have a stable internet connection.";
                            break;
                        default:
                            errorMessage = error.message || "Location request failed";
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: false, // Prevents hanging on desktops/laptops without GPS
                    timeout: 6000,
                    maximumAge: 60000
                }
            );
        });
    };

    // Watch user location continuously (for authenticated users)
    const startLocationWatching = () => {
        if (isDevelopment || devBypass) return;
        if (navigator.geolocation && isAuthenticated) {
            locationIntervalRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const isInLocation = checkLocation(position);
                    if (!isInLocation) {
                        alert(`You have moved outside the organization premises (${distanceFromOrg ? distanceFromOrg.toFixed(0) : ''}m away). Access revoked.`);
                        handleLogout();
                    }
                },
                (error) => {
                    console.warn("Location watch error:", error);
                    // Don't logout immediately for watch errors
                },
                {
                    enableHighAccuracy: false,
                    maximumAge: 30000, // Accept position up to 30 seconds old
                    timeout: 10000
                }
            );
        }
    };

    // Stop watching location
    const stopLocationWatching = () => {
        if (locationIntervalRef.current && navigator.geolocation) {
            navigator.geolocation.clearWatch(locationIntervalRef.current);
            locationIntervalRef.current = null;
        }
    };

    // Handle splash screen completion
    const handleLoadingComplete = async () => {
        if (isDevelopment || devBypass) {
            setIsWithinOperatingHours(true);
            setIsWithinAllowedLocation(true);
            setLocationError(null);
            setLoading(false);
            return;
        }

        try {
            // Check location first with timeout
            const position = await getUserLocation();
            const isInLocation = checkLocation(position);
            
            // Check operating hours
            const isInTime = checkOperatingHours();
            
            if (isInLocation && isInTime) {
                setLocationError(null);
            } else if (isAuthenticated) {
                handleLogout();
            }
        } catch (error) {
            console.error("Location error:", error);
            setLocationError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle successful login
    const handleLoginSuccess = async (user) => {
        if (isDevelopment || devBypass) {
            setUserData(user);
            setIsAuthenticated(true);
            localStorage.setItem('supervisorUser', JSON.stringify(user));
            setLocationError(null);
            return;
        }

        try {
            // Check location first
            const position = await getUserLocation();
            const isInLocation = checkLocation(position);
            
            // Check operating hours
            const isInTime = checkOperatingHours();
            
            if (isInLocation && isInTime) {
                setUserData(user);
                setIsAuthenticated(true);
                localStorage.setItem('supervisorUser', JSON.stringify(user));
                setLocationError(null);
                
                // Start watching location after successful login
                startLocationWatching();
            } else {
                let errorMessage = "";
                if (!isInLocation) {
                    errorMessage = `This system can only be accessed from within ${ALLOWED_LOCATION.organizationName} premises. `;
                    errorMessage += `You are ${distanceFromOrg !== null ? distanceFromOrg.toFixed(0) : 'unknown'} meters away from the authorized location.`;
                } else if (!isInTime) {
                    errorMessage = `System is only available from ${OPERATING_HOURS.start}:00 AM to ${OPERATING_HOURS.end-12}:00 PM`;
                }
                alert(errorMessage);
            }
        } catch (error) {
            alert(`Location access required: ${error.message}`);
        }
    };

    // Handle logout
    const handleLogout = () => {
        stopLocationWatching();
        setIsAuthenticated(false);
        setUserLocation(null); // Clear location data on logout
        setUserData(null);
        localStorage.removeItem('supervisorUser');
    };

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const savedUser = localStorage.getItem('supervisorUser');
            
            if (savedUser) {
                if (isDevelopment || devBypass) {
                    try {
                        setUserData(JSON.parse(savedUser));
                        setIsAuthenticated(true);
                        setLocationError(null);
                    } catch (e) {
                        localStorage.removeItem('supervisorUser');
                    }
                    return;
                }

                try {
                    // Check location
                    const position = await getUserLocation();
                    const isInLocation = checkLocation(position);
                    
                    // Check operating hours
                    const isInTime = checkOperatingHours();
                    
                    if (isInLocation && isInTime) {
                        setUserData(JSON.parse(savedUser));
                        setIsAuthenticated(true);
                        setLocationError(null);
                        
                        // Start watching location
                        startLocationWatching();
                    } else {
                        localStorage.removeItem('supervisorUser');
                        let errorMessage = "";
                        if (!isInLocation) {
                            errorMessage = `Must be at ${ALLOWED_LOCATION.organizationName} to access. You are ${distanceFromOrg !== null ? distanceFromOrg.toFixed(0) : 'N/A'}m away.`;
                        } else if (!isInTime) {
                            errorMessage = `Outside operating hours (${OPERATING_HOURS.start}:00 AM to ${OPERATING_HOURS.end-12}:00 PM)`;
                        }
                        alert(`${errorMessage} Session expired.`);
                    }
                } catch (error) {
                    console.error("Session validation error:", error);
                    setLocationError(error.message);
                    localStorage.removeItem('supervisorUser');
                }
            }
        };

        checkSession();

        // Cleanup on unmount
        return () => {
            stopLocationWatching();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array prevents re-render loop

    // Component to display when conditions are not met
    const RestrictionMessage = () => {
        const getRestrictionMessage = () => {
            if (locationError) {
                return {
                    title: "Location Access Required",
                    icon: "⚠️",
                    message: locationError
                };
            } else if (!isWithinOperatingHours && !isWithinAllowedLocation) {
                return {
                    title: "Access Restricted",
                    icon: "🔒",
                    message: `System is only accessible from ${ALLOWED_LOCATION.organizationName} premises during working hours (${OPERATING_HOURS.start}:00 AM to ${OPERATING_HOURS.end-12}:00 PM).`
                };
            } else if (!isWithinOperatingHours) {
                return {
                    title: "Outside Working Hours",
                    icon: "⏳",
                    message: `This system operates from ${OPERATING_HOURS.start}:00 AM to ${OPERATING_HOURS.end-12}:00 PM only. Please return during working hours.`
                };
            } else if (!isWithinAllowedLocation) {
                return {
                    title: "Location Restricted",
                    icon: "📍",
                    message: `This system can only be accessed from within ${ALLOWED_LOCATION.organizationName} premises.`
                };
            }
            return null;
        };

        const restriction = getRestrictionMessage();
        
        if (!restriction) return null;

        return (
            <div style={enhancedStyles.restrictionContainer}>
                {createStyleTag(enhancedStyles)}
                <div style={enhancedStyles.iconContainer}>
                    <span style={enhancedStyles.icon}>{restriction.icon}</span>
                </div>
                <h1 style={enhancedStyles.title}>{restriction.title}</h1>
                <p style={enhancedStyles.message}>{restriction.message}</p>
                
                {userLocation && (
                    <div style={enhancedStyles.locationInfo}>
                        <h3 style={enhancedStyles.locationTitle}>Geolocation Details:</h3>
                        <div style={enhancedStyles.locationGrid}>
                            <div style={enhancedStyles.locationColumn}>
                                <h4>Your Current Location:</h4>
                                <p><strong>Latitude:</strong> {userLocation.latitude.toFixed(6)}</p>
                                <p><strong>Longitude:</strong> {userLocation.longitude.toFixed(6)}</p>
                                {distanceFromOrg !== null && (
                                    <p><strong>Distance from org:</strong> {distanceFromOrg.toFixed(0)} meters</p>
                                )}
                            </div>
                            <div style={enhancedStyles.locationColumn}>
                                <h4>{ALLOWED_LOCATION.organizationName}:</h4>
                                <p><strong>Latitude:</strong> {ALLOWED_LOCATION.latitude}</p>
                                <p><strong>Longitude:</strong> {ALLOWED_LOCATION.longitude}</p>
                                <p><strong>Allowed radius:</strong> {ALLOWED_LOCATION.radius} meters</p>
                                <p><strong>Address:</strong> {ALLOWED_LOCATION.address}</p>
                            </div>
                        </div>
                        
                        {distanceFromOrg !== null && distanceFromOrg > ALLOWED_LOCATION.radius && (
                            <div style={enhancedStyles.warningBox}>
                                ⚠️ **Action Required:** You need to move {(distanceFromOrg - ALLOWED_LOCATION.radius).toFixed(0)} meters closer to access the system.
                            </div>
                        )}
                    </div>
                )}
                
                <div style={enhancedStyles.buttonContainer}>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="refreshButton"
                        style={enhancedStyles.refreshButton}
                    >
                        🔄 Retry
                    </button>
                    {navigator.geolocation && (
                        <button 
                            onClick={async () => {
                                try {
                                    const position = await getUserLocation();
                                    checkLocation(position);
                                    checkOperatingHours();
                                } catch (error) {
                                    setLocationError(error.message);
                                }
                            }} 
                            className="locationButton"
                            style={enhancedStyles.locationButton}
                        >
                            📍 Update My Location
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            // Corrected Google Maps URL for opening
                            const url = `https://maps.google.com/?q=${ALLOWED_LOCATION.latitude},${ALLOWED_LOCATION.longitude}`;
                            window.open(url, '_blank');
                        }} 
                        className="mapsButton"
                        style={enhancedStyles.mapsButton}
                    >
                        🗺️ Directions to Organization
                    </button>
                    {(isDevelopment || !devBypass) && (
                        <button 
                            onClick={() => {
                                setDevBypass(true);
                                setIsWithinAllowedLocation(true);
                                setIsWithinOperatingHours(true);
                                setLocationError(null);
                            }}
                            className="devBypassButton"
                            style={{
                                ...baseButton,
                                backgroundColor: '#3b82f6',
                                color: 'white',
                            }}
                        >
                            🚀 Dev Mode: Bypass Restrictions
                        </button>
                    )}
                </div>
                
                <div style={enhancedStyles.helpText}>
                    <p style={enhancedStyles.helpTitle}>💡 <strong>Tips for Location Access:</strong></p>
                    <ul style={enhancedStyles.tipsList}>
                        <li>Ensure **GPS** is enabled on your device.</li>
                        <li>Grant **location permissions** to your browser/app.</li>
                        <li>For best results, connect to the organization's **Wi-Fi**.</li>
                    </ul>
                </div>
            </div>
        );
    };

    const canAccessApp = devBypass || (isWithinOperatingHours && isWithinAllowedLocation && !locationError);

    return (
        <>
            {loading ? (
                <SplashScreen onLoadingComplete={handleLoadingComplete} />
            ) : isAuthenticated ? (
                canAccessApp ? (
                    <Dashboard user={userData} onLogout={handleLogout} />
                ) : (
                    <RestrictionMessage />
                )
            ) : (
                canAccessApp ? (
                    <LoginPortal onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <RestrictionMessage />
                )
            )}
        </>
    );
}

// 1. Define Base Button Style
const baseButton = {
    padding: '14px 30px',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
};

// 2. Define the Enhanced Styles Object
const enhancedStyles = {
    // Keyframes
    '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' },
        '100%': { transform: 'scale(1)' },
    },
    '@keyframes fadeIn': {
        '0%': { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    
    // Main Container
    restrictionContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '50px 20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #1f4068 0%, #162447 100%)', // Professional deep blue gradient
        color: '#f0f0f0',
        animation: 'fadeIn 1s ease-out',
        boxSizing: 'border-box',
    },
    
    // Icon and Title
    iconContainer: {
        fontSize: '100px',
        marginBottom: '20px',
        animation: 'pulse 2s infinite',
        color: '#ffc107', // Gold/Yellow for attention
    },
    icon: {
        display: 'inline-block',
    },
    title: {
        fontSize: '3rem',
        marginBottom: '10px',
        fontWeight: '700',
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        color: '#ffffff',
    },
    message: {
        fontSize: '1.25rem',
        marginBottom: '40px',
        maxWidth: '700px',
        lineHeight: '1.6',
        backgroundColor: 'rgba(255,255,255,0.15)', // Subtle background
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.3)',
    },
    
    // Location Details Box
    locationInfo: {
        marginTop: '20px',
        padding: '30px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        fontSize: '15px',
        color: '#333',
        maxWidth: '900px',
        width: '100%',
        boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
        textAlign: 'left',
    },
    locationTitle: {
        color: '#1f4068',
        marginBottom: '20px',
        fontSize: '1.6rem',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px',
    },
    locationGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive grid
        gap: '30px',
    },
    locationColumn: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #3498db',
    },
    'locationColumn h4': {
        color: '#162447',
        marginTop: '0',
        marginBottom: '10px',
        fontSize: '1.2rem',
    },
    'locationColumn p': {
        margin: '5px 0',
    },
    
    // Warning Box
    warningBox: {
        marginTop: '25px',
        padding: '15px',
        backgroundColor: '#ffdbd9', // Light red/salmon background
        border: '1px solid #dc3545',
        borderRadius: '8px',
        color: '#721c24',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    
    // Buttons (Used for React inline style prop)
    buttonContainer: {
        marginTop: '40px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    refreshButton: {
        ...baseButton, // Safe spread
        backgroundColor: '#f39c12', // Orange/Amber for Retry
        color: 'white',
    },
    locationButton: {
        ...baseButton, // Safe spread
        backgroundColor: '#2ecc71', // Green for Location Update
        color: 'white',
    },
    mapsButton: {
        ...baseButton, // Safe spread
        backgroundColor: '#e74c3c', // Red/Crimson for Directions
        color: 'white',
    },

    // Button Hover Effects (Used for injected CSS classes for :hover)
    '.refreshButton': { 
        ...baseButton, 
        backgroundColor: '#f39c12',
        color: 'white',
    },
    '.refreshButton:hover': {
        backgroundColor: '#e67e22',
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
    },
    '.locationButton': {
        ...baseButton, 
        backgroundColor: '#2ecc71',
        color: 'white',
    },
    '.locationButton:hover': {
        backgroundColor: '#27ae60',
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
    },
    '.mapsButton': {
        ...baseButton, 
        backgroundColor: '#e74c3c',
        color: 'white',
    },
    '.mapsButton:hover': {
        backgroundColor: '#c0392b',
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
    },

    // Help/Tips Section
    helpText: {
        marginTop: '40px',
        padding: '30px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        maxWidth: '700px',
        width: '100%',
        borderLeft: '5px solid #3498db',
    },
    helpTitle: {
        fontSize: '1.2rem',
        marginBottom: '15px',
        color: '#ffffff',
    },
    tipsList: {
        textAlign: 'left',
        listStyleType: 'disc',
        paddingLeft: '20px',
    },
    'tipsList li': {
        marginBottom: '8px',
        lineHeight: '1.5',
    },
};

export default App;