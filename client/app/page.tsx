import AiChat from "@/components/ai-chat";
import FileUpload from "@/components/file-upload";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <div className="w-[30%] min-h-vh flex justify-center items-center">
        <FileUpload />
      </div>
      <div className="w-[70%] min-h-vh border-l-2 border-black relative">
        <AiChat />
      </div>
    </div>
  );
}
