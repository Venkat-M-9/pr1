'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, X } from 'lucide-react';
import { Record as SystemRecord, Status, Priority, Category } from '@/lib/mockData';
import { toast } from '@/lib/toast';
import styles from './ImportModal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (newRecords: SystemRecord[]) => void;
}

export default function ImportModal({ open, onClose, onImport }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<SystemRecord[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setParsedData(null);
    setFileName('');
    setError(null);
    setDragOver(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        let records: SystemRecord[] = [];

        if (file.name.endsWith('.json')) {
          const raw = JSON.parse(text);
          const array = Array.isArray(raw) ? raw : [raw];
          records = array.map((item, i) => normalizeRecord(item, i));
        } else {
          // Parse CSV
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length <= 1) {
            throw new Error('CSV file is empty or missing headers.');
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          records = lines.slice(1).map((line, i) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj: any = {};
            headers.forEach((h, idx) => {
              obj[h] = values[idx] || '';
            });
            return normalizeRecord(obj, i);
          });
        }

        if (records.length === 0) {
          throw new Error('No valid records could be extracted from file.');
        }

        setParsedData(records);
      } catch (err: any) {
        setError(err.message || 'Failed to parse file content.');
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const normalizeRecord = (obj: any, index: number): SystemRecord => {
    const id = obj.id || obj['record id'] || `IMP-${String(Date.now() + index).slice(-6)}`;
    const name = obj.name || obj.title || obj['title / name'] || `Imported Item ${index + 1}`;
    const status: Status = ['active', 'inactive', 'pending', 'archived'].includes(obj.status?.toLowerCase())
      ? obj.status.toLowerCase()
      : 'active';
    const priority: Priority = ['low', 'medium', 'high', 'critical'].includes(obj.priority?.toLowerCase())
      ? obj.priority.toLowerCase()
      : 'medium';
    const category: Category = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'].includes(obj.category?.toLowerCase())
      ? obj.category.toLowerCase()
      : 'alpha';
    const owner = obj.owner || 'Imported User';
    const value = parseFloat(obj.value) || Math.floor(Math.random() * 1000) + 50;
    const createdAt = obj.createdat || obj['created date'] || new Date().toISOString().split('T')[0];
    const updatedAt = new Date().toISOString().split('T')[0];

    return {
      id,
      name,
      status,
      priority,
      category,
      owner,
      value,
      progress: Math.floor(Math.random() * 100),
      tags: ['imported'],
      description: obj.description || 'Imported via data wizard.',
      createdAt,
      updatedAt,
    };
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.length === 0) return;
    onImport(parsedData);
    toast({
      title: 'Import Successful',
      description: `Successfully added ${parsedData.length} records to dataset.`,
      type: 'success',
    });
    handleClose();
  };

  const downloadSampleCSV = () => {
    const sample = `Record ID,Title / Name,Status,Priority,Category,Owner,Value ($),Created Date
REC-99001,Imported Project Alpha,active,high,alpha,Alice Chen,4500,2026-07-01
REC-99002,Imported Task Beta,pending,critical,beta,Bob Martin,1200,2026-07-02
REC-99003,Imported Module Gamma,active,low,gamma,Carol White,8900,2026-07-03`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_import_records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Dataset"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedData || parsedData.length === 0}
            onClick={handleConfirmImport}
            className={styles.confirmBtn}
          >
            Confirm Import ({parsedData?.length || 0})
          </button>
        </>
      }
    >
      <div className={styles.container}>
        {/* Top bar with sample download */}
        <div className={styles.sampleBar}>
          <p className={styles.sampleText}>
            Upload a <strong>.CSV</strong> or <strong>.JSON</strong> dataset to merge with system records.
          </p>
          <button type="button" onClick={downloadSampleCSV} className={styles.sampleBtn}>
            <Download size={13} /> Sample CSV
          </button>
        </div>

        {/* Upload Zone */}
        {!parsedData && (
          <div
            className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .json"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files?.[0]) processFile(e.target.files[0]);
              }}
            />
            <div className={styles.uploadIcon}>
              <Upload size={28} />
            </div>
            <p className={styles.uploadTitle}>Click to browse or drop file here</p>
            <p className={styles.uploadHint}>Supports .CSV and .JSON formats up to 10MB</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Live Preview Table */}
        {parsedData && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <div className={styles.previewTitleGroup}>
                <CheckCircle2 size={16} className={styles.validIcon} />
                <span className={styles.previewTitle}>
                  Validated <strong>{parsedData.length}</strong> records from <em>{fileName}</em>
                </span>
              </div>
              <button type="button" onClick={resetState} className={styles.clearBtn}>
                <X size={14} /> Clear
              </button>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.status}</td>
                      <td>{item.priority}</td>
                      <td>{item.category}</td>
                      <td>{item.owner}</td>
                      <td>${item.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 5 && (
              <p className={styles.moreHint}>...and {parsedData.length - 5} more rows ready for ingestion.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
