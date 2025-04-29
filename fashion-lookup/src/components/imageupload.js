import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './imageupload.css';

function ImageUpload({ onImageAnalyzed, onSuccess }) {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    const fileInputRef = useRef(null);
    const navigate = useNavigate();


    function handleFileChange(e) {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setImageUrl(URL.createObjectURL(e.target.files[0]));
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setImageUrl(URL.createObjectURL(e.dataTransfer.files[0]));
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function triggerFileInput() {
        fileInputRef.current.click();
    }

    async function handleUpload() {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = await currentUser.getIdToken();

            // for future commenting we have the upload image part here:
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            
            const { imageUrl } = response.data;
            // const { imageUrl } = 'https://www.gentlemansflair.com/content/images/size/w1600/2024/05/GF-507-1.jpg';

            
            const analysisResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/analysis`,
                { imageUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (onSuccess) {
                onSuccess();
            } else if (onImageAnalyzed) {
                onImageAnalyzed();
            }
            // Redirect to results page
            
            navigate(`/results/${analysisResponse.data.analysisId}`);
        } catch (error) {
            console.error('Upload/analysis error:', error);
            setError('Failed to upload or analyze image');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="image-upload">
            <h3>Upload an Outfit</h3>

            <div 
                className="drop-area" 
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
                onClick={triggerFileInput}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="image-preview" />
                ) : (
                    <div className="upload-prompt">
                        <span className="upload-icon" role="img" aria-label="camera">📷</span>
                        <p>Drag & drop an image or click to browse</p>
                    </div>
                )}
                
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />
            </div>

            {error && <p className="upload-error">{error}</p>}

            {file && !uploading && (
                <button className="analyze-button" onClick={handleUpload}>
                    Analyze Outfit
                </button>
            )}
        </div>
    );
}

export default ImageUpload;