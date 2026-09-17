import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Shield, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          {/* Col 1: University Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 p-0.5 bg-white border border-slate-200 rounded flex items-center justify-center">
                <img
                  src="/cu-logo.svg"
                  alt="CU Seal"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  University of Chittagong
                </h3>
                <p className="text-xs text-slate-500 font-bangla-serif">
                  চট্টগ্রাম বিশ্ববিদ্যালয় • Estd. 1966
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
              The official centralized services directory (<span className="font-mono font-medium text-slate-800">services.cu.ac.bd</span>) managed by the Information and Communication Technology (ICT) Cell to provide uninterrupted single-point access to digital campus portals.
            </p>
            <div className="flex items-center gap-2 pt-1 text-2xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational •
            </div>
          </div>

          {/* Col 2: ICT Helpdesk & Contacts */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              ICT Cell Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Room No. 201, ICT Cell, IT Building, University of Chittagong, Hathazari, Chattogram 4331</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href="mailto:support.ict@cu.ac.bd" className="hover:text-emerald-700 underline decoration-slate-300">
                  support.ict@cu.ac.bd
                </a>
              </li>
              {/* <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+880-31-726311-14 (Ext. 4235)</span>
              </li> */}
            </ul>
          </div>

          {/* Col 3: Key University Portals */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Institutional Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://cu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  CU Main Website <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://admission.cu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  Undergraduate Admission Portal <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://library.cu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  CU Central Library <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://research.cu.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  Research Repository <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-slate-600">
          <p>© {new Date().getFullYear()} University of Chittagong. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Hosted at <strong className="font-mono text-slate-700">services.cu.ac.bd</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              ICT Cell Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
