"use client";

import { motion } from "framer-motion";
import { itemVariants } from "./BentoGrid";
import { MessageCircle, UtensilsCrossed } from "lucide-react";
import { WA_NUMBER } from "@/constants/config";



const paket = [
    {
        icon: "🍱",
        name: "Nasi Kotak",
        desc: "Paket lengkap untuk gathering, arisan & rapat kantor",
        wa: "Nasi+Kotak",
    },
    {
        icon: "🎋",
        name: "Tumpengan",
        desc: "Tumpeng tradisional untuk syukuran & perayaan spesial",
        wa: "Tumpengan",
    },
    {
        icon: "🫕",
        name: "Menu Arab",
        desc: "Nasi Kebuli, Mandi & Kambing untuk acara keagamaan",
        wa: "Menu+Arab",
    },
];

export function PaketCard() {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                boxShadow: "0 0 24px rgba(6,78,59,0.30)",
                y: -2,
                transition: { duration: 0.2 },
            }}
            className="rounded-3xl overflow-hidden bg-card border border-border p-5 flex flex-col gap-3"
        >
            <div className="flex items-center gap-2 mb-1">
                <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest">
                    Paket kami
                </h2>
            </div>

            {paket.map((p) => (
                <motion.a
                    key={p.name}
                    href={`https://wa.me/${WA_NUMBER}?text=Halo+Shanti+Catering,+saya+ingin+tanya+tentang+paket+${p.wa}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/20 transition-all group cursor-pointer"
                >
                    <span className="text-2xl leading-none mt-0.5">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground tracking-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{p.desc}</p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </motion.a>
            ))}
        </motion.div>
    );
}
