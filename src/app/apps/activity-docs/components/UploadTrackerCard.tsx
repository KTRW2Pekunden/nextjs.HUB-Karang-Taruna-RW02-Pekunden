import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadingFile } from '../hooks/useActivityDocs'; 

interface UploadTrackerCardProps {
  uploadQueue: UploadingFile[];
}

export const UploadTrackerCard: React.FC<UploadTrackerCardProps> = ({ uploadQueue }) => {

  if (uploadQueue.length === 0) {
    return null;
  }

  const inProgressCount = uploadQueue.filter(
    item => item.status === 'pending' || item.status === 'uploading'
  ).length;

  const completedCount = uploadQueue.filter(item => item.status === 'completed').length;
  const failedCount = uploadQueue.filter(item => item.status === 'failed').length;
  const totalItems = uploadQueue.length;
  
  let title = 'Unggahan File';
  if (inProgressCount > 0) {
    title = `Mengunggah (${inProgressCount}/${totalItems})`;
  } else if (completedCount > 0 || failedCount > 0) {
    title = `Unggahan Selesai (${completedCount} Berhasil, ${failedCount} Gagal)`;
  }


  return (
    <div 
      className="fixed bottom-4 right-4 z-50 w-full max-w-xs md:max-w-sm rounded-lg shadow-2xl p-4 transition-all duration-300"
      style={{ 
        backgroundColor: '#2a2e35', 
        borderColor: '#3a3e45', 
        borderWidth: '1px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#F5E9D6' }}>
          {title}
        </h3>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {uploadQueue.map((item, index) => {
          let Icon, iconColor, statusText;
          let progressStyle = { width: `${item.progress === -1 ? 100 : item.progress}%` };
          
          switch (item.status) {
            case 'pending':
            case 'uploading':
              Icon = Loader2;
              iconColor = '#E77E4F';
              statusText = item.status === 'pending' ? 'Menunggu...' : 'Mengunggah...';
              break;
            case 'completed':
              Icon = CheckCircle;
              iconColor = '#10B981';
              statusText = 'Selesai';
              break;
            case 'failed':
              Icon = AlertCircle;
              iconColor = '#EF4444'; 
              statusText = 'Gagal';
              progressStyle = { width: `100%` }; 
              break;
            default:
                Icon = Loader2;
                iconColor = '#b8a88e';
                statusText = 'Proses...';
          }

          return (
            <div key={index} className="flex items-start gap-3 text-xs">
              <Icon 
                className={`w-4 h-4 mt-0.5 shrink-0 ${item.status === 'uploading' ? 'animate-spin' : ''}`} 
                style={{ color: iconColor }} 
              />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium" style={{ color: '#F5E9D6' }}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: '#b8a88e' }}>
                  <span>{statusText}</span>
                  {item.status === 'uploading' && <span>{item.progress}%</span>}
                </div>
                
                <div 
                  className="w-full h-1 mt-1 rounded-full overflow-hidden" 
                  style={{ backgroundColor: '#3a3e45' }}
                >
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      ...progressStyle, 
                      backgroundColor: item.status === 'failed' ? '#EF4444' : (item.status === 'completed' ? '#10B981' : '#E77E4F')
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};