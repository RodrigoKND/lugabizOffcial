import React from 'react';
import { CalendarDays, MapPin, DollarSign, Users, Tag, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { FormData } from './EventFormTypes';

interface Props {
  formData: FormData;
  categories: { id: string; name: string }[];
  imageFiles: File[];
}

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm font-medium text-stone-700 mt-0.5">{value}</div>
    </div>
  </div>
);

const ReviewSection: React.FC<Props> = ({ formData, categories, imageFiles }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h3 className="text-base font-bold text-stone-800">Revisa tu evento</h3>
        <p className="text-[11px] text-stone-400">Verifica que todo esté correcto antes de publicar</p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-stone-200/60 divide-y divide-stone-100 px-4">
      <Row
        icon={<Tag className="w-3.5 h-3.5 text-amber-600" />}
        label="Nombre y categoría"
        value={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{formData.name}</span>
            <span className="text-[10px] text-stone-400">·</span>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {categories.find(c => c.id === formData.categoryId)?.name}
            </span>
          </div>
        }
      />
      <Row
        icon={<CalendarDays className="w-3.5 h-3.5 text-amber-600" />}
        label="Fecha y hora"
        value={`${formData.dateStart} · ${formData.timeStart}${formData.timeEnd ? ` - ${formData.timeEnd}` : ''}`}
      />
      <Row
        icon={<MapPin className="w-3.5 h-3.5 text-amber-600" />}
        label="Dirección"
        value={
          <span className="text-stone-500 text-xs">
            {formData.address || <span className="italic text-stone-300">No especificada</span>}
          </span>
        }
      />
      <Row
        icon={<DollarSign className="w-3.5 h-3.5 text-amber-600" />}
        label="Precio"
        value={formData.isFree ? <span className="text-green-600 font-semibold">Gratuito</span> : `Bs. ${formData.price}`}
      />
      <Row
        icon={<Users className="w-3.5 h-3.5 text-amber-600" />}
        label="Capacidad"
        value={formData.capacity ? `${formData.capacity} personas` : <span className="text-stone-300 italic">Sin límite</span>}
      />
      <Row
        icon={<MapPin className="w-3.5 h-3.5 text-amber-600" />}
        label="Coordenadas"
        value={
          formData.coords.length === 2
            ? `${formData.coords[0].toFixed(6)}, ${formData.coords[1].toFixed(6)}`
            : <span className="text-stone-300 italic">No definidas</span>
        }
      />
      <Row
        icon={<ImageIcon className="w-3.5 h-3.5 text-amber-600" />}
        label="Imágenes"
        value={
          imageFiles.length > 0
            ? <span className="font-semibold text-amber-600">{imageFiles.length} imagen(es)</span>
            : <span className="text-stone-300 italic">Sin imágenes</span>
        }
      />
    </div>

    {formData.tags && (
      <div className="flex flex-wrap gap-1.5">
        {formData.tags.split(',').filter(Boolean).map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-medium border border-amber-100/60">
            #{tag.trim()}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default ReviewSection;
