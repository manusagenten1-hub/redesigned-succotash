/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import React from "react";

const links = [
  { label: "CRM", url: "https://tecnova-crm.vercel.app/" },
  { label: "Playbook", url: "https://playbook-agencia.vercel.app/" },
  { label: "Discord", url: "https://discord.com/invite/p3jadHJHzW" },
  { label: "Slides de propostas", url: "https://www.canva.com/design/DAHE0Plpwe8/O7CYQORPbYYCpsd1j6wS7g/edit" },
  { label: "Site", url: "https://nexoraweb-omega.vercel.app/" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#621114] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.3),_transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#3a080a] via-[#621114] to-[#3a080a] animate-gradient-slow opacity-80" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center space-y-2 mb-10"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            x: [0, -1, 1, -1, 0]
          }}
          transition={{ 
            duration: 0.8,
            x: { duration: 0.5, delay: 0.5 }
          }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Link Hub - <span className="text-[#FFFFFF]">Tec</span><span className="text-[#E60103]">Nova</span>
        </motion.h1>
      </motion.div>

      <div className="z-10 w-full max-w-md space-y-4">
        {links.map((link, index) => {
          return (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative w-full p-4 bg-[#0a0a0a] border border-[#ef4444] rounded-xl hover:bg-[#1a1a1a] transition-colors font-medium shadow-lg hover:shadow-[#ef4444]/20 flex items-center justify-center group text-center"
            >
              <span className="flex-grow">{link.label}</span>
              <ArrowRight className="w-5 h-5 text-[#ef4444] absolute right-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
