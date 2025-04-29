import React, { useState } from 'react';

// React component to manage Google Photos Picker
const GooglePhotosPicker = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [isSignedIn, setIsSignedIn] = useState(false);

    const CLIENT_ID = '797768943876-lu1k5eiei4nvn8ad9kpi9hnqbh4p2uit.apps.googleusercontent.com'; // Replace with your actual client ID

    // Handle Google Sign-In
    const handleSignIn = () => {
        google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
            callback: (tokenResponse) => {
                setAccessToken(tokenResponse.access_token);
                setIsSignedIn(true);
            }
        }).requestAccessToken();
    };

    // Load Photos from Google Photos API
    const loadPhotos = async () => {
        const res = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=20', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        setPhotos(data.mediaItems);
    };

    // Handle photo selection
    const handlePhotoSelect = (photo) => {
        setSelectedPhoto(photo);
        console.log('Selected photo baseUrl:', photo.baseUrl); // Base URL of selected photo
    };

    return (
        <div>
            <h2>Google Photos Picker</h2>
            {!isSignedIn ? (
                <button onClick={handleSignIn}>Sign in with Google</button>
            ) : (
                <button onClick={loadPhotos}>Load My Photos</button>
            )}

            <div id="gallery" style={styles.gallery}>
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        onClick={() => handlePhotoSelect(photo)}
                        style={{
                            ...styles.photoItem,
                            borderColor: selectedPhoto?.id === photo.id ? '#4285f4' : 'transparent',
                        }}
                    >
                        <img
                            src={`${photo.baseUrl}=w400-h300`}
                            alt="Google Photos"
                            style={styles.photo}
                        />
                        {selectedPhoto?.id === photo.id && (
                            <div style={styles.selectedCheck}>✔</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Inline styles for the gallery
const styles = {
    gallery: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '20px',
    },
    photoItem: {
        position: 'relative',
        border: '2px solid transparent',
        cursor: 'pointer',
    },
    photo: {
        width: '200px',
        height: 'auto',
        display: 'block',
    },
    selectedCheck: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        background: '#4285f4',
        color: 'white',
        padding: '2px 6px',
        fontSize: '12px',
        borderRadius: '4px',
    },
};

export default GooglePhotosPicker;
