import Image from "next/image";
import NatalChart from "./ui/NatalChart";
import BirthForm from "./ui/BirthForm";

export default function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] pt-3 bg-black">
      <main className="w-full items-center sm:items-start bg-black">
        <div className="w-full bg-white rounded-t-[50px] p-10 shadow-lg flex flex-row gap-10">
          <BirthForm />
          <NatalChart />
        </div>
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center bg-black h-[100px] w-full rounded-t-[30px]">
      </footer>
    </div>
  );
}


