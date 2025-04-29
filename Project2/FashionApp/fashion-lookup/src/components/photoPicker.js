import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './imageupload.css';

// Initializes variables for Google Photo Picker API
// CLIENT_ID, API_KEY, SCOPES
const GooglePhotoPicker = () => {
    const [apiLoaded, setApiLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const [debugLogs, setDebugLogs] = useState([]);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
    // const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

    const SCOPES = [
        'https://www.googleapis.com/auth/photoslibrary.readonly', 
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/photospicker.mediaitems.readonly'
      ].join(' ');

    // let tokenClient = null; // tokenClient is outside of component internals

    const tokenClient = React.useRef(null);

    // Debug method
    const debug = (msg) => {
        console.log('[DEBUG]', msg);
        setDebugLogs(prev => [...prev, msg]);
    };

    // Downloads debug logs
    const downloadLogs = () => {
        const content = debugLogs.join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'THISISTHECONSOLELOG.log';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        debug('Checking environment variables...');
        if (!API_KEY || !CLIENT_ID) {
            setError('Missing API_KEY or CLIENT_ID. Check .env file.');
            return;
        }

        const loadGooglePlatform = () => {
            debug('Loading Google Identity Services...');
            const script1 = document.createElement('script');
            script1.src = 'https://accounts.google.com/gsi/client';
            script1.async = true;
            script1.defer = true;
            script1.onload = () => {
                debug('Google Identity Services loaded.');
                loadPickerAPI();
            };
            script1.onerror = () => {
                debug('Failed to load Google Identity Services');
                setError('Failed to load Google Identity Services');
            };
            document.body.appendChild(script1);
        };

        const loadPickerAPI = () => {
            debug('Loading Google Picker API...');
            const script2 = document.createElement('script');
            script2.src = 'https://apis.google.com/js/api.js';
            script2.async = true;
            script2.defer = true;
            script2.onload = () => {
                if (window.gapi) {
                    debug('gapi loaded.');
                    window.gapi.load('picker', {
                        callback: () => {
                            debug('Picker API loaded.');
                            setStatus('Picker API loaded');
                            setApiLoaded(true);
                        },
                        onerror: () => {
                            debug('Picker API failed to load.');
                            setError('Failed to load Picker API');
                        }
                    });
                } else {
                    debug('gapi not found after script load.');
                    setError('gapi not found.');
                }
            };
            script2.onerror = () => {
                debug('Failed to load gapi.');
                setError('Failed to load Google API client');
            };
            document.body.appendChild(script2);
        };

        loadGooglePlatform();
    }, []);

    useEffect(() => {
        if (apiLoaded && window.google?.accounts?.oauth2) {
            debug('Initializing TokenClient after API loaded.');
            tokenClient.current = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse.error) {
                        debug(`Token response error: ${tokenResponse.error}`);
                        setError(`Authentication error: ${tokenResponse.error}`);
                        return;
                    }
                    debug('Received access token.');
                    createAndShowPicker(tokenResponse.access_token);
                }
            });
        }
    }, [apiLoaded, CLIENT_ID, SCOPES]);
    

    const openPhotoPicker = () => {
        debug('Photo picker button clicked.');
        if (!tokenClient.current) {
            debug('TokenClient not ready.');
            setError('Google Token Client is not ready yet.');
            return;
        }
        debug('Requesting access token...');
        tokenClient.current.requestAccessToken({ prompt: 'consent' }); 
    };

    /**
     * Displays the Google photo picker window
     * @param {} accessToken - oAuth Token
     * @returns {} - Google photo image
     */
    const createAndShowPicker = (accessToken) => {
        debug('Creating picker...');
        if (!window.google?.picker) {
            debug('Picker API not available.');
            setError('Picker API not available.');
            return;
        }
        try {
            const photosView = new window.google.picker.PhotosView()
                .setType('photos')
                .setMimeTypes('image/png,image/jpeg,image/jpg');

            const picker = new window.google.picker.PickerBuilder()
                .addView(photosView)
                .setOAuthToken(accessToken)
                .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY)
                // .setDeveloperKey(API_KEY)
                .setCallback(pickerCallback)
                .build();

            picker.setVisible(true);
        } catch (err) {
            console.error('Picker build failed', err);
            setError(`Picker error: ${err.message}`);
        }
    };

    const pickerCallback = async (data) => {
        debug(`Picker callback received: ${JSON.stringify(data)}`);
        if (data?.action === window.google.picker.Action.PICKED) {
            const document = data.docs[0];
            debug(`Picked document: ${JSON.stringify(document)}`);

            let imageUrl = document?.url || document?.thumbnails?.[0]?.url;
            if (!imageUrl) {
                setError('No URL found in picked document.');
                return;
            }
            setSelectedImage({
                url: imageUrl,
                name: document.name || 'Selected Image'
            });

            await processSelectedImage(imageUrl);
        } else if (data?.action === window.google.picker.Action.CANCEL) {
            debug('Picker was cancelled.');
        } else if (data?.action === window.google.picker.Action.ERROR) {
            debug('Picker returned an error.');
            setError('Google Picker error.');
        }
    };

    const processSelectedImage = async (imageUrl) => {
        debug(`Processing image: ${imageUrl}`);
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/analysis`,
                { imageUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            debug('Image processed successfully.');
            navigate(`/results/${response.data.analysisId}`);
        } catch (error) {
            console.error('Image processing failed', error);
            debug(`Image processing failed: ${error.message}`);
            setError(`Failed to process image: ${error.message}`);
        }
    };

    const displayDevWorkaround = () => (
        <div className="dev-workaround" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
                <strong>Development Note:</strong> While configuring Google Photos API access, you can use local file upload as a workaround.
            </p>
        </div>
    );

    return (
        <div className="google-photos-container">
            <button
                onClick={openPhotoPicker}
                disabled={!apiLoaded}
                className="analyze-button"
                style={{ marginTop: '10px' }}
            >
                {apiLoaded
                    ? "Select from Google Photos"
                    : `Loading Google Photos... (${status})`}
            </button>

            {error && (
                <div className="upload-error">{error}</div>
            )}

            {error && displayDevWorkaround()}

            {selectedImage && (
                <div className="selected-image-container" style={{ marginTop: '15px' }}>
                    <img
                        src={selectedImage.url}
                        alt={selectedImage.name}
                        className="image-preview"
                    />
                    <p>{selectedImage.name}</p>
                </div>
            )}

            {/* <div style={{ marginTop: '20px', fontSize: '12px', color: '#777' }}>
                <strong>Debug Logs:</strong>
                <ul style={{ maxHeight: '200px', overflowY: 'scroll', listStyle: 'none', padding: 0 }}>
                    {debugLogs.map((log, idx) => (
                        <li key={idx}>→ {log}</li>
                    ))}
                </ul>
                <button onClick={downloadLogs} className="download-log-button" style={{ marginTop: '10px' }}>
                    Download Debug Logs
                </button>
            </div> */}
        </div>
    );
};

export default GooglePhotoPicker;
