import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './imageupload.css';

const GooglePhotoPicker = () => {
    const [apiLoaded, setApiLoaded] = useState(false);
    const [pickerLoaded, setPickerLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Use environment variables with fallbacks
    const CLIENT_ID = process.env.REACT_APP_FIREBASE_CLIENT_ID;
    const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
    const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

    useEffect(() => {
        // Load Google API Client
        const loadGoogleApi = () => {
            setStatus('Loading Google API...');
            
            // First load the main Google API
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.onload = () => {
                setStatus('API script loaded, loading client...');
                // Load the client library first
                window.gapi.load('client', {
                    callback: () => {
                        setStatus('Client loaded, initializing...');
                        // Initialize the client
                        window.gapi.client.init({
                            apiKey: API_KEY,
                            clientId: CLIENT_ID,
                            scope: SCOPES,
                            discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1']
                        }).then(() => {
                            setStatus('Client initialized, loading auth...');
                            // Load auth2 next
                            return new Promise((resolve, reject) => {
                                window.gapi.load('auth2', {
                                    callback: resolve,
                                    onerror: reject
                                });
                            });
                        }).then(() => {
                            setStatus('Auth loaded, initializing auth...');
                            // Initialize auth2
                            return window.gapi.auth2.init({
                                client_id: CLIENT_ID,
                                scope: SCOPES
                            });
                        }).then(() => {
                            setStatus('Auth initialized, API ready');
                            setApiLoaded(true);
                            
                            // Now load the Picker API
                            loadPickerApi();
                        }).catch(err => {
                            console.error('Client init error:', err);
                            setError(`Error initializing Google API client: ${err.details || err.message || 'Unknown error'}`);
                        });
                    },
                    onerror: (err) => {
                        console.error('Error loading client:', err);
                        setError('Failed to load Google client API');
                    }
                });
            };
            script.onerror = () => setError('Failed to load Google API script');
            document.body.appendChild(script);
        };
        
        // Load the Google Picker API (needs to be loaded separately)
        const loadPickerApi = () => {
            setStatus('Loading Picker API...');
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js?onload=onApiLoad';
            script.async = true;
            
            // Define the callback
            window.onApiLoad = () => {
                window.gapi.load('picker', {
                    callback: () => {
                        setStatus('Picker API loaded successfully');
                        setPickerLoaded(true);
                    },
                    onerror: (err) => {
                        console.error('Error loading picker API:', err);
                        setError('Failed to load Google Picker API');
                    }
                });
            };
            
            script.onerror = () => setError('Failed to load Google Picker API script');
            document.body.appendChild(script);
        };
        
        loadGoogleApi();
        
        // Cleanup function
        return () => {
            // Clean up any global callbacks
            window.onApiLoad = undefined;
        };
    }, [API_KEY, CLIENT_ID]);
    
    const openPhotoPicker = () => {
        if (!apiLoaded || !pickerLoaded) {
            setError('Google APIs not fully loaded yet. Please try again in a moment.');
            return;
        }
        
        setStatus('Authenticating...');
        
        if (!window.gapi || !window.gapi.auth2) {
            setError('Google Auth API not loaded properly');
            return;
        }
        
        const auth2 = window.gapi.auth2.getAuthInstance();
        
        // Check if already signed in
        if (!auth2.isSignedIn.get()) {
            auth2.signIn().then(() => {
                setStatus('Authenticated, opening picker...');
                showPicker();
            }).catch(err => {
                console.error('Auth error:', err);
                setError(`Authentication failed: ${err.details || err.message || 'User cancelled'}`);
            });
        } else {
            setStatus('Already authenticated, opening picker...');
            showPicker();
        }
    };
    
    const showPicker = () => {
        if (!window.google || !window.google.picker) {
            setError('Picker API not loaded properly');
            return;
        }
        
        try {
            const auth2 = window.gapi.auth2.getAuthInstance();
            const user = auth2.currentUser.get();
            const oauthToken = user.getAuthResponse().access_token;
            
            const picker = new window.google.picker.PickerBuilder()
                .setTitle('Select an image from Google Photos')
                .addView(new window.google.picker.PhotosView())
                .setOAuthToken(oauthToken)
                .setDeveloperKey(API_KEY)
                .setCallback(pickerCallback)
                .setSize(800, 600)
                .setOrigin(window.location.protocol + '//' + window.location.host)
                .build();
                
            picker.setVisible(true);
        } catch (err) {
            console.error('Picker error:', err);
            setError(`Error creating picker: ${err.message || 'Unknown error'}`);
        }
    };
    
    const pickerCallback = async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const document = data.docs[0];
            console.log('Selected document:', document);
            
            // Extract the image URL from the document
            let imageUrl = document.url;
            if (!imageUrl && document.thumbnails && document.thumbnails.length > 0) {
                // Use the highest resolution thumbnail available
                imageUrl = document.thumbnails[document.thumbnails.length - 1].url;
            }
            
            setSelectedImage({
                url: imageUrl,
                name: document.name || 'Selected image'
            });
            
            // Process the selected image if URL is available
            if (imageUrl) {
                await processSelectedImage(imageUrl);
            } else {
                setError('Could not retrieve image URL from selected item');
            }
        } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log('Picker cancelled');
        }
    };
    
    const processSelectedImage = async (imageUrl) => {
        try {
            setStatus('Processing selected image...');
            
            // Send the image URL for analysis
            const token = await currentUser.getIdToken();
            const analysisResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/analysis`,
                { imageUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            setStatus('Image analyzed successfully');
            
            // Navigate to results page
            navigate(`/results/${analysisResponse.data.analysisId}`);
        } catch (error) {
            console.error('Image analysis error:', error);
            setError(`Failed to analyze selected image: ${error.message || 'Unknown error'}`);
        }
    };
    
    return (
        <div className="google-photos-container">
            <button 
                onClick={openPhotoPicker}
                disabled={!apiLoaded || !pickerLoaded}
                className="analyze-button"
                style={{ marginTop: '10px' }}
            >
                {apiLoaded && pickerLoaded 
                    ? "Select from Google Photos" 
                    : `Loading Google Photos... (${status})`}
            </button>
            
            {(!apiLoaded || !pickerLoaded) && !error && (
                <div className="status-message" style={{ fontSize: '14px', color: '#777', marginTop: '5px' }}>
                    {status}
                </div>
            )}
            
            {error && (
                <div className="upload-error">{error}</div>
            )}
            
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
        </div>
    );
};

export default GooglePhotoPicker;