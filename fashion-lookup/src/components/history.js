
import React, { useState, useEffect } from 'react';
import { getUserAnalyses } from '../services/api';
import './history.css';

function History({ onSelectAnalysis }) {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchAnalyses() {
            try {
                setLoading(true);
                const data = await getUserAnalyses();
                setAnalyses(data.analyses || []);
            } catch (error) {
                console.error('History fetch error:', error);
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalyses();
    }, []);

    if (loading) {
        return <div className="loading">Loading history...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (analyses.length === 0) {
        return <div className="no-history">No previous analyses found</div>;
    }

    return (
        <div className="history-container">
            <h2>Your Previous Analyses</h2>

            <div className="history-grid">
                {analyses.map(analysis => (
                    <div
                        key={analysis.id}
                        className="history-card"
                        onClick={() => onSelectAnalysis(analysis.id)}
                    >
                        <img
                            src={analysis.imageUrl}
                            alt="Past outfit"
                            className="history-image"
                        />
                        <div className="history-details">
                            <p className="history-date">
                                {new Date(analysis.timestamp).toLocaleDateString()}
                            </p>
                            <p className="history-items">
                                {analysis.detectedItems.map(item => item.type).join(', ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default History;