import { useEffect, useRef, useState } from "react";

function FileItem({ file, onDownload, onPreview }) {
  return (
    <div className="group border rounded-lg p-3 hover:shadow-sm flex items-center justify-between">
      <div>
        <div className="font-medium text-slate-800">{file.name}</div>
        <div className="text-xs text-slate-500">{(file.size/1024).toFixed(1)} KB • {file.mime_type}</div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button onClick={()=>onPreview(file)} className="text-blue-600 text-sm">Preview</button>
        <button onClick={()=>onDownload(file)} className="text-slate-700 text-sm">Download</button>
      </div>
    </div>
  );
}

export default function Dashboard({ token, backendUrl }){
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const fileInput = useRef(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  const refresh = async () => {
    setLoading(true)
    try {
      const [fRes, fiRes] = await Promise.all([
        fetch(`${backendUrl}/folders${parentId?`?parent_id=${parentId}`:""}`, { headers: authHeader }),
        fetch(`${backendUrl}/files${parentId?`?folder_id=${parentId}`:""}`, { headers: authHeader }),
      ]);
      const f = await fRes.json();
      const fi = await fiRes.json();
      setFolders(f.folders || []);
      setFiles(fi.files || []);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ refresh(); }, [parentId]);

  const createFolder = async () => {
    const name = prompt("Folder name");
    if(!name) return;
    await fetch(`${backendUrl}/folders`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent_id: parentId })
    });
    refresh();
  };

  const upload = async (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const form = new FormData();
    form.append("file", f);
    if(parentId) form.append("folder_id", parentId);
    await fetch(`${backendUrl}/files/upload`, {
      method: "POST",
      headers: authHeader,
      body: form,
    });
    e.target.value = "";
    refresh();
  };

  const search = async () => {
    const url = new URL(`${backendUrl}/files`);
    if(parentId) url.searchParams.append("folder_id", parentId);
    if(q) url.searchParams.append("q", q);
    const res = await fetch(url, { headers: authHeader });
    const data = await res.json();
    setFiles(data.files||[]);
  };

  const download = (file) => {
    window.open(`${backendUrl}/files/${file._id}/download?token=${token}`, "_blank");
  };

  const preview = (file) => {
    // Simple strategy: for images/text/pdf, let the browser try to open the download URL
    window.open(`${backendUrl}/files/${file._id}/download?token=${token}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="font-semibold">My Drive</div>
        <div className="flex items-center gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search files" className="border rounded-lg px-3 py-1"/>
          <button onClick={search} className="px-3 py-1 rounded-lg bg-slate-800 text-white">Search</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={()=>fileInput.current?.click()} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Upload</button>
          <input ref={fileInput} type="file" onChange={upload} className="hidden"/>
          <button onClick={createFolder} className="px-3 py-2 bg-slate-200 rounded-lg">New folder</button>
        </div>

        <section>
          <h2 className="text-sm text-slate-500 mb-2">Folders</h2>
          {folders.length === 0 ? (
            <div className="text-slate-500 text-sm">No folders</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {folders.map(f=> (
                <button key={f._id} onClick={()=>setParentId(f._id)} className="border rounded-lg p-3 text-left hover:shadow-sm">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-slate-500">Open</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm text-slate-500 mb-2">Files</h2>
          {files.length === 0 ? (
            <div className="text-slate-500 text-sm">No files</div>
          ) : (
            <div className="grid gap-3">
              {files.map(file => (
                <FileItem key={file._id} file={file} onDownload={download} onPreview={preview} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
