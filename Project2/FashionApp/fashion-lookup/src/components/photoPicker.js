import React, { useState } from 'react';
import './imageupload.css';

const GooglePhotoPicker = () => {
    const [error, setError] = useState(null);
    
    const handleClick = () => {
        setError("Google Photos integration is currently unavailable. Please upload images directly.");
    };
    
    return (
        <div className="google-photos-container">
            <button 
                onClick={handleClick}
                className="analyze-button"
                style={{ marginTop: '10px', opacity: 0.7 }}
            >
                Select from Google Photos (Coming Soon)
            </button>
            
            {error && (
                <div className="upload-error">{error}</div>
            )}
        </div>
    );
};

export default GooglePhotoPicker;

// import React, { useState, useEffect } from 'react';
// import './imageupload.css';

// const GooglePhotoPicker = () => {
//     const [apiLoaded, setApiLoaded] = useState(false);
//     const [error, setError] = useState(null);
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [status, setStatus] = useState('Initializing...');
    
//     // Use environment variables with fallbacks
//     // const CLIENT_ID = process.env.REACT_APP_FIREBASE_CLIENT_ID;
//     // const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
//     // const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

//     useEffect(() => {
//         // Load Google API Client
//         const loadGoogleApi = () => {
//             setStatus('Loading Google API...');
//             const script = document.createElement('script');
//             script.src = 'https://apis.google.com/js/api.js';
//             script.async = true;
//             script.onload = () => {
//                 setStatus('API script loaded, initializing APIs...');
//                 // Load required API components
//                 window.gapi.load('client:auth2:picker', {
//                     callback: () => {
//                         setStatus('APIs loaded, initializing client...');
//                         initClient();
//                     },
//                     onerror: (err) => {
//                         console.error('Error loading APIs:', err);
//                         setError('Failed to load required APIs');
//                     }
//                 });
//             };
//             script.onerror = () => setError('Failed to load Google API script');
//             document.body.appendChild(script);
//         };
        
//         // Initialize the API client and auth
//         const initClient = () => {
//             console.log('Initializing client with:', { API_KEY, CLIENT_ID, SCOPES });
            
//             // First initialize auth2 separately
//             window.gapi.auth2.init({
//                 client_id: CLIENT_ID,
//                 scope: SCOPES
//             }).then(() => {
//                 // Then initialize the rest of the client
//                 return window.gapi.client.init({
//                     apiKey: API_KEY,
//                     discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1']
//                 });
//             }).then(() => {
//                 setStatus('Google API client initialized successfully');
//                 setApiLoaded(true);
//             }).catch(err => {
//                 console.error('Client init error:', err);
//                 setError(`Error initializing Google API client: ${err.message || 'Unknown error'}`);
//             });
//         };
        
//         loadGoogleApi();
        
//         // Cleanup function
//         return () => {
//             // Any cleanup code if needed
//         };
//     }, [API_KEY, CLIENT_ID]);
    
//     const openPhotoPicker = () => {
//         setStatus('Authenticating...');
        
//         if (!window.gapi || !window.gapi.auth2) {
//             setError('Google Auth API not loaded properly');
//             return;
//         }
        
//         const auth2 = window.gapi.auth2.getAuthInstance();
        
//         // Check if already signed in
//         if (!auth2.isSignedIn.get()) {
//             auth2.signIn().then(() => {
//                 setStatus('Authenticated, opening picker...');
//                 showPicker();
//             }).catch(err => {
//                 console.error('Auth error:', err);
//                 setError(`Authentication failed: ${err.message || 'User cancelled'}`);
//             });
//         } else {
//             setStatus('Already authenticated, opening picker...');
//             showPicker();
//         }
//     };
    
//     const showPicker = () => {
//         if (!window.google || !window.google.picker) {
//             setError('Picker API not loaded properly');
//             return;
//         }
        
//         try {
//             const auth2 = window.gapi.auth2.getAuthInstance();
//             const user = auth2.currentUser.get();
//             const oauthToken = user.getAuthResponse().access_token;
            
//             const picker = new window.google.picker.PickerBuilder()
//                 .setTitle('Select an image from Google Photos')
//                 .addView(window.google.picker.ViewId.PHOTOS)
//                 .setOAuthToken(oauthToken)
//                 .setDeveloperKey(API_KEY)
//                 .setCallback(pickerCallback)
//                 .setSize(800, 600)
//                 .setOrigin(window.location.protocol + '//' + window.location.host)
//                 .build();
                
//             picker.setVisible(true);
//         } catch (err) {
//             console.error('Picker error:', err);
//             setError(`Error creating picker: ${err.message || 'Unknown error'}`);
//         }
//     };
    
//     const pickerCallback = (data) => {
//         if (data.action === window.google.picker.Action.PICKED) {
//             const document = data.docs[0];
//             console.log('Selected document:', document);
            
//             // Extract the image URL from the document
//             let imageUrl = document.url;
//             if (!imageUrl && document.thumbnails && document.thumbnails.length > 0) {
//                 // Use the highest resolution thumbnail available
//                 imageUrl = document.thumbnails[document.thumbnails.length - 1].url;
//             }
            
//             setSelectedImage({
//                 url: imageUrl,
//                 name: document.name || 'Selected image'
//             });
//         } else if (data.action === window.google.picker.Action.CANCEL) {
//             console.log('Picker cancelled');
//         }
//     };
    
//     return (
//         <div className="google-photos-container">
//             <button 
//                 onClick={openPhotoPicker}
//                 disabled={!apiLoaded}
//                 className="analyze-button"
//                 style={{ marginTop: '10px' }}
//             >
//                 {apiLoaded ? "Select from Google Photos" : "Loading Google Photos..."}
//             </button>
            
//             {!apiLoaded && !error && (
//                 <div className="status-message" style={{ fontSize: '14px', color: '#777', marginTop: '5px' }}>
//                     {status}
//                 </div>
//             )}
            
//             {error && (
//                 <div className="upload-error">{error}</div>
//             )}
            
//             {selectedImage && (
//                 <div className="selected-image-container" style={{ marginTop: '15px' }}>
//                     <img 
//                         src={selectedImage.url} 
//                         alt={selectedImage.name} 
//                         className="image-preview"
//                     />
//                     <p>{selectedImage.name}</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GooglePhotoPicker;