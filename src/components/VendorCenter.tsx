import React, { useState, useEffect } from "react";
import { 
  Info, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Building2, 
  Tag, 
  DollarSign, 
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

interface VendorCenterProps {
  triggerToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  supplier: string;
  lastUpdated: string;
}

const DEFAULT_MATERIALS: Material[] = [
  { id: "mat-1", name: "Bamburi Powermax Cement CEM I 42.5N", category: "Concrete & Cement", price: 920, unit: "50Kg Bag", supplier: "Bamburi Special Concrete", lastUpdated: "2026-06-15" },
  { id: "mat-2", name: "Deformed High-Yield Reinforcement Steel T12", category: "Structural Metal", price: 1450, unit: "12m Bar", supplier: "Apex Steel Kenya", lastUpdated: "2026-06-20" },
  { id: "mat-3", name: "Sika Waterproofing Damp-proof Membrane Compound", category: "Chemical Additives", price: 8500, unit: "20L Jerrycan", supplier: "Bamburi Special Concrete", lastUpdated: "2026-06-10" },
  { id: "mat-4", name: "Centralized Solar Water Heating Thermal Tube Array", category: "Renewable Energy", price: 185000, unit: "System Unit", supplier: "Davis & Shirtliff", lastUpdated: "2026-06-22" },
  { id: "mat-5", name: "Double-Glazed Low-Emissivity Solar Defense Panels", category: "Windows & Glazing", price: 7800, unit: "Square Meter", supplier: "Alumil Kenya Ltd", lastUpdated: "2026-06-18" },
  { id: "mat-6", name: "High-Efficiency VRF HVAC Outdoor Condenser 10HP", category: "HVAC Machinery", price: 420000, unit: "Unit Set", supplier: "Usoni Air Conditioning", lastUpdated: "2026-06-24" }
];

export default function VendorCenter({ triggerToast }: VendorCenterProps) {
  // Persistence state
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem("blcts-materials");
    return saved ? JSON.parse(saved) : DEFAULT_MATERIALS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("blcts-materials", JSON.stringify(materials));
  }, [materials]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Add/Edit states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form values
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Concrete & Cement");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [supplier, setSupplier] = useState("");

  const categories = ["Concrete & Cement", "Structural Metal", "Chemical Additives", "Renewable Energy", "Windows & Glazing", "HVAC Machinery", "Finishes & Timber"];

  const handleOpenAddForm = () => {
    setFormMode("add");
    setEditingId(null);
    setName("");
    setCategory("Concrete & Cement");
    setPrice("");
    setUnit("50Kg Bag");
    setSupplier("Bamburi Special Concrete");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (mat: Material) => {
    setFormMode("edit");
    setEditingId(mat.id);
    setName(mat.name);
    setCategory(mat.category);
    setPrice(mat.price.toString());
    setUnit(mat.unit);
    setSupplier(mat.supplier);
    setIsFormOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !unit || !supplier) {
      triggerToast("Kindly fill in all material details", "warning");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      triggerToast("Please enter a valid material price greater than 0", "warning");
      return;
    }

    if (formMode === "add") {
      const newMat: Material = {
        id: `mat-${Date.now()}`,
        name,
        category,
        price: priceNum,
        unit,
        supplier,
        lastUpdated: new Date().toISOString().substring(0, 10)
      };
      setMaterials(prev => [newMat, ...prev]);
      triggerToast(`Successfully cataloged: ${name}`, "success");
    } else {
      setMaterials(prev => prev.map(m => m.id === editingId ? {
        ...m,
        name,
        category,
        price: priceNum,
        unit,
        supplier,
        lastUpdated: new Date().toISOString().substring(0, 10)
      } : m));
      triggerToast(`Successfully updated: ${name}`, "success");
    }

    setIsFormOpen(false);
  };

  const handleDeleteMaterial = (id: string, matName: string) => {
    if (window.confirm(`Are you sure you want to delete "${matName}" from the cost database?`)) {
      setMaterials(prev => prev.filter(m => m.id !== id));
      triggerToast(`Removed "${matName}" from the database`, "success");
    }
  };

  // Filtered materials list
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* SECTION A: MATERIAL COST DATABASE */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] space-y-6 text-left" id="material-cost-database">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide font-display flex items-center gap-1.5">
              <FileSpreadsheet className="w-4.5 h-4.5 text-slate-700" />
              <span>National Material Cost Database (Market Price Index)</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-light mt-0.5">
              Maintain, search, and manage localized material prices used in automated AI building feasibility and TCO forecasts.
            </p>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Material Price</span>
          </button>
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search material or manufacturer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-medium placeholder-slate-400 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap hidden md:inline">
              Filter:
            </span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold py-1.5 px-3 rounded-xl text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors w-full sm:w-auto"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MATERIAL COST DATABASE GRID / TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-550 font-bold uppercase tracking-wider text-[10px] font-display select-none">
                <th className="p-3.5">Material Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Approved Manufacturer</th>
                <th className="p-3.5 text-right">Price Index (KSh)</th>
                <th className="p-3.5 text-center">Unit</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredMaterials.map(mat => (
                <tr key={mat.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-3.5">
                    <strong className="font-bold text-slate-800 text-[12px] block">
                      {mat.name}
                    </strong>
                    <span className="text-[9px] text-slate-400 font-light block mt-0.5">
                      Last Updated: {mat.lastUpdated}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 rounded-lg px-2 py-0.5">
                      <Tag className="w-2.5 h-2.5 text-slate-450" />
                      {mat.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{mat.supplier}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-[13px]">
                    KSh {mat.price.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center text-slate-500 font-medium">
                    {mat.unit}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditForm(mat)}
                        className="p-1 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                        className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-450 font-light leading-relaxed">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No materials found matching your search. Please add a new material entry above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* INLINE ADD/EDIT DIALOG BOX */}
        {isFormOpen && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mt-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                {formMode === "add" ? "Register New Material Cost Index" : "Edit Cost Index Entry"}
              </h4>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-display">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bamburi CEM II Cement"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-display">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-display">Current Price Index (KSh) *</label>
                <div className="relative">
                  <span className="text-slate-400 text-xs absolute left-3 top-2 font-mono">KSh</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 950"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-11 pr-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-display">Unit of Measurement *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50Kg Bag, SQM, Jerrycan"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-display">Approved Manufacturer/Supplier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bamburi Special Concrete"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200/60 select-none">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition-colors"
                >
                  {formMode === "add" ? "Register Cost" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* SECTION B: PARTNER CONTRACTORS & SOURCE DIRECTORY (EXISTING CODE PRESERVED) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] space-y-6 text-left">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide font-display flex items-center gap-1.5">
            <Building2 className="w-4.5 h-4.5 text-slate-700" />
            <span>Pre-Vetted Partner Contractors & Manufacturers Directory</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">
            Suppliers offering high-durability, premium building components committed to mitigating the first-cost bias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Vendor 1 */}
          <div className="bg-[#fafcfd] border border-slate-200/50 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-extrabold tracking-widest py-0.5 px-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100/50 font-display">
                  Materials & Concrete
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-xs flex items-center justify-center shadow-sm select-none">
                  BSC
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Bamburi Special Concrete
              </h4>
              <p className="text-[11px] leading-relaxed font-light text-slate-500">
                Supplier of custom aggregate pre-cast cement and structural concrete additives explicitly formulated for wet foundation structures in heavy Nairobi clay layers.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-550">
              <span className="text-slate-400">Location: Athi River</span>
              <span className="font-bold text-emerald-600">✓ Vetted Partner</span>
            </div>
          </div>

          {/* Vendor 2 */}
          <div className="bg-[#fafcfd] border border-slate-200/50 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-extrabold tracking-widest py-0.5 px-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-100/50 font-display">
                  Water & Pumps
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-blue-400 font-extrabold text-xs flex items-center justify-center shadow-sm select-none">
                  D&S
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Davis & Shirtliff
              </h4>
              <p className="text-[11px] leading-relaxed font-light text-slate-500">
                Industry leaders in deep borehole rigs, smart solar water pump systems, and greywater reverse-osmosis filtration setups for residential properties across East Africa.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-550">
              <span className="text-slate-400">Dundori Road, Nairobi</span>
              <span className="font-bold text-emerald-600">✓ Vetted Partner</span>
            </div>
          </div>

          {/* Vendor 3 */}
          <div className="bg-[#fafcfd] border border-slate-200/50 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-extrabold tracking-widest py-0.5 px-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-100/50 font-display">
                  Mechanical & Lift
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-500 font-extrabold text-xs flex items-center justify-center shadow-sm select-none">
                  OTI
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Otis East Africa Ltd
              </h4>
              <p className="text-[11px] leading-relaxed font-light text-slate-500">
                Vertical transit mechanics providing passenger lift lines, regenerative energy conservation traction gears, and 10-year suspension steel guarantees.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-550">
              <span className="text-slate-400">Mombasa Road, Nairobi</span>
              <span className="font-bold text-emerald-600">✓ Vetted Partner</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center justify-between flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="text-[11px] text-slate-600 font-light">
              Do you supply sustainable, pre-vetted construction materials or green-building solar components in East Africa? Apply to join the register.
            </span>
          </div>
          <button
            onClick={() => triggerToast("Enterprise request logged. Vetting engineers will contact you inside 48 hours.", "info")}
            className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm focus:outline-none shrink-0 cursor-pointer transition-colors"
          >
            Partner Signup
          </button>
        </div>
      </section>

    </div>
  );
}
