/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
import { FileText, Camera, ArrowRight, CalendarClock } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { requireGDriveAuth } from "./utils/getTokenAuth";

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-[#1C1F24] via-[#2a2d32] to-[#1C1F24]">
    <div
      className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
      style={{ borderColor: "#E77E4F" }}
    ></div>
    <p className="text-sm" style={{ color: "#b8a88e" }}>
      Memeriksa otentikasi...
    </p>
  </div>
);

export default function Linktree() {
  const [isLoading, setIsLoading] = useState(true);

  const links = [
    {
      title: "Notulen Pertemuan",
      description: "Upload dan kelola catatan hasil pertemuan",
      href: "apps/meeting-notes",
      icon: FileText,
      color: "from-[#E77E4F] to-[#d96e42]",
    },
    {
      title: "Dokumentasi Kegiatan",
      description: "Unggah foto dan dokumentasi kegiatan Karang Taruna",
      href: "apps/activity-docs",
      icon: Camera,
      color: "from-[#E77E4F] to-[#d96e42]",
    },{
      title: "Timeline Proyek",
      description: "Kelola dan pantau timeline proyek secara efisien.",
      href: "apps/timeline",
      icon: CalendarClock,
      color: "from-[#E77E4F] to-[#d96e42]",
    },
  ];

  useEffect(() => {
    const token = requireGDriveAuth();

    if (token !== undefined) {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-[#1C1F24] via-[#2a2d32] to-[#1C1F24]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center flex flex-col items-center gap-2 mb-8 md:mb-12">
          <div className="relative w-34 h-34 sm:w-42 sm:h-42 md:w-48 md:h-48 lg:w-54 lg:h-54 aspect-square mb-6">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain rounded-2xl"
              draggable="false"
            />
          </div>
          <h1 className="text-xl md:text-4xl font-bold text-[#F5E9D6] mb-2 md:mb-4 text-balance">
            Hub Karang Taruna RW 02 Pekunden
          </h1>
          <p className="text-xs md:text-base text-[#F5E9D6]/70 text-balance">
            Kelola semua kebutuhan Karang Taruna RW 02 Pekunden di satu tempat
            dengan mudah dan efisien, yang dapat diakses kapan saja
          </p>
        </div>
        <div className="grid gap-3 md:gap-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden bg-[#1C1F24]/50 border-[#E77E4F]/20 rounded-lg md:rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 md:gap-6 p-3 md:p-6">
                    <div
                      className={`bg-linear-to-br ${link.color} p-2 md:p-4 rounded-lg md:rounded-xl text-white shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-4 h-4 md:w-8 md:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-xl font-bold text-[#F5E9D6] mb-0.5 md:mb-1 group-hover:text-[#E77E4F] transition line-clamp-1">
                        {link.title}
                      </h2>
                      <p className="text-[#F5E9D6]/60 text-xs md:text-sm line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#F5E9D6]/40 shrink-0 group-hover:translate-x-1 group-hover:text-[#E77E4F] transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
