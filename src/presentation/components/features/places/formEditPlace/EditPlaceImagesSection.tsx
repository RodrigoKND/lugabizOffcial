import { useRef } from 'react';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';

interface EditPlaceImagesSectionProps {
  image: string | null;
  gallery: string[];
  uploadingImage: boolean;
  uploadingGallery: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onRemoveGalleryItem: (idx: number) => void;
}

const EditPlaceImagesSection: React.FC<EditPlaceImagesSectionProps> = ({
  image, gallery, uploadingImage, uploadingGallery,
  onImageChange, onGalleryAdd, onRemoveImage, onRemoveGalleryItem,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div>
        <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">Imagen Principal</label>
        {image ? (
          <div className="relative rounded-xl overflow-hidden group">
            <img src={image} alt="Principal" className="w-full h-40 object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={onRemoveImage}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white text-stone-700 rounded-full hover:bg-stone-100 transition-all">
                <ImagePlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
            className="w-full h-32 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-2 text-stone-400 hover:border-primary-400 hover:text-primary-500 transition-all disabled:opacity-50">
            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            {uploadingImage ? 'Subiendo...' : 'Agregar imagen principal'}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 uppercase mb-2 block">Galería de Fotos</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {gallery.map((url, idx) => (
            <div key={idx} className="relative rounded-lg overflow-hidden group aspect-square">
              <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onRemoveGalleryItem(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery}
            className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center text-stone-400 hover:border-primary-400 hover:text-primary-500 transition-all disabled:opacity-50">
            {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          </button>
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onGalleryAdd} />
        {gallery.length > 0 && (
          <p className="text-[11px] text-stone-400">{gallery.length} foto(s) en galería</p>
        )}
      </div>
    </>
  );
};

export default EditPlaceImagesSection;
