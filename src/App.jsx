import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Car,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Printer,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Settings,
  Pencil,
  AlertTriangle,
  Check,
  X,
  Languages,
  DollarSign,
  Users,
  Gauge,
  Phone
} from 'lucide-react';

const DEFAULT_PIN = '1234';
const STORAGE_KEY = 'viyan_german_oil_pro_v2_refreshed_v1';

const DEFAULT_SHOP = {
  companyName: 'VIYAN GERMAN OIL',
  subtitle: 'Erbil Service Center • Made in Germany',
  address: '100m Street / Baharka Road, Erbil',
  shopPhone: '+964',
  chefPin: DEFAULT_PIN
};

const DEFAULT_CATALOG = [
  {
    id: 'oil-5w30',
    nameDe: 'Fass-Öl 5W-30',
    nameAr: 'زيت برميل 5W-30',
    unit: '4L',
    price: 35,
    stock: 24,
    minStock: 8
  },
  {
    id: 'oil-5w40',
    nameDe: 'Fass-Öl 5W-40',
    nameAr: 'زيت برميل 5W-40',
    unit: '4L',
    price: 32,
    stock: 16,
    minStock: 6
  },
  {
    id: 'filter-oil',
    nameDe: 'Ölfilter',
    nameAr: 'فلتر زيت',
    unit: 'Stk.',
    price: 8,
    stock: 12,
    minStock: 5
  },
  {
    id: 'tire-service',
    nameDe: 'Reifen-Service / Montage',
    nameAr: 'خدمة إطارات / تركيب',
    unit: 'Service',
    price: 20,
    stock: 99,
    minStock: 0
  }
];

const INITIAL_BAYS = {
  'Grube 1': { plate: '', km: '', phone: '+964', selectedIds: ['oil-5w30', 'tire-service'], customItems: [], note: '' },
  'Grube 2': { plate: '', km: '', phone: '+964', selectedIds: [], customItems: [], note: '' },
  'Grube 3': { plate: '', km: '', phone: '+964', selectedIds: [], customItems: [], note: '' }
};

