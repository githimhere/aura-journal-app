import React, { useMemo, useState, useRef } from 'react';
import { JournalEntry, Folder } from '../types';
import { GlassCard, NeuButton, NeuInput, NeuTextArea } from './UIComponents';

interface FeedProps {
  entries: JournalEntry[];
  folders: Folder[];
  onUpdateFolders: (folders: Folder[]) => void;
  onMoveEntry: (entryId: string, folderId: string | undefined) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  userName: string;
}

export const Feed: React.FC<FeedProps> = ({ 
  entries, folders, onUpdateFolders, 
  onMoveEntry, onUpdateEntry, onDeleteEntry, 
  userName 
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'folders'>('gallery');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  // --- Modals State ---
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null); // Lightbox
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null); // Edit Modal

  // --- Derived Data ---
  
  const visibleEntries = useMemo(() => {
    let filtered = entries;
    if (activeTab === 'folders' && currentFolder) {
      filtered = entries.filter(e => e.folderId === currentFolder.id);
    }
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, activeTab, currentFolder]);

  const flashback = useMemo(() => {
    if (activeTab !== 'gallery') return null;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return entries.find(entry => {
      const diff = now - entry.timestamp;
      const days = diff / oneDay;
      return (days >= 6 && days <= 8) || (days >= 29 && days <= 31) || (days >= 364 && days <= 366);
    });
  }, [entries, activeTab]);

  // --- Folder Handlers ---

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      icon: newFolderIcon
    };
    onUpdateFolders([...folders, folder]);
    setIsCreatingFolder(false);
    setNewFolderName('');
    setNewFolderIcon('📁');
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this folder? Entries will be moved to 'All Memories'.")) {
      entries.forEach(e => {
        if (e.folderId === folderId) onMoveEntry(e.id, undefined);
      });
      onUpdateFolders(folders.filter(f => f.id !== folderId));
      if (currentFolder?.id === folderId) setCurrentFolder(null);
    }
  };

  // --- Edit / Delete Handlers ---

  const handleSaveEdit = (updatedEntry: JournalEntry) => {
    onUpdateEntry({ ...updatedEntry, editedTimestamp: Date.now() });
    setEditingEntry(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this memory permanently?")) {
      onDeleteEntry(id);
      if (viewingEntry?.id === id) setViewingEntry(null);
      if (editingEntry?.id === id) setEditingEntry(null);
    }
  };

  // --- Render ---

  if (entries.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 animate-pulse flex items-center justify-center shadow-inner">
          <span className="text-4xl">✨</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-200">Welcome, {userName}!</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">Your Lore is empty. Tap the + button to lock in your first memory.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-32 pt-4 px-4 space-y-6 no-scrollbar">
      
      {/* --- Tabs --- */}
      <div className="flex p-1 bg-gray-200 dark:bg-white/10 rounded-xl backdrop-blur-sm sticky top-0 z-30">
        <button 
          onClick={() => { setActiveTab('gallery'); setCurrentFolder(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gallery' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          All Memories
        </button>
        <button 
          onClick={() => setActiveTab('folders')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'folders' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Collections
        </button>
      </div>

      {/* --- Flashback (Gallery Only) --- */}
      {flashback && activeTab === 'gallery' && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-xl">⏪</span>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Time Capsule
            </h2>
          </div>
          <GlassCard onClick={() => setViewingEntry(flashback)} className="p-0 overflow-hidden relative aspect-video flex items-end cursor-pointer">
            {flashback.type === 'photo' && flashback.imageBase64 && (
              <img src={flashback.imageBase64} className="absolute inset-0 w-full h-full object-cover" alt="Flashback" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="relative z-10 p-4 w-full">
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white mb-2 uppercase tracking-widest border border-white/10">
                On this day
              </span>
              <p className="text-white font-serif italic text-lg leading-snug line-clamp-2">
                "{flashback.note || 'A vibe from the past...'}"
              </p>
            </div>
          </GlassCard>
        </section>
      )}

      {/* --- Folder View Logic --- */}
      {activeTab === 'folders' && !currentFolder && (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-2 gap-4">
             {/* Create New Folder Button */}
             <button 
               onClick={() => setIsCreatingFolder(true)}
               className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
             >
               <span className="text-3xl">+</span>
               <span className="text-xs font-bold">New Folder</span>
             </button>

             {/* Folder List */}
             {folders.map(folder => {
                const count = entries.filter(e => e.folderId === folder.id).length;
                return (
                  <GlassCard 
                    key={folder.id} 
                    className="aspect-square p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/50 cursor-pointer relative group"
                  >
                    <div onClick={() => setCurrentFolder(folder)} className="flex flex-col items-center gap-2 w-full h-full justify-center">
                      <span className="text-4xl">{folder.icon}</span>
                      <span className="font-bold text-gray-800 dark:text-white text-center leading-tight">{folder.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{count} items</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </GlassCard>
                );
             })}
          </div>

          {/* Create Folder Modal/Input Area */}
          {isCreatingFolder && (
            <GlassCard className="p-4 space-y-3 animate-fade-in">
              <h3 className="font-bold text-sm uppercase text-gray-500">Create Collection</h3>
              <div className="flex gap-2">
                <div className="w-1/4">
                  <NeuInput value={newFolderIcon} onChange={e => setNewFolderIcon(e.target.value)} className="text-center" />
                </div>
                <div className="w-3/4">
                  <NeuInput placeholder="Folder Name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
                </div>
              </div>
              <div className="flex gap-2">
                <NeuButton onClick={() => setIsCreatingFolder(false)} className="flex-1 py-2 text-sm">Cancel</NeuButton>
                <NeuButton onClick={handleCreateFolder} variant="primary" className="flex-1 py-2 text-sm">Create</NeuButton>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* --- Content View (Gallery or Inside Folder) --- */}
      {(activeTab === 'gallery' || currentFolder) && (
        <section className="animate-fade-in">
          
          {/* Folder Header if inside folder */}
          {activeTab === 'folders' && currentFolder && (
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setCurrentFolder(null)} className="text-2xl">⬅️</button>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                {currentFolder.icon} {currentFolder.name}
              </h2>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {visibleEntries.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-gray-400 italic">No memories here yet.</div>
            ) : (
              visibleEntries.map((entry, idx) => (
                <LoreCard 
                  key={entry.id} 
                  entry={entry} 
                  index={idx} 
                  folders={folders}
                  onMove={(folderId) => onMoveEntry(entry.id, folderId)}
                  onView={() => setViewingEntry(entry)}
                  onEdit={() => setEditingEntry(entry)}
                  onDelete={() => handleDelete(entry.id)}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* --- Lightbox Modal --- */}
      {viewingEntry && (
         <div 
           className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
           onClick={() => setViewingEntry(null)}
         >
           <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              {viewingEntry.type === 'photo' && viewingEntry.imageBase64 ? (
                <img src={viewingEntry.imageBase64} alt="Full View" className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl" />
              ) : viewingEntry.type === 'audio' ? (
                <div className="p-10 bg-gray-900 rounded-3xl flex flex-col items-center gap-6">
                   <div className="text-6xl">🎤</div>
                   <audio controls src={viewingEntry.audioBase64} className="w-full" />
                </div>
              ) : (
                <div className="p-10 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center text-center">
                   <p className="text-2xl font-serif italic text-gray-800 dark:text-white">"{viewingEntry.note}"</p>
                </div>
              )}

              <div className="mt-6 text-white">
                 <p className="text-lg font-medium">{viewingEntry.note}</p>
                 <div className="text-sm text-gray-400 flex gap-4 mt-2">
                   <span>{new Date(viewingEntry.timestamp).toLocaleString()}</span>
                   {viewingEntry.editedTimestamp && <span className="italic">(Edited)</span>}
                 </div>
                 <div className="flex gap-4 mt-6">
                   <button onClick={() => { setEditingEntry(viewingEntry); setViewingEntry(null); }} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20">Edit</button>
                   <button onClick={() => handleDelete(viewingEntry.id)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30">Delete</button>
                   <button onClick={() => setViewingEntry(null)} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 ml-auto">Close</button>
                 </div>
              </div>
           </div>
         </div>
      )}

      {/* --- Edit Modal --- */}
      {editingEntry && (
        <EditModal 
          entry={editingEntry} 
          onClose={() => setEditingEntry(null)} 
          onSave={handleSaveEdit} 
        />
      )}

    </div>
  );
};

// --- Components ---

const EditModal = ({ entry, onClose, onSave }: { entry: JournalEntry, onClose: () => void, onSave: (e: JournalEntry) => void }) => {
  const [note, setNote] = useState(entry.note);
  
  // Image Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [imgSrc, setImgSrc] = useState(entry.imageBase64 || '');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSave = () => {
    if (entry.type !== 'photo') {
      onSave({ ...entry, note });
      return;
    }
    
    // Apply filters to canvas and get new Base64
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      if (canvas && ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%)`;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const newBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onSave({ ...entry, imageBase64: newBase64, note });
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-neu-base dark:bg-gray-900 w-full max-w-lg h-[90vh] sm:h-auto sm:rounded-3xl p-6 flex flex-col overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Edit Memory</h3>
        
        <div className="space-y-6 flex-1">
          {/* Photo Editing Controls */}
          {entry.type === 'photo' && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-black">
                 <img 
                    src={imgSrc} 
                    className="w-full h-64 object-contain"
                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%)` }} 
                    alt="Preview"
                 />
                 <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Brightness</label>
                  <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Contrast</label>
                  <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Saturation</label>
                  <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Sepia</label>
                  <input type="range" min="0" max="100" value={sepia} onChange={e => setSepia(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              </div>
            </div>
          )}

          {/* Note Editing */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase">
               {entry.type === 'audio' ? 'Caption / Title' : 'Note'}
             </label>
             <NeuTextArea value={note} onChange={e => setNote(e.target.value)} rows={entry.type === 'text' ? 8 : 3} />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <NeuButton onClick={onClose} className="flex-1">Cancel</NeuButton>
          <NeuButton onClick={handleImageSave} variant="primary" className="flex-1">Save Changes</NeuButton>
        </div>
      </div>
    </div>
  )
}

interface LoreCardProps {
  entry: JournalEntry;
  index: number;
  folders: Folder[];
  onMove: (folderId: string | undefined) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const LoreCard: React.FC<LoreCardProps> = ({ entry, index, folders, onMove, onView, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isFullWidth = (index % 5 === 0);

  const dateObj = new Date(entry.timestamp);
  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <GlassCard 
      onClick={onView}
      className={`overflow-hidden relative group transition-all duration-300 cursor-pointer ${isFullWidth ? 'col-span-2 aspect-[2/1]' : 'aspect-[4/5]'} flex flex-col`}
    >
      
      {/* --- Visual Content --- */}
      <div className="flex-1 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {entry.type === 'photo' && entry.imageBase64 ? (
          <img src={entry.imageBase64} alt="Memory" className="w-full h-full object-cover" />
        ) : entry.type === 'audio' ? (
           <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-indigo-100 dark:from-pink-900 dark:to-indigo-900 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎤</span>
              </div>
           </div>
        ) : (
          <div className="w-full h-full p-5 flex flex-col justify-center items-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 text-center relative">
             <p className={`font-serif italic text-gray-700 dark:text-gray-300 z-10 ${isFullWidth ? 'text-2xl line-clamp-3' : 'text-sm line-clamp-6'}`}>
               "{entry.note}"
             </p>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
        
        {/* Info Layer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20">
          {(entry.type === 'photo' || entry.type === 'audio') && (
             <p className="text-xs font-medium leading-snug line-clamp-1 mb-2 opacity-90">
               {entry.note || (entry.type === 'audio' ? 'Audio Note' : '')}
             </p>
          )}
          
          {/* Audio Player - Prevent click propagation so audio can play without opening modal immediately */}
          {entry.type === 'audio' && entry.audioBase64 && (
            <div onClick={e => e.stopPropagation()}>
              <audio controls src={entry.audioBase64} className="h-6 w-full mb-2 opacity-90 scale-90 origin-left" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between border-t border-white/20 pt-2 mt-1">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{dateStr}</span>
               {entry.editedTimestamp && <span className="text-[8px] italic opacity-60">Edited</span>}
             </div>
             <span className="text-[10px] font-mono bg-white/20 rounded px-1.5 py-0.5">{timeStr}</span>
          </div>
        </div>

        {/* --- Menu Button (Top Right) --- */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white z-30 hover:bg-black/60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM17.25 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>

        {/* --- Dropdown Menu --- */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}></div>
            <div className="absolute top-10 right-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden text-sm font-medium animate-fade-in border border-gray-200 dark:border-gray-700">
               
               {/* Edit/Delete Actions */}
               <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(); }} className="w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-b border-gray-100 dark:border-gray-700 font-bold flex items-center gap-2">
                  ✏️ Edit / Info
               </button>
               <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }} className="w-full text-left px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 border-b border-gray-100 dark:border-gray-700 font-bold flex items-center gap-2">
                  🗑️ Delete
               </button>

               <div className="p-2 border-b border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 uppercase tracking-widest font-bold">Move to...</div>
               <div className="max-h-32 overflow-y-auto">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMove(undefined); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                 >
                   <span>🏠</span> General
                 </button>
                 {folders.map(f => (
                   <button 
                     key={f.id}
                     onClick={(e) => { e.stopPropagation(); onMove(f.id); setShowMenu(false); }}
                     className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                   >
                     <span>{f.icon}</span> {f.name}
                   </button>
                 ))}
               </div>
            </div>
          </>
        )}

      </div>
    </GlassCard>
  );
};
