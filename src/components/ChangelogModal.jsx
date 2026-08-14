import React, { useState, useEffect } from 'react';
import { X, GitCommit, Bug, Sparkles, Activity, FileText } from 'lucide-react';
import changelogData from '../data/changelog.json';

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'bugfix': return <Bug size={16} />;
      case 'feature': return <Sparkles size={16} />;
      case 'refactor': return <Activity size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'bugfix': return 'badge-bugfix';
      case 'feature': return 'badge-feature';
      case 'refactor': return 'badge-refactor';
      default: return 'badge-default';
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'bugfix': return 'Bug 修復';
      case 'feature': return '新功能';
      case 'refactor': return '效能優化';
      default: return '更新';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content changelog-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitCommit size={24} style={{ color: 'var(--primary)' }} />
            <h2>系統更新紀錄 (Changelog)</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body changelog-body">
          {changelogData.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>目前沒有更新紀錄</p>
          ) : (
            <div className="timeline">
              {changelogData.map((entry, index) => (
                <div key={entry.hash} className="timeline-item">
                  <div className="timeline-marker">
                    <div className={`marker-dot ${getBadgeClass(entry.type)}`}></div>
                    {index < changelogData.length - 1 && <div className="marker-line"></div>}
                  </div>
                  
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="timeline-title-row">
                        <span className={`changelog-badge ${getBadgeClass(entry.type)}`}>
                          {getIcon(entry.type)} {getLabel(entry.type)}
                        </span>
                        <h3 className="timeline-title">{entry.title}</h3>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-version">{entry.version}</span>
                        <span className="timeline-date">{formatDate(entry.date)}</span>
                      </div>
                    </div>
                    
                    {entry.details && (
                      <div className="timeline-details">
                        {entry.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
