import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  onTextLoaded: (text: string, fileName: string) => void;
  placeholderText?: string;
}

interface FileInfo {
  name: string;
  size: string;
  type: string;
}

export default function FileUpload({ accept = '.txt,.md,.pdf', onTextLoaded, placeholderText }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!['pdf', 'txt', 'md'].includes(extension ?? '')) {
      setError('파일 양식을 확인해주세요. (지원 형식: PDF, TXT, MD)');
      setFileInfo(null);
      return;
    }

    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    });
    setError(null);

    // PDF는 백엔드에서 텍스트 추출
    if (extension === 'pdf') {
      setExtracting(true);
      (async () => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('http://localhost:8000/api/parse-resume', {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'PDF 추출 실패');
          }
          const data = await res.json();
          onTextLoaded(data.text, file.name);
        } catch (err: any) {
          setError(err.message || 'PDF 텍스트 추출 중 오류가 발생했습니다.');
          setFileInfo(null);
        } finally {
          setExtracting(false);
        }
      })();
      return;
    }

    // Otherwise read as text
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onTextLoaded(e.target.result, file.name);
      }
    };
    reader.onerror = () => {
      setError('파일을 읽는 도중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full mb-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
        className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-150 flex flex-col items-center justify-center ${
          isDragActive
            ? 'border-black bg-zinc-50'
            : fileInfo
              ? 'border-green-500 bg-green-50/50'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {extracting ? (
          <div className="flex flex-col items-center gap-1.5">
            <Loader2 size={32} className="text-green-500 animate-spin" />
            <h4 className="text-zinc-800 font-semibold text-sm m-0">PDF 텍스트 추출 중...</h4>
            <p className="text-xs text-zinc-500 m-0">잠시만 기다려주세요.</p>
          </div>
        ) : fileInfo ? (
          <div className="flex flex-col items-center gap-1.5">
            <CheckCircle2 size={32} className="text-green-500" />
            <h4 className="text-green-800 font-semibold text-sm m-0">파일 업로드 완료!</h4>
            <div className="flex items-center gap-1.5 text-xs text-zinc-900 bg-white py-1 px-2.5 rounded border border-zinc-200 font-mono">
              <FileText size={14} className="text-zinc-500" />
              <span>{fileInfo.name} ({fileInfo.size})</span>
            </div>
            <p className="text-xs text-zinc-500 m-0">클릭하여 다른 파일로 변경할 수 있습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Upload size={32} className="text-zinc-400" />
            <h4 className="text-sm font-semibold text-zinc-900 m-0">{placeholderText || '파일 업로드'}</h4>
            <p className="text-xs text-zinc-500 m-0">드래그 앤 드롭하거나 클릭하여 파일을 선택하세요.</p>
            <span className="text-[10px] text-zinc-400">지원 형식: PDF, TXT, MD (PDF는 자동 텍스트 추출 분석)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs">
          <AlertCircle size={14} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
