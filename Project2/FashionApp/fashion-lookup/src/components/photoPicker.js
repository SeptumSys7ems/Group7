import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './imageupload.css';

const GooglePhotoPicker = () => {
    const [apiLoaded, setApiLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Use the correct environment variable names
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
    const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

    // Load the required Google APIs
    useEffect(() => {
        // Step 1: Load the Google API Platform Library
        setStatus('Loading Google platform...');
        const loadGooglePlatform = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setStatus('Google platform loaded, loading picker...');
                loadPickerAPI();
            };
            script.onerror = () => {
                setError('Failed to load Google Identity Services');
            };
            document.body.appendChild(script);
        };

        // Step 2: Load the Google Picker API
        const loadPickerAPI = () => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                window.gapi.load('picker', {
                    callback: () => {
                        setStatus('Picker API loaded, loading client API...');
                        loadClientAPI();
                    }
                });
            };
            script.onerror = () => {
                setError('Failed to load Google Picker API');
            };
            document.body.appendChild(script);
        };

        // Step 3: Load the Google API Client Library
        const loadClientAPI = () => {
            window.gapi.load('client', {
                callback: async () => {
                    try {
                        await window.gapi.client.init({
                            apiKey: API_KEY,
                            discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1']
                        });
                        setStatus('All Google APIs loaded successfully');
                        setApiLoaded(true);
                    } catch (err) {
                        console.error('Error initializing client API:', err);
                        setError(`Error initializing Google client: ${err.message || 'Unknown error'}`);
                    }
                },
                onerror: (err) => {
                    console.error('Error loading client API:', err);
                    setError('Failed to load Google client API');
                }
            });
        };

        loadGooglePlatform();
    }, [API_KEY]);

    // Handle opening the Google Photos picker
    const openPhotoPicker = async () => {
        if (!apiLoaded) {
            setError('Google APIs not fully loaded yet');
            return;
        }

        try {
            setStatus('Requesting authorization...');
            
            // Check if the google object is available
            if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
                setError('Google Identity Services not properly loaded');
                return;
            }
            
            // Use the newer Google Identity Services for authentication
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        setError(`Authentication error: ${tokenResponse.error}`);
                        return;
                    }
                    
                    // Successfully obtained access token, now create the picker
                    const accessToken = tokenResponse.access_token;
                    createAndShowPicker(accessToken);
                }
            });
            
            // Request an access token
            tokenClient.requestAccessToken();
            
        } catch (err) {
            console.error('Authentication error:', err);
            setError(`Failed to authenticate: ${err.message || 'Unknown error'}`);
        }
    };

    // Create and display the picker with the access token
    const createAndShowPicker = (accessToken) => {
        if (!window.google || !window.google.picker) {
            setError('Picker API not loaded properly');
            return;
        }
        
        try {
            setStatus('Opening Photos picker...');
            
            const picker = new window.google.picker.PickerBuilder()
                .setTitle('Select an image from Google Photos')
                .addView(new window.google.picker.PhotosView())
                .setOAuthToken(accessToken)
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
    
    // Handle the user's selection from the picker
    const pickerCallback = async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
            const document = data.docs[0];
            console.log('Selected document:', document);
            
            // Extract the image URL
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
    
    // Process the selected image for analysis
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
                disabled={!apiLoaded}
                className="analyze-button"
                style={{ marginTop: '10px' }}
            >
                {apiLoaded 
                    ? "Select from Google Photos" 
                    : `Loading Google Photos... (${status})`}
            </button>
            
            {!apiLoaded && !error && (
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