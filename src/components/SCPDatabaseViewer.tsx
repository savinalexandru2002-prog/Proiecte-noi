import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  X,
  ExternalLink,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

import cctvBrasov from '../assets/images/cctv_brasov_subterranean_1793728562302.jpg';
import cctvOnesti from '../assets/images/cctv_onesti_dumbrava_1793728577062.jpg';
import cctvSite19 from '../assets/images/cctv_site19_scp173_1793728606406.jpg';
import cctvBodycam from '../assets/images/cctv_mtf_bodycam_1793728622584.jpg';
import scpGuardImg from '../assets/images/scp_guard_edit_pinterest.jpg';

export interface SCPItem {
  id: string;
  code: string;
  name: string;
  classType: 'Safe' | 'Euclid' | 'Keter' | 'Thaumiel';
  location: string;
  hume: string;
  description: string;
  containment: string;
  image: string;
  threatLevel: 'Green' | 'Yellow' | 'Orange' | 'Red';
  mtfUnit: string;
}

const INITIAL_DATABASE: SCPItem[] = [
  {
    id: 'scp-173',
    code: 'SCP-173',
    name: 'Statuia de Beton (Contact Vizual Permanent)',
    classType: 'Euclid',
    location: 'Situl-19 (Sector Heavy Containment)',
    hume: '1.00 Hume',
    description: 'Construit din beton și armătură de oțel cu urme de vopsea spray marca Krylon. Este animat și extrem de ostil. Obiectul nu se poate mișca atunci când se află în linia directă de vedere a cel puțin o persoană.',
    containment: 'Păstrat într-un container închis ermetic în permanență. Personalul care intră în container trebuie să mențină contactul vizual în rotație de câte 3 persoane.',
    image: cctvSite19,
    threatLevel: 'Red',
    mtfUnit: 'Garnizoana Centrală O5'
  },
  {
    id: 'scp-106',
    code: 'SCP-106 / INC-RO-062',
    name: 'Bătrânul Coroziv / Perchiu-Dumbrava',
    classType: 'Keter',
    location: 'Dumbrava / Onești (Sector RO-02 / TEZ-14)',
    hume: '0.62 Hume',
    description: 'Umanoid în vârstă cu aspect de descompunere avansată. Produce un lichid negru puternic coroziv care dizolvă materia organică și structurală, având abilitatea de a traversa materia solidă.',
    containment: 'Păstrat într-un container de oțel sigilat secundar suspendat în câmp magnetic. Ancore Scranton SRA-4 active pe raza de 4.5 km.',
    image: cctvOnesti,
    threatLevel: 'Red',
    mtfUnit: 'MTF Epsilon-11 „Nine-Tailed Fox”'
  },
  {
    id: 'scp-087-b',
    code: 'SCP-087-B / SCP-RO-041',
    name: 'Galeria Abisală Subterană (-24m)',
    classType: 'Euclid',
    location: 'Brașov (Sala Polivalentă & Subteran)',
    hume: '0.68 Hume',
    description: 'Gaură de acces topologică necartografiată care coboară fără un capăt identificat sub platforma Brașov. Emană infrasunete la 7.83 Hz și abateri de realitate.',
    containment: 'Dublu scut balistic din plăci de titan-tungsten, injecții cu beton refractar și supraveghere CCTV 24/7 pe canalul CH-01.',
    image: cctvBrasov,
    threatLevel: 'Orange',
    mtfUnit: 'MTF Beta-7 „Maz Hatters”'
  },
  {
    id: 'scp-096',
    code: 'SCP-096 / INC-RO-089',
    name: 'Omul Timid / Masivul Postăvaru',
    classType: 'Keter',
    location: 'Poiana Brașov & Masivul Postăvaru',
    hume: '0.74 Hume',
    description: 'Umanoid înalt de 2.38 metri, cu membre disproporționate. Vizualizarea feței subiecților (directă sau prin fotografie) declanșează o stare de agitație extremă neoprită până la eliminarea privitorului.',
    containment: 'Celula de conținere cubică din oțel fără senzori optici directi. Detașamentul MTF Nu-7 utilizează echipament SCRAMBLE pentru cenzura automată.',
    image: cctvBodycam,
    threatLevel: 'Orange',
    mtfUnit: 'Detașament Nu-7 „Hammer Down”'
  },
  {
    id: 'scp-ro-102',
    code: 'SCP-RO-102',
    name: 'Entitatea de Fluctuație Subterană Dâmbovița',
    classType: 'Keter',
    location: 'București (Sectorul 0 - Subteran Unirii)',
    hume: '0.82 Hume',
    description: 'Masă de materie spațio-temporală non-euclidiană ancorată în cursul rectificat al râului Dâmbovița. Se hrănește cu zgomotul termic al metroului.',
    containment: 'Traseul metroului este utilizat drept ancoră de rețea. Accesul civil este restricționat sub pretextul lucrărilor tehnice de canalizare.',
    image: scpGuardImg,
    threatLevel: 'Yellow',
    mtfUnit: 'MTF-RO-9 „Câinii de Beton”'
  }
];

