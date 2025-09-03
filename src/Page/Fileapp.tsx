import React, { useState, useEffect } from "react";
import { FaFileDownload, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function Fileapp() {
  const FileDownloadIcon = FaFileDownload as unknown as React.FC;
  const DeleteIcon = MdDelete as unknown as React.FC;
  const EditIcon = FaEdit as unknown as React.FC;

  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editFilename, setEditFilename] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetch("https://file-app-node-js.vercel.app/files")
      .then((res) => res.json())
      .then((data) => setUploadedFiles(data))
      .catch(() => setMessage("Failed to fetch files"));
  }, []);

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", singleFile);
    formData.append("description", description);

    try {
      const res = await fetch("https://file-app-node-js.vercel.app/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setMessage(data.message || "File uploaded successfully!");
      setUploadedFiles((prev) => [data.file, ...prev]);

      setSingleFile(null);
      setDescription("");
    } catch (err) {
      setMessage("Upload failed");
    }
  };

  const handleDownload = (id: number) => {
    window.location.href = `https://file-app-node-js.vercel.app/files/${id}/download`;
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("you want to delete this file?")) return;

    try {
      await fetch(`https://file-app-node-js.vercel.app/files/${id}`, { method: "DELETE" });
      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
      setMessage("File deleted successfully!");
    } catch {
      setMessage("Delete failed");
    }
  };

  const handleEdit = async (id: number) => {
    if (editingFileId === id) {
      try {
        const res = await fetch(`https://file-app-node-js.vercel.app/files/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: editFilename, description: editDescription }),
        });
        const data = await res.json();

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, filename: editFilename, description: editDescription } : f
          )
        );
        setMessage(data.message || "File updated successfully!");
        setEditingFileId(null); 
      } catch {
        setMessage("Update failed");
      }
    } else {
      const file = uploadedFiles.find((f) => f.id === id);
      if (!file) return;
      setEditingFileId(id);
      setEditFilename(file.filename);
      setEditDescription(file.description);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">File Upload</h1>

      <form
        onSubmit={handleSingleUpload}
        className="bg-white shadow-md rounded-2xl p-6 mb-6 w-full max-w-md"
      >
        <h2 className="text-lg font-semibold mb-3">Upload Single File</h2>
        <input
          type="file"
          onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4
            file:rounded-lg file:border-0 file:text-sm file:font-semibold
            file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border-2 mb-5 rounded-md py-2 pl-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Upload
        </button>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">
            {message}
          </p>
        )}
      </form>

      {uploadedFiles.length > 0 && (
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-lg font-semibold mb-3 text-center">Uploaded Files</h2>
          <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-400 px-4 py-2">ID</th>
                <th className="border border-gray-400 px-4 py-2">File Name</th>
                <th className="border border-gray-400 px-4 py-2">Path</th>
                <th className="border border-gray-400 px-4 py-2">Description</th>
                <th className="border border-gray-400 px-4 py-2">Uploaded At</th>
                <th className="border border-gray-400 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file, index) => (
                <tr key={file.id} className="border-t">
                  <td className="border border-gray-400 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-400 px-4 py-2">
                    {editingFileId === file.id ? (
                      <input
                        type="text"
                        value={editFilename}
                        onChange={(e) => setEditFilename(e.target.value)}
                        className="border px-2 py-1 rounded"
                      />
                    ) : (
                      file.filename
                    )}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    <a
                      href={`https://file-app-node-js.vercel.app${file.pathname}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View File
                    </a>
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {editingFileId === file.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="border px-2 py-1 rounded"
                      />
                    ) : (
                      file.description
                    )}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {new Date(file.uploaded_at).toLocaleString()}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    <div className="flex gap-5">
                      <button
                        className="text-blue-400"
                        onClick={() => handleDownload(file.id)}
                      >
                        <FileDownloadIcon />
                      </button>

                      <button
                        className="text-red-500"
                        onClick={() => handleDelete(file.id)}
                      >
                        <DeleteIcon />
                      </button>

                      <button
                        className="text-green-400"
                        onClick={() => handleEdit(file.id)}
                      >
                        {editingFileId === file.id ? "Save" : <EditIcon />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Fileapp;
