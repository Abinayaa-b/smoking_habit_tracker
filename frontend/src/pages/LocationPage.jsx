import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useTranslation } from '../utils/i18n'
import { MapPin, Phone, Clock, Hospital, Stethoscope, ChevronDown } from 'lucide-react'

const DISTRICTS = ['All Districts', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Tiruppur', 'Thoothukudi', 'Dindigul', 'Thanjavur']

const MOCK_LOCATIONS = [
  // Chennai
  { id: 1, name: 'Apollo Hospital - Smoking Cessation Clinic', type: 'Hospital', district: 'Chennai', address: '21 Greams Lane, Chennai', phone: '+91 44 2829 0200', hours: '9 AM - 6 PM' },
  { id: 2, name: 'Dr. Raghav Pulmonology Clinic', type: 'Doctor', district: 'Chennai', address: '15 Anna Salai, Chennai', phone: '+91 98400 12345', hours: '10 AM - 5 PM' },
  { id: 3, name: 'TTK Hospital (Addiction Recovery)', type: 'Rehab Center', district: 'Chennai', address: 'Indira Nagar, Adyar, Chennai', phone: '+91 44 2491 5568', hours: '24/7' },
  
  // Coimbatore
  { id: 4, name: 'KMCH - Dept of Pulmonology', type: 'Hospital', district: 'Coimbatore', address: 'Avinashi Road, Coimbatore', phone: '+91 422 4323800', hours: '8 AM - 8 PM' },
  { id: 5, name: 'PSG Hospitals Tobacco Cessation', type: 'Hospital', district: 'Coimbatore', address: 'Peelamedu, Coimbatore', phone: '+91 422 2570170', hours: '9 AM - 5 PM' },
  { id: 6, name: 'Nava Jeevan Rehab Center', type: 'Rehab Center', district: 'Coimbatore', address: 'Race Course, Coimbatore', phone: '+91 98422 11223', hours: '10 AM - 6 PM' },

  // Madurai
  { id: 7, name: 'Meenakshi Mission Hospital Lung Center', type: 'Hospital', district: 'Madurai', address: 'Lake Area, Mattuthavani, Madurai', phone: '+91 452 426 3000', hours: '24/7' },
  { id: 8, name: 'Dr. Senthil Pulmonology Clinic', type: 'Doctor', district: 'Madurai', address: 'Anna Nagar, Madurai', phone: '+91 94433 22110', hours: '10 AM - 8 PM' },
  { id: 9, name: 'Anba Rehab and De-addiction', type: 'Rehab Center', district: 'Madurai', address: 'K K Nagar, Madurai', phone: '+91 88776 55443', hours: '9 AM - 6 PM' },

  // Trichy (Tiruchirappalli)
  { id: 10, name: 'Cauvery Heart & Lung Centre', type: 'Hospital', district: 'Trichy', address: 'Cantonment, Trichy', phone: '+91 431 241 4000', hours: '8 AM - 8 PM' },
  { id: 11, name: 'Dr. Suresh Kumar Respiratory Care', type: 'Doctor', district: 'Trichy', address: 'Thillai Nagar, Trichy', phone: '+91 99000 88888', hours: '9 AM - 1 PM, 5 PM - 9 PM' },

  // Salem
  { id: 12, name: 'Shanmuga Hospital Pulmonology', type: 'Hospital', district: 'Salem', address: 'Suramangalam, Salem', phone: '+91 427 243 4567', hours: '24/7' },
  { id: 13, name: 'Salem De-Addiction Center', type: 'Rehab Center', district: 'Salem', address: 'Meyyanur, Salem', phone: '+91 98427 12345', hours: '10 AM - 5 PM' },

  // Tirunelveli
  { id: 14, name: 'Galaxy Hospital Respiratory Dept', type: 'Hospital', district: 'Tirunelveli', address: 'Vannarpettai, Tirunelveli', phone: '+91 462 250 1234', hours: '8 AM - 6 PM' },

  // Erode
  { id: 15, name: 'Sudha Hospitals Pulmonology clinic', type: 'Hospital', district: 'Erode', address: 'Perundurai Road, Erode', phone: '+91 424 222 5555', hours: '24/7' },

  // Vellore
  { id: 16, name: 'CMC Vellore - Smoking Cessation', type: 'Hospital', district: 'Vellore', address: 'Ida Scudder Road, Vellore', phone: '+91 416 228 1000', hours: '8 AM - 4 PM' },

  // Tiruppur
  { id: 17, name: 'Tiruppur Lung Care Center', type: 'Doctor', district: 'Tiruppur', address: 'Avinashi Road, Tiruppur', phone: '+91 99444 11223', hours: '10 AM - 6 PM' },

  // Thoothukudi
  { id: 18, name: 'A.V.M Hospital', type: 'Hospital', district: 'Thoothukudi', address: 'Palayamkottai Road, Thoothukudi', phone: '+91 461 232 4455', hours: '24/7' },

  // Dindigul
  { id: 19, name: 'Christian Fellowship Hospital', type: 'Hospital', district: 'Dindigul', address: 'Oddanchatram, Dindigul', phone: '+91 4553 240 226', hours: '9 AM - 5 PM' },

  // Thanjavur
  { id: 20, name: 'Meenakshi Hospital Thanjavur', type: 'Hospital', district: 'Thanjavur', address: 'Trichy Main Road, Thanjavur', phone: '+91 4362 225 555', hours: '24/7' }
]

const TYPES = ['All Types', 'Hospital', 'Doctor', 'Rehab Center']

export default function LocationPage() {
  const [district, setDistrict] = useState('All Districts')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const { t } = useTranslation()

  const filtered = MOCK_LOCATIONS.filter(l =>
    (district === 'All Districts' || l.district === district) &&
    (typeFilter === 'All Types' || l.type === typeFilter)
  )

  const getIcon = (type) => {
    if (type === 'Hospital') return <Hospital size={16} className="text-red-400" />
    if (type === 'Doctor') return <Stethoscope size={16} className="text-blue-400" />
    return <MapPin size={16} className="text-green-400" />
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex">
      <Sidebar active="location" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">📍 {t('Nearby Support')}</h1>
          <p className="text-gray-400 mb-6">{t('Find hospitals, doctors, and rehabilitation centers in your district.')}</p>

          {/* Map Embed */}
          <div className="glass-card overflow-hidden mb-6" style={{ height: 300 }}>
            {/* Using a general map overview for aesthetics */}
            <iframe
              title="location-map"
              width="100%" height="100%" style={{ border: 0, borderRadius: 16, filter: 'invert(0.9) hue-rotate(180deg) brightness(1.2) contrast(0.85)' }}
              loading="lazy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3312061218765!2d77.9406437152019!3d10.871576292257217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baab244b7d19765%3A0x6b048dfd6a0cf01b!2sTamil%20Nadu!5e0!3m2!1sen!2sin!4v1714567890123"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <select
                className="input-field w-full appearance-none pr-10 cursor-pointer text-white"
                value={district} onChange={e => setDistrict(e.target.value)}>
                {DISTRICTS.map(d => <option key={d} value={d} className="bg-gray-900 text-white">{t(d)}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t_str => (
                <button key={t_str}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all whitespace-nowrap
                    ${typeFilter === t_str ? 'bg-accent-red border-accent-red text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-accent-red/40'}`}
                  onClick={() => setTypeFilter(t_str)}>{t(t_str)}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500">No centers found for {district}. Try a different district.</div>
            ) : filtered.map(loc => (
              <div key={loc.id} className="glass-card p-5 hover:border-accent-red/30 transition-all animate-in">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    {getIcon(loc.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{loc.name}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {loc.address}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {loc.phone}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {loc.hours}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:block
                    ${loc.type === 'Hospital' ? 'bg-red-500/20 text-red-400' :
                      loc.type === 'Doctor' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'}`}>{t(loc.type)}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
