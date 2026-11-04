import React from 'react';
import { CalendarDays, MapPin, DollarSign, Users, Tag, Image as ImageIcon, CheckCircle2, Ticket } from 'lucide-react';
import { FormData } from './EventFormTypes';
import Row from './Row';

interface Props {
  formData: FormData;
  categories: { id: string; name: string }[];
  imageFiles: File[];
}

const ReviewSection: React.FC<Props> = ({ formData, categories, imageFiles }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-lg-surface-2 flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5 text-lg-accent" />
      </div>
      <div>
        <h3 className="text-base font-bold text-lg-text">Revisa tu evento</h3>
        <p className="text-[11px] text-lg-dim">Verifica que todo esté correcto antes de publicar</p>
      </div>
    </div>

    <div className="bg-lg-surface rounded-2xl border border-stone-200/60 divide-y divide-lg-surface-2 px-4">
      <Row
        icon={<Tag className="w-3.5 h-3.5 text-lg-accent" />}
        label="Nombre y categoría"
        value={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{formData.name}</span>
            <span className="text-[10px] text-lg-dim">·</span>
            <span className="text-[11px] font-medium text-lg-accent bg-lg-surface-2 px-2 py-0.5 rounded-full">
              {categories.find(c => c.id === formData.categoryId)?.name}
            </span>
          </div>
        }
      />
      <Row
        icon={<CalendarDays className="w-3.5 h-3.5 text-lg-accent" />}
        label="Fecha y hora"
        value={
          formData.scheduleMode === 'custom' && formData.schedules.length > 0
            ? (
              <div className="space-y-1">
                {formData.schedules.map((s, i) => (
                  <div key={i} className="text-xs text-lg-dim">
                    <span className="font-semibold">{s.date}</span>
                    {s.timeStart && <span className="text-lg-dim"> · {s.timeStart}{s.timeEnd ? ` – ${s.timeEnd}` : ''}</span>}
                  </div>
                ))}
              </div>
            )
            : `${formData.dateStart}${formData.dateEnd ? ` → ${formData.dateEnd}` : ''} · ${formData.timeStart}${formData.timeEnd ? ` - ${formData.timeEnd}` : ''}`
        }
      />
      <Row
        icon={<MapPin className="w-3.5 h-3.5 text-lg-accent" />}
        label="Dirección"
        value={
          <span className="text-lg-dim text-xs">
            {formData.address || <span className="italic text-lg-dim">No especificada</span>}
          </span>
        }
      />
      <Row
        icon={<DollarSign className="w-3.5 h-3.5 text-lg-accent" />}
        label="Precio"
        value={
          formData.isFree
            ? <span className="text-green-600 font-semibold">Gratuito</span>
            : formData.priceOptions.length > 0
              ? (
                <div className="space-y-0.5">
                  {formData.priceOptions.map((o, i) => (
                    <div key={i} className="text-xs text-lg-dim">
                      {o.label ? `${o.label} — ` : ''}
                      Bs. {o.price}{o.priceMax ? ` - ${o.priceMax}` : ''}
                    </div>
                  ))}
                </div>
              )
              : `Bs. ${formData.price}`
        }
      />
      {formData.priceNote && (
        <Row
          icon={<DollarSign className="w-3.5 h-3.5 text-lg-accent" />}
          label="Nota"
          value={<span className="text-xs text-lg-dim">{formData.priceNote}</span>}
        />
      )}
      {formData.coupons.length > 0 && (
        <Row
          icon={<Ticket className="w-3.5 h-3.5 text-lg-accent" />}
          label="Cupones"
          value={<span className="text-xs text-lg-dim">{formData.coupons.length} cupón(es), visibles mientras el evento esté en curso</span>}
        />
      )}
      <Row
        icon={<Users className="w-3.5 h-3.5 text-lg-accent" />}
        label="Capacidad"
        value={formData.capacity ? `${formData.capacity} personas` : <span className="text-lg-dim italic">Sin límite</span>}
      />
      <Row
        icon={<MapPin className="w-3.5 h-3.5 text-lg-accent" />}
        label="Coordenadas"
        value={
          formData.coords.length === 2
            ? `${formData.coords[0].toFixed(6)}, ${formData.coords[1].toFixed(6)}`
            : <span className="text-lg-dim italic">No definidas</span>
        }
      />
      <Row
        icon={<ImageIcon className="w-3.5 h-3.5 text-lg-accent" />}
        label="Imágenes"
        value={
          imageFiles.length > 0
            ? <span className="font-semibold text-lg-accent">{imageFiles.length} imagen(es)</span>
            : <span className="text-lg-dim italic">Sin imágenes</span>
        }
      />
    </div>

    {formData.tags && (
      <div className="flex flex-wrap gap-1.5">
        {formData.tags.split(',').filter(Boolean).map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-lg-surface-2 text-lg-accent rounded-full text-[11px] font-medium border border-lg-surface-2">
            #{tag.trim()}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default ReviewSection;
