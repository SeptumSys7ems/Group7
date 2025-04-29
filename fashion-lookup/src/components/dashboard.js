
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './navbar';
import ImageUpload from './imageupload';
import Results from './results';
import History from './history';
import { getUserAnalyses } from '../services/api';
import './dashboard.css';

function Dashboard() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('upload');
    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    function handleImageAnalyzed(results) {
        setAnalysisResults(results);
        setActiveTab('results');
    }

    async function handleSelectAnalysis(analysisId) {
        try {
            setLoading(true);
            const response = await fetch(`/analyses/${analysisId}`, {
                headers: {
                    'Authorization': `Bearer ${await currentUser.getIdToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analysis');
            }

            const data = await response.json();
            setAnalysisResults(data);
            setActiveTab('results');
        } catch (error) {
            console.error('Analysis fetch error:', error);
            setError('Failed to load analysis');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="dashboard">
            <Navbar />

            <div className="dashboard-content">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload
                    </button>

                    <button
                        className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('results')}
                        disabled={!analysisResults}
                    >
                        Results
                    </button>

                    <button
                        className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="tab-content">
                    {activeTab === 'upload' && (
                        <ImageUpload onImageAnalyzed={handleImageAnalyzed} />
                    )}

                    {activeTab === 'results' && (
                        <Results results={analysisResults} />
                    )}

                    {activeTab === 'history' && (
                        <History onSelectAnalysis={handleSelectAnalysis} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;