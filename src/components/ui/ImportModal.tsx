'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, AlertCircle, CheckCircle2, Download, X } from 'lucide-react';
import { FieldSchema, parseFileData, exportToCSV } from '@/lib/exportUtils';
import { toast } from '@/lib/toast';
import styles from './ImportModal.module.css';

interface Props<T> {
  open: boolean;
  onClose: () => void;
  onImport: (newItems: T[]) => void;
  schema: FieldSchema<T>[];
  entityName?: string;
  sampleData?: T[];
}

export default function ImportModal<T extends Record<string, any>>({
  open,
  onClose,
  onImport,
  schema,
  entityName = 'Record',
  sampleData,
}: Props<T>) {
  const [dragOver, setDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<T[] | null>(null);
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
        const results = parseFileData<T>(text, file.name, schema);

        if (results.length === 0) {
          throw new Error(`No valid ${entityName.toLowerCase()}s could be extracted from file.`);
        }

        setParsedData(results);
      } catch (err: any) {
        setError(err.message || 'Failed to parse file content.');
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.length === 0) return;
    onImport(parsedData);
    toast({
      title: 'Import Successful',
      description: `Successfully added ${parsedData.length} ${entityName.toLowerCase()}(s) to dataset.`,
      type: 'success',
    });
    handleClose();
  };

  const handleDownloadSampleCSV = () => {
    if (sampleData && sampleData.length > 0) {
      exportToCSV(
        sampleData,
        `sample_${entityName.toLowerCase()}_import.csv`,
        schema.map(s => ({ key: s.key, label: s.label }))
      );
    } else {
      // Generate fallback sample row from schema
      const sampleRow: any = {};
      schema.forEach(s => {
        sampleRow[s.key] = s.defaultValue !== undefined ? s.defaultValue : `Sample ${s.label}`;
      });
      exportToCSV(
        [sampleRow],
        `sample_${entityName.toLowerCase()}_import.csv`,
        schema.map(s => ({ key: s.key, label: s.label }))
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Import ${entityName} Data`}
      size="lg"
      footer={
        <>
          <button type="button" onClick={handleClose} className={styles.cancelBtn}>
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
        {/* Header Bar with Sample Download */}
        <div className={styles.sampleBar}>
          <p className={styles.sampleText}>
            Upload a <strong>.CSV</strong> or <strong>.JSON</strong> file matching the {entityName} schema.
          </p>
          <button type="button" onClick={handleDownloadSampleCSV} className={styles.sampleBtn}>
            <Download size={13} /> Sample CSV
          </button>
        </div>

        {/* File Drop Zone */}
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

        {/* Dynamic Preview Table */}
        {parsedData && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <div className={styles.previewTitleGroup}>
                <CheckCircle2 size={16} className={styles.validIcon} />
                <span className={styles.previewTitle}>
                  Validated <strong>{parsedData.length}</strong> {entityName.toLowerCase()}(s) from <em>{fileName}</em>
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
                    {schema.slice(0, 7).map(s => (
                      <th key={String(s.key)}>{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((item, rowIdx) => (
                    <tr key={rowIdx}>
                      {schema.slice(0, 7).map(s => (
                        <td key={String(s.key)}>
                          {String(item[s.key] !== undefined ? item[s.key] : '')}
                        </td>
                      ))}
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
