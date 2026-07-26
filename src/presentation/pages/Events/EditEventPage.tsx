import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, Image, X, Plus } from 'lucide-react';
import { useEditEventForm } from '@presentation/hooks/events/useEditEventForm';
import EventPricingSection from '@presentation/components/features/events/formNewEvent/EventPricingSection';
import { SocialLinksSection } from '@presentation/components/reusables';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { Section } from '@presentation/components/ui/section';

const EditEventPage: React.FC = () => {
  const {
    id, event, loading, saving, form, formInputClass, coverPreview,
    coverRef, galleryUrls, galleryPreviews, galleryFiles, galleryRef, totalNewMB,
    handleCoverChange, clearCover, handleGalleryAdd,
    removeExistingGallery, removeNewGallery, handleSubmit, setForm,
  } = useEditEventForm();

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );

  if (!event) return null;

  return (
    <Section level="page" className="!bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/event/${id}`}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al evento
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar Evento</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">

          {/* Imagen de portada */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Imagen de portada</label>
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            {coverPreview ? (
              <div className="flex items-start gap-3">
                <div className="relative w-32 h-20 rounded-xl overflow-hidden ring-1 ring-stone-200 shrink-0">
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={clearCover}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <button type="button" onClick={() => coverRef.current?.click()}
                  className="text-xs text-amber-600 hover:underline self-center">
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => coverRef.current?.click()}
                icon={<Image className="w-4 h-4" />}>
                Seleccionar imagen de portada
              </Button>
            )}
          </div>

          {/* Galería de imágenes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-500 uppercase">Galería</label>
              {galleryFiles.length > 0 && (
                <Badge variant={totalNewMB > 8 ? 'danger' : 'default'}>
                  {totalNewMB.toFixed(1)} / 10 MB
                </Badge>
              )}
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryAdd} className="hidden" />
            <div className="flex flex-wrap gap-2">
              {galleryUrls.map((url) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden ring-1 ring-stone-200 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingGallery(url)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {galleryPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-amber-400 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewGallery(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-center justify-center w-20 h-20 !border-dashed !p-0"
                icon={<Plus className="w-5 h-5" />}>
                <span className="text-[9px] mt-1">Agregar</span>
              </Button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">Máximo 10 MB en total para imágenes nuevas</p>
          </div>

          <Input label="Nombre" type="text" value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="!bg-stone-50 !text-stone-800 !border-stone-200" />

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-1">Descripción</label>
            <textarea value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className={`${formInputClass} resize-none`} rows={4} />
          </div>

          <Input label="Dirección" type="text" value={form.address}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
            className="!bg-stone-50 !text-stone-800 !border-stone-200" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="date" value={form.dateStart}
              onChange={(e) => setForm(f => ({ ...f, dateStart: e.target.value }))}
              className="!bg-stone-50 !text-stone-800 !border-stone-200" />
            <Input label="Fecha fin (opcional)" type="date" value={form.dateEnd}
              min={form.dateStart || undefined}
              onChange={(e) => setForm(f => ({ ...f, dateEnd: e.target.value }))}
              className="!bg-stone-50 !text-stone-800 !border-stone-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora inicio" type="time" value={form.timeStart}
              onChange={(e) => setForm(f => ({ ...f, timeStart: e.target.value }))}
              className="!bg-stone-50 !text-stone-800 !border-stone-200" />
            <Input label="Hora fin (opcional)" type="time" value={form.timeEnd}
              onChange={(e) => setForm(f => ({ ...f, timeEnd: e.target.value }))}
              className="!bg-stone-50 !text-stone-800 !border-stone-200" />
          </div>

          <Input label="Tags (separados por coma)" type="text" value={form.tags}
            onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
            className="!bg-stone-50 !text-stone-800 !border-stone-200" />

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Precio</label>
            <EventPricingSection
              isFree={form.isFree} price={form.price}
              priceOptions={form.priceOptions} priceNote={form.priceNote}
              coupons={form.coupons}
              onChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Redes sociales (opcional)</label>
            <SocialLinksSection
              value={form.socialLinks}
              onChange={links => setForm(f => ({ ...f, socialLinks: links }))}
            />
          </div>

          <Button type="submit" loading={saving} fullWidth size="xl"
            icon={!saving ? <Send className="w-5 h-5" /> : undefined}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </div>
    </Section>
  );
};

export default EditEventPage;
