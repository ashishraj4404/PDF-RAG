"use client"
import { Upload } from "lucide-react";

const FileUpload = () => {
  const handleFileUploadClickButton = async (e : React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);
    // console.log(file)
    // console.log(formData);
    try {

      await fetch('http://localhost:8000/upload/pdf', {
        method : 'POST',
        body : formData
    })
    console.log('uploaded !')
    } catch(err) {
      console.log(err);
    }
  }
  return (
    <div>
      <input type="file" id="file" accept="application/pdf" onChange={handleFileUploadClickButton} hidden />
      <label htmlFor="file" className="bg-zinc-900 flex justify-center items-center flex-col p-4 border-white border-2 rounded-3xl text-white">
      <h3>Upload PDF File</h3>
      <Upload />
      </label>
    </div>
  )
};

export default FileUpload