export function SCPDatabaseViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<SCPItem | null>(null);

  const filteredItems = INITIAL_DATABASE.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'ALL' || item.classType === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search and Filters */}
      <div className="bg-[#111b21] border border-pink-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222e35]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/30">
              <Lock className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-pink-300 uppercase tracking-wider">Arhivă & Bază de Date Clasificată SCP</h3>
              <p className="text-xs text-[#8696a0]">Acces Confirmat Nivel 5 // Consiliul O5 Direct</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30">
            <Sparkles className="w-3 h-3" />
            <span>5 DOSARE SINCRONIZATE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după cod SCP, nume sau locație (ex: București, SCP-106)..."
              className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#e9edef] focus:outline-none focus:border-pink-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0b141a] p-1 border border-[#222e35] rounded-xl">
            {['ALL', 'Safe', 'Euclid', 'Keter'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedClass(type)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  selectedClass === type
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-400 shadow'
                    : 'text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of SCP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-[#111b21] border border-[#222e35] hover:border-pink-500/40 rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-pink-500/10"
          >
            <div>
              <div className="relative h-40 overflow-hidden bg-black">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111b21] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    item.classType === 'Keter'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : item.classType === 'Euclid'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {item.classType}
                  </span>
                  <span className="px-2 py-0.5 bg-black/80 text-cyan-300 border border-cyan-500/30 rounded text-[9px] font-mono font-bold">
                    {item.hume}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-pink-400">{item.code}</span>
                  <span className="text-[10px] text-[#8696a0] font-mono">{item.mtfUnit}</span>
                </div>
                <h4 className="font-bold text-sm text-[#e9edef] group-hover:text-pink-300 transition-colors line-clamp-1">{item.name}</h4>
                <p className="text-xs text-[#8696a0] line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="w-full py-2 bg-[#0b141a] hover:bg-[#1a2730] border border-[#222e35] rounded-xl text-xs font-bold text-pink-300 flex items-center justify-center gap-2 transition-colors">
                <Eye className="w-3.5 h-3.5 text-pink-400" />
                <span>Deschide Dosar Tehnic</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Item Details */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111b21] w-full max-w-2xl rounded-3xl border border-pink-500/50 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#1a2730] border-b border-[#222e35] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/30">
                  <FileText className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-pink-300 uppercase tracking-wider">{selectedItem.code} // {selectedItem.name}</h3>
                  <p className="text-[10px] text-[#8696a0]">Locație: {selectedItem.location}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-[#8696a0] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="relative h-56 rounded-2xl overflow-hidden border border-[#222e35] bg-black">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-lg text-xs font-mono font-bold uppercase">
                      CLASA: {selectedItem.classType}
                    </span>
                    <span className="px-2.5 py-1 bg-black/80 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold">
                      {selectedItem.hume}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-black/80 px-3 py-1 rounded-lg border border-white/20">
                    {selectedItem.mtfUnit}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#0b141a] border border-[#222e35] rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">Descriere Generală</h4>
                  <p className="text-xs text-[#e9edef] leading-relaxed">{selectedItem.description}</p>
                </div>

                <div className="p-4 bg-[#0b141a] border border-[#222e35] rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Proceduri Speciale de Conținere (SOP)</h4>
                  <p className="text-xs text-[#e9edef] leading-relaxed">{selectedItem.containment}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#1a2730] border-t border-[#222e35] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-[#8696a0]">SISTEM DE CĂUTARE & ARHIVĂ O5</span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Închide Dosar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