export default function App() {
  const [lang, setLang] = useState('de');
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'customers'
  const [bay, setBay] = useState('Grube 1');
  const [shop, setShop] = useState(DEFAULT_SHOP);
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [bays, setBays] = useState(INITIAL_BAYS);
  const [completedOrders, setCompletedOrders] = useState([]);

  // Stammdaten & PIN im Chef-Cockpit
  const [companyDraft, setCompanyDraft] = useState(DEFAULT_SHOP.companyName);
  const [subtitleDraft, setSubtitleDraft] = useState(DEFAULT_SHOP.subtitle);
  const [addressDraft, setAddressDraft] = useState(DEFAULT_SHOP.address);
  const [shopPhoneDraft, setShopPhoneDraft] = useState(DEFAULT_SHOP.shopPhone);
  const [newPinDraft, setNewPinDraft] = useState('');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Neuer Katalog-Artikel
  const [newNameDe, setNewNameDe] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newUnit, setNewUnit] = useState('4L');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newMinStock, setNewMinStock] = useState('');

  // Bestehenden Katalog-Artikel bearbeiten
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    nameDe: '',
    nameAr: '',
    unit: '',
    price: 0,
    stock: 0,
    minStock: 0
  });

  // Einzelposition direkt an der Grube
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const [chefUnlocked, setChefUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shop) {
          const mergedShop = { ...DEFAULT_SHOP, ...parsed.shop };
          setShop(mergedShop);
          setCompanyDraft(mergedShop.companyName);
          setSubtitleDraft(mergedShop.subtitle);
          setAddressDraft(mergedShop.address);
          setShopPhoneDraft(mergedShop.shopPhone);
        }
        if (Array.isArray(parsed.catalog) && parsed.catalog.length > 0) {
          setCatalog(parsed.catalog);
        }
        if (parsed.bays) setBays({ ...INITIAL_BAYS, ...parsed.bays });
        if (parsed.completedOrders) setCompletedOrders(parsed.completedOrders);
        if (parsed.lang) setLang(parsed.lang);
      }
    } catch {
      // Speicherfehler ignorieren
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ shop, catalog, bays, completedOrders, lang })
      );
    } catch {
      // Speicherfehler ignorieren
    }
  }, [shop, catalog, bays, completedOrders, lang]);

  const currentBay = bays[bay] || INITIAL_BAYS['Grube 1'];

  const updateCurrentBay = (patch) => {
    setBays((prev) => ({
      ...prev,
      [bay]: { ...prev[bay], ...patch }
    }));
  };

  const toggleCatalogItem = (id) => {
    const exists = currentBay.selectedIds.includes(id);
    const nextIds = exists
      ? currentBay.selectedIds.filter((x) => x !== id)
      : [...currentBay.selectedIds, id];
    updateCurrentBay({ selectedIds: nextIds });
  };

  const addCustomItem = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const entry = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      unit: customUnit.trim(),
      price: Math.max(0, Number(customPrice || 0))
    };
    updateCurrentBay({ customItems: [...currentBay.customItems, entry] });
    setCustomName('');
    setCustomUnit('');
    setCustomPrice('');
  };

  const removeCustomItem = (id) => {
    updateCurrentBay({
      customItems: currentBay.customItems.filter((x) => x.id !== id)
    });
  };

  const addCatalogProduct = (e) => {
    e.preventDefault();
    if (!newNameDe.trim()) return;
    const prod = {
      id: `cat-${Date.now()}`,
      nameDe: newNameDe.trim(),
      nameAr: newNameAr.trim() || newNameDe.trim(),
      unit: newUnit.trim() || 'Stk.',
      price: Math.max(0, Number(newPrice || 0)),
      stock: Math.max(0, Number(newStock || 0)),
      minStock: Math.max(0, Number(newMinStock || 0))
    };
    setCatalog((prev) => [...prev, prod]);
    setNewNameDe('');
    setNewNameAr('');
    setNewUnit('4L');
    setNewPrice('');
    setNewStock('');
    setNewMinStock('');
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditDraft({
      nameDe: item.nameDe,
      nameAr: item.nameAr,
      unit: item.unit || '',
      price: item.price,
      stock: item.stock ?? 0,
      minStock: item.minStock ?? 0
    });
  };

  const saveEdit = (id) => {
    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              nameDe: editDraft.nameDe.trim() || item.nameDe,
              nameAr: editDraft.nameAr.trim() || editDraft.nameDe.trim() || item.nameAr,
              unit: editDraft.unit.trim(),
              price: Math.max(0, Number(editDraft.price || 0)),
              stock: Math.max(0, Number(editDraft.stock || 0)),
              minStock: Math.max(0, Number(editDraft.minStock || 0))
            }
          : item
      )
    );
    setEditingId(null);
  };

  const deleteCatalogProduct = (id) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
    setBays((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        updated[key] = {
          ...prev[key],
          selectedIds: prev[key].selectedIds.filter((x) => x !== id)
        };
      });
      return updated;
    });
  };

  const saveShopSettings = (e) => {
    e.preventDefault();
    const cleanedPin = newPinDraft.trim();
    const nextShop = {
      companyName: companyDraft.trim() || DEFAULT_SHOP.companyName,
      subtitle: subtitleDraft.trim() || DEFAULT_SHOP.subtitle,
      address: addressDraft.trim() || DEFAULT_SHOP.address,
      shopPhone: shopPhoneDraft.trim() || DEFAULT_SHOP.shopPhone,
      chefPin: cleanedPin.length >= 4 ? cleanedPin : shop.chefPin
    };
    setShop(nextShop);
    setCompanyDraft(nextShop.companyName);
    setSubtitleDraft(nextShop.subtitle);
    setAddressDraft(nextShop.address);
    setShopPhoneDraft(nextShop.shopPhone);
    setNewPinDraft('');
    setSettingsSavedMsg(
      lang === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Stammdaten & PIN gespeichert'
    );
    setTimeout(() => setSettingsSavedMsg(''), 3000);
  };

  const activeLineItems = [
    ...catalog
      .filter((item) => currentBay.selectedIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: `${lang === 'ar' ? item.nameAr : item.nameDe}${item.unit ? ` (${item.unit})` : ''}`,
        price: Number(item.price || 0)
      })),
    ...currentBay.customItems.map((item) => ({
      id: item.id,
      name: `${item.name}${item.unit ? ` (${item.unit})` : ''}`,
      price: Number(item.price || 0)
    }))
  ];

  const total = activeLineItems.reduce((sum, item) => sum + item.price, 0);

  const buildReminderMessage = (plateValue, kmValue) => {
    const dueDate = new Date(Date.now() + 105 * 24 * 60 * 60 * 1000).toLocaleDateString();
    return lang === 'ar'
      ? `${shop.companyName} (${shop.address}): تذكير الصيانة بعد 3.5 أشهر (105 أيام / ${dueDate}) للمركبة (${plateValue || '-'})، عداد: ${kmValue || '-'} كم.`
      : `${shop.companyName} (${shop.address}): 3,5-Monate Service-Erinnerung (105 Tage / ${dueDate}) für Fahrzeug (${plateValue || '-'}), KM: ${kmValue || '-'}.`;
  };

  const settleBayOrder = () => {
    if (activeLineItems.length === 0 && !currentBay.plate) return;

    setCatalog((prev) =>
      prev.map((item) =>
        currentBay.selectedIds.includes(item.id)
          ? { ...item, stock: Math.max(0, Number(item.stock || 0) - 1) }
          : item
      )
    );

    const record = {
      id: `ord-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dueDate: new Date(Date.now() + 105 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      bay,
      plate: currentBay.plate || '-',
      km: currentBay.km || '-',
      phone: currentBay.phone || '-',
      items: activeLineItems,
      total
    };
    setCompletedOrders((prev) => [record, ...prev]);
    updateCurrentBay({
      plate: '',
      km: '',
      phone: shop.shopPhone || '+964',
      selectedIds: [],
      customItems: [],
      note: ''
    });
    setShowReceipt(false);
  };

  const handleUnlockChef = (e) => {
    e.preventDefault();
    if (pinInput === shop.chefPin) {
      setChefUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError(lang === 'ar' ? 'رمز PIN غير صحيح' : 'Falscher PIN');
    }
  };

  const lowStockItems = catalog.filter(
    (item) => Number(item.minStock || 0) > 0 && Number(item.stock || 0) <= Number(item.minStock || 0)
  );

  const whatsappText = buildReminderMessage(currentBay.plate, currentBay.km);
  const cleanPhone = (currentBay.phone || '').replace(/\D/g, '');
  const dailyRevenue = completedOrders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#060913] text-slate-100 p-4 pb-24"
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
        }
      `}</style>

      {/* Top Header im PRO v2.0 Stil */}
      <header className="no-print max-w-2xl mx-auto space-y-3 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Droplet className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-lg tracking-wide text-white truncate">
                  {shop.companyName}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  PRO v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {shop.subtitle} • {shop.address}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setLang(lang === 'de' ? 'ar' : 'de')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200"
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>{lang === 'de' ? '(AR) العربية' : '(DE) Deutsch'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'pos'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الكاشير (POS)' : 'Kasse (POS)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'العملاء و3.5 أشهر' : 'Kunden & 3,5-Monate'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-5 max-w-2xl mx-auto">
        {lowStockItems.length > 0 && (
          <div className="no-print bg-amber-500/15 border border-amber-500/50 rounded-2xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300">
                {lang === 'ar' ? 'تنبيه الحد الأدنى للمخزون:' : 'Mindestbestand erreicht:'}
              </div>
              <div className="mt-0.5">
                {lowStockItems
                  .map(
                    (i) =>
                      `${lang === 'ar' ? i.nameAr : i.nameDe} (${i.stock} / Min. ${i.minStock})`
                  )
                  .join(' • ')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos' ? (
          <>
            {/* Fahrzeugdaten & Grube */}
            <section className="no-print bg-[#0d1324] border border-slate-800/90 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Car className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'بيانات المركبة والحفرة' : 'Fahrzeugdaten & Grube'}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentBay({
                      plate: '',
                      km: '',
                      phone: shop.shopPhone || '+964',
                      selectedIds: [],
                      customItems: [],
                      note: ''
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تفريغ' : 'Leeren'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {['Grube 1', 'Grube 2', 'Grube 3'].map((b, idx) => {
                  const isSelected = bay === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBay(b)}
                      className={`py-3 px-2 rounded-xl border text-center transition ${
                        isSelected
                          ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-[#080d1a] border-slate-800 text-slate-300 hover:border-slate-700 font-semibold'
                      }`}
                    >
                      <div className="text-xs opacity-80">Grube</div>
                      <div className="text-base leading-tight">{idx + 1}</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">
                  {lang === 'ar' ? 'رقم السيارة (إجباري)' : 'Kennzeichen (Pflicht)'}
                </label>
                <input
                  type="text"
                  placeholder="z.B. 22 A 84920 Erbil"
                  value={currentBay.plate}
                  onChange={(e) => updateCurrentBay({ plate: e.target.value })}
                  className="w-full rounded-xl bg-[#070b16] border border-slate-800 focus:border-amber-500 outline-none px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ar' ? 'عداد الكيلومترات (كم)' : 'Kilometerstand (km)'}</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="z.B. 85000"
                  value={currentBay.km}
                  onChange={(e) => updateCurrentBay({ km: e.target.value })}
                  className="w-full rounded-xl bg-[#070b16] border border-slate-800 focus:border-amber-500 outline-none px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'الهاتف / واتساب (+964)' : 'Telefon / WhatsApp (+964)'}</span>
                </label>
                <input
                  type="tel"
                  placeholder="+964 750 ..."
                  value={currentBay.phone}
                  onChange={(e) => updateCurrentBay({ phone: e.target.value })}
                  className="w-full rounded-xl bg-[#070b16] border border-slate-800 focus:border-amber-500 outline-none px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <input
                type="text"
                placeholder={lang === 'ar' ? 'ملاحظة للورشة' : 'Notiz zur Grube / Service'}
                value={currentBay.note}
                onChange={(e) => updateCurrentBay({ note: e.target.value })}
                className="w-full rounded-xl bg-[#070b16] border border-slate-800 focus:border-amber-500 outline-none px-3.5 py-2 text-sm text-white"
              />
            </section>

            {/* Katalog & Positionen */}
            <section className="no-print bg-[#0d1324] border border-slate-800/90 rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-sm text-amber-400">
                {lang === 'ar' ? 'الكتالوج والخدمات' : 'Katalog & Schnellauswahl'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catalog.map((item) => {
                  const checked = currentBay.selectedIds.includes(item.id);
                  const label = lang === 'ar' ? item.nameAr : item.nameDe;
                  const isLow =
                    Number(item.minStock || 0) > 0 &&
                    Number(item.stock || 0) <= Number(item.minStock || 0);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCatalogItem(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition ${
                        checked
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-[#070b16] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{label}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.unit ? `${item.unit} • ` : ''}
                          {lang === 'ar' ? 'المخزون' : 'Bestand'}:{' '}
                          <span className={isLow ? 'text-amber-400 font-semibold' : ''}>
                            {item.stock ?? 0}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-amber-400 shrink-0">${item.price}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={addCustomItem} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'بند إضافي' : 'Einzelposition'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="sm:col-span-2 rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'الكمية/الوحدة' : 'Menge (z. B. 2L)'}
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="$"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                  />
                  <button
                    type="submit"
                    aria-label="Position hinzufügen"
                    className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <ul className="divide-y divide-slate-800/80">
                {activeLineItems.length === 0 ? (
                  <li className="py-3 text-xs text-slate-400">
                    {lang === 'ar' ? 'لا توجد بنود محددة حالياً.' : 'Noch keine Positionen ausgewählt.'}
                  </li>
                ) : (
                  activeLineItems.map((line) => (
                    <li key={line.id} className="py-2.5 flex items-center justify-between text-sm">
                      <span>{line.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">${line.price.toFixed(2)}</span>
                        {line.id.startsWith('custom-') && (
                          <button
                            type="button"
                            onClick={() => removeCustomItem(line.id)}
                            className="text-slate-400 hover:text-red-400"
                            aria-label="Position entfernen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base font-bold">
                <span>{lang === 'ar' ? 'الإجمالي' : 'Gesamt'}</span>
                <span className="text-amber-400">${total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceipt((v) => !v)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إيصال 80 مم' : '80mm Bon'}</span>
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={settleBayOrder}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إتمام الحفرة' : 'Abschließen'}</span>
                </button>
              </div>
            </section>
          </>
        ) : (
          /* Kunden & 3,5-Monate Tab */
          <section className="no-print bg-[#0d1324] border border-slate-800/90 rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold text-sm text-amber-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{lang === 'ar' ? 'العملاء وتذكير 3.5 أشهر' : 'Kunden & 3,5-Monate-Service'}</span>
            </h2>
            {completedOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">
                {lang === 'ar'
                  ? 'لا توجد زيارات مكتملة بعد. أتمم خدمة في الكاشير ليظهر العميل هنا.'
                  : 'Noch keine abgeschlossenen Aufträge. Nach „Abschließen“ erscheint der Kunde hier für die 3,5-Monate-Erinnerung.'}
              </p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {completedOrders.map((ord) => {
                  const custDigits = (ord.phone || '').replace(/\D/g, '');
                  const msg = buildReminderMessage(ord.plate, ord.km);
                  return (
                    <li key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-sm">
                          {ord.plate} <span className="text-slate-400 font-normal">({ord.bay})</span>
                        </div>
                        <div className="text-slate-400">
                          KM: {ord.km} • Tel: {ord.phone} • Fällig: {ord.dueDate || '105 Tage'}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${custDigits}?text=${encodeURIComponent(msg)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>3,5M</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* 80mm Bon Vorschau */}
        {showReceipt && (
          <section className="bg-white text-slate-950 rounded-2xl p-4 max-w-[320px] mx-auto font-mono text-xs space-y-2 shadow-lg">
            <div className="text-center border-b border-dashed border-slate-400 pb-2">
              <div className="font-bold text-sm">{shop.companyName}</div>
              <div>{shop.subtitle}</div>
              <div>{shop.address}</div>
              {shop.shopPhone && <div>Tel: {shop.shopPhone}</div>}
              <div>{bay} | {currentBay.plate || '-'}</div>
              <div>KM: {currentBay.km || '-'}</div>
            </div>
            <div className="space-y-1">
              {activeLineItems.map((line) => (
                <div key={line.id} className="flex justify-between">
                  <span>{line.name}</span>
                  <span>${line.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-400 pt-2 flex justify-between font-bold text-sm">
              <span>TOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="text-center text-[11px] pt-1">
              3,5-Monate Service-Erinnerung (105 Tage)
            </div>
            <div className="no-print pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-sans font-semibold"
              >
                Drucken
              </button>
              <button
                type="button"
                onClick={() => setShowReceipt(false)}
                className="px-3 py-2 rounded-lg bg-slate-200 text-slate-900 font-sans"
              >
                Schließen
              </button>
            </div>
          </section>
        )}

        {/* Chef-Cockpit: Stammdaten, PIN, Preise, Mengen, Mindestbestand & Löschen */}
        <section className="no-print bg-[#0d1324] border border-slate-800/90 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              {chefUnlocked ? (
                <Unlock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400" />
              )}
              <span>{lang === 'ar' ? 'لوحة الإدارة' : 'Chef-Cockpit'}</span>
            </span>
            {chefUnlocked && (
              <button
                type="button"
                onClick={() => setChefUnlocked(false)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {lang === 'ar' ? 'قفل' : 'Sperren'}
              </button>
            )}
          </div>

          {!chefUnlocked ? (
            <form onSubmit={handleUnlockChef} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="flex-1 rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-semibold"
                >
                  {lang === 'ar' ? 'فتح' : 'Öffnen'}
                </button>
              </div>
              {pinError && <p className="text-xs text-red-400">{pinError}</p>}
            </form>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#070b16] border border-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ar' ? 'مبيعات اليوم' : 'Abgeschlossen'}</span>
                  </div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    ${dailyRevenue.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#070b16] border border-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    {lang === 'ar' ? 'عدد الفواتير' : 'Vorgänge'}
                  </div>
                  <div className="text-lg font-bold mt-1">{completedOrders.length}</div>
                </div>
              </div>

              <form onSubmit={saveShopSettings} className="space-y-2.5 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar'
                      ? 'إعدادات الشركة والرمز السري'
                      : 'Firma, Untertitel, Adresse, Telefon & Chef-PIN ändern'}
                  </span>
                </h3>
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'اسم الشركة' : 'Firmenname'}
                  value={companyDraft}
                  onChange={(e) => setCompanyDraft(e.target.value)}
                  className="w-full rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'الوصف الفرعي' : 'Untertitel (z. B. Erbil Service Center)'}
                  value={subtitleDraft}
                  onChange={(e) => setSubtitleDraft(e.target.value)}
                  className="w-full rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'العنوان' : 'Adresse'}
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  className="w-full rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Telefonnummer (z. B. +964...)'}
                    value={shopPhoneDraft}
                    onChange={(e) => setShopPhoneDraft(e.target.value)}
                    className="w-full rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={lang === 'ar' ? 'رمز PIN جديد (4 أرقام+)' : 'Neuer Chef-PIN (mind. 4 Zeichen)'}
                    value={newPinDraft}
                    onChange={(e) => setNewPinDraft(e.target.value)}
                    className="w-full rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-semibold"
                >
                  {lang === 'ar' ? 'حفظ الإعدادات' : 'Einstellungen speichern'}
                </button>
                {settingsSavedMsg && (
                  <p className="text-xs text-emerald-400">{settingsSavedMsg}</p>
                )}
              </form>

              <div className="space-y-2.5 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-amber-400">
                  {lang === 'ar'
                    ? 'إضافة صنف جديد (الكمية، السعر، الحد الأدنى)'
                    : 'Neuen Artikel anlegen (Menge, Preis, Mindestbestand)'}
                </h3>
                <form onSubmit={addCatalogProduct} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name (Deutsch)"
                      value={newNameDe}
                      onChange={(e) => setNewNameDe(e.target.value)}
                      className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="text"
                      placeholder="الاسم (عربي)"
                      value={newNameAr}
                      onChange={(e) => setNewNameAr(e.target.value)}
                      className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Einheit (z. B. 4L)"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Preis ($)"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Bestand"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Min.-Bestand"
                      value={newMinStock}
                      onChange={(e) => setNewMinStock(e.target.value)}
                      className="rounded-xl bg-[#070b16] border border-slate-800 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-semibold"
                  >
                    {lang === 'ar' ? 'إضافة للكتالوج' : 'Artikel speichern'}
                  </button>
                </form>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-400">
                  {lang === 'ar'
                    ? 'تعديل أو حذف المنتجات والمخزون'
                    : 'Artikel, Mengen, Preise & Mindestbestand bearbeiten / löschen'}
                </h3>
                <ul className="space-y-2">
                  {catalog.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <li
                        key={item.id}
                        className="bg-[#070b16] border border-slate-800 rounded-xl p-3 text-xs space-y-2"
                      >
                        {!isEditing ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-white">
                                {item.nameDe} / {item.nameAr}
                              </div>
                              <div className="text-slate-400">
                                {item.unit ? `${item.unit} • ` : ''}${Number(item.price || 0).toFixed(2)} • Bestand: {item.stock ?? 0} • Min.: {item.minStock ?? 0}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditing(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                                aria-label="Artikel bearbeiten"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCatalogProduct(item.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400"
                                aria-label="Artikel löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                value={editDraft.nameDe}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, nameDe: e.target.value })
                                }
                                placeholder="Name (DE)"
                                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5"
                              />
                              <input
                                type="text"
                                value={editDraft.nameAr}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, nameAr: e.target.value })
                                }
                                placeholder="Name (AR)"
                                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5"
                              />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                              <input
                                type="text"
                                value={editDraft.unit}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, unit: e.target.value })
                                }
                                placeholder="Einheit"
                                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5"
                              />
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={editDraft.price}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, price: e.target.value })
                                }
                                placeholder="Preis"
                                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5"
                              />
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={editDraft.stock}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, stock: e.target.value })
                                }
                                placeholder="Bestand"
                                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5"
                              />
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={editDraft.minStock}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, minStock: e.target.value })
                                }
                                placeholder="Min."
                                className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Abbrechen</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEdit(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-semibold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Übernehmen</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
