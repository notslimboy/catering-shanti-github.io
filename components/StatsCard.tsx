"use client";

import { motion } from "framer-motion";
import { itemVariants } from "./BentoGrid";
import { Star, ShoppingBag, UtensilsCrossed, Clock } from "lucide-react";

const stats = [
    { icon: ShoppingBag, value: "5rb+", label: "Pesanan selesai" },
    { icon: Star, value: "4.9★", label: "Rating pelanggan" },
    { icon: UtensilsCrossed, value: "15+", label: "Varian menu" },
    { icon: Clock, value: "H-1", label: "Pemesanan" },
];

export function StatsCard() {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                boxShadow: "0 0 28px rgba(6, 78, 59, 0.30)",
                y: -2,
                transition: { duration: 0.2 },
            }}
            // spans 2 cols on large screens to fill the row after 2 testimonials
            className="sm:col-span-2 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950/80 to-zinc-900 border border-emerald-900/30 dark:border-emerald-800/20 p-6 flex flex-col justify-center h-full"
        >
            <h2 className="text-xs font-bold text-emerald-400 tracking-widest mb-4 text-center">
                Keunggulan Shanti Catering
            </h2>
            {/* 4-col grid when spanning 2 cols (lg), 2×2 otherwise */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.04 }}
                            className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-white/5 dark:bg-white/3 border border-white/10 text-center"
                        >
                            <Icon className="w-5 h-5 text-emerald-400" />
                            <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                            <span className="text-xs text-emerald-200/60 font-medium">{stat.label}</span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Certification badges */}
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-base">🌙</span>
                    <div>
                        <p className="text-xs font-bold text-white leading-none">Halal MUI</p>
                        <p className="text-[10px] text-emerald-300/60 mt-0.5">Bersertifikat</p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-base">✅</span>
                    <div>
                        <p className="text-xs font-bold text-white leading-none">Berizin Dinkes</p>
                        <p className="text-[10px] text-emerald-300/60 mt-0.5">Terdaftar resmi</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
